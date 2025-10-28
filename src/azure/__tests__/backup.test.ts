/**
 * Test suite for Azure Backup configuration module
 * 
 * Tests cover:
 * - BackupManager construction and configuration
 * - Backup policy presets (Development, Production, Long-term)
 * - Validation logic and error handling
 * - ARM template generation (vault, policy, protected item)
 * - Cost estimation calculations
 * - Marketplace compliance checking
 * - Helper functions
 */

import {
  BackupManager,
  BackupPolicyPreset,
  BackupFrequency,
  DayOfWeek,
  VaultSku,
  BackupConfiguration,
  createBackupConfiguration,
  generateBackupTemplate,
} from '../backup';

describe('BackupManager - Construction', () => {
  test('should create manager with basic configuration', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'testVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'testVM',
      resourceGroupName: 'testRG',
    };

    const manager = new BackupManager(config);
    expect(manager).toBeDefined();
  });

  test('should create manager with vault creation', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'newVault',
      createVault: true,
      vaultConfig: {
        name: 'newVault',
        location: 'eastus',
        sku: VaultSku.Standard,
        publicNetworkAccess: true,
      },
      policyPreset: BackupPolicyPreset.Development,
      vmName: 'testVM',
      resourceGroupName: 'testRG',
    };

    const manager = new BackupManager(config);
    expect(manager).toBeDefined();
  });

  test('should create manager with custom policy', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'testVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Custom,
      customPolicy: {
        name: 'CustomPolicy',
        schedule: {
          frequency: BackupFrequency.Daily,
          time: '03:00',
        },
        retention: {
          dailyRetentionDays: 14,
          weeklyRetentionWeeks: 8,
        },
        instantRestore: {
          enabled: true,
          retentionDays: 3,
        },
      },
      vmName: 'testVM',
      resourceGroupName: 'testRG',
    };

    const manager = new BackupManager(config);
    expect(manager).toBeDefined();
  });
});

describe('BackupManager - Static Methods', () => {
  test('should get Development preset policy', () => {
    const preset = BackupManager.getPresetPolicy(BackupPolicyPreset.Development);
    
    expect(preset.name).toBe('Development');
    expect(preset.schedule.frequency).toBe(BackupFrequency.Daily);
    expect(preset.retention.dailyRetentionDays).toBe(7);
    expect(preset.instantRestore.retentionDays).toBe(2);
    expect(preset.estimatedMonthlyCostPer100GB).toBe(15);
  });

  test('should get Production preset policy', () => {
    const preset = BackupManager.getPresetPolicy(BackupPolicyPreset.Production);
    
    expect(preset.name).toBe('Production');
    expect(preset.retention.dailyRetentionDays).toBe(30);
    expect(preset.retention.weeklyRetentionWeeks).toBe(12);
    expect(preset.retention.monthlyRetentionMonths).toBe(12);
    expect(preset.instantRestore.retentionDays).toBe(5);
    expect(preset.estimatedMonthlyCostPer100GB).toBe(35);
  });

  test('should get Long-term preset policy', () => {
    const preset = BackupManager.getPresetPolicy(BackupPolicyPreset.LongTerm);
    
    expect(preset.name).toBe('Long-term');
    expect(preset.retention.dailyRetentionDays).toBe(90);
    expect(preset.retention.weeklyRetentionWeeks).toBe(52);
    expect(preset.retention.monthlyRetentionMonths).toBe(60);
    expect(preset.retention.yearlyRetentionYears).toBe(7);
    expect(preset.estimatedMonthlyCostPer100GB).toBe(75);
  });

  test('should get all preset policies', () => {
    const presets = BackupManager.getAllPresets();
    
    expect(Object.keys(presets)).toHaveLength(4); // Development, Production, LongTerm, Custom
    expect(presets[BackupPolicyPreset.Development]).toBeDefined();
    expect(presets[BackupPolicyPreset.Production]).toBeDefined();
    expect(presets[BackupPolicyPreset.LongTerm]).toBeDefined();
    expect(presets[BackupPolicyPreset.Custom]).toBeDefined();
  });
});

