"use strict";
/**
 * Recovery Module
 *
 * Azure Virtual Machine Recovery and Disaster Recovery configurations.
 * Includes Backup, Site Recovery, and Disk Snapshots.
 *
 * @module recovery
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotsBestPractices = exports.validateSnapshotConfig = exports.getRecommendedSnapshotSchedule = exports.estimateRestoreTime = exports.estimateSnapshotCost = exports.SnapshotRetentionPolicies = exports.diskFromSnapshot = exports.vmRestorePoint = exports.restorePointCollection = exports.diskSnapshot = exports.siteRecoveryBestPractices = exports.validateReplicationPolicy = exports.estimateReplicationBandwidth = exports.estimateRPO = exports.estimateRTO = exports.getRecommendedTargetRegion = exports.RegionPairs = exports.recoveryPlan = exports.enableVMReplication = exports.replicationPolicy = exports.backupBestPractices = exports.validateBackupPolicy = exports.estimateBackupStorage = exports.BackupPresets = exports.enableVMBackup = exports.backupPolicy = exports.recoveryServicesVault = void 0;
exports.registerRecoveryHelpers = registerRecoveryHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
// Import backup module
const backup_1 = require("./backup");
Object.defineProperty(exports, "recoveryServicesVault", { enumerable: true, get: function () { return backup_1.recoveryServicesVault; } });
Object.defineProperty(exports, "backupPolicy", { enumerable: true, get: function () { return backup_1.backupPolicy; } });
Object.defineProperty(exports, "enableVMBackup", { enumerable: true, get: function () { return backup_1.enableVMBackup; } });
Object.defineProperty(exports, "BackupPresets", { enumerable: true, get: function () { return backup_1.BackupPresets; } });
Object.defineProperty(exports, "estimateBackupStorage", { enumerable: true, get: function () { return backup_1.estimateBackupStorage; } });
Object.defineProperty(exports, "validateBackupPolicy", { enumerable: true, get: function () { return backup_1.validateBackupPolicy; } });
Object.defineProperty(exports, "backupBestPractices", { enumerable: true, get: function () { return backup_1.backupBestPractices; } });
// Import site recovery module
const siterecovery_1 = require("./siterecovery");
Object.defineProperty(exports, "replicationPolicy", { enumerable: true, get: function () { return siterecovery_1.replicationPolicy; } });
Object.defineProperty(exports, "enableVMReplication", { enumerable: true, get: function () { return siterecovery_1.enableVMReplication; } });
Object.defineProperty(exports, "recoveryPlan", { enumerable: true, get: function () { return siterecovery_1.recoveryPlan; } });
Object.defineProperty(exports, "RegionPairs", { enumerable: true, get: function () { return siterecovery_1.RegionPairs; } });
Object.defineProperty(exports, "getRecommendedTargetRegion", { enumerable: true, get: function () { return siterecovery_1.getRecommendedTargetRegion; } });
Object.defineProperty(exports, "estimateRTO", { enumerable: true, get: function () { return siterecovery_1.estimateRTO; } });
Object.defineProperty(exports, "estimateRPO", { enumerable: true, get: function () { return siterecovery_1.estimateRPO; } });
Object.defineProperty(exports, "estimateReplicationBandwidth", { enumerable: true, get: function () { return siterecovery_1.estimateReplicationBandwidth; } });
Object.defineProperty(exports, "validateReplicationPolicy", { enumerable: true, get: function () { return siterecovery_1.validateReplicationPolicy; } });
Object.defineProperty(exports, "siteRecoveryBestPractices", { enumerable: true, get: function () { return siterecovery_1.siteRecoveryBestPractices; } });
// Import snapshots module
const snapshots_1 = require("./snapshots");
Object.defineProperty(exports, "diskSnapshot", { enumerable: true, get: function () { return snapshots_1.diskSnapshot; } });
Object.defineProperty(exports, "restorePointCollection", { enumerable: true, get: function () { return snapshots_1.restorePointCollection; } });
Object.defineProperty(exports, "vmRestorePoint", { enumerable: true, get: function () { return snapshots_1.vmRestorePoint; } });
Object.defineProperty(exports, "diskFromSnapshot", { enumerable: true, get: function () { return snapshots_1.diskFromSnapshot; } });
Object.defineProperty(exports, "SnapshotRetentionPolicies", { enumerable: true, get: function () { return snapshots_1.SnapshotRetentionPolicies; } });
Object.defineProperty(exports, "estimateSnapshotCost", { enumerable: true, get: function () { return snapshots_1.estimateSnapshotCost; } });
Object.defineProperty(exports, "estimateRestoreTime", { enumerable: true, get: function () { return snapshots_1.estimateRestoreTime; } });
Object.defineProperty(exports, "getRecommendedSnapshotSchedule", { enumerable: true, get: function () { return snapshots_1.getRecommendedSnapshotSchedule; } });
Object.defineProperty(exports, "validateSnapshotConfig", { enumerable: true, get: function () { return snapshots_1.validateSnapshotConfig; } });
Object.defineProperty(exports, "snapshotsBestPractices", { enumerable: true, get: function () { return snapshots_1.snapshotsBestPractices; } });
/**
 * Register all recovery helpers with Handlebars
 */
