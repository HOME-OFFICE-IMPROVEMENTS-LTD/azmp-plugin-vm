/**
 * Test Suite: Disk Types Configuration
 * 
 * Comprehensive tests for disk type selection, validation, and ARM template generation
 * 
 * @module azure/__tests__/disk-types.test
 */

import {
  DiskTypeManager,
  DiskStorageAccountType,
  DiskCategory,
  DiskCaching,
  PremiumSSDPerformanceTier,
  DiskConfiguration,
  DataDiskConfig,
  createDiskConfiguration,
  generateDiskTemplate
} from '../disk-types';

describe('DiskTypeManager - Construction', () => {
  test('should create manager with OS disk only', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD
    };
    const manager = new DiskTypeManager(config);
    expect(manager).toBeDefined();
  });
  
  test('should create manager with OS and data disks', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      dataDiskType: DiskStorageAccountType.StandardSSD,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    expect(manager).toBeDefined();
  });
  
  test('should create manager with performance tier', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 512,
      osDiskPerformanceTier: PremiumSSDPerformanceTier.P30
    };
    const manager = new DiskTypeManager(config);
    expect(manager).toBeDefined();
  });
});

describe('DiskTypeManager - Static Methods', () => {
  test('should get disk type info', () => {
    const info = DiskTypeManager.getDiskTypeInfo(DiskStorageAccountType.PremiumSSD);
    expect(info).toBeDefined();
    expect(info.type).toBe(DiskStorageAccountType.PremiumSSD);
    expect(info.label).toContain('Premium SSD');
    expect(info.requiresPremiumVM).toBe(true);
  });
  
  test('should get all disk types', () => {
    const types = DiskTypeManager.getAllDiskTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types).toContainEqual(expect.objectContaining({
      type: DiskStorageAccountType.PremiumSSD
    }));
  });
  
  test('should get disk types by category', () => {
    const perfTypes = DiskTypeManager.getDiskTypesByCategory(DiskCategory.Performance);
    expect(perfTypes.length).toBeGreaterThan(0);
    expect(perfTypes.every(t => t.category === DiskCategory.Performance)).toBe(true);
  });
  
  test('should get performance tier spec', () => {
    const tier = DiskTypeManager.getPerformanceTier(PremiumSSDPerformanceTier.P30);
    expect(tier).toBeDefined();
    expect(tier.tier).toBe(PremiumSSDPerformanceTier.P30);
    expect(tier.iops).toBe(5000);
    expect(tier.throughputMBps).toBe(200);
  });
  
  test('should get all performance tiers', () => {
    const tiers = DiskTypeManager.getAllPerformanceTiers();
    expect(tiers.length).toBe(14); // P1-P80
    expect(tiers[0].tier).toBe(PremiumSSDPerformanceTier.P1);
    expect(tiers[tiers.length - 1].tier).toBe(PremiumSSDPerformanceTier.P80);
  });
  
  test('should get recommended performance tier for disk size', () => {
    expect(DiskTypeManager.getRecommendedPerformanceTier(64)).toBe(PremiumSSDPerformanceTier.P6);
    expect(DiskTypeManager.getRecommendedPerformanceTier(128)).toBe(PremiumSSDPerformanceTier.P10);
    expect(DiskTypeManager.getRecommendedPerformanceTier(512)).toBe(PremiumSSDPerformanceTier.P30);
    expect(DiskTypeManager.getRecommendedPerformanceTier(1024)).toBe(PremiumSSDPerformanceTier.P40);
  });
  
  test('should identify premium-capable VM sizes', () => {
    expect(DiskTypeManager.isPremiumCapableVMSize('Standard_DS2_v2')).toBe(true);
    expect(DiskTypeManager.isPremiumCapableVMSize('Standard_E4s_v3')).toBe(true);
    expect(DiskTypeManager.isPremiumCapableVMSize('Standard_D2_v2')).toBe(false);
    expect(DiskTypeManager.isPremiumCapableVMSize('Standard_A2')).toBe(false);
  });
  
  test('should check if disk requires premium VM', () => {
    expect(DiskTypeManager.requiresPremiumVM(DiskStorageAccountType.PremiumSSD)).toBe(true);
    expect(DiskTypeManager.requiresPremiumVM(DiskStorageAccountType.UltraSSD)).toBe(true);
    expect(DiskTypeManager.requiresPremiumVM(DiskStorageAccountType.StandardSSD)).toBe(false);
    expect(DiskTypeManager.requiresPremiumVM(DiskStorageAccountType.StandardHDD)).toBe(false);
  });
  
  test('should check if disk requires zone support', () => {
    expect(DiskTypeManager.requiresZoneSupport(DiskStorageAccountType.UltraSSD)).toBe(true);
    expect(DiskTypeManager.requiresZoneSupport(DiskStorageAccountType.PremiumSSDZRS)).toBe(true);
    expect(DiskTypeManager.requiresZoneSupport(DiskStorageAccountType.PremiumSSD)).toBe(false);
    expect(DiskTypeManager.requiresZoneSupport(DiskStorageAccountType.StandardSSD)).toBe(false);
  });
  
  test('should get recommended caching for disk types', () => {
    // OS disks
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.PremiumSSD, true)).toBe(DiskCaching.ReadWrite);
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.StandardSSD, true)).toBe(DiskCaching.ReadWrite);
    
    // Data disks
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.PremiumSSD, false)).toBe(DiskCaching.ReadOnly);
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.StandardSSD, false)).toBe(DiskCaching.ReadOnly);
    
    // No caching for Ultra/Premium v2
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.UltraSSD, true)).toBe(DiskCaching.None);
    expect(DiskTypeManager.getRecommendedCaching(DiskStorageAccountType.PremiumV2, true)).toBe(DiskCaching.None);
  });
});

