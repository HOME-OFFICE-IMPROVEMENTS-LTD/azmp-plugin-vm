/**
 * Tests for Recovery Module
 */

import {
  recoveryServicesVault,
  backupPolicy,
  enableVMBackup,
  BackupPresets,
  estimateBackupStorage,
  validateBackupPolicy,
  replicationPolicy,
  RegionPairs,
  getRecommendedTargetRegion,
  diskSnapshot,
  restorePointCollection,
  SnapshotRetentionPolicies
} from '../recovery';

describe('Azure Backup', () => {
  describe('recoveryServicesVault', () => {
    it('should create recovery services vault with default sku', () => {
      const result = recoveryServicesVault({
        name: 'test-vault'
      });

      expect(result.type).toBe('Microsoft.RecoveryServices/vaults');
      expect(result.name).toBe('test-vault');
      expect(result.sku.name).toBe('RS0');
    });

    it('should apply tags', () => {
      const result = recoveryServicesVault({
        name: 'test-vault',
        tags: { env: 'prod' }
      });

      expect(result.tags).toEqual({ env: 'prod' });
    });
  });

  describe('backupPolicy', () => {
    it('should create backup policy', () => {
      const result = backupPolicy({
        name: 'test-policy',
        vaultName: 'my-vault',
        scheduleType: 'Daily',
        scheduleTime: '02:00'
      });

      expect(result.type).toBe('Microsoft.RecoveryServices/vaults/backupPolicies');
      expect(result.properties.backupManagementType).toBe('AzureIaasVM');
    });

    it('should support custom retention', () => {
      const result = backupPolicy({
        name: 'test-policy',
        vaultName: 'my-vault',
        scheduleType: 'Daily',
        scheduleTime: '02:00',
        dailyRetentionDays: 7
      });

      expect(result.properties.retentionPolicy.dailySchedule.retentionDuration.count).toBe(7);
    });
  });

  describe('enableVMBackup', () => {
    it('should enable backup for VM', () => {
      const result = enableVMBackup({
        vmName: 'test-vm',
        vaultName: 'vault',
        policyName: 'policy'
      });

      expect(result.type).toBe('Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems');
      expect(result.name).toContain('test-vm');
    });
  });

  describe('BackupPresets', () => {
    it('should provide development preset', () => {
      const preset = BackupPresets.development('vault');
      expect(preset.dailyRetentionDays).toBe(7);
      expect(preset.scheduleType).toBe('Daily');
    });

    it('should provide production preset', () => {
      const preset = BackupPresets.production('vault');
      expect(preset.dailyRetentionDays).toBe(30);
      expect(preset.weeklyRetentionWeeks).toBe(12);
    });

    it('should provide long-term preset', () => {
      const preset = BackupPresets.longTerm('vault');
      expect(preset.yearlyRetentionYears).toBe(7);
    });
  });

  describe('estimateBackupStorage', () => {
    it('should estimate storage size', () => {
      const result = estimateBackupStorage(100, 30);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should account for compression', () => {
      const noCompression = estimateBackupStorage(100, 30, 12, 12, 1);
      const withCompression = estimateBackupStorage(100, 30, 12, 12, 0.5);
      expect(withCompression).toBeLessThan(noCompression);
    });
  });

  describe('validateBackupPolicy', () => {
    it('should validate correct policy', () => {
      const result = validateBackupPolicy({
        name: 'policy',
        vaultName: 'vault',
        scheduleType: 'Daily',
        scheduleTime: '02:00'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid time', () => {
      const result = validateBackupPolicy({
        name: 'policy',
        vaultName: 'vault',
        scheduleType: 'Daily',
        scheduleTime: '25:00'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Azure Site Recovery', () => {
  describe('replicationPolicy', () => {
    it('should create replication policy', () => {
      const result = replicationPolicy({
        name: 'rep-policy',
        vaultName: 'vault'
      });

      expect(result.type).toBe('Microsoft.RecoveryServices/vaults/replicationPolicies');
      expect(result.properties.providerSpecificInput.instanceType).toBe('A2A');
    });
  });

  describe('RegionPairs', () => {
    it('should contain Azure region pairs', () => {
      expect(RegionPairs['eastus']).toBe('westus');
      expect(RegionPairs['northeurope']).toBe('westeurope');
    });

    it('should be bidirectional', () => {
      expect(RegionPairs['eastus']).toBe('westus');
      expect(RegionPairs['westus']).toBe('eastus');
    });
  });

  describe('getRecommendedTargetRegion', () => {
    it('should return paired region', () => {
      expect(getRecommendedTargetRegion('eastus')).toBe('westus');
    });

    it('should return fallback for unknown', () => {
      expect(getRecommendedTargetRegion('unknown')).toBe('westus2');
    });
  });
});

describe('Snapshots', () => {
  describe('diskSnapshot', () => {
    it('should create incremental snapshot when specified', () => {
      const result = diskSnapshot({
        name: 'snap',
        diskName: '/subscriptions/xxx/disks/disk1',
        incremental: true
      });

      expect(result.type).toBe('Microsoft.Compute/snapshots');
      expect(result.properties.incremental).toBe(true);
    });

    it('should create full snapshot', () => {
      const result = diskSnapshot({
        name: 'snap',
        diskName: '/subscriptions/xxx/disks/disk1',
        incremental: false
      });

      expect(result.properties.incremental).toBe(false);
    });
  });

  describe('restorePointCollection', () => {
    it('should create collection', () => {
      const result = restorePointCollection({
        name: 'collection',
        vmName: '/subscriptions/xxx/vms/vm1'
      });

      expect(result.type).toBe('Microsoft.Compute/restorePointCollections');
      expect(result.name).toBe('collection');
    });
  });

  describe('SnapshotRetentionPolicies', () => {
    it('should provide hourly policy', () => {
      expect(SnapshotRetentionPolicies.hourly.retention).toBe(24);
    });

    it('should provide daily policy', () => {
      expect(SnapshotRetentionPolicies.daily.retention).toBe(7);
    });

    it('should provide weekly policy', () => {
      expect(SnapshotRetentionPolicies.weekly.retention).toBe(4);
    });

    it('should provide monthly policy', () => {
      expect(SnapshotRetentionPolicies.monthly.retention).toBe(12);
    });
  });
});
