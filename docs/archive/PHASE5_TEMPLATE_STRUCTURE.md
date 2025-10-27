# Phase 5: Template Structure Design & Helper Integration Matrix

**Date**: October 25, 2025  
**Version**: v1.8.0  
**Status**: 🎯 **DAY 1 - STRUCTURAL DESIGN**

---

## 🏗️ Template Structure Overview

### mainTemplate.json.hbs Expansion Plan

**Current**: 200 lines (basic VM + networking)  
**Target**: 1200 lines (comprehensive VM + all features)  
**Expansion**: 6x growth with modular helper integration

### Template Sections

```
mainTemplate.json.hbs (1200 lines)
├── Schema & Version (5 lines)
├── Parameters (250 lines) ← 40 lines → 250 lines
│   ├── Basic VM parameters
│   ├── Monitoring parameters
│   ├── Cost optimization parameters
│   ├── Performance parameters
│   ├── HA/DR parameters
│   └── Feature toggle parameters
├── Variables (300 lines) ← 50 lines → 300 lines
│   ├── Resource naming (vm-resource-name helpers)
│   ├── Cost analysis (cost: helpers)
│   ├── Performance baselines (perf: helpers)
│   ├── HA configurations (availability: helpers)
│   └── Monitoring configurations
├── Resources (550 lines) ← 100 lines → 550 lines
│   ├── Networking (50 lines) ← existing
│   ├── Virtual Machine (50 lines) ← existing
│   ├── Monitoring (150 lines) ← NEW
│   ├── Alerts (100 lines) ← NEW
│   ├── Workbooks (80 lines) ← NEW
│   ├── HA Resources (70 lines) ← NEW
│   └── DR Resources (50 lines) ← NEW
└── Outputs (95 lines) ← 10 lines → 95 lines
    ├── Connection information
    ├── Monitoring URLs
    ├── Cost estimates
    ├── Performance metrics
    └── HA/DR status
```

---

## 📊 Helper Integration Matrix

### Parameters Section (250 lines)

| Helper Namespace | Helpers Used | Purpose | Lines |
|------------------|--------------|---------|-------|
| **Basic (existing)** | `vm-size`, `vm-image` | VM configuration | 40 |
| **monitor:** | Parameter descriptions | Monitoring config | 60 |
| **cost:** | Default values, descriptions | Cost parameters | 40 |
| **perf:** | Validation, defaults | Performance config | 40 |
| **availability:** | Zone validation | HA configuration | 40 |
| **recovery:** | Backup presets | DR configuration | 30 |

**Parameter Categories**:

1. **Basic VM Parameters** (40 lines) - EXISTING
   ```handlebars
   "vmName": { "type": "string" },
   "vmSize": { "type": "string", "defaultValue": "{{defaultVmSize}}" },
   "adminUsername": { "type": "string" },
   "authenticationType": { "type": "string" },
   "adminPasswordOrKey": { "type": "securestring" },
   "location": { "type": "string" }
   ```

2. **Monitoring Parameters** (60 lines) - NEW
   ```handlebars
   "enableMonitoring": {
     "type": "bool",
     "defaultValue": true,
     "metadata": {
       "description": "Enable comprehensive Azure Monitor integration"
     }
   },
   "logAnalyticsWorkspaceName": {
     "type": "string",
     "defaultValue": "[concat(parameters('vmName'), '-law')]"
   },
   "logAnalyticsRetentionDays": {
     "type": "int",
     "defaultValue": 30,
     "minValue": 30,
     "maxValue": 730
   },
   "enableApplicationInsights": {
     "type": "bool",
     "defaultValue": false
   },
   "alertEmailRecipients": {
     "type": "array",
     "defaultValue": []
   },
   "enableMetricAlerts": {
     "type": "bool",
     "defaultValue": true
   },
   "cpuAlertThreshold": {
     "type": "int",
     "defaultValue": 80,
     "minValue": 0,
     "maxValue": 100
   },
   "memoryAlertThreshold": {
     "type": "int",
     "defaultValue": 80
   },
   "enableWorkbooks": {
     "type": "bool",
     "defaultValue": false
   },
   "workbookTypes": {
     "type": "array",
     "defaultValue": ["vmHealth", "performance", "security"]
   }
   ```

