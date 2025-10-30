# Azure Marketplace Generator - VM Plugin Integration Guide

**Version**: 2.0.0  
**Last Updated**: October 30, 2025  
**Integration Target**: Azure Marketplace Generator v3.1.0+

---

## 📋 Overview

This guide covers the complete integration of the Azure Marketplace VM Plugin with the Azure Marketplace Generator framework, providing two deployment strategies and comprehensive troubleshooting guidance.

### Integration Architecture

The VM Plugin integrates seamlessly with the main generator through:
- **Plugin System**: Dynamic loading via configuration-based architecture
- **CLI Integration**: Unified command interface through `azmp` CLI
- **Template Engine**: 178 Handlebars helpers for advanced ARM template generation
- **Validation Pipeline**: Integrated ARM-TTK validation and marketplace packaging

---

## 🚀 Setup Strategies

### Strategy 1: Local Development (npm link)

**Use Case**: Development, testing, customization, and rapid iteration

#### Prerequisites
```bash
# Required software
node >= 18.0.0
npm >= 8.0.0
git
PowerShell (for ARM-TTK validation)
```

#### Setup Steps

**1. Clone and Build VM Plugin**
```bash
# Clone the VM plugin repository
git clone https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm.git
cd azmp-plugin-vm

# Checkout the latest release
git checkout v2.0.0

# Install dependencies and build
npm install
npm run build

# Verify build success
ls -la dist/
# Should see: index.js, index.d.ts, templates/, etc.
```

**2. Clone and Setup Main Generator**
```bash
# Clone the main generator repository
git clone https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator.git
cd azure-marketplace-generator

# Install dependencies
npm install
npm run build
```

**3. Link Plugin to Main Generator**
```bash
# From the main generator directory
cd azure-marketplace-generator
npm link ../azmp-plugin-vm

# Verify the link
npm list @hoiltd/azmp-plugin-vm
# Should show: @hoiltd/azmp-plugin-vm@2.0.0 extraneous -> ./../azmp-plugin-vm
```

**4. Configure Plugin Loading**

Create or update `azmp.config.json` in the main generator root:
```json
{
  "plugins": [
    {
      "package": "/absolute/path/to/azmp-plugin-vm/dist",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_D2s_v3",
        "enableDiagnostics": true,
        "enablePublicIP": true
      }
    }
  ]
}
```

**5. Verify Integration**
```bash
# Test plugin loading
node dist/cli/index.js --help
# Should show VM commands in the help output

# Test specific VM commands
node dist/cli/index.js vm --help
# Should show all P1 feature commands

# Verify helper registration
node dist/cli/index.js vm template generate --help
# Should show template generation options
```

---

### Strategy 2: Production Deployment (npm package)

**Use Case**: Production environments, CI/CD pipelines, and stable deployments

#### Prerequisites
```bash
# Required software (same as local)
node >= 18.0.0
npm >= 8.0.0
PowerShell (for ARM-TTK validation)
```

#### Setup Steps

**1. Install Main Generator**
```bash
# Install from npm (when published)
npm install -g @hoiltd/azure-marketplace-generator

# Or clone and build for latest features
git clone https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator.git
cd azure-marketplace-generator
npm install
npm run build
```

**2. Install VM Plugin**
```bash
# Install the VM plugin package (when published to npm)
npm install @hoiltd/azmp-plugin-vm

# Or install from tarball
npm install /path/to/azmp-plugin-vm-2.0.0.tgz
```

**3. Configure Plugin Loading**

Create `azmp.config.json`:
```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_D2s_v3",
        "enableDiagnostics": true,
        "enablePublicIP": true,
        "enableNsg": true
      }
    }
  ]
}
```

**4. Verify Installation**
```bash
# Test global CLI (if installed globally)
azmp vm --help

# Or test local installation
npx azmp vm --help
```

---

## 🎯 CLI Invocation Patterns

### Core Workflow Commands

#### Template Generation
```bash
# Generate VM templates with P1 features
azmp vm template generate \
  --config ./vm-config.json \
  --output ./marketplace-package \
  --verbose

# Validate generated templates
azmp validate ./marketplace-package

# Package for marketplace submission
azmp package ./marketplace-package \
  --output vm-solution-v1.0.zip
```

#### P1 Feature Configuration Commands

```bash
# P1-1: Configure disk types
azmp vm configure-disk-types \
  --storage-type Premium_LRS \
  --data-disks 2 \
  --config ./vm-config.json

# P1-2: Configure backup
azmp vm configure-backup \
  --enable-backup \
  --backup-policy Enhanced \
  --vault-name MyVMBackupVault

# P1-3: Configure data disks
azmp vm configure-data-disks \
  --disk-count 3 \
  --disk-size 512 \
  --storage-type Premium_LRS

# P1-4: Configure monitoring
azmp vm configure-monitoring \
  --enable-monitoring \
  --preset Production \
  --email admin@company.com

# P1-5: Configure hybrid benefit
azmp vm configure-hybrid-benefit \
  --license-type AHUB \
  --os-type Windows

# P1-6: Run certification
azmp vm run-certification \
  --vhd-path ./vm-image.vhd \
  --output ./certification-report
```

