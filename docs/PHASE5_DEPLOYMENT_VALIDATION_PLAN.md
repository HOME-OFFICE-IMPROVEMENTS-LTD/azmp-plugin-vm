# Phase 5: Day 8+ - Live Azure Deployment Validation Plan

**Status**: 🎯 Ready for Execution  
**Prerequisites**: Days 1-7 Complete (f7bb4b6)  
**Test Count**: 540 passing tests  
**Templates**: mainTemplate.json.hbs (1071 lines), createUiDefinition.json.hbs (715 lines), viewDefinition.json.hbs (298 lines)

---

## 📋 Validation Objectives

### Primary Goals
1. ✅ Verify template generation from Handlebars
2. ✅ Validate Azure Portal UI wizard (5-step flow)
3. ✅ Deploy all 12+ ARM resources successfully
4. ✅ Test monitoring/cost/performance/HA/DR functionality
5. ✅ Validate managed application views in Portal
6. ✅ Document deployment workflow

### Success Criteria
- [ ] All 3 templates generate without errors
- [ ] Portal wizard accepts createUiDefinition
- [ ] Deployment completes successfully
- [ ] All resources appear in resource group
- [ ] Monitoring data flows within 10 minutes
- [ ] View definition displays correctly in Portal
- [ ] SSH access to VM works
- [ ] All outputs are valid

---

## 🔧 Prerequisites Setup

### 1. Azure Subscription Access
```bash
# Login to Azure
az login

# Verify subscription access
az account list --output table

# Set default subscription (if needed)
az account set --subscription "<SUBSCRIPTION_ID>"

# Verify current subscription
az account show --output table
```

### 2. Resource Group Creation
```bash
# Create resource group in East US
az group create \
  --name "rg-azmp-vm-test" \
  --location "eastus" \
  --tags "Environment=Test" "Project=AZMP-Plugin-VM" "Phase=5-Validation"

# Verify creation
az group show --name "rg-azmp-vm-test"
```

### 3. Build and Generate Templates
```bash
# Navigate to plugin directory
cd ~/Projects/azmp-plugin-vm

# Build TypeScript
npm run build

# Generate ARM templates from Handlebars
# Option 1: Using CLI command
node dist/index.js # or azmp vm template generate --output ./test-deployment

# Option 2: Manual compilation (if CLI not available)
mkdir -p test-deployment
# Copy templates and compile manually
```

---

## 📝 Phase 1: Template Generation & Validation

### Step 1.1: Generate Templates
```bash
# Create test configuration
cat > test-deployment-config.json << 'EOF'
{
  "vmName": "azmp-test-vm",
  "adminUsername": "azureadmin",
  "location": "eastus",
  "vmSize": "Standard_B2s",
  "enableMonitoring": true,
  "enableHighAvailability": true,
  "enableDisasterRecovery": true,
  "enableBackup": true
}
EOF

# Generate templates using CLI
azmp vm template generate \
  --config test-deployment-config.json \
  --output ./test-deployment

# Verify generated files
ls -lh test-deployment/
# Expected output:
# - mainTemplate.json
# - createUiDefinition.json
# - viewDefinition.json
```

**Validation Checks**:
- [ ] mainTemplate.json exists (should be ~50-60KB)
- [ ] createUiDefinition.json exists (should be ~35-40KB)
- [ ] viewDefinition.json exists (should be ~15-20KB)
- [ ] All files are valid JSON
- [ ] No Handlebars syntax remains (no `{{` or `}}`)

### Step 1.2: Validate JSON Syntax
```bash
# Validate JSON syntax using jq
jq empty test-deployment/mainTemplate.json && echo "✓ mainTemplate.json valid"
jq empty test-deployment/createUiDefinition.json && echo "✓ createUiDefinition.json valid"
jq empty test-deployment/viewDefinition.json && echo "✓ viewDefinition.json valid"

# Check resource count in mainTemplate
jq '.resources | length' test-deployment/mainTemplate.json
# Expected: 12+ resources

# Check output count
jq '.outputs | length' test-deployment/mainTemplate.json
# Expected: 11 outputs
```

### Step 1.3: Validate with CLI
```bash
# Use plugin's validation command
azmp vm template validate test-deployment --parameters

# Expected output:
# ✓ mainTemplate.json is well-formed JSON
# ✓ Schema is valid
# ✓ Found 12+ resource(s)
# ✓ Found 11 output(s)
# ✓ createUiDefinition.json is well-formed JSON
# ✓ Schema is valid
# ✓ Found 5 wizard step(s)
# ✓ viewDefinition.json is well-formed JSON
# ✓ Schema is valid
# ✓ Found 6 view(s)
# ✓ All UI outputs map to mainTemplate parameters
```

