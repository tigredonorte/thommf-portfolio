output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.portfolio_bucket.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.portfolio_bucket.arn
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.portfolio_website.website_endpoint
}

output "website_url" {
  description = "Website URL"
  value       = "http://${aws_s3_bucket_website_configuration.portfolio_website.website_endpoint}"
}

output "deployment_bucket_sync_command" {
  description = "AWS CLI command to sync your build files to S3"
  value       = "aws s3 sync apps/container/dist/ s3://${aws_s3_bucket.portfolio_bucket.bucket}/ --delete"
}

# IAM Policy and Role outputs
output "frontend_deployer_policy_arn" {
  description = "ARN of the frontend deployer IAM policy"
  value       = var.create_iam_resources ? aws_iam_policy.frontend_deployer_policy[0].arn : null
}

# OIDC outputs
output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions OIDC role"
  value       = (var.create_iam_resources && var.use_oidc) ? aws_iam_role.github_actions_role[0].arn : null
}

output "oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC provider"
  value       = var.create_iam_resources ? aws_iam_openid_connect_provider.github_actions[0].arn : null
}
