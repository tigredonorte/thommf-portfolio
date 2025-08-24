output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "kms_key_arn" {
  description = "ARN of the KMS key used for encryption"
  value       = var.enable_kms_encryption && var.kms_key_id == "" ? aws_kms_key.s3_encryption[0].arn : null
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for S3 notifications"
  value       = var.enable_event_notifications ? aws_sns_topic.s3_notifications[0].arn : null
}

output "access_logs_bucket" {
  description = "S3 bucket for access logs"
  value       = var.enable_access_logging ? aws_s3_bucket.access_logs[0].id : null
}

output "replication_role_arn" {
  description = "ARN of the replication IAM role"
  value       = var.enable_cross_region_replication ? aws_iam_role.replication[0].arn : null
}