3. **Cost Optimization Parameters** (40 lines) - NEW
   ```handlebars
   "enableCostOptimization": {
     "type": "bool",
     "defaultValue": false
   },
   "monthlyBudget": {
     "type": "int",
     "defaultValue": 0,
     "metadata": {
       "description": "Monthly budget in USD (0 = no budget)"
     }
   },
   "budgetAlertThresholds": {
     "type": "array",
     "defaultValue": [80, 100, 120]
   },
   "enableCostAlerts": {
     "type": "bool",
     "defaultValue": false
   },
   "rightSizingEnabled": {
     "type": "bool",
     "defaultValue": false,
     "metadata": {
       "description": "Enable automatic right-sizing recommendations"
     }
   }
   ```

4. **Performance Parameters** (40 lines) - NEW
   ```handlebars
   "enableAutoscale": {
     "type": "bool",
     "defaultValue": false
   },
   "minInstanceCount": {
     "type": "int",
     "defaultValue": 1,
     "minValue": 1,
     "maxValue": 100
   },
   "maxInstanceCount": {
     "type": "int",
     "defaultValue": 3,
     "minValue": 1,
     "maxValue": 1000
   },
   "cpuScaleOutThreshold": {
     "type": "int",
     "defaultValue": 75
   },
   "cpuScaleInThreshold": {
     "type": "int",
     "defaultValue": 25
   },
   "performanceProfile": {
     "type": "string",
     "defaultValue": "balanced",
     "allowedValues": ["lowCost", "balanced", "highPerformance"]
   }
   ```

5. **High Availability Parameters** (40 lines) - NEW
   ```handlebars
   "highAvailabilityMode": {
     "type": "string",
     "defaultValue": "none",
     "allowedValues": ["none", "availabilitySet", "availabilityZones", "vmss"],
     "metadata": {
       "description": "High availability deployment mode"
     }
   },
   "availabilityZones": {
     "type": "array",
     "defaultValue": ["1", "2", "3"]
   },
   "faultDomainCount": {
     "type": "int",
     "defaultValue": 2,
     "minValue": 1,
     "maxValue": 3
   },
   "updateDomainCount": {
     "type": "int",
     "defaultValue": 5,
     "minValue": 1,
     "maxValue": 20
   },
   "vmssOrchestrationMode": {
     "type": "string",
     "defaultValue": "Uniform",
     "allowedValues": ["Uniform", "Flexible"]
   }
   ```

6. **Disaster Recovery Parameters** (30 lines) - NEW
   ```handlebars
   "enableBackup": {
     "type": "bool",
     "defaultValue": false,
     "metadata": {
       "description": "Enable Azure Backup for VM"
     }
   },
   "backupPolicyPreset": {
     "type": "string",
     "defaultValue": "daily",
     "allowedValues": ["daily", "weekly", "monthly"]
   },
   "backupRetentionDays": {
     "type": "int",
     "defaultValue": 30,
     "minValue": 7,
     "maxValue": 9999
   },
   "enableSiteRecovery": {
     "type": "bool",
     "defaultValue": false
   }
   ```

---

### Variables Section (300 lines)

| Helper Namespace | Helpers Used | Purpose | Lines |
|------------------|--------------|---------|-------|
| **vm-resource-name** | Resource naming | Consistent naming | 30 |
| **cost:** | `calculateVmCost`, `rightSizeRecommendation` | Cost analysis | 80 |
| **perf:** | `baseline`, `loadPattern` | Performance metrics | 60 |
| **availability:** | Zone configs, SLA calculations | HA setup | 70 |
| **monitor:** | Log Analytics configs | Monitoring setup | 40 |
| **Common** | Networking, references | Existing logic | 20 |

**Variable Categories**:

1. **Resource Naming** (30 lines) - EXISTING + EXPAND
   ```handlebars
   "nicName": "{{vm-resource-name parameters('vmName') 'nic'}}",
   "publicIPAddressName": "{{vm-resource-name parameters('vmName') 'pip'}}",
   "virtualNetworkName": "{{vm-resource-name parameters('vmName') 'vnet'}}",
   "networkSecurityGroupName": "{{vm-resource-name parameters('vmName') 'nsg'}}",
   "lawName": "{{vm-resource-name parameters('vmName') 'law'}}",
   "appInsightsName": "{{vm-resource-name parameters('vmName') 'ai'}}",
   "vaultName": "{{vm-resource-name parameters('vmName') 'rsv'}}",
   "actionGroupName": "{{vm-resource-name parameters('vmName') 'ag'}}",
   "availabilitySetName": "{{vm-resource-name parameters('vmName') 'as'}}",
   "vmssName": "{{vm-resource-name parameters('vmName') 'vmss'}}"
   ```

