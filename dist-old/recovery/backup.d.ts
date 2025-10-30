/**
 * Azure Backup Module
 *
 * Provides helpers for Azure Backup configuration for Virtual Machines.
 * Includes Recovery Services Vault, backup policies, and VM backup enablement.
 *
 * @module recovery/backup
 */
/**
 * Backup Policy Schedule Type
 */
export type BackupScheduleType = "Daily" | "Weekly";
/**
 * Backup Retention Range
 */
export type RetentionDurationType = "Days" | "Weeks" | "Months" | "Years";
/**
 * Recovery Services Vault Configuration
 */
export interface RecoveryServicesVaultConfig {
    name: string;
    location?: string;
    sku?: "Standard" | "RS0";
    tags?: Record<string, string>;
}
/**
 * Backup Policy Configuration
 */
export interface BackupPolicyConfig {
    name: string;
    vaultName: string;
    scheduleType: BackupScheduleType;
    scheduleTime: string;
    timezone?: string;
    dailyRetentionDays?: number;
    weeklyRetentionWeeks?: number;
    monthlyRetentionMonths?: number;
    yearlyRetentionYears?: number;
    instantRpRetentionRangeInDays?: number;
}
/**
 * VM Backup Configuration
 */
export interface VMBackupConfig {
    vmName: string;
    vaultName: string;
    policyName: string;
    resourceGroup?: string;
}
/**
 * Generate Recovery Services Vault
 *
 * @param config - Vault configuration
 * @returns Recovery Services Vault template
 *
 * @example
 * ```handlebars
 * {{recovery:vault name="myVault" sku="Standard"}}
 * ```
 */
export declare function recoveryServicesVault(config: RecoveryServicesVaultConfig): any;
/**
 * Generate backup policy for VMs
 *
 * @param config - Backup policy configuration
 * @returns Backup policy template
 *
 * @example
 * ```handlebars
 * {{recovery:backupPolicy name="dailyBackup" vaultName="myVault" scheduleType="Daily" scheduleTime="02:00"}}
 * ```
 */
export declare function backupPolicy(config: BackupPolicyConfig): any;
/**
 * Enable backup for a VM
 *
 * @param config - VM backup configuration
 * @returns Backup protected item template
 *
 * @example
 * ```handlebars
 * {{recovery:enableVMBackup vmName="myVM" vaultName="myVault" policyName="dailyBackup"}}
 * ```
 */
export declare function enableVMBackup(config: VMBackupConfig): any;
/**
 * Standard backup policy presets
 */
export declare const BackupPresets: {
    /**
     * Development: 7 days daily retention, 2-day instant restore
     */
    development: (vaultName: string) => BackupPolicyConfig;
    /**
     * Production: 30 days daily, 12 weeks weekly, 12 months monthly, 5-day instant restore
     */
    production: (vaultName: string) => BackupPolicyConfig;
    /**
     * Long-term: 90 days daily, 52 weeks weekly, 60 months monthly, 7 years yearly
     */
    longTerm: (vaultName: string) => BackupPolicyConfig;
};
/**
 * Calculate estimated backup storage cost (GB)
 *
 * @param vmSizeGB - VM disk size in GB
 * @param dailyRetention - Daily retention days
 * @param weeklyRetention - Weekly retention weeks
 * @param monthlyRetention - Monthly retention months
 * @param compressionRatio - Expected compression (default: 0.5 = 50% reduction)
 * @returns Estimated storage in GB
 */
export declare function estimateBackupStorage(vmSizeGB: number, dailyRetention?: number, weeklyRetention?: number, monthlyRetention?: number, compressionRatio?: number): number;
/**
 * Validate backup policy configuration
 *
 * @param config - Backup policy configuration
 * @returns Validation result
 */
export declare function validateBackupPolicy(config: BackupPolicyConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Backup best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function backupBestPractices(): string;
/**
 * Export all backup functions
 */
export declare const backup: {
    recoveryServicesVault: typeof recoveryServicesVault;
    backupPolicy: typeof backupPolicy;
    enableVMBackup: typeof enableVMBackup;
    BackupPresets: {
        /**
         * Development: 7 days daily retention, 2-day instant restore
         */
        development: (vaultName: string) => BackupPolicyConfig;
        /**
         * Production: 30 days daily, 12 weeks weekly, 12 months monthly, 5-day instant restore
         */
        production: (vaultName: string) => BackupPolicyConfig;
        /**
         * Long-term: 90 days daily, 52 weeks weekly, 60 months monthly, 7 years yearly
         */
        longTerm: (vaultName: string) => BackupPolicyConfig;
    };
    estimateBackupStorage: typeof estimateBackupStorage;
    validateBackupPolicy: typeof validateBackupPolicy;
    backupBestPractices: typeof backupBestPractices;
};
