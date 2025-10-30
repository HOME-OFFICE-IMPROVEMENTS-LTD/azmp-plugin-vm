"use strict";
/**
 * Azure Backup Configuration and Management Module
 *
 * Provides comprehensive Azure Backup functionality for virtual machines including:
 * - Recovery Services Vault configuration
 * - Backup policy management (daily, weekly, monthly, yearly retention)
 * - VM backup enablement
 * - Cost estimation
 * - ARM template generation
 * - Marketplace compliance validation
 *
 * @module azure/backup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = exports.VaultSku = exports.DayOfWeek = exports.BackupFrequency = exports.BackupPolicyPreset = void 0;
exports.createBackupConfiguration = createBackupConfiguration;
exports.generateBackupTemplate = generateBackupTemplate;
/**
 * Backup policy preset types
 */
var BackupPolicyPreset;
(function (BackupPolicyPreset) {
    BackupPolicyPreset["Development"] = "development";
    BackupPolicyPreset["Production"] = "production";
    BackupPolicyPreset["LongTerm"] = "longterm";
    BackupPolicyPreset["Custom"] = "custom";
})(BackupPolicyPreset || (exports.BackupPolicyPreset = BackupPolicyPreset = {}));
/**
 * Backup frequency options
 */
var BackupFrequency;
(function (BackupFrequency) {
    BackupFrequency["Daily"] = "Daily";
    BackupFrequency["Weekly"] = "Weekly";
})(BackupFrequency || (exports.BackupFrequency = BackupFrequency = {}));
/**
 * Day of week for backup scheduling
 */
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["Sunday"] = "Sunday";
    DayOfWeek["Monday"] = "Monday";
    DayOfWeek["Tuesday"] = "Tuesday";
    DayOfWeek["Wednesday"] = "Wednesday";
    DayOfWeek["Thursday"] = "Thursday";
    DayOfWeek["Friday"] = "Friday";
    DayOfWeek["Saturday"] = "Saturday";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
/**
 * Recovery Services Vault SKU
 */
var VaultSku;
(function (VaultSku) {
    VaultSku["Standard"] = "RS0";
    VaultSku["Premium"] = "RS0"; // Currently only RS0 is supported
})(VaultSku || (exports.VaultSku = VaultSku = {}));
/**
 * BackupManager - Manages Azure Backup configuration and ARM template generation
 */
