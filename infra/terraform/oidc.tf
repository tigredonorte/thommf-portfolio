# OIDC Provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github_actions" {
  count = var.create_iam_resources ? 1 : 0

  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = {
    Name        = "GitHub Actions OIDC Provider"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# IAM Role for GitHub Actions OIDC
resource "aws_iam_role" "github_actions_role" {
  count = var.create_iam_resources ? 1 : 0

  name = "GitHubActions-${var.frontend_deployer_username}-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions[0].arn
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
    Name        = "GitHub Actions OIDC Role"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
    Purpose     = "OIDC role for GitHub Actions deployment"
  }
}

# Attach the frontend deployer policy to the OIDC role
resource "aws_iam_role_policy_attachment" "github_actions_role_policy" {
  count = var.create_iam_resources ? 1 : 0

  role       = aws_iam_role.github_actions_role[0].name
  policy_arn = aws_iam_policy.frontend_deployer_policy[0].arn
}
