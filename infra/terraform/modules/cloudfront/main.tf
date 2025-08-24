terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = ">= 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

# S3 bucket for CloudFront access logs
resource "aws_s3_bucket" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = "${var.project_name}-${var.environment}-cf-logs"

  tags = {
    Name        = "${var.project_name}-${var.environment}-cf-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CloudFront Access Logs"
  }
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_lifecycle_configuration" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    filter {
      prefix = "cloudfront-logs/"
    }

    expiration {
      days = 90
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = "alias/aws/s3" # Use AWS managed key
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_policy" "cloudfront_logs" {
  count  = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudFrontLogDelivery"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action = [
          "s3:PutObject",
          "s3:GetBucketAcl"
        ]
        Resource = [
          aws_s3_bucket.cloudfront_logs[0].arn,
          "${aws_s3_bucket.cloudfront_logs[0].arn}/*"
        ]
      }
    ]
  })
}

resource "aws_s3_bucket_acl" "cloudfront_logs" {
  count      = var.enable_access_logging && var.access_log_bucket == "" ? 1 : 0
  bucket     = aws_s3_bucket.cloudfront_logs[0].id
  depends_on = [aws_s3_bucket_ownership_controls.cloudfront_logs]

  access_control_policy {
    grant {
      grantee {
        id   = data.aws_canonical_user_id.current.id
        type = "CanonicalUser"
      }
      permission = "FULL_CONTROL"
    }

    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/s3/LogDelivery"
      }
      permission = "WRITE"
    }

    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/s3/LogDelivery"
      }
      permission = "READ_ACP"
    }

    owner {
      id = data.aws_canonical_user_id.current.id
    }
  }
}

resource "aws_cloudwatch_log_group" "waf_log_group" {
  provider          = aws.us_east_1
  count             = var.enable_waf ? 1 : 0
  name              = "/aws/wafv2/${var.project_name}-${var.environment}"
  retention_in_days = 30
}

resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  provider = aws.us_east_1
  count    = var.enable_waf ? 1 : 0

  resource_arn            = aws_wafv2_web_acl.cloudfront_waf[0].arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_log_group[0].arn]
}

data "aws_canonical_user_id" "current" {}
resource "aws_wafv2_web_acl" "cloudfront_waf" {
  provider = aws.us_east_1
  count    = var.enable_waf ? 1 : 0
  name     = "${var.project_name}-${var.environment}-cloudfront-waf"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # AWS Managed Rule: Core Rule Set
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rule: Known Bad Inputs
  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"

        # FIX: Ensure Log4j protection is enabled
        # This rule set includes protection against Log4j vulnerability (CVE-2021-44228)
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # FIX: Add explicit AWS Managed Rule for Anonymous IP protection
  rule {
    name     = "AWS-AWSManagedRulesAnonymousIPList"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAnonymousIPList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesAnonymousIPListMetric"
      sampled_requests_enabled   = true
    }
  }

  # FIX: Add AWS Managed Rule for Amazon IP reputation list
  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesAmazonIpReputationListMetric"
      sampled_requests_enabled   = true
    }
  }

  # FIX: Rate limiting rule to prevent abuse
  rule {
    name     = "RateLimitRule"
    priority = 5

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000 # 2000 requests per 5-minute window per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "CloudFrontWAFMetric"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-waf"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Response Headers Policy for security headers
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  provider = aws.us_east_1
  count    = var.create_response_headers_policy ? 1 : 0
  name     = "${var.project_name}-${var.environment}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }
}

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.project_name}-${var.environment}-oac"
  description                       = "Origin Access Control for ${var.project_name} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "failover" {
  count = var.enable_true_origin_failover && var.failover_s3_bucket_id != "" ? 1 : 0

  name                              = "${var.project_name}-${var.environment}-failover-oac"
  description                       = "Failover Origin Access Control for ${var.project_name} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.project_name} ${var.environment} distribution"
  web_acl_id          = var.enable_waf ? aws_wafv2_web_acl.cloudfront_waf[0].arn : null

  aliases = var.certificate_arn != "" ? var.domain_aliases : []

  # Primary origin
  origin {
    domain_name              = var.s3_bucket_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
    origin_id                = "S3-${var.s3_bucket_id}-primary"

    # Add origin shield for better performance and resilience
    origin_shield {
      enabled              = true
      origin_shield_region = "us-east-1" # Choose the closest region to your users
    }
  }

  # Failover origin - use the same S3 bucket as a simple failover
  dynamic "origin" {
    for_each = var.enable_true_origin_failover && var.failover_s3_bucket_id != "" ? [1] : []
    content {
      domain_name              = var.failover_s3_bucket_domain_name
      origin_access_control_id = aws_cloudfront_origin_access_control.failover[0].id
      origin_id                = "S3-${var.failover_s3_bucket_id}-failover"

      origin_shield {
        enabled              = true
        origin_shield_region = "us-west-2" # Different region for true failover
      }
    }
  }

  # Origin Group for failover
  dynamic "origin_group" {
    for_each = var.enable_true_origin_failover && var.failover_s3_bucket_id != "" ? [1] : []
    content {
      origin_id = "S3-origin-group"

      failover_criteria {
        status_codes = [403, 404, 500, 502, 503, 504]
      }

      member {
        origin_id = "S3-${var.s3_bucket_id}-primary"
      }

      member {
        origin_id = "S3-${var.failover_s3_bucket_id}-failover"
      }
    }
  }

  # Access logging
  dynamic "logging_config" {
    for_each = var.enable_access_logging ? [1] : []
    content {
      bucket          = var.access_log_bucket != "" ? var.access_log_bucket : aws_s3_bucket.cloudfront_logs[0].bucket_domain_name
      prefix          = var.access_log_prefix
      include_cookies = false
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.enable_true_origin_failover && var.failover_s3_bucket_id != "" ? "S3-origin-group" : "S3-${var.s3_bucket_id}-primary"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    response_headers_policy_id = var.response_headers_policy_id != "" ? var.response_headers_policy_id : (
      var.create_response_headers_policy ? aws_cloudfront_response_headers_policy.security_headers[0].id : null
    )

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Custom error pages for SPA routing
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

  price_class = "PriceClass_100"

  # Geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = var.enable_geo_restriction ? var.geo_restriction_type : "none"
      locations        = var.enable_geo_restriction ? var.geo_restriction_locations : []
    }
  }

  # Viewer certificate configuration
  dynamic "viewer_certificate" {
    for_each = var.certificate_arn != "" ? [1] : []
    content {
      acm_certificate_arn      = var.certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.certificate_arn == "" ? [1] : []
    content {
      cloudfront_default_certificate = true
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront"
    Environment = var.environment
    Project     = var.project_name
  }
}