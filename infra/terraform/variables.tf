variable "aws_region" {
  description = "AWS region for resources (S3, CloudFront, etc.)"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for hosting the static website (must be globally unique)"
  type        = string
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

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# IAM & GitHub OIDC
variable "frontend_deployer_username" {
  description = "Username for the frontend deployer role"
  type        = string
  default     = "frontend-deployer"
}

variable "create_iam_resources" {
  description = "Whether to create IAM policy and role (set to false if they already exist)"
  type        = bool
  default     = true
}

variable "use_oidc" {
  description = "Whether to use OIDC for GitHub Actions authentication instead of access keys"
  type        = bool
  default     = true
}

variable "github_repository" {
  description = "GitHub repository in the format 'owner/repo' for OIDC authentication"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$", var.github_repository))
    error_message = "github_repository must be in the format 'owner/repo' (e.g., 'username/my-repo')."
  }
}

# Domain configuration
variable "domain_name" {
  description = "The primary domain name (e.g., thomfilg.com)"
  type        = string
}

variable "subdomain_names" {
  description = "List of subdomains to include in the SSL certificate and CloudFront aliases"
  type        = list(string)
  default     = ["www.thomfilg.com"]

  validation {
    condition = alltrue([
      for domain in var.subdomain_names : can(regex("^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", domain))
    ])
    error_message = "All subdomain names must be valid domain names."
  }
}
