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
/**
 * Backup policy preset types
 */
export declare enum BackupPolicyPreset {
    Development = "development",
    Production = "production",
    LongTerm = "longterm",
    Custom = "custom"
}
/**
 * Backup frequency options
 */
export declare enum BackupFrequency {
    Daily = "Daily",
    Weekly = "Weekly"
}
/**
 * Day of week for backup scheduling
 */
export declare enum DayOfWeek {
    Sunday = "Sunday",
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday"
}
/**
 * Recovery Services Vault SKU
 */
export declare enum VaultSku {
    Standard = "RS0",// Standard SKU for Recovery Services
    Premium = "RS0"
}
/**
 * Backup policy retention configuration
 */
export interface RetentionPolicy {
    /** Daily retention in days (7-9999) */
    dailyRetentionDays?: number;
    /** Weekly retention in weeks (1-5163) */
    weeklyRetentionWeeks?: number;
    /** Days of week for weekly backup */
    weeklyRetentionDays?: DayOfWeek[];
    /** Monthly retention in months (1-1188) */
    monthlyRetentionMonths?: number;
    /** Week of month for monthly backup (First, Second, Third, Fourth, Last) */
    monthlyRetentionWeek?: string;
    /** Day of week for monthly backup */
    monthlyRetentionDay?: DayOfWeek;
    /** Yearly retention in years (1-99) */
    yearlyRetentionYears?: number;
    /** Months of year for yearly backup */
    yearlyRetentionMonths?: string[];
    /** Week of month for yearly backup */
    yearlyRetentionWeek?: string;
    /** Day of week for yearly backup */
    yearlyRetentionDay?: DayOfWeek;
}
/**
 * Instant restore settings
 */
export interface InstantRestoreSettings {
    /** Enable instant restore (snapshot retention) */
    enabled: boolean;
    /** Snapshot retention in days (1-5) */
    retentionDays: number;
}
/**
 * Backup schedule configuration
 */
export interface BackupSchedule {
    /** Backup frequency */
    frequency: BackupFrequency;
    /** Backup time in HH:MM format (24-hour) */
    time: string;
    /** Days of week for weekly backup */
    daysOfWeek?: DayOfWeek[];
}
/**
 * Complete backup policy configuration
 */
export interface BackupPolicyConfig {
    /** Policy name */
    name: string;
    /** Backup schedule */
    schedule: BackupSchedule;
    /** Retention policy */
    retention: RetentionPolicy;
    /** Instant restore settings */
    instantRestore: InstantRestoreSettings;
    /** Time zone for backup schedule (default: UTC) */
    timeZone?: string;
}
/**
 * Recovery Services Vault configuration
 */
export interface VaultConfiguration {
    /** Vault name (3-50 characters, alphanumeric and hyphens) */
    name: string;
    /** Azure region */
    location: string;
    /** Vault SKU */
    sku: VaultSku;
    /** Enable public network access */
    publicNetworkAccess: boolean;
    /** Resource tags */
    tags?: Record<string, string>;
}
/**
 * Backup configuration for a VM
 */
export interface BackupConfiguration {
    /** Enable backup for the VM */
    enabled: boolean;
    /** Recovery Services Vault name (existing or new) */
    vaultName: string;
    /** Create new vault or use existing */
    createVault: boolean;
    /** Vault configuration (required if createVault is true) */
    vaultConfig?: VaultConfiguration;
    /** Backup policy preset or custom */
    policyPreset: BackupPolicyPreset;
    /** Custom backup policy (required if policyPreset is Custom) */
    customPolicy?: BackupPolicyConfig;
    /** VM name to backup */
    vmName: string;
    /** Resource group name */
    resourceGroupName: string;
}
/**
 * Backup validation result
 */
export interface BackupValidationResult {
    /** Validation passed */
    isValid: boolean;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
    /** Recommendations */
    recommendations: string[];
}
/**
 * Backup cost estimation
 */
export interface BackupCostEstimate {
    /** Protected instance cost per month */
    protectedInstanceCost: number;
    /** Storage cost per month (based on VM disk size) */
    storageCost: number;
    /** Estimated total monthly cost */
    totalMonthlyCost: number;
    /** Estimated annual cost */
    totalAnnualCost: number;
    /** Cost breakdown notes */
    notes: string[];
}
/**
 * Preset backup policy specifications
 */
interface PresetPolicySpec {
    name: string;
    description: string;
    schedule: BackupSchedule;
    retention: RetentionPolicy;
    instantRestore: InstantRestoreSettings;
    estimatedMonthlyCostPer100GB: number;
}
/**
 * BackupManager - Manages Azure Backup configuration and ARM template generation
 */
export declare class BackupManager {
    /**
     * Preset backup policies with predefined configurations
     */
    private static readonly PRESET_POLICIES;
    /**
     * Azure Backup pricing constants (USD per month)
     */
    private static readonly PRICING;
    private config;
    constructor(config: BackupConfiguration);
    /**
     * Get preset policy specification
     */
    static getPresetPolicy(preset: BackupPolicyPreset): PresetPolicySpec;
    /**
     * Get all preset policies
     */
    static getAllPresets(): Record<BackupPolicyPreset, PresetPolicySpec>;
    /**
     * Validate backup configuration
     */
    validate(): BackupValidationResult;
    /**
     * Estimate backup costs
     */
    estimateCosts(vmDiskSizeGB: number): BackupCostEstimate;
    /**
     * Get ARM template parameters for backup
     */
    getTemplateParameters(): Record<string, any>;
    /**
     * Get ARM template variables for backup
     */
    getTemplateVariables(): Record<string, any>;
    /**
     * Generate Recovery Services Vault ARM resource
     */
    getVaultResource(): Record<string, any> | null;
    /**
     * Generate backup policy ARM resource
     */
    getBackupPolicyResource(): Record<string, any>;
    /**
     * Build retention policy object for ARM template
     */
    private buildRetentionPolicy;
    /**
     * Generate protected item ARM resource (enables backup on VM)
     */
    getProtectedItemResource(): Record<string, any>;
    /**
     * Check if backup configuration is marketplace compliant
     */
    isMarketplaceCompliant(): {
        compliant: boolean;
        issues: string[];
    };
}
/**
 * Helper function to create backup configuration from CLI options
 */
export declare function createBackupConfiguration(options: {
    enabled?: boolean;
    vaultName: string;
    createVault?: boolean;
    vaultLocation?: string;
    policyPreset?: string;
    vmName: string;
    resourceGroupName: string;
    customRetention?: {
        daily?: number;
        weekly?: number;
        monthly?: number;
        yearly?: number;
    };
}): BackupConfiguration;
/**
 * Generate complete ARM template for backup configuration
 */
export declare function generateBackupTemplate(config: BackupConfiguration): Record<string, any>;
export {};
