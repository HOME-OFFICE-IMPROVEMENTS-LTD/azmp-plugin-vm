/**
 * Tests for Azure VM Diagnostics Module
 * 
 * Tests P0-2: Diagnostics Extension Auto-Enable
 */

import {
  DiagnosticsManager,
  DiagnosticsConfiguration,
  createWindowsDiagnostics,
  createLinuxDiagnostics,
  isMarketplaceCompliant,
  generateDiagnosticsTemplate,
  DIAGNOSTICS_DEFAULTS,
  WINDOWS_PERFORMANCE_COUNTERS,
  WINDOWS_EVENT_LOGS,
} from '../diagnostics';

// ============================================================================
// Test Suite: DiagnosticsManager Construction
// ============================================================================

describe('DiagnosticsManager - Construction', () => {
  test('should create Windows diagnostics manager with defaults', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    expect(manager).toBeInstanceOf(DiagnosticsManager);
  });

  test('should create Linux diagnostics manager with defaults', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Linux',
      vmName: 'test-vm',
      location: 'westus',
    };

    const manager = new DiagnosticsManager(config);
    expect(manager).toBeInstanceOf(DiagnosticsManager);
  });

  test('should auto-generate storage account name if not provided', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'my-test-vm-01',
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.storageAccountName).toBeDefined();
    expect(storageConfig.storageAccountName.length).toBeGreaterThanOrEqual(3);
    expect(storageConfig.storageAccountName.length).toBeLessThanOrEqual(24);
    expect(storageConfig.storageAccountName).toMatch(/^[a-z0-9]+$/);
  });

  test('should use provided storage account name', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      storageAccountName: 'mystorageaccount123',
    };

    const manager = new DiagnosticsManager(config);
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.storageAccountName).toBe('mystorageaccount123');
  });

  test('should apply default retention days', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    const params = manager.getTemplateParameters();

    expect(params.diagnosticsRetentionDays.defaultValue).toBe(
      DIAGNOSTICS_DEFAULTS.RETENTION_DAYS
    );
  });
});

// ============================================================================
// Test Suite: Storage Account Configuration
// ============================================================================

describe('DiagnosticsManager - Storage Account', () => {
  test('should generate storage account resource with correct properties', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const resource = manager.getStorageAccountResource();

    expect(resource.type).toBe('Microsoft.Storage/storageAccounts');
    expect(resource.apiVersion).toBe('2021-09-01');
    expect(resource.kind).toBe('StorageV2');
    expect(resource.properties.supportsHttpsTrafficOnly).toBe(true);
    expect(resource.properties.encryption).toBeDefined();
  });

  test('should set createNew flag when no resource group provided', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.createNew).toBe(true);
    expect(storageConfig.existingResourceGroup).toBeUndefined();
  });

  test('should set createNew to false when resource group provided', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      storageAccountResourceGroup: 'existing-rg',
    };

    const manager = new DiagnosticsManager(config);
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.createNew).toBe(false);
    expect(storageConfig.existingResourceGroup).toBe('existing-rg');
  });

  test('should use default storage account type', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.storageAccountType).toBe(
      DIAGNOSTICS_DEFAULTS.STORAGE_ACCOUNT_TYPE
    );
  });
});

// ============================================================================
// Test Suite: Windows Diagnostics Extension
// ============================================================================

describe('DiagnosticsManager - Windows Extension', () => {
  test('should generate Windows IaaSDiagnostics extension', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const extension = manager.getWindowsExtension();

    expect(extension.type).toBe('Microsoft.Compute/virtualMachines/extensions');
    expect(extension.properties.publisher).toBe('Microsoft.Azure.Diagnostics');
    expect(extension.properties.type).toBe('IaaSDiagnostics');
    expect(extension.properties.typeHandlerVersion).toBe(
      DIAGNOSTICS_DEFAULTS.WINDOWS_EXTENSION_VERSION
    );
    expect(extension.properties.autoUpgradeMinorVersion).toBe(true);
  });

  test('should include storage account in extension settings', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const extension = manager.getWindowsExtension();

    expect(extension.properties.settings.storageAccount).toBeDefined();
    expect(extension.properties.settings.xmlCfg).toBeDefined();
  });

  test('should include storage account key in protected settings', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const extension = manager.getWindowsExtension();

    expect(extension.properties.protectedSettings.storageAccountName).toBeDefined();
    expect(extension.properties.protectedSettings.storageAccountKey).toBeDefined();
    expect(extension.properties.protectedSettings.storageAccountEndPoint).toBe(
      'https://core.windows.net'
    );
  });

  test('should depend on VM and storage account', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const extension = manager.getWindowsExtension();

    expect(extension.dependsOn).toHaveLength(2);
    expect(extension.dependsOn.some((dep: string) => dep.includes('virtualMachines'))).toBe(true);
    expect(extension.dependsOn.some((dep: string) => dep.includes('storageAccounts'))).toBe(true);
  });
});

