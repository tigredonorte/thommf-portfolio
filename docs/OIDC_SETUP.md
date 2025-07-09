# GitHub Actions OIDC Setup Guide

This guide shows how to configure OpenID Connect (OIDC) authentication between GitHub Actions and AWS for secure deployment without long-lived access keys.

## Why Use OIDC?

✅ **Secure**: No long-lived AWS access keys stored in GitHub  
✅ **Automatic**: Temporary credentials that expire automatically  
✅ **Auditable**: AWS CloudTrail shows which GitHub workflow made calls  
✅ **Fine-grained**: Repository and branch-specific permissions  

## Step 1: Update Terraform Configuration

1. **Update your `terraform.tfvars`:**
   ```hcl
   # Enable OIDC instead of access keys
   use_oidc = true
   github_repository = "yourusername/thommf-portfolio"  # Replace with your GitHub repo
   create_access_keys = false
   ```

2. **Deploy the infrastructure:**
   ```bash
   cd infra/terraform
   terraform apply
   ```

3. **Get the role ARN from outputs:**
   ```bash
   terraform output github_actions_role_arn
   ```

## Step 2: Configure GitHub Repository Secrets

Add this secret to your GitHub repository:

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Add **Repository Secret**:
   - **Name**: `AWS_ROLE_ARN`
   - **Value**: The role ARN from Terraform output (e.g., `arn:aws:iam::123456789012:role/GitHubActions-frontend-deployer-Role`)

## Step 3: Update GitHub Actions Workflow

The workflow is already configured to use OIDC! It will:

1. Use the `id-token: write` permission
2. Assume the AWS role using `role-to-assume` instead of access keys
3. Get temporary AWS credentials automatically

## Step 4: Test the Setup

1. **Push to main branch** to trigger deployment
2. **Check the workflow logs** for successful AWS authentication
3. **Verify in AWS CloudTrail** that the role was assumed

## Troubleshooting

### Common Issues:

1. **"No OpenIDConnect provider found"**
   - Ensure Terraform created the OIDC provider
   - Check `terraform output oidc_provider_arn`

2. **"Not authorized to perform sts:AssumeRoleWithWebIdentity"**
   - Verify the `github_repository` variable matches your repo exactly
   - Check that the role trust policy includes your repository

3. **"Token audience validation failed"**
   - Ensure the workflow has `id-token: write` permission
   - Check that `aws-actions/configure-aws-credentials@v4` is used

### Verification Commands:

```bash
# Check OIDC provider exists
terraform output oidc_provider_arn

# Check role ARN
terraform output github_actions_role_arn

# Test role assumption (from your local AWS CLI)
aws sts get-caller-identity
```

## Security Benefits

- **No Secret Rotation**: OIDC tokens expire automatically
- **Repository-Scoped**: Role can only be assumed from your specific repository
- **Branch-Specific**: Can be restricted to specific branches
- **Auditable**: All AWS API calls are logged with GitHub context
- **Revocable**: Disable access by updating the role trust policy

## Migration from Access Keys

If you're migrating from access keys:

1. **Deploy OIDC setup** with Terraform
2. **Update GitHub secrets** (remove old keys, add role ARN)
3. **Test deployment** to ensure it works
4. **Delete old access keys** from AWS IAM console

The old IAM user and access keys will still exist but won't be used by GitHub Actions.