### Step 1.4: ARM-TTK Validation (Optional but Recommended)
```bash
# If ARM-TTK is available
Test-AzTemplate -TemplatePath ./test-deployment

# Expected: All tests pass or warnings only
```

---

## 🌐 Phase 2: Azure Portal UI Wizard Testing

### Step 2.1: Create Custom Deployment
1. Navigate to Azure Portal: https://portal.azure.com
2. Search for "Deploy a custom template"
3. Click "Build your own template in the editor"
4. Paste `mainTemplate.json` content
5. Click "Save"

**Validation Checks**:
- [ ] Template loads without errors
- [ ] Parameters section displays correctly

### Step 2.2: Test UI Definition (Recommended Method)
Since we have a `createUiDefinition.json`, use the UI Definition Sandbox:

1. Navigate to: https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade
2. Paste `createUiDefinition.json` content
3. Click "Preview"

**Test Each Step**:

**Step 1: Basics**
- [ ] VM Name field (required, regex validation)
- [ ] Admin Username field (required)
- [ ] Authentication Type selector (SSH/Password)
- [ ] SSH Key / Password field (conditional display)
- [ ] Location dropdown

**Step 2: Monitoring**
- [ ] Enable Monitoring toggle
- [ ] Log Analytics workspace name (conditional, visible when monitoring enabled)
- [ ] Log retention days slider (30-730 range)
- [ ] Enable Application Insights toggle
- [ ] Alert email recipients field

**Step 3: Cost & Performance**
- [ ] Performance Profile dropdown (Basic/Standard/Premium)
- [ ] VM Size selector
- [ ] Enable Cost Optimization toggle
- [ ] Monthly Budget Limit field (conditional)
- [ ] Enable Performance Optimization toggle
- [ ] Autoscale settings (min/max instances, conditional)

**Step 4: High Availability**
- [ ] Enable High Availability toggle
- [ ] Availability Option selector (None/Set/Zones/VMSS)
- [ ] Zone selection (conditional, visible when Zones selected)
- [ ] Fault/Update domain fields (conditional, visible when Set selected)

**Step 5: Disaster Recovery**
- [ ] Enable Disaster Recovery toggle
- [ ] Enable Backup toggle
- [ ] Backup schedule time (HH:MM format validation)
- [ ] Backup retention days (7-9999 range)
- [ ] Recovery Region selector

**Validation Rules to Test**:
- [ ] VM Name regex: `^[a-z][a-z0-9-]{1,63}$`
- [ ] Backup time format: `^([01]?[0-9]|2[0-3]):[0-5][0-9]$`
- [ ] Min instances < Max instances validation
- [ ] Conditional field visibility works correctly

### Step 2.3: Export Parameters
After configuring all wizard steps:
1. Click "Review + Create"
2. Click "Download a template for automation"
3. Save `parameters.json` for deployment

---

## 🚀 Phase 3: Live Deployment

### Step 3.1: Create Parameters File
```bash
# Create parameters file with test values
cat > test-deployment/parameters.json << 'EOF'
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vmName": { "value": "azmp-test-vm-01" },
    "adminUsername": { "value": "azureadmin" },
    "authenticationType": { "value": "sshPublicKey" },
    "adminPasswordOrKey": { "value": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC..." },
    "vmSize": { "value": "Standard_B2s" },
    "performanceProfile": { "value": "Standard" },
    "enableMonitoring": { "value": true },
    "logAnalyticsWorkspaceName": { "value": "azmp-law-test-01" },
    "logAnalyticsRetentionDays": { "value": 30 },
    "enableApplicationInsights": { "value": true },
    "alertEmailRecipients": { "value": "devops@example.com" },
    "enableCostOptimization": { "value": true },
    "monthlyBudgetLimit": { "value": 100 },
    "enablePerformanceOptimization": { "value": true },
    "autoscaleMinInstances": { "value": 1 },
    "autoscaleMaxInstances": { "value": 3 },
    "enableHighAvailability": { "value": true },
    "availabilityOption": { "value": "AvailabilitySet" },
    "availabilityZones": { "value": [] },
    "faultDomainCount": { "value": 2 },
    "updateDomainCount": { "value": 5 },
    "enableDisasterRecovery": { "value": true },
    "enableBackup": { "value": true },
    "backupScheduleTime": { "value": "02:00" },
    "backupRetentionDays": { "value": 30 },
    "recoveryRegion": { "value": "westus2" }
  }
}
EOF
```