describe('DiskTypeManager - Validation', () => {
  test('should validate valid Premium SSD configuration', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128,
      osDiskCaching: DiskCaching.ReadWrite
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
  
  test('should fail validation for premium disk with non-premium VM', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_D2_v2');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('premium-capable VM');
  });
  
  test('should fail validation for disk size below minimum', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 2 // Below 4 GB minimum
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('below minimum'));
  });
  
  test('should fail validation for disk size above maximum', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardSSD,
      osDiskSizeGB: 40000 // Above 32767 GB maximum
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('exceeds maximum'));
  });
  
  test('should fail validation for unsupported caching', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.UltraSSD,
      osDiskCaching: DiskCaching.ReadWrite // Ultra doesn't support caching
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('not supported'));
  });
  
  test('should warn about zone support requirement', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.UltraSSD
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.warnings).toContainEqual(expect.stringContaining('zone-aware'));
  });
  
  test('should warn about non-optimal performance tier', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128,
      osDiskPerformanceTier: PremiumSSDPerformanceTier.P30 // P10 would be correct for 128 GB
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('not optimal');
  });
  
  test('should validate data disks', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 2, // Below minimum
          storageAccountType: DiskStorageAccountType.PremiumSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('datadisk0'));
  });
  
  test('should recommend Standard SSD upgrade from HDD', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardHDD
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0]).toContain('Standard SSD');
  });
  
  test('should recommend Premium upgrade for premium-capable VM', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardSSD
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0]).toContain('Premium SSD');
  });
  
  test('should warn about Ultra SSD enablement flag', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.UltraSSD,
      enableUltraSSD: false
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.warnings).toContainEqual(expect.stringContaining('enableUltraSSD'));
  });
});

