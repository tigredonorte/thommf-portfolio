# Backend configuration for dev environment
bucket  = "thomfilg-terraform-state"
key     = "environments/dev/terraform.tfstate"
region  = "us-east-1"
encrypt = true
# dynamodb_table = "terraform-locks"  # Uncomment when DynamoDB table is created for state locking