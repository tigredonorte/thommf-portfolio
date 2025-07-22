# S3 Outputs
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
  description = "Website URL (HTTP)"
  value       = "http://${aws_s3_bucket_website_configuration.portfolio_website.website_endpoint}"
}

output "deployment_bucket_sync_command" {
  description = "AWS CLI command to sync your build files to S3"
  value       = "aws s3 sync apps/container/dist/ s3://${aws_s3_bucket.portfolio_bucket.bucket}/ --delete"
}

# SSL Certificate Outputs
output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.portfolio_cert.arn
}

output "ssl_certificate_status" {
  description = "Status of the SSL certificate"
  value       = aws_acm_certificate.portfolio_cert.status
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.portfolio_distribution.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.portfolio_distribution.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.portfolio_distribution.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.portfolio_distribution.hosted_zone_id
}

# Route 53 Outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Name servers for the Route 53 hosted zone"
  value       = aws_route53_zone.main.name_servers
}

output "domain_name" {
  description = "Primary domain name"
  value       = var.domain_name
}

# Website URLs
output "https_website_url" {
  description = "HTTPS website URL with custom domain"
  value       = "https://${var.domain_name}"
}

output "www_website_url" {
  description = "HTTPS website URL with www subdomain"
  value       = length(var.subdomain_names) > 0 ? "https://${var.subdomain_names[0]}" : null
}

# CloudFront invalidation command
output "cloudfront_invalidation_command" {
  description = "AWS CLI command to invalidate CloudFront cache"
  value       = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio_distribution.id} --paths '/*'"
}
