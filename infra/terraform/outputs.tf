output "website_url" {
  description = "Website URL"
  value       = "https://${local.full_domain}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3_website.bucket_id
}

output "route53_zone_id" {
  description = "Route53 zone ID"
  value       = module.route53.zone_id
}

output "github_actions_role_arn" {
  description = "GitHub Actions IAM role ARN"
  value       = module.iam.github_actions_role_arn
}

output "deployment_access_key_id" {
  description = "Deployment user access key ID (if created)"
  value       = module.iam.deployment_access_key_id
  sensitive   = true
}