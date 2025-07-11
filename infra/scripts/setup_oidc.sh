#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Variables
AWS_REGION="us-east-1"
GITHUB_ORG="tigredonorte"
GITHUB_REPO="thommf-portfolio"
ROLE_NAME="GitHubActions-thommf-portfolio-Role"
POLICY_NAME="GitHubActions-thommf-portfolio-Policy"

# Get the AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Error: Could not retrieve AWS Account ID. Please check your AWS credentials."
    exit 1
fi

echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Create IAM OIDC Provider for GitHub Actions
echo "Creating IAM OIDC Provider for GitHub Actions..."
aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" "1c58a3a8518e8759bf075b76b750d4f2df264fcd" \
    --region $AWS_REGION || echo "OIDC Provider already exists."

OIDC_PROVIDER_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
echo "OIDC Provider ARN: $OIDC_PROVIDER_ARN"

# Create IAM Role for GitHub Actions
echo "Creating IAM Role for GitHub Actions..."

# Create the assume role policy document
ASSUME_ROLE_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "$OIDC_PROVIDER_ARN"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:$GITHUB_ORG/$GITHUB_REPO:*"
                }
            }
        }
    ]
}
EOF
)

aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document "$ASSUME_ROLE_POLICY" \
    --description "Role for GitHub Actions to deploy to S3" \
    --region $AWS_REGION || echo "Role already exists."

# Create IAM Policy
echo "Creating IAM Policy..."
POLICY_DOCUMENT=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::thommf-portfolio-production/*",
                "arn:aws:s3:::thommf-portfolio-production"
            ]
        }
    ]
}
EOF
)

POLICY_ARN=$(aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document "$POLICY_DOCUMENT" \
    --description "Policy for GitHub Actions to deploy to S3" \
    --query 'Policy.Arn' --output text \
    --region $AWS_REGION)

if [ -z "$POLICY_ARN" ]; then
    echo "Error: Could not create IAM policy. Trying to retrieve existing policy ARN."
    POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text --region $AWS_REGION)
    if [ -z "$POLICY_ARN" ]; then
        echo "Error: Could not retrieve existing IAM policy ARN."
        exit 1
    fi
fi

echo "Policy ARN: $POLICY_ARN"

# Attach Policy to Role
echo "Attaching policy to role..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn $POLICY_ARN \
    --region $AWS_REGION

echo "✅ OIDC setup complete!"
echo "Role ARN: arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME"
