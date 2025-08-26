# Terraform Infrastructure v2

This is a modular Terraform infrastructure setup for deploying static websites with CloudFront and S3, designed to replace the problematic setup in `infra/terraform`.

## Features

- **Modular Architecture**: Separate modules for S3, CloudFront, Route53, and IAM
- **Multi-Environment Support**: dev, staging, prod environments with subdomains
- **CI/CD Ready**: GitHub Actions integration with OIDC
- **State Management**: Remote state in S3 with DynamoDB locking
- **Security**: Principle of least privilege IAM policies
- **Cost Optimized**: Uses CloudFront PriceClass_100 and efficient S3 configuration

## Architecture

```
thomfilg.com (manually managed)
├── dev.thomfilg.com     → CloudFront → S3
├── staging.thomfilg.com → CloudFront → S3
└── www.thomfilg.com     → CloudFront → S3 (prod)
```

## Prerequisites

1. **Domain Setup**: `thomfilg.com` must be registered and have a Route53 hosted zone
2. **S3 Backend**: `requisition-terraform-state` bucket must exist
3. **DynamoDB Table**: `terraform-locks` table for state locking (optional but recommended)
4. **GitHub OIDC**: AWS IAM OIDC provider for GitHub Actions (for CI/CD)

## Project Structure

```
infra/terraform/
├── modules/
│   ├── s3-website/      # S3 bucket for static hosting
│   ├── cloudfront/      # CloudFront distribution and SSL
│   ├── route53/         # DNS records for subdomains
│   └── iam/             # Deployment permissions
├── environments/
│   ├── dev/
│   │   ├── terraform.tfvars    # Environment-specific variables
│   │   └── backend.tfvars       # Backend configuration for state management
│   ├── staging/
│   │   ├── terraform.tfvars
│   │   └── backend.tfvars
│   └── prod/
│       ├── terraform.tfvars
│       └── backend.tfvars
├── backend.tf           # Backend configuration template
├── main.tf              # Main module composition
├── variables.tf         # Input variables
└── outputs.tf           # Output values
```

## Configuration Management

### Configuration Approach

#### 1. Environment-Specific Variables (`terraform.tfvars`)

Each environment has its own `terraform.tfvars` file containing environment-specific values:

- `environment`: Environment name (dev, staging, prod)
- `domain_name`: Root domain name
- `subdomain`: Environment-specific subdomain
- `project_name`: Project identifier
- `aws_region`: AWS region for resources
- `github_repo`: GitHub repository for CI/CD integration
- `create_deployment_user`: Whether to create IAM user for deployment

#### 2. Backend Configuration (`backend.tfvars`)

Each environment has a separate backend configuration file for state management:

```hcl
bucket = "requisition-terraform-state"
key    = "environments/{environment}/terraform.tfstate"
region = "us-east-1"
encrypt = true
# dynamodb_table = "terraform-locks"  # Uncomment when DynamoDB table is created
```

#### 3. State Locking (Optional)

State locking via DynamoDB is currently disabled to avoid costs. To enable:

1. Create a DynamoDB table named `terraform-locks` with a primary key `LockID` (string)
2. Uncomment the `dynamodb_table` line in all `backend.tfvars` files
3. Uncomment the same line in `backend.tf`

### Benefits of This Approach

1. **Consistency**: All configuration is centralized in version-controlled files
2. **Clarity**: Clear separation between environments
3. **Maintainability**: Easy to add new environments or modify existing ones
4. **Security**: No sensitive values in workflow files
5. **Testability**: Developers can easily test with the same configuration locally

## Usage

### Local Development

```bash
# Navigate to terraform directory
cd infra/terraform

# Initialize for a specific environment
terraform init -backend-config=environments/dev/backend.tfvars

# Plan changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

## CI/CD Setup

### GitHub Secrets Required

1. `AWS_TERRAFORM_ROLE_ARN`: IAM role ARN for GitHub Actions OIDC

### Workflow Behavior

- **Pull Requests**: Runs `terraform plan` for dev and staging environments
- **Main Branch**: Auto-deploys dev environment only
- **Manual**: Staging and prod require manual deployment

### CI/CD Workflows

The GitHub Actions workflows automatically use the appropriate configuration files based on the environment:

1. **deploy-infra.yml**: Handles infrastructure deployment
   - Uses `backend.tfvars` for state configuration
   - Uses `terraform.tfvars` for environment variables

2. **deploy-app-simple.yml**: Handles application deployment
   - Retrieves infrastructure outputs using the same backend configuration

### Setting up GitHub OIDC

1. Create GitHub OIDC provider in AWS (once per account):
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

2. Create IAM role for GitHub Actions with trust policy allowing your repository

3. Add the role ARN to GitHub Secrets as `AWS_TERRAFORM_ROLE_ARN`

## Module Details

### S3 Website Module
- Creates encrypted S3 bucket with versioning
- Configures bucket policy for CloudFront access
- Uploads default index.html

### CloudFront Module
- Creates Origin Access Control (OAC) for S3 access
- Generates ACM certificate for HTTPS
- Configures caching and error pages for SPA routing

### Route53 Module
- Creates subdomain A records pointing to CloudFront
- Manages certificate validation DNS records
- Looks up existing Route53 hosted zone

### IAM Module
- Creates GitHub Actions role with OIDC trust policy
- Provides minimal S3 and CloudFront permissions
- Optional IAM user creation for alternative access

## Troubleshooting

### Common Issues

1. **Certificate Validation**: ACM certificates in us-east-1 require DNS validation
2. **Route53 Zone**: Ensure `thomfilg.com` hosted zone exists before running
3. **State Conflicts**: Use different usernames or environments to avoid conflicts
4. **OIDC Setup**: GitHub OIDC provider must be created once per AWS account

### Manual Certificate Validation

If automatic DNS validation fails:

1. Check Route53 records were created properly
2. Wait for DNS propagation (up to 48 hours)
3. Validate manually in ACM console

### State Recovery

If state becomes corrupted:

1. **Backup**: Export current state: `terraform show -json > backup.json`
2. **Import**: Re-import resources if needed
3. **Clean**: Remove locks: `aws dynamodb delete-item --table-name terraform-locks --key '{"LockID":{"S":"<lock-id>"}}'`

## Adding a New Environment

To add a new environment (e.g., `qa`):

1. Create directory: `environments/qa/`
2. Create `terraform.tfvars` with environment-specific values
3. Create `backend.tfvars` with state configuration
4. Update CI/CD workflows to include the new environment in the matrix

## Migration from v1

To migrate from `infra/terraform`:

1. Export existing resources
2. Deploy new environment with different subdomain
3. Test thoroughly
4. Update DNS records
5. Destroy old infrastructure

## Cost Estimation

Per environment (monthly):
- S3 storage: ~$0.50 (assuming 1GB)
- CloudFront: ~$1.00 (first 1TB free tier)
- Route53 queries: ~$0.50
- **Total: ~$2.00/month per environment**

## Security Considerations

- S3 buckets are private with CloudFront-only access
- IAM roles follow principle of least privilege
- All traffic uses HTTPS with modern TLS
- State files are encrypted in S3