describe('BackupManager - Validation', () => {
  test('should validate correct Production configuration', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation with missing vault name', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: '',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Vault name is required');
  });

  test('should fail validation with invalid vault name', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'ab', // Too short
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('3-50 characters'))).toBe(true);
  });

  test('should fail validation when creating vault without config', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: true,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Vault configuration is required when creating a new vault');
  });

  test('should fail validation for custom policy without customPolicy config', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Custom,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Custom policy configuration is required when using Custom preset');
  });

  test('should fail validation for daily retention out of range', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Custom,
      customPolicy: {
        name: 'Invalid',
        schedule: { frequency: BackupFrequency.Daily, time: '02:00' },
        retention: { dailyRetentionDays: 10000 }, // Too high
        instantRestore: { enabled: true, retentionDays: 2 },
      },
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('7 and 9999 days'))).toBe(true);
  });

  test('should fail validation for instant restore retention out of range', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Custom,
      customPolicy: {
        name: 'Invalid',
        schedule: { frequency: BackupFrequency.Daily, time: '02:00' },
        retention: { dailyRetentionDays: 30 },
        instantRestore: { enabled: true, retentionDays: 10 }, // Too high
      },
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('1 and 5 days'))).toBe(true);
  });

  test('should fail validation for invalid backup time format', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Custom,
      customPolicy: {
        name: 'Invalid',
        schedule: { frequency: BackupFrequency.Daily, time: '25:00' }, // Invalid time
        retention: { dailyRetentionDays: 30 },
        instantRestore: { enabled: true, retentionDays: 2 },
      },
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('HH:MM format'))).toBe(true);
  });

  test('should include warning for Development policy', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Development,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.warnings.some(w => w.includes('7 days retention'))).toBe(true);
  });

  test('should include warning for disabled backup', () => {
    const config: BackupConfiguration = {
      enabled: false,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const validation = manager.validate();

    expect(validation.warnings.some(w => w.includes('Backup is disabled'))).toBe(true);
  });
});

describe('BackupManager - Cost Estimation', () => {
  test('should estimate costs for Development policy', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Development,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const costs = manager.estimateCosts(100); // 100GB VM

    expect(costs.protectedInstanceCost).toBe(10);
    expect(costs.storageCost).toBeGreaterThan(0);
    expect(costs.totalMonthlyCost).toBeGreaterThan(10);
    expect(costs.totalAnnualCost).toBe(costs.totalMonthlyCost * 12);
    expect(costs.notes.length).toBeGreaterThan(0);
  });

  test('should estimate higher costs for Production policy', () => {
    const configDev: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Development,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const configProd: BackupConfiguration = {
      ...configDev,
      policyPreset: BackupPolicyPreset.Production,
    };

    const managerDev = new BackupManager(configDev);
    const managerProd = new BackupManager(configProd);

    const costsDev = managerDev.estimateCosts(100);
    const costsProd = managerProd.estimateCosts(100);

    expect(costsProd.totalMonthlyCost).toBeGreaterThan(costsDev.totalMonthlyCost);
  });

  test('should scale costs with disk size', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const costs100 = manager.estimateCosts(100);
    const costs200 = manager.estimateCosts(200);

    expect(costs200.storageCost).toBeGreaterThan(costs100.storageCost);
    expect(costs200.totalMonthlyCost).toBeGreaterThan(costs100.totalMonthlyCost);
  });
});

describe('BackupManager - ARM Template Generation', () => {
  test('should generate template parameters', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const params = manager.getTemplateParameters();

    expect(params.enableBackup).toBeDefined();
    expect(params.backupPolicyPreset).toBeDefined();
    expect(params.recoveryServicesVaultName).toBeDefined();
    expect(params.enableBackup.defaultValue).toBe(true);
    expect(params.backupPolicyPreset.defaultValue).toBe(BackupPolicyPreset.Production);
  });

  test('should include vault location parameter when creating vault', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'newVault',
      createVault: true,
      vaultConfig: {
        name: 'newVault',
        location: 'eastus',
        sku: VaultSku.Standard,
        publicNetworkAccess: true,
      },
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const params = manager.getTemplateParameters();

    expect(params.vaultLocation).toBeDefined();
    expect(params.vaultLocation.defaultValue).toBe('eastus');
  });

  test('should generate template variables', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const variables = manager.getTemplateVariables();

    expect(variables.backupPolicyName).toBeDefined();
    expect(variables.backupFabric).toBe('Azure');
    expect(variables.protectionContainer).toBeDefined();
    expect(variables.protectedItem).toBeDefined();
    expect(variables.backupScheduleTime).toBe('02:00');
  });

  test('should generate vault resource when creating vault', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'newVault',
      createVault: true,
      vaultConfig: {
        name: 'newVault',
        location: 'eastus',
        sku: VaultSku.Standard,
        publicNetworkAccess: true,
        tags: { environment: 'production' },
      },
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const vaultResource = manager.getVaultResource();

    expect(vaultResource).not.toBeNull();
    expect(vaultResource!.type).toBe('Microsoft.RecoveryServices/vaults');
    expect(vaultResource!.apiVersion).toBe('2023-06-01');
    expect(vaultResource!.sku.name).toBe(VaultSku.Standard);
    expect(vaultResource!.properties.publicNetworkAccess).toBe('Enabled');
    expect(vaultResource!.tags.environment).toBe('production');
  });

  test('should return null for vault resource when not creating vault', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'existingVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const vaultResource = manager.getVaultResource();

    expect(vaultResource).toBeNull();
  });

  test('should generate backup policy resource', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const policyResource = manager.getBackupPolicyResource();

    expect(policyResource.type).toBe('Microsoft.RecoveryServices/vaults/backupPolicies');
    expect(policyResource.properties.backupManagementType).toBe('AzureIaasVM');
    expect(policyResource.properties.instantRpRetentionRangeInDays).toBe(5);
    expect(policyResource.properties.schedulePolicy.scheduleRunFrequency).toBe('Daily');
  });

  test('should generate protected item resource', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const protectedItem = manager.getProtectedItemResource();

    expect(protectedItem.type).toBe('Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems');
    expect(protectedItem.properties.protectedItemType).toBe('Microsoft.Compute/virtualMachines');
    expect(protectedItem.dependsOn).toContain(`[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`);
  });
});

