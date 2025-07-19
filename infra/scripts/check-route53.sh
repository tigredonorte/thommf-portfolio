#!/bin/bash
# Check Route 53 setup for thomfilg.com domain

set -e

DOMAIN_NAME="thomfilg.com"
echo "🔍 Checking Route 53 setup for $DOMAIN_NAME..."

# Check if hosted zone exists
echo "📋 Looking for hosted zone..."
HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='${DOMAIN_NAME}.']" --output json)

if [ "$(echo $HOSTED_ZONE | jq length)" -eq 0 ]; then
    echo "❌ No hosted zone found for $DOMAIN_NAME"
    echo "📝 You need to create a hosted zone first:"
    echo "   aws route53 create-hosted-zone --name $DOMAIN_NAME --caller-reference $(date +%s)"
    exit 1
fi

ZONE_ID=$(echo $HOSTED_ZONE | jq -r '.[0].Id' | sed 's|/hostedzone/||')
echo "✅ Found hosted zone: $ZONE_ID"

# Get nameservers
echo "📡 Getting nameservers..."
NAMESERVERS=$(aws route53 get-hosted-zone --id $ZONE_ID --query 'DelegationSet.NameServers' --output json)
echo "🌐 Nameservers for $DOMAIN_NAME:"
echo $NAMESERVERS | jq -r '.[]' | sed 's/^/   /'

# Check if domain is using Route 53 nameservers
echo "🔍 Checking current nameservers for $DOMAIN_NAME..."
CURRENT_NS=$(dig +short NS $DOMAIN_NAME)
if [ -z "$CURRENT_NS" ]; then
    echo "⚠️  Could not resolve nameservers for $DOMAIN_NAME"
    echo "📝 Make sure your domain registrar is configured to use the Route 53 nameservers above"
else
    echo "🌐 Current nameservers:"
    echo "$CURRENT_NS" | sed 's/^/   /'
    
    # Check if any Route 53 nameserver is being used
    R53_NS_FOUND=false
    while IFS= read -r ns; do
        if echo $NAMESERVERS | jq -r '.[]' | grep -q "${ns%.}"; then
            R53_NS_FOUND=true
            break
        fi
    done <<< "$CURRENT_NS"
    
    if [ "$R53_NS_FOUND" = true ]; then
        echo "✅ Domain is using Route 53 nameservers"
    else
        echo "⚠️  Domain is NOT using Route 53 nameservers"
        echo "📝 Update your domain registrar to use the Route 53 nameservers above"
    fi
fi

# Check existing records
echo "📋 Existing DNS records in hosted zone:"
aws route53 list-resource-record-sets --hosted-zone-id $ZONE_ID --query 'ResourceRecordSets[?Type!=`NS` && Type!=`SOA`]' --output table

echo "✅ Route 53 check complete!"
echo "📝 Zone ID for Terraform: $ZONE_ID"