### Step 3.2: Deploy via Azure CLI
```bash
# Deploy using Azure CLI
az deployment group create \
  --name "azmp-vm-test-deployment-$(date +%Y%m%d-%H%M%S)" \
  --resource-group "rg-azmp-vm-test" \
  --template-file test-deployment/mainTemplate.json \
  --parameters @test-deployment/parameters.json \
  --verbose

# Monitor deployment status
az deployment group show \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "properties.provisioningState"
```

**Expected Duration**: 10-15 minutes

**Validation During Deployment**:
- [ ] Deployment starts successfully
- [ ] No ARM template errors
- [ ] Progress updates show resource creation
- [ ] No validation errors

### Step 3.3: Monitor Deployment Progress
```bash
# Watch deployment in real-time
az deployment group list \
  --resource-group "rg-azmp-vm-test" \
  --output table

# Check for errors
az deployment operation group list \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "[?properties.provisioningState=='Failed']"
```

---

## ✅ Phase 4: Resource Verification

### Step 4.1: Verify All Resources Created
```bash
# List all resources in group
az resource list \
  --resource-group "rg-azmp-vm-test" \
  --output table

# Count resources
az resource list \
  --resource-group "rg-azmp-vm-test" \
  --query "length(@)"
# Expected: 12+ resources
```

**Expected Resources** (12+ total):

**Networking (5)**:
- [ ] Virtual Network (Microsoft.Network/virtualNetworks)
- [ ] Subnet (part of VNet)
- [ ] Network Security Group (Microsoft.Network/networkSecurityGroups)
- [ ] Public IP Address (Microsoft.Network/publicIPAddresses)
- [ ] Network Interface (Microsoft.Network/networkInterfaces)

**Compute (1)**:
- [ ] Virtual Machine (Microsoft.Compute/virtualMachines)

**Monitoring (6)**:
- [ ] Log Analytics Workspace (Microsoft.OperationalInsights/workspaces)
- [ ] Application Insights (Microsoft.Insights/components)
- [ ] Action Group (Microsoft.Insights/actionGroups)
- [ ] Diagnostic Settings (on VM)
- [ ] Metric Alert (Microsoft.Insights/metricAlerts)
- [ ] Workbook (Microsoft.Insights/workbooks)

**Cost Management (1)**:
- [ ] Budget (Microsoft.Consumption/budgets)

**Performance (1)**:
- [ ] Autoscale Setting (Microsoft.Insights/autoscaleSettings)

**High Availability (1)**:
- [ ] Availability Set (Microsoft.Compute/availabilitySets)

**Disaster Recovery (3)**:
- [ ] Recovery Services Vault (Microsoft.RecoveryServices/vaults)
- [ ] Backup Policy (Microsoft.RecoveryServices/vaults/backupPolicies)
- [ ] Protected Item (Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems)

### Step 4.2: Verify Deployment Outputs
```bash
# Get deployment outputs
az deployment group show \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "properties.outputs"

# Extract specific outputs
az deployment group show \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "properties.outputs.hostname.value" -o tsv

az deployment group show \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "properties.outputs.sshCommand.value" -o tsv
```

**Expected Outputs (11)**:
- [ ] hostname (VM hostname)
- [ ] sshCommand (SSH connection string)
- [ ] logAnalyticsWorkspaceId (Workspace resource ID)
- [ ] logAnalyticsWorkspaceUrl (Portal URL)
- [ ] applicationInsightsKey (Instrumentation key)
- [ ] applicationInsightsConnectionString (Connection string)
- [ ] monitoringStatus (Object with 5 fields)
- [ ] costAnalysis (Object with cost data)
- [ ] performanceMetrics (Object with perf config)
- [ ] highAvailabilityStatus (Object with HA config)
- [ ] disasterRecoveryStatus (Object with DR config)
- [ ] resilienceScore (Object with tier calculation)

---

## 🔍 Phase 5: Functional Testing

### Step 5.1: VM Connectivity Test
```bash
# Get SSH command from output
SSH_COMMAND=$(az deployment group show \
  --name "azmp-vm-test-deployment-<TIMESTAMP>" \
  --resource-group "rg-azmp-vm-test" \
  --query "properties.outputs.sshCommand.value" -o tsv)

# Test SSH connection
eval $SSH_COMMAND "echo 'Connection successful'"

# Check VM status
az vm get-instance-view \
  --resource-group "rg-azmp-vm-test" \
  --name "azmp-test-vm-01" \
  --query "instanceView.statuses[?starts_with(code, 'PowerState/')].displayStatus" -o tsv
# Expected: VM running
```