describe('DiskTypeManager - ARM Template Generation', () => {
  test('should generate template parameters for OS disk', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const params = manager.getTemplateParameters();
    
    expect(params.osDiskType).toBeDefined();
    expect(params.osDiskType.type).toBe('string');
    expect(params.osDiskType.defaultValue).toBe(DiskStorageAccountType.PremiumSSD);
    expect(params.osDiskSizeGB).toBeDefined();
    expect(params.osDiskSizeGB.defaultValue).toBe(128);
  });
  
  test('should generate template parameters for data disks', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      dataDiskType: DiskStorageAccountType.StandardSSD,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    const params = manager.getTemplateParameters();
    
    expect(params.dataDiskType).toBeDefined();
    expect(params.dataDiskType.defaultValue).toBe(DiskStorageAccountType.StandardSSD);
    expect(params.dataDiskCount).toBeDefined();
    expect(params.dataDiskCount.defaultValue).toBe(1);
  });
  
  test('should generate template variables', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const variables = manager.getTemplateVariables();
    
    expect(variables.osDiskCaching).toBeDefined();
    expect(variables.osDiskCaching).toBe(DiskCaching.ReadWrite);
  });
  
  test('should generate variables with performance tier', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 512,
      osDiskPerformanceTier: PremiumSSDPerformanceTier.P30
    };
    const manager = new DiskTypeManager(config);
    const variables = manager.getTemplateVariables();
    
    expect(variables.osDiskPerformanceTier).toBe(PremiumSSDPerformanceTier.P30);
  });
  
  test('should auto-assign performance tier if not specified', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const variables = manager.getTemplateVariables();
    
    expect(variables.osDiskPerformanceTier).toBe(PremiumSSDPerformanceTier.P10);
  });
  
  test('should generate OS disk config', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const osDisk = manager.getOSDiskConfig();
    
    expect(osDisk.createOption).toBe('FromImage');
    expect(osDisk.managedDisk).toBeDefined();
    expect(osDisk.managedDisk.storageAccountType).toContain('osDiskType');
    expect(osDisk.diskSizeGB).toContain('osDiskSizeGB');
  });
  
  test('should generate OS disk config with performance tier', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 512,
      osDiskPerformanceTier: PremiumSSDPerformanceTier.P30
    };
    const manager = new DiskTypeManager(config);
    const osDisk = manager.getOSDiskConfig();
    
    expect(osDisk.managedDisk.tier).toBeDefined();
    expect(osDisk.managedDisk.tier).toContain('osDiskPerformanceTier');
  });
  
  test('should generate data disks array', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        },
        {
          name: 'datadisk1',
          sizeGB: 256,
          storageAccountType: DiskStorageAccountType.PremiumSSD,
          caching: DiskCaching.ReadOnly,
          lun: 1,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    const dataDisks = manager.getDataDisksArray();
    
    expect(dataDisks.length).toBe(2);
    expect(dataDisks[0].name).toBe('datadisk0');
    expect(dataDisks[0].lun).toBe(0);
    expect(dataDisks[1].name).toBe('datadisk1');
    expect(dataDisks[1].lun).toBe(1);
  });
  
  test('should generate empty data disks array when none configured', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD
    };
    const manager = new DiskTypeManager(config);
    const dataDisks = manager.getDataDisksArray();
    
    expect(dataDisks.length).toBe(0);
  });
  
  test('should generate complete storage profile', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    const profile = manager.getStorageProfile();
    
    expect(profile.osDisk).toBeDefined();
    expect(profile.imageReference).toBeDefined();
    expect(profile.dataDisks).toBeDefined();
    expect(profile.dataDisks.length).toBe(1);
  });
});

describe('DiskTypeManager - Marketplace Compliance', () => {
  test('should be compliant with Premium SSD', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const compliance = manager.isMarketplaceCompliant();
    
    expect(compliance.compliant).toBe(true);
    expect(compliance.issues.length).toBe(0);
  });
  
  test('should be compliant with Standard SSD', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardSSD,
      osDiskSizeGB: 128
    };
    const manager = new DiskTypeManager(config);
    const compliance = manager.isMarketplaceCompliant();
    
    expect(compliance.compliant).toBe(true);
    expect(compliance.issues.length).toBe(0);
  });
  
  test('should flag Standard HDD as non-compliant', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardHDD
    };
    const manager = new DiskTypeManager(config);
    const compliance = manager.isMarketplaceCompliant();
    
    expect(compliance.compliant).toBe(false);
    expect(compliance.issues).toContainEqual(expect.stringContaining('not recommended'));
  });
  
  test('should flag Ultra SSD without enablement', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.UltraSSD,
      enableUltraSSD: false
    };
    const manager = new DiskTypeManager(config);
    const compliance = manager.isMarketplaceCompliant();
    
    expect(compliance.compliant).toBe(false);
    expect(compliance.issues).toContainEqual(expect.stringContaining('enableUltraSSD'));
  });
  
  test('should be compliant with Ultra SSD when properly configured', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.UltraSSD,
      enableUltraSSD: true
    };
    const manager = new DiskTypeManager(config);
    const compliance = manager.isMarketplaceCompliant();
    
    expect(compliance.compliant).toBe(true);
  });
});

