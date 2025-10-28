# P1 Features Breakdown for Azure Marketplace Certification

**Document Version:** 1.0  
**Date:** 2025-10-28  
**Priority:** High (P1) - Enterprise-Ready Features  
**Target Sprint:** Q4 2025 (Following P0 completion)

---

## Executive Summary

This document provides detailed implementation plans for **P1 (high-priority)** features that enhance enterprise readiness and marketplace competitiveness. These features were identified during the comprehensive feature-parity audit against authoritative Microsoft/Azure documentation.

**Status:** 6 high-priority features identified  
**Estimated Effort:** 10-12 days total  
**Risk Level:** Medium (enhances competitiveness, not certification blockers)

---

## P1-1: Managed Disk Type Selection in UI/Templates

### Overview
Azure VMs support multiple managed disk types (Standard HDD, Standard SSD, Premium SSD, Premium SSD v2, Ultra Disk) with different performance and cost characteristics. Currently, the plugin has disk type awareness in cost calculations but lacks **explicit disk type selection** in generated templates and UI.

### Business Impact
- **Enterprise Need:** Customers require disk type selection for performance/cost optimization
- **Marketplace Competitiveness:** Competitors offer disk type selection in their offerings
- **Customer Experience:** Reduces post-deployment configuration work

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- Cost analyzer supports disk types: `src/cost/analyzer.ts` ✅
- VMSS has disk type support: `src/highavailability/vmss.ts` (line 56, 65) ✅
- Cost helpers reference disk types: `src/cost/helpers.ts` (line 182-187) ✅

**Gap:**
- No disk type parameter in `mainTemplate.json.hbs`
- No disk type selection UI in `createUiDefinition.json.hbs`
- No default disk type configuration for VM resources
- Missing guidance on disk type selection (performance vs cost)

### Acceptance Criteria

#### AC-1: ARM Template Parameter
- [ ] Add `osDiskType` parameter to `mainTemplate.json.hbs`
- [ ] Support all disk types: Standard_LRS, StandardSSD_LRS, Premium_LRS, Premium_ZRS, StandardSSD_ZRS, UltraSSD_LRS
- [ ] Set default to `Premium_LRS` for production workloads
- [ ] Add `dataDiskType` parameter for data disks (separate from OS disk)

**Parameter Definition:**
```json
{
  "osDiskType": {
    "type": "string",
    "defaultValue": "Premium_LRS",
    "allowedValues": [
      "Standard_LRS",
      "StandardSSD_LRS",
      "Premium_LRS",
      "Premium_ZRS",
      "StandardSSD_ZRS",
      "UltraSSD_LRS"
    ],
    "metadata": {
      "description": "OS disk storage account type (Standard HDD, Standard SSD, Premium SSD, Ultra Disk)"
    }
  },
  "dataDiskType": {
    "type": "string",
    "defaultValue": "StandardSSD_LRS",
    "allowedValues": [
      "Standard_LRS",
      "StandardSSD_LRS",
      "Premium_LRS",
      "Premium_ZRS",
      "StandardSSD_ZRS",
      "UltraSSD_LRS"
    ],
    "metadata": {
      "description": "Data disk storage account type"
    }
  }
}
```

#### AC-2: VM Resource Integration
- [ ] Update VM resource `storageProfile` to use `osDiskType` parameter
- [ ] Apply disk type to OS disk managed disk configuration
- [ ] Ensure compatibility with existing VM size selection (Premium disks require premium-capable VMs)

**Template Integration:**
```handlebars
"storageProfile": {
  "osDisk": {
    "createOption": "FromImage",
    "managedDisk": {
      "storageAccountType": "[parameters('osDiskType')]"
    },
    "caching": "[if(equals(parameters('osDiskType'), 'Premium_LRS'), 'ReadWrite', 'ReadOnly')]"
  }
}
```

#### AC-3: createUiDefinition.json Updates
- [ ] Add disk type selection blade to UI
- [ ] Group disk types by category: Performance (Premium SSD, Ultra), Balanced (Standard SSD), Cost-Optimized (Standard HDD)
- [ ] Show estimated monthly cost for each disk type (integrate with cost helpers)
- [ ] Add validation: Ultra Disk requires zone-aware VM sizes
- [ ] Provide recommendations based on workload type

**UI Element Example:**
```json
{
  "name": "diskConfiguration",
  "type": "Microsoft.Common.Section",
  "label": "Disk Configuration",
  "elements": [
    {
      "name": "osDiskType",
      "type": "Microsoft.Common.DropDown",
      "label": "OS Disk Type",
      "defaultValue": "Premium SSD (Premium_LRS)",
      "toolTip": "Select the disk type for the OS disk. Premium SSD recommended for production workloads.",
      "constraints": {
        "allowedValues": [
          {
            "label": "Premium SSD (Premium_LRS)",
            "description": "High performance, low latency. Recommended for production. ~$0.135/GB/month",
            "value": "Premium_LRS"
          },
          {
            "label": "Standard SSD (StandardSSD_LRS)",
            "description": "Balanced performance and cost. Good for dev/test. ~$0.075/GB/month",
            "value": "StandardSSD_LRS"
          },
          {
            "label": "Standard HDD (Standard_LRS)",
            "description": "Cost-optimized. Best for backups and archival. ~$0.045/GB/month",
            "value": "Standard_LRS"
          },
          {
            "label": "Premium SSD Zone-Redundant (Premium_ZRS)",
            "description": "High availability with zone redundancy. ~$0.175/GB/month",
            "value": "Premium_ZRS"
          },
          {
            "label": "Ultra Disk (UltraSSD_LRS)",
            "description": "Ultra-low latency, high IOPS. Requires zone-aware VM. ~$0.25/GB/month + IOPS/throughput charges",
            "value": "UltraSSD_LRS"
          }
        ],
        "required": true
      },
      "visible": true
    },
    {
      "name": "dataDiskType",
      "type": "Microsoft.Common.DropDown",
      "label": "Data Disk Type",
      "defaultValue": "Standard SSD (StandardSSD_LRS)",
      "toolTip": "Select the disk type for data disks",
      "constraints": {
        "allowedValues": "[steps('diskConfiguration').osDiskType.constraints.allowedValues]",
        "required": false
      },
      "visible": "[greater(steps('vmConfiguration').dataDiskCount, 0)]"
    }
  ]
}
```