2. **Cost Analysis Variables** (80 lines) - NEW
   ```handlebars
   "costAnalysis": {{cost:calculateVmCost 
     vmSize="[parameters('vmSize')]"
     region="[parameters('location')]"
     hoursPerMonth=730
     includeStorage=true
     includeNetworking=true
   }},
   "rightSizingRecommendation": {{cost:rightSizeRecommendation 
     vmSize="[parameters('vmSize')]"
     metrics="{}"
     utilizationThreshold=70
     considerCosts=true
   }},
   "reservedInstanceSavings": {{cost:reservedInstanceSavings 
     vmSize="[parameters('vmSize')]"
     region="[parameters('location')]"
     termYears=1
     paymentOption="monthly"
   }},
   "hybridBenefitSavings": {{cost:hybridBenefitSavings 
     vmSize="[parameters('vmSize')]"
     osType="Windows"
     licenses=1
   }},
   "spotInstanceSavings": {{cost:spotInstanceSavings 
     vmSize="[parameters('vmSize')]"
     region="[parameters('location')]"
     evictionPolicy="Deallocate"
   }}
   ```

3. **Performance Baseline Variables** (60 lines) - NEW
   ```handlebars
   "performanceBaseline": {{perf:baseline 
     vmSize="[parameters('vmSize')]"
   }},
   "expectedWorkloadPattern": {{perf:loadPattern 
     metrics="{}"
     timeRange="7d"
   }},
   "autoscaleConfig": {{#if parameters('enableAutoscale')}}
     {{perf:autoscaleConfig 
       resourceUri="[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
       loadPattern="{}"
       minInstances="[parameters('minInstanceCount')]"
       maxInstances="[parameters('maxInstanceCount')]"
     }}
   {{else}}null{{/if}},
   "diskOptimizationRecommendation": {{perf:diskOptimization 
     currentTier="Premium_LRS"
     vmSize="[parameters('vmSize')]"
     metrics="{}"
   }}
   ```

4. **High Availability Configuration** (70 lines) - NEW
   ```handlebars
   "availabilityZonesSupported": {{availability:supportsZones 
     vmSize="[parameters('vmSize')]"
     region="[parameters('location')]"
   }},
   "recommendedZoneDistribution": {{availability:recommendZoneDistribution 
     instanceCount="[parameters('maxInstanceCount')]"
     region="[parameters('location')]"
   }},
   "availabilitySetConfig": {{#if (eq parameters('highAvailabilityMode') 'availabilitySet')}}
     {{availability:set 
       name="[variables('availabilitySetName')]"
       location="[parameters('location')]"
       faultDomains="[parameters('faultDomainCount')]"
       updateDomains="[parameters('updateDomainCount')]"
       managed=true
     }}
   {{else}}null{{/if}},
   "zoneConfig": {{#if (eq parameters('highAvailabilityMode') 'availabilityZones')}}
     {{availability:zones 
       zones="[parameters('availabilityZones')]"
       vmSize="[parameters('vmSize')]"
       region="[parameters('location')]"
     }}
   {{else}}null{{/if}},
   "expectedSLA": {{#if (eq parameters('highAvailabilityMode') 'availabilityZones')}}
     {{availability:zoneSLA vmSize="[parameters('vmSize')]"}}
   {{else if (eq parameters('highAvailabilityMode') 'availabilitySet')}}
     {{availability:setSLA}}
   {{else}}
     "99.9"
   {{/if}}
   ```

5. **Monitoring Configuration** (40 lines) - NEW
   ```handlebars
   "diagnosticSettingsConfig": {{#if parameters('enableMonitoring')}}
     {{monitor:diagnosticSettings 
       resourceType="Microsoft.Compute/virtualMachines"
       logAnalyticsWorkspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', variables('lawName'))]"
       metrics=true
       logs=true
     }}
   {{else}}null{{/if}},
   "dataCollectionRuleConfig": {{monitor:dataCollectionRule 
     performanceCounters=true
     windowsEventLogs=true
     syslog=true
     samplingFrequency="PT1M"
   }}
   ```

---

