# @hoiltd/azmp-plugin-vm

Comprehensive Virtual Machine plugin for Azure Marketplace Generator with advanced networking, extensions, security, and identity features.

[![Version](https://img.shields.io/npm/v/@hoiltd/azmp-plugin-vm.svg)](https://www.npmjs.com/package/@hoiltd/azmp-plugin-vm)
[![License](https://img.shields.io/npm/l/@hoiltd/azmp-plugin-vm.svg)](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/blob/main/LICENSE)

## Features

- 🖥️ **VM Configuration** - 40+ VM sizes, 20+ OS images, storage configuration
- 🌐 **Advanced Networking** - VNets, subnets, NSGs, load balancers, Application Gateway, Bastion, VNet peering
- 🔌 **VM Extensions** - 20 extensions (Windows, Linux, cross-platform)
- 🔒 **Security** - Disk encryption (ADE, SSE, Encryption at Host), Trusted Launch
- 🔐 **Identity & Access** - Managed Identity, Azure AD integration, RBAC
- ⚡ **High Availability** - Availability Sets, Availability Zones, VMSS with SLA calculations
- 🔁 **Disaster Recovery** - Azure Backup, Site Recovery, Snapshots with retention policies
- 📈 **Enterprise Scaling** - VMSS (Uniform/Flexible), Auto-scaling (metric/schedule), Multi-region with Traffic Manager, Load Balancing (Standard LB, App Gateway v2)
- 📜 **Compliance** - SOC 2, PCI-DSS, HIPAA, ISO 27001, NIST 800-53, FedRAMP
- 🎨 **170+ Handlebars Helpers** - Comprehensive template generation (50+ scaling/HA/DR helpers)
- 💻 **44 CLI Commands** - Rich command-line interface (12 new HA/DR commands)

## Installation

```bash
npm install @hoiltd/azmp-plugin-vm
```

## Quick Start

### Using with Generator CLI

Add to your `azmp-config.json`:

```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_D2s_v3",
        "includeDiagnostics": true,
        "includePublicIp": true,
        "security": {
          "enableTrustedLaunch": true,
          "enableDiskEncryption": true
        },
        "identity": {
          "type": "SystemAssigned"
        }
      }
    }
  ]
}
```

### Programmatic Usage

**CommonJS:**

```javascript
const { VmPlugin } = require("@hoiltd/azmp-plugin-vm");

const plugin = new VmPlugin({
  defaultVmSize: "Standard_D2s_v3",
  includeDiagnostics: true,
});

// Initialize with context
await plugin.initialize({
  logger: console,
  generatorVersion: "3.1.0",
  templatesDir: "./templates",
  outputDir: "./output",
  config: {},
});

// Get available templates
const templates = plugin.getTemplates();

// Register CLI commands
const { Command } = require("commander");
const program = new Command();
plugin.registerCommands(program);
```

**ES Modules:**

```javascript
import { VmPlugin } from "@hoiltd/azmp-plugin-vm";

const plugin = new VmPlugin({
  defaultVmSize: "Standard_D2s_v3",
  includeDiagnostics: true,
});

await plugin.initialize({
  logger: console,
  generatorVersion: "3.1.0",
  templatesDir: "./templates",
  outputDir: "./output",
  config: {},
});
```

## 🔒 Security by Default (v1.8.0)

**Trusted Launch is now enabled by default** for enhanced VM security:

- ✅ **Secure Boot** - Protects against rootkits and bootkits
- ✅ **vTPM** - Virtual Trusted Platform Module for measured boot
- ✅ **Zero Configuration** - Works automatically with Generation 2 VMs
- ✅ **Compliance Ready** - Meets requirements for security frameworks

[📖 Read more about Trusted Launch enhancement →](docs/v1.8.0/TRUSTED_LAUNCH_ENHANCEMENT.md)

## 🚀 v1.9.0: Performance, Security & Diagnostics

Three high-impact features for production workloads:

### **Accelerated Networking** ⚡

- **SR-IOV** for up to 30 Gbps network throughput
- Significantly reduced latency and jitter
- Ideal for: HPC, databases, high-throughput applications
- Auto-enabled for supported VM sizes

```json
{
  "enableAcceleratedNetworking": true
}
```

### **Trusted Launch** 🔒

- **Secure Boot**: Validates boot chain integrity
- **vTPM**: Enables attestation and BitLocker encryption
- Protection against boot kits, rootkits, kernel malware
- Required for: Zero-trust architectures, compliance frameworks
- Requires: Generation 2 VM images

```json
{
  "securityType": "TrustedLaunch",
  "secureBootEnabled": true,
  "vTpmEnabled": true
}
```

### **Boot Diagnostics** 🔧

- Serial console output capture
- Boot screenshot for visual troubleshooting
- Essential for: Kernel panics, boot failures, rapid incident resolution
- Managed storage (no config needed) or custom storage account

```json
{
  "bootDiagnosticsEnabled": true,
  "bootDiagnosticsStorageUri": "" // Empty = managed storage
}
```

**Example Configurations:**

- [`examples/trusted-launch-config.json`](examples/trusted-launch-config.json) - Full security baseline
- [`examples/accelerated-networking-config.json`](examples/accelerated-networking-config.json) - High-performance networking
- [`examples/boot-diagnostics-config.json`](examples/boot-diagnostics-config.json) - Enhanced supportability

## 💰 v1.10.0: Cost Optimization & Resource Efficiency

Two powerful features to reduce Azure spending:

### **Ephemeral OS Disks** 💨

- **30-40% faster** VM provisioning (no remote disk writes)
- **Lower storage costs** - no persistent OS disk charges
- Uses local VM cache or temp storage (no Azure Storage overhead)
- Ideal for: Stateless workloads, CI/CD agents, scale sets, dev/test
- Requires: Premium_LRS or StandardSSD_LRS, supported VM sizes

```json
{
  "useEphemeralOSDisk": true,
  "ephemeralDiskPlacement": "CacheDisk" // or "ResourceDisk"
}
```

**Placement Options:**

- `CacheDisk`: Uses VM cache (most common, better performance)
- `ResourceDisk`: Uses temporary storage disk (for VMs with limited cache)

### **Auto-Shutdown Schedules** ⏰

- **Up to 70% cost savings** on dev/test VMs
- Automatic daily shutdown with configurable time & timezone
- Email notifications 30 minutes before shutdown
- Zero compute charges when stopped (still pays for storage)
- DevTest Labs integration - no custom scripts needed

```json
{
  "enableAutoShutdown": true,
  "autoShutdownTime": "1900", // 7:00 PM in 24-hour format
  "autoShutdownTimeZone": "Pacific Standard Time",
  "autoShutdownNotificationEmail": "devteam@example.com"
}
```

**Common Time Zones:**

- `UTC` - Coordinated Universal Time
- `Pacific Standard Time` - US West Coast
- `Eastern Standard Time` - US East Coast
- `GMT Standard Time` - London
- `Central European Standard Time` - Paris, Berlin

**Example Configurations:**

- [`examples/ephemeral-disk-config.json`](examples/ephemeral-disk-config.json) - Fast provisioning with ephemeral disks
- [`examples/auto-shutdown-config.json`](examples/auto-shutdown-config.json) - Dev/test cost savings
- [`examples/full-cost-optimization-config.json`](examples/full-cost-optimization-config.json) - Combined cost controls

## CLI Commands

### Core VM Commands (6 commands)

```bash
# Create a VM marketplace offer
azmp create vm --name myvm --location eastus

# List available VM sizes
azmp vm list-sizes --location eastus

# List VM size families
azmp vm list-families

# Get specific VM size details
azmp vm get-size --size Standard_D2s_v3

# List available OS images
azmp vm list-images --os-type linux

# Get specific OS image details
azmp vm get-image --publisher Canonical --offer UbuntuServer --sku 22.04-LTS

# Validate VM configuration
azmp validate vm --config myvm-config.json
```

### Networking Commands (10 commands)

```bash
# List VNet templates
azmp vm network list-vnet-templates --type hub

# List subnet patterns
azmp vm network list-subnet-patterns --search web

# List service endpoints
azmp vm network list-service-endpoints

# List NSG rules
azmp vm network list-nsg-rules --port 443

# List NSG templates
azmp vm network list-nsg-templates --tier web

# List load balancer templates
azmp vm network list-lb-templates --type internal

# List health probes
azmp vm network list-health-probes --protocol https

# List Application Gateway templates
azmp vm network list-appgw-templates --waf-enabled

# List Bastion templates
azmp vm network list-bastion-templates --sku standard

# List VNet peering templates
azmp vm network list-peering-templates --topology hub-spoke
```

### Extension Commands (4 commands)

```bash
# List all VM extensions
azmp vm ext

# List Windows extensions
azmp vm ext list-windows

# List Linux extensions
azmp vm ext list-linux

# List cross-platform extensions
azmp vm ext list-crossplatform
```

### Security Commands (4 commands)

```bash
# List all security features
azmp vm security list

# List encryption types
azmp vm security list-encryption

# List Trusted Launch features
azmp vm security list-trusted-launch

# List compliance frameworks
azmp vm security list-compliance
```

### Identity Commands (4 commands)

```bash
# List all identity features
azmp vm identity list

# List managed identity types
azmp vm identity list-managed-identity

# List Azure AD features
azmp vm identity list-aad-features

# List RBAC roles
azmp vm identity list-rbac-roles
```

### Availability Commands (5 commands)

```bash
# List availability zones for a region
azmp availability list-zones --region eastus

# Check if region supports availability zones
azmp availability check-zone-support --region westus

# Calculate SLA for availability configuration
azmp availability calculate-sla --type zone
azmp availability calculate-sla --type set
azmp availability calculate-sla --type vmss --orchestration Flexible

# Recommend high availability configuration
azmp availability recommend-config --vm-count 3 --criticality high
```

### Recovery Commands (7 commands)

```bash
# Estimate backup storage requirements
azmp recovery estimate-backup --vm-size 128 --change-rate 0.05 --retention 30

# List Azure region pairs for disaster recovery
azmp recovery list-region-pairs
azmp recovery list-region-pairs --region eastus

# Estimate Recovery Time Objective
azmp recovery estimate-rto --vm-count 5 --avg-size 128

# List backup policy presets
azmp recovery list-backup-presets

# List snapshot retention policies
azmp recovery list-snapshot-policies

# Recommend snapshot schedule based on workload
azmp recovery recommend-snapshot-schedule --criticality high --change-frequency medium
```

## Configuration Options

| Option                            | Type    | Default           | Description                                                                                         |
| --------------------------------- | ------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `defaultVmSize`                   | string  | `Standard_D2s_v3` | Default VM size                                                                                     |
| `includeDiagnostics`              | boolean | `true`            | Include boot diagnostics                                                                            |
| `includePublicIp`                 | boolean | `true`            | Create public IP address                                                                            |
| `includeNsg`                      | boolean | `true`            | Create Network Security Group                                                                       |
| `enableAcceleratedNetworking`     | boolean | `true`            | Enable SR-IOV for up to 30 Gbps throughput (requires supported VM size)                             |
| `bootDiagnosticsEnabled`          | boolean | `true`            | Enable boot diagnostics for troubleshooting (serial console + screenshots)                          |
| `bootDiagnosticsStorageUri`       | string  | -                 | Custom storage URI for boot diagnostics (leave empty for managed storage)                           |
| `securityType`                    | string  | `TrustedLaunch`   | Security type: `TrustedLaunch`, `Standard` (requires Gen2 VM images)                                |
| `secureBootEnabled`               | boolean | `true`            | Enable UEFI Secure Boot (requires TrustedLaunch security type)                                      |
| `vTpmEnabled`                     | boolean | `true`            | Enable virtual TPM device (requires TrustedLaunch security type)                                    |
| `useEphemeralOSDisk`              | boolean | `false`           | Use ephemeral OS disk for faster provisioning and lower cost (requires Premium_LRS/StandardSSD_LRS) |
| `ephemeralDiskPlacement`          | string  | `CacheDisk`       | Ephemeral disk placement: `CacheDisk` (VM cache) or `ResourceDisk` (temp storage)                   |
| `enableAutoShutdown`              | boolean | `false`           | Enable automatic shutdown schedule for cost savings (recommended for dev/test)                      |
| `autoShutdownTime`                | string  | `1900`            | Daily shutdown time in 24-hour format (e.g., 1900 for 7:00 PM)                                      |
| `autoShutdownTimeZone`            | string  | `UTC`             | Time zone for shutdown schedule (e.g., 'Pacific Standard Time', 'UTC')                              |
| `autoShutdownNotificationEmail`   | string  | -                 | Email address for shutdown notifications (optional, sends alert 30 min before)                      |
| `security.enableTrustedLaunch`    | boolean | `true`            | Enable Trusted Launch (Gen 2 VMs) **Default: ON**                                                   |
| `security.enableDiskEncryption`   | boolean | `false`           | Enable Azure Disk Encryption                                                                        |
| `security.encryptionType`         | string  | `ade`             | Encryption type: `ade`, `sse-pmk`, `sse-cmk`, `encryption-at-host`                                  |
| `identity.type`                   | string  | `None`            | Identity type: `SystemAssigned`, `UserAssigned`, `SystemAssigned,UserAssigned`, `None`              |
| `identity.userAssignedIdentityId` | string  | -                 | User-assigned identity resource ID                                                                  |

## Handlebars Helpers

### Core VM Helpers (3 helpers)

#### `vmSize`

Get VM size configuration with details.

```handlebars
{{vmSize "Standard_D2s_v3"}}
<!-- Returns: { name: "Standard_D2s_v3", cores: 2, memory: 8, ... } -->
```

#### `vmImage`

Get VM image reference for OS deployment.

```handlebars
{{vmImage "Ubuntu" "22.04-LTS"}}
<!-- Returns: { publisher: "Canonical", offer: "0001-com-ubuntu-server-jammy", ... } -->
```

#### `vmStorage`

Get storage configuration for disks.

```handlebars
{{vmStorage "Premium_LRS" "ReadWrite"}}
<!-- Returns: { storageAccountType: "Premium_LRS", caching: "ReadWrite" } -->
```

### Networking Helpers (57 helpers)

#### VNet & Subnet Helpers (23 helpers)

```handlebars
<!-- Get VNet template -->
{{vnet-template "hub"}}

<!-- Get VNet address space -->
{{vnet-address-space "10.0.0.0/16"}}

<!-- Get service endpoints -->
{{vnet-service-endpoints "Microsoft.Storage" "Microsoft.KeyVault"}}

<!-- Get subnet pattern -->
{{subnet-pattern "web"}}

<!-- Calculate usable IPs -->
{{subnet-calculate-ips "10.0.1.0/24"}}
<!-- Returns: { total: 256, usable: 251, reserved: 5 } -->

<!-- Validate CIDR -->
{{subnet-validate-cidr "10.0.0.0/16"}}

<!-- Check subnet overlap -->
{{subnet-overlaps "10.0.1.0/24" "10.0.2.0/24"}}
```

#### NSG Helpers (14 helpers)

```handlebars
<!-- Get security rule -->
{{nsg-rule "allow-https"}}

<!-- Get NSG template -->
{{nsg-template "web"}}

<!-- Validate priority -->
{{nsg-validate-priority 100}}

<!-- Get service tag -->
{{nsg-service-tag "Internet"}}

<!-- Create custom rule -->
{{nsg-create-rule
  name="allow-app"
  priority=200
  direction="Inbound"
  access="Allow"
  protocol="Tcp"
  sourceAddressPrefix="10.0.1.0/24"
  destinationPortRange="8080"
}}
```

#### Load Balancer Helpers (17 helpers)

```handlebars
<!-- Get load balancer template -->
{{lb-template "internal"}}

<!-- Get health probe -->
{{lb-health-probe "http"}}

<!-- Get load balancing rule -->
{{lb-rule "web-http"}}

<!-- Get NAT rule -->
{{lb-nat-rule "rdp"}}

<!-- Validate probe interval -->
{{lb-validate-probe-interval 15 2}}
```

#### Application Gateway Helpers (10 helpers)

```handlebars
<!-- Get Application Gateway template -->
{{appgw-template "waf-enabled"}}

<!-- Get HTTP settings -->
{{appgw-http-settings "default"}}

<!-- Get listener configuration -->
{{appgw-listener "https"}}

<!-- Get URL path map -->
{{appgw-url-path-map "/api" "api-backend"}}

<!-- Validate capacity -->
{{appgw-validate-capacity 2 10}}
```

#### Bastion Helpers (9 helpers)

```handlebars
<!-- Get Bastion template -->
{{bastion-template "standard"}}

<!-- Get feature configuration -->
{{bastion-feature "tunneling"}}

<!-- Check feature availability -->
{{bastion-feature-available "file-copy" "Premium"}}

<!-- Get recommended scale units -->
{{bastion-recommended-scale 100}}
<!-- Returns: 5 scale units for 100 concurrent sessions -->
```

#### VNet Peering Helpers (9 helpers)

```handlebars
<!-- Get peering template -->
{{peering-template "hub-spoke"}}

<!-- Get hub-and-spoke topology -->
{{peering-hub-spoke "single-hub" 3}}

<!-- Get peering scenario -->
{{peering-scenario "dev-prod-isolation"}}

<!-- Calculate mesh connections -->
{{peering-mesh-count 5}}
<!-- Returns: 10 connections for 5 VNets -->
```

### Extension Helpers (26 helpers, `ext:` namespace)

```handlebars
<!-- Windows Extensions -->
{{ext:windows "CustomScript"}}
{{ext:windows "DSC"}}
{{ext:windows "IIS"}}
{{ext:windows "Antimalware"}}
{{ext:windows "DomainJoin"}}
{{ext:windows "KeyVault"}}
{{ext:windows "BGInfo"}}
{{ext:windows "Chef"}}

<!-- Linux Extensions -->
{{ext:linux "CustomScript"}}
{{ext:linux "CloudInit"}}
{{ext:linux "Docker"}}
{{ext:linux "AADSSHLogin"}}
{{ext:linux "NetworkWatcher"}}
{{ext:linux "Diagnostics"}}
{{ext:linux "Backup"}}

<!-- Cross-Platform Extensions -->
{{ext:crossplatform "AzureMonitor"}}
{{ext:crossplatform "DependencyAgent"}}
{{ext:crossplatform "GuestConfiguration"}}
{{ext:crossplatform "ApplicationHealth"}}
{{ext:crossplatform "DiskEncryption"}}

<!-- Utility Helpers -->
{{ext:list "windows"}}
<!-- List extensions by platform -->
{{ext:template "CustomScript"}}
<!-- Get extension template -->
{{ext:count "linux"}}
<!-- Count extensions -->
{{ext:filter-by-feature "monitoring"}}
<!-- Filter by feature -->
{{ext:dependencies "Docker"}}
<!-- Get extension dependencies -->
{{ext:multi-extension "AzureMonitor" "DependencyAgent"}}
<!-- Combine extensions -->

<!-- Generate CustomScript Extension -->
{{ext:script
  platform="linux"
  scriptUrl="https://example.com/setup.sh"
  commandToExecute="bash setup.sh"
}}

<!-- Generate Domain Join Extension -->
{{ext:domain-join
  domain="contoso.com"
  ouPath="OU=Servers,DC=contoso,DC=com"
  user="admin@contoso.com"
}}

<!-- Generate Antimalware Extension -->
{{ext:antimalware realtimeProtection=true scheduledScan=true scanType="Quick"}}

<!-- Generate Docker Extension -->
{{ext:docker
  dockerComposeYml="version: '3'\nservices:\n  web:\n    image: nginx"
}}

<!-- Generate Azure Monitor Agent -->
{{ext:monitor workspaceId="workspace-id" workspaceKey="workspace-key"}}
```

### Security Helpers (26 helpers, `security:` namespace)

#### Encryption Helpers

```handlebars
<!-- Azure Disk Encryption (ADE) -->
{{security:ade
  keyVaultResourceId="/subscriptions/.../Microsoft.KeyVault/vaults/mykeyvault"
  keyVaultUrl="https://mykeyvault.vault.azure.net/"
  volumeType="All"
}}

<!-- Server-Side Encryption with Platform-Managed Keys -->
{{security:sse-pmk}}

<!-- Server-Side Encryption with Customer-Managed Keys -->
{{security:sse-cmk
  keyVaultResourceId="/subscriptions/.../Microsoft.KeyVault/vaults/mykeyvault"
  keyUrl="https://mykeyvault.vault.azure.net/keys/mykey/version"
}}

<!-- Encryption at Host -->
{{security:encryption-at-host}}
```

#### Trusted Launch Helpers

```handlebars
<!-- Complete Trusted Launch configuration -->
{{security:trusted-launch}}

<!-- Individual Trusted Launch features -->
{{security:secure-boot}}
<!-- Secure Boot -->
{{security:vtpm}}
<!-- Virtual TPM -->
{{security:boot-integrity}}
<!-- Boot Integrity Monitoring -->
{{security:guest-attestation}}
<!-- Guest Attestation Extension -->
{{security:defender}}
<!-- Microsoft Defender integration -->
```

#### Security Template Helpers

```handlebars
<!-- Get security template -->
{{security:template "maximum-security"}}
{{security:template "basic-security"}}
{{security:template "enhanced-security"}}

<!-- Get compliance framework template -->
{{security:compliance "SOC2"}}
{{security:compliance "PCI-DSS"}}
{{security:compliance "HIPAA"}}
{{security:compliance "ISO-27001"}}
{{security:compliance "NIST"}}
{{security:compliance "FedRAMP"}}

<!-- List security features -->
{{security:list}}
{{security:list "encryption"}}
{{security:list "trusted-launch"}}

<!-- Count security features -->
{{security:count "encryption"}}
<!-- Returns: 3 -->
{{security:count "trusted-launch"}}
<!-- Returns: 5 -->

<!-- Validate security configuration -->
{{security:validate config}}

<!-- Get security recommendations -->
{{security:recommend "high-security"}}
{{security:recommend "compliance"}}
{{security:recommend "basic"}}
```

### Identity Helpers (33 helpers, `identity:` namespace)

#### Managed Identity Helpers (7 helpers)

```handlebars
<!-- System-assigned identity -->
{{identity:managedidentity.systemAssigned}}

<!-- User-assigned identity -->
{{identity:managedidentity.userAssigned
  identityId="/subscriptions/.../Microsoft.ManagedIdentity/userAssignedIdentities/myidentity"
}}

<!-- Multiple identities (hybrid) -->
{{identity:managedidentity.multiple
  userIdentityIds=(array
    "/subscriptions/.../userAssignedIdentities/identity1"
    "/subscriptions/.../userAssignedIdentities/identity2"
  )
}}

<!-- Create managed identity resource -->
{{identity:managedidentity.create
  name="myidentity"
  location="eastus"
  tags=(object name="Environment" value="Production")
}}

<!-- Get identity recommendations -->
{{identity:managedidentity.recommendations "key-vault"}}
{{identity:managedidentity.recommendations "storage"}}
{{identity:managedidentity.recommendations "sql"}}
{{identity:managedidentity.recommendations "multi-service"}}

<!-- Validate identity configuration -->
{{identity:managedidentity.validate config}}

<!-- Create role assignment -->
{{identity:managedidentity.roleAssignment
  principalId="identity-principal-id"
  roleDefinitionId="built-in-role-id"
  scope="/subscriptions/.../resourceGroups/myrg"
}}
```

#### Azure AD Helpers (8 helpers)

```handlebars
<!-- AAD SSH Login for Linux -->
{{identity:azuread.sshLogin}}

<!-- AAD RDP Login for Windows -->
{{identity:azuread.windowsLogin}}

<!-- Conditional Access policy -->
{{identity:azuread.conditionalAccess
  requireMfa=true
  requireCompliantDevice=true
  allowedLocations=(array "US" "EU")
}}

<!-- MFA configuration -->
{{identity:azuread.mfa methods=(array "phone" "authenticator") required=true}}

<!-- Passwordless authentication -->
{{identity:azuread.passwordless methods=(array "fido2" "windowsHello")}}

<!-- VM access role -->
{{identity:azuread.vmAccessRole "administrator"}}
{{identity:azuread.vmAccessRole "user"}}

<!-- Create complete AAD integration -->
{{identity:azuread.create
  platform="linux"
  features=(array "sshLogin" "mfa" "conditionalAccess")
}}

<!-- Validate AAD configuration -->
{{identity:azuread.validate config}}
```

#### RBAC Helpers (13 helpers)

```handlebars
<!-- Assign built-in role -->
{{identity:rbac.assignBuiltInRole
  principalId="identity-principal-id"
  roleName="Contributor"
  scopeType="resourceGroup"
  scopeId="myrg"
}}

<!-- Create custom role -->
{{identity:rbac.createCustomRole
  name="VM Operator"
  description="Can start and stop VMs"
  actions=(array
    "Microsoft.Compute/virtualMachines/start/action"
    "Microsoft.Compute/virtualMachines/powerOff/action"
  )
  assignableScopes=(array "/subscriptions/sub-id")
}}

<!-- Generate scope string -->
{{identity:rbac.scope "resourceGroup" "myrg"}}
{{identity:rbac.scope "subscription" "sub-id"}}
{{identity:rbac.scope "resource" "myvm"}}

<!-- Role assignment template -->
{{identity:rbac.template assignment}}

<!-- Recommend role based on required actions -->
{{identity:rbac.recommend
  requiredActions=(array
    "Microsoft.Storage/storageAccounts/read"
    "Microsoft.Storage/storageAccounts/listKeys/action"
  )
}}

<!-- Pre-built custom role templates -->
{{identity:rbac.vmStartStopOperator}}
<!-- VM Start/Stop Operator -->
{{identity:rbac.vmBackupOperator}}
<!-- VM Backup Operator -->
{{identity:rbac.vmNetworkConfigurator}}
<!-- VM Network Configurator -->
{{identity:rbac.vmMonitorReader}}
<!-- VM Monitor Reader -->
{{identity:rbac.vmExtensionManager}}
<!-- VM Extension Manager -->

<!-- Validate RBAC configuration -->
{{identity:rbac.validate assignment}}

<!-- Get RBAC best practices -->
{{identity:rbac.bestPractices}}

<!-- Get built-in role details -->
{{identity:rbac.builtInRole "Contributor"}}
```

#### Identity Utility Helpers (5 helpers)

```handlebars
<!-- List identity features -->
{{identity:list}}
{{identity:list "managed-identity"}}
{{identity:list "azure-ad"}}
{{identity:list "rbac"}}

<!-- Get identity template -->
{{identity:template "system-assigned-identity"}}
{{identity:template "aad-ssh-login"}}
{{identity:template "rbac-least-privilege"}}
{{identity:template "compliance-soc2"}}

<!-- Count identity features -->
{{identity:count "managed-identity"}}
<!-- Returns: 3 types -->
{{identity:count "azure-ad"}}
<!-- Returns: 7 features -->
{{identity:count "rbac"}}
<!-- Returns: 20+ roles -->

<!-- Filter identity features by capability -->
{{identity:filterByFeature "passwordless"}}

<!-- Get compliance template -->
{{identity:compliance "SOC2"}}
{{identity:compliance "HIPAA"}}
```

### Scaling & High Availability Helpers (14 helpers, `scale:` namespace)

#### VMSS (Virtual Machine Scale Sets) Helpers (1 helper)

```handlebars
<!-- Create VMSS definition -->
{{scale:vmss.definition
  name="webVmss"
  orchestrationMode="Flexible"
  upgradeMode="Rolling"
  instanceCount=3
  vmSize="Standard_D2s_v3"
  osType="Linux"
  imagePublisher="Canonical"
  imageOffer="0001-com-ubuntu-server-jammy"
  imageSku="22_04-lts-gen2"
  adminUsername="azureuser"
  authenticationType="password"
  enableAutoOsUpgrade=true
  healthProbeId="[resourceId('Microsoft.Network/loadBalancers/probes', 'myLb', 'http')]"
  maxBatchInstancePercent=20
  maxUnhealthyInstancePercent=20
  maxUnhealthyUpgradedInstancePercent=20
  pauseTimeBetweenBatches="PT5S"
}}

<!-- Orchestration Modes: "Uniform" or "Flexible" -->
<!-- Upgrade Modes: "Automatic", "Rolling", or "Manual" -->
```

#### Auto-scaling Helpers (5 helpers)

```handlebars
<!-- Create auto-scale policy -->
{{scale:autoscale.policy
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'myVmss')]"
  minCapacity=2
  maxCapacity=10
  defaultCapacity=3
  rules=(array metricRule scheduleRule)
}}

<!-- Create metric-based scale rule -->
{{scale:autoscale.metricRule
  metricName="Percentage CPU"
  operator="GreaterThan"
  threshold=75
  scaleAction="Increase"
  cooldown="PT5M"
}}

<!-- Create schedule-based profile -->
{{scale:autoscale.scheduleProfile
  startTime="2024-01-01T08:00:00"
  endTime="2024-12-31T18:00:00"
  recurrence=(object
    frequency="Week"
    schedule=(object
      days=(array "Monday" "Tuesday" "Wednesday" "Thursday" "Friday")
    )
  )
  minCapacity=5
  maxCapacity=20
  defaultCapacity=10
}}

<!-- Pre-built CPU-based scaling policy -->
{{scale:autoscale.cpu
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'myVmss')]"
  minCapacity=2
  maxCapacity=10
  defaultCapacity=3
  scaleOutThreshold=75
  scaleInThreshold=25
}}

<!-- Pre-built business hours schedule -->
{{scale:autoscale.businessHours
  minCapacity=5
  maxCapacity=20
  defaultCapacity=10
  timezone="Pacific Standard Time"
}}
```

#### Multi-Region Helpers (4 helpers)

```handlebars
<!-- Create Traffic Manager profile -->
{{scale:multiregion.profile
  profileName="globalApp"
  dnsName="globalapp-tm"
  routingMethod="Performance"
  monitorProtocol="HTTPS"
  monitorPort=443
  monitorPath="/"
}}

<!-- Routing Methods: "Performance", "Priority", "Weighted", "Geographic", "MultiValue", "Subnet" -->

<!-- Create Traffic Manager endpoint configuration -->
{{scale:multiregion.endpoint
  endpointName="eastus-endpoint"
  type="azureEndpoints"
  targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'eastus-pip')]"
  priority=1
  weight=100
  endpointLocation="East US"
}}

<!-- Create multi-region deployment plan -->
{{scale:multiregion.deploymentPlan
  primaryRegion="East US"
  secondaryRegions=(array "West US" "North Europe")
  replicationStrategy="active-active"
  dataSync="async"
}}

<!-- Replication Strategies: "active-active", "active-passive", "multi-master" -->

<!-- Create failover plan -->
{{scale:multiregion.failover
  primaryRegion="East US"
  failoverRegion="West US"
  rto=60
  rpo=15
  automaticFailover=true
}}

<!-- RTO: Recovery Time Objective in minutes -->
<!-- RPO: Recovery Point Objective in minutes -->
```

#### Load Balancing Helpers (4 helpers)

```handlebars
<!-- Create Standard Load Balancer -->
{{scale:lb.definition
  name="webLb"
  sku="Standard"
  tier="Regional"
  frontendIpName="webFrontend"
  publicIpResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'webPip')]"
  backendPoolName="webBackend"
  probeName="httpProbe"
  probeProtocol="Http"
  probePort=80
  probePath="/"
  ruleName="httpRule"
  ruleProtocol="Tcp"
  ruleFrontendPort=80
  ruleBackendPort=80
  enableFloatingIp=false
  idleTimeoutInMinutes=4
}}

<!-- SKUs: "Basic" or "Standard" -->
<!-- Tiers: "Regional" or "Global" -->

<!-- Create health probe configuration -->
{{scale:lb.probe
  name="httpsProbe"
  protocol="Https"
  port=443
  path="/health"
  intervalInSeconds=15
  numberOfProbes=2
}}

<!-- Recommend health probe based on application -->
{{scale:lb.recommendHealthProbe "web-application"}}
{{scale:lb.recommendHealthProbe "api-service"}}
{{scale:lb.recommendHealthProbe "database"}}

<!-- Create Application Gateway v2 -->
{{scale:appgw.definition
  name="webAppGw"
  tier="Standard_v2"
  capacity=2
  autoScaleMinCapacity=2
  autoScaleMaxCapacity=10
  enableWaf=false
  frontendPort=80
  backendPort=80
  protocol="Http"
  backendAddresses=(array "10.0.1.4" "10.0.1.5")
  cookieBasedAffinity="Disabled"
  requestTimeout=30
}}

<!-- Tiers: "Standard_v2" or "WAF_v2" -->

<!-- Recommend Application Gateway SKU -->
{{scale:appgw.recommendSku
  expectedTraffic="high"
  wafRequired=true
  autoScaleEnabled=true
}}
```

## Usage Examples

### Example 1: Secure VM with Trusted Launch and Managed Identity

```handlebars
{ "type": "Microsoft.Compute/virtualMachines", "apiVersion": "2023-03-01",
"name": "[parameters('vmName')]", "location": "[parameters('location')]",
"identity":
{{identity:managedidentity.systemAssigned}}, "properties": { "hardwareProfile":
{{vmSize "Standard_D2s_v3"}}, "osProfile": { "computerName":
"[parameters('vmName')]", "adminUsername": "[parameters('adminUsername')]",
"adminPassword": "[parameters('adminPassword')]" }, "storageProfile": {
"imageReference":
{{vmImage "Ubuntu" "22.04-LTS"}}, "osDisk": { "createOption": "FromImage",
"managedDisk":
{{security:sse-cmk
  keyVaultResourceId="[parameters('keyVaultId')]"
  keyUrl="[parameters('keyUrl')]"
}}
} }, "securityProfile":
{{security:trusted-launch}}, "networkProfile": { "networkInterfaces": [ { "id":
"[resourceId('Microsoft.Network/networkInterfaces', parameters('nicName'))]" } ]
} } }
```

### Example 2: VM with Extensions

```handlebars
{ "type": "Microsoft.Compute/virtualMachines/extensions", "apiVersion":
"2023-03-01", "name": "[concat(parameters('vmName'),
'/AzureMonitorLinuxAgent')]", "location": "[parameters('location')]",
"dependsOn": [ "[resourceId('Microsoft.Compute/virtualMachines',
parameters('vmName'))]" ], "properties":
{{ext:monitor
  workspaceId="[parameters('workspaceId')]"
  workspaceKey="[parameters('workspaceKey')]"
}}
}
```

### Example 3: RBAC Role Assignment

```handlebars
{ "type": "Microsoft.Authorization/roleAssignments", "apiVersion": "2022-04-01",
"name": "[guid(resourceGroup().id, parameters('principalId'), 'Contributor')]",
"properties":
{{identity:rbac.assignBuiltInRole
  principalId="[parameters('principalId')]"
  roleName="Contributor"
  scopeType="resourceGroup"
  scopeId="[resourceGroup().name]"
}}
}
```

### Example 4: VMSS with Auto-scaling

```handlebars
{ "type": "Microsoft.Compute/virtualMachineScaleSets", "apiVersion":
"2023-09-01", "name": "[parameters('vmssName')]", "location":
"[parameters('location')]", "sku": { "name": "[parameters('vmSize')]", "tier":
"Standard", "capacity": "[parameters('instanceCount')]" }, "properties":
{{scale:vmss.definition
  name="[parameters('vmssName')]"
  orchestrationMode="Flexible"
  upgradeMode="Rolling"
  instanceCount="[parameters('instanceCount')]"
  vmSize="[parameters('vmSize')]"
  osType="Linux"
  imagePublisher="Canonical"
  imageOffer="0001-com-ubuntu-server-jammy"
  imageSku="22_04-lts-gen2"
  adminUsername="[parameters('adminUsername')]"
  authenticationType="password"
  enableAutoOsUpgrade=true
  healthProbeId="[resourceId('Microsoft.Network/loadBalancers/probes', parameters('lbName'), 'httpProbe')]"
  maxBatchInstancePercent=20
  maxUnhealthyInstancePercent=20
  maxUnhealthyUpgradedInstancePercent=20
  pauseTimeBetweenBatches="PT5S"
}}
}, { "type": "Microsoft.Insights/autoscalesettings", "apiVersion": "2022-10-01",
"name": "[concat(parameters('vmssName'), '-autoscale')]", "location":
"[parameters('location')]", "dependsOn": [
"[resourceId('Microsoft.Compute/virtualMachineScaleSets',
parameters('vmssName'))]" ], "properties":
{{scale:autoscale.cpu
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
  minCapacity=2
  maxCapacity=10
  defaultCapacity=3
  scaleOutThreshold=75
  scaleInThreshold=25
}}
}
```

### Example 5: Multi-Region Deployment with Traffic Manager

```handlebars
{ "type": "Microsoft.Network/trafficManagerProfiles", "apiVersion":
"2022-04-01", "name": "[parameters('trafficManagerName')]", "location":
"global", "properties":
{{scale:multiregion.profile
  profileName="[parameters('trafficManagerName')]"
  dnsName="[parameters('dnsName')]"
  routingMethod="Performance"
  monitorProtocol="HTTPS"
  monitorPort=443
  monitorPath="/health"
}}, "resources": [ { "type": "endpoints", "apiVersion": "2022-04-01", "name":
"eastus-endpoint", "dependsOn": [
"[resourceId('Microsoft.Network/trafficManagerProfiles',
parameters('trafficManagerName'))]" ], "properties":
{{scale:multiregion.endpoint
  endpointName="eastus-endpoint"
  type="azureEndpoints"
  targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'eastus-pip')]"
  priority=1
  weight=100
  endpointLocation="East US"
}}
}, { "type": "endpoints", "apiVersion": "2022-04-01", "name": "westus-endpoint",
"dependsOn": [ "[resourceId('Microsoft.Network/trafficManagerProfiles',
parameters('trafficManagerName'))]" ], "properties":
{{scale:multiregion.endpoint
  endpointName="westus-endpoint"
  type="azureEndpoints"
  targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'westus-pip')]"
  priority=2
  weight=100
  endpointLocation="West US"
}}
} ] }
```

### Example 6: Load Balancer with Health Probes

```handlebars
{ "type": "Microsoft.Network/loadBalancers", "apiVersion": "2023-05-01", "name":
"[parameters('lbName')]", "location": "[parameters('location')]", "sku": {
"name": "Standard", "tier": "Regional" }, "properties":
{{scale:lb.definition
  name="[parameters('lbName')]"
  sku="Standard"
  tier="Regional"
  frontendIpName="webFrontend"
  publicIpResourceId="[resourceId('Microsoft.Network/publicIPAddresses', parameters('publicIpName'))]"
  backendPoolName="webBackend"
  probeName="httpProbe"
  probeProtocol="Http"
  probePort=80
  probePath="/health"
  ruleName="httpRule"
  ruleProtocol="Tcp"
  ruleFrontendPort=80
  ruleBackendPort=80
  enableFloatingIp=false
  idleTimeoutInMinutes=4
}}
}
```

## Templates

The plugin generates comprehensive ARM templates for Azure Marketplace offerings:

### Main Templates

- `mainTemplate.json` - Main VM deployment template
- `createUiDefinition.json` - Azure Portal UI definition
- `viewDefinition.json` - Managed application view definition

### Nested Templates

- **Core Resources:**
  - `virtualMachine.json` - VM configuration with extensions
  - `networkInterface.json` - Network interface
  - `publicIpAddress.json` - Public IP address
  - `networkSecurityGroup.json` - Security rules

- **Networking:**
  - `virtualNetwork.json` - VNet and subnets
  - `loadBalancer.json` - Load balancer with health probes
  - `applicationGateway.json` - Application Gateway with WAF
  - `bastionHost.json` - Azure Bastion
  - `virtualNetworkPeering.json` - VNet peering connections

- **Security:**
  - `diskEncryption.json` - Disk encryption configuration
  - `trustedLaunch.json` - Trusted Launch features
  - `keyVault.json` - Key Vault for secrets and keys

- **Identity:**
  - `managedIdentity.json` - User-assigned identity resource
  - `roleAssignment.json` - RBAC role assignments

### Template Categories

The plugin includes 40+ pre-built templates across 8 categories:

1. **VM Templates** (5 templates): Basic, web server, app server, data server, high-security
2. **Networking Templates** (12 templates): VNets, subnets, NSGs, load balancers, Application Gateway, Bastion, peering
3. **Extension Templates** (20 templates): Windows, Linux, and cross-platform extensions
4. **Security Templates** (12 templates): Encryption types, Trusted Launch, compliance frameworks
5. **Identity Templates** (12 templates): Managed identity, Azure AD, RBAC
6. **Compliance Templates** (6 templates): SOC 2, PCI-DSS, HIPAA, ISO 27001, NIST, FedRAMP
7. **High Availability Templates** (3 templates): Load balanced, availability sets, availability zones
8. **Hybrid Templates** (5 templates): Combined features for specific scenarios

## Plugin Statistics

- **Version:** 1.6.0
- **Total Helpers:** 170+ Handlebars helpers (14 new scaling helpers)
- **CLI Commands:** 44 commands (12 HA/DR commands)
- **Tests:** 266 tests (100% passing)
- **Code Coverage:** Comprehensive test coverage across all modules
- **TypeScript:** Full type safety with strict mode
- **Documentation:** 2,500+ lines of inline documentation

## Compliance & Security

### Supported Compliance Frameworks

The plugin provides pre-configured templates for 6 major compliance frameworks:

1. **SOC 2** (Service Organization Control 2)
   - Encryption at rest and in transit
   - Access control and identity management
   - Audit logging and monitoring

2. **PCI-DSS** (Payment Card Industry Data Security Standard)
   - Network segmentation
   - Strong encryption
   - Access control and monitoring

3. **HIPAA** (Health Insurance Portability and Accountability Act)
   - Data encryption and protection
   - Access control and audit trails
   - Secure authentication

4. **ISO 27001** (Information Security Management)
   - Risk assessment and management
   - Security controls implementation
   - Continuous monitoring

5. **NIST 800-53** (Security and Privacy Controls)
   - Federal security standards
   - Comprehensive security controls
   - Continuous monitoring

6. **FedRAMP** (Federal Risk and Authorization Management Program)
   - Federal cloud security baseline
   - Continuous monitoring and authorization
   - Security controls implementation

### Security Features

- **Encryption:** ADE, SSE with PMK/CMK, Encryption at Host
- **Trusted Launch:** Secure Boot, vTPM, Boot Integrity Monitoring, Guest Attestation
- **Identity:** System/User-assigned Managed Identity, Azure AD integration
- **Access Control:** RBAC with least privilege, Conditional Access, MFA
- **Monitoring:** Azure Monitor, Diagnostics, Boot Diagnostics, Application Health

## Development

### Prerequisites

- Node.js >= 18.0.0
- TypeScript >= 5.0.0
- Azure Marketplace Generator >= 3.1.0

### Local Development

```bash
# Clone the repository
git clone https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm.git
cd azmp-plugin-vm

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build in watch mode
npm run watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
azmp-plugin-vm/
├── src/
│   ├── index.ts                    # Main plugin entry point
│   ├── types.ts                    # TypeScript interfaces
│   ├── cli/                        # CLI commands
│   │   ├── index.ts
│   │   └── commands/
│   │       ├── create.ts
│   │       ├── validate.ts
│   │       └── package.ts
│   ├── core/                       # Core VM functionality
│   │   ├── generator.ts
│   │   └── validator.ts
│   ├── networking/                 # Networking modules
│   │   ├── index.ts
│   │   ├── vnet.ts
│   │   ├── subnet.ts
│   │   ├── nsg.ts
│   │   ├── loadbalancer.ts
│   │   ├── applicationgateway.ts
│   │   ├── bastion.ts
│   │   └── peering.ts
│   ├── extensions/                 # VM extensions
│   │   ├── index.ts
│   │   ├── windows.ts
│   │   ├── linux.ts
│   │   └── crossplatform.ts
│   ├── security/                   # Security features
│   │   ├── index.ts
│   │   ├── encryption.ts
│   │   └── trustedlaunch.ts
│   ├── identity/                   # Identity & access
│   │   ├── index.ts
│   │   ├── managedidentity.ts
│   │   ├── azuread.ts
│   │   └── rbac.ts
│   ├── templates/                  # Handlebars templates
│   │   ├── vm/
│   │   ├── networking/
│   │   ├── extensions/
│   │   ├── security/
│   │   └── identity/
│   └── __tests__/                  # Test files
│       ├── index.test.ts
│       ├── cli-commands.test.ts
│       ├── networking.test.ts
│       ├── extensions.test.ts
│       └── identity.test.ts
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_LOG.md
│   ├── requirements.md
│   └── PHASE*.md
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
└── README.md
```

### Testing

The plugin has comprehensive test coverage with 161 tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- networking.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

### Testing with Generator Locally

To test the plugin with Azure Marketplace Generator:

1. Build the plugin:

   ```bash
   npm run build
   ```

2. Link locally (in plugin directory):

   ```bash
   npm link
   ```

3. Link in your generator project:

   ```bash
   cd /path/to/your/generator/project
   npm link @hoiltd/azmp-plugin-vm
   ```

4. Or use relative path in `azmp-config.json`:
   ```json
   {
     "plugins": [
       {
         "package": "../azmp-plugin-vm",
         "enabled": true
       }
     ]
   }
   ```

### Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure:

- All tests pass
- Code follows the existing style
- Commit messages are clear and descriptive
- Documentation is updated

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release history.

## Requirements

- **Azure Marketplace Generator:** >= 3.1.0
- **Node.js:** >= 18.0.0
- **TypeScript:** >= 5.0.0
- **Azure Subscription:** Required for deployment

## Supported Azure Services

- Azure Virtual Machines (Windows & Linux)
- Azure Virtual Networks
- Azure Network Security Groups
- Azure Load Balancer
- Azure Application Gateway
- Azure Bastion
- Azure Key Vault
- Azure Managed Identity
- Azure Active Directory
- Azure Monitor
- Azure Policy
- Azure RBAC

## Browser Support

The generated `createUiDefinition.json` supports:

- Microsoft Edge (latest)
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Apple Safari (latest)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**HOME OFFICE IMPROVEMENTS LTD**

- Website: [https://homeofficeimprovements.co.uk](https://homeofficeimprovements.co.uk)
- Email: info@homeofficeimprovements.co.uk
- GitHub: [@HOME-OFFICE-IMPROVEMENTS-LTD](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD)

## Repository

[https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm)

## Support

For issues, questions, or contributions:

- **Issues:** [GitHub Issues](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/issues)
- **Discussions:** [GitHub Discussions](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/discussions)
- **Documentation:** [Wiki](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/wiki)

## Acknowledgments

- Azure Marketplace team for documentation and support
- TypeScript and Node.js communities
- All contributors to this project

---

**Version:** 1.6.0  
**Last Updated:** Day 6 - Enterprise Scaling Release  
**Status:** ✅ Production Ready