#### AC-4: Validation and Compatibility
- [ ] Validate disk type compatibility with selected VM size
- [ ] Premium disks require premium-capable VM sizes (DS-series, ES-series, etc.)
- [ ] Ultra Disk requires zone-aware VM deployment
- [ ] Add validation in `createUiDefinition.json` and ARM template

**Validation Logic:**
```json
{
  "name": "diskTypeValidation",
  "type": "Microsoft.Common.InfoBox",
  "visible": "[and(equals(steps('diskConfiguration').osDiskType, 'Premium_LRS'), not(contains(steps('vmConfiguration').vmSize, 's')))]",
  "options": {
    "icon": "Warning",
    "text": "Premium SSD requires a premium-capable VM size (e.g., Standard_DS2_v2, Standard_E4s_v3)"
  }
}
```

#### AC-5: Documentation
- [ ] Create `docs/DISK_TYPES_GUIDE.md`
- [ ] Document disk type selection criteria (performance, cost, availability)
- [ ] Provide decision matrix for disk type selection
- [ ] Include cost comparison table
- [ ] Document limitations (Ultra Disk regions, Premium disk VM requirements)

### Implementation Plan

#### Phase 1: ARM Template Updates (1 day)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add disk type parameters, update VM storageProfile)
- `src/templates/parameters.json.hbs` (add disk type default values)

**Changes:**
- Add `osDiskType` and `dataDiskType` parameters
- Update VM resource to use disk type parameters
- Add caching optimization based on disk type

#### Phase 2: UI Definition Updates (1 day)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add disk configuration blade)

**Changes:**
- Add disk type selection dropdowns with descriptions and cost estimates
- Add validation for disk type and VM size compatibility
- Add info boxes for recommendations

#### Phase 3: Cost Integration (0.5 days)
**Files to Modify:**
- `src/cost/helpers.ts` (ensure disk cost calculation is exposed to UI)

**Changes:**
- Export disk cost calculation for UI display
- Add helper for disk type recommendations based on workload

#### Phase 4: Documentation (0.5 days)
**Files to Create:**
- `docs/DISK_TYPES_GUIDE.md` (comprehensive guide)

**Content:**
- Disk type comparison table
- Performance benchmarks (IOPS, throughput, latency)
- Cost analysis
- Selection decision tree

### Testing Strategy

#### Unit Tests
- [ ] Test disk type parameter generation
- [ ] Validate disk type compatibility checks
- [ ] Test cost calculation for each disk type

**Test Files:**
- `src/templates/__tests__/disk-types.test.ts` (new file, 15+ test cases)

#### Integration Tests
- [ ] Deploy VM with each disk type (Standard HDD, Standard SSD, Premium SSD)
- [ ] Verify disk performance characteristics
- [ ] Test VM size compatibility validation

#### ARM-TTK Validation
- [ ] Validate templates with all disk type combinations
- [ ] Ensure parameter constraints are correct

### Dependencies
- No new npm packages required
- Azure SDK for disk type validation (already available)

### Success Metrics
- [ ] All disk types selectable in UI
- [ ] Cost estimates displayed for each disk type
- [ ] Validation prevents incompatible configurations
- [ ] Documentation complete and reviewed

---

## P1-2: Azure Backup Auto-Enable in Templates

### Overview
While the plugin has comprehensive backup infrastructure (`src/recovery/backup.ts`), Azure Backup is **not auto-enabled** in generated templates. Enterprise customers expect backup to be configured out-of-the-box for production VMs.

### Business Impact
- **Enterprise Need:** Customers require backup for compliance and disaster recovery
- **Marketplace Competitiveness:** Backup is a standard feature in enterprise VM offerings
- **Risk Mitigation:** Reduces data loss risk for customers

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- Backup module exists: `src/recovery/backup.ts` ✅ (464 lines, comprehensive)
- Backup helpers: Recovery Services Vault, backup policies, VM backup enablement ✅
- Backup presets: Development, Production, Long-term ✅
- Cost estimation: `estimateBackupStorage()` ✅

**Gap:**
- Backup not auto-enabled in `mainTemplate.json.hbs`
- No backup configuration UI in `createUiDefinition.json.hbs`
- No default Recovery Services Vault in templates
- Missing backup policy selection in UI

### Acceptance Criteria

#### AC-1: Recovery Services Vault in Template
- [ ] Add Recovery Services Vault resource to `mainTemplate.json.hbs`
- [ ] Add `enableBackup` parameter (default: `true` for production)
- [ ] Add `backupPolicyPreset` parameter (Development, Production, Long-term)
- [ ] Support customer-provided vault as alternative

**Template Integration:**
```handlebars
{{#if parameters.enableBackup}}
{
  "type": "Microsoft.RecoveryServices/vaults",
  "apiVersion": "2023-06-01",
  "name": "[parameters('recoveryServicesVaultName')]",
  "location": "[parameters('location')]",
  "sku": {
    "name": "RS0",
    "tier": "Standard"
  },
  "properties": {
    "publicNetworkAccess": "Enabled"
  }
}
{{/if}}
```

#### AC-2: Backup Policy Configuration
- [ ] Add backup policy resource to template
- [ ] Support preset selection: Development (7 days), Production (30 days), Long-term (90 days+)
- [ ] Allow custom retention configuration
- [ ] Add instant restore configuration (2-5 day snapshots)

**Template Integration:**
```handlebars
{{#if parameters.enableBackup}}
{
  "type": "Microsoft.RecoveryServices/vaults/backupPolicies",
  "apiVersion": "2023-06-01",
  "name": "[concat(parameters('recoveryServicesVaultName'), '/policy-', parameters('backupPolicyPreset'))]",
  "dependsOn": [
    "[resourceId('Microsoft.RecoveryServices/vaults', parameters('recoveryServicesVaultName'))]"
  ],
  "properties": {
    {{recovery:backupPolicy 
      name=parameters.backupPolicyPreset 
      vaultName=parameters.recoveryServicesVaultName
      scheduleType="Daily"
      scheduleTime="02:00"
      dailyRetentionDays=parameters.backupRetentionDays
    }}
  }
}
{{/if}}
```

#### AC-3: VM Backup Enablement
- [ ] Add protected item resource to enable backup on VM
- [ ] Configure backup immediately after VM creation
- [ ] Add proper dependency chain (Vault → Policy → VM → Protected Item)

