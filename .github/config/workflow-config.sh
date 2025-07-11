#!/bin/bash
# Shared configuration for GitHub Actions workflows

# AWS Configuration
export AWS_REGION="us-east-1"

# Terraform Configuration  
export TERRAFORM_VERSION="1.7.0"

# Deployment Configuration
export DEPLOY_ON_PR="true"  # Set to "false" to disable PR deployments

# Environment Configuration
export DEFAULT_ENVIRONMENT="Production"
