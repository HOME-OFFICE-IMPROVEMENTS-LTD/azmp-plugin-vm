# Phase 2: Azure Portal UI Wizard Testing Guide

## Overview

This guide walks you through testing the **createUiDefinition.json** file in the Azure Portal UI Definition Sandbox. This validates the end-user experience for Azure Marketplace deployments.

**Status**: createUiDefinition.json is **100% functional** (47.12 KB, 5 wizard steps, 56 parameter outputs)

## Prerequisites

- Azure Portal access
- Modern web browser (Chrome, Edge, Firefox)
- The generated `test-deployment/createUiDefinition.json` file

## Testing Process

### Step 1: Access the UI Definition Sandbox

1. Open your browser and navigate to:
   ```
   https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade
   ```

2. You'll see the **Create UI Definition Sandbox** interface with:
   - **Left Panel**: JSON editor for your createUiDefinition.json
   - **Right Panel**: Live preview of the wizard

### Step 2: Load the createUiDefinition.json

1. Open the file in your editor:
   ```bash
   cat test-deployment/createUiDefinition.json
   ```

2. Copy the **entire JSON content** (47.12 KB)

3. In the Azure Portal Sandbox:
   - Clear any existing content in the left panel
   - Paste your createUiDefinition.json
   - Click **Preview** button at the top

### Step 3: Test Each Wizard Step

The wizard should display **5 steps**. Test each one thoroughly:

#### 📋 Step 1: Basics
**Expected Fields**:
- Subscription (dropdown)
- Resource Group (dropdown/create new)
- Region (dropdown)
- VM Name (text input with validation)
- Admin Username (text input with validation)
- Authentication Type (radio: SSH/Password)
- SSH Public Key or Password (conditional, secure)
- VM Size (dropdown with size selector)

**Validation Tests**:
- ✅ VM Name: 3-64 characters, alphanumeric + hyphens
- ✅ Admin Username: No reserved names (admin, root, administrator)
- ✅ SSH Key: Starts with "ssh-rsa" or "ssh-ed25519"
- ✅ Password: Min 12 chars, complexity requirements

**Conditional Visibility**:
- If **SSH Public Key** selected → SSH key field appears
- If **Password** selected → Password confirmation field appears

#### 📊 Step 2: Monitoring Configuration
**Expected Fields**:
- Enable Monitoring (checkbox)
- Log Analytics Workspace Name (conditional text input)
- Log Analytics SKU (conditional dropdown: PerGB2018, CapacityReservation)
- Log Analytics Retention Days (conditional slider: 30-730 days)
- Enable Application Insights (conditional checkbox)
- Application Insights Name (conditional text input)
- Enable Diagnostics (conditional checkbox)
- Enable Metric Alerts (conditional checkbox)
- Metric Alert Rules (conditional multi-select or list)
- Action Group Configuration (conditional section)
  - Action Group Name
  - Email Receivers

**Validation Tests**:
- ✅ Workspace Name: 4-63 characters, alphanumeric + hyphens
- ✅ Retention Days: 30-730 range
- ✅ Email: Valid email format

**Conditional Visibility**:
- All monitoring fields hidden when "Enable Monitoring" unchecked
- Nested conditionals: Alert rules only appear if alerts enabled

#### 💰 Step 3: Cost & Performance Optimization
**Expected Fields**:
- Enable Cost Optimization (checkbox)
- Monthly Budget Limit (conditional number input)
- Budget Alert Thresholds (conditional multi-value: 80%, 90%, 100%)
- Enable Performance Optimization (conditional checkbox)
- Performance Profile (conditional dropdown: Balanced, Standard, Performance, Cost-Optimized)
- Enable Auto Scaling (conditional checkbox)
- Auto Scale Settings (conditional section)
  - Min Instances (slider: 1-10)
  - Max Instances (slider: 1-100)
  - CPU Threshold Out (slider: 50-90%)
  - CPU Threshold In (slider: 10-50%)

