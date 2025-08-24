variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
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

variable "enable_kms_encryption" {
  description = "Enable KMS encryption for S3 bucket"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for S3 encryption (if not provided, a new key will be created)"
  type        = string
  default     = ""
}

variable "enable_versioning" {
  description = "Enable versioning on S3 bucket"
  type        = bool
  default     = true
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region replication"
  type        = bool
  default     = false
}


variable "enable_event_notifications" {
  description = "Enable S3 event notifications"
  type        = bool
  default     = true
}

variable "enable_lifecycle_rules" {
  description = "Enable lifecycle rules for S3 bucket"
  type        = bool
  default     = true
}

variable "enable_access_logging" {
  description = "Enable S3 bucket access logging"
  type        = bool
  default     = true
}