### Resources Section (550 lines)

| Helper Namespace | Resource Types | Helpers Used | Lines |
|------------------|----------------|--------------|-------|
| **Networking** | VNet, NSG, NIC, PIP | `vm-resource-name` | 100 |
| **VM** | Virtual Machine | `vm-image`, `vm-size` | 50 |
| **Monitoring** | Log Analytics, App Insights | `monitor:*` | 150 |
| **Alerts** | Metric Alerts, Action Groups | `alert:*` | 100 |
| **Workbooks** | Azure Workbooks | `workbook:*`, `dashboard:*` | 80 |
| **HA** | Availability Set/Zones, VMSS | `availability:*` | 70 |
| **DR** | Recovery Vault, Backup Policy | `recovery:*` | 50 |

**Resource Organization**:

1. **Networking Resources** (100 lines) - EXISTING
   - Public IP Address
   - Network Security Group
   - Virtual Network
   - Network Interface
   
2. **Virtual Machine** (50 lines) - EXISTING
   - Core VM configuration
   - OS profile
   - Storage profile
   - Network profile

3. **Monitoring Resources** (150 lines) - NEW
   ```handlebars
   {{#if parameters('enableMonitoring')}}
   {{{monitor:logAnalyticsWorkspace 
     name="[variables('lawName')]"
     location="[parameters('location')]"
     sku="PerGB2018"
     retentionDays="[parameters('logAnalyticsRetentionDays')]"
     publicNetworkAccess="Enabled"
   }}},
   {{{monitor:diagnosticSettings 
     name="[concat(parameters('vmName'), '-diagnostics')]"
     resourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
     workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', variables('lawName'))]"
     logs=true
     metrics=true
   }}}
   {{#if parameters('enableApplicationInsights')}}
   ,{{{monitor:applicationInsights 
     name="[variables('appInsightsName')]"
     location="[parameters('location')]"
     applicationType="web"
     workspaceResourceId="[resourceId('Microsoft.OperationalInsights/workspaces', variables('lawName'))]"
     samplingPercentage=100
   }}}
   {{/if}}
   {{/if}}
   ```

4. **Alert Resources** (100 lines) - NEW
   ```handlebars
   {{#if parameters('enableMetricAlerts')}}
   {{{alert:actionGroup 
     name="[variables('actionGroupName')]"
     shortName="VMAlerts"
     emailReceivers="[parameters('alertEmailRecipients')]"
   }}},
   {{{alert:metricAlert 
     name="[concat(parameters('vmName'), '-cpu-alert')]"
     targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
     metricName="Percentage CPU"
     operator="GreaterThan"
     threshold="[parameters('cpuAlertThreshold')]"
     severity=2
     frequency="PT1M"
     windowSize="PT5M"
     actionGroupIds="[array(resourceId('Microsoft.Insights/actionGroups', variables('actionGroupName')))]"
   }}},
   {{{alert:dynamicMetricAlert 
     name="[concat(parameters('vmName'), '-anomaly-alert')]"
     targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
     metricName="Percentage CPU"
     operator="GreaterOrLessThan"
     alertSensitivity="Medium"
     severity=3
     actionGroupIds="[array(resourceId('Microsoft.Insights/actionGroups', variables('actionGroupName')))]"
   }}}
   {{/if}}
   ```

5. **Workbook Resources** (80 lines) - NEW
   ```handlebars
   {{#if parameters('enableWorkbooks')}}
   {{#each parameters('workbookTypes')}}
   {{#if (eq this 'vmHealth')}}
   ,{{{dashboard:vmHealth 
     name="[concat(parameters('vmName'), '-health-workbook')]"
     location="[parameters('location')]"
     vmResourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
   }}}
   {{/if}}
   {{#if (eq this 'performance')}}
   ,{{{workbook:performanceAnalysis 
     name="[concat(parameters('vmName'), '-performance-workbook')]"
     location="[parameters('location')]"
     vmResourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
   }}}
   {{/if}}
   {{#if (eq this 'security')}}
   ,{{{workbook:securityPosture 
     name="[concat(parameters('vmName'), '-security-workbook')]"
     location="[parameters('location')]"
     vmResourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
   }}}
   {{/if}}
   {{/each}}
   {{/if}}
   ```

