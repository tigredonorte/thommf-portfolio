terraform {
  backend "s3" {
    bucket  = "requisition-terraform-state"
    region  = "us-east-1"
    encrypt = true
    # dynamodb_table = "terraform-locks"  # Uncomment when table is created

    # Key will be set via -backend-config or environment variables
    # Format: environments/{environment}/terraform.tfstate
    # For local dev: environments/{environment}-{username}/terraform.tfstate
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