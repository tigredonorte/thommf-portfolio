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

# Note: S3 bucket policy is now handled by CloudFront OAC
# The public bucket policy is replaced by the CloudFront-specific policy below

# Data source to get the existing Route 53 hosted zone
data "aws_route53_zone" "main" {
  count = var.create_route53_records ? 1 : 0

  name         = var.domain_name
  private_zone = false
}

# SSL Certificate in ACM (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "portfolio_cert" {
  count = var.create_ssl_certificate ? 1 : 0

  domain_name               = var.domain_name
  subject_alternative_names = var.subdomain_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "Portfolio SSL Certificate"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# DNS validation records for the SSL certificate
resource "aws_route53_record" "cert_validation" {
  count = var.create_ssl_certificate && var.create_route53_records ? length(aws_acm_certificate.portfolio_cert[0].domain_validation_options) : 0

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = tolist(aws_acm_certificate.portfolio_cert[0].domain_validation_options)[count.index].resource_record_name
  type    = tolist(aws_acm_certificate.portfolio_cert[0].domain_validation_options)[count.index].resource_record_type
  records = [tolist(aws_acm_certificate.portfolio_cert[0].domain_validation_options)[count.index].resource_record_value]
  ttl     = 60
}

# SSL Certificate validation
resource "aws_acm_certificate_validation" "portfolio_cert_validation" {
  count = var.create_ssl_certificate && var.create_route53_records ? 1 : 0

  certificate_arn         = aws_acm_certificate.portfolio_cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "5m"
  }
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "portfolio_oac" {
  count = var.create_cloudfront_distribution ? 1 : 0

  name                              = "portfolio-oac"
  description                       = "OAC for Portfolio S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
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

  # Add custom domain names (CNAMEs)
  aliases = var.create_ssl_certificate ? concat([var.domain_name], var.subdomain_names) : []

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

  # Custom error pages
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

  price_class = "PriceClass_100" # Use only North America and Europe edge locations

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate configuration
  viewer_certificate {
    acm_certificate_arn            = var.create_ssl_certificate ? aws_acm_certificate.portfolio_cert[0].arn : null
    ssl_support_method             = var.create_ssl_certificate ? "sni-only" : null
    minimum_protocol_version       = var.create_ssl_certificate ? "TLSv1.2_2021" : null
    cloudfront_default_certificate = var.create_ssl_certificate ? false : true
  }

  tags = {
    Name        = "Portfolio CloudFront Distribution"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# Update S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "portfolio_bucket_policy_cloudfront" {
  count = var.create_cloudfront_distribution ? 1 : 0

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
}

# Route 53 A record for apex domain
resource "aws_route53_record" "portfolio_apex" {
  count = var.create_route53_records && var.create_cloudfront_distribution ? 1 : 0

  zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : data.aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 A records for subdomains
resource "aws_route53_record" "portfolio_subdomains" {
  count = var.create_route53_records && var.create_cloudfront_distribution ? length(var.subdomain_names) : 0

  zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : data.aws_route53_zone.main[0].zone_id
  name    = var.subdomain_names[count.index]
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.portfolio_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}


