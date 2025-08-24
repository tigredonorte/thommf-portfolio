variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_aliases" {
  description = "List of domain aliases for the CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "s3_bucket_id" {
  description = "S3 bucket ID"
  type        = string
}

variable "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate to use for CloudFront"
  type        = string
  default     = ""
}

variable "enable_access_logging" {
  description = "Enable CloudFront access logging"
  type        = bool
  default     = true
}

variable "access_log_bucket" {
  description = "S3 bucket for CloudFront access logs (will be created if not provided)"
  type        = string
  default     = ""
}

variable "access_log_prefix" {
  description = "Prefix for CloudFront access log files"
  type        = string
  default     = "cloudfront-logs/"
}

variable "enable_waf" {
  description = "Enable WAF for CloudFront distribution"
  type        = bool
  default     = true
}

variable "enable_geo_restriction" {
  description = "Enable geographic restrictions"
  type        = bool
  default     = true
}

variable "geo_restriction_type" {
  description = "Type of geo restriction (whitelist or blacklist)"
  type        = string
  default     = "whitelist"
  validation {
    condition     = contains(["none", "whitelist", "blacklist"], var.geo_restriction_type)
    error_message = "Geo restriction type must be one of: none, whitelist, blacklist."
  }
}

variable "enable_true_origin_failover" {
  description = "Enable true origin failover with separate failover bucket"
  type        = bool
  default     = false
}

variable "failover_s3_bucket_id" {
  description = "Failover S3 bucket ID"
  type        = string
  default     = ""
}

variable "failover_s3_bucket_domain_name" {
  description = "Failover S3 bucket domain name"
  type        = string
  default     = ""
}

variable "geo_restriction_locations" {
  description = "List of country codes for geo restriction"
  type        = list(string)
  default     = ["US", "CA", "GB", "DE", "FR"] # Default to major markets
}

variable "response_headers_policy_id" {
  description = "ID of the response headers policy to attach"
  type        = string
  default     = ""
}

variable "create_response_headers_policy" {
  description = "Create a default security response headers policy"
  type        = bool
  default     = true
}