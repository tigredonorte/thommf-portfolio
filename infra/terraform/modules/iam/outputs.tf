output "github_actions_role_arn" {
  description = "GitHub Actions IAM role ARN"
  value       = var.github_repo != "" ? aws_iam_role.github_actions[0].arn : null
}

output "deployment_user_name" {
  description = "Deployment IAM user name"
  value       = var.create_deployment_user ? aws_iam_user.deployment[0].name : null
}

output "deployment_access_key_id" {
  description = "Deployment user access key ID"
  value       = var.create_deployment_user ? aws_iam_access_key.deployment[0].id : null
  sensitive   = true
}

output "deployment_secret_access_key" {
  description = "Deployment user secret access key"
  value       = var.create_deployment_user ? aws_iam_access_key.deployment[0].secret : null
  sensitive   = true
}