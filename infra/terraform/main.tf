locals {
  full_domain = "${var.subdomain}.${var.domain_name}"

  # For prod, we want both root and www; for others, just the subdomain
  domain_aliases = var.environment == "prod" ? [
    var.domain_name,      # thomfilg.com
    local.full_domain     # www.thomfilg.com
  ] : [local.full_domain] # dev.thomfilg.com or staging.thomfilg.com
}

# Create S3 bucket first (without policy)
module "s3_website" {
  source = "./modules/s3-website"

  project_name                    = var.project_name
  environment                     = var.environment
  enable_kms_encryption           = true
  enable_versioning               = true
  enable_cross_region_replication = var.environment == "prod"
  enable_event_notifications      = true
  enable_lifecycle_rules          = true
  enable_access_logging           = true
}

# Get Route53 zone
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Create ACM certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "website" {
  provider                  = aws.us_east_1
  domain_name               = local.full_domain
  validation_method         = "DNS"
  subject_alternative_names = var.environment == "prod" ? [var.domain_name] : []

  lifecycle {
    create_before_destroy = true
  }
}

# Create certificate validation records
resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Certificate validation - wait for DNS records to validate the certificate
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

# Create CloudFront distribution
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name                   = var.project_name
  environment                    = var.environment
  domain_aliases                 = local.domain_aliases
  s3_bucket_id                   = module.s3_website.bucket_id
  s3_bucket_domain_name          = module.s3_website.bucket_regional_domain_name
  certificate_arn                = aws_acm_certificate_validation.website.certificate_arn
  enable_access_logging          = true
  enable_waf                     = var.environment == "prod"
  enable_geo_restriction         = true
  geo_restriction_type           = "whitelist"
  geo_restriction_locations      = ["US", "CA", "GB", "DE", "FR", "AU", "JP"]
  enable_origin_failover         = true
  failover_origin_domain_name    = module.s3_website.bucket_regional_domain_name
  create_response_headers_policy = true

  providers = {
    aws.us_east_1 = aws.us_east_1
  }
}

# Create Route53 records
module "route53" {
  source = "./modules/route53"

  root_domain               = var.domain_name
  zone_id                   = data.aws_route53_zone.main.zone_id
  subdomain_name            = local.full_domain
  cloudfront_domain_name    = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id = module.cloudfront.distribution_hosted_zone_id

  depends_on = [module.cloudfront]
}

resource "aws_route53_record" "root_domain" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

# Update S3 bucket policy with correct CloudFront ARN
resource "aws_s3_bucket_policy" "website_policy" {
  bucket = module.s3_website.bucket_id

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
        Resource = "${module.s3_website.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cloudfront.distribution_arn
          }
        }
      }
    ]
  })

  depends_on = [module.cloudfront]
}

# GitHub OIDC provider (should exist in AWS account for CI/CD)
# Will only query if github_repo is specified
data "aws_iam_openid_connect_provider" "github" {
  count = var.github_repo != "" ? 1 : 0
  url   = "https://token.actions.githubusercontent.com"
}

module "iam" {
  source = "./modules/iam"

  project_name                = var.project_name
  environment                 = var.environment
  github_repo                 = var.github_repo
  github_oidc_provider_arn    = var.github_repo != "" ? data.aws_iam_openid_connect_provider.github[0].arn : ""
  s3_bucket_arn               = module.s3_website.bucket_arn
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  create_deployment_user      = var.create_deployment_user
}