function registerRecoveryHelpers() {
    // ===== Backup Helpers =====
    handlebars_1.default.registerHelper("recovery:vault", function (options) {
        const config = {
            name: options.hash.name,
            location: options.hash.location,
            sku: options.hash.sku,
            tags: options.hash.tags,
        };
        return JSON.stringify((0, backup_1.recoveryServicesVault)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:backupPolicy", function (options) {
        const config = {
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
        return JSON.stringify((0, backup_1.backupPolicy)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:enableVMBackup", function (options) {
        const config = {
            vmName: options.hash.vmName,
            vaultName: options.hash.vaultName,
            policyName: options.hash.policyName,
            resourceGroup: options.hash.resourceGroup,
        };
        return JSON.stringify((0, backup_1.enableVMBackup)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:backupPreset", function (preset, vaultName) {
        const presetConfig = preset === "production"
            ? backup_1.BackupPresets.production(vaultName)
            : preset === "longterm"
                ? backup_1.BackupPresets.longTerm(vaultName)
                : backup_1.BackupPresets.development(vaultName);
        return JSON.stringify((0, backup_1.backupPolicy)(presetConfig), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:estimateBackupStorage", function (vmSizeGB, dailyRetention, weeklyRetention, monthlyRetention) {
        return (0, backup_1.estimateBackupStorage)(vmSizeGB, dailyRetention, weeklyRetention, monthlyRetention);
    });
    // ===== Site Recovery Helpers =====
    handlebars_1.default.registerHelper("recovery:replicationPolicy", function (options) {
        const config = {
            name: options.hash.name,
            vaultName: options.hash.vaultName,
            recoveryPointRetentionInHours: options.hash.recoveryPointRetentionInHours,
            appConsistentFrequencyInMinutes: options.hash.appConsistentFrequencyInMinutes,
            crashConsistentFrequencyInMinutes: options.hash.crashConsistentFrequencyInMinutes,
        };
        return JSON.stringify((0, siterecovery_1.replicationPolicy)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:enableReplication", function (options) {
        const config = {
            vmName: options.hash.vmName,
            vaultName: options.hash.vaultName,
            sourceRegion: options.hash.sourceRegion,
            targetRegion: options.hash.targetRegion,
            targetResourceGroup: options.hash.targetResourceGroup,
            targetVirtualNetwork: options.hash.targetVirtualNetwork,
            replicationPolicyName: options.hash.replicationPolicyName,
        };
        return JSON.stringify((0, siterecovery_1.enableVMReplication)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:recoveryPlan", function (options) {
        const config = {
            name: options.hash.name,
            vaultName: options.hash.vaultName,
            sourceRegion: options.hash.sourceRegion,
            targetRegion: options.hash.targetRegion,
            vmNames: options.hash.vmNames || [],
            bootOrder: options.hash.bootOrder,
        };
        return JSON.stringify((0, siterecovery_1.recoveryPlan)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:pairedRegion", function (region) {
        return (0, siterecovery_1.getRecommendedTargetRegion)(region);
    });
    handlebars_1.default.registerHelper("recovery:estimateRTO", function (vmCount, avgVMSize) {
        return (0, siterecovery_1.estimateRTO)(vmCount, avgVMSize);
    });
    handlebars_1.default.registerHelper("recovery:estimateRPO", function (crashConsistentFrequency) {
        return (0, siterecovery_1.estimateRPO)(crashConsistentFrequency);
    });
    handlebars_1.default.registerHelper("recovery:estimateBandwidth", function (vmSizeGB, changeRate) {
        return (0, siterecovery_1.estimateReplicationBandwidth)(vmSizeGB, changeRate);
    });
    // ===== Snapshot Helpers =====
    handlebars_1.default.registerHelper("recovery:snapshot", function (options) {
        const config = {
            name: options.hash.name,
            diskName: options.hash.diskName,
            location: options.hash.location,
            incremental: options.hash.incremental ?? true,
            tags: options.hash.tags,
        };
        return JSON.stringify((0, snapshots_1.diskSnapshot)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:restorePointCollection", function (options) {
        const config = {
            name: options.hash.name,
            vmName: options.hash.vmName,
            location: options.hash.location,
            source: options.hash.source,
        };
        return JSON.stringify((0, snapshots_1.restorePointCollection)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:restorePoint", function (options) {
        const config = {
            name: options.hash.name,
            collectionName: options.hash.collectionName,
            vmName: options.hash.vmName,
            excludeDisks: options.hash.excludeDisks,
            consistencyMode: options.hash.consistencyMode,
        };
        return JSON.stringify((0, snapshots_1.vmRestorePoint)(config), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:diskFromSnapshot", function (diskName, snapshotName, location) {
        return JSON.stringify((0, snapshots_1.diskFromSnapshot)(diskName, snapshotName, location), null, 2);
    });
    handlebars_1.default.registerHelper("recovery:estimateSnapshotCost", function (diskSizeGB, isIncremental, snapshotCount) {
        return (0, snapshots_1.estimateSnapshotCost)(diskSizeGB, isIncremental, snapshotCount);
    });
    handlebars_1.default.registerHelper("recovery:estimateRestoreTime", function (diskSizeGB, isIncremental) {
        return (0, snapshots_1.estimateRestoreTime)(diskSizeGB, isIncremental);
    });
    handlebars_1.default.registerHelper("recovery:snapshotSchedule", function (workloadType) {
        return JSON.stringify((0, snapshots_1.getRecommendedSnapshotSchedule)(workloadType));
    });
    // ===== Best Practices =====
    handlebars_1.default.registerHelper("recovery:bestPractices", function (type) {
        switch (type) {
            case "backup":
                return new handlebars_1.default.SafeString((0, backup_1.backupBestPractices)());
            case "siterecovery":
            case "asr":
            case "dr":
                return new handlebars_1.default.SafeString((0, siterecovery_1.siteRecoveryBestPractices)());
            case "snapshots":
            case "snapshot":
                return new handlebars_1.default.SafeString((0, snapshots_1.snapshotsBestPractices)());
            default:
                return new handlebars_1.default.SafeString(`
# Azure VM Recovery Options

## Backup
${(0, backup_1.backupBestPractices)()}

## Site Recovery (Disaster Recovery)
${(0, siterecovery_1.siteRecoveryBestPractices)()}

## Snapshots
${(0, snapshots_1.snapshotsBestPractices)()}
        `.trim());
        }
    });
}
