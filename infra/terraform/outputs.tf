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

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.portfolio_distribution.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.portfolio_distribution.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.portfolio_distribution.hosted_zone_id
}

output "website_url" {
  description = "Website URL"
  value       = length(var.domain_names) > 0 ? "https://${var.domain_names[0]}" : "https://${aws_cloudfront_distribution.portfolio_distribution.domain_name}"
}

output "deployment_bucket_sync_command" {
  description = "AWS CLI command to sync your build files to S3"
  value       = "aws s3 sync apps/container/dist/ s3://${aws_s3_bucket.portfolio_bucket.bucket}/ --delete"
}

output "cloudfront_invalidation_command" {
  description = "AWS CLI command to invalidate CloudFront cache"
  value       = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio_distribution.id} --paths '/*'"
}

# IAM Policy and User outputs
output "frontend_deployer_policy_arn" {
  description = "ARN of the frontend deployer IAM policy"
  value       = var.create_iam_resources ? aws_iam_policy.frontend_deployer_policy[0].arn : null
}

output "frontend_deployer_user_name" {
  description = "Name of the frontend deployer IAM user"
  value       = var.create_iam_resources ? aws_iam_user.frontend_deployer[0].name : null
}

output "frontend_deployer_user_arn" {
  description = "ARN of the frontend deployer IAM user"
  value       = var.create_iam_resources ? aws_iam_user.frontend_deployer[0].arn : null
}

output "frontend_deployer_access_key_id" {
  description = "Access key ID for the frontend deployer user (if created)"
  value       = var.create_iam_resources && var.create_access_keys ? aws_iam_access_key.frontend_deployer_key[0].id : null
  sensitive   = true
}

output "frontend_deployer_secret_access_key" {
  description = "Secret access key for the frontend deployer user (if created)"
  value       = var.create_iam_resources && var.create_access_keys ? aws_iam_access_key.frontend_deployer_key[0].secret : null
  sensitive   = true
}