describe('Helper Functions', () => {
  test('createDiskConfiguration should create valid config from CLI options', () => {
    const config = createDiskConfiguration({
      osDiskType: 'Premium_LRS',
      osDiskSize: 128,
      osDiskCaching: 'ReadWrite'
    });
    
    expect(config.osDiskType).toBe(DiskStorageAccountType.PremiumSSD);
    expect(config.osDiskSizeGB).toBe(128);
    expect(config.osDiskCaching).toBe(DiskCaching.ReadWrite);
  });
  
  test('createDiskConfiguration should create data disks from count', () => {
    const config = createDiskConfiguration({
      osDiskType: 'Premium_LRS',
      dataDiskType: 'StandardSSD_LRS',
      dataDiskCount: 3,
      dataDiskSize: 256
    });
    
    expect(config.dataDisks).toBeDefined();
    expect(config.dataDisks!.length).toBe(3);
    expect(config.dataDisks![0].sizeGB).toBe(256);
    expect(config.dataDisks![0].storageAccountType).toBe(DiskStorageAccountType.StandardSSD);
    expect(config.dataDisks![0].lun).toBe(0);
    expect(config.dataDisks![1].lun).toBe(1);
    expect(config.dataDisks![2].lun).toBe(2);
  });
  
  test('createDiskConfiguration should handle performance tier', () => {
    const config = createDiskConfiguration({
      osDiskType: 'Premium_LRS',
      osDiskSize: 512,
      osDiskPerformanceTier: 'P30'
    });
    
    expect(config.osDiskPerformanceTier).toBe(PremiumSSDPerformanceTier.P30);
  });
  
  test('createDiskConfiguration should set Ultra SSD flag', () => {
    const config = createDiskConfiguration({
      osDiskType: 'UltraSSD_LRS',
      enableUltraSSD: true
    });
    
    expect(config.enableUltraSSD).toBe(true);
  });
  
  test('generateDiskTemplate should create complete template', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 128,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        }
      ]
    };
    
    const template = generateDiskTemplate(config);
    
    expect(template.parameters).toBeDefined();
    expect(template.variables).toBeDefined();
    expect(template.storageProfile).toBeDefined();
    expect(template.parameters.osDiskType).toBeDefined();
    expect(template.storageProfile.osDisk).toBeDefined();
    expect(template.storageProfile.dataDisks).toBeDefined();
  });
});

describe('Edge Cases and Special Scenarios', () => {
  test('should handle minimum disk sizes correctly', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      osDiskSizeGB: 4 // Minimum size
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.isValid).toBe(true);
  });
  
  test('should handle maximum disk sizes correctly', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.StandardSSD,
      osDiskSizeGB: 32767 // Maximum size
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate();
    
    expect(result.isValid).toBe(true);
  });
  
  test('should handle Premium SSD v2 correctly', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumV2,
      osDiskSizeGB: 1024
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.warnings).toContainEqual(expect.stringContaining('zone-aware'));
  });
  
  test('should handle Zone-Redundant disks correctly', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSDZRS,
      osDiskSizeGB: 256
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.warnings).toContainEqual(expect.stringContaining('zone-aware'));
  });
  
  test('should handle multiple data disks with different types', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD,
      dataDisks: [
        {
          name: 'datadisk0',
          sizeGB: 128,
          storageAccountType: DiskStorageAccountType.PremiumSSD,
          caching: DiskCaching.ReadOnly,
          lun: 0,
          createOption: 'Empty'
        },
        {
          name: 'datadisk1',
          sizeGB: 512,
          storageAccountType: DiskStorageAccountType.StandardSSD,
          caching: DiskCaching.ReadWrite,
          lun: 1,
          createOption: 'Empty'
        },
        {
          name: 'datadisk2',
          sizeGB: 1024,
          storageAccountType: DiskStorageAccountType.StandardHDD,
          caching: DiskCaching.None,
          lun: 2,
          createOption: 'Empty'
        }
      ]
    };
    const manager = new DiskTypeManager(config);
    const result = manager.validate('Standard_DS2_v2');
    
    expect(result.isValid).toBe(true);
    expect(manager.getDataDisksArray().length).toBe(3);
  });
  
  test('should handle default caching when not specified', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD
    };
    const manager = new DiskTypeManager(config);
    const variables = manager.getTemplateVariables();
    
    expect(variables.osDiskCaching).toBe(DiskCaching.ReadWrite);
  });
  
  test('should handle config with no disk size specified', () => {
    const config: DiskConfiguration = {
      osDiskType: DiskStorageAccountType.PremiumSSD
    };
    const manager = new DiskTypeManager(config);
    const params = manager.getTemplateParameters();
    
    expect(params.osDiskSizeGB).toBeUndefined();
  });
});
