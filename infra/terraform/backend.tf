terraform {
  backend "s3" {
    # Backend configuration is provided via backend.tfvars files
    # See environments/{environment}/backend.tfvars for configuration
  }

  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "thomfilg-portfolio"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "thomfilg-portfolio"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}