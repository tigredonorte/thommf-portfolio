terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Configuration will be provided via backend config file or command line
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket for hosting the static website
resource "aws_s3_bucket" "portfolio_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = "Portfolio Website - ${var.environment}"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
    Workspace   = terraform.workspace
  }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "portfolio_versioning" {
  bucket = aws_s3_bucket.portfolio_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# S3 bucket public access block (allow public access for website hosting)
resource "aws_s3_bucket_public_access_block" "portfolio_public_access_block" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy for public website access
resource "aws_s3_bucket_policy" "portfolio_bucket_policy" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.portfolio_bucket.arn}/*"
      }
    ]
  })
}