**Template Integration:**
```handlebars
{{#if parameters.enableBackup}}
{
  "type": "Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems",
  "apiVersion": "2023-06-01",
  "name": "[concat(parameters('recoveryServicesVaultName'), '/Azure/iaasvmcontainer;iaasvmcontainerv2;', resourceGroup().name, ';', parameters('vmName'), '/vm;iaasvmcontainerv2;', resourceGroup().name, ';', parameters('vmName'))]",
  "dependsOn": [
    "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]",
    "[resourceId('Microsoft.RecoveryServices/vaults/backupPolicies', parameters('recoveryServicesVaultName'), concat('policy-', parameters('backupPolicyPreset')))]"
  ],
  "properties": {
    {{recovery:enableVMBackup 
      vmName=parameters.vmName
      vaultName=parameters.recoveryServicesVaultName
      policyName=concat('policy-', parameters.backupPolicyPreset)
    }}
  }
}
{{/if}}
```

#### AC-4: createUiDefinition.json Updates
- [ ] Add backup configuration blade to UI
- [ ] Provide backup enable/disable toggle (default: enabled)
- [ ] Backup policy preset selection (Development, Production, Long-term)
- [ ] Show estimated backup storage cost based on VM disk size
- [ ] Add custom retention configuration (advanced mode)

**UI Element Example:**
```json
{
  "name": "backupConfiguration",
  "type": "Microsoft.Common.Section",
  "label": "Backup Configuration",
  "elements": [
    {
      "name": "enableBackup",
      "type": "Microsoft.Common.CheckBox",
      "label": "Enable Azure Backup",
      "defaultValue": true,
      "toolTip": "Enable automated backup for this VM (recommended for production workloads)"
    },
    {
      "name": "backupPolicyPreset",
      "type": "Microsoft.Common.DropDown",
      "label": "Backup Policy",
      "defaultValue": "Production",
      "toolTip": "Select a backup retention policy",
      "constraints": {
        "allowedValues": [
          {
            "label": "Development (7 days)",
            "description": "7 days daily retention, 2-day instant restore. Estimated: ~$15/month for 100GB VM",
            "value": "development"
          },
          {
            "label": "Production (30 days + 12 weeks)",
            "description": "30 days daily, 12 weeks weekly, 12 months monthly. Estimated: ~$35/month for 100GB VM",
            "value": "production"
          },
          {
            "label": "Long-term (90 days + 52 weeks + 7 years)",
            "description": "90 days daily, 52 weeks weekly, 60 months monthly, 7 years yearly. Estimated: ~$75/month for 100GB VM",
            "value": "longterm"
          }
        ],
        "required": true
      },
      "visible": "[steps('backupConfiguration').enableBackup]"
    },
    {
      "name": "backupCostEstimate",
      "type": "Microsoft.Common.InfoBox",
      "visible": "[steps('backupConfiguration').enableBackup]",
      "options": {
        "icon": "Info",
        "text": "[concat('Estimated backup cost: $', string(mul(steps('vmConfiguration').osDiskSizeGB, 0.35)), '/month (includes protected instance + storage)')]"
      }
    }
  ]
}
```

#### AC-5: Documentation
- [ ] Update `README.md` with backup configuration examples
- [ ] Reference existing `src/recovery/backup.ts` best practices
- [ ] Document backup cost optimization strategies
- [ ] Provide restore testing procedures

### Implementation Plan

#### Phase 1: ARM Template Updates (1.5 days)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add backup resources)
- `src/templates/parameters.json.hbs` (add backup parameters)

**Changes:**
- Add Recovery Services Vault resource
- Add backup policy resource
- Add protected item resource for VM backup enablement
- Add proper dependency chains

#### Phase 2: UI Definition Updates (1 day)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add backup configuration blade)

**Changes:**
- Add backup enable/disable toggle
- Add backup policy preset selection
- Add cost estimate display
- Add validation for backup configuration

#### Phase 3: Helper Integration (0.5 days)
**Files to Modify:**
- `src/recovery/backup.ts` (ensure all helpers are properly exposed)
- `src/templates/helpers.ts` (register backup helpers for template usage)

**Changes:**
- Verify `recovery:backupPolicy` helper is registered
- Verify `recovery:enableVMBackup` helper is registered
- Add cost estimation helper for UI display

#### Phase 4: Documentation (0.5 days)
**Files to Update:**
- `README.md` (add backup section)
- Reference `src/recovery/backup.ts` documentation (already comprehensive)

**Content:**
- Backup configuration examples
- Cost optimization tips
- Restore testing procedures

### Testing Strategy

#### Unit Tests
- [ ] Test backup resource generation
- [ ] Validate backup policy configuration
- [ ] Test cost estimation calculations

**Test Files:**
- `src/templates/__tests__/backup.test.ts` (new file, 20+ test cases)

#### Integration Tests
- [ ] Deploy VM with backup enabled (all presets)
- [ ] Verify backup jobs run successfully
- [ ] Test restore from backup (restore simulation)
- [ ] Validate cost estimates

#### ARM-TTK Validation
- [ ] Validate templates with backup enabled and disabled
- [ ] Ensure proper dependency chains

### Dependencies
- Recovery Services Vault (Azure resource)
- Backup extension (already included in `src/extensions/windows.ts`, `src/extensions/linux.ts`)

### Success Metrics
- [ ] Backup auto-enabled by default in generated templates
- [ ] All backup presets selectable in UI
- [ ] Cost estimates accurate (±10%)
- [ ] Documentation complete and reviewed

---

## P1-3: Data Disk Support and Configuration

### Overview
Azure VMs support up to 32 data disks for application data storage. Currently, the plugin has data disk awareness in cost and performance modules but lacks **explicit data disk configuration** in generated templates and UI.

### Business Impact
- **Enterprise Need:** Enterprise applications require separate data disks for databases, logs, application data
- **Best Practice:** Separating OS and data disks improves performance and manageability
- **Marketplace Standard:** Data disk configuration is expected in enterprise VM offerings

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- VMSS has data disk support: `src/highavailability/vmss.ts` (line 59) ✅
- VM sizes include `maxDataDiskCount`: `src/azure/compute.ts` (line 24, 91) ✅
- Performance analyzer tracks data disks: `src/performance/analyzer.ts` ✅
- Cost analyzer supports data disk pricing ✅

**Gap:**
- No data disk configuration in `mainTemplate.json.hbs`
- No data disk UI in `createUiDefinition.json.hbs`
- No data disk provisioning in VM resources
- Missing guidance on data disk configuration (count, size, type)

### Acceptance Criteria

