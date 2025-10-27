/**
 * Recovery Module
 *
 * Azure Virtual Machine Recovery and Disaster Recovery configurations.
 * Includes Backup, Site Recovery, and Disk Snapshots.
 *
 * @module recovery
 */

import Handlebars from "handlebars";

// Import backup module
import {
  recoveryServicesVault,
  backupPolicy,
  enableVMBackup,
  BackupPresets,
  estimateBackupStorage,
  validateBackupPolicy,
  backupBestPractices,
  type RecoveryServicesVaultConfig,
  type BackupPolicyConfig,
  type VMBackupConfig,
} from "./backup";

// Import site recovery module
import {
  replicationPolicy,
  enableVMReplication,
  recoveryPlan,
  RegionPairs,
  getRecommendedTargetRegion,
  estimateRTO,
  estimateRPO,
  estimateReplicationBandwidth,
  validateReplicationPolicy,
  siteRecoveryBestPractices,
  type ReplicationPolicyConfig,
  type VMReplicationConfig,
  type RecoveryPlanConfig,
} from "./siterecovery";

// Import snapshots module
import {
  diskSnapshot,
  restorePointCollection,
  vmRestorePoint,
  diskFromSnapshot,
  SnapshotRetentionPolicies,
  estimateSnapshotCost,
  estimateRestoreTime,
  getRecommendedSnapshotSchedule,
  validateSnapshotConfig,
  snapshotsBestPractices,
  type SnapshotConfig,
  type RestorePointCollectionConfig,
  type RestorePointConfig,
} from "./snapshots";

/**
 * Register all recovery helpers with Handlebars
 */