// ============================================================================
// Test Suite: Linux Diagnostics Extension
// ============================================================================

describe('DiagnosticsManager - Linux Extension', () => {
  test('should generate Linux LinuxDiagnostic extension', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getLinuxExtension();

    expect(extension.type).toBe('Microsoft.Compute/virtualMachines/extensions');
    expect(extension.properties.publisher).toBe('Microsoft.Azure.Diagnostics');
    expect(extension.properties.type).toBe('LinuxDiagnostic');
    expect(extension.properties.typeHandlerVersion).toBe(
      DIAGNOSTICS_DEFAULTS.LINUX_EXTENSION_VERSION
    );
    expect(extension.properties.autoUpgradeMinorVersion).toBe(true);
  });

  test('should include ladCfg in extension settings', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getLinuxExtension();

    expect(extension.properties.settings.ladCfg).toBeDefined();
    expect(extension.properties.settings.ladCfg.diagnosticMonitorConfiguration).toBeDefined();
  });

  test('should include SAS token in protected settings', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getLinuxExtension();

    expect(extension.properties.protectedSettings.storageAccountName).toBeDefined();
    expect(extension.properties.protectedSettings.storageAccountSasToken).toBeDefined();
    expect(extension.properties.protectedSettings.storageAccountEndPoint).toBe(
      'https://core.windows.net'
    );
  });

  test('should configure performance counters', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getLinuxExtension();
    const perfCounters =
      extension.properties.settings.ladCfg.diagnosticMonitorConfiguration
        .performanceCounters.performanceCounterConfiguration;

    expect(perfCounters).toBeDefined();
    expect(perfCounters.length).toBeGreaterThan(0);
    expect(perfCounters.some((pc: any) => pc.class === 'processor')).toBe(true);
    expect(perfCounters.some((pc: any) => pc.class === 'memory')).toBe(true);
    expect(perfCounters.some((pc: any) => pc.class === 'disk')).toBe(true);
    expect(perfCounters.some((pc: any) => pc.class === 'network')).toBe(true);
  });

  test('should configure syslog events', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getLinuxExtension();
    const syslog =
      extension.properties.settings.ladCfg.diagnosticMonitorConfiguration
        .syslogEvents.syslogEventConfiguration;

    expect(syslog).toBeDefined();
    expect(Object.keys(syslog).length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test Suite: Boot Diagnostics Configuration
// ============================================================================

describe('DiagnosticsManager - Boot Diagnostics', () => {
  test('should enable boot diagnostics by default', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const bootConfig = manager.getBootDiagnosticsConfig();

    expect(bootConfig.enabled).toBe(true);
    expect(bootConfig.storageUri).toBeDefined();
  });

  test('should disable boot diagnostics when explicitly disabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      enableBootDiagnostics: false,
    };

    const manager = new DiagnosticsManager(config);
    const bootConfig = manager.getBootDiagnosticsConfig();

    expect(bootConfig.enabled).toBe(false);
    expect(bootConfig.storageUri).toBeUndefined();
  });
});

// ============================================================================
// Test Suite: ARM Template Generation
// ============================================================================

describe('DiagnosticsManager - ARM Template', () => {
  test('should generate template parameters', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const params = manager.getTemplateParameters();

    expect(params.diagnosticsEnabled).toBeDefined();
    expect(params.diagnosticsEnabled.type).toBe('bool');
    expect(params.diagnosticsEnabled.defaultValue).toBe(true);

    expect(params.diagnosticsStorageAccountName).toBeDefined();
    expect(params.diagnosticsRetentionDays).toBeDefined();
    expect(params.utcValue).toBeDefined();
  });

  test('should generate template variables for Windows', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const vars = manager.getTemplateVariables();

    expect(vars.diagnosticsStorageAccountName).toBeDefined();
    expect(vars.diagnosticsStorageAccountType).toBe('Standard_LRS');
    expect(vars.wadCfgXml).toBeDefined();
    expect(typeof vars.wadCfgXml).toBe('string');
  });

  test('should generate template variables for Linux', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const vars = manager.getTemplateVariables();

    expect(vars.diagnosticsStorageAccountName).toBeDefined();
    expect(vars.diagnosticsStorageAccountType).toBe('Standard_LRS');
    expect(vars.ladCfg).toBeDefined();
    expect(typeof vars.ladCfg).toBe('object');
    expect(vars.accountSasProperties).toBeDefined();
  });

  test('should include performance counters in Windows WAD config', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const vars = manager.getTemplateVariables();
    const wadXml = vars.wadCfgXml as string;

    WINDOWS_PERFORMANCE_COUNTERS.forEach((counter) => {
      expect(wadXml).toContain(counter);
    });
  });

  test('should include event logs in Windows WAD config', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const vars = manager.getTemplateVariables();
    const wadXml = vars.wadCfgXml as string;

    expect(wadXml).toContain('System');
    expect(wadXml).toContain('Application');
  });
});

