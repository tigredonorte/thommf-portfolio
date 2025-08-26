variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain name (e.g., thomfilg.com)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain prefix (e.g., dev, staging)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "thomfilg-portfolio"
}

variable "github_repo" {
  description = "GitHub repository for CI/CD integration"
  type        = string
  default     = "tigredonorte/thommf-portfolio"
}

variable "create_deployment_user" {
  description = "Whether to create IAM user for deployment"
  type        = bool
  default     = false
}