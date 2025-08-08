# GitHub Actions Setup Guide

This guide explains how to configure GitHub for automated deployment using either OIDC (recommended) or AWS access keys.

## 🚀 **Option 1: OIDC Authentication (Recommended)**

**OpenID Connect (OIDC)** provides secure, temporary credentials without storing long-lived AWS access keys.

### Benefits:
- ✅ No AWS access keys stored in GitHub
- ✅ Temporary credentials that expire automatically  
- ✅ Fine-grained permissions based on repository/branch
- ✅ Better security and audit trail

### Quick Setup:
1. **Configure Terraform** with OIDC enabled
2. **Deploy infrastructure** to create the OIDC provider and role
3. **Add one GitHub secret**: `AWS_ROLE_ARN`

**📋 [Complete OIDC Setup Guide →](OIDC_SETUP.md)**

---

## 🔑 **Option 2: AWS Access Keys (Legacy)**

If you prefer using traditional AWS access keys:

### Required GitHub Secrets

To use the GitHub Actions workflow for deployment, you need to add these secrets to your repository:

#### **AWS Credentials** (Required for deployment)
- **`AWS_ACCESS_KEY_ID`** - Your AWS Access Key ID
- **`AWS_SECRET_ACCESS_KEY`** - Your AWS Secret Access Key
- **`S3_BUCKET_NAME`** - Your S3 bucket name (e.g., `portfolio.thomfilg.com`)

#### **Optional Secrets** (For custom domain)
- **`DOMAIN_NAME`** - JSON array of domain names (e.g., `["portfolio.thomfilg.com"]`)
- **`SSL_CERTIFICATE_ARN`** - ACM certificate ARN for HTTPS
- **`HOSTED_ZONE_ID`** - Route 53 hosted zone ID

## Setup Steps

### 1. Create AWS IAM User for Frontend Deployment

#### **Option A: Terraform-Managed IAM (Recommended)**

The IAM policy and user are managed by Terraform:

1. **Configure Terraform variables** in `infra/terraform/terraform.tfvars`:
   ```hcl
   create_iam_resources = true
   frontend_deployer_username = "frontend-deployer"
   create_access_keys = false  # Create manually for security
   resource_tag_environment = "frontend"  # Required for IAM policy
   environment = "prod"  # Deployment environment
   ```

2. **Deploy infrastructure**:
   ```bash
   cd infra/terraform
   terraform plan
   terraform apply
   ```

3. **Create access keys** (for GitHub Secrets):
   - Go to **AWS IAM Console** → **Users** → **frontend-deployer**
   - **Security credentials** tab → **Create access key**
   - Choose **Application running outside AWS**

#### **Option B: Manual IAM Setup**

If you prefer manual setup, copy the IAM policy from `infra/terraform/iam.tf` and create the user manually.

**🚨 Important**: All AWS resources must be tagged with `Environment=frontend` for the deployer to access them.

### 2. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret:

```
Name: AWS_ACCESS_KEY_ID
Value: AKIA...

Name: AWS_SECRET_ACCESS_KEY  
Value: your-secret-key

Name: S3_BUCKET_NAME
Value: portfolio.thomfilg.com
```

### 3. Optional: Custom Domain Secrets

Only add these if you want to use a custom domain:

```
Name: DOMAIN_NAME
Value: ["portfolio.thomfilg.com"]

Name: SSL_CERTIFICATE_ARN
Value: arn:aws:acm:us-east-1:123456789012:certificate/...

Name: HOSTED_ZONE_ID
Value: Z123456789012345678901
```

## Workflow Behavior

### **Without Secrets**
- ⚠️ GitHub Actions will show warnings about missing secrets
- ✅ Terraform plan/validate steps will still work
- ❌ Deployment steps will fail (expected)

### **With Required Secrets**
- ✅ Full deployment will work
- ✅ Build artifacts uploaded to S3
- ✅ CloudFront cache invalidated

### **With All Secrets**
- ✅ Custom domain configuration
- ✅ SSL certificate setup
- ✅ DNS records created

## Local Development

For local deployment, use the `infra/deploy.sh` script instead:

```bash
# Configure AWS CLI locally
aws configure

# Deploy locally
pnpm run deploy
```

## Security Notes

- **Never commit AWS credentials to code**
- **Use IAM users with minimal required permissions** (see policy in `infra/terraform/iam.tf`)
- **Rotate access keys regularly** (every 90 days recommended)
- **Monitor AWS CloudTrail for API usage**
- **Consider using IAM roles with OIDC** for GitHub Actions (more secure than access keys)
- **All AWS resources must be tagged with `Environment=frontend`**

## Troubleshooting

### "Context access might be invalid" warnings
These warnings appear when secrets aren't defined in your repository. They're safe to ignore if you're not using GitHub Actions for deployment.

### "Build failed" errors
Check that your build runs successfully locally:
```bash
pnpm run build
```

### "Terraform errors" in GitHub Actions
Verify your secrets are correctly set and your AWS permissions are sufficient.

## Manual Deployment Alternative

If you prefer not to use GitHub Actions, you can deploy manually:

```bash
# Configure your settings
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# Edit the file with your values

# Deploy
pnpm run deploy
```