**SSH Tests**:
- [ ] SSH connection succeeds
- [ ] VM is running Ubuntu 22.04 LTS
- [ ] Azure Monitor Agent is installed
- [ ] Backup extension is present

### Step 5.2: Monitoring Data Flow Test
```bash
# Wait 5-10 minutes for initial data flow

# Query Log Analytics for VM metrics
az monitor log-analytics query \
  --workspace "<WORKSPACE_ID>" \
  --analytics-query "Heartbeat | where Computer contains 'azmp-test-vm' | take 10" \
  --timespan P1D

# Check Application Insights data
az monitor app-insights metrics show \
  --app "<APP_INSIGHTS_NAME>" \
  --resource-group "rg-azmp-vm-test" \
  --metric "requests/count"
```

**Monitoring Checks**:
- [ ] Heartbeat data appears in Log Analytics (within 10 minutes)
- [ ] Performance counters are being collected
- [ ] Application Insights receives telemetry
- [ ] Metric alerts are configured and active
- [ ] Action group email recipients are correct

### Step 5.3: Cost Management Test
```bash
# Check budget configuration
az consumption budget list \
  --resource-group "rg-azmp-vm-test"

# Verify budget details
az consumption budget show \
  --budget-name "<BUDGET_NAME>" \
  --resource-group "rg-azmp-vm-test"
```

**Cost Checks**:
- [ ] Budget is created with $100 limit
- [ ] Alert thresholds: 80% actual, 90% forecasted
- [ ] Email notifications configured
- [ ] Cost tags applied to resources

### Step 5.4: Performance & Autoscale Test
```bash
# Check autoscale configuration
az monitor autoscale show \
  --resource-group "rg-azmp-vm-test" \
  --name "<AUTOSCALE_NAME>"

# Generate CPU load to trigger scale-out (if testing autoscale)
# SSH into VM and run: stress --cpu 4 --timeout 300s
```

**Performance Checks**:
- [ ] Autoscale settings configured (1-3 instances)
- [ ] Scale-out rule: CPU > 75% for 5 min
- [ ] Scale-in rule: CPU < 25% for 10 min
- [ ] Premium SSD disks configured (if Premium profile)

### Step 5.5: High Availability Test
```bash
# Check availability set configuration
az vm availability-set show \
  --resource-group "rg-azmp-vm-test" \
  --name "<AVAILABILITY_SET_NAME>"

# Verify VM is in availability set
az vm show \
  --resource-group "rg-azmp-vm-test" \
  --name "azmp-test-vm-01" \
  --query "availabilitySet.id"
```

**HA Checks**:
- [ ] Availability set created with 2 fault domains, 5 update domains
- [ ] VM assigned to availability set
- [ ] Aligned SKU (for managed disks)
- [ ] Proper distribution for multi-VM scenarios

### Step 5.6: Disaster Recovery & Backup Test
```bash
# Check Recovery Services vault
az backup vault list \
  --resource-group "rg-azmp-vm-test"

# Verify backup policy
az backup policy list \
  --resource-group "rg-azmp-vm-test" \
  --vault-name "<VAULT_NAME>"

# Check VM backup status
az backup protection check-vm \
  --resource-group "rg-azmp-vm-test" \
  --vm-name "azmp-test-vm-01"

# Trigger initial backup (optional)
az backup protection backup-now \
  --resource-group "rg-azmp-vm-test" \
  --vault-name "<VAULT_NAME>" \
  --container-name "<CONTAINER_NAME>" \
  --item-name "<VM_NAME>"
```

**DR Checks**:
- [ ] Recovery Services vault created in secondary region (westus2)
- [ ] Backup policy configured (daily at 02:00, 30-day retention)
- [ ] VM backup protection enabled
- [ ] Initial backup job scheduled
- [ ] Recovery points created (after first backup)

---

## 📊 Phase 6: Managed Application Views Testing

### Step 6.1: Access Managed Application (If Deployed as Managed App)
If deployed as a managed application:
1. Navigate to Azure Portal
2. Go to Resource Groups
3. Find the managed resource group (starts with `mrg-`)
4. Click on the managed application resource

