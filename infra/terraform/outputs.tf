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
  value       = local.acm_certificate_arn
}

output "ssl_certificate_status" {
  description = "Status of the SSL certificate"
  value       = var.create_shared_resources ? aws_acm_certificate.portfolio_cert[0].status : data.aws_acm_certificate.portfolio_cert[0].status
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.create_cloudfront_distribution ? aws_cloudfront_distribution.portfolio_distribution[0].id : null
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = var.create_cloudfront_distribution ? aws_cloudfront_distribution.portfolio_distribution[0].arn : null
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.create_cloudfront_distribution ? aws_cloudfront_distribution.portfolio_distribution[0].domain_name : null
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = var.create_cloudfront_distribution ? aws_cloudfront_distribution.portfolio_distribution[0].hosted_zone_id : null
}

# Route 53 Outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = local.route53_zone_id
}

output "route53_name_servers" {
  description = "Name servers for the Route 53 hosted zone"
  value = var.create_shared_resources ? aws_route53_zone.main[0].name_servers : (
    var.create_route53_records ? (
      var.hosted_zone_id != "" ? data.aws_route53_zone.main_by_id[0].name_servers : data.aws_route53_zone.main_by_name[0].name_servers
    ) : []
  )
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
  value       = var.create_cloudfront_distribution ? "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio_distribution[0].id} --paths '/*'" : null
}
