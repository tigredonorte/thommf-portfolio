# Variable to control resource creation
variable "create_shared_resources" {
  description = "Whether to create shared resources (Route53, ACM cert) or use existing ones. Set to true only in prod."
  type        = bool
  default     = false
}

# ============================
# Route53 Zone Management
# ============================

# Try to fetch existing Route53 zone by ID if provided
data "aws_route53_zone" "main_by_id" {
  count   = !var.create_shared_resources && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
}

# Try to fetch existing Route53 zone by name if ID not provided
data "aws_route53_zone" "main_by_name" {
  count        = !var.create_shared_resources && var.hosted_zone_id == "" && var.domain_name != "" ? 1 : 0
  name         = var.domain_name
  private_zone = false
}

# Create Route53 zone if it doesn't exist
resource "aws_route53_zone" "main" {
  count = var.create_shared_resources && var.domain_name != "" ? 1 : 0
  name  = var.domain_name

  tags = {
    Name        = "Portfolio Hosted Zone"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# ============================
# ACM Certificate Management
# ============================

# Try to fetch existing ACM certificate
data "aws_acm_certificate" "portfolio_cert" {
  count       = !var.create_shared_resources && var.create_ssl_certificate && var.domain_name != "" ? 1 : 0
  provider    = aws.us_east_1
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

# Create certificate if it doesn't exist
resource "aws_acm_certificate" "portfolio_cert" {
  count                     = var.create_shared_resources && var.create_ssl_certificate && var.domain_name != "" ? 1 : 0
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

# DNS records for ACM validation (only when creating new certificate AND have a zone)
resource "aws_route53_record" "cert_validation" {
  for_each = var.create_shared_resources && var.create_ssl_certificate && local.route53_zone_id != "" ? {
    for dvo in aws_acm_certificate.portfolio_cert[0].domain_validation_options : dvo.domain_name => dvo
    if dvo.resource_record_name != null
  } : {}

  zone_id = local.route53_zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 60

  lifecycle {
    create_before_destroy = true
  }
}

# Certificate validation (only when creating new certificate AND have validation records)
resource "aws_acm_certificate_validation" "portfolio_cert_validation" {
  count                   = var.create_shared_resources && var.create_ssl_certificate && local.route53_zone_id != "" ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.portfolio_cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "30m"
  }
}

# ============================
# Local values for easy reference
# ============================
locals {
  # Route53 Zone ID - prioritize created zone, then existing zone by ID, then by name
  route53_zone_id = (
    var.create_shared_resources && var.domain_name != "" ? (
      length(aws_route53_zone.main) > 0 ? aws_route53_zone.main[0].zone_id : ""
      ) : (
      var.hosted_zone_id != "" ? (
        length(data.aws_route53_zone.main_by_id) > 0 ? data.aws_route53_zone.main_by_id[0].zone_id : ""
        ) : (
        var.domain_name != "" && length(data.aws_route53_zone.main_by_name) > 0 ? data.aws_route53_zone.main_by_name[0].zone_id : ""
      )
    )
  )

  # ACM Certificate ARN - use created cert if available, otherwise use existing cert
  acm_certificate_arn = (
    var.create_shared_resources && var.create_ssl_certificate && var.domain_name != "" ? (
      length(aws_acm_certificate.portfolio_cert) > 0 ? aws_acm_certificate.portfolio_cert[0].arn : ""
      ) : (
      !var.create_shared_resources && var.create_ssl_certificate && var.domain_name != "" ? (
        length(data.aws_acm_certificate.portfolio_cert) > 0 ? data.aws_acm_certificate.portfolio_cert[0].arn : ""
      ) : ""
    )
  )
}