#### AC-1: ARM Template Parameters
- [ ] Add `dataDiskCount` parameter (0-32, default: 0)
- [ ] Add `dataDiskSizeGB` parameter (4-32767 GB, default: 128)
- [ ] Add `dataDiskType` parameter (Standard_LRS, StandardSSD_LRS, Premium_LRS, etc.)
- [ ] Add `dataDiskCaching` parameter (None, ReadOnly, ReadWrite)

**Parameter Definition:**
```json
{
  "dataDiskCount": {
    "type": "int",
    "defaultValue": 0,
    "minValue": 0,
    "maxValue": 32,
    "metadata": {
      "description": "Number of data disks to attach (0-32)"
    }
  },
  "dataDiskSizeGB": {
    "type": "int",
    "defaultValue": 128,
    "minValue": 4,
    "maxValue": 32767,
    "metadata": {
      "description": "Size of each data disk in GB"
    }
  },
  "dataDiskType": {
    "type": "string",
    "defaultValue": "StandardSSD_LRS",
    "allowedValues": [
      "Standard_LRS",
      "StandardSSD_LRS",
      "Premium_LRS",
      "Premium_ZRS",
      "StandardSSD_ZRS",
      "UltraSSD_LRS"
    ],
    "metadata": {
      "description": "Data disk storage account type"
    }
  },
  "dataDiskCaching": {
    "type": "string",
    "defaultValue": "ReadOnly",
    "allowedValues": ["None", "ReadOnly", "ReadWrite"],
    "metadata": {
      "description": "Data disk caching mode (ReadOnly recommended for most workloads)"
    }
  }
}
```

#### AC-2: VM Resource Integration
- [ ] Update VM resource `storageProfile.dataDisks` to provision data disks
- [ ] Use `copy` loop to create multiple data disks
- [ ] Assign sequential LUN numbers (0, 1, 2, ...)
- [ ] Apply disk type and caching configuration

**Template Integration:**
```handlebars
"storageProfile": {
  "osDisk": {
    "createOption": "FromImage",
    "managedDisk": {
      "storageAccountType": "[parameters('osDiskType')]"
    }
  },
  "dataDisks": [
    {
      "copy": {
        "name": "dataDisks",
        "count": "[parameters('dataDiskCount')]"
      },
      "lun": "[copyIndex('dataDisks')]",
      "name": "[concat(parameters('vmName'), '-datadisk-', copyIndex('dataDisks'))]",
      "createOption": "Empty",
      "diskSizeGB": "[parameters('dataDiskSizeGB')]",
      "managedDisk": {
        "storageAccountType": "[parameters('dataDiskType')]"
      },
      "caching": "[parameters('dataDiskCaching')]"
    }
  ]
}
```

#### AC-3: createUiDefinition.json Updates
- [ ] Add data disk configuration blade to UI
- [ ] Data disk count selector (0-32, with slider or numeric input)
- [ ] Data disk size selector (common sizes: 128GB, 256GB, 512GB, 1TB, 2TB, custom)
- [ ] Data disk type selector (reuse disk type dropdown from P1-1)
- [ ] Show total data disk cost estimate
- [ ] Add validation: data disk count ≤ VM size max data disk count

**UI Element Example:**
```json
{
  "name": "dataDiskConfiguration",
  "type": "Microsoft.Common.Section",
  "label": "Data Disk Configuration",
  "elements": [
    {
      "name": "dataDiskCount",
      "type": "Microsoft.Common.Slider",
      "min": 0,
      "max": 32,
      "label": "Number of Data Disks",
      "subLabel": "disks",
      "defaultValue": 0,
      "showStepMarkers": false,
      "toolTip": "Number of additional data disks to attach (0-32). Use data disks for application data, databases, and logs.",
      "constraints": {
        "required": false
      },
      "visible": true
    },
    {
      "name": "dataDiskSizeGB",
      "type": "Microsoft.Common.DropDown",
      "label": "Data Disk Size",
      "defaultValue": "128 GB",
      "toolTip": "Size of each data disk",
      "constraints": {
        "allowedValues": [
          { "label": "128 GB", "value": 128 },
          { "label": "256 GB", "value": 256 },
          { "label": "512 GB", "value": 512 },
          { "label": "1 TB (1024 GB)", "value": 1024 },
          { "label": "2 TB (2048 GB)", "value": 2048 },
          { "label": "4 TB (4096 GB)", "value": 4096 }
        ],
        "required": false
      },
      "visible": "[greater(steps('dataDiskConfiguration').dataDiskCount, 0)]"
    },
    {
      "name": "dataDiskType",
      "type": "Microsoft.Common.DropDown",
      "label": "Data Disk Type",
      "defaultValue": "Standard SSD (StandardSSD_LRS)",
      "toolTip": "Storage type for data disks",
      "constraints": {
        "allowedValues": "[steps('diskConfiguration').osDiskType.constraints.allowedValues]",
        "required": false
      },
      "visible": "[greater(steps('dataDiskConfiguration').dataDiskCount, 0)]"
    },
    {
      "name": "dataDiskCostEstimate",
      "type": "Microsoft.Common.InfoBox",
      "visible": "[greater(steps('dataDiskConfiguration').dataDiskCount, 0)]",
      "options": {
        "icon": "Info",
        "text": "[concat('Total data disk cost: $', string(mul(mul(steps('dataDiskConfiguration').dataDiskCount, steps('dataDiskConfiguration').dataDiskSizeGB), 0.075)), '/month (Standard SSD)')]"
      }
    }
  ]
}
```

#### AC-4: Validation
- [ ] Validate data disk count ≤ VM size max data disk count
- [ ] Validate data disk size (4-32767 GB)
- [ ] Warn if Premium data disks selected with non-premium VM size
- [ ] Add info box with data disk best practices

#### AC-5: Documentation
- [ ] Create `docs/DATA_DISKS_GUIDE.md`
- [ ] Document data disk configuration best practices
- [ ] Provide guidance on disk count, size, type selection
- [ ] Include performance tuning recommendations (caching, RAID, striping)
- [ ] Document limitations (max disks per VM size)

### Implementation Plan

#### Phase 1: ARM Template Updates (1 day)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add data disk parameters, update VM storageProfile)
- `src/templates/parameters.json.hbs` (add data disk default values)

**Changes:**
- Add data disk parameters
- Update VM resource to provision data disks using `copy` loop
- Add proper disk naming convention

