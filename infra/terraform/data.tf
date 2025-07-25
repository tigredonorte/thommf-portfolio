# Variable to control resource creation
variable "create_shared_resources" {
  description = "Whether to create shared resources (Route53, ACM cert) or use existing ones. Set to true only in prod."
  type        = bool
  default     = false
}

# Try to fetch existing Route53 zone
data "aws_route53_zone" "main" {
  count        = var.create_shared_resources ? 0 : 1
  name         = var.domain_name
  private_zone = false  # We want the public zone
}

# Create Route53 zone if it doesn't exist (only in prod)
resource "aws_route53_zone" "main" {
  count = var.create_shared_resources ? 1 : 0
  name  = var.domain_name

  tags = {
    Name        = "Portfolio Hosted Zone"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# Try to fetch existing ACM certificate
data "aws_acm_certificate" "portfolio_cert" {
  count    = var.create_shared_resources ? 0 : 1
  provider = aws.us_east_1
  arn      = "arn:aws:acm:us-east-1:456808212788:certificate/0572623a-6b2f-41e3-92ec-c45299efe957"
}

# Create certificate if it doesn't exist (only in prod)
resource "aws_acm_certificate" "portfolio_cert" {
  count                     = var.create_shared_resources ? 1 : 0
  provider                  = aws.us_east_1
  domain_name              = var.domain_name
  subject_alternative_names = local.all_subdomains
  validation_method        = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "Portfolio SSL Certificate"
    Environment = var.resource_tag_environment
    Project     = "thommf-portfolio"
  }
}

# DNS records for ACM validation (only when creating new certificate)
resource "aws_route53_record" "cert_validation" {
  for_each = var.create_shared_resources ? {
    for dvo in aws_acm_certificate.portfolio_cert[0].domain_validation_options : dvo.domain_name => dvo
  } : {}

  zone_id = var.create_shared_resources ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 60
}

# Certificate validation (only when creating new certificate)
resource "aws_acm_certificate_validation" "portfolio_cert_validation" {
  count                   = var.create_shared_resources ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.portfolio_cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "30m"
  }
}

# Local values to help reference the correct resource
locals {
  route53_zone_id     = var.create_shared_resources ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.main[0].zone_id
  acm_certificate_arn = var.create_shared_resources ? aws_acm_certificate.portfolio_cert[0].arn : data.aws_acm_certificate.portfolio_cert[0].arn
}