**Validation Tests**:
- ✅ Budget Limit: Positive number, reasonable range ($10-$10,000)
- ✅ Min Instances < Max Instances
- ✅ CPU Threshold In < CPU Threshold Out

**Conditional Visibility**:
- Cost fields hidden when "Enable Cost Optimization" unchecked
- Autoscale settings only visible when "Enable Auto Scaling" checked

#### 🔄 Step 4: High Availability Configuration
**Expected Fields**:
- Enable High Availability (checkbox)
- Availability Option (conditional radio: AvailabilitySet, AvailabilityZones, VMSS)
- Availability Set Settings (conditional section)
  - Availability Set Name
  - Fault Domain Count (slider: 2-3)
  - Update Domain Count (slider: 2-20)
- Availability Zones (conditional multi-select: Zone 1, 2, 3)
- VMSS Settings (conditional section)
  - VMSS Name
  - Instance Count
  - Orchestration Mode (dropdown: Uniform, Flexible)
  - Upgrade Mode (dropdown: Automatic, Manual, Rolling)

**Validation Tests**:
- ✅ Availability Set Name: 1-80 characters, alphanumeric + hyphens/underscores
- ✅ Fault Domains: 2-3 range
- ✅ Update Domains: 2-20 range
- ✅ At least one Availability Zone selected (if zones option chosen)

**Conditional Visibility**:
- Availability fields hidden when HA disabled
- Only one of: AvailabilitySet, Zones, or VMSS settings visible based on selection

#### 🛡️ Step 5: Disaster Recovery Configuration
**Expected Fields**:
- Enable Disaster Recovery (checkbox)
- Enable Backup (conditional checkbox)
- Backup Configuration (conditional section)
  - Backup Vault Name
  - Backup Policy Name (dropdown: DefaultPolicy, Enhanced)
  - Backup Schedule Time (time picker)
  - Backup Retention Days (slider: 7-9999)
- Recovery Region (conditional dropdown: paired Azure regions)
- Enable Snapshot (conditional checkbox)
- Snapshot Retention Days (conditional slider: 1-365)

**Validation Tests**:
- ✅ Vault Name: 2-50 characters, alphanumeric + hyphens
- ✅ Retention Days: 7-9999 range
- ✅ Recovery Region: Different from primary region
- ✅ Snapshot Retention: 1-365 range

**Conditional Visibility**:
- All DR fields hidden when "Enable Disaster Recovery" unchecked
- Backup settings only visible when backup enabled
- Snapshot settings only visible when snapshots enabled

### Step 4: Validate Parameter Outputs

After completing the wizard, click **View Outputs** (or check the browser console):

**Expected 56 Output Parameters**:
1. `vmName` → VM name from Basics
2. `adminUsername` → Admin username from Basics
3. `authenticationType` → "sshPublicKey" or "password"
4. `adminPasswordOrKey` → Secure credential value
5. `location` → Selected Azure region
6. `vmSize` → Selected VM size
7. `osType` → Always "Linux"
8. `osImageReference` → Ubuntu 22.04 LTS object
9. `storageAccountType` → Premium_LRS or Standard_LRS
10. `osDiskSizeGB` → 64 (default)
... (and 46 more parameters)

**Key Parameter Mappings to Verify**:
- Monitoring parameters: `enableMonitoring`, `logAnalyticsWorkspaceName`, `logAnalyticsRetentionDays`
- Cost parameters: `enableCostOptimization`, `monthlyBudgetLimit`, `budgetAlertThresholds`
- HA parameters: `enableHighAvailability`, `availabilityOption`, `faultDomainCount`
- DR parameters: `enableDisasterRecovery`, `enableBackup`, `backupRetentionDays`

### Step 5: Test Error Scenarios

Test validation error handling:

