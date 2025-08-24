output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "distribution_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.website.hosted_zone_id
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.cloudfront_waf[0].arn : null
}

output "response_headers_policy_id" {
  description = "ID of the response headers policy"
  value       = var.create_response_headers_policy ? aws_cloudfront_response_headers_policy.security_headers[0].id : null
}

output "access_logs_bucket" {
  description = "S3 bucket for CloudFront access logs"
  value       = var.enable_access_logging && var.access_log_bucket == "" ? aws_s3_bucket.cloudfront_logs[0].id : var.access_log_bucket
}