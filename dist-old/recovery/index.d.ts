/**
 * Recovery Module
 *
 * Azure Virtual Machine Recovery and Disaster Recovery configurations.
 * Includes Backup, Site Recovery, and Disk Snapshots.
 *
 * @module recovery
 */
import { recoveryServicesVault, backupPolicy, enableVMBackup, BackupPresets, estimateBackupStorage, validateBackupPolicy, backupBestPractices, type RecoveryServicesVaultConfig, type BackupPolicyConfig, type VMBackupConfig } from "./backup";
import { replicationPolicy, enableVMReplication, recoveryPlan, RegionPairs, getRecommendedTargetRegion, estimateRTO, estimateRPO, estimateReplicationBandwidth, validateReplicationPolicy, siteRecoveryBestPractices, type ReplicationPolicyConfig, type VMReplicationConfig, type RecoveryPlanConfig } from "./siterecovery";
import { diskSnapshot, restorePointCollection, vmRestorePoint, diskFromSnapshot, SnapshotRetentionPolicies, estimateSnapshotCost, estimateRestoreTime, getRecommendedSnapshotSchedule, validateSnapshotConfig, snapshotsBestPractices, type SnapshotConfig, type RestorePointCollectionConfig, type RestorePointConfig } from "./snapshots";
/**
 * Register all recovery helpers with Handlebars
 */
export declare function registerRecoveryHelpers(): void;
/**
 * Export all recovery functions
 */
export { recoveryServicesVault, backupPolicy, enableVMBackup, BackupPresets, estimateBackupStorage, validateBackupPolicy, backupBestPractices, replicationPolicy, enableVMReplication, recoveryPlan, RegionPairs, getRecommendedTargetRegion, estimateRTO, estimateRPO, estimateReplicationBandwidth, validateReplicationPolicy, siteRecoveryBestPractices, diskSnapshot, restorePointCollection, vmRestorePoint, diskFromSnapshot, SnapshotRetentionPolicies, estimateSnapshotCost, estimateRestoreTime, getRecommendedSnapshotSchedule, validateSnapshotConfig, snapshotsBestPractices, type RecoveryServicesVaultConfig, type BackupPolicyConfig, type VMBackupConfig, type ReplicationPolicyConfig, type VMReplicationConfig, type RecoveryPlanConfig, type SnapshotConfig, type RestorePointCollectionConfig, type RestorePointConfig, };
