# AWS Deployment for thommf-portfolio

This directory contains Terraform configuration to deploy your portfolio website to AWS using S3 for static hosting and CloudFront for global CDN distribution.

## Architecture

- **S3 Bucket**: Hosts your static website files
- **CloudFront Distribution**: Provides global CDN with caching and HTTPS
- **IAM Policy & User**: Restricted deployment user with tag-based access control
- **Route 53** (Optional): DNS management for custom domains
- **ACM Certificate** (Optional): SSL/TLS certificate for custom domains

## Security

This Terraform configuration enforces secure deployment practices:

### 🔒 **Tag-Based Access Control**
All resources **must** be tagged with `Environment=frontend` to work with the restricted IAM policy:
- S3 buckets: Tagged with `Environment=frontend`
- CloudFront distributions: Tagged with `Environment=frontend`
- No naming restrictions required

### 🛡️ **IAM Policy Enforcement**
The deployer user has minimal permissions and can only:
- ✅ Manage AWS resources tagged with `Environment=frontend`
- ✅ Read Route 53 and ACM resources
- ❌ Access any resources without the proper tag
- ❌ Access any other AWS services

### 📋 **Security Checklist**
Before deploying, ensure:
- [ ] `environment` is set to your deployment environment ("prod", "dev", etc.) in terraform.tfvars
- [ ] `resource_tag_environment` is set to "frontend" in terraform.tfvars
- [ ] All resources will be tagged with `Environment=frontend`
- [ ] IAM user follows least-privilege principles

For complete security setup, see [GitHub DEPLOYMENT.md](../../.github/DEPLOYMENT.md).

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** installed and configured with appropriate permissions
2. **Terraform** (>= 1.0) installed
3. **Node.js** and **pnpm** (or npm) installed
4. AWS account with the following permissions:
   - S3 (CreateBucket, PutObject, etc.)
   - CloudFront (CreateDistribution, etc.)
   - Route 53 (if using custom domain)
   - ACM (if using custom domain)

## Quick Start

### 1. Configure AWS CLI

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, and preferred region.

### 2. Configure Terraform Variables

Copy the example variables file and customize it:

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

Edit `infra/terraform/terraform.tfvars` and update:

```hcl
# REQUIRED: Change this to a globally unique bucket name
bucket_name = "your-unique-bucket-name-12345"

# REQUIRED: Must be 'frontend' for IAM policy compliance
resource_tag_environment = "frontend"

# Deployment environment
environment = "prod"

# IAM Configuration
frontend_deployer_username = "frontend-deployer"
create_access_keys = false  # Set to true only for testing

# OPTIONAL: Configure custom domain
# domain_names = ["yourdomain.com"]
# ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
# hosted_zone_id = "Z123456789012345678901"
```

### 3. Deploy Infrastructure

Run the deployment script:

```bash
pnpm run deploy
# or
./infra/deploy.sh
```

This will:
1. Install dependencies
2. Build the project (with module federation micro-frontends)
3. Deploy AWS infrastructure
4. Upload files to S3
5. Invalidate CloudFront cache

## Manual Deployment Steps

If you prefer to run each step manually:

### 1. Build the Project

```bash
pnpm install
pnpm run build
```

### 2. Deploy Infrastructure

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### 3. Upload Files

