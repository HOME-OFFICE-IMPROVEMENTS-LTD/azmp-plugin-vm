import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('High Availability & Disaster Recovery Template Integration', () => {
  let templateContent: string;

  beforeAll(() => {
    const templatePath = path.join(__dirname, '../../templates/mainTemplate.json.hbs');
    templateContent = fs.readFileSync(templatePath, 'utf-8');
  });

  describe('High Availability Parameters', () => {
    test('should include enableHighAvailability parameter', () => {
      expect(templateContent).toContain('"enableHighAvailability"');
      expect(templateContent).toContain('"type": "bool"');
      expect(templateContent).toContain('Enable high availability features including availability zones or availability sets');
    });

    test('should include availabilityOption parameter with allowed values', () => {
      expect(templateContent).toContain('"availabilityOption"');
      expect(templateContent).toContain('"allowedValues"');
      expect(templateContent).toContain('"None"');
      expect(templateContent).toContain('"AvailabilityZones"');
      expect(templateContent).toContain('"AvailabilitySet"');
      expect(templateContent).toContain('"VMSS"');
    });

    test('should include availability zones configuration', () => {
      expect(templateContent).toContain('"availabilityZones"');
      expect(templateContent).toContain('"type": "array"');
      expect(templateContent).toContain('["1", "2", "3"]');
    });

    test('should include availability set parameters', () => {
      expect(templateContent).toContain('"availabilitySetFaultDomains"');
      expect(templateContent).toContain('"availabilitySetUpdateDomains"');
      expect(templateContent).toContain('"minValue": 1');
      expect(templateContent).toContain('"maxValue": 3');
      expect(templateContent).toContain('"maxValue": 20');
    });

    test('should include VMSS instance count parameter', () => {
      expect(templateContent).toContain('"vmssInstanceCount"');
      expect(templateContent).toContain('"defaultValue": 2');
      expect(templateContent).toContain('"maxValue": 1000');
    });
  });

  describe('Disaster Recovery Parameters', () => {
    test('should include enableDisasterRecovery parameter', () => {
      expect(templateContent).toContain('"enableDisasterRecovery"');
      expect(templateContent).toContain('Enable disaster recovery features including Azure Backup and Site Recovery');
    });

    test('should include backup configuration parameters', () => {
      expect(templateContent).toContain('"enableBackup"');
      expect(templateContent).toContain('"backupPolicyType"');
      expect(templateContent).toContain('"Standard"');
      expect(templateContent).toContain('"Enhanced"');
    });

    test('should include backup retention and frequency parameters', () => {
      expect(templateContent).toContain('"backupRetentionDays"');
      expect(templateContent).toContain('"backupFrequency"');
      expect(templateContent).toContain('"Daily"');
      expect(templateContent).toContain('"Weekly"');
      expect(templateContent).toContain('"minValue": 7');
      expect(templateContent).toContain('"maxValue": 9999');
    });

    test('should include backup time parameter', () => {
      expect(templateContent).toContain('"backupTime"');
      expect(templateContent).toContain('"defaultValue": "02:00"');
      expect(templateContent).toContain('HH:MM format');
    });

    test('should include site recovery parameters', () => {
      expect(templateContent).toContain('"enableSiteRecovery"');
      expect(templateContent).toContain('"recoveryRegion"');
      expect(templateContent).toContain('"defaultValue": "eastus2"');
    });
  });

  describe('High Availability Variables', () => {
    test('should define highAvailabilityConfig with resource names', () => {
      expect(templateContent).toContain('"highAvailabilityConfig"');
      expect(templateContent).toContain('"availabilitySetName"');
      expect(templateContent).toContain('"vmssName"');
      expect(templateContent).toContain('avset');
      expect(templateContent).toContain('vmss');
    });

    test('should include HA configuration flags', () => {
      expect(templateContent).toContain('"useZones"');
      expect(templateContent).toContain('"useAvailabilitySet"');
      expect(templateContent).toContain('"useVMSS"');
      expect(templateContent).toContain('AvailabilityZones');
      expect(templateContent).toContain('AvailabilitySet');
      expect(templateContent).toContain('VMSS');
    });
  });

  describe('Disaster Recovery Variables', () => {
    test('should define disasterRecoveryConfig with vault and policy names', () => {
      expect(templateContent).toContain('"disasterRecoveryConfig"');
      expect(templateContent).toContain('"recoveryVaultName"');
      expect(templateContent).toContain('"backupPolicyName"');
      expect(templateContent).toContain('rsv');
      expect(templateContent).toContain('backup-policy');
    });

    test('should include backup fabric and container configuration', () => {
      expect(templateContent).toContain('"backupFabricName"');
      expect(templateContent).toContain('"backupContainerName"');
      expect(templateContent).toContain('"backupItemName"');
      expect(templateContent).toContain('"Azure"');
      expect(templateContent).toContain('iaasvmcontainer');
    });

    test('should include replication policy configuration', () => {
      expect(templateContent).toContain('"replicationPolicyName"');
      expect(templateContent).toContain('"recoveryPointRetention"');
      expect(templateContent).toContain('replication-policy');
    });
  });

  describe('High Availability Resources', () => {
    test('should include availability set resource', () => {
      expect(templateContent).toContain('"type": "Microsoft.Compute/availabilitySets"');
      expect(templateContent).toContain('"condition": "[and(parameters(\'enableHighAvailability\')');
      expect(templateContent).toContain('"sku"');
      expect(templateContent).toContain('"name": "Aligned"');
    });

    test('should include availability set fault and update domains', () => {
      expect(templateContent).toContain('"platformFaultDomainCount"');
      expect(templateContent).toContain('"platformUpdateDomainCount"');
      expect(templateContent).toContain('availabilitySetFaultDomains');
      expect(templateContent).toContain('availabilitySetUpdateDomains');
    });
  });

  describe('Disaster Recovery Resources', () => {
    test('should include recovery services vault resource', () => {
      expect(templateContent).toContain('"type": "Microsoft.RecoveryServices/vaults"');
      expect(templateContent).toContain('"condition": "[and(parameters(\'enableDisasterRecovery\'), parameters(\'enableBackup\'))]"');
      expect(templateContent).toContain('"sku"');
      expect(templateContent).toContain('"name": "RS0"');
      expect(templateContent).toContain('"tier": "Standard"');
    });

    test('should include backup policy resource', () => {
      expect(templateContent).toContain('"type": "Microsoft.RecoveryServices/vaults/backupPolicies"');
      expect(templateContent).toContain('"backupManagementType": "AzureIaasVM"');
      expect(templateContent).toContain('"schedulePolicy"');
      expect(templateContent).toContain('"retentionPolicy"');
    });

    test('should include backup policy schedule configuration', () => {
      expect(templateContent).toContain('"schedulePolicyType": "SimpleSchedulePolicy"');
      expect(templateContent).toContain('"scheduleRunFrequency"');
      expect(templateContent).toContain('"scheduleRunTimes"');
      expect(templateContent).toContain('backupFrequency');
      expect(templateContent).toContain('backupTime');
    });

    test('should include backup retention configuration', () => {
      expect(templateContent).toContain('"retentionPolicyType": "LongTermRetentionPolicy"');
      expect(templateContent).toContain('"dailySchedule"');
      expect(templateContent).toContain('"retentionDuration"');
      expect(templateContent).toContain('backupRetentionDays');
      expect(templateContent).toContain('"instantRpRetentionRangeInDays": 2');
    });

    test('should include protected item resource for VM backup', () => {
      expect(templateContent).toContain('"type": "Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems"');
      expect(templateContent).toContain('"protectedItemType": "Microsoft.Compute/virtualMachines"');
      expect(templateContent).toContain('"policyId"');
      expect(templateContent).toContain('"sourceResourceId"');
    });
  });

  describe('High Availability & Disaster Recovery Outputs', () => {
    test('should include highAvailabilityStatus output', () => {
      expect(templateContent).toContain('"highAvailabilityStatus"');
      expect(templateContent).toContain('"highAvailabilityEnabled"');
      expect(templateContent).toContain('"availabilityOption"');
      expect(templateContent).toContain('"availabilityZones"');
      expect(templateContent).toContain('"availabilitySetConfigured"');
      expect(templateContent).toContain('"vmssConfigured"');
    });

    test('should include disasterRecoveryStatus output', () => {
      expect(templateContent).toContain('"disasterRecoveryStatus"');
      expect(templateContent).toContain('"disasterRecoveryEnabled"');
      expect(templateContent).toContain('"backupEnabled"');
      expect(templateContent).toContain('"backupPolicyType"');
      expect(templateContent).toContain('"siteRecoveryEnabled"');
      expect(templateContent).toContain('"recoveryVaultId"');
    });

    test('should include resilienceScore output with tier calculation', () => {
      expect(templateContent).toContain('"resilienceScore"');
      expect(templateContent).toContain('"highAvailabilityConfigured"');
      expect(templateContent).toContain('"backupConfigured"');
      expect(templateContent).toContain('"monitoringConfigured"');
      expect(templateContent).toContain('"multiZoneDeployment"');
      expect(templateContent).toContain('"crossRegionRecovery"');
      expect(templateContent).toContain('"resilienceTier"');
      expect(templateContent).toContain('Enterprise');
      expect(templateContent).toContain('Standard');
      expect(templateContent).toContain('Basic');
    });
  });
});
