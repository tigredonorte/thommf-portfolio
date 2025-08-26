variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN (optional - only used if bucket policy is managed within this module)"
  type        = string
  default     = ""
}

variable "default_index_content" {
  description = "Default content for index.html"
  type        = string
  default     = <<-HTML
    <!DOCTYPE html>
    <html>
    <head>
        <title>Coming Soon</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            h1 { color: #333; }
        </style>
    </head>
    <body>
        <h1>Coming Soon</h1>
        <p>This site is under construction.</p>
    </body>
    </html>
  HTML
}