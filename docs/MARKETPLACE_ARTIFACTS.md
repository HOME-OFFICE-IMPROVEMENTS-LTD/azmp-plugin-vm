# Azure Marketplace Template Artifacts - v2.1.0

## 📦 Available Packages

### Minimal Configuration Package
**File**: `azmp-vm-templates-minimal-v2.1.0.zip` (12 KB)  
**SHA256**: `5f4f30186fae865d67730437bef71aaefc78d02e60915e7471e19eeacae94baf`

**Use Case**: Development, testing, proof-of-concept deployments

**Configuration**:
- VM Size: Standard_B2s (2 vCPUs, 4 GB RAM)
- OS: Ubuntu 22.04 LTS
- Storage: Standard_LRS
- Network: Public IP with SSH access
- Cost: ~$30-40/month

### Enterprise Configuration Package
**File**: `azmp-vm-templates-enterprise-v2.1.0.zip` (13 KB)  
**SHA256**: `8600984d6ee8b4b60ad782a20fce92fdd40efea5d9e6de80da950ac352cf506b`

**Use Case**: Production workloads, high availability, compliance requirements

**Configuration**:
- VM Size: Standard_D8s_v3 (8 vCPUs, 32 GB RAM)
- OS: Ubuntu 22.04 LTS
- Storage: Premium_LRS with 3 data disks (1 TB, 2 TB, 512 GB)
- Network: Private with Bastion, Load Balancer
- HA: Availability Set
- Monitoring: Azure Monitor with alerts
- Backup: Enhanced backup policy
- Cost: ~$600-800/month

## ✅ Verification

To verify package integrity after download:

```bash
# Minimal
sha256sum azmp-vm-templates-minimal-v2.1.0.zip
# Should output: 5f4f30186fae865d67730437bef71aaefc78d02e60915e7471e19eeacae94baf

# Enterprise
sha256sum azmp-vm-templates-enterprise-v2.1.0.zip
# Should output: 8600984d6ee8b4b60ad782a20fce92fdd40efea5d9e6de80da950ac352cf506b
```

## 🚀 Quick Start

### 1. Download Package
```bash
# Download from GitHub releases
wget https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/releases/download/v2.1.0/azmp-vm-templates-minimal-v2.1.0.zip

# Or enterprise
wget https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/releases/download/v2.1.0/azmp-vm-templates-enterprise-v2.1.0.zip
```

### 2. Extract
```bash
unzip azmp-vm-templates-minimal-v2.1.0.zip
cd minimal/
```

### 3. Deploy to Azure

**Option A: Azure Portal**
1. Navigate to Azure Portal → Create a resource → Template deployment
2. Upload `mainTemplate.json`
3. Upload `createUiDefinition.json` for UI parameters
4. Fill in required parameters and deploy

**Option B: Azure CLI**
```bash
az deployment group create \
  --resource-group my-rg \
  --template-file mainTemplate.json \
  --parameters vmName=myvm adminUsername=azureuser
```

**Option C: PowerShell**
```powershell
New-AzResourceGroupDeployment `
  -ResourceGroupName my-rg `
  -TemplateFile mainTemplate.json `
  -vmName myvm `
  -adminUsername azureuser
```

## 📋 Partner Center Submission Checklist

### Pre-Submission
- [ ] Download appropriate package (minimal or enterprise)
- [ ] Verify SHA256 checksum
- [ ] Extract and review templates
- [ ] Test deployment in personal Azure subscription
- [ ] Ensure all resources deploy successfully
- [ ] Verify estimated costs align with expectations

### Partner Center Configuration
- [ ] Create new Virtual Machine offer (or update existing)
- [ ] Navigate to Technical Configuration tab
- [ ] Upload `mainTemplate.json` as main template
- [ ] Upload `createUiDefinition.json` for portal UI
- [ ] (Optional) Upload `viewDefinition.json` for managed app
- [ ] Set deployment mode to "Incremental"
- [ ] Configure SKU details and pricing model
- [ ] Enable customer usage attribution (if applicable)

### Marketplace Listing
- [ ] Complete offer description and marketing content
- [ ] Upload screenshots of deployment UI
- [ ] Provide support and documentation links
- [ ] Configure categories and search keywords
- [ ] Set up lead management (optional)

