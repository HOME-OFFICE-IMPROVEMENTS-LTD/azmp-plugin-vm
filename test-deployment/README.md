# Test Deployment Package

This directory contains generated ARM templates and deployment scripts for Phase 5 validation testing.

## 📁 Contents

- **mainTemplate.json** - ARM deployment template (22 KB, 64 parameters, 5 resources)
- **createUiDefinition.json** - Azure Portal wizard UI (48 KB, 5 steps, 56 outputs)
- **viewDefinition.json** - Managed Application view definition (5.9 KB)
- **parameters.json** - Sample deployment parameters
- **VALIDATION_RESULTS.md** - Phase 1 validation report

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Azure CLI (if not already installed)
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login to Azure
az login

# Verify subscription
az account show
```

### 2. Update Parameters

Edit `parameters.json` and replace:
```json
"adminPasswordOrKey": {
  "value": "REPLACE_WITH_YOUR_SSH_PUBLIC_KEY"
}
```

Generate SSH key if needed:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub
```

### 3. Deploy Using Quickstart Script

```bash
# From project root
cd ..

# Basic deployment (uses defaults)
./scripts/azure-deploy.sh

# Deploy with custom parameters
./scripts/azure-deploy.sh -p test-deployment/parameters.json

# Deploy to specific resource group and location
./scripts/azure-deploy.sh -g my-rg -l westus2 -p test-deployment/parameters.json

# Dry run (validation only, no deployment)
./scripts/azure-deploy.sh --dry-run -p test-deployment/parameters.json
```

### 4. Manual Deployment (Azure CLI)

```bash
# Create resource group
az group create \
  --name rg-azmp-vm-test \
  --location eastus

# Validate template
az deployment group validate \
  --resource-group rg-azmp-vm-test \
  --template-file mainTemplate.json \
  --parameters @parameters.json

# Deploy
az deployment group create \
  --name azmp-vm-deployment \
  --resource-group rg-azmp-vm-test \
  --template-file mainTemplate.json \
  --parameters @parameters.json
```

## 🌐 Azure Portal Testing

### Test Portal UI Wizard

1. Navigate to [Azure Portal UI Definition Sandbox](https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade)
2. Copy contents of `createUiDefinition.json`
3. Paste into sandbox editor
4. Click **Preview**
5. Test all 5 wizard steps:
   - **Basics**: VM configuration
   - **Monitoring**: Log Analytics & App Insights
   - **Cost & Performance**: Budget & Autoscale
   - **High Availability**: Availability options
   - **Disaster Recovery**: Backup configuration

### Deploy via Portal

1. Navigate to [Deploy Custom Template](https://portal.azure.com/#create/Microsoft.Template)
2. Click **Build your own template in the editor**
3. Paste `mainTemplate.json` content
4. Click **Save**
5. Fill in parameters
6. Review + Create

## 📊 Deployment Outputs

After successful deployment, you'll see these outputs:

- **vmName** - Virtual machine name
- **vmResourceId** - VM resource ID
- **adminUsername** - Admin username
- **backupVaultId** - Recovery Services vault ID
- **backupPolicyId** - Backup policy ID
- **extensionsInstalled** - List of installed VM extensions

## 🔍 Verify Deployment

### List Resources
```bash
./scripts/azure-deploy.sh list
```

### Get Outputs
```bash
./scripts/azure-deploy.sh outputs
```

### Check Specific Resources
```bash
# Virtual Machine
az vm show -g rg-azmp-vm-test -n azmp-test-vm-01

# Network Interface
az network nic list -g rg-azmp-vm-test --output table

# Recovery Services Vault
az backup vault list -g rg-azmp-vm-test --output table

# Backup Status
az backup protection check-vm \
  -g rg-azmp-vm-test \
  --vm-name azmp-test-vm-01
```

## 🧹 Cleanup

### Using Quickstart Script
```bash
./scripts/azure-deploy.sh cleanup
```

### Manual Cleanup
```bash
az group delete --name rg-azmp-vm-test --yes --no-wait
```

## ⚠️ Important Notes

### Template Compilation

The templates in this directory were generated from Handlebars sources (`src/templates/*.hbs`) using minimal configuration. As a result:

- **mainTemplate.json**: Contains 5 core resources (fewer than the full 12+ available)
- **viewDefinition.json**: Has null views array (conditional compilation issue)
- **createUiDefinition.json**: ✅ Fully functional (5 steps, 56 outputs)

This doesn't affect Portal wizard testing or basic deployments. For full resource deployment, ensure comprehensive Handlebars context is provided during generation.

### Known Issues

1. **Trailing commas**: Fixed in generated files (lines 697, 81)
2. **Conditional resources**: Some resources won't deploy without specific parameter flags
3. **View definition**: Only visible in managed applications, not standard deployments

### Cost Estimates

Approximate monthly costs (East US region):
- **VM (Standard_B2s)**: ~$30/month
- **Storage (64 GB Premium SSD)**: ~$10/month
- **Public IP (Static)**: ~$3/month
- **Log Analytics (30-day retention)**: Variable based on data ingestion
- **Recovery Services Vault**: ~$5/month for backups

**Total**: ~$50-60/month for test deployment

## 📚 Documentation

- [Phase 5 Implementation Plan](../docs/PHASE5_IMPLEMENTATION_PLAN.md)
- [Phase 5 Deployment Validation Plan](../docs/PHASE5_DEPLOYMENT_VALIDATION_PLAN.md)
- [Validation Results](./VALIDATION_RESULTS.md)

## 🐛 Troubleshooting

### "Template validation failed"
- Check parameter values in `parameters.json`
- Ensure SSH public key format is correct
- Verify resource naming conventions

### "Resource group already exists"
- Use `--skip-rg-create` flag
- Or delete existing: `az group delete --name rg-azmp-vm-test`

### "Deployment timed out"
- Normal deployment takes 10-15 minutes
- Check Azure Portal for detailed status
- View deployment operations: `az deployment operation group list`

### "SSH connection failed"
- Check NSG rules allow port 22
- Verify public IP is assigned
- Ensure SSH key matches the one in parameters

## 📞 Support

For issues or questions:
1. Check [Validation Results](./VALIDATION_RESULTS.md)
2. Review [Deployment Validation Plan](../docs/PHASE5_DEPLOYMENT_VALIDATION_PLAN.md)
3. Check Azure Portal deployment logs
4. Review ARM template errors in Activity Log

---

**Generated**: 2025-10-26  
**Phase**: 5 - Live Azure Deployment Validation  
**Status**: Ready for deployment