#### Phase 2: UI Definition Updates (1 day)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add data disk configuration blade)

**Changes:**
- Add data disk count slider
- Add data disk size and type selectors
- Add cost estimate display
- Add validation for data disk count vs VM size

#### Phase 3: Validation Logic (0.5 days)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add validation rules)

**Changes:**
- Add validation for data disk count ≤ VM max data disks
- Add warning for Premium disk type with non-premium VM
- Add info boxes for best practices

#### Phase 4: Documentation (0.5 days)
**Files to Create:**
- `docs/DATA_DISKS_GUIDE.md` (comprehensive guide)

**Content:**
- Data disk configuration best practices
- Performance tuning (caching, RAID, striping)
- Cost optimization strategies
- Limitations and constraints

### Testing Strategy

#### Unit Tests
- [ ] Test data disk parameter generation
- [ ] Validate data disk `copy` loop generation
- [ ] Test cost calculation for multiple data disks

**Test Files:**
- `src/templates/__tests__/data-disks.test.ts` (new file, 15+ test cases)

#### Integration Tests
- [ ] Deploy VM with 0, 1, 4, 8 data disks
- [ ] Verify all data disks attached correctly
- [ ] Test different disk types and caching modes
- [ ] Validate disk performance

#### ARM-TTK Validation
- [ ] Validate templates with various data disk configurations
- [ ] Ensure `copy` loop syntax is correct

### Dependencies
- No new npm packages required

### Success Metrics
- [ ] Data disks configurable in UI (0-32 disks)
- [ ] All disk types and caching modes supported
- [ ] Cost estimates accurate for data disks
- [ ] Documentation complete and reviewed

---

## P1-4: Monitoring and Alert Rules

### Overview
Azure Monitor provides comprehensive monitoring and alerting for VMs. While the plugin has monitoring infrastructure (`src/monitoring/alerts.ts`), alert rules are **not auto-included** in generated templates. Enterprise customers expect monitoring alerts to be configured out-of-the-box.

### Business Impact
- **Enterprise Need:** Proactive monitoring and alerting for production workloads
- **SLA Compliance:** Alerts are critical for meeting SLA commitments
- **Operational Excellence:** Early detection of performance and availability issues

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- Alert engine exists: `src/monitoring/alerts.ts` ✅ (679 lines, comprehensive)
- Alert types: CPU, Memory, Cost Anomaly, Scaling Health ✅
- Alert resource generation: `toMetricAlertResource()`, `toScheduledQueryResource()` ✅
- Diagnostic settings helper: `src/modules/monitoring/diagnostics.ts` ✅

**Gap:**
- Alerts not auto-included in `mainTemplate.json.hbs`
- No alert configuration UI in `createUiDefinition.json.hbs`
- No default alert rules for common scenarios
- Missing action group configuration

### Acceptance Criteria

#### AC-1: Action Group Configuration
- [ ] Add action group resource to `mainTemplate.json.hbs`
- [ ] Add `alertEmailRecipients` parameter (comma-separated emails)
- [ ] Support multiple notification channels (email, SMS, webhook)
- [ ] Add `enableAlerts` parameter (default: `true`)

**Template Integration:**
```handlebars
{{#if parameters.enableAlerts}}
{
  "type": "Microsoft.Insights/actionGroups",
  "apiVersion": "2023-01-01",
  "name": "[concat(parameters('vmName'), '-action-group')]",
  "location": "Global",
  "properties": {
    "groupShortName": "[take(parameters('vmName'), 12)]",
    "enabled": true,
    "emailReceivers": [
      {
        "name": "Email_Notification",
        "emailAddress": "[parameters('alertEmailRecipients')]",
        "useCommonAlertSchema": true
      }
    ]
  }
}
{{/if}}
```

#### AC-2: CPU Alert Rule
- [ ] Add CPU alert rule resource (threshold: 80%, 5-min window)
- [ ] Use `MonitoringAlertEngine.createCpuAlert()` from monitoring module
- [ ] Link to action group for notifications
- [ ] Allow custom threshold in parameters

**Template Integration:**
```handlebars
{{#if parameters.enableAlerts}}
{
  "type": "Microsoft.Insights/metricAlerts",
  "apiVersion": "2018-03-01",
  "name": "[concat(parameters('vmName'), '-cpu-alert')]",
  "location": "global",
  "dependsOn": [
    "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]",
    "[resourceId('Microsoft.Insights/actionGroups', concat(parameters('vmName'), '-action-group'))]"
  ],
  "properties": {
    {{monitor:cpuAlert 
      resourceId=resourceId('Microsoft.Compute/virtualMachines', parameters.vmName)
      threshold=parameters.cpuAlertThreshold
      actionGroupId=resourceId('Microsoft.Insights/actionGroups', concat(parameters.vmName, '-action-group'))
    }}
  }
}
{{/if}}
```

#### AC-3: Memory Alert Rule
- [ ] Add memory alert rule resource (threshold: 512MB available, 10-min window)
- [ ] Use `MonitoringAlertEngine.createMemoryAlert()` from monitoring module
- [ ] Link to action group for notifications

#### AC-4: Disk Space Alert Rule
- [ ] Add disk space alert rule (threshold: 90% full, 30-min window)
- [ ] Monitor OS disk and data disks
- [ ] Use log query alert for disk metrics

#### AC-5: VM Availability Alert Rule
- [ ] Add VM availability alert rule (VM health probe)
- [ ] Alert on VM unavailability or crash
- [ ] Use metric alert on VM availability metric

#### AC-6: createUiDefinition.json Updates
- [ ] Add monitoring and alerts configuration blade to UI
- [ ] Alert enable/disable toggle (default: enabled)
- [ ] Email recipients input (comma-separated)
- [ ] Custom alert thresholds (CPU, Memory, Disk)
- [ ] Alert severity selection

