#!/bin/bash

# Portfolio Deployment Script
# This script builds the project and deploys it to AWS S3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infra/terraform"
BUILD_DIR="$PROJECT_ROOT/apps/container/dist"

echo -e "${BLUE}🚀 Starting portfolio deployment...${NC}"

# Function to print colored output
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
        print_error "npm or pnpm is not installed"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install project dependencies
install_dependencies() {
    print_step "Installing project dependencies..."
    cd "$PROJECT_ROOT"
    
    # Check if we're in the right directory by looking for package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $PROJECT_ROOT"
        exit 1
    fi
    
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_step "Building the project..."
    cd "$PROJECT_ROOT"
    
    # Verify we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $PROJECT_ROOT"
        exit 1
    fi
    
    if command -v pnpm &> /dev/null; then
        pnpm run build
    else
        npm run build
    fi
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory not found: $BUILD_DIR"
        exit 1
    fi
    
    print_success "Project built successfully"
}

# Initialize and apply Terraform
deploy_infrastructure() {
    print_step "Deploying infrastructure with Terraform..."
    cd "$TERRAFORM_DIR"
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars not found!"
        echo "Please copy infra/terraform/terraform.tfvars.example to infra/terraform/terraform.tfvars and configure it"
        exit 1
    fi
    
    # Initialize Terraform
    terraform init
    
    # Plan the deployment
    terraform plan
    
    # Ask for confirmation
    echo -e "${YELLOW}Do you want to apply these changes? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        terraform apply -auto-approve
        print_success "Infrastructure deployed"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
}

# Upload files to S3
upload_files() {
    print_step "Uploading files to S3..."
    cd "$TERRAFORM_DIR"
    
    # Get S3 bucket name from Terraform output
    BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)
    
    if [ -z "$BUCKET_NAME" ]; then
        print_error "Could not get S3 bucket name from Terraform output"
        exit 1
    fi
    
    # Sync files to S3
    aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" --delete
    
    print_success "Files uploaded to S3"
    
    # Invalidate CloudFront cache
    print_step "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*"
    
    print_success "CloudFront cache invalidated"
}

# Display deployment information
show_deployment_info() {
    print_step "Deployment complete!"
    cd "$TERRAFORM_DIR"
    
    echo -e "\n${GREEN}🎉 Your portfolio has been deployed successfully!${NC}\n"
    
    WEBSITE_URL=$(terraform output -raw website_url)
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
    
    echo -e "${BLUE}Website URL:${NC} $WEBSITE_URL"
    echo -e "${BLUE}CloudFront Domain:${NC} https://$CLOUDFRONT_DOMAIN"
    
    echo -e "\n${YELLOW}Note: CloudFront deployment can take 10-15 minutes to propagate globally.${NC}"
    echo -e "${YELLOW}Your website might not be immediately available at the CloudFront URL.${NC}"
}

# Main execution
main() {
    case "${1:-}" in
        "infrastructure-only")
            check_dependencies
            deploy_infrastructure
            ;;
        "upload-only")
            check_dependencies
            upload_files
            show_deployment_info
            ;;
        "build-only")
            check_dependencies
            install_dependencies
            build_project
            ;;
        *)
            check_dependencies
            install_dependencies
            build_project
            deploy_infrastructure
            upload_files
            show_deployment_info
            ;;
    esac
}

# Run the script
main "$@"