class BackupManager {
    /**
     * Preset backup policies with predefined configurations
     */
    static PRESET_POLICIES = {
        [BackupPolicyPreset.Development]: {
            name: 'Development',
            description: '7 days daily retention with 2-day instant restore. Suitable for dev/test environments.',
            schedule: {
                frequency: BackupFrequency.Daily,
                time: '02:00',
            },
            retention: {
                dailyRetentionDays: 7,
            },
            instantRestore: {
                enabled: true,
                retentionDays: 2,
            },
            estimatedMonthlyCostPer100GB: 15,
        },
        [BackupPolicyPreset.Production]: {
            name: 'Production',
            description: '30 days daily + 12 weeks weekly + 12 months monthly retention with 5-day instant restore.',
            schedule: {
                frequency: BackupFrequency.Daily,
                time: '02:00',
            },
            retention: {
                dailyRetentionDays: 30,
                weeklyRetentionWeeks: 12,
                weeklyRetentionDays: [DayOfWeek.Sunday],
                monthlyRetentionMonths: 12,
                monthlyRetentionWeek: 'First',
                monthlyRetentionDay: DayOfWeek.Sunday,
            },
            instantRestore: {
                enabled: true,
                retentionDays: 5,
            },
            estimatedMonthlyCostPer100GB: 35,
        },
        [BackupPolicyPreset.LongTerm]: {
            name: 'Long-term',
            description: '90 days daily + 52 weeks weekly + 60 months monthly + 7 years yearly retention.',
            schedule: {
                frequency: BackupFrequency.Daily,
                time: '02:00',
            },
            retention: {
                dailyRetentionDays: 90,
                weeklyRetentionWeeks: 52,
                weeklyRetentionDays: [DayOfWeek.Sunday],
                monthlyRetentionMonths: 60,
                monthlyRetentionWeek: 'First',
                monthlyRetentionDay: DayOfWeek.Sunday,
                yearlyRetentionYears: 7,
                yearlyRetentionMonths: ['January'],
                yearlyRetentionWeek: 'First',
                yearlyRetentionDay: DayOfWeek.Sunday,
            },
            instantRestore: {
                enabled: true,
                retentionDays: 5,
            },
            estimatedMonthlyCostPer100GB: 75,
        },
        [BackupPolicyPreset.Custom]: {
            name: 'Custom',
            description: 'Custom backup policy with user-defined retention settings.',
            schedule: {
                frequency: BackupFrequency.Daily,
                time: '02:00',
            },
            retention: {
                dailyRetentionDays: 30,
            },
            instantRestore: {
                enabled: true,
                retentionDays: 2,
            },
            estimatedMonthlyCostPer100GB: 35,
        },
    };
    /**
     * Azure Backup pricing constants (USD per month)
     */
    static PRICING = {
        /** Protected instance cost per VM per month */
        protectedInstanceCost: 10.0,
        /** Storage cost per GB per month (average across tiers) */
        storagePerGBPerMonth: 0.10,
        /** Instant restore snapshot cost per GB per month */
        snapshotPerGBPerMonth: 0.05,
    };
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Get preset policy specification
     */
    static getPresetPolicy(preset) {
        return this.PRESET_POLICIES[preset];
    }
    /**
     * Get all preset policies
     */
    static getAllPresets() {
        return { ...this.PRESET_POLICIES };
    }
    /**
     * Validate backup configuration
     */
    validate() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            recommendations: [],
        };
        // Validate vault name
        if (!this.config.vaultName) {
            result.errors.push('Vault name is required');
            result.isValid = false;
        }
        else if (!/^[a-zA-Z0-9-]{3,50}$/.test(this.config.vaultName)) {
            result.errors.push('Vault name must be 3-50 characters (alphanumeric and hyphens only)');
            result.isValid = false;
        }
        // Validate VM name
        if (!this.config.vmName) {
            result.errors.push('VM name is required');
            result.isValid = false;
        }
        // Validate resource group
        if (!this.config.resourceGroupName) {
            result.errors.push('Resource group name is required');
            result.isValid = false;
        }
        // Validate vault configuration if creating new vault
        if (this.config.createVault && !this.config.vaultConfig) {
            result.errors.push('Vault configuration is required when creating a new vault');
            result.isValid = false;
        }
        // Validate custom policy if using custom preset
        if (this.config.policyPreset === BackupPolicyPreset.Custom && !this.config.customPolicy) {
            result.errors.push('Custom policy configuration is required when using Custom preset');
            result.isValid = false;
        }
        // Validate custom policy details
        if (this.config.customPolicy) {
            const policy = this.config.customPolicy;
            // Validate retention days
            if (policy.retention.dailyRetentionDays !== undefined) {
                if (policy.retention.dailyRetentionDays < 7 || policy.retention.dailyRetentionDays > 9999) {
                    result.errors.push('Daily retention must be between 7 and 9999 days');
                    result.isValid = false;
                }
            }
            // Validate weekly retention
            if (policy.retention.weeklyRetentionWeeks !== undefined) {
                if (policy.retention.weeklyRetentionWeeks < 1 || policy.retention.weeklyRetentionWeeks > 5163) {
                    result.errors.push('Weekly retention must be between 1 and 5163 weeks');
                    result.isValid = false;
                }
            }
            // Validate monthly retention
            if (policy.retention.monthlyRetentionMonths !== undefined) {
                if (policy.retention.monthlyRetentionMonths < 1 || policy.retention.monthlyRetentionMonths > 1188) {
                    result.errors.push('Monthly retention must be between 1 and 1188 months');
                    result.isValid = false;
                }
            }
            // Validate yearly retention
            if (policy.retention.yearlyRetentionYears !== undefined) {
                if (policy.retention.yearlyRetentionYears < 1 || policy.retention.yearlyRetentionYears > 99) {
                    result.errors.push('Yearly retention must be between 1 and 99 years');
                    result.isValid = false;
                }
            }
            // Validate instant restore retention
            if (policy.instantRestore.enabled) {
                if (policy.instantRestore.retentionDays < 1 || policy.instantRestore.retentionDays > 5) {
                    result.errors.push('Instant restore retention must be between 1 and 5 days');
                    result.isValid = false;
                }
            }
            // Validate backup time format
            if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(policy.schedule.time)) {
                result.errors.push('Backup time must be in HH:MM format (24-hour)');
                result.isValid = false;
            }
        }
        // Add recommendations
        if (this.config.enabled) {
            result.recommendations.push('Backup is enabled. Ensure the Recovery Services Vault is in the same region as the VM for optimal performance.');
            if (this.config.policyPreset === BackupPolicyPreset.Development) {
                result.warnings.push('Development backup policy provides only 7 days retention. Consider Production policy for critical workloads.');
            }
            if (!this.config.customPolicy?.instantRestore?.enabled) {
                result.recommendations.push('Enable instant restore for faster recovery operations (1-5 days snapshot retention).');
            }
        }
        else {
            result.warnings.push('Backup is disabled. This VM will not be protected against data loss.');
        }
        return result;
    }
    /**
     * Estimate backup costs
     */
    estimateCosts(vmDiskSizeGB) {
        const protectedInstanceCost = BackupManager.PRICING.protectedInstanceCost;
        // Calculate storage cost based on disk size and retention policy
        let storageFactor = 1.0;
        const preset = BackupManager.getPresetPolicy(this.config.policyPreset);
        // Estimate storage growth based on retention
        if (preset.retention.dailyRetentionDays) {
            storageFactor += preset.retention.dailyRetentionDays * 0.05; // 5% per day
        }
        if (preset.retention.weeklyRetentionWeeks) {
            storageFactor += preset.retention.weeklyRetentionWeeks * 0.02; // 2% per week
        }
        if (preset.retention.monthlyRetentionMonths) {
            storageFactor += preset.retention.monthlyRetentionMonths * 0.01; // 1% per month
        }
        const storageCost = vmDiskSizeGB * storageFactor * BackupManager.PRICING.storagePerGBPerMonth;
        // Add instant restore snapshot cost
        let snapshotCost = 0;
        if (preset.instantRestore.enabled) {
            snapshotCost = vmDiskSizeGB * preset.instantRestore.retentionDays * BackupManager.PRICING.snapshotPerGBPerMonth;
        }
        const totalMonthlyCost = protectedInstanceCost + storageCost + snapshotCost;
        const totalAnnualCost = totalMonthlyCost * 12;
        return {
            protectedInstanceCost,
            storageCost: storageCost + snapshotCost,
            totalMonthlyCost,
            totalAnnualCost,
            notes: [
                `Protected instance: $${protectedInstanceCost.toFixed(2)}/month`,
                `Storage (${vmDiskSizeGB}GB VM, ${storageFactor.toFixed(1)}x factor): $${storageCost.toFixed(2)}/month`,
                preset.instantRestore.enabled
                    ? `Instant restore snapshots (${preset.instantRestore.retentionDays} days): $${snapshotCost.toFixed(2)}/month`
                    : 'Instant restore disabled',
                'Costs may vary based on actual backup data size and change rate',
            ],
        };
    }
    /**
     * Get ARM template parameters for backup
     */
    getTemplateParameters() {
        const params = {
            enableBackup: {
                type: 'bool',
                defaultValue: this.config.enabled,
                metadata: {
                    description: 'Enable Azure Backup for the virtual machine',
                },
            },
            backupPolicyPreset: {
                type: 'string',
                defaultValue: this.config.policyPreset,
                allowedValues: Object.values(BackupPolicyPreset),
                metadata: {
                    description: 'Backup policy preset (development, production, longterm, or custom)',
                },
            },
            recoveryServicesVaultName: {
                type: 'string',
                defaultValue: this.config.vaultName,
                metadata: {
                    description: 'Recovery Services Vault name',
                },
            },
        };
        if (this.config.createVault && this.config.vaultConfig) {
            params.vaultLocation = {
                type: 'string',
                defaultValue: this.config.vaultConfig.location,
                metadata: {
                    description: 'Recovery Services Vault location (should match VM location)',
                },
            };
        }
        return params;
    }
    /**
     * Get ARM template variables for backup
     */
    getTemplateVariables() {
        const preset = BackupManager.getPresetPolicy(this.config.policyPreset);
        return {
            backupPolicyName: `[concat('policy-', parameters('backupPolicyPreset'))]`,
            backupFabric: 'Azure',
            protectionContainer: `[concat('iaasvmcontainer;iaasvmcontainerv2;', resourceGroup().name, ';', parameters('vmName'))]`,
            protectedItem: `[concat('vm;iaasvmcontainerv2;', resourceGroup().name, ';', parameters('vmName'))]`,
            backupScheduleTime: preset.schedule.time,
            instantRestoreRetentionDays: preset.instantRestore.retentionDays,
        };
    }
    /**
     * Generate Recovery Services Vault ARM resource
     */
    getVaultResource() {
        if (!this.config.createVault || !this.config.vaultConfig) {
            return null;
        }
        const vault = this.config.vaultConfig;
        return {
            type: 'Microsoft.RecoveryServices/vaults',
            apiVersion: '2023-06-01',
            name: `[parameters('recoveryServicesVaultName')]`,
            location: `[parameters('vaultLocation')]`,
            sku: {
                name: vault.sku,
                tier: 'Standard',
            },
            properties: {
                publicNetworkAccess: vault.publicNetworkAccess ? 'Enabled' : 'Disabled',
            },
            tags: vault.tags || {},
        };
    }
    /**
     * Generate backup policy ARM resource
     */
    getBackupPolicyResource() {
        const preset = BackupManager.getPresetPolicy(this.config.policyPreset);
        const policy = this.config.customPolicy || this.config.policyPreset !== BackupPolicyPreset.Custom ? preset : null;
        if (!policy) {
            throw new Error('Backup policy configuration is missing');
        }
        const resource = {
            type: 'Microsoft.RecoveryServices/vaults/backupPolicies',
            apiVersion: '2023-06-01',
            name: `[concat(parameters('recoveryServicesVaultName'), '/', variables('backupPolicyName'))]`,
            dependsOn: this.config.createVault
                ? [`[resourceId('Microsoft.RecoveryServices/vaults', parameters('recoveryServicesVaultName'))]`]
                : [],
            properties: {
                backupManagementType: 'AzureIaasVM',
                instantRpRetentionRangeInDays: policy.instantRestore.retentionDays,
                schedulePolicy: {
                    schedulePolicyType: 'SimpleSchedulePolicy',
                    scheduleRunFrequency: policy.schedule.frequency,
                    scheduleRunTimes: [`${policy.schedule.time}:00Z`],
                },
                retentionPolicy: this.buildRetentionPolicy(policy.retention),
                timeZone: 'UTC',
            },
        };
        return resource;
    }
    /**
     * Build retention policy object for ARM template
     */
    buildRetentionPolicy(retention) {
        const policy = {
            retentionPolicyType: 'LongTermRetentionPolicy',
        };
        // Daily retention
        if (retention.dailyRetentionDays) {
            policy.dailySchedule = {
                retentionTimes: ['02:00:00Z'],
                retentionDuration: {
                    count: retention.dailyRetentionDays,
                    durationType: 'Days',
                },
            };
        }
        // Weekly retention
        if (retention.weeklyRetentionWeeks) {
            policy.weeklySchedule = {
                daysOfTheWeek: retention.weeklyRetentionDays || [DayOfWeek.Sunday],
                retentionTimes: ['02:00:00Z'],
                retentionDuration: {
                    count: retention.weeklyRetentionWeeks,
                    durationType: 'Weeks',
                },
            };
        }
        // Monthly retention
        if (retention.monthlyRetentionMonths) {
            policy.monthlySchedule = {
                retentionScheduleFormatType: 'Weekly',
                retentionScheduleWeekly: {
                    daysOfTheWeek: [retention.monthlyRetentionDay || DayOfWeek.Sunday],
                    weeksOfTheMonth: [retention.monthlyRetentionWeek || 'First'],
                },
                retentionTimes: ['02:00:00Z'],
                retentionDuration: {
                    count: retention.monthlyRetentionMonths,
                    durationType: 'Months',
                },
            };
        }
        // Yearly retention
        if (retention.yearlyRetentionYears) {
            policy.yearlySchedule = {
                retentionScheduleFormatType: 'Weekly',
                monthsOfYear: retention.yearlyRetentionMonths || ['January'],
                retentionScheduleWeekly: {
                    daysOfTheWeek: [retention.yearlyRetentionDay || DayOfWeek.Sunday],
                    weeksOfTheMonth: [retention.yearlyRetentionWeek || 'First'],
                },
                retentionTimes: ['02:00:00Z'],
                retentionDuration: {
                    count: retention.yearlyRetentionYears,
                    durationType: 'Years',
                },
            };
        }
        return policy;
    }
    /**
     * Generate protected item ARM resource (enables backup on VM)
     */
    getProtectedItemResource() {
        return {
            type: 'Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems',
            apiVersion: '2023-06-01',
            name: `[concat(parameters('recoveryServicesVaultName'), '/', variables('backupFabric'), '/', variables('protectionContainer'), '/', variables('protectedItem'))]`,
            dependsOn: [
                `[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`,
                `[resourceId('Microsoft.RecoveryServices/vaults/backupPolicies', parameters('recoveryServicesVaultName'), variables('backupPolicyName'))]`,
            ],
            properties: {
                protectedItemType: 'Microsoft.Compute/virtualMachines',
                policyId: `[resourceId('Microsoft.RecoveryServices/vaults/backupPolicies', parameters('recoveryServicesVaultName'), variables('backupPolicyName'))]`,
                sourceResourceId: `[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`,
            },
        };
    }
    /**
     * Check if backup configuration is marketplace compliant
     */
    isMarketplaceCompliant() {
        const issues = [];
        if (!this.config.enabled) {
            issues.push('Backup is not enabled. Azure Marketplace recommends backup for production VMs.');
        }
        if (this.config.policyPreset === BackupPolicyPreset.Development) {
            issues.push('Development backup policy (7 days) may not meet enterprise requirements. Consider Production or Long-term policies.');
        }
        return {
            compliant: issues.length === 0,
            issues,
        };
    }
}
exports.BackupManager = BackupManager;
/**
 * Helper function to create backup configuration from CLI options
 */
