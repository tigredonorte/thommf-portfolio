# Variable definition
variable "create_shared_resources" {
  description = "Whether to create shared resources (Route53, ACM cert) or use existing ones. Set to true only in prod."
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "The domain name for the portfolio"
  type        = string
}

variable "resource_tag_environment" {
  description = "Environment tag for resources"
  type        = string
  default     = "dev"
}

# Define all subdomains that need to be covered by the certificate
locals {
  all_subdomains = [
    "www.${var.domain_name}",
    "api.${var.domain_name}",
    # Add other subdomains as needed
  ]
}

# --- Route53 Zone ---
# Data source to fetch existing Route53 zone if we are NOT creating new resources
data "aws_route53_zone" "main" {
  count        = var.create_shared_resources ? 0 : 1
  name         = var.domain_name
  private_zone = false
}

# Resource to create a new Route53 zone ONLY if create_shared_resources is true
resource "aws_route53_zone" "main" {
  count = var.create_shared_resources ? 1 : 0
  name  = var.domain_name

  tags = {
    Name        = "Portfolio Hosted Zone"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# --- ACM Certificate ---
# Data source to fetch an existing ACM certificate if we are NOT creating new resources
data "aws_acm_certificate" "portfolio_cert" {
  count    = var.create_shared_resources ? 0 : 1
  provider = aws.us_east_1
  domain   = var.domain_name
  statuses = ["ISSUED"]

  # Use most_recent to get the latest certificate if multiple exist
  most_recent = true
}

# Resource to create a new certificate ONLY if create_shared_resources is true
resource "aws_acm_certificate" "portfolio_cert" {
  count                     = var.create_shared_resources ? 1 : 0
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = local.all_subdomains
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

# --- Local values to reference the correct resource ---
locals {
  route53_zone_id = var.create_shared_resources ? (
    length(aws_route53_zone.main) > 0 ? aws_route53_zone.main[0].zone_id : null
    ) : (
    length(data.aws_route53_zone.main) > 0 ? data.aws_route53_zone.main[0].zone_id : null
  )

  acm_certificate_arn = var.create_shared_resources ? (
    length(aws_acm_certificate.portfolio_cert) > 0 ? aws_acm_certificate.portfolio_cert[0].arn : null
    ) : (
    length(data.aws_acm_certificate.portfolio_cert) > 0 ? data.aws_acm_certificate.portfolio_cert[0].arn : null
  )
}

# --- DNS records for ACM validation (only when creating a new certificate) ---
resource "aws_route53_record" "cert_validation" {
  for_each = var.create_shared_resources && length(aws_acm_certificate.portfolio_cert) > 0 ? {
    for dvo in aws_acm_certificate.portfolio_cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_acm_certificate.portfolio_cert]
}

# --- Certificate validation resource (only when creating a new certificate) ---
resource "aws_acm_certificate_validation" "portfolio_cert_validation" {
  count           = var.create_shared_resources ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = local.acm_certificate_arn

  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "30m"
  }

  depends_on = [
    aws_route53_record.cert_validation,
    aws_acm_certificate.portfolio_cert
  ]
}

# --- Output values for use in other modules ---
output "route53_zone_id" {
  description = "The Route53 zone ID"
  value       = local.route53_zone_id
}

output "acm_certificate_arn" {
  description = "The ACM certificate ARN"
  value       = local.acm_certificate_arn
}

output "domain_name" {
  description = "The domain name"
  value       = var.domain_name
}