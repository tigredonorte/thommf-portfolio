# Terraform State Bucket Setup

## Prerequisites

Before running the CI/CD workflows, you need to create a dedicated S3 bucket for Terraform state storage.

## Quick Setup

You can use the provided bucket name: `thommf-terraform-state-456808212788`

### Manual Creation (AWS Console)

1. **Login to AWS Console**
2. **Navigate to S3**
3. **Create Bucket**
   - Name: `thommf-terraform-state-456808212788`
   - Region: `us-east-1` (or your preferred region)
   - Keep all other settings as default
4. **Enable Versioning** (recommended for state safety)
5. **Set Bucket Policy** (optional, for enhanced security)

### CLI Creation

```bash
# Create the state bucket
aws s3 mb s3://thommf-terraform-state-456808212788 --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket thommf-terraform-state-456808212788 \
  --versioning-configuration Status=Enabled

# Enable server-side encryption (optional but recommended)
aws s3api put-bucket-encryption \
  --bucket thommf-terraform-state-456808212788 \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

### Terraform Creation

If you prefer to create it with Terraform first:

```terraform
# Create this in a separate Terraform configuration
resource "aws_s3_bucket" "terraform_state" {
  bucket = "thommf-terraform-state-456808212788"
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## GitHub Secrets Configuration

After creating the bucket, configure these secrets in your GitHub repository:

1. **Go to Repository Settings** → Secrets and variables → Actions
2. **Add Repository Secrets**:
   - `S3_STATE_BUCKET_NAME`: `thommf-terraform-state-456808212788`
   - `S3_BUCKET_NAME`: `your-website-bucket-name` (will be created by Terraform)
   - `AWS_ROLE_ARN`: `arn:aws:iam::456808212788:role/github-actions-role`

## Security Best Practices

### Bucket Policy (Optional)

For enhanced security, you can restrict access to the state bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::thommf-terraform-state-456808212788",
        "arn:aws:s3:::thommf-terraform-state-456808212788/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalArn": "arn:aws:iam::456808212788:role/github-actions-role"
        }
      }
    }
  ]
}
```

### IAM Permissions

Ensure your GitHub Actions role has these permissions for the state bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::thommf-terraform-state-456808212788",
        "arn:aws:s3:::thommf-terraform-state-456808212788/*"
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Bucket doesn't exist**: Verify the bucket name matches exactly
2. **Access denied**: Check IAM permissions and bucket policy
3. **Region mismatch**: Ensure bucket and AWS region are consistent

### Verification

Test the setup with:

```bash
# Check if bucket exists and is accessible
aws s3 ls s3://thommf-terraform-state-456808212788/

# Test Terraform init (from your terraform directory)
terraform init \
  -backend-config="bucket=thommf-terraform-state-456808212788" \
  -backend-config="key=portfolio/terraform.tfstate" \
  -backend-config="region=us-east-1"
```

## Migration from Local State

If you have existing local Terraform state:

```bash
# Initialize with remote backend
terraform init

# Terraform will detect local state and ask if you want to copy it
# Answer 'yes' to migrate your state to S3
```

This setup ensures your Terraform state is safely stored in S3 and can be shared across multiple environments and team members.