export function registerRecoveryHelpers() {
  // ===== Backup Helpers =====

  Handlebars.registerHelper("recovery:vault", function (options: any) {
    const config: RecoveryServicesVaultConfig = {
      name: options.hash.name,
      location: options.hash.location,
      sku: options.hash.sku,
      tags: options.hash.tags,
    };
    return JSON.stringify(recoveryServicesVault(config), null, 2);
  });

  Handlebars.registerHelper("recovery:backupPolicy", function (options: any) {
    const config: BackupPolicyConfig = {
      name: options.hash.name,
      vaultName: options.hash.vaultName,
      scheduleType: options.hash.scheduleType || "Daily",
      scheduleTime: options.hash.scheduleTime || "02:00",
      timezone: options.hash.timezone,
      dailyRetentionDays: options.hash.dailyRetentionDays,
      weeklyRetentionWeeks: options.hash.weeklyRetentionWeeks,
      monthlyRetentionMonths: options.hash.monthlyRetentionMonths,
      yearlyRetentionYears: options.hash.yearlyRetentionYears,
      instantRpRetentionRangeInDays: options.hash.instantRpRetentionRangeInDays,
    };
    return JSON.stringify(backupPolicy(config), null, 2);
  });

  Handlebars.registerHelper("recovery:enableVMBackup", function (options: any) {
    const config: VMBackupConfig = {
      vmName: options.hash.vmName,
      vaultName: options.hash.vaultName,
      policyName: options.hash.policyName,
      resourceGroup: options.hash.resourceGroup,
    };
    return JSON.stringify(enableVMBackup(config), null, 2);
  });

  Handlebars.registerHelper(
    "recovery:backupPreset",
    function (preset: string, vaultName: string) {
      const presetConfig =
        preset === "production"
          ? BackupPresets.production(vaultName)
          : preset === "longterm"
            ? BackupPresets.longTerm(vaultName)
            : BackupPresets.development(vaultName);
      return JSON.stringify(backupPolicy(presetConfig), null, 2);
    },
  );

  Handlebars.registerHelper(
    "recovery:estimateBackupStorage",
    function (
      vmSizeGB: number,
      dailyRetention: number,
      weeklyRetention: number,
      monthlyRetention: number,
    ) {
      return estimateBackupStorage(
        vmSizeGB,
        dailyRetention,
        weeklyRetention,
        monthlyRetention,
      );
    },
  );

  // ===== Site Recovery Helpers =====

  Handlebars.registerHelper(
    "recovery:replicationPolicy",
    function (options: any) {
      const config: ReplicationPolicyConfig = {
        name: options.hash.name,
        vaultName: options.hash.vaultName,
        recoveryPointRetentionInHours:
          options.hash.recoveryPointRetentionInHours,
        appConsistentFrequencyInMinutes:
          options.hash.appConsistentFrequencyInMinutes,
        crashConsistentFrequencyInMinutes:
          options.hash.crashConsistentFrequencyInMinutes,
      };
      return JSON.stringify(replicationPolicy(config), null, 2);
    },
  );

  Handlebars.registerHelper(
    "recovery:enableReplication",
    function (options: any) {
      const config: VMReplicationConfig = {
        vmName: options.hash.vmName,
        vaultName: options.hash.vaultName,
        sourceRegion: options.hash.sourceRegion,
        targetRegion: options.hash.targetRegion,
        targetResourceGroup: options.hash.targetResourceGroup,
        targetVirtualNetwork: options.hash.targetVirtualNetwork,
        replicationPolicyName: options.hash.replicationPolicyName,
      };
      return JSON.stringify(enableVMReplication(config), null, 2);
    },
  );

  Handlebars.registerHelper("recovery:recoveryPlan", function (options: any) {
    const config: RecoveryPlanConfig = {
      name: options.hash.name,
      vaultName: options.hash.vaultName,
      sourceRegion: options.hash.sourceRegion,
      targetRegion: options.hash.targetRegion,
      vmNames: options.hash.vmNames || [],
      bootOrder: options.hash.bootOrder,
    };
    return JSON.stringify(recoveryPlan(config), null, 2);
  });

  Handlebars.registerHelper("recovery:pairedRegion", function (region: string) {
    return getRecommendedTargetRegion(region);
  });

  Handlebars.registerHelper(
    "recovery:estimateRTO",
    function (vmCount: number, avgVMSize: number) {
      return estimateRTO(vmCount, avgVMSize);
    },
  );

  Handlebars.registerHelper(
    "recovery:estimateRPO",
    function (crashConsistentFrequency: number) {
      return estimateRPO(crashConsistentFrequency);
    },
  );

  Handlebars.registerHelper(
    "recovery:estimateBandwidth",
    function (vmSizeGB: number, changeRate: number) {
      return estimateReplicationBandwidth(vmSizeGB, changeRate);
    },
  );

  // ===== Snapshot Helpers =====

  Handlebars.registerHelper("recovery:snapshot", function (options: any) {
    const config: SnapshotConfig = {
      name: options.hash.name,
      diskName: options.hash.diskName,
      location: options.hash.location,
      incremental: options.hash.incremental ?? true,
      tags: options.hash.tags,
    };
    return JSON.stringify(diskSnapshot(config), null, 2);
  });

  Handlebars.registerHelper(
    "recovery:restorePointCollection",
    function (options: any) {
      const config: RestorePointCollectionConfig = {
        name: options.hash.name,
        vmName: options.hash.vmName,
        location: options.hash.location,
        source: options.hash.source,
      };
      return JSON.stringify(restorePointCollection(config), null, 2);
    },
  );

  Handlebars.registerHelper("recovery:restorePoint", function (options: any) {
    const config: RestorePointConfig = {
      name: options.hash.name,
      collectionName: options.hash.collectionName,
      vmName: options.hash.vmName,
      excludeDisks: options.hash.excludeDisks,
      consistencyMode: options.hash.consistencyMode,
    };
    return JSON.stringify(vmRestorePoint(config), null, 2);
  });

  Handlebars.registerHelper(
    "recovery:diskFromSnapshot",
    function (diskName: string, snapshotName: string, location?: string) {
      return JSON.stringify(
        diskFromSnapshot(diskName, snapshotName, location),
        null,
        2,
      );
    },
  );

  Handlebars.registerHelper(
    "recovery:estimateSnapshotCost",
    function (
      diskSizeGB: number,
      isIncremental: boolean,
      snapshotCount: number,
    ) {
      return estimateSnapshotCost(diskSizeGB, isIncremental, snapshotCount);
    },
  );

  Handlebars.registerHelper(
    "recovery:estimateRestoreTime",
    function (diskSizeGB: number, isIncremental: boolean) {
      return estimateRestoreTime(diskSizeGB, isIncremental);
    },
  );

  Handlebars.registerHelper(
    "recovery:snapshotSchedule",
    function (workloadType: string) {
      return JSON.stringify(
        getRecommendedSnapshotSchedule(workloadType as any),
      );
    },
  );

  // ===== Best Practices =====

  Handlebars.registerHelper("recovery:bestPractices", function (type: string) {
    switch (type) {
      case "backup":
        return new Handlebars.SafeString(backupBestPractices());
      case "siterecovery":
      case "asr":
      case "dr":
        return new Handlebars.SafeString(siteRecoveryBestPractices());
      case "snapshots":
      case "snapshot":
        return new Handlebars.SafeString(snapshotsBestPractices());
      default:
        return new Handlebars.SafeString(
          `
# Azure VM Recovery Options

## Backup
${backupBestPractices()}

## Site Recovery (Disaster Recovery)
${siteRecoveryBestPractices()}

## Snapshots
${snapshotsBestPractices()}
        `.trim(),
        );
    }
  });
}

/**
 * Export all recovery functions
 */
export {
  // Backup
  recoveryServicesVault,
  backupPolicy,
  enableVMBackup,
  BackupPresets,
  estimateBackupStorage,
  validateBackupPolicy,
  backupBestPractices,

  // Site Recovery
  replicationPolicy,
  enableVMReplication,
  recoveryPlan,
  RegionPairs,
  getRecommendedTargetRegion,
  estimateRTO,
  estimateRPO,
  estimateReplicationBandwidth,
  validateReplicationPolicy,
  siteRecoveryBestPractices,

  // Snapshots
  diskSnapshot,
  restorePointCollection,
  vmRestorePoint,
  diskFromSnapshot,
  SnapshotRetentionPolicies,
  estimateSnapshotCost,
  estimateRestoreTime,
  getRecommendedSnapshotSchedule,
  validateSnapshotConfig,
  snapshotsBestPractices,

  // Types
  type RecoveryServicesVaultConfig,
  type BackupPolicyConfig,
  type VMBackupConfig,
  type ReplicationPolicyConfig,
  type VMReplicationConfig,
  type RecoveryPlanConfig,
  type SnapshotConfig,
  type RestorePointCollectionConfig,
  type RestorePointConfig,
};
