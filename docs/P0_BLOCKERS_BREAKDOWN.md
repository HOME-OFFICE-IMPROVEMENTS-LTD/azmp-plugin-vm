# P0 Blockers Breakdown for Azure Marketplace Certification

**Document Version:** 1.0  
**Date:** 2025-10-28  
**Priority:** Critical (P0) - Marketplace Certification Blockers  
**Target Sprint:** Immediate (Q4 2025)

---

## Executive Summary

This document provides detailed implementation plans for **P0 (blocker)** items that are **mandatory** for Azure Marketplace VM certification. These items were identified during the comprehensive feature-parity audit against authoritative Microsoft/Azure documentation.

**Status:** 2 critical blockers identified  
**Estimated Effort:** 3-5 days total  
**Risk Level:** High (blocks certification submission)

---

## P0-1: VHD Validation and Image Certification Support

### Overview
Azure Marketplace requires VHD images to pass specific validation checks before certification. Currently, the plugin lacks automated VHD validation and certification test tool integration.

### Business Impact
- **Blocker:** Cannot submit VM offers without validated VHD images
- **Compliance:** Required by Azure Marketplace VM certification checklist
- **Risk:** Manual validation is error-prone and delays time-to-market

### Current State
**Implementation Status:** ❌ Missing  
**Evidence:** No VHD validation code found in codebase (grep search returned 0 matches)

**Current Capabilities:**
- VM size catalog (`src/vm-sizes.ts`) - ✅ Implemented
- VM image references (`src/vm-images.ts`) - ✅ Implemented (20+ official images)
- Custom image support - ⚠️ Partial (no validation)

**Gap:**
- No VHD validation logic
- No Azure certification test tool integration
- No automated checks for:
  - VHD format requirements (fixed VHD, not dynamic)
  - Size constraints (30GB - 1023GB for OS disk)
  - Partition requirements (single NTFS/ext4 partition)
  - Generalization status (sysprep/waagent deprovision)
  - Security requirements (no embedded credentials)

### Acceptance Criteria

#### AC-1: VHD Format Validation Module
- [ ] Create `src/azure/vhd-validator.ts` module
- [ ] Implement VHD format detection (VHD vs VHDX)
- [ ] Validate VHD type (fixed vs dynamic)
- [ ] Check size constraints (30-1023GB for OS, 1-32767GB for data)
- [ ] Export validation function: `validateVhdFormat(vhdPath: string): ValidationResult`

#### AC-2: Image Readiness Checks
- [ ] Verify generalization status
- [ ] Check for embedded credentials (warn if found in common locations)
- [ ] Validate partition structure (single bootable partition)
- [ ] Confirm Azure VM Agent presence (Windows) or waagent (Linux)
- [ ] Export function: `validateImageReadiness(vhdPath: string, os: 'Windows' | 'Linux'): ValidationResult`

#### AC-3: Certification Test Tool Integration
- [ ] Document Azure VM Certification Test Tool usage
- [ ] Create CLI command: `azmp-plugin-vm certify-image <vhdPath>`
- [ ] Integrate with `az vm image` commands for automated testing
- [ ] Generate certification report with pass/fail status
- [ ] Export function: `runCertificationTests(vhdPath: string): CertificationReport`

#### AC-4: CLI Integration
- [ ] Add `validate` command to CLI: `src/cli/commands/validate.ts`
- [ ] Support options: `--vhd-path`, `--os-type`, `--output-report`
- [ ] Display validation results with clear pass/fail indicators
- [ ] Generate HTML/JSON report for certification submission

#### AC-5: Documentation
- [ ] Create `docs/VHD_VALIDATION_GUIDE.md`
- [ ] Document VHD preparation requirements for Windows and Linux
- [ ] Provide examples for common scenarios (custom images, generalization)
- [ ] Include troubleshooting section for common validation errors

### Implementation Plan

#### Phase 1: VHD Validation Module (1 day)
**Files to Create:**
- `src/azure/vhd-validator.ts` (200-300 lines)
- `src/azure/types.ts` (50-100 lines - validation types)

**Key Functions:**
```typescript
export interface VhdValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: {
    format: 'VHD' | 'VHDX';
    type: 'fixed' | 'dynamic';
    sizeGB: number;
    osType?: 'Windows' | 'Linux';
  };
}

export async function validateVhdFormat(vhdPath: string): Promise<VhdValidationResult>;
export async function validateImageReadiness(vhdPath: string, osType: 'Windows' | 'Linux'): Promise<VhdValidationResult>;
```