**UI Element Example:**
```json
{
  "name": "monitoringConfiguration",
  "type": "Microsoft.Common.Section",
  "label": "Monitoring and Alerts",
  "elements": [
    {
      "name": "enableAlerts",
      "type": "Microsoft.Common.CheckBox",
      "label": "Enable Monitoring Alerts",
      "defaultValue": true,
      "toolTip": "Enable automated monitoring alerts for this VM (recommended for production workloads)"
    },
    {
      "name": "alertEmailRecipients",
      "type": "Microsoft.Common.TextBox",
      "label": "Alert Email Recipients",
      "defaultValue": "",
      "toolTip": "Comma-separated email addresses to receive alert notifications (e.g., admin@contoso.com, ops@contoso.com)",
      "constraints": {
        "required": true,
        "regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(,[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})*$",
        "validationMessage": "Enter valid email addresses separated by commas"
      },
      "visible": "[steps('monitoringConfiguration').enableAlerts]"
    },
    {
      "name": "cpuAlertThreshold",
      "type": "Microsoft.Common.Slider",
      "min": 50,
      "max": 95,
      "label": "CPU Alert Threshold (%)",
      "subLabel": "%",
      "defaultValue": 80,
      "showStepMarkers": false,
      "toolTip": "Alert when CPU usage exceeds this threshold for 5 minutes",
      "visible": "[steps('monitoringConfiguration').enableAlerts]"
    },
    {
      "name": "memoryAlertThresholdMB",
      "type": "Microsoft.Common.Slider",
      "min": 256,
      "max": 2048,
      "label": "Memory Alert Threshold (MB Available)",
      "subLabel": "MB",
      "defaultValue": 512,
      "showStepMarkers": false,
      "toolTip": "Alert when available memory falls below this threshold",
      "visible": "[steps('monitoringConfiguration').enableAlerts]"
    },
    {
      "name": "alertsInfo",
      "type": "Microsoft.Common.InfoBox",
      "visible": "[steps('monitoringConfiguration').enableAlerts]",
      "options": {
        "icon": "Info",
        "text": "Default alerts: CPU > 80%, Memory < 512MB, Disk > 90% full, VM unavailable"
      }
    }
  ]
}
```

#### AC-7: Handlebars Helper Registration
- [ ] Register monitoring alert helpers in `src/monitoring/helpers.ts`
- [ ] Create helpers: `monitor:cpuAlert`, `monitor:memoryAlert`, `monitor:diskAlert`, `monitor:availabilityAlert`
- [ ] Export alert resource generation functions

**Helper Example:**
```typescript
Handlebars.registerHelper('monitor:cpuAlert', function(options: any) {
  const hash = options.hash;
  const alertDef = MonitoringAlertEngine.createCpuAlert({
    resourceId: hash.resourceId,
    threshold: hash.threshold || 80,
    actionGroupIds: [hash.actionGroupId],
  });
  return JSON.stringify(
    MonitoringAlertEngine.toMetricAlertResource(alertDef),
    null,
    2
  );
});
```

#### AC-8: Documentation
- [ ] Update `README.md` with monitoring and alerts section
- [ ] Reference `src/monitoring/alerts.ts` documentation
- [ ] Document alert customization procedures
- [ ] Provide troubleshooting guide for false positives

### Implementation Plan

#### Phase 1: Action Group and Alert Resources (1.5 days)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add action group, alert rules)
- `src/templates/parameters.json.hbs` (add alert parameters)

**Changes:**
- Add action group resource
- Add CPU, Memory, Disk, Availability alert rules
- Add proper dependency chains

#### Phase 2: Handlebars Helper Registration (0.5 days)
**Files to Create/Modify:**
- `src/monitoring/helpers.ts` (new file or modify existing)
- `src/index.ts` (register monitoring helpers)

**Changes:**
- Register alert helpers for template usage
- Expose `MonitoringAlertEngine` functions

#### Phase 3: UI Definition Updates (1 day)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add monitoring configuration blade)

**Changes:**
- Add alerts enable/disable toggle
- Add email recipients input
- Add custom threshold sliders
- Add validation

#### Phase 4: Documentation (0.5 days)
**Files to Update:**
- `README.md` (add monitoring section)

**Content:**
- Alert configuration examples
- Customization procedures
- Troubleshooting guide

### Testing Strategy

#### Unit Tests
- [ ] Test alert resource generation
- [ ] Validate action group configuration
- [ ] Test alert threshold customization

**Test Files:**
- `src/templates/__tests__/alerts.test.ts` (new file, 20+ test cases)

#### Integration Tests
- [ ] Deploy VM with alerts enabled
- [ ] Trigger test alerts (simulate CPU spike, memory pressure)
- [ ] Verify email notifications delivered
- [ ] Test alert auto-mitigation

#### ARM-TTK Validation
- [ ] Validate templates with alerts enabled and disabled
- [ ] Ensure proper dependency chains

### Dependencies
- Azure Monitor (Azure resource)
- Action Groups (Azure resource)
- Log Analytics workspace (for log-based alerts, reuse from diagnostics)

### Success Metrics
- [ ] Alerts auto-enabled by default in generated templates
- [ ] All default alert rules (CPU, Memory, Disk, Availability) included
- [ ] Email notifications working
- [ ] Documentation complete and reviewed

---

## P1-5: Azure Hybrid Benefit Configuration

### Overview
Azure Hybrid Benefit (AHUB) allows customers to use existing Windows Server and SQL Server licenses on Azure VMs, reducing costs by up to 40%. While the plugin has AHUB awareness in cost calculations, it lacks **explicit AHUB configuration** in generated templates and UI.

### Business Impact
- **Cost Savings:** 30-40% savings on Windows Server VMs for eligible customers
- **Marketplace Competitiveness:** AHUB is a key differentiator for enterprise customers
- **Compliance:** Customers need to manage license compliance

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- Cost analyzer supports AHUB: `src/cost/analyzer.ts` ✅
- Cost helpers reference AHUB: `src/cost/helpers.ts` (line 42, 69, 237-262) ✅
- CLI supports `--hybrid-benefit` flag: `src/index.ts` (line 922-923, 960-962) ✅
- AHUB savings calculator: `calculateHybridBenefitSavings()` ✅

**Gap:**
- No AHUB parameter in `mainTemplate.json.hbs`
- No AHUB UI in `createUiDefinition.json.hbs`
- No AHUB configuration in VM resource `licenseType` property
- Missing guidance on AHUB eligibility

### Acceptance Criteria

#### AC-1: ARM Template Parameter
- [ ] Add `licenseType` parameter to `mainTemplate.json.hbs`
- [ ] Support values: `None`, `Windows_Server`, `Windows_Client`
- [ ] Set default to `None` (pay-as-you-go)
- [ ] Add metadata explaining AHUB eligibility

**Parameter Definition:**
```json
{
  "licenseType": {
    "type": "string",
    "defaultValue": "None",
    "allowedValues": ["None", "Windows_Server", "Windows_Client"],
    "metadata": {
      "description": "License type for Azure Hybrid Benefit. Select 'Windows_Server' if you have Software Assurance or Windows Server subscription. Up to 40% cost savings."
    }
  }
}
```