6. **High Availability Resources** (70 lines) - NEW
   ```handlebars
   {{#if (eq parameters('highAvailabilityMode') 'availabilitySet')}}
   {{{availability:set 
     name="[variables('availabilitySetName')]"
     location="[parameters('location')]"
     faultDomains="[parameters('faultDomainCount')]"
     updateDomains="[parameters('updateDomainCount')]"
     managed=true
   }}}
   {{/if}}
   {{#if (eq parameters('highAvailabilityMode') 'vmss')}}
   {{{availability:vmssUniform 
     name="[variables('vmssName')]"
     location="[parameters('location')]"
     vmSize="[parameters('vmSize')]"
     capacity="[parameters('minInstanceCount')]"
     osImage="[parameters('osImage')]"
     upgradePolicy="Manual"
   }}}
   {{#if parameters('enableAutoscale')}}
   ,{{{availability:vmssAutoscale 
     name="[concat(variables('vmssName'), '-autoscale')]"
     targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
     minCapacity="[parameters('minInstanceCount')]"
     maxCapacity="[parameters('maxInstanceCount')]"
     defaultCapacity="[parameters('minInstanceCount')]"
     cpuScaleOut="[parameters('cpuScaleOutThreshold')]"
     cpuScaleIn="[parameters('cpuScaleInThreshold')]"
   }}}
   {{/if}}
   {{/if}}
   ```

7. **Disaster Recovery Resources** (50 lines) - NEW
   ```handlebars
   {{#if parameters('enableBackup')}}
   {{{recovery:vault 
     name="[variables('vaultName')]"
     location="[parameters('location')]"
     sku="Standard"
   }}},
   {{{recovery:backupPolicy 
     vaultName="[variables('vaultName')]"
     policyName="[concat(variables('vaultName'), '-policy')]"
     preset="[parameters('backupPolicyPreset')]"
     retentionDays="[parameters('backupRetentionDays')]"
   }}},
   {{{recovery:enableVMBackup 
     vmName="[parameters('vmName')]"
     vaultName="[variables('vaultName')]"
     policyName="[concat(variables('vaultName'), '-policy')]"
   }}}
   {{/if}}
   ```

---

### Outputs Section (95 lines)

| Category | Outputs | Purpose | Lines |
|----------|---------|---------|-------|
| **Connection** | Hostname, SSH/RDP | Access information | 15 |
| **Monitoring** | URLs, Resource IDs | Monitoring access | 30 |
| **Cost** | Estimates, Savings | Cost information | 20 |
| **Performance** | Baselines, Metrics | Performance data | 15 |
| **HA/DR** | SLA, Status | Availability info | 15 |

**Output Categories**:

1. **Connection Information** (15 lines) - EXISTING
   ```handlebars
   "hostname": {
     "type": "string",
     "value": "[reference(variables('publicIPAddressName')).ipAddress]"
   },
   "sshCommand": {
     "type": "string",
     "value": "[concat('ssh ', parameters('adminUsername'), '@', reference(variables('publicIPAddressName')).ipAddress)]"
   }
   ```

2. **Monitoring Outputs** (30 lines) - NEW
   ```handlebars
   {{#if parameters('enableMonitoring')}}
   "logAnalyticsWorkspaceId": {
     "type": "string",
     "value": "[resourceId('Microsoft.OperationalInsights/workspaces', variables('lawName'))]"
   },
   "logAnalyticsWorkspaceUrl": {
     "type": "string",
     "value": "[concat('https://portal.azure.com/#resource', resourceId('Microsoft.OperationalInsights/workspaces', variables('lawName')))]"
   },
   {{#if parameters('enableApplicationInsights')}}
   "applicationInsightsKey": {
     "type": "string",
     "value": "[reference(resourceId('Microsoft.Insights/components', variables('appInsightsName'))).InstrumentationKey]"
   },
   {{/if}}
   {{#if parameters('enableWorkbooks')}}
   "workbookUrls": {
     "type": "array",
     "value": [
       "[concat('https://portal.azure.com/#resource', resourceId('Microsoft.Insights/workbooks', concat(parameters('vmName'), '-health-workbook')))]"
     ]
   },
   {{/if}}
   {{/if}}
   ```