**Dependencies:**
- Node.js `fs` module for file access
- External tool: `qemu-img` for VHD inspection (optional, document for advanced checks)
- Azure SDK: `@azure/storage-blob` for uploaded VHD validation

#### Phase 2: Certification Test Tool Integration (1 day)
**Files to Create:**
- `src/azure/certification.ts` (150-250 lines)
- `src/cli/commands/certify.ts` (100-150 lines)

**Key Functions:**
```typescript
export interface CertificationReport {
  testsPassed: number;
  testsFailed: number;
  warnings: number;
  tests: CertificationTest[];
  summary: string;
  certificationReady: boolean;
}

export async function runCertificationTests(vhdPath: string, config: CertConfig): Promise<CertificationReport>;
```

**Integration Points:**
- Azure VM Certification Test Tool (document external tool usage)
- `az vm image` commands for automated validation
- Generate reports compatible with Azure Partner Center submission

#### Phase 3: CLI Command Implementation (0.5 days)
**Files to Modify/Create:**
- `src/cli/commands/validate.ts` (new file, 150-200 lines)
- `src/cli/index.ts` (register new command)

**Command Signature:**
```bash
azmp-plugin-vm validate-image \
  --vhd-path ./my-vm-image.vhd \
  --os-type Windows \
  --output-report ./certification-report.html \
  --verbose
```

**Output:**
- Console: Pass/fail summary with color-coded results
- File: HTML/JSON report for Azure Partner Center submission

#### Phase 4: Documentation (0.5 days)
**Files to Create:**
- `docs/VHD_VALIDATION_GUIDE.md` (comprehensive guide)
- Update `README.md` with validation command examples

**Content:**
- VHD preparation checklist (Windows and Linux)
- Generalization procedures (sysprep, waagent)
- Common validation errors and fixes
- Certification test tool installation and usage
- Example workflows for custom image certification

### Testing Strategy

#### Unit Tests
- [ ] Test VHD format detection with sample files
- [ ] Validate size constraint checks (boundary conditions)
- [ ] Test error handling for invalid VHD files
- [ ] Mock external tool calls (qemu-img, az cli)

**Test Files:**
- `src/azure/__tests__/vhd-validator.test.ts` (20+ test cases)
- `src/azure/__tests__/certification.test.ts` (15+ test cases)

#### Integration Tests
- [ ] Test with real VHD files (Windows and Linux samples)
- [ ] Validate certification report generation
- [ ] Test CLI command end-to-end
- [ ] Verify Azure SDK integration (storage blob validation)

#### Manual Testing Checklist
- [ ] Test with generalized Windows VHD
- [ ] Test with generalized Linux VHD
- [ ] Test with invalid VHD formats (dynamic, VHDX)
- [ ] Test with undersized/oversized VHDs
- [ ] Verify certification report accuracy

### Dependencies

**External Tools:**
- Azure VM Certification Test Tool (document installation)
- `qemu-img` (optional, for advanced VHD inspection)
- Azure CLI (`az vm image` commands)

**npm Packages:**
- `@azure/storage-blob`: VHD upload and validation
- `commander`: CLI argument parsing
- `chalk`: Console color output
- `handlebars`: Report template generation (reuse existing)

**Azure Resources:**
- Storage account for VHD upload testing (test/staging)
- VM for validation testing (ephemeral, can be auto-deleted)

### Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| External tool dependencies (qemu-img) | Medium | Medium | Document as optional; provide Azure SDK fallback |
| VHD format variations (legacy formats) | Low | Low | Focus on modern VHD/VHDX; document limitations |
| Large VHD file processing (performance) | Medium | Medium | Use streaming APIs; provide progress indicators |
| Certification tool version changes | Medium | Low | Document required version; test with latest stable |

### Success Metrics
- [ ] All VHD validation tests pass (100% coverage)
- [ ] CLI command generates valid certification reports
- [ ] Documentation reviewed and approved
- [ ] Zero P0 blockers remaining for VHD validation
- [ ] Certification test tool integration verified with sample VHDs

---

## P0-2: VM Diagnostics Extension Auto-Enable

### Overview
Azure Marketplace requires VM offers to support diagnostics collection for monitoring and troubleshooting. While the plugin has diagnostic settings helpers (`src/modules/monitoring/diagnostics.ts`) and extension definitions (`src/extensions/windows.ts`, `src/extensions/linux.ts`), it lacks **automatic enablement** in generated templates and **mandatory inclusion** for marketplace certification.

