# IAM role for GitHub Actions OIDC
resource "aws_iam_role" "github_actions" {
  count = var.github_repo != "" ? 1 : 0

  name = "${var.project_name}-${var.environment}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.github_oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

# Policy for S3 deployment access
resource "aws_iam_policy" "s3_deployment" {
  count = var.github_repo != "" ? 1 : 0

  name        = "${var.project_name}-${var.environment}-s3-deployment"
  description = "Policy for S3 deployment access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = var.cloudfront_distribution_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_s3" {
  count = var.github_repo != "" ? 1 : 0

  role       = aws_iam_role.github_actions[0].name
  policy_arn = aws_iam_policy.s3_deployment[0].arn
}

# Optional IAM user for deployment (alternative to OIDC)
resource "aws_iam_user" "deployment" {
  count = var.create_deployment_user ? 1 : 0

  name = "${var.project_name}-${var.environment}-deployment"
  path = "/"
}

resource "aws_iam_access_key" "deployment" {
  count = var.create_deployment_user ? 1 : 0

  user = aws_iam_user.deployment[0].name
}

resource "aws_iam_user_policy_attachment" "deployment_s3" {
  count = var.create_deployment_user ? 1 : 0

  user       = aws_iam_user.deployment[0].name
  policy_arn = aws_iam_policy.s3_deployment[0].arn
}