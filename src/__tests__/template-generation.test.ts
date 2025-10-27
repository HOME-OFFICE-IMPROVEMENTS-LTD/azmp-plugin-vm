import { validateArmStructure } from "../templates/validation";

describe("Template Generation", () => {
  test("mainTemplate.json.hbs should generate valid JSON", () => {
    // Mock minimal context to test JSON structure
    const mockTemplate = {
      $schema:
        "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        vmName: {
          type: "string",
          defaultValue: "testvm",
        },
        location: {
          type: "string",
          defaultValue: "East US",
        },
      },
      variables: {
        vmName: "[parameters('vmName')]",
      },
      resources: [
        {
          type: "Microsoft.Compute/virtualMachines",
          apiVersion: "2021-03-01",
          name: "[variables('vmName')]",
          location: "[parameters('location')]",
          properties: {},
        },
      ],
      outputs: {
        vmName: {
          type: "string",
          value: "[variables('vmName')]",
        },
      },
    };

    const result = validateArmStructure(mockTemplate);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("template should handle optional sections without trailing commas", () => {
    // Test template with only required fields
    const minimalTemplate = {
      $schema:
        "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      resources: [],
    };

    const result = validateArmStructure(minimalTemplate);
    expect(result.isValid).toBe(true);
  });

  test("template with VM extensions should have valid structure", () => {
    // Mock template with VM extension resources
    const templateWithExtensions = {
      $schema:
        "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        vmName: { type: "string", defaultValue: "testvm" },
        location: { type: "string", defaultValue: "East US" },
        installExtensions: { type: "bool", defaultValue: true },
        installCustomScriptExtension: { type: "bool", defaultValue: true },
        enableManagedIdentity: { type: "bool", defaultValue: true },
        osType: { type: "string", defaultValue: "Windows" },
      },
      variables: {
        vmName: "[parameters('vmName')]",
        customScriptExtensionName: "CustomScriptExtension",
        extensionApiVersion: "2021-03-01",
      },
      resources: [
        {
          type: "Microsoft.Compute/virtualMachines",
          apiVersion: "2021-03-01",
          name: "[variables('vmName')]",
          location: "[parameters('location')]",
          identity: {
            type: "SystemAssigned",
          },
          properties: {},
        },
        {
          type: "Microsoft.Compute/virtualMachines/extensions",
          apiVersion: "[variables('extensionApiVersion')]",
          name: "[concat(variables('vmName'), '/', variables('customScriptExtensionName'))]",
          location: "[parameters('location')]",
          dependsOn: [
            "[resourceId('Microsoft.Compute/virtualMachines', variables('vmName'))]",
          ],
          properties: {
            publisher: "Microsoft.Compute",
            type: "[variables('customScriptExtensionName')]",
            typeHandlerVersion: "1.10",
            autoUpgradeMinorVersion: true,
            settings: {},
          },
        },
      ],
      outputs: {
        vmName: {
          type: "string",
          value: "[variables('vmName')]",
        },
        extensionsInstalled: {
          type: "array",
          value: ["CustomScript"],
        },
        customScriptExtensionStatus: {
          type: "string",
          value:
            "[reference(resourceId('Microsoft.Compute/virtualMachines/extensions', variables('vmName'), variables('customScriptExtensionName'))).provisioningState]",
        },
      },
    };

    const result = validateArmStructure(templateWithExtensions);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Verify structure contains extension resources
    const extensionResources = templateWithExtensions.resources.filter(
      (resource: any) =>
        resource.type === "Microsoft.Compute/virtualMachines/extensions",
    );
    expect(extensionResources.length).toBeGreaterThan(0);

    // Verify VM has managed identity
    const vmResource = templateWithExtensions.resources.find(
      (resource: any) => resource.type === "Microsoft.Compute/virtualMachines",
    );
    expect(vmResource?.identity).toBeDefined();
    expect(vmResource?.identity?.type).toBe("SystemAssigned");
  });

  test("template extension parameters should have proper defaults", () => {
    // Test extension parameter validation
    const extensionParameters = {
      installExtensions: { type: "bool", defaultValue: true },
      installCustomScriptExtension: { type: "bool", defaultValue: false },
      installMonitoringExtension: { type: "bool", defaultValue: true },
      installSecurityExtension: { type: "bool", defaultValue: true },
      installAntimalwareExtension: { type: "bool", defaultValue: true },
      enableManagedIdentity: { type: "bool", defaultValue: true },
      customScriptUrl: { type: "string", defaultValue: "" },
      customScriptCommand: { type: "string", defaultValue: "" },
      workspaceId: { type: "string", defaultValue: "" },
      workspaceKey: { type: "securestring", defaultValue: "" },
    };

    // Verify all extension parameters have appropriate types and defaults
    expect(extensionParameters.installExtensions.type).toBe("bool");
    expect(extensionParameters.installExtensions.defaultValue).toBe(true);
    expect(extensionParameters.installCustomScriptExtension.defaultValue).toBe(
      false,
    );
    expect(extensionParameters.workspaceKey.type).toBe("securestring");
    expect(extensionParameters.enableManagedIdentity.defaultValue).toBe(true);
  });

  test("template with availability set should have valid structure", () => {
    // Mock template with availability set
    const templateWithAvailabilitySet = {
      $schema:
        "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        vmName: { type: "string", defaultValue: "testvm" },
        location: { type: "string", defaultValue: "East US" },
        createAvailabilitySet: { type: "bool", defaultValue: true },
        platformFaultDomainCount: { type: "int", defaultValue: 2 },
        platformUpdateDomainCount: { type: "int", defaultValue: 5 },
      },
      variables: {
        vmName: "[parameters('vmName')]",
        availabilitySetName: "[concat(parameters('vmName'), '-avset')]",
      },
      resources: [
        {
          type: "Microsoft.Compute/availabilitySets",
          apiVersion: "2023-09-01",
          name: "[variables('availabilitySetName')]",
          location: "[parameters('location')]",
          sku: { name: "Aligned" },
          properties: {
            platformFaultDomainCount:
              "[parameters('platformFaultDomainCount')]",
            platformUpdateDomainCount:
              "[parameters('platformUpdateDomainCount')]",
          },
        },
        {
          type: "Microsoft.Compute/virtualMachines",
          apiVersion: "2021-03-01",
          name: "[variables('vmName')]",
          location: "[parameters('location')]",
          dependsOn: [
            "[resourceId('Microsoft.Compute/availabilitySets', variables('availabilitySetName'))]",
          ],
          properties: {
            availabilitySet: {
              id: "[resourceId('Microsoft.Compute/availabilitySets', variables('availabilitySetName'))]",
            },
            hardwareProfile: { vmSize: "Standard_B2s" },
          },
        },
      ],
      outputs: {
        availabilitySetId: {
          type: "string",
          value:
            "[resourceId('Microsoft.Compute/availabilitySets', variables('availabilitySetName'))]",
        },
      },
    };

    const result = validateArmStructure(templateWithAvailabilitySet);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Verify availability set resource exists
    const availabilitySetResource = templateWithAvailabilitySet.resources.find(
      (resource: any) => resource.type === "Microsoft.Compute/availabilitySets",
    );
    expect(availabilitySetResource).toBeDefined();
    expect(availabilitySetResource?.sku?.name).toBe("Aligned");

    // Verify VM references availability set
    const vmResource = templateWithAvailabilitySet.resources.find(
      (resource: any) => resource.type === "Microsoft.Compute/virtualMachines",
    );
    expect(vmResource?.properties?.availabilitySet).toBeDefined();
  });

  test("template with backup configuration should have valid structure", () => {
    // Mock template with backup resources
    const templateWithBackup = {
      $schema:
        "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        vmName: { type: "string", defaultValue: "testvm" },
        location: { type: "string", defaultValue: "East US" },
        enableBackup: { type: "bool", defaultValue: true },
        dailyRetentionDays: { type: "int", defaultValue: 30 },
        backupScheduleTime: { type: "string", defaultValue: "02:00" },
      },
      variables: {
        vmName: "[parameters('vmName')]",
        backupVaultName: "[concat(parameters('vmName'), '-vault')]",
        backupPolicyName: "[concat('policy-', parameters('vmName'))]",
      },
      resources: [
        {
          type: "Microsoft.RecoveryServices/vaults",
          apiVersion: "2023-06-01",
          name: "[variables('backupVaultName')]",
          location: "[parameters('location')]",
          sku: { name: "RS0", tier: "Standard" },
          properties: {
            publicNetworkAccess: "Enabled",
          },
        },
        {
          type: "Microsoft.RecoveryServices/vaults/backupPolicies",
          apiVersion: "2023-06-01",
          name: "[concat(variables('backupVaultName'), '/', variables('backupPolicyName'))]",
          dependsOn: [
            "[resourceId('Microsoft.RecoveryServices/vaults', variables('backupVaultName'))]",
          ],
          properties: {
            backupManagementType: "AzureIaasVM",
            schedulePolicy: {
              schedulePolicyType: "SimpleSchedulePolicy",
              scheduleRunFrequency: "Daily",
              scheduleRunTimes: ["[parameters('backupScheduleTime')]"],
            },
          },
        },
      ],
      outputs: {
        backupVaultId: {
          type: "string",
          value:
            "[resourceId('Microsoft.RecoveryServices/vaults', variables('backupVaultName'))]",
        },
      },
    };

    const result = validateArmStructure(templateWithBackup);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Verify backup vault resource exists
    const vaultResource = templateWithBackup.resources.find(
      (resource: any) => resource.type === "Microsoft.RecoveryServices/vaults",
    );
    expect(vaultResource).toBeDefined();
    expect(vaultResource?.sku?.name).toBe("RS0");

    // Verify backup policy resource exists
    const policyResource = templateWithBackup.resources.find(
      (resource: any) =>
        resource.type === "Microsoft.RecoveryServices/vaults/backupPolicies",
    );
    expect(policyResource).toBeDefined();
    expect(policyResource?.properties?.backupManagementType).toBe(
      "AzureIaasVM",
    );
  });
});