### Configuration File Patterns

#### Basic VM Configuration
```json
{
  "vmName": "myvm",
  "vmSize": "Standard_D4s_v3",
  "location": "East US",
  "osType": "Linux",
  "osVersion": "22.04-LTS",
  "adminUsername": "",
  "authenticationType": "sshPublicKey",
  "storageType": "Premium_LRS",
  "createPublicIP": true,
  "createNSG": true,
  "subnetAddressPrefix": "10.0.1.0/24"
}
```

#### Advanced Configuration with All P1 Features
```json
{
  "vmName": "enterprise-vm",
  "vmSize": "Standard_D8s_v3",
  "location": "East US",
  "osType": "Windows",
  "osVersion": "2022-datacenter",
  "adminUsername": "",
  "authenticationType": "password",
  
  "storageType": "Premium_LRS",
  "enableBackup": true,
  "backupPolicyType": "Enhanced",
  "backupVaultName": "EnterpriseBackupVault",
  
  "dataDisks": [
    {
      "name": "datadisk1",
      "sizeGB": 512,
      "lun": 0,
      "storageType": "Premium_LRS"
    },
    {
      "name": "datadisk2", 
      "sizeGB": 1024,
      "lun": 1,
      "storageType": "Premium_LRS"
    }
  ],
  
  "enableMonitoring": true,
  "monitoringPreset": "Production",
  "monitoringEmail": "alerts@company.com",
  
  "enableHybridBenefit": true,
  "licenseType": "AHUB",
  
  "createPublicIP": false,
  "createNSG": true,
  "createBastion": true,
  "subnetAddressPrefix": "10.0.1.0/24",
  "bastionSubnetAddressPrefix": "10.0.2.0/27"
}
```

---

## 🔧 Plugin Configuration Options

### Core Plugin Options

```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",
      "enabled": true,
      "options": {
        // Default VM settings
        "defaultVmSize": "Standard_D2s_v3",
        "defaultLocation": "East US",
        "defaultOsType": "Linux",
        
        // Feature defaults
        "enableDiagnostics": true,
        "enablePublicIP": true,
        "enableNsg": true,
        "enableMonitoring": false,
        "enableBackup": false,
        
        // Advanced options
        "allowCustomImages": true,
        "allowSpotInstances": false,
        "enforceNamingConventions": true,
        
        // Template generation
        "templateVersion": "2019-04-01",
        "includeMetadata": true,
        "optimizeForMarketplace": true
      }
    }
  ]
}
```

### Environment-Specific Configurations

#### Development Environment
```json
{
  "plugins": [
    {
      "package": "/path/to/local/azmp-plugin-vm/dist",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_B2s",
        "enableDiagnostics": true,
        "enablePublicIP": true,
        "allowSpotInstances": true,
        "enforceNamingConventions": false
      }
    }
  ]
}
```

#### Production Environment
```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_D4s_v3",
        "enableDiagnostics": true,
        "enablePublicIP": false,
        "enableNsg": true,
        "enableMonitoring": true,
        "enableBackup": true,
        "allowSpotInstances": false,
        "enforceNamingConventions": true,
        "optimizeForMarketplace": true
      }
    }
  ]
}
```

---

## 🛠️ Troubleshooting Guide

### Plugin Loading Issues

#### Problem: "Plugin not found" error
```
❌ Failed to load plugin '@hoiltd/azmp-plugin-vm': npm package not found
```

**Solutions:**
```bash
# 1. Verify package installation
npm list @hoiltd/azmp-plugin-vm

# 2. Check npm link status (local development)
npm list -g --depth=0 | grep azmp-plugin-vm

# 3. Reinstall package
npm uninstall @hoiltd/azmp-plugin-vm
npm install @hoiltd/azmp-plugin-vm

# 4. For local development, re-establish link
cd /path/to/azmp-plugin-vm
npm link
cd /path/to/azure-marketplace-generator  
npm link @hoiltd/azmp-plugin-vm
```

#### Problem: "Plugin failed to initialize" error
```
❌ Plugin 'vm' failed to initialize: TypeError: Cannot read properties
```

**Solutions:**
```bash
# 1. Check Node.js version compatibility
node --version
# Must be >= 18.0.0

# 2. Verify plugin build
cd /path/to/azmp-plugin-vm
npm run build
ls -la dist/index.js

# 3. Check configuration syntax
node -c azmp.config.json

# 4. Test plugin standalone
cd /path/to/azmp-plugin-vm
node dist/index.js --version
```

### Configuration Issues

#### Problem: Commands not available
```
❌ Unknown command 'vm'
```

**Solutions:**
```bash
# 1. Verify plugin is enabled in config
cat azmp.config.json | grep enabled

# 2. Check plugin loading logs
node dist/cli/index.js --verbose vm --help

# 3. Verify plugin path
node -e "console.log(require.resolve('@hoiltd/azmp-plugin-vm'))"

# 4. Test with absolute path
# Update azmp.config.json to use absolute path temporarily
```