#### AC-2: VM Resource Integration
- [ ] Update VM resource to include `licenseType` property
- [ ] Apply AHUB only for Windows VMs (not Linux)
- [ ] Add conditional logic for OS type

**Template Integration:**
```handlebars
{
  "type": "Microsoft.Compute/virtualMachines",
  "apiVersion": "2023-03-01",
  "name": "[parameters('vmName')]",
  "location": "[parameters('location')]",
  "properties": {
    {{#if (equals parameters.osType 'Windows')}}
    "licenseType": "[parameters('licenseType')]",
    {{/if}}
    "hardwareProfile": {
      "vmSize": "[parameters('vmSize')]"
    },
    ...
  }
}
```

#### AC-3: createUiDefinition.json Updates
- [ ] Add AHUB configuration to licensing blade
- [ ] Show AHUB toggle (default: disabled)
- [ ] Display estimated monthly savings with AHUB enabled
- [ ] Add info box explaining AHUB eligibility requirements
- [ ] Show AHUB only for Windows VMs

**UI Element Example:**
```json
{
  "name": "licensingConfiguration",
  "type": "Microsoft.Common.Section",
  "label": "Licensing",
  "elements": [
    {
      "name": "enableHybridBenefit",
      "type": "Microsoft.Common.CheckBox",
      "label": "Enable Azure Hybrid Benefit for Windows Server",
      "defaultValue": false,
      "toolTip": "Use your existing Windows Server licenses with Software Assurance on Azure. Up to 40% cost savings.",
      "visible": "[equals(steps('vmConfiguration').osType, 'Windows')]"
    },
    {
      "name": "hybridBenefitSavings",
      "type": "Microsoft.Common.InfoBox",
      "visible": "[and(equals(steps('vmConfiguration').osType, 'Windows'), steps('licensingConfiguration').enableHybridBenefit)]",
      "options": {
        "icon": "Info",
        "text": "[concat('Estimated savings: $', string(mul(steps('vmConfiguration').vmMonthlyCost, 0.4)), '/month (~40% discount on Windows licensing)')]"
      }
    },
    {
      "name": "hybridBenefitEligibility",
      "type": "Microsoft.Common.InfoBox",
      "visible": "[equals(steps('vmConfiguration').osType, 'Windows')]",
      "options": {
        "icon": "Warning",
        "text": "Azure Hybrid Benefit requires active Software Assurance or Windows Server subscription. Ensure your organization meets licensing requirements before enabling."
      }
    }
  ]
}
```

#### AC-4: Cost Estimation Integration
- [ ] Display AHUB savings in cost estimate section
- [ ] Show before/after cost comparison
- [ ] Use existing `calculateHybridBenefitSavings()` function

#### AC-5: Documentation
- [ ] Create `docs/AZURE_HYBRID_BENEFIT_GUIDE.md`
- [ ] Document AHUB eligibility requirements
- [ ] Provide guidance on Software Assurance and licensing compliance
- [ ] Include cost savings calculator examples
- [ ] Document limitations (Windows Server only, not Windows Client for production)

### Implementation Plan

#### Phase 1: ARM Template Updates (0.5 days)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add licenseType parameter, update VM resource)
- `src/templates/parameters.json.hbs` (add licenseType default value)

**Changes:**
- Add `licenseType` parameter
- Update VM resource to include `licenseType` property (conditional on Windows OS)

#### Phase 2: UI Definition Updates (1 day)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs` (add licensing configuration blade)

**Changes:**
- Add AHUB toggle
- Add cost savings display
- Add eligibility info box
- Add validation (show only for Windows VMs)

#### Phase 3: Cost Integration (0.5 days)
**Files to Modify:**
- `src/cost/helpers.ts` (ensure AHUB savings are exposed to UI)

**Changes:**
- Verify `cost:hybridBenefitSavings` helper is available
- Add helper for UI cost display

#### Phase 4: Documentation (0.5 days)
**Files to Create:**
- `docs/AZURE_HYBRID_BENEFIT_GUIDE.md` (comprehensive guide)

**Content:**
- AHUB eligibility requirements
- Software Assurance and licensing compliance
- Cost savings examples
- Limitations and caveats

### Testing Strategy

#### Unit Tests
- [ ] Test AHUB parameter generation
- [ ] Validate licenseType property in VM resource
- [ ] Test cost savings calculation

**Test Files:**
- `src/templates/__tests__/hybrid-benefit.test.ts` (new file, 10+ test cases)

#### Integration Tests
- [ ] Deploy Windows VM with AHUB enabled
- [ ] Deploy Windows VM without AHUB
- [ ] Verify licenseType property in deployed VM
- [ ] Validate cost savings in Azure portal

#### ARM-TTK Validation
- [ ] Validate templates with AHUB enabled and disabled
- [ ] Ensure licenseType is only set for Windows VMs

### Dependencies
- No new npm packages required

### Success Metrics
- [ ] AHUB configurable in UI (Windows VMs only)
- [ ] Cost savings displayed accurately
- [ ] Documentation complete and reviewed

---

## P1-6: Certification Test Tool Integration (Extended)

### Overview
This extends the P0-1 VHD validation work to provide **full certification workflow integration**, including automated testing, reporting, and Azure Partner Center submission preparation.

### Business Impact
- **Time to Market:** Reduces certification time from weeks to days
- **Quality Assurance:** Automated testing reduces certification failures
- **Operational Efficiency:** Eliminates manual certification steps

### Current State
**Implementation Status:** ❌ Missing (covered in P0-1 VHD validation)  

**Gap:**
- No automated certification test execution
- No certification report generation
- No Azure Partner Center submission automation
- Missing certification checklist and workflow documentation

### Acceptance Criteria

#### AC-1: Automated Certification Test Suite
- [ ] Integrate Azure VM Certification Test Tool
- [ ] Create automated test execution script
- [ ] Support batch testing (multiple VHDs)
- [ ] Generate detailed test reports (HTML, JSON, XML)

**CLI Command:**
```bash
azmp-plugin-vm certify \
  --vhd-path ./my-vm-image.vhd \
  --os-type Windows \
  --output-dir ./certification-reports \
  --run-full-suite
```