### Business Impact
- **Blocker:** Marketplace VMs must support diagnostics for customer troubleshooting
- **Compliance:** Required by Azure Marketplace technical requirements
- **Customer Experience:** Diagnostic logs essential for production support

### Current State
**Implementation Status:** ⚠️ Partial  

**Evidence:**
- Diagnostic settings helper exists: `src/modules/monitoring/diagnostics.ts` ✅
- Windows diagnostics extension: `src/extensions/windows.ts` (IaaSDiagnostics) ✅
- Linux monitoring: `src/extensions/linux.ts` (OmsAgent) ✅
- Azure Monitor Agent: `src/extensions/crossplatform.ts` ✅

**Gap:**
- Extensions are **optional**, not auto-enabled in templates
- No default diagnostics configuration in generated ARM templates
- No storage account auto-provisioning for diagnostics logs
- Missing guidance on mandatory vs optional diagnostics for marketplace

### Acceptance Criteria

#### AC-1: Default Diagnostics Configuration
- [ ] Add `diagnosticsEnabled` parameter to `mainTemplate.json.hbs` (default: `true`)
- [ ] Auto-include diagnostics extension in VM resource when enabled
- [ ] Support both boot diagnostics and guest-level diagnostics
- [ ] Allow opt-out for non-marketplace scenarios

#### AC-2: Storage Account for Diagnostics
- [ ] Auto-provision storage account for diagnostics logs (or reuse existing)
- [ ] Add `diagnosticsStorageAccountName` parameter to ARM template
- [ ] Configure storage account with appropriate retention policies
- [ ] Support customer-provided storage account as alternative

#### AC-3: Windows VM Diagnostics
- [ ] Include `IaaSDiagnostics` extension by default for Windows VMs
- [ ] Configure default XML config for common metrics and logs
- [ ] Support custom XML config via parameter
- [ ] Document required storage account permissions

**Template Integration:**
```handlebars
{{#if parameters.diagnosticsEnabled}}
{
  "type": "Microsoft.Compute/virtualMachines/extensions",
  "apiVersion": "2023-03-01",
  "name": "[concat(parameters('vmName'), '/IaaSDiagnostics')]",
  "location": "[parameters('location')]",
  "dependsOn": [
    "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]",
    "[resourceId('Microsoft.Storage/storageAccounts', parameters('diagnosticsStorageAccountName'))]"
  ],
  "properties": {
    {{ext:windows.diagnostics 
      storageAccount=parameters.diagnosticsStorageAccountName
      storageAccountKey="[listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('diagnosticsStorageAccountName')), '2021-04-01').keys[0].value]"
    }}
  }
}
{{/if}}
```

#### AC-4: Linux VM Diagnostics
- [ ] Include `OmsAgentForLinux` or `AzureMonitorAgent` by default
- [ ] Configure Log Analytics workspace integration
- [ ] Auto-provision Log Analytics workspace (or reuse existing)
- [ ] Add `logAnalyticsWorkspaceId` parameter to ARM template

**Template Integration:**
```handlebars
{{#if parameters.diagnosticsEnabled}}
{
  "type": "Microsoft.Compute/virtualMachines/extensions",
  "apiVersion": "2023-03-01",
  "name": "[concat(parameters('vmName'), '/OmsAgentForLinux')]",
  "location": "[parameters('location')]",
  "dependsOn": [
    "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]",
    "[resourceId('Microsoft.OperationalInsights/workspaces', parameters('logAnalyticsWorkspaceName'))]"
  ],
  "properties": {
    {{ext:linux.omsAgent 
      workspaceId="[reference(resourceId('Microsoft.OperationalInsights/workspaces', parameters('logAnalyticsWorkspaceName')), '2021-06-01').customerId]"
      workspaceKey="[listKeys(resourceId('Microsoft.OperationalInsights/workspaces', parameters('logAnalyticsWorkspaceName')), '2021-06-01').primarySharedKey]"
    }}
  }
}
{{/if}}
```

#### AC-5: Boot Diagnostics
- [ ] Enable boot diagnostics by default on all VMs
- [ ] Support managed storage (no storage account required) for boot diagnostics
- [ ] Add `bootDiagnosticsEnabled` parameter (default: `true`)
- [ ] Include boot diagnostics in VM resource definition

**Implementation:**
```json
"diagnosticsProfile": {
  "bootDiagnostics": {
    "enabled": "[parameters('bootDiagnosticsEnabled')]",
    "storageUri": "[if(parameters('useManagedBootDiagnostics'), json('null'), reference(resourceId('Microsoft.Storage/storageAccounts', parameters('diagnosticsStorageAccountName'))).primaryEndpoints.blob)]"
  }
}
```