describe('BackupManager - Marketplace Compliance', () => {
  test('should be compliant with Production policy enabled', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const compliance = manager.isMarketplaceCompliant();

    expect(compliance.compliant).toBe(true);
    expect(compliance.issues).toHaveLength(0);
  });

  test('should be non-compliant when backup disabled', () => {
    const config: BackupConfiguration = {
      enabled: false,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const compliance = manager.isMarketplaceCompliant();

    expect(compliance.compliant).toBe(false);
    expect(compliance.issues.some(i => i.includes('not enabled'))).toBe(true);
  });

  test('should be non-compliant with Development policy', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Development,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const compliance = manager.isMarketplaceCompliant();

    expect(compliance.compliant).toBe(false);
    expect(compliance.issues.some(i => i.includes('Development'))).toBe(true);
  });

  test('should be compliant with Long-term policy', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.LongTerm,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const manager = new BackupManager(config);
    const compliance = manager.isMarketplaceCompliant();

    expect(compliance.compliant).toBe(true);
    expect(compliance.issues).toHaveLength(0);
  });
});

describe('Helper Functions', () => {
  test('createBackupConfiguration should create basic config', () => {
    const config = createBackupConfiguration({
      vaultName: 'testVault',
      vmName: 'testVM',
      resourceGroupName: 'testRG',
    });

    expect(config.enabled).toBe(true);
    expect(config.vaultName).toBe('testVault');
    expect(config.createVault).toBe(false);
    expect(config.policyPreset).toBe(BackupPolicyPreset.Production);
    expect(config.vmName).toBe('testVM');
    expect(config.resourceGroupName).toBe('testRG');
  });

  test('createBackupConfiguration should create vault config', () => {
    const config = createBackupConfiguration({
      vaultName: 'newVault',
      createVault: true,
      vaultLocation: 'westus',
      vmName: 'testVM',
      resourceGroupName: 'testRG',
    });

    expect(config.createVault).toBe(true);
    expect(config.vaultConfig).toBeDefined();
    expect(config.vaultConfig!.location).toBe('westus');
    expect(config.vaultConfig!.sku).toBe(VaultSku.Standard);
  });

  test('createBackupConfiguration should handle custom retention', () => {
    const config = createBackupConfiguration({
      vaultName: 'testVault',
      policyPreset: 'custom',
      vmName: 'testVM',
      resourceGroupName: 'testRG',
      customRetention: {
        daily: 15,
        weekly: 10,
        monthly: 24,
        yearly: 5,
      },
    });

    expect(config.policyPreset).toBe(BackupPolicyPreset.Custom);
    expect(config.customPolicy).toBeDefined();
    expect(config.customPolicy!.retention.dailyRetentionDays).toBe(15);
    expect(config.customPolicy!.retention.weeklyRetentionWeeks).toBe(10);
    expect(config.customPolicy!.retention.monthlyRetentionMonths).toBe(24);
    expect(config.customPolicy!.retention.yearlyRetentionYears).toBe(5);
  });

  test('generateBackupTemplate should create complete template', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'myVault',
      createVault: true,
      vaultConfig: {
        name: 'myVault',
        location: 'eastus',
        sku: VaultSku.Standard,
        publicNetworkAccess: true,
      },
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const template = generateBackupTemplate(config);

    expect(template.$schema).toBeDefined();
    expect(template.contentVersion).toBe('1.0.0.0');
    expect(template.parameters).toBeDefined();
    expect(template.variables).toBeDefined();
    expect(template.resources).toHaveLength(3); // Vault + Policy + Protected Item
  });

  test('generateBackupTemplate should not include vault when not creating', () => {
    const config: BackupConfiguration = {
      enabled: true,
      vaultName: 'existingVault',
      createVault: false,
      policyPreset: BackupPolicyPreset.Production,
      vmName: 'myVM',
      resourceGroupName: 'myRG',
    };

    const template = generateBackupTemplate(config);

    expect(template.resources).toHaveLength(2); // Policy + Protected Item only
  });
});
