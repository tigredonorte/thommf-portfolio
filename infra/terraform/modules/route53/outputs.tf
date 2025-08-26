output "zone_id" {
  description = "Route53 zone ID"
  value       = var.zone_id
}

output "zone_name" {
  description = "Route53 zone name"
  value       = var.root_domain
}

output "subdomain_fqdn" {
  description = "Fully qualified domain name of the subdomain"
  value       = aws_route53_record.subdomain.fqdn
}