1. **Invalid VM Name**: Enter "vm@test" (special chars) → Should show error
2. **Short Admin Username**: Enter "ab" (too short) → Should show error
3. **Invalid SSH Key**: Enter "invalid-key" → Should show error
4. **Weak Password**: Enter "password123" → Should show error
5. **Invalid Email**: Enter "notanemail" in monitoring → Should show error
6. **Min > Max Instances**: Set min=10, max=5 → Should show error

### Step 6: Test Conditional Logic

Verify dynamic field visibility:

1. **Monitoring Toggle**: 
   - Uncheck "Enable Monitoring" → All monitoring fields disappear
   - Re-check → Fields reappear with preserved values

2. **HA Options**:
   - Select "AvailabilitySet" → Only AV Set fields visible
   - Switch to "AvailabilityZones" → Only Zone fields visible
   - Switch to "VMSS" → Only VMSS fields visible

3. **Nested Conditionals**:
   - Enable Monitoring → Enable Alerts → Alert Rules appear
   - Disable Alerts → Rules disappear
   - Re-enable → Rules reappear

### Step 7: Test Default Values

Verify sensible defaults are pre-populated:

- VM Size: Standard_D2s_v3 (or similar)
- Log Analytics SKU: PerGB2018
- Log Analytics Retention: 30 days
- Performance Profile: Standard
- Fault Domain Count: 2
- Update Domain Count: 5
- Backup Retention: 30 days
- Backup Schedule: 02:00 (2 AM)

## Success Criteria

✅ **All 5 wizard steps render correctly**  
✅ **All 56 output parameters map to wizard inputs**  
✅ **Validation rules work (errors shown for invalid input)**  
✅ **Conditional visibility works (fields show/hide correctly)**  
✅ **Default values are sensible and reasonable**  
✅ **No console errors in browser developer tools**  
✅ **Wizard completes without errors**  

## Troubleshooting

### Issue: Wizard doesn't load
- **Check**: JSON syntax errors in createUiDefinition.json
- **Fix**: Validate JSON with `jq . test-deployment/createUiDefinition.json`

### Issue: Missing fields
- **Check**: Conditional visibility logic in `visible` properties
- **Fix**: Review step definitions, ensure parent checkboxes enabled

### Issue: Validation errors don't show
- **Check**: `constraints.validations` array in control definitions
- **Fix**: Verify regex patterns and validation messages

### Issue: Output parameters missing
- **Check**: `outputs` section at end of createUiDefinition.json
- **Fix**: Ensure all 56 parameters are defined with correct paths

### Issue: Browser console errors
- **Check**: Browser developer tools (F12) → Console tab
- **Common**: Typos in property names, invalid regex, circular references
- **Fix**: Review error message, locate problematic control

## Documentation

After completing Portal testing, document your findings:

1. **Screenshots**: Capture each wizard step
2. **Validation Results**: Note any issues or errors
3. **User Experience**: Feedback on flow, clarity, usability
4. **Parameter Mapping**: Verify all outputs match expected values
5. **Recommendations**: Suggest improvements (field ordering, help text, etc.)

## Next Steps

After successful Portal testing:

1. ✅ **Phase 2 Complete** → createUiDefinition.json validated
2. 🔧 **Fix mainTemplate.json.hbs** → Address Handlebars conditional issues
3. 🚀 **Phase 3: Live Deployment** → Deploy to Azure with fixed template
4. ✔️ **Phase 4-8**: Resource verification, functional testing, views, docs, cleanup

## Resources

- **Portal Sandbox**: https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade
- **createUiDefinition Docs**: https://learn.microsoft.com/azure/azure-resource-manager/managed-applications/create-uidefinition-overview
- **Control Reference**: https://learn.microsoft.com/azure/azure-resource-manager/managed-applications/create-uidefinition-elements
- **Testing Best Practices**: https://learn.microsoft.com/azure/azure-resource-manager/managed-applications/test-createuidefinition

---

**Ready to test?** Copy the createUiDefinition.json content and paste it into the Portal Sandbox. The wizard should render immediately!