### Certification
- [ ] Run Partner Center validation checks
- [ ] Address any ARM-TTK warnings
- [ ] Submit for Microsoft certification
- [ ] Respond to certification feedback (if any)
- [ ] Publish to Azure Marketplace

## 🔧 Customization Guide

### Generate Custom Templates

If the provided configurations don't match your needs, generate custom templates:

```bash
# Install tools
npm install -g @hoiltd/azure-marketplace-generator@^3.1.0
npm install -g @hoiltd/azmp-plugin-vm@^2.1.0

# Create config file (my-config.json)
cat > my-config.json << EOF
{
  "vmName": "my-custom-vm",
  "vmSize": "Standard_D4s_v3",
  "location": "East US",
  "osType": "Linux",
  "osVersion": "22.04-LTS",
  "storageType": "Premium_LRS",
  "enableBackup": true,
  "enableMonitoring": true,
  "dataDisks": [
    {
      "name": "datadisk1",
      "sizeGB": 512,
      "lun": 0,
      "storageType": "Premium_LRS"
    }
  ]
}
EOF

# Generate templates
azmp vm template generate --config my-config.json --output ./custom-templates

# Validate
azmp vm template validate ./custom-templates

# Package
cd custom-templates/
zip -r my-custom-templates.zip mainTemplate.json createUiDefinition.json viewDefinition.json
```

### Available Configuration Options

See the full configuration schema in the plugin documentation:
- VM sizes, OS images, storage options
- Networking (VNET, NSG, Load Balancer, Bastion)
- High availability (Availability Sets, Zones, VMSS)
- Monitoring and alerts
- Backup and disaster recovery
- Security (Trusted Launch, encryption, managed identities)
- Extensions and post-deployment scripts

## 📊 Template Contents

Each package contains:

```
minimal/ or enterprise/
├── mainTemplate.json          # ARM template with all resources
├── createUiDefinition.json    # Azure Portal deployment UI
└── viewDefinition.json        # Managed application views
```

### mainTemplate.json
- ARM template with VM, networking, storage, and optional features
- Parameterized for customization at deployment time
- Compliant with Azure Marketplace requirements (ARM-TTK validated)

### createUiDefinition.json
- Custom Azure Portal deployment wizard
- User-friendly parameter collection
- Validation and default values
- Conditional visibility based on selections

### viewDefinition.json
- Custom views for managed application offers
- Resource monitoring dashboard
- Cost tracking and metrics
- (Optional - not required for non-managed app offers)

## 🔐 Security & Compliance

### ARM-TTK Compliance
- **Status**: 98% (46/47 tests passing)
- **Certification**: Approved for Azure Marketplace
- **Known Issue**: 1 non-critical warning (documented in release notes)

### Security Features
- TrustedLaunch with SecureBoot and vTPM (configurable)
- NSG rules with least-privilege access
- System-assigned managed identity
- Azure Disk Encryption support
- Private networking with Bastion (enterprise)
- Azure Security Center integration

### Testing
- **Automated Tests**: 801 passing
- **Manual QA**: Deployment validated in 3 Azure regions
- **ARM-TTK**: All critical tests passed
- **Partner Center**: Pre-validated for submission

## 📞 Support & Resources

### Documentation
- **Plugin Repository**: https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm
- **Generator Docs**: https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator
- **Release Notes**: See RELEASE_NOTES_v2.1.0.md in plugin repository
- **Integration Guide**: Generator repository docs/

### Getting Help
- **Issues**: https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/issues
- **npm**: https://www.npmjs.com/package/@hoiltd/azmp-plugin-vm
- **Azure Marketplace**: https://azuremarketplace.microsoft.com

### Version Information
- **Plugin Version**: @hoiltd/azmp-plugin-vm@2.1.0
- **Generator Version**: @hoiltd/azure-marketplace-generator@3.1.0
- **Release Date**: October 31, 2025
- **ARM-TTK Version**: Latest (October 2025)

## 📝 License

MIT License - HOME OFFICE IMPROVEMENTS LTD

---

**Note**: These templates are production-ready and have been validated against Azure Marketplace requirements. For custom configurations or enterprise support, please contact HOME OFFICE IMPROVEMENTS LTD.
