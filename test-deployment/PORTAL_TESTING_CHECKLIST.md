# Portal UI Wizard Testing Checklist

Quick reference for testing createUiDefinition.json in Azure Portal Sandbox.

## 🚀 Quick Start

1. Open: https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade
2. Copy: `cat test-deployment/createUiDefinition.json`
3. Paste: Into left panel (JSON editor)
4. Click: **Preview** button
5. Test: All 5 wizard steps

---

## ✅ Step-by-Step Checklist

### Step 1: Basics
- [ ] All fields render correctly
- [ ] VM Name validation works (3-64 chars, alphanumeric + hyphens)
- [ ] Admin Username validation works (no reserved names)
- [ ] Authentication Type toggle works (SSH vs Password)
- [ ] Conditional fields appear/disappear correctly
- [ ] SSH key validation works (ssh-rsa/ssh-ed25519 format)
- [ ] Password complexity validation works
- [ ] VM Size selector displays sizes

### Step 2: Monitoring Configuration
- [ ] Enable Monitoring checkbox works
- [ ] All monitoring fields hidden when unchecked
- [ ] Log Analytics fields appear when enabled
- [ ] Workspace Name validation works (4-63 chars)
- [ ] SKU dropdown has options (PerGB2018, CapacityReservation)
- [ ] Retention slider works (30-730 days)
- [ ] Application Insights checkbox works
- [ ] Diagnostics checkbox works
- [ ] Metric Alerts checkbox works
- [ ] Alert rules section appears conditionally
- [ ] Action Group configuration works
- [ ] Email validation works

### Step 3: Cost & Performance
- [ ] Enable Cost Optimization checkbox works
- [ ] Budget Limit input accepts numbers
- [ ] Budget Alert Thresholds display (80%, 90%, 100%)
- [ ] Performance Profile dropdown works
- [ ] Enable Auto Scaling checkbox works
- [ ] Min/Max Instances sliders work
- [ ] Min < Max validation works
- [ ] CPU Threshold sliders work (In < Out validation)

### Step 4: High Availability
- [ ] Enable HA checkbox works
- [ ] Availability Option radio buttons work
- [ ] AvailabilitySet fields appear/disappear correctly
- [ ] AvailabilityZones multi-select appears/disappears
- [ ] VMSS fields appear/disappear correctly
- [ ] Fault Domain slider works (2-3)
- [ ] Update Domain slider works (2-20)
- [ ] Zone selection works (1, 2, 3)
- [ ] VMSS Orchestration Mode dropdown works
- [ ] VMSS Upgrade Mode dropdown works

### Step 5: Disaster Recovery
- [ ] Enable DR checkbox works
- [ ] Enable Backup checkbox works
- [ ] Backup Vault Name validation works (2-50 chars)
- [ ] Backup Policy dropdown works
- [ ] Schedule Time picker works
- [ ] Retention slider works (7-9999 days)
- [ ] Recovery Region dropdown works
- [ ] Recovery region ≠ primary region validation
- [ ] Enable Snapshot checkbox works
- [ ] Snapshot Retention slider works (1-365 days)

---

## 🔍 Output Parameters Verification

- [ ] Open browser Developer Tools (F12)
- [ ] Check Console for output object
- [ ] Verify 56 parameters present
- [ ] Spot-check key mappings:
  - [ ] `vmName` → Basics step value
  - [ ] `enableMonitoring` → Monitoring step checkbox
  - [ ] `logAnalyticsRetentionDays` → Retention slider value
  - [ ] `enableCostOptimization` → Cost step checkbox
  - [ ] `monthlyBudgetLimit` → Budget input value
  - [ ] `enableHighAvailability` → HA step checkbox
  - [ ] `availabilityOption` → Radio selection
  - [ ] `enableDisasterRecovery` → DR step checkbox
  - [ ] `backupRetentionDays` → Backup retention value

---

## 🧪 Error Validation Tests

- [ ] Invalid VM Name: `vm@test` → Error shown
- [ ] Short Username: `ab` → Error shown
- [ ] Invalid SSH Key: `invalid-key` → Error shown
- [ ] Weak Password: `password123` → Error shown
- [ ] Invalid Email: `notanemail` → Error shown
- [ ] Min > Max: Min=10, Max=5 → Error shown
- [ ] Recovery Region same as primary → Error shown

---

## 🔄 Conditional Logic Tests

### Monitoring Toggle
- [ ] Uncheck "Enable Monitoring" → Fields disappear
- [ ] Re-check → Fields reappear
- [ ] Values preserved after toggle

### HA Options
- [ ] Select AvailabilitySet → Only AV Set fields visible
- [ ] Switch to Zones → Only Zone fields visible
- [ ] Switch to VMSS → Only VMSS fields visible

### Nested Conditionals
- [ ] Monitoring → Alerts → Rules (3-level nesting works)
- [ ] Disable parent → Children disappear
- [ ] Re-enable → Children reappear

---

## ✨ Default Values Check

- [ ] VM Size: Sensible default (e.g., Standard_D2s_v3)
- [ ] Log Analytics SKU: PerGB2018
- [ ] Log Analytics Retention: 30 days
- [ ] Performance Profile: Standard
- [ ] Fault Domains: 2
- [ ] Update Domains: 5
- [ ] Backup Retention: 30 days
- [ ] Backup Schedule: 02:00
- [ ] Snapshot Retention: 7 days

---

## 🎯 Success Criteria

- [ ] All 5 steps render without errors
- [ ] All wizard controls functional
- [ ] Validation rules work correctly
- [ ] Conditional visibility works
- [ ] 56 output parameters generated
- [ ] No browser console errors
- [ ] User experience is intuitive
- [ ] Help text is clear

---

## 📸 Documentation

- [ ] Screenshot: Step 1 (Basics)
- [ ] Screenshot: Step 2 (Monitoring)
- [ ] Screenshot: Step 3 (Cost & Performance)
- [ ] Screenshot: Step 4 (High Availability)
- [ ] Screenshot: Step 5 (Disaster Recovery)
- [ ] Screenshot: Output parameters (F12 Console)
- [ ] Note any issues or improvements
- [ ] Document user experience feedback

---

## ✅ Completion

**Date Tested**: ________________  
**Tested By**: ________________  
**Browser**: ________________  
**Result**: ☐ Pass  ☐ Pass with Issues  ☐ Fail  

**Issues Found**:
- 
- 
- 

**Recommendations**:
- 
- 
- 

---

**Next Step**: After successful testing, proceed to fix mainTemplate.json.hbs conditional compilation issues for Phase 3 live deployment.
