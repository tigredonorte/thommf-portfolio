# Security Overview

This document provides a comprehensive overview of the security measures implemented for the thommf-portfolio deployment pipeline.

## 🎯 Security Objectives

1. **Least Privilege Access** - Minimal permissions for automated deployment
2. **Resource Isolation** - Prevent access to non-frontend AWS resources
3. **Audit & Monitoring** - Complete visibility into deployment activities
4. **Automated Detection** - Real-time alerts for security violations

## 🔒 Security Architecture

### Deployment Security Model

```
GitHub Actions → IAM User (frontend-deployer) → AWS Resources (frontend-* only)
                      ↓
              CloudTrail Logging → CloudWatch Monitoring → SNS Alerts
```

### Access Control Layers

1. **IAM Policy** - Application-level permissions (primary control)
2. **Service Control Policy** - Organization-level restrictions (additional layer)
3. **Resource Policies** - Service-specific access control (S3 bucket policies)
4. **CloudTrail** - Audit logging and monitoring

## 🛡️ Implemented Security Controls

### 1. Restricted IAM Policy

The `frontend-deployer` user has minimal permissions:

| Service | Allowed Actions | Restrictions |
|---------|----------------|--------------|
| **S3** | Bucket/object management | Only resources with `Environment=frontend` tag |
| **CloudFront** | Distribution management | Only resources with `Environment=frontend` tag |
| **Route 53** | DNS record management | Only resources with `Environment=frontend` tag |
| **ACM** | Certificate read access | Read-only |

### 2. Tag-Based Resource Control

All managed resources must be tagged:
- **Required Tag**: `Environment=frontend`
- **Additional Tags**: Optional (Project, Owner, etc.)
- **Flexible Naming**: No naming restrictions required

### 3. Monitoring & Alerting

#### CloudTrail Logging
- **API Call Tracking** - All AWS API calls logged
- **Tag Violations** - Access to improperly tagged resources tracked
- **Log Integrity** - Log file validation enabled

#### CloudWatch Monitoring
- **Tag Violations** - Unauthorized access to non-frontend resources
- **Untagged Resources** - Resource creation without proper tags
- **IAM Changes** - Policy modification attempts

#### Automated Alerts
- Real-time SNS notifications for security events
- CloudWatch dashboard for visual monitoring
- Log aggregation in CloudWatch Logs

### 4. Service Control Policies (SCP)

Optional organization-level controls:
- Enforce required tags at the AWS Organizations level
- Block access to improperly tagged resources
- Restrict deployment to specific regions

## 🚀 Security Setup Guide

### Terraform-Managed Security

The IAM policy and user are managed through Terraform:

1. **Configure variables** in `infra/terraform/terraform.tfvars`
2. **Deploy infrastructure** with `terraform apply`  
3. **Create access keys** manually in AWS IAM Console

### Manual Verification

1. **Test IAM Permissions**:
   ```bash
   # Try to access a bucket without proper tags (should fail)
   aws s3 ls s3://some-other-bucket
   
   # Access resources with proper tags (should succeed)
   aws s3 ls s3://your-frontend-bucket
   ```

2. **Check Resource Tags**: Ensure all resources have `Environment=frontend`
3. **Verify IAM Policy**: AWS Console → IAM → Users → frontend-deployer

## 📚 Documentation References

### Primary Documentation
- [Deployment Guide](/.github/DEPLOYMENT.md) - Complete setup instructions
- [IAM Policy Reference](/infra/IAM-POLICY.md) - Detailed permissions breakdown
- [Terraform Security](/infra/terraform/README.md) - Infrastructure security

### Security Scripts
- [Deployment Script](/infra/deploy.sh) - Secure deployment automation

## 🔍 Security Validation Checklist

Before production deployment:

- [ ] **IAM Policy Applied** - frontend-deployer user has restricted policy
- [ ] **Resource Tagging** - All resources tagged with `Environment=frontend`
- [ ] **CloudTrail Enabled** - API logging active
- [ ] **Monitoring Setup** - CloudWatch alarms configured
- [ ] **SNS Alerts** - Security notifications configured
- [ ] **Access Keys Secured** - Stored in GitHub Secrets only
- [ ] **SCP Applied** (if using AWS Organizations)
- [ ] **IP Restrictions** (optional) - GitHub Actions IP ranges only

## 🆘 Incident Response

### Security Event Detection

1. **Automated Alerts** - SNS notifications for violations
2. **Dashboard Monitoring** - Real-time security metrics
3. **Log Analysis** - CloudWatch Logs Insights queries

### Response Procedures

1. **Immediate** - Disable IAM user access keys
2. **Investigation** - Review CloudTrail logs for unauthorized actions
3. **Remediation** - Rotate credentials, review permissions
4. **Documentation** - Record incident details and lessons learned

## 🔄 Continuous Security

### Regular Reviews
- Monthly IAM policy review
- Quarterly security dashboard analysis
- Annual penetration testing (recommended)

### Automated Monitoring
- Daily CloudTrail log analysis
- Real-time security event alerts
- Weekly security posture reports

## 📞 Security Support

For security issues or questions:
1. Review this documentation
2. Check CloudWatch logs and dashboard
3. Consult AWS Security Best Practices
4. Consider AWS Support for critical issues

---

**Last Updated**: $(date)
**Security Model**: Defense in Depth with Least Privilege Access
**Compliance**: Follows AWS Well-Architected Security Pillar principles
