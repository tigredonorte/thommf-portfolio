terraform {
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
}

# S3 bucket for hosting the static website
resource "aws_s3_bucket" "portfolio_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = "Portfolio Website"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
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

# S3 bucket public access block (we'll control access via CloudFront)
resource "aws_s3_bucket_public_access_block" "portfolio_public_access_block" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "portfolio_oac" {
  name                              = "frontend_portfolio-oac"
  description                       = "Origin Access Control for Portfolio S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "portfolio_distribution" {
  origin {
    domain_name              = aws_s3_bucket.portfolio_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.portfolio_oac.id
    origin_id                = "S3-${aws_s3_bucket.portfolio_bucket.bucket}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "frontend_portfolio website distribution"
  default_root_object = "index.html"

  aliases = var.domain_names

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

    compress = true
  }

  # Cache behaviors for static assets (CSS, JS, images, fonts)
  dynamic "ordered_cache_behavior" {
    for_each = var.static_asset_cache_patterns
    content {
      path_pattern     = ordered_cache_behavior.value
      allowed_methods  = ["GET", "HEAD"]
      cached_methods   = ["GET", "HEAD"]
      target_origin_id = "S3-${aws_s3_bucket.portfolio_bucket.bucket}"

      forwarded_values {
        query_string = false
        cookies {
          forward = "none"
        }
      }

      min_ttl                = 0
      default_ttl            = 31536000 # 1 year
      max_ttl                = 31536000 # 1 year
      compress               = true
      viewer_protocol_policy = "redirect-to-https"
    }
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  price_class = var.cloudfront_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = length(var.domain_names) == 0
    acm_certificate_arn            = length(var.domain_names) > 0 && var.ssl_certificate_arn != "" ? var.ssl_certificate_arn : null
    ssl_support_method             = length(var.domain_names) > 0 && var.ssl_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = length(var.domain_names) > 0 && var.ssl_certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  tags = {
    Name        = "Portfolio CloudFront Distribution"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "portfolio_bucket_policy" {
  bucket = aws_s3_bucket.portfolio_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
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
            "AWS:SourceArn" = aws_cloudfront_distribution.portfolio_distribution.arn
          }
        }
      }
    ]
  })
}

# Route 53 DNS records (optional - only if using custom domain)
resource "aws_route53_record" "portfolio_record" {
  count   = length(var.domain_names) > 0 && var.hosted_zone_id != "" ? length(var.domain_names) : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_names[count.index]
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 AAAA record for IPv6 (optional)
resource "aws_route53_record" "portfolio_record_ipv6" {
  count   = length(var.domain_names) > 0 && var.hosted_zone_id != "" ? length(var.domain_names) : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_names[count.index]
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
