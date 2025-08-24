terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# KMS Key for S3 encryption (CKV_AWS_145)
resource "aws_kms_key" "s3_encryption" {
  count                   = var.enable_kms_encryption && var.kms_key_id == "" ? 1 : 0
  description             = "KMS key for S3 bucket encryption - ${var.project_name} ${var.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-key"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_kms_alias" "s3_encryption" {
  count         = var.enable_kms_encryption && var.kms_key_id == "" ? 1 : 0
  name          = "alias/${var.project_name}-${var.environment}-s3-key"
  target_key_id = aws_kms_key.s3_encryption[0].key_id
}

# SNS Topic for S3 event notifications (CKV2_AWS_62)
resource "aws_sns_topic" "s3_notifications" {
  count             = var.enable_event_notifications ? 1 : 0
  name              = "${var.project_name}-${var.environment}-s3-notifications"
  kms_master_key_id = "alias/aws/sns" # Use AWS managed key for SNS

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-notifications"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sns_topic_policy" "s3_notifications" {
  count = var.enable_event_notifications ? 1 : 0
  arn   = aws_sns_topic.s3_notifications[0].arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3Publish"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "sns:Publish"
        Resource = aws_sns_topic.s3_notifications[0].arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

# S3 bucket for access logs (CKV_AWS_18)
resource "aws_s3_bucket" "access_logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = "${var.project_name}-${var.environment}-s3-logs"

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "S3 Access Logs"
  }
}

resource "aws_s3_bucket_public_access_block" "access_logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "access_logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    filter {
      prefix = "s3-access-logs/"
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
}

resource "aws_s3_bucket_server_side_encryption_configuration" "access_logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Main S3 bucket for website
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}-website"

  tags = {
    Name        = "${var.project_name}-${var.environment}-website"
    Environment = var.environment
    Project     = var.project_name
  }
}

# S3 bucket logging (CKV_AWS_18)
resource "aws_s3_bucket_logging" "website" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.website.id

  target_bucket = aws_s3_bucket.access_logs[0].id
  target_prefix = "s3-access-logs/"
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# S3 bucket server-side encryption (CKV_AWS_145)
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = var.enable_kms_encryption ? "aws:kms" : "AES256"
      kms_master_key_id = var.enable_kms_encryption ? (var.kms_key_id != "" ? var.kms_key_id : aws_kms_key.s3_encryption[0].arn) : null
    }
    bucket_key_enabled = var.enable_kms_encryption
  }
}

# S3 bucket lifecycle configuration (CKV2_AWS_61)
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  count      = var.enable_lifecycle_rules ? 1 : 0
  bucket     = aws_s3_bucket.website.id
  depends_on = [aws_s3_bucket_versioning.website]

  rule {
    id     = "transition-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# S3 event notifications (CKV2_AWS_62)
resource "aws_s3_bucket_notification" "website" {
  count  = var.enable_event_notifications ? 1 : 0
  bucket = aws_s3_bucket.website.id

  topic {
    topic_arn = aws_sns_topic.s3_notifications[0].arn
    events    = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
  }

  depends_on = [aws_sns_topic_policy.s3_notifications]
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload a default index.html
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.website.bucket
  key          = "index.html"
  content      = var.default_index_content
  content_type = "text/html"

  lifecycle {
    ignore_changes = [content, etag]
  }
}

# Cross-region replication configuration (CKV_AWS_144)
# Note: This requires a provider configuration for the replica region
# The replica bucket and configuration would be created in a separate module
# or using a provider alias configuration

# IAM role for replication (if enabled)
resource "aws_iam_role" "replication" {
  count = var.enable_cross_region_replication ? 1 : 0
  name  = "${var.project_name}-${var.environment}-s3-replication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-replication-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_iam_role_policy" "replication" {
  count = var.enable_cross_region_replication ? 1 : 0
  name  = "${var.project_name}-${var.environment}-s3-replication-policy"
  role  = aws_iam_role.replication[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.website.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Resource = "arn:aws:s3:::${var.project_name}-${var.environment}-website-replica/*"
      }
    ]
  })
}

# S3 replication configuration (requires replica bucket to be created)
resource "aws_s3_bucket_replication_configuration" "replication" {
  count      = var.enable_cross_region_replication ? 1 : 0
  role       = aws_iam_role.replication[0].arn
  bucket     = aws_s3_bucket.website.id
  depends_on = [aws_s3_bucket_versioning.website]

  rule {
    id     = "replicate-all-objects"
    status = "Enabled"

    filter {
      prefix = ""
    }

    destination {
      bucket        = "arn:aws:s3:::${var.project_name}-${var.environment}-website-replica"
      storage_class = "STANDARD_IA"

      replication_time {
        status = "Enabled"
        time {
          minutes = 15
        }
      }

      metrics {
        status = "Enabled"
        event_threshold {
          minutes = 15
        }
      }
    }

    delete_marker_replication {
      status = "Enabled"
    }
  }
}