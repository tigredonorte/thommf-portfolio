resource "aws_iam_policy" "frontend_deployer_policy" {
  name        = "${var.resource_tag_environment}-${var.environment}-DeployerPolicy"
  description = "Minimal permissions for frontend deployment - restricted to Environment=${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketManagement"
        Effect = "Allow"
        Action = [
          "s3:DeleteBucket",
          "s3:GetBucketPolicy",
          "s3:GetBucketVersioning",
          "s3:GetBucketWebsite",
          "s3:ListBucket",
          "s3:PutBucketPolicy",
          "s3:PutBucketVersioning",
          "s3:PutBucketWebsite",
          "s3:PutBucketPublicAccessBlock"
        ]
        Resource = "arn:aws:s3:::*"
      },
      {
        Sid    = "S3BucketCreation"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:PutBucketTagging",
          "s3:GetBucketTagging"
        ]
        Resource = "arn:aws:s3:::*"
      },
      {
        Sid    = "S3ObjectManagement"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = "arn:aws:s3:::*/*"
      },
      {
        Sid    = "S3ListBucketsForConsole"
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketLocation"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudFrontDistributionManagement"
        Effect = "Allow"
        Action = [
          "cloudfront:DeleteDistribution",
          "cloudfront:GetDistribution",
          "cloudfront:GetDistributionConfig",
          "cloudfront:UpdateDistribution",
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudFrontDistributionCreation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateDistribution"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudFrontOriginAccessControl"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateOriginAccessControl",
          "cloudfront:GetOriginAccessControl",
          "cloudfront:UpdateOriginAccessControl",
          "cloudfront:DeleteOriginAccessControl"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudFrontTaggingOperations"
        Effect = "Allow"
        Action = [
          "cloudfront:ListTagsForResource",
          "cloudfront:TagResource",
          "cloudfront:UntagResource"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudFrontListOperations"
        Effect = "Allow"
        Action = [
          "cloudfront:ListDistributions",
          "cloudfront:ListOriginAccessControls"
        ]
        Resource = "*"
      },
      {
        Sid    = "Route53ForCustomDomain"
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets",
          "route53:GetChange"
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/*",
          "arn:aws:route53:::change/*"
        ]
      },
      {
        Sid    = "Route53ReadOperations"
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
          "route53:ListTagsForResource"
        ]
        Resource = "*"
      },
      {
        Sid    = "ACMForSSLCertificates"
        Effect = "Allow"
        Action = [
          "acm:ListCertificates",
          "acm:DescribeCertificate",
          "acm:ListTagsForCertificate",
          "acm:RequestCertificate",
          "acm:DeleteCertificate",
          "acm:AddTagsToCertificate",
          "acm:RemoveTagsFromCertificate"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.resource_tag_environment}-${var.environment}-DeployerPolicy"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# GitHub Actions OIDC Provider
data "aws_iam_openid_connect_provider" "github_actions" {
  count = var.create_iam_resources && var.use_oidc ? 1 : 0
  url   = "https://token.actions.githubusercontent.com"
}

# GitHub Actions Role
resource "aws_iam_role" "github_actions_role" {
  count = var.create_iam_resources && var.use_oidc ? 1 : 0

  name = "${var.resource_tag_environment}-${var.environment}-GitHubActionsRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github_actions[0].arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.resource_tag_environment}-${var.environment}-GitHubActionsRole"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# Attach the frontend deployer policy to GitHub Actions role
resource "aws_iam_role_policy_attachment" "github_actions_role_policy" {
  count = var.create_iam_resources && var.use_oidc ? 1 : 0

  role       = aws_iam_role.github_actions_role[0].name
  policy_arn = aws_iam_policy.frontend_deployer_policy.arn
}