function createBackupConfiguration(options) {
    const preset = options.policyPreset || BackupPolicyPreset.Production;
    const config = {
        enabled: options.enabled !== false,
        vaultName: options.vaultName,
        createVault: options.createVault || false,
        policyPreset: preset,
        vmName: options.vmName,
        resourceGroupName: options.resourceGroupName,
    };
    if (options.createVault && options.vaultLocation) {
        config.vaultConfig = {
            name: options.vaultName,
            location: options.vaultLocation,
            sku: VaultSku.Standard,
            publicNetworkAccess: true,
        };
    }
    // Handle custom retention if provided
    if (options.customRetention && preset === BackupPolicyPreset.Custom) {
        const presetPolicy = BackupManager.getPresetPolicy(BackupPolicyPreset.Production);
        config.customPolicy = {
            name: 'Custom',
            schedule: presetPolicy.schedule,
            retention: {
                dailyRetentionDays: options.customRetention.daily,
                weeklyRetentionWeeks: options.customRetention.weekly,
                monthlyRetentionMonths: options.customRetention.monthly,
                yearlyRetentionYears: options.customRetention.yearly,
            },
            instantRestore: presetPolicy.instantRestore,
        };
    }
    return config;
}
/**
 * Generate complete ARM template for backup configuration
 */
function generateBackupTemplate(config) {
    const manager = new BackupManager(config);
    const template = {
        $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
        contentVersion: '1.0.0.0',
        parameters: manager.getTemplateParameters(),
        variables: manager.getTemplateVariables(),
        resources: [],
    };
    // Add vault if creating new
    const vaultResource = manager.getVaultResource();
    if (vaultResource) {
        template.resources.push(vaultResource);
    }
    // Add backup policy
    if (config.enabled) {
        template.resources.push(manager.getBackupPolicyResource());
        template.resources.push(manager.getProtectedItemResource());
    }
    return template;
}
