terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Configured via backend config file or CLI
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ----------------------------
# Local values for subdomains
# ----------------------------
locals {
  # Conditionally create the environment-specific subdomain.
  # If environment is 'prod', this list is empty. Otherwise, it creates e.g., 'dev.thomfilg.com'.
  env_specific_subdomain = var.environment == "prod" ? [] : [format("%s.%s", var.environment, var.domain_name)]

  # Combine the default subdomains (like 'www') with the environment-specific one (if any).
  all_subdomains = concat(var.subdomain_names, local.env_specific_subdomain)
  
  # Determine if we should use CloudFront with custom domain
  use_custom_domain = var.create_cloudfront_distribution && var.create_ssl_certificate && var.domain_name != ""
}

# ============================
# S3 Bucket for static website
# ============================
resource "aws_s3_bucket" "portfolio_bucket" {
  bucket = "${var.bucket_name}-${var.environment}"

  tags = {
    Name        = "Portfolio Website - ${var.environment}"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
    Workspace   = terraform.workspace
  }
}

resource "aws_s3_bucket_versioning" "portfolio_versioning" {
  bucket = aws_s3_bucket.portfolio_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_website_configuration" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "portfolio_public_access_block" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  # When using CloudFront, block public access
  # When not using CloudFront, allow public access for direct S3 website hosting
  block_public_acls       = var.create_cloudfront_distribution
  block_public_policy     = var.create_cloudfront_distribution ? true : false
  ignore_public_acls      = var.create_cloudfront_distribution
  restrict_public_buckets = var.create_cloudfront_distribution ? true : false
}

# ============================
# CloudFront Origin Access Control
# ============================
resource "aws_cloudfront_origin_access_control" "portfolio_oac" {
  count                             = var.create_cloudfront_distribution ? 1 : 0
  name                              = "portfolio-oac-${var.environment}"
  description                       = "OAC for Portfolio S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ============================
# CloudFront Distribution (WITH CONDITIONAL CERTIFICATE)
# ============================
resource "aws_cloudfront_distribution" "portfolio_distribution" {
  count = var.create_cloudfront_distribution ? 1 : 0

  origin {
    domain_name              = aws_s3_bucket.portfolio_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.portfolio_oac[0].id
    origin_id                = "S3-${aws_s3_bucket.portfolio_bucket.bucket}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Only set aliases if we have a valid certificate
  aliases = local.use_custom_domain ? concat([var.domain_name], local.all_subdomains) : []

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.portfolio_bucket.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Dynamic viewer certificate configuration
  dynamic "viewer_certificate" {
    for_each = local.use_custom_domain ? [1] : []
    content {
      acm_certificate_arn      = local.acm_certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  # Use CloudFront default certificate if no custom domain
  dynamic "viewer_certificate" {
    for_each = local.use_custom_domain ? [] : [1]
    content {
      cloudfront_default_certificate = true
    }
  }

  tags = {
    Name        = "Portfolio CloudFront Distribution - ${var.environment}"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }

  depends_on = [
    aws_acm_certificate_validation.portfolio_cert_validation
  ]
}

# ============================
# S3 Bucket Policy (Conditional)
# ============================

# Policy for CloudFront OAC access
resource "aws_s3_bucket_policy" "portfolio_bucket_policy_cloudfront" {
  count  = var.create_cloudfront_distribution ? 1 : 0
  bucket = aws_s3_bucket.portfolio_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.portfolio_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.portfolio_distribution[0].arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.portfolio_public_access_block
  ]
}

# Policy for direct S3 website access (when not using CloudFront)
resource "aws_s3_bucket_policy" "portfolio_bucket_policy_public" {
  count  = var.create_cloudfront_distribution ? 0 : 1
  bucket = aws_s3_bucket.portfolio_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.portfolio_bucket.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.portfolio_public_access_block
  ]
}

# ============================
# DNS Records (Root + Subdomains)
# ============================
resource "aws_route53_record" "portfolio_apex" {
  count   = var.create_route53_records && var.create_cloudfront_distribution ? 1 : 0
  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "portfolio_subdomains" {
  for_each = var.create_route53_records && var.create_cloudfront_distribution ? toset(local.all_subdomains) : toset([])

  zone_id = local.route53_zone_id
  name    = each.key
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}