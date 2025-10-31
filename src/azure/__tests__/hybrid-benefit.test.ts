/**
 * Tests for Azure Hybrid Benefit Module
 */

import {
  HybridBenefitManager,
  LicenseType,
  HybridBenefitConfig,
  LicenseRequirement
} from '../hybrid-benefit';

describe('HybridBenefitManager', () => {
  describe('Construction', () => {
    it('should create manager with valid Windows Server config', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      expect(manager).toBeInstanceOf(HybridBenefitManager);
    });

    it('should create manager with SQL Server config', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      expect(manager).toBeInstanceOf(HybridBenefitManager);
    });

    it('should create manager with no hybrid benefit', () => {
      const config: HybridBenefitConfig = {
        vmName: 'linux-vm',
        vmSize: 'Standard_D2s_v3',
        osType: 'Linux',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      expect(manager).toBeInstanceOf(HybridBenefitManager);
    });

    it('should create manager with Windows Client license', () => {
      const config: HybridBenefitConfig = {
        vmName: 'client-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsClient
      };

      const manager = new HybridBenefitManager(config);
      expect(manager).toBeInstanceOf(HybridBenefitManager);
    });
  });

  describe('Validation', () => {
    it('should validate correct Windows Server configuration', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should fail validation with empty VM name', () => {
      const config: HybridBenefitConfig = {
        vmName: '',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('VM name is required');
    });

    it('should fail validation with empty VM size', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: '',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('VM size is required');
    });

    it('should warn about unknown VM size', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Unknown_Size',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('not in the known list');
    });

    it('should fail validation for Linux VM with Windows license (no SQL)', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Linux',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: false
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Azure Hybrid Benefit is only available for Windows VMs (or Linux with SQL Server)');
    });

    it('should warn about Windows VM without hybrid benefit', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('consider enabling to save costs');
    });

    it('should fail validation for SQL Server without edition', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('SQL Server edition is required when hasSqlServer is true');
    });

    it('should fail validation for SQL Enterprise with insufficient cores', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_D2s_v3', // 2 cores, need 4
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('SQL Server Enterprise requires minimum 4 cores');
    });

    it('should fail validation for SQL Standard with insufficient cores', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_D2s_v3', // 2 cores, need 4
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Standard'
      };

      const manager = new HybridBenefitManager(config);
      const validation = manager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('SQL Server Standard requires minimum 4 cores');
    });
  });

  describe('Core Count', () => {
    it('should return correct core count for D4s_v3', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      expect(manager.getCoreCount()).toBe(4);
    });

    it('should return correct core count for E16s_v3', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_E16s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      expect(manager.getCoreCount()).toBe(16);
    });

    it('should return default 2 cores for unknown VM size', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Unknown_Size',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      expect(manager.getCoreCount()).toBe(2);
    });
  });

  describe('License Requirements', () => {
    it('should return Windows Server license requirement', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements.length).toBe(1);
      expect(requirements[0].licenseType).toBe(LicenseType.WindowsServer);
      expect(requirements[0].coresRequired).toBe(8); // minimum 8 cores
      expect(requirements[0].minimumLicenses).toBe(1);
      expect(requirements[0].description).toContain('Windows Server');
    });

    it('should return Windows Client license requirement', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsClient
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements.length).toBe(1);
      expect(requirements[0].licenseType).toBe(LicenseType.WindowsClient);
      expect(requirements[0].coresRequired).toBe(8);
      expect(requirements[0].description).toContain('Windows Client');
    });

    it('should return SQL Server Enterprise license requirement', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements.length).toBe(2); // Windows + SQL
      const sqlReq = requirements.find((req: LicenseRequirement) => req.description.includes('SQL Server'));
      expect(sqlReq).toBeDefined();
      if (sqlReq) {
        expect(sqlReq.coresRequired).toBe(8);
        expect(sqlReq.description).toContain('SQL Server Enterprise');
      }
    });

    it('should return SQL Server Standard license requirement', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Standard'
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements.length).toBe(2); // Windows + SQL
      const sqlReq = requirements.find((req: LicenseRequirement) => req.description.includes('SQL Server'));
      expect(sqlReq).toBeDefined();
      if (sqlReq) {
        expect(sqlReq.coresRequired).toBe(4);
        expect(sqlReq.description).toContain('SQL Server Standard');
      }
    });

    it('should return no requirements for Linux without SQL', () => {
      const config: HybridBenefitConfig = {
        vmName: 'linux-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Linux',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements.length).toBe(0);
    });

    it('should calculate licenses needed for 32-core VM', () => {
      const config: HybridBenefitConfig = {
        vmName: 'large-vm',
        vmSize: 'Standard_D32s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const requirements = manager.getLicenseRequirements();

      expect(requirements[0].coresRequired).toBe(32);
      expect(requirements[0].minimumLicenses).toBe(2); // 32 cores / 16 per license
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate Windows Server savings for 4-core VM', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      expect(savings.paygMonthlyCost).toBe(18.00); // 4 cores * $4.50
      expect(savings.hybridBenefitMonthlyCost).toBe(0);
      expect(savings.monthlySavings).toBe(18.00);
      expect(savings.annualSavings).toBe(216.00);
      expect(savings.savingsPercent).toBe(100);
      expect(savings.currency).toBe('USD');
    });

    it('should calculate SQL Enterprise savings for 8-core VM', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      const expectedWindowsCost = 8 * 4.50; // $36
      const expectedSqlCost = 8 * 145.00; // $1,160
      const expectedTotal = expectedWindowsCost + expectedSqlCost; // $1,196

      expect(savings.paygMonthlyCost).toBe(expectedTotal);
      expect(savings.hybridBenefitMonthlyCost).toBe(0);
      expect(savings.monthlySavings).toBe(expectedTotal);
      expect(savings.annualSavings).toBe(expectedTotal * 12);
      expect(savings.savingsPercent).toBe(100);
    });

    it('should calculate SQL Standard savings for 4-core VM', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Standard'
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      const expectedWindowsCost = 4 * 4.50; // $18
      const expectedSqlCost = 4 * 36.25; // $145
      const expectedTotal = expectedWindowsCost + expectedSqlCost; // $163

      expect(savings.paygMonthlyCost).toBe(expectedTotal);
      expect(savings.monthlySavings).toBe(expectedTotal);
    });

    it('should return zero savings for Linux without SQL', () => {
      const config: HybridBenefitConfig = {
        vmName: 'linux-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Linux',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      expect(savings.paygMonthlyCost).toBe(0);
      expect(savings.monthlySavings).toBe(0);
      expect(savings.annualSavings).toBe(0);
      expect(savings.savingsPercent).toBe(0);
    });

    it('should return zero savings for Windows without hybrid benefit', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      expect(savings.paygMonthlyCost).toBe(0);
      expect(savings.monthlySavings).toBe(0);
    });

    it('should calculate savings for large 64-core VM', () => {
      const config: HybridBenefitConfig = {
        vmName: 'large-vm',
        vmSize: 'Standard_D64s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const savings = manager.calculateSavings();

      const expectedCost = 64 * 4.50; // $288
      expect(savings.paygMonthlyCost).toBe(expectedCost);
      expect(savings.monthlySavings).toBe(expectedCost);
      expect(savings.annualSavings).toBe(expectedCost * 12); // $3,456
    });
  });

  describe('ARM Template Generation', () => {
    it('should generate ARM template for Windows Server', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const armTemplate = manager.toARMTemplate();

      expect(armTemplate.licenseType).toBe(LicenseType.WindowsServer);
      expect(armTemplate.sqlServerLicenseType).toBeUndefined();
      expect(armTemplate.sqlServerEdition).toBeUndefined();
    });

    it('should generate ARM template for Windows Client', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsClient
      };

      const manager = new HybridBenefitManager(config);
      const armTemplate = manager.toARMTemplate();

      expect(armTemplate.licenseType).toBe(LicenseType.WindowsClient);
    });

    it('should generate ARM template with SQL Server', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      const armTemplate = manager.toARMTemplate();

      expect(armTemplate.licenseType).toBe(LicenseType.WindowsServer);
      expect(armTemplate.sqlServerLicenseType).toBe(LicenseType.SqlServerEnterprise);
      expect(armTemplate.sqlServerEdition).toBe('Enterprise');
    });

    it('should generate ARM template for no hybrid benefit', () => {
      const config: HybridBenefitConfig = {
        vmName: 'linux-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Linux',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const armTemplate = manager.toARMTemplate();

      expect(armTemplate.licenseType).toBe(LicenseType.None);
    });
  });

  describe('Summary', () => {
    it('should generate summary for Windows Server', () => {
      const config: HybridBenefitConfig = {
        vmName: 'test-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer
      };

      const manager = new HybridBenefitManager(config);
      const summary = manager.getSummary();

      expect(summary).toContain('Azure Hybrid Benefit Configuration');
      expect(summary).toContain('VM Name: test-vm');
      expect(summary).toContain('VM Size: Standard_D4s_v3 (4 cores)');
      expect(summary).toContain('OS Type: Windows');
      expect(summary).toContain('License Type: Windows_Server');
      expect(summary).toContain('License Requirements:');
      expect(summary).toContain('Cost Savings:');
      expect(summary).toContain('Monthly Savings:');
      expect(summary).toContain('Annual Savings:');
    });

    it('should generate summary with SQL Server', () => {
      const config: HybridBenefitConfig = {
        vmName: 'sql-vm',
        vmSize: 'Standard_E8s_v3',
        osType: 'Windows',
        licenseType: LicenseType.WindowsServer,
        hasSqlServer: true,
        sqlServerEdition: 'Enterprise'
      };

      const manager = new HybridBenefitManager(config);
      const summary = manager.getSummary();

      expect(summary).toContain('SQL Server: Enterprise');
      expect(summary).toContain('SQL Server Enterprise license');
    });

    it('should generate summary for no hybrid benefit', () => {
      const config: HybridBenefitConfig = {
        vmName: 'linux-vm',
        vmSize: 'Standard_D4s_v3',
        osType: 'Linux',
        licenseType: LicenseType.None
      };

      const manager = new HybridBenefitManager(config);
      const summary = manager.getSummary();

      expect(summary).toContain('No hybrid benefit licenses required');
      expect(summary).toContain('Pay-as-you-go: $0.00/month');
      expect(summary).toContain('Monthly Savings: $0.00');
    });
  });

  describe('Static Methods', () => {
    it('should check if VM size is eligible', () => {
      expect(HybridBenefitManager.isEligibleVmSize('Standard_D4s_v3')).toBe(true);
      expect(HybridBenefitManager.isEligibleVmSize('Standard_E8s_v3')).toBe(true);
      expect(HybridBenefitManager.isEligibleVmSize('Unknown_Size')).toBe(false);
    });

    it('should return list of eligible VM sizes', () => {
      const sizes = HybridBenefitManager.getEligibleVmSizes();
      
      expect(Array.isArray(sizes)).toBe(true);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes).toContain('Standard_D4s_v3');
      expect(sizes).toContain('Standard_E8s_v3');
    });

    it('should estimate savings for Windows VM', () => {
      const savings = HybridBenefitManager.estimateSavings(
        'Standard_D4s_v3',
        'Windows'
      );

      expect(savings.paygMonthlyCost).toBe(18.00); // 4 cores * $4.50
      expect(savings.monthlySavings).toBe(18.00);
      expect(savings.savingsPercent).toBe(100);
    });

    it('should estimate savings for Windows VM with SQL Enterprise', () => {
      const savings = HybridBenefitManager.estimateSavings(
        'Standard_E8s_v3',
        'Windows',
        true,
        'Enterprise'
      );

      const expectedWindowsCost = 8 * 4.50;
      const expectedSqlCost = 8 * 145.00;
      const expectedTotal = expectedWindowsCost + expectedSqlCost;

      expect(savings.paygMonthlyCost).toBe(expectedTotal);
      expect(savings.monthlySavings).toBe(expectedTotal);
    });

    it('should estimate savings for Windows VM with SQL Standard', () => {
      const savings = HybridBenefitManager.estimateSavings(
        'Standard_E4s_v3',
        'Windows',
        true,
        'Standard'
      );

      const expectedWindowsCost = 4 * 4.50;
      const expectedSqlCost = 4 * 36.25;
      const expectedTotal = expectedWindowsCost + expectedSqlCost;

      expect(savings.paygMonthlyCost).toBe(expectedTotal);
    });

    it('should estimate zero savings for Linux VM', () => {
      const savings = HybridBenefitManager.estimateSavings(
        'Standard_D4s_v3',
        'Linux'
      );

      expect(savings.paygMonthlyCost).toBe(0);
      expect(savings.monthlySavings).toBe(0);
    });
  });
});
