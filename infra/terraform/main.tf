locals {
  full_domain = "${var.subdomain}.${var.domain_name}"
}

# Create S3 bucket first (without policy)
module "s3_website" {
  source = "./modules/s3-website"

  project_name = var.project_name
  environment  = var.environment
  # CloudFront ARN not needed here - bucket policy is managed separately below
}

# Get Route53 zone
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Create ACM certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "website" {
  provider          = aws.us_east_1
  domain_name       = local.full_domain
  validation_method = "DNS"

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

  project_name          = var.project_name
  environment           = var.environment
  domain_name           = local.full_domain
  s3_bucket_id          = module.s3_website.bucket_id
  s3_bucket_domain_name = module.s3_website.bucket_regional_domain_name
  certificate_arn       = aws_acm_certificate_validation.website.certificate_arn

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
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2" # CloudFront's hosted zone ID

  depends_on = [module.cloudfront]
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