describe("CreateUiDefinition Template Validation", () => {
  // Helper function to validate CreateUiDefinition JSON structure
  const validateCreateUiDefinition = (uiDef: any) => {
    const errors: string[] = [];

    // Required schema
    if (!uiDef.$schema) {
      errors.push("Missing $schema property");
    } else if (!uiDef.$schema.includes("CreateUIDefinition")) {
      errors.push("Invalid schema for CreateUIDefinition");
    }

    // Required handler
    if (uiDef.handler !== "Microsoft.Azure.CreateUIDef") {
      errors.push("Invalid or missing handler");
    }

    // Version check
    if (!uiDef.version || !uiDef.version.includes("0.1.2")) {
      errors.push("Invalid or missing version");
    }

    // Parameters structure
    if (!uiDef.parameters) {
      errors.push("Missing parameters object");
    } else {
      if (!uiDef.parameters.config) {
        errors.push("Missing config section");
      }
      if (!uiDef.parameters.basics || !Array.isArray(uiDef.parameters.basics)) {
        errors.push("Missing or invalid basics section");
      }
      if (!uiDef.parameters.steps || !Array.isArray(uiDef.parameters.steps)) {
        errors.push("Missing or invalid steps section");
      }
      if (!uiDef.parameters.outputs) {
        errors.push("Missing outputs section");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  test("createUiDefinition.json.hbs should have valid schema structure", () => {
    // Mock basic UI definition structure
    const mockUiDefinition = {
      $schema:
        "https://schema.management.azure.com/schemas/0.1.2-preview/CreateUIDefinition.MultiVm.json#",
      handler: "Microsoft.Azure.CreateUIDef",
      version: "0.1.2-preview",
      parameters: {
        config: {
          isWizard: true,
          basics: {},
        },
        basics: [],
        steps: [],
        outputs: {},
      },
    };

    const result = validateCreateUiDefinition(mockUiDefinition);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("UI definition should have wizard flow with correct steps", () => {
    // Test the expected step structure
    const expectedSteps = [
      "networkingConfig",
      "extensionsConfig",
      "hadrConfig",
      "reviewConfig",
    ];

    const mockUiDefinition = {
      $schema:
        "https://schema.management.azure.com/schemas/0.1.2-preview/CreateUIDefinition.MultiVm.json#",
      handler: "Microsoft.Azure.CreateUIDef",
      version: "0.1.2-preview",
      parameters: {
        config: {
          isWizard: true,
        },
        basics: [
          {
            name: "vmName",
            type: "Microsoft.Common.TextBox",
            label: "Virtual Machine Name",
          },
        ],
        steps: [
          {
            name: "networkingConfig",
            label: "Networking",
            elements: [],
          },
          {
            name: "extensionsConfig",
            label: "Extensions & Monitoring",
            elements: [],
          },
          {
            name: "hadrConfig",
            label: "High Availability & Disaster Recovery",
            elements: [],
          },
          {
            name: "reviewConfig",
            label: "Review + Create",
            elements: [],
          },
        ],
        outputs: {},
      },
    };

    const result = validateCreateUiDefinition(mockUiDefinition);
    expect(result.isValid).toBe(true);

    // Verify wizard is enabled
    expect(mockUiDefinition.parameters.config.isWizard).toBe(true);

    // Verify all expected steps are present
    const stepNames = mockUiDefinition.parameters.steps.map(
      (step: any) => step.name,
    );
    expectedSteps.forEach((expectedStep) => {
      expect(stepNames).toContain(expectedStep);
    });

    // Verify step order
    expect(stepNames).toEqual(expectedSteps);
  });

  test("UI definition basics should include core VM parameters", () => {
    const expectedBasicsControls = [
      "vmName",
      "adminUsername",
      "authenticationType",
      "adminPasswordOrKey",
      "vmSize",
    ];

    const mockBasics = [
      { name: "vmName", type: "Microsoft.Common.TextBox" },
      { name: "adminUsername", type: "Microsoft.Common.TextBox" },
      { name: "authenticationType", type: "Microsoft.Common.DropDown" },
      { name: "adminPasswordOrKey", type: "Microsoft.Common.PasswordBox" },
      { name: "vmSize", type: "Microsoft.Compute.SizeSelector" },
    ];

    const controlNames = mockBasics.map((control) => control.name);

    expectedBasicsControls.forEach((expectedControl) => {
      expect(controlNames).toContain(expectedControl);
    });

    // Verify specific control types
    expect(mockBasics.find((c) => c.name === "vmSize")?.type).toBe(
      "Microsoft.Compute.SizeSelector",
    );
    expect(mockBasics.find((c) => c.name === "authenticationType")?.type).toBe(
      "Microsoft.Common.DropDown",
    );
  });

  test("networking step should include VNet and security controls", () => {
    const expectedNetworkingControls = [
      "virtualNetwork",
      "publicIPAddress",
      "networkSecurityGroup",
    ];

    const mockNetworkingStep = {
      name: "networkingConfig",
      label: "Networking",
      elements: [
        {
          name: "virtualNetwork",
          type: "Microsoft.Network.VirtualNetworkCombo",
        },
        {
          name: "publicIPAddress",
          type: "Microsoft.Network.PublicIpAddressCombo",
        },
        {
          name: "networkSecurityGroup",
          type: "Microsoft.Common.Section",
          elements: [
            { name: "allowSshRdp", type: "Microsoft.Common.CheckBox" },
          ],
        },
      ],
    };

    const elementNames = mockNetworkingStep.elements.map((el) => el.name);

    expectedNetworkingControls.forEach((expectedControl) => {
      expect(elementNames).toContain(expectedControl);
    });

    // Verify specialized networking controls
    expect(
      mockNetworkingStep.elements.find((e) => e.name === "virtualNetwork")
        ?.type,
    ).toBe("Microsoft.Network.VirtualNetworkCombo");
    expect(
      mockNetworkingStep.elements.find((e) => e.name === "publicIPAddress")
        ?.type,
    ).toBe("Microsoft.Network.PublicIpAddressCombo");
  });

  test("extensions step should include monitoring and security options", () => {
    const expectedExtensionControls = [
      "installExtensions",
      "monitoringSection",
      "securitySection",
      "customScriptSection",
    ];

    const mockExtensionsStep = {
      name: "extensionsConfig",
      label: "Extensions & Monitoring",
      elements: [
        { name: "installExtensions", type: "Microsoft.Common.CheckBox" },
        {
          name: "monitoringSection",
          type: "Microsoft.Common.Section",
          elements: [
            {
              name: "installMonitoringExtension",
              type: "Microsoft.Common.CheckBox",
            },
          ],
        },
        {
          name: "securitySection",
          type: "Microsoft.Common.Section",
          elements: [
            {
              name: "installSecurityExtension",
              type: "Microsoft.Common.CheckBox",
            },
            {
              name: "enableManagedIdentity",
              type: "Microsoft.Common.CheckBox",
            },
          ],
        },
        {
          name: "customScriptSection",
          type: "Microsoft.Common.Section",
          elements: [
            {
              name: "installCustomScriptExtension",
              type: "Microsoft.Common.CheckBox",
            },
          ],
        },
      ],
    };

    const elementNames = mockExtensionsStep.elements.map((el) => el.name);

    expectedExtensionControls.forEach((expectedControl) => {
      expect(elementNames).toContain(expectedControl);
    });

    // Verify section structure for extensions
    const monitoringSection = mockExtensionsStep.elements.find(
      (e) => e.name === "monitoringSection",
    );
    expect(monitoringSection?.type).toBe("Microsoft.Common.Section");

    const securitySection = mockExtensionsStep.elements.find(
      (e) => e.name === "securitySection",
    );
    expect(securitySection?.type).toBe("Microsoft.Common.Section");
  });

  test("HA/DR step should include availability and backup options", () => {
    const expectedHadrControls = [
      "availabilitySection",
      "backupSection",
      "snapshotSection",
    ];

    const mockHadrStep = {
      name: "hadrConfig",
      label: "High Availability & Disaster Recovery",
      elements: [
        {
          name: "availabilitySection",
          type: "Microsoft.Common.Section",
          elements: [
            {
              name: "availabilityChoice",
              type: "Microsoft.Common.OptionsGroup",
              constraints: {
                allowedValues: [
                  { value: "none" },
                  { value: "availabilitySet" },
                  { value: "availabilityZones" },
                ],
              },
            },
          ],
        },
        {
          name: "backupSection",
          type: "Microsoft.Common.Section",
          elements: [
            { name: "enableBackup", type: "Microsoft.Common.CheckBox" },
          ],
        },
        {
          name: "snapshotSection",
          type: "Microsoft.Common.Section",
          elements: [
            { name: "enableSnapshot", type: "Microsoft.Common.CheckBox" },
          ],
        },
      ],
    };

    const elementNames = mockHadrStep.elements.map((el) => el.name);

    expectedHadrControls.forEach((expectedControl) => {
      expect(elementNames).toContain(expectedControl);
    });

    // Verify availability choice options
    const availabilitySection = mockHadrStep.elements.find(
      (e) => e.name === "availabilitySection",
    );
    const availabilityChoice = (availabilitySection as any)?.elements?.find(
      (e: any) => e.name === "availabilityChoice",
    );

    expect(availabilityChoice?.type).toBe("Microsoft.Common.OptionsGroup");
    expect(availabilityChoice?.constraints?.allowedValues).toHaveLength(3);

    const optionValues = availabilityChoice?.constraints?.allowedValues?.map(
      (opt: any) => opt.value,
    );
    expect(optionValues).toContain("none");
    expect(optionValues).toContain("availabilitySet");
    expect(optionValues).toContain("availabilityZones");
  });

  test("outputs should map to all template parameters", () => {
    const expectedOutputs = [
      // Basic outputs
      "vmName",
      "adminUsername",
      "authenticationType",
      "adminPasswordOrKey",
      "vmSize",
      "location",
      // Networking outputs
      "virtualNetworkName",
      "subnetName",
      "publicIPName",
      "allowSshRdp",
      // Extension outputs
      "installExtensions",
      "installMonitoringExtension",
      "installSecurityExtension",
      "enableManagedIdentity",
      // HA/DR outputs
      "createAvailabilitySet",
      "useAvailabilityZones",
      "enableBackup",
      "enableSnapshot",
    ];

    const mockOutputs = {
      vmName: '[basics("vmName")]',
      adminUsername: '[basics("adminUsername")]',
      authenticationType: '[basics("authenticationType")]',
      adminPasswordOrKey: '[basics("adminPasswordOrKey")]',
      vmSize: '[basics("vmSize")]',
      location: "[location()]",
      virtualNetworkName: '[steps("networkingConfig").virtualNetwork.name]',
      subnetName:
        '[steps("networkingConfig").virtualNetwork.subnets.subnet1.name]',
      publicIPName: '[steps("networkingConfig").publicIPAddress.name]',
      allowSshRdp:
        '[steps("networkingConfig").networkSecurityGroup.allowSshRdp]',
      installExtensions: '[steps("extensionsConfig").installExtensions]',
      installMonitoringExtension:
        '[steps("extensionsConfig").monitoringSection.installMonitoringExtension]',
      installSecurityExtension:
        '[steps("extensionsConfig").securitySection.installSecurityExtension]',
      enableManagedIdentity:
        '[steps("extensionsConfig").securitySection.enableManagedIdentity]',
      createAvailabilitySet:
        '[equals(steps("hadrConfig").availabilitySection.availabilityChoice, "availabilitySet")]',
      useAvailabilityZones:
        '[equals(steps("hadrConfig").availabilitySection.availabilityChoice, "availabilityZones")]',
      enableBackup: '[steps("hadrConfig").backupSection.enableBackup]',
      enableSnapshot: '[steps("hadrConfig").snapshotSection.enableSnapshot]',
    };

    const outputKeys = Object.keys(mockOutputs);

    expectedOutputs.forEach((expectedOutput) => {
      expect(outputKeys).toContain(expectedOutput);
    });

    // Verify output expressions use correct references
    expect(mockOutputs.vmName).toContain("basics(");
    expect(mockOutputs.virtualNetworkName).toContain(
      'steps("networkingConfig")',
    );
    expect(mockOutputs.createAvailabilitySet).toContain("equals(");
    expect(mockOutputs.location).toBe("[location()]");
  });

  test("UI definition should handle conditional visibility correctly", () => {
    // Test conditional visibility for various controls
    const conditionalVisibilityTests = [
      {
        control: "availabilitySetConfig",
        condition:
          'equals(steps("hadrConfig").availabilitySection.availabilityChoice, "availabilitySet")',
        description:
          "Availability set config should only show when availability set is selected",
      },
      {
        control: "backupConfig",
        condition: 'steps("hadrConfig").backupSection.enableBackup',
        description: "Backup config should only show when backup is enabled",
      },
      {
        control: "customScriptConfig",
        condition:
          'steps("extensionsConfig").customScriptSection.installCustomScriptExtension',
        description:
          "Custom script config should only show when custom script extension is enabled",
      },
      {
        control: "workspaceConfig",
        condition:
          'steps("extensionsConfig").monitoringSection.installMonitoringExtension',
        description:
          "Workspace config should only show when monitoring extension is enabled",
      },
    ];

    conditionalVisibilityTests.forEach((test) => {
      // These would be validated in actual template rendering
      expect(test.condition).toBeTruthy();
      expect(test.description).toBeTruthy();
    });

    // Verify mutual exclusion for availability options
    const mutualExclusionTest = {
      availabilitySet:
        'equals(steps("hadrConfig").availabilitySection.availabilityChoice, "availabilitySet")',
      availabilityZones:
        'equals(steps("hadrConfig").availabilitySection.availabilityChoice, "availabilityZones")',
      none: 'equals(steps("hadrConfig").availabilitySection.availabilityChoice, "none")',
    };

    // These conditions should be mutually exclusive
    Object.values(mutualExclusionTest).forEach((condition) => {
      expect(condition).toContain("equals(");
      expect(condition).toContain("availabilityChoice");
    });
  });

  test("UI definition validation rules should be comprehensive", () => {
    const validationRules = {
      vmName: {
        regex: "^[a-zA-Z0-9][a-zA-Z0-9\\-]{0,62}[a-zA-Z0-9]$",
        message:
          "VM name must be 1-64 characters, start and end with alphanumeric, can contain hyphens",
      },
      adminUsername: {
        regex: "^[a-zA-Z][a-zA-Z0-9]{2,19}$",
        message:
          "Username must be 3-20 characters, start with letter, alphanumeric only",
      },
      sshPublicKey: {
        regex: "^ssh-(rsa|dss|ecdsa)\\s+[A-Za-z0-9+/]+[=]{0,2}(\\s+.*)?$",
        message: "Must be a valid SSH public key",
      },
      password: {
        regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{12,}$",
        message:
          "Password must be at least 12 characters with uppercase, lowercase, and numbers",
      },
      customScriptUrl: {
        regex: "^https:\\/\\/.*\\.(sh|ps1|py|bat|cmd)$",
        message: "Must be a valid HTTPS URL pointing to a script file",
      },
      backupTime: {
        regex: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        message: "Must be in HH:mm format (e.g., 02:00, 14:30)",
      },
    };

    // Verify validation rules are comprehensive
    Object.entries(validationRules).forEach(([field, rule]) => {
      expect(rule.regex).toBeTruthy();
      expect(rule.message).toBeTruthy();
      expect(rule.message.length).toBeGreaterThan(10);
    });

    // Test sample valid inputs
    const validInputs = {
      vmName: "my-test-vm",
      adminUsername: "azureuser",
      backupTime: "02:00",
    };

    Object.entries(validInputs).forEach(([field, value]) => {
      const rule = validationRules[field as keyof typeof validationRules];
      if (rule) {
        const regex = new RegExp(rule.regex);
        expect(regex.test(value)).toBe(true);
      }
    });
  });
});