#### AC-6: createUiDefinition.json Updates
- [ ] Add diagnostics configuration blade to UI
- [ ] Provide options: "Managed storage" vs "Custom storage account"
- [ ] Include Log Analytics workspace selection for Linux VMs
- [ ] Add validation for storage account name uniqueness

#### AC-7: Documentation
- [ ] Update `README.md` with diagnostics configuration examples
- [ ] Create `docs/DIAGNOSTICS_CONFIGURATION.md`
- [ ] Document marketplace requirements for diagnostics
- [ ] Provide troubleshooting guide for diagnostics extension failures

### Implementation Plan

#### Phase 1: ARM Template Updates (1 day)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add diagnostics resources)
- `src/templates/parameters.json.hbs` (add diagnostics parameters)
- `src/templates/createUiDefinition.json.hbs` (add diagnostics UI)

**Parameters to Add:**
```json
{
  "diagnosticsEnabled": {
    "type": "bool",
    "defaultValue": true,
    "metadata": {
      "description": "Enable VM diagnostics (required for Azure Marketplace)"
    }
  },
  "bootDiagnosticsEnabled": {
    "type": "bool",
    "defaultValue": true,
    "metadata": {
      "description": "Enable boot diagnostics"
    }
  },
  "useManagedBootDiagnostics": {
    "type": "bool",
    "defaultValue": true,
    "metadata": {
      "description": "Use Azure managed storage for boot diagnostics"
    }
  },
  "diagnosticsStorageAccountName": {
    "type": "string",
    "defaultValue": "[concat('diag', uniqueString(resourceGroup().id))]",
    "metadata": {
      "description": "Storage account for diagnostics logs"
    }
  },
  "logAnalyticsWorkspaceName": {
    "type": "string",
    "defaultValue": "[concat('law-', uniqueString(resourceGroup().id))]",
    "metadata": {
      "description": "Log Analytics workspace for Linux diagnostics"
    }
  }
}
```

#### Phase 2: Extension Auto-Enablement (1 day)
**Files to Modify:**
- `src/templates/mainTemplate.json.hbs` (add extension resources)
- `src/extensions/windows.ts` (ensure diagnosticsExtension is properly exposed)
- `src/extensions/linux.ts` (ensure omsAgentExtension is properly exposed)

**Template Changes:**
- Add storage account resource (conditional, if not using managed diagnostics)
- Add Log Analytics workspace resource (conditional, for Linux VMs)
- Add diagnostics extension resources (Windows: IaaSDiagnostics, Linux: OmsAgent)
- Add boot diagnostics to VM diagnosticsProfile
- Add proper dependsOn chains for resource provisioning order

#### Phase 3: UI Definition Updates (0.5 days)
**Files to Modify:**
- `src/templates/createUiDefinition.json.hbs`

**UI Elements to Add:**
- "Diagnostics" blade with toggle for enable/disable
- Storage account configuration (managed vs custom)
- Log Analytics workspace selection for Linux
- Validation rules for storage account names

#### Phase 4: CLI and Helper Updates (0.5 days)
**Files to Modify:**
- `src/cli/commands/create.ts` (add diagnostics flags)
- `src/core/generator.ts` (pass diagnostics config to templates)

**CLI Flags:**
```bash
azmp-plugin-vm create \
  --diagnostics-enabled \
  --boot-diagnostics-enabled \
  --diagnostics-storage-account mydiagaccount \
  --log-analytics-workspace mylogworkspace
```

#### Phase 5: Documentation (0.5 days)
**Files to Create/Update:**
- `docs/DIAGNOSTICS_CONFIGURATION.md` (new file)
- `README.md` (add diagnostics section)
- `examples/marketplace-vm-with-diagnostics/` (new example)

**Content:**
- Marketplace diagnostics requirements
- Default diagnostics configuration
- Custom diagnostics configuration
- Troubleshooting diagnostics extension failures
- Cost implications of diagnostics logging

### Testing Strategy

#### Unit Tests
- [ ] Test diagnostics parameter generation
- [ ] Validate diagnostics extension configuration
- [ ] Test storage account resource generation
- [ ] Verify Log Analytics workspace resource creation

**Test Files:**
- `src/templates/__tests__/diagnostics.test.ts` (new file, 25+ test cases)