**If testing with standard deployment**, views won't be visible. For view testing:
```bash
# Convert to managed application package for testing
# (This is typically done for marketplace publishing)
```

### Step 6.2: Verify View Definition Structure
```bash
# Validate viewDefinition.json structure
jq '.views | length' test-deployment/viewDefinition.json
# Expected: 6 views

jq '.views[].kind' test-deployment/viewDefinition.json
# Expected output:
# "Overview"
# "Metrics"
# "CustomResources" (appears 3 times)
# "Properties"
```

**Expected Views**:
1. [ ] Overview - VM management commands
2. [ ] Metrics - Performance charts (CPU, Disk, Network)
3. [ ] Monitoring - Log Analytics & App Insights integration
4. [ ] Cost Management - Budget tracking
5. [ ] Resilience - HA/DR status
6. [ ] Outputs - Deployment information table

---

## 📖 Phase 7: Documentation

### Step 7.1: Create Deployment Guide
Create `DEPLOYMENT_GUIDE.md` with:
- Prerequisites checklist
- Step-by-step deployment instructions
- Parameter descriptions
- Troubleshooting section
- Resource architecture diagram
- Cost estimates
- Monitoring setup guide

### Step 7.2: Update README
Update main README with:
- Phase 5 completion status
- Template features
- CLI command usage
- Deployment examples
- Known limitations

### Step 7.3: Create Troubleshooting Guide
Document common issues:
- ARM template validation errors
- Deployment failures
- Connectivity issues
- Monitoring data delays
- Backup failures

---

## 🧹 Phase 8: Cleanup

### After Testing Complete
```bash
# Delete resource group (removes all resources)
az group delete \
  --name "rg-azmp-vm-test" \
  --yes \
  --no-wait

# Verify deletion
az group exists --name "rg-azmp-vm-test"
# Expected: false
```

**Cleanup Checklist**:
- [ ] Resource group deleted
- [ ] No orphaned resources
- [ ] No lingering costs
- [ ] Test files archived

---

## 📋 Final Validation Checklist

### Template Generation
- [ ] All 3 templates generate successfully
- [ ] No Handlebars syntax remains in output
- [ ] JSON syntax is valid
- [ ] Parameter consistency verified

### Portal UI
- [ ] All 5 wizard steps display correctly
- [ ] Validation rules work as expected
- [ ] Conditional fields show/hide properly
- [ ] Parameters map correctly to mainTemplate

### Deployment
- [ ] Deployment completes without errors
- [ ] All 12+ resources created
- [ ] No failed resource deployments
- [ ] Deployment outputs are valid

### Functionality
- [ ] SSH access works
- [ ] Monitoring data flows within 10 minutes
- [ ] Budget is configured correctly
- [ ] Autoscale settings are active
- [ ] Availability set configured
- [ ] Backup protection enabled

### Documentation
- [ ] DEPLOYMENT_GUIDE.md created
- [ ] README updated with Phase 5 info
- [ ] Troubleshooting guide documented
- [ ] Architecture diagram added

---

## 🎯 Success Metrics

### Quantitative
- **Template Generation**: 3/3 files created successfully
- **Resource Deployment**: 12+/12+ resources created
- **Test Coverage**: 540/540 tests passing
- **Deployment Time**: < 15 minutes
- **Monitoring Latency**: < 10 minutes for first data

### Qualitative
- Templates are production-ready
- UI wizard is user-friendly
- Documentation is comprehensive
- All enterprise features functional

---

## 📝 Notes

### Known Limitations
1. View definition only visible in managed applications (not standard deployments)
2. Initial backup job takes 1-2 hours to complete
3. Some monitoring metrics have 5-10 minute delay
4. Autoscale testing requires CPU load generation

### Recommendations for Production
1. Use Azure Key Vault for SSH keys and secrets
2. Enable Azure Security Center recommendations
3. Configure custom metric alerts
4. Set up Azure Policy compliance
5. Implement tagging strategy
6. Configure RBAC permissions
7. Enable diagnostic settings on all resources

---

## 🚀 Next Steps After Validation

1. **Tag v1.8.0 Release** - Mark Phase 5 complete
2. **Create GitHub Release** - Package templates and documentation
3. **Update Changelog** - Document all Phase 5 features
4. **Marketplace Preparation** - Prepare for Partner Center submission
5. **Performance Testing** - Load test with multiple VMs
6. **Security Audit** - Review security configurations
7. **Cost Optimization** - Analyze deployment costs

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-26  
**Author**: Phase 5 Implementation Team  
**Status**: Ready for Execution