// ============================================================================
// Test Suite: Configuration Validation
// ============================================================================

describe('DiagnosticsManager - Validation', () => {
  test('should validate correct configuration', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const validation = manager.validate();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should reject missing VM name', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: '',
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('VM name is required');
  });

  test('should reject missing location', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: '',
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Location is required');
  });

  test('should reject invalid retention days (too low)', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      retentionDays: 0,
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Retention days must be between 1 and 365'
    );
  });

  test('should reject invalid retention days (too high)', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      retentionDays: 400,
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Retention days must be between 1 and 365'
    );
  });

  test('should reject storage account name that is too short', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      storageAccountName: 'ab',
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('3 and 24 characters'))).toBe(true);
  });

  test('should reject storage account name that is too long', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      storageAccountName: 'a'.repeat(25),
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('3 and 24 characters'))).toBe(true);
  });

  test('should reject storage account name with invalid characters', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      storageAccountName: 'MyStorage-Account',
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('lowercase letters and numbers'))).toBe(true);
  });
});

// ============================================================================
// Test Suite: Marketplace Compliance
// ============================================================================

describe('Marketplace Compliance', () => {
  test('should be compliant with default configuration', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    expect(isMarketplaceCompliant(config)).toBe(true);
  });

  test('should be non-compliant if diagnostics disabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: false,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    expect(isMarketplaceCompliant(config)).toBe(false);
  });

  test('should be non-compliant if boot diagnostics disabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      enableBootDiagnostics: false,
    };

    expect(isMarketplaceCompliant(config)).toBe(false);
  });

  test('should be non-compliant if guest diagnostics disabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      enableGuestDiagnostics: false,
    };

    expect(isMarketplaceCompliant(config)).toBe(false);
  });
});

// ============================================================================
// Test Suite: Helper Functions
// ============================================================================

describe('Helper Functions', () => {
  test('createWindowsDiagnostics should create Windows manager', () => {
    const manager = createWindowsDiagnostics('test-vm', 'eastus');
    const extension = manager.getExtension();

    expect(extension.properties.type).toBe('IaaSDiagnostics');
  });

  test('createLinuxDiagnostics should create Linux manager', () => {
    const manager = createLinuxDiagnostics('test-vm', 'eastus');
    const extension = manager.getExtension();

    expect(extension.properties.type).toBe('LinuxDiagnostic');
  });

  test('generateDiagnosticsTemplate should create complete template', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    const template = generateDiagnosticsTemplate(config);

    expect(template.parameters).toBeDefined();
    expect(template.variables).toBeDefined();
    expect(template.resources).toBeDefined();
    expect(template.resources.length).toBeGreaterThanOrEqual(2); // Storage + Extension
  });

  test('generateDiagnosticsTemplate should throw on invalid config', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: '', // Invalid
      location: 'eastus',
    };

    expect(() => generateDiagnosticsTemplate(config)).toThrow();
  });

  test('generateDiagnosticsTemplate should include storage account', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    const template = generateDiagnosticsTemplate(config);
    const hasStorage = template.resources.some(
      (r: any) => r.type === 'Microsoft.Storage/storageAccounts'
    );

    expect(hasStorage).toBe(true);
  });

  test('generateDiagnosticsTemplate should include extension when guest diagnostics enabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
    };

    const template = generateDiagnosticsTemplate(config);
    const hasExtension = template.resources.some(
      (r: any) => r.type === 'Microsoft.Compute/virtualMachines/extensions'
    );

    expect(hasExtension).toBe(true);
  });

  test('generateDiagnosticsTemplate should exclude extension when guest diagnostics disabled', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      enableGuestDiagnostics: false,
    };

    const template = generateDiagnosticsTemplate(config);
    const hasExtension = template.resources.some(
      (r: any) => r.type === 'Microsoft.Compute/virtualMachines/extensions'
    );

    expect(hasExtension).toBe(false);
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  test('should handle VM name with special characters in storage account generation', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'Test-VM_2024!@#',
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.storageAccountName).toMatch(/^[a-z0-9]+$/);
  });

  test('should handle very long VM name in storage account generation', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'a'.repeat(100),
      location: 'eastus',
    };

    const manager = new DiagnosticsManager(config);
    const storageConfig = manager.getStorageConfig();

    expect(storageConfig.storageAccountName.length).toBeLessThanOrEqual(24);
  });

  test('should handle minimum retention days', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      retentionDays: 1,
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(true);
  });

  test('should handle maximum retention days', () => {
    const config: DiagnosticsConfiguration = {
      enabled: true,
      osType: 'Windows',
      vmName: 'test-vm',
      location: 'eastus',
      retentionDays: 365,
    };

    const manager = new DiagnosticsManager(config);
    const validation = manager.validate();

    expect(validation.valid).toBe(true);
  });
});