#### Integration Tests
- [ ] Deploy template with default diagnostics (Windows)
- [ ] Deploy template with default diagnostics (Linux)
- [ ] Deploy template with custom storage account
- [ ] Deploy template with custom Log Analytics workspace
- [ ] Verify diagnostics logs are collected

#### ARM-TTK Validation
- [ ] Run ARM-TTK against generated templates
- [ ] Ensure all diagnostics resources pass validation
- [ ] Verify parameter constraints are correct
- [ ] Check resource dependency chains

### Dependencies

**Azure Resources (for testing):**
- Storage account (for Windows diagnostics)
- Log Analytics workspace (for Linux diagnostics)
- Test VMs (Windows and Linux)

**npm Packages:**
- No new dependencies required (reuse existing Handlebars, Azure SDK)

**Documentation References:**
- Azure Marketplace VM technical requirements
- IaaSDiagnostics extension documentation
- OmsAgentForLinux documentation
- Boot diagnostics documentation

### Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Storage account name conflicts | Medium | Medium | Use uniqueString() for default names; validate in UI |
| Log Analytics workspace costs | Medium | High | Document cost implications; support customer-provided workspace |
| Extension deployment failures | High | Low | Add retry logic; provide detailed error messages |
| Regional availability (Log Analytics) | Medium | Low | Document supported regions; validate in UI |

### Success Metrics
- [ ] 100% of generated templates include diagnostics by default
- [ ] ARM-TTK validation passes for all diagnostics resources
- [ ] Test deployments successful for Windows and Linux VMs
- [ ] Documentation complete and reviewed
- [ ] Zero P0 blockers remaining for diagnostics

---

## Implementation Timeline

### Week 1: P0-1 VHD Validation
- **Day 1:** VHD validation module implementation
- **Day 2:** Certification test tool integration
- **Day 3:** CLI command implementation, testing, documentation

### Week 1-2: P0-2 Diagnostics Extension
- **Day 4:** ARM template updates (parameters, resources)
- **Day 5:** Extension auto-enablement, UI definition updates
- **Day 6:** CLI updates, testing, documentation

### Week 2: Testing and Validation
- **Day 7:** Comprehensive integration testing
- **Day 8:** ARM-TTK validation, bug fixes
- **Day 9:** Documentation review, final validation
- **Day 10:** Release v1.11.0 with P0 fixes

---

## Rollout Plan

### Pre-Release Checklist
- [ ] All unit tests passing (100% coverage for new code)
- [ ] Integration tests completed successfully
- [ ] ARM-TTK validation passing
- [ ] Documentation reviewed and approved
- [ ] Example templates generated and tested
- [ ] Changelog updated with P0 fixes

### Release Artifacts
- [ ] npm package: `@hoiltd/azmp-plugin-vm@1.11.0`
- [ ] Git tag: `v1.11.0`
- [ ] GitHub release notes
- [ ] Updated documentation on GitHub

### Post-Release Validation
- [ ] Deploy test VMs using new templates
- [ ] Verify diagnostics logs are collected
- [ ] Validate VHD certification workflow
- [ ] Monitor for issues/feedback (GitHub issues, npm downloads)

---

## Appendix: MCP Resource References

The following authoritative Microsoft/Azure documentation was used to define these P0 requirements:

1. **Azure Marketplace VM Certification Requirements**
   - VHD format requirements (fixed, 30-1023GB, single partition)
   - Generalization requirements (sysprep/waagent)
   - Security requirements (no embedded credentials)

2. **Azure VM Diagnostics Documentation**
   - IaaSDiagnostics extension for Windows
   - OmsAgentForLinux extension for Linux
   - Boot diagnostics configuration
   - Log Analytics workspace integration

3. **Azure Marketplace Technical Requirements**
   - Mandatory diagnostics for customer support
   - Storage account requirements
   - Extension installation requirements

4. **Azure VM Certification Test Tool**
   - Installation and usage
   - Validation checks and reports
   - Certification submission process

---

## Next Steps

1. **Review and Approval:** Product owner and stakeholders review this breakdown
2. **Sprint Planning:** Schedule P0 implementation for immediate sprint (Q4 2025)
3. **Resource Allocation:** Assign developers to P0-1 and P0-2 tasks
4. **Kickoff:** Begin implementation on Day 1 of approved sprint
5. **Daily Standups:** Track progress and address blockers
6. **Release:** Ship v1.11.0 with P0 fixes within 2 weeks

---

**Document Owner:** Codex AI Teammate  
**Reviewers:** Product Owner, Lead Developer, QA Lead  
**Approval Required:** ✅ Before implementation begins
