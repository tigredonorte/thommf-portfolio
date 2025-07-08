variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for hosting the website"
  type        = string
  # Note: S3 bucket names must be globally unique
  # You should override this in terraform.tfvars
}

variable "environment" {
  description = "Deployment environment (prod, dev, staging, etc.)"
  type        = string
  default     = "prod"
}

variable "resource_tag_environment" {
  description = "Environment tag value for resources (must be 'frontend' for IAM policy compliance)"
  type        = string
  default     = "frontend"
  validation {
    condition     = var.resource_tag_environment == "frontend"
    error_message = "resource_tag_environment must be 'frontend' for IAM policy compliance."
  }
}

variable "domain_names" {
  description = "List of domain names for the website (leave empty to use CloudFront domain)"
  type        = list(string)
  default     = []
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate in ACM (required if using custom domain)"
  type        = string
  default     = null
}

variable "hosted_zone_id" {
  description = "Route 53 hosted zone ID (required if using custom domain)"
  type        = string
  default     = null
}

variable "cloudfront_price_class" {
  description = "CloudFront distribution price class"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200",
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "Price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "frontend_deployer_username" {
  description = "Username for the frontend deployer IAM user"
  type        = string
  default     = "frontend-deployer"
}

variable "create_access_keys" {
  description = "Whether to create access keys for the frontend deployer user (not recommended for production - use OIDC instead)"
  type        = bool
  default     = false
}

variable "create_iam_resources" {
  description = "Whether to create IAM policy and user (set to false if they already exist)"
  type        = bool
  default     = true
}