```bash
# Get bucket name from Terraform output
BUCKET_NAME=$(terraform output -raw s3_bucket_name)

# Upload files
aws s3 sync ../apps/container/dist/ s3://$BUCKET_NAME/ --delete

# Invalidate CloudFront cache
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

## Configuration Options

### Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `aws_region` | AWS region for resources | `us-east-1` | No |
| `bucket_name` | S3 bucket name (must be globally unique) | - | Yes |
| `environment` | Deployment environment (prod, dev, staging) | `prod` | No |
| `resource_tag_environment` | Environment tag for resources (must be 'frontend') | `frontend` | No |
| `domain_names` | Custom domain names | `[]` | No |
| `ssl_certificate_arn` | ACM certificate ARN | `null` | No* |
| `hosted_zone_id` | Route 53 hosted zone ID | `null` | No* |
| `cloudfront_price_class` | CloudFront price class | `PriceClass_100` | No |
| `static_asset_cache_patterns` | File patterns for long-term caching | `["*.css", "*.js", "*.png", ...]` | No |
| `github_repository` | GitHub repository for OIDC (format: owner/repo) | - | Yes |
| `frontend_deployer_username` | Username for the deployer role | `frontend-deployer` | No |

*Required if using custom domain

### CloudFront Price Classes

- `PriceClass_All`: All edge locations (highest cost, best performance)
- `PriceClass_200`: North America, Europe, Asia, Middle East, and Africa
- `PriceClass_100`: North America and Europe only (lowest cost)

### Authentication

This Terraform configuration uses **OIDC (OpenID Connect)** for secure GitHub Actions authentication:

- ✅ **Secure**: No long-lived AWS access keys
- ✅ **Modern**: Uses temporary, automatically-expiring credentials
- ✅ **Auditable**: AWS CloudTrail shows GitHub context
- ✅ **Repository-scoped**: Only your specific GitHub repository can assume the role

**📋 [OIDC Setup Guide →](../../docs/OIDC_SETUP.md)**

## Custom Domain Setup

To use a custom domain:

1. **Get an SSL Certificate** from AWS Certificate Manager (ACM):
   - Go to ACM in the AWS Console
   - Request a public certificate for your domain
   - Validate domain ownership
   - Note the certificate ARN

2. **Set up Route 53** (if not already done):
   - Create a hosted zone for your domain
   - Note the hosted zone ID

3. **Update terraform.tfvars**:
   ```hcl
   domain_names = ["yourdomain.com", "www.yourdomain.com"]
   ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
   hosted_zone_id = "Z123456789012345678901"
   ```

4. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## Updating Your Website

To update your website content:

1. **Build the project**:
   ```bash
   pnpm run build
   ```

2. **Upload files**:
   ```bash
   ./infra/deploy.sh upload-only
   ```

Or manually:
```bash
aws s3 sync apps/container/dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Useful Commands

### View Terraform Outputs

```bash
cd infra/terraform
terraform output
```

### Check Website Status

```bash
# Check if website is accessible
curl -I https://your-cloudfront-domain.cloudfront.net

# Check custom domain (if configured)
curl -I https://yourdomain.com
```

### Clean Up Resources

To destroy all AWS resources:

```bash
cd infra/terraform
terraform destroy
```

**Warning**: This will permanently delete your S3 bucket and all files!

## Troubleshooting

### Common Issues

1. **Bucket name already exists**:
   - S3 bucket names must be globally unique
   - Change `bucket_name` in `terraform.tfvars`

2. **Access denied errors**:
   - Check AWS CLI configuration
   - Ensure your AWS user has necessary permissions

3. **Website not loading**:
   - CloudFront deployment takes 10-15 minutes
   - Check CloudFront distribution status in AWS Console

4. **Custom domain not working**:
   - Verify SSL certificate is issued and validated
   - Check Route 53 DNS propagation
   - Ensure certificate is in `us-east-1` region

### Logs and Monitoring

- **CloudFront Access Logs**: Can be enabled in the distribution settings
- **S3 Access Logs**: Can be enabled in bucket settings
- **AWS CloudTrail**: For API call auditing

## Cost Estimation

Typical monthly costs for a portfolio website:

- **S3 Storage**: $0.023/GB (first 50TB)
- **S3 Requests**: $0.0004/1000 GET requests
- **CloudFront**: $0.085/GB for first 10TB
- **Route 53**: $0.50/hosted zone + $0.40/1M queries

For a typical portfolio site: **~$1-5/month**

## Terraform Configuration Features

### Dynamic Cache Behaviors
The CloudFront distribution uses dynamic blocks to reduce code duplication:
- **Before**: Multiple nearly identical `ordered_cache_behavior` blocks for each file type
- **After**: Single dynamic block with `for_each` over `static_asset_cache_patterns`
- **Benefits**: 
  - Easier to maintain and update
  - Simple to add new file types
  - Consistent caching configuration
  - Reduced chance of configuration drift

To customize static asset caching, override `static_asset_cache_patterns` in your `terraform.tfvars`:
```hcl
static_asset_cache_patterns = ["*.css", "*.js", "*.png", "*.jpg", "*.svg", "*.woff2"]
```