3. **Cost Analysis Outputs** (20 lines) - NEW
   ```handlebars
   {{#if parameters('enableCostOptimization')}}
   "estimatedMonthlyCost": {
     "type": "object",
     "value": "[variables('costAnalysis')]",
     "metadata": {
       "description": "Estimated monthly cost breakdown"
     }
   },
   "rightSizingRecommendation": {
     "type": "object",
     "value": "[variables('rightSizingRecommendation')]"
   },
   "reservedInstanceSavings": {
     "type": "object",
     "value": "[variables('reservedInstanceSavings')]"
   },
   {{/if}}
   ```

4. **Performance Outputs** (15 lines) - NEW
   ```handlebars
   "performanceBaseline": {
     "type": "object",
     "value": "[variables('performanceBaseline')]",
     "metadata": {
       "description": "Expected performance characteristics"
     }
   },
   {{#if parameters('enableAutoscale')}}
   "autoscaleConfiguration": {
     "type": "object",
     "value": "[variables('autoscaleConfig')]"
   },
   {{/if}}
   ```

5. **High Availability Outputs** (15 lines) - NEW
   ```handlebars
   "highAvailabilityMode": {
     "type": "string",
     "value": "[parameters('highAvailabilityMode')]"
   },
   "expectedSLA": {
     "type": "string",
     "value": "[variables('expectedSLA')]",
     "metadata": {
       "description": "Expected SLA percentage"
     }
   },
   {{#if parameters('enableBackup')}}
   "backupVaultId": {
     "type": "string",
     "value": "[resourceId('Microsoft.RecoveryServices/vaults', variables('vaultName'))]"
   },
   {{/if}}
   ```

---

## 🎯 Implementation Strategy

### Incremental Expansion Approach

**Phase 1: Parameters (Day 2)**
- Add monitoring parameters (60 lines)
- Add cost parameters (40 lines)
- Add performance parameters (40 lines)
- Total: 140 new lines → 180 total parameter lines

**Phase 2: Variables (Day 2-3)**
- Add cost analysis variables (80 lines)
- Add performance baseline variables (60 lines)
- Total: 140 new lines → 190 total variable lines

**Phase 3: Monitoring Resources (Day 2)**
- Add Log Analytics (30 lines)
- Add Application Insights (25 lines)
- Add Diagnostic Settings (25 lines)
- Add Alerts (100 lines)
- Add Workbooks (80 lines)
- Total: 260 new lines → 360 total resource lines

**Phase 4: HA/DR Parameters & Resources (Day 4)**
- Add HA parameters (40 lines)
- Add DR parameters (30 lines)
- Add HA resources (70 lines)
- Add DR resources (50 lines)
- Total: 190 new lines → 550 total resource lines

**Phase 5: Outputs (Day 4)**
- Add monitoring outputs (30 lines)
- Add cost outputs (20 lines)
- Add performance outputs (15 lines)
- Add HA/DR outputs (15 lines)
- Total: 80 new lines → 95 total output lines

**Final Template Size**: ~1200 lines ✅

---

## ✅ Validation Checkpoints

### After Each Addition:

1. **Syntax Validation**
   ```bash
   npm run build  # TypeScript compilation
   ```

2. **Template Generation**
   ```bash
   # Test template generates valid JSON
   node test-cli.js template generate --fixture basic-vm.json
   ```

3. **JSON Validation**
   ```bash
   # Validate against ARM schema
   jq empty generated/mainTemplate.json
   ```

4. **Helper Validation**
   ```bash
   # Verify all helpers resolve
   grep -o '{{[^}]*}}' templates/mainTemplate.json.hbs | sort -u
   ```

5. **Test Execution**
   ```bash
   npm test  # All tests must pass
   ```

---

## 📋 Day 1 Completion Checklist

- [x] Template structure documented
- [x] Helper integration matrix created
- [x] 200 → 1200 line expansion planned
- [ ] Section-by-section implementation roadmap
- [ ] Validation strategy defined
- [ ] Ready to begin Day 2 implementation

---

## 🎯 Next Steps (Day 2)

**Tomorrow's Focus**: Monitoring & Observability Integration

1. Add monitoring parameters (60 lines)
2. Add monitoring variables (40 lines)
3. Add monitoring resources (260 lines)
4. Add monitoring outputs (30 lines)
5. Write 10 monitoring tests
6. Validate template generation

**Target**: mainTemplate grows from 200 → 590 lines ✅

---

**Status**: 🎯 **DAY 1 COMPLETE - STRUCTURE DESIGNED**  
**Next**: 🚀 **DAY 2 - MONITORING INTEGRATION**
