variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository for OIDC integration"
  type        = string
  default     = ""
}

variable "github_oidc_provider_arn" {
  description = "GitHub OIDC provider ARN"
  type        = string
  default     = ""
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for deployment access"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN for invalidation access"
  type        = string
}

variable "create_deployment_user" {
  description = "Whether to create IAM user for deployment"
  type        = bool
  default     = false
}