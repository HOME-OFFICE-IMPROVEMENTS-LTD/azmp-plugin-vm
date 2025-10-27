---
description: CreateUiDefinition best practices from Microsoft documentation
applyTo: '**/createUiDefinition*.json'
---

# CreateUiDefinition Development Guidelines

## Reference Documentation

**Primary (Always fetch latest):**
- Main: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/create-uidefinition-overview
- Elements: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/create-uidefinition-elements
- Testing: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/test-createuidefinition
- Sandbox: https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade

**Backup (Offline reference):**
- `docs/reference/azure-managed-apps.pdf` (if available)

## Critical Pattern Rules (Learned from Microsoft samples)

### ✅ CORRECT Pattern: Control Elements at Step Level

```json
{
  "steps": [{
    "name": "extensionsConfig",
    "label": "Extensions",
    "elements": [
      {
        "name": "installExtensions",
        "type": "Microsoft.Common.CheckBox",
        "label": "Install Extensions",
        "defaultValue": true
      },
      {
        "name": "monitoringSection",
        "type": "Microsoft.Common.Section",
        "label": "Monitoring",
        "visible": "[steps('extensionsConfig').installExtensions]",
        "elements": [
          {
            "name": "enableMonitoring",
            "type": "Microsoft.Common.CheckBox",
            "label": "Enable Azure Monitor"
          }
        ]
      }
    ]
  }]
}
```

**Why this works:**
- `installExtensions` is at step level (direct child of `elements`)
- `monitoringSection` references the step-level checkbox
- No circular dependency: Step → Element → Section

### ❌ WRONG Pattern: Sections Inside Sections (NOT ALLOWED!)

```json
{
  "steps": [{
    "name": "extensionsConfig",
    "elements": [
      {
        "name": "monitoringSection",
        "type": "Microsoft.Common.Section",
        "elements": [
          {
            "name": "installMonitoring",
            "type": "Microsoft.Common.CheckBox"
          },
          {
            "name": "workspaceSection",
            "type": "Microsoft.Common.Section",  // ❌ SECTION INSIDE SECTION!
            "visible": "[steps('extensionsConfig').monitoringSection.installMonitoring]"
          }
        ]
      }
    ]
  }]
}
```

**Why this fails:**
- **Microsoft.Common.Section elements CANNOT contain other Sections**
- Per official documentation: "can have all element types except Microsoft.Common.Section"
- This is explicitly forbidden and causes `getObservableReference` errors
- Sections are for UI grouping only, not for creating nested hierarchies

## Architecture Rules

### 1. Element Hierarchy
```
Step
├── Control Checkboxes (direct children)
├── InfoBox elements (always visible)
├── Section 1 (visible based on control checkbox)
│   └── Related fields (reference control checkbox)
└── Section 2 (visible based on control checkbox)
    └── Related fields (reference control checkbox)
```

### 2. Visibility Patterns

**✅ Allowed:**
- Elements in basics: `"visible": "[equals(basics('authType'), 'password')]"`
- Elements in steps referencing basics: `"visible": "[equals(basics('vmName'), '')]"`
- Elements in steps referencing step-level controls: `"visible": "[steps('step1').enableFeature]"`
- Sections referencing step-level controls: Same as above
- **Elements inside Section referencing other elements in SAME Section:** `"visible": "[steps('config').cmekSection.cmekEnable]"` where both cmekEnable and current element are in cmekSection

**❌ Not Allowed:**
- **Sections containing other Sections** (explicitly forbidden by Microsoft documentation)
- Sections referencing elements inside other sections in same step
- Elements referencing sibling elements within same section (creates circular dependencies)

### 3. Output References

**✅ Correct output patterns:**
```json
"outputs": {
  "stepLevelElement": "[steps('step1').elementName]",
  "sectionElement": "[steps('step1').sectionName.elementName]",
  "nestedSectionElement": "[steps('step1').section.subsection.element]"
}
```

## Development Workflow

### Before Creating/Modifying createUiDefinition.json:

1. **Fetch Latest Docs:**
   ```
   Use fetch_webpage tool with Microsoft Learn URLs
   ```

2. **Review Microsoft Samples:**
   - Official samples: https://github.com/Azure/azure-quickstart-templates
   - Look for similar patterns to what you need

3. **Test Early and Often:**
   - Create minimal version first
   - Test in Portal Sandbox
   - Add complexity incrementally
   - Test after each addition

4. **Never Commit Without Portal Verification:**
   - Load in Sandbox
   - Navigate through all steps
   - Check browser console for errors
   - Verify outputs in "View Results"

### Common Elements & Best Practices:

**Authentication Fields:**
```json
{
  "name": "authenticationType",
  "type": "Microsoft.Common.DropDown",
  "constraints": {
    "allowedValues": [
      {"label": "SSH Public Key", "value": "sshPublicKey"},
      {"label": "Password", "value": "password"}
    ]
  }
},
{
  "name": "adminPassword",
  "type": "Microsoft.Common.PasswordBox",
  "visible": "[equals(basics('authenticationType'), 'password')]"
},
{
  "name": "adminSshKey",
  "type": "Microsoft.Common.TextBox",
  "visible": "[equals(basics('authenticationType'), 'sshPublicKey')]"
}
```

**Network Resources:**
- Use `Microsoft.Network.VirtualNetworkCombo` for VNet + Subnets
- Use `Microsoft.Network.PublicIpAddressCombo` for Public IP + DNS
- Both support `hideExisting: false` for using existing resources

**Storage Resources:**
- Use `Microsoft.Storage.StorageAccountSelector` for single account
- Use `Microsoft.Storage.MultiStorageAccountCombo` for multiple accounts

## Troubleshooting

### Error: "getObservableReference"
**Cause:** Section containing another Section (explicitly forbidden), or circular dependency in element references
**Solution:** 
1. **First check:** Remove any Microsoft.Common.Section elements inside other Sections
2. **Per Microsoft docs:** Sections "can have all element types except Microsoft.Common.Section"
3. If no nested sections, move control elements to step level, keep sections for grouping only

### Error: "Element type does not exist"
**Cause:** Dynamic element type with `[if(...)]` expression
**Solution:** Use separate static elements with `visible` constraints

### Error: "Property X is not allowed"
**Cause:** Property not supported by element type
**Solution:** Check element documentation, remove unsupported properties

### Elements Not Appearing
**Cause:** Visibility constraint evaluating to false
**Solution:** Check `visible` expressions, verify referenced elements exist

## Testing Checklist

- [ ] JSON is valid (no syntax errors)
- [ ] All element names are unique within their scope
- [ ] All `visible` expressions reference valid elements
- [ ] All `outputs` reference valid element paths
- [ ] Loads successfully in Portal Sandbox
- [ ] All steps navigate correctly
- [ ] All validation rules work
- [ ] Outputs show correct values in "View Results"
- [ ] No console errors in browser developer tools

## Additional Resources

- ARM Template Functions: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions
- CreateUiDefinition Functions: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/create-uidefinition-functions
- Test Cases: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/createuidefinition-test-cases