#### AC-2: Certification Report Generation
- [ ] Generate HTML certification report with pass/fail status
- [ ] Include test results, validation checks, recommendations
- [ ] Generate JSON report for API integration
- [ ] Generate XML report for Azure Partner Center submission

**Report Sections:**
- Executive summary (pass/fail, score)
- Detailed test results (VHD format, size, partitions, generalization)
- Security checks (credentials, malware scan)
- Performance benchmarks (boot time, disk I/O)
- Recommendations and next steps

#### AC-3: Azure Partner Center Integration
- [ ] Document submission workflow
- [ ] Generate submission checklist
- [ ] Provide API integration guide for automated submission
- [ ] Include certification evidence package (reports, screenshots, test logs)

#### AC-4: Certification Workflow Automation
- [ ] Create certification workflow script (bash/PowerShell)
- [ ] Support end-to-end workflow: Prepare → Validate → Test → Report → Submit
- [ ] Add progress tracking and status updates
- [ ] Include rollback and retry logic

#### AC-5: Documentation
- [ ] Create `docs/CERTIFICATION_WORKFLOW_GUIDE.md`
- [ ] Document end-to-end certification process
- [ ] Provide troubleshooting guide for common failures
- [ ] Include submission checklist

### Implementation Plan

#### Phase 1: Test Tool Integration (1 day)
**Files to Create:**
- `src/azure/certification-tests.ts` (test execution logic)
- `scripts/run-certification-tests.sh` (automation script)

**Changes:**
- Integrate Azure VM Certification Test Tool
- Create test execution wrapper
- Add batch testing support

#### Phase 2: Report Generation (1 day)
**Files to Create:**
- `src/azure/certification-report.ts` (report generation logic)
- `templates/certification-report.html.hbs` (HTML report template)

**Changes:**
- Generate HTML/JSON/XML reports
- Include test results, recommendations, screenshots

#### Phase 3: Workflow Automation (1 day)
**Files to Create:**
- `scripts/certification-workflow.sh` (end-to-end workflow)
- `docs/CERTIFICATION_WORKFLOW_GUIDE.md` (comprehensive guide)

**Changes:**
- Create automated workflow script
- Add progress tracking and error handling

#### Phase 4: Documentation (0.5 days)
**Files to Update:**
- `README.md` (add certification section)
- `docs/CERTIFICATION_WORKFLOW_GUIDE.md` (detailed guide)

**Content:**
- End-to-end certification process
- Submission checklist
- Troubleshooting guide

### Testing Strategy

#### Unit Tests
- [ ] Test certification test execution
- [ ] Validate report generation
- [ ] Test workflow automation

**Test Files:**
- `src/azure/__tests__/certification-tests.test.ts` (15+ test cases)

#### Integration Tests
- [ ] Run full certification workflow on sample VHD
- [ ] Verify all reports generated correctly
- [ ] Test submission package creation

### Dependencies
- Azure VM Certification Test Tool (external)
- Azure CLI (for API integration)

### Success Metrics
- [ ] Automated certification workflow end-to-end
- [ ] All report formats generated correctly
- [ ] Documentation complete and reviewed

---

## Implementation Timeline

### Week 1: Disk Configuration and Backup
- **Day 1-2:** P1-1 Disk Type Selection (ARM templates, UI, documentation)
- **Day 3-4:** P1-2 Backup Auto-Enable (ARM templates, UI, testing)

### Week 2: Data Disks and Monitoring
- **Day 5-6:** P1-3 Data Disk Support (ARM templates, UI, documentation)
- **Day 7-8:** P1-4 Monitoring and Alerts (Action groups, alert rules, UI)

### Week 3: AHUB and Certification
- **Day 9-10:** P1-5 Azure Hybrid Benefit (ARM templates, UI, documentation)
- **Day 11-12:** P1-6 Certification Tool Integration (test automation, reports, workflow)

---

## Rollout Plan

### Pre-Release Checklist
- [ ] All P1 features implemented and tested
- [ ] Unit tests passing (100% coverage for new code)
- [ ] Integration tests completed successfully
- [ ] ARM-TTK validation passing
- [ ] Documentation reviewed and approved
- [ ] Example templates generated and tested
- [ ] Changelog updated with P1 features

### Release Artifacts
- [ ] npm package: `@hoiltd/azmp-plugin-vm@1.12.0`
- [ ] Git tag: `v1.12.0`
- [ ] GitHub release notes
- [ ] Updated documentation on GitHub

### Post-Release Validation
- [ ] Deploy test VMs using new templates (all P1 features)
- [ ] Verify disk types, backup, data disks, alerts, AHUB working
- [ ] Validate certification workflow
- [ ] Monitor for issues/feedback (GitHub issues, npm downloads)

---

## Appendix: MCP Resource References

The following authoritative Microsoft/Azure documentation was used to define these P1 requirements:

1. **Azure Managed Disks Documentation**
   - Disk types (Standard HDD, Standard SSD, Premium SSD, Ultra Disk)
   - Performance characteristics (IOPS, throughput, latency)
   - Cost comparison and optimization

2. **Azure Backup Documentation**
   - Recovery Services Vault configuration
   - Backup policies and retention schedules
   - Cost estimation and optimization

3. **Azure Data Disks Documentation**
   - Data disk configuration (count, size, type, caching)
   - Performance tuning (RAID, striping)
   - Best practices for application data storage

4. **Azure Monitor Documentation**
   - Metric alerts and log alerts
   - Action groups and notification channels
   - Alert best practices and troubleshooting

5. **Azure Hybrid Benefit Documentation**
   - Eligibility requirements (Software Assurance)
   - Licensing compliance
   - Cost savings calculator

6. **Azure Marketplace Certification Process**
   - Certification test tool usage
   - Report generation and submission
   - Azure Partner Center integration

---

## Next Steps

1. **Review and Approval:** Product owner and stakeholders review this breakdown
2. **Sprint Planning:** Schedule P1 implementation after P0 completion (Q4 2025)
3. **Resource Allocation:** Assign developers to P1-1 through P1-6 tasks
4. **Kickoff:** Begin implementation on Day 1 of approved sprint (Week 1: Disk + Backup, Week 2: Data Disks + Monitoring, Week 3: AHUB + Certification)
5. **Daily Standups:** Track progress and address blockers
6. **Release:** Ship v1.12.0 with P1 features within 3 weeks

---

**Document Owner:** Codex AI Teammate  
**Reviewers:** Product Owner, Lead Developer, QA Lead  
**Approval Required:** ✅ Before implementation begins