#### Problem: Configuration validation errors
```
❌ Invalid configuration: Missing required property 'vmName'
```

**Solutions:**
```bash
# 1. Validate JSON syntax
node -c vm-config.json

# 2. Check required fields
cat vm-config.json | jq '.vmName, .vmSize, .location'

# 3. Use example configuration as baseline
cp /path/to/examples/basic-vm-config.json ./vm-config.json

# 4. Enable verbose logging for detailed error messages
node dist/cli/index.js vm template generate --config ./vm-config.json --verbose
```

### Template Generation Issues

#### Problem: Template compilation errors
```
❌ Handlebars compilation failed: Missing helper 'vmSize'
```

**Solutions:**
```bash
# 1. Verify helpers are registered
node dist/cli/index.js --verbose | grep "Registering.*helper"
# Should show: "Registering 178 helper(s) from plugin 'vm'"

# 2. Check template source
ls -la /path/to/azmp-plugin-vm/dist/templates/

# 3. Rebuild plugin templates
cd /path/to/azmp-plugin-vm
npm run copy:templates

# 4. Test with minimal configuration
echo '{"vmName":"test","vmSize":"Standard_B1s","location":"East US"}' > minimal-config.json
node dist/cli/index.js vm template generate --config minimal-config.json --output test-output
```

#### Problem: ARM-TTK validation failures
```
❌ Validation failed - 8 errors found
```

**Solutions:**
```bash
# 1. Generate detailed validation report
node dist/cli/index.js validate ./output --save-report ./validation-report.json

# 2. Check PowerShell availability (required for ARM-TTK)
pwsh --version

# 3. Install ARM-TTK if missing
npm run install-arm-ttk

# 4. Review common validation issues
# - Parameter synchronization between createUiDefinition and mainTemplate
# - API version updates needed
# - Unused parameters/variables cleanup required
```

### Common Configuration Mismatches

#### Problem: VM size not available in region
```
⚠️ Warning: VM size 'Standard_D64s_v3' may not be available in 'West Europe'
```

**Solutions:**
```bash
# 1. Check available VM sizes for region
azmp vm list-sizes --location "West Europe"

# 2. Use region-appropriate sizes
# Standard_D2s_v3, Standard_D4s_v3 are widely available

# 3. Configure region-specific defaults in plugin options
```

#### Problem: Storage type incompatibility
```
❌ Error: Premium storage not supported for VM size 'Standard_A1'
```

**Solutions:**
```bash
# 1. Use compatible VM sizes for Premium storage
# Standard_DS*, Standard_FS*, Standard_GS* series support Premium

# 2. Or use Standard storage for basic VM sizes
# Update configuration: "storageType": "Standard_LRS"

# 3. Check compatibility with validation command
azmp vm configure-disk-types --vm-size Standard_A1 --storage-type Premium_LRS --dry-run
```

---

## 📚 Reference Documentation

### Available Commands Reference

#### Template Management
- `azmp vm template generate` - Generate ARM templates
- `azmp vm template validate` - Validate template syntax
- `azmp vm template test` - Test template deployment

#### P1 Feature Commands
- `azmp vm configure-disk-types` - P1-1: Disk type configuration
- `azmp vm configure-backup` - P1-2: Backup auto-enable
- `azmp vm configure-data-disks` - P1-3: Data disk support
- `azmp vm configure-monitoring` - P1-4: Monitoring & alerts
- `azmp vm configure-hybrid-benefit` - P1-5: Hybrid benefit
- `azmp vm run-certification` - P1-6: Certification tooling

#### Utility Commands
- `azmp vm list-sizes` - List available VM sizes
- `azmp vm list-images` - List popular VM images
- `azmp vm validate-credentials` - Test Azure credentials
- `azmp validate` - Run ARM-TTK validation
- `azmp package` - Create marketplace package

### Plugin Integration API

#### Plugin Interface
```typescript
interface IPlugin {
  metadata: PluginMetadata;
  initialize(context: PluginContext): Promise<void>;
  getTemplates(): TemplateDefinition[];
  getHandlebarsHelpers(): Record<string, Function>;
  registerCommands(program: Command): void;
}
```

#### Context Object
```typescript
interface PluginContext {
  logger: {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
  };
  options: Record<string, any>;
}
```

---

## 🔗 Additional Resources

### Documentation Links
- [VM Plugin Repository](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm)
- [Azure Marketplace Generator](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator)
- [Release Notes v2.0.0](./RELEASE_NOTES_v2.0.0.md)
- [P1 Features Breakdown](./docs/P1_FEATURES_BREAKDOWN.md)

### Example Configurations
- [Basic VM Configuration](./examples/basic-vm-config.json)
- [Enterprise VM Configuration](./examples/enterprise-vm-config.json)
- [Development Environment Setup](./examples/dev-config.json)
- [Production Environment Setup](./examples/prod-config.json)

### Support Channels
- **Issues**: [GitHub Issues](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator/discussions)
- **Documentation**: [Project Wiki](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator/wiki)

---

**Last Updated**: October 30, 2025  
**Plugin Version**: v2.0.0  
**Integration Status**: Production Ready MVP