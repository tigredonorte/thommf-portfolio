# IAM Policy for Frontend Deployer
resource "aws_iam_policy" "frontend_deployer_policy" {
  count = var.create_iam_resources ? 1 : 0

  name        = "FrontendDeployerPolicy"
  description = "Minimal permissions for frontend deployment - restricted to Environment=frontend tagged resources"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketManagement"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:DeleteBucket",
          "s3:GetBucketLocation",
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
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
      },
      {
        Sid    = "S3BucketCreation"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:PutBucketTagging"
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
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
      },
      {
        Sid    = "S3TaggingOperations"
        Effect = "Allow"
        Action = [
          "s3:GetBucketTagging",
          "s3:PutBucketTagging"
        ]
        Resource = "arn:aws:s3:::*"
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
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
          "cloudfront:CreateDistribution",
          "cloudfront:DeleteDistribution",
          "cloudfront:GetDistribution",
          "cloudfront:GetDistributionConfig",
          "cloudfront:UpdateDistribution",
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
      },
      {
        Sid    = "CloudFrontDistributionCreation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateDistribution",
          "cloudfront:TagResource"
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
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
      },
      {
        Sid    = "CloudFrontOriginAccessControlCreation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateOriginAccessControl",
          "cloudfront:TagResource"
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
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
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
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "frontend"
          }
        }
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
          "acm:ListTagsForCertificate"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "Frontend Deployer Policy"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# IAM User for Frontend Deployment
resource "aws_iam_user" "frontend_deployer" {
  count = var.create_iam_resources ? 1 : 0

  name = var.frontend_deployer_username
  path = "/"

  tags = {
    Name        = "Frontend Deployer User"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
    Purpose     = "CI/CD deployment for frontend applications"
  }
}

# Attach the policy to the user
resource "aws_iam_user_policy_attachment" "frontend_deployer_policy_attachment" {
  count = var.create_iam_resources ? 1 : 0

  user       = aws_iam_user.frontend_deployer[0].name
  policy_arn = aws_iam_policy.frontend_deployer_policy[0].arn
}

# Optional: Create access keys (not recommended for production - use OIDC instead)
resource "aws_iam_access_key" "frontend_deployer_key" {
  count = var.create_iam_resources && var.create_access_keys ? 1 : 0
  user  = aws_iam_user.frontend_deployer[0].name
}
