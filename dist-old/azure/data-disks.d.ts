/**
 * Azure Data Disk Configuration Module
 *
 * Provides data disk configuration and management for Azure VMs, supporting:
 * - Multiple data disks (0-32 per VM)
 * - Disk size configuration (4 GB - 32 TB)
 * - Disk type selection (reusing P1-1 DiskTypeManager)
 * - Caching mode configuration
 * - Preset configurations for common workloads
 * - VM size limit validation
 * - Cost and performance estimation
 * - ARM template generation
 *
 * Features:
 * - 5 preset configurations (Database, Logs, AppData, HighPerformance, Archive)
 * - Validation against VM size limits (maxDataDiskCount, IOPS, throughput)
 * - Integration with P1-1 DiskTypeManager for pricing/performance
 * - Actionable error messages with limits and recommendations
 * - ARM template copy loop generation
 *
 * @module azure/data-disks
 */
import { DiskStorageAccountType } from './disk-types';
/**
 * Data disk caching modes
 * - None: No caching (best for write-heavy workloads like logs)
 * - ReadOnly: Read caching only (best for databases, read-heavy workloads)
 * - ReadWrite: Read and write caching (best for application data)
 */
export declare enum DiskCaching {
    None = "None",
    ReadOnly = "ReadOnly",
    ReadWrite = "ReadWrite"
}
/**
 * Predefined data disk configuration presets
 */
export declare enum DataDiskPreset {
    Database = "database",
    Logs = "logs",
    AppData = "appdata",
    HighPerformance = "highperformance",
    Archive = "archive",
    Custom = "custom"
}
/**
 * Workload types for caching recommendations
 */
export declare enum WorkloadType {
    Database = "database",
    Logs = "logs",
    Application = "application",
    Analytics = "analytics",
    Archive = "archive"
}
/**
 * Disk override for individual disk customization
 */
export interface DiskOverride {
    /** Which disk to override (0-based index) */
    matchIndex: number;
    /** Override disk size (optional) */
    sizeGB?: number;
    /** Override disk type (optional) */
    type?: DiskStorageAccountType;
    /** Override caching mode (optional) */
    caching?: DiskCaching;
    /** Override LUN (optional, otherwise auto-assigned) */
    lun?: number;
    /** Custom disk name (optional, otherwise auto-generated) */
    name?: string;
}
/**
 * Multi-disk configuration with shared settings
 */
export interface DataDisksConfiguration {
    /** VM name (for disk naming) */
    vmName: string;
    /** Resource group name */
    resourceGroup: string;
    /** Target VM size (REQUIRED for validation) */
    vmSize: string;
    /** Azure region (optional, defaults to 'eastus') */
    location?: string;
    /** Number of data disks (0-32) */
    diskCount: number;
    /** Shared disk size in GB (applies to all disks unless overridden) */
    diskSizeGB: number;
    /** Shared disk type (applies to all disks unless overridden) */
    diskType: DiskStorageAccountType;
    /** Shared caching mode (applies to all disks unless overridden) */
    caching: DiskCaching;
    /** Starting LUN number (default: 0) */
    lunStart?: number;
    /** Individual disk overrides (for advanced scenarios) */
    diskOverrides?: DiskOverride[];
    /** Preset used (if any) */
    preset?: DataDiskPreset;
}
/**
 * Validation result with actionable error messages
 */
export interface DataDiskValidationResult {
    /** Overall validation status */
    valid: boolean;
    /** Validation errors (blocking issues) */
    errors: string[];
    /** Validation warnings (non-blocking) */
    warnings: string[];
    /** VM size limits for context */
    vmLimits?: {
        maxDataDiskCount: number;
        maxIOPS: number;
        maxThroughputMBps: number;
    };
    /** Calculated IOPS/throughput for current config */
    calculated?: {
        totalIOPS: number;
        totalThroughputMBps: number;
    };
}
/**
 * Cost estimate breakdown
 */
export interface DataDiskCostEstimate {
    /** Cost per disk per month */
    costPerDiskMonthly: number;
    /** Total cost for all disks per month */
    totalMonthlyCost: number;
    /** Total cost for all disks per year */
    totalAnnualCost: number;
    /** Cost breakdown by disk type */
    breakdown: {
        diskType: DiskStorageAccountType;
        diskCount: number;
        sizeGB: number;
        pricePerGBMonth: number;
        subtotalMonthly: number;
    }[];
}
/**
 * Performance characteristics
 */
export interface DataDiskPerformance {
    /** Total IOPS for all data disks */
    totalIOPS: number;
    /** Total throughput in MB/s */
    totalThroughputMBps: number;
    /** Per-disk IOPS (array) */
    perDiskIOPS: number[];
    /** Per-disk throughput in MB/s (array) */
    perDiskThroughputMBps: number[];
    /** Performance tier (based on disk types) */
    performanceTier: 'Standard' | 'Premium' | 'Ultra';
}
/**
 * Preset specification
 */
export interface PresetSpecification {
    /** Preset key */
    preset: DataDiskPreset;
    /** Display name */
    name: string;
    /** Description */
    description: string;
    /** Use case examples */
    useCase: string;
    /** Disk count */
    diskCount: number;
    /** Disk size in GB */
    diskSizeGB: number;
    /** Disk type */
    diskType: DiskStorageAccountType;
    /** Caching mode */
    caching: DiskCaching;
    /** Minimum VM size required (optional) */
    minVmSize?: string;
    /** Minimum disk slots required */
    minDiskSlots: number;
    /** Estimated monthly cost per VM */
    estimatedMonthlyCost: number;
}
/**
 * DataDiskManager - Manages Azure data disk configuration and ARM template generation
 */
export declare class DataDiskManager {
    private config;
    /**
     * Preset data disk configurations with predefined settings
     */
    static readonly DATA_DISK_PRESETS: Record<DataDiskPreset, PresetSpecification>;
    constructor(config: DataDisksConfiguration);
    /**
     * Get all available data disk presets
     * @returns Array of preset specifications with costs
     */
    static getAllPresets(): PresetSpecification[];
    /**
     * Get specific preset configuration
     * @param preset - Preset key
     * @returns Preset specification or null if not found
     */
    static getPreset(preset: DataDiskPreset): PresetSpecification | null;
    /**
     * Get recommended preset based on workload type
     * @param workloadType - Type of workload
     * @param vmSize - Target VM size
     * @returns Recommended preset key
     */
    static getRecommendedPreset(workloadType: WorkloadType, vmSize: string): DataDiskPreset;
    /**
     * Get recommended caching mode for workload
     * @param workloadType - Type of workload
     * @returns Recommended caching mode
     */
    static getRecommendedCaching(workloadType: WorkloadType): DiskCaching;
    /**
     * Get maximum data disks for VM size
     * @param vmSize - VM size (e.g., 'Standard_D4s_v3')
     * @returns Max data disk count (default: 4 if unknown)
     */
    static getMaxDataDisks(vmSize: string): number;
    /**
     * Validate disk size range
     * @param sizeGB - Disk size in GB
     * @returns True if valid (4-32767 GB)
     */
    static isValidDiskSize(sizeGB: number): boolean;
    /**
     * Validate LUN range
     * @param lun - Logical Unit Number
     * @returns True if valid (0-63)
     */
    static isValidLun(lun: number): boolean;
    /**
     * Get VM size category for premium capability check
     * @param vmSize - VM size name
     * @returns True if VM supports premium disks
     */
    static isPremiumCapable(vmSize: string): boolean;
    /**
     * Validate data disk configuration against VM limits
     * @returns Validation result with actionable errors
     *
     * Validation Rules:
     * 1. Disk count ≤ VM maxDataDiskCount
     * 2. All disk sizes in valid range (4-32767 GB)
     * 3. All LUNs unique and in valid range (0-63)
     * 4. Total IOPS ≤ VM max IOPS (warning)
     * 5. Total throughput ≤ VM max throughput (warning)
     * 6. Disk type compatible with VM size (Premium requires premium-capable VM)
     * 7. LUN assignments don't conflict
     */
    validate(): DataDiskValidationResult;
    /**
     * Calculate cost estimate using DiskTypeManager pricing
     * @returns Cost breakdown for all data disks
     */
    estimateCosts(): DataDiskCostEstimate;
    /**
     * Calculate performance characteristics
     * @returns IOPS and throughput totals using DiskTypeManager
     */
    calculatePerformance(): DataDiskPerformance;
    /**
     * Get ARM template parameters for data disks
     * @returns Parameter definitions object
     */
    getTemplateParameters(): Record<string, any>;
    /**
     * Get ARM template variables for data disks
     * @returns Variable definitions object
     */
    getTemplateVariables(): Record<string, any>;
    /**
     * Get data disk resources for VM storageProfile.dataDisks array
     * @returns Array of disk definitions with copy properties
     *
     * Returns format compatible with ARM template storageProfile:
     * For multiple disks: single object with copy property
     * For single disk: object without copy property
     */
    getDataDiskResources(): any[];
    /**
     * Get complete storage profile (OS disk + data disks)
     * @param osDiskConfig - OS disk configuration
     * @returns Complete storage profile object
     */
    getStorageProfile(osDiskConfig: any): any;
    /**
     * Get VM size limits
     */
    private getVmLimits;
    /**
     * Get assigned LUNs for all disks
     */
    private getAssignedLuns;
    /**
     * Check if any disks use Premium tier
     */
    private usesPremiumDisks;
    /**
     * Get disk configuration for specific index (applying overrides)
     */
    private getDiskConfig;
    /**
     * Group disks by type for cost calculation
     */
    private groupDisksByType;
    /**
     * Get price per GB per month for disk type
     */
    private getPricePerGBMonth;
    /**
     * Get disk performance (IOPS and throughput)
     */
    private getDiskPerformance;
    /**
     * Determine performance tier based on disk types
     */
    private determinePerformanceTier;
}
/**
 * Create data disk configuration from CLI options
 * @param options - Commander parsed options
 * @returns DataDisksConfiguration object
 */
export declare function createDataDiskConfiguration(options: any): DataDisksConfiguration;
/**
 * Generate complete ARM template with data disks
 * @param config - Data disk configuration
 * @returns Complete ARM template JSON
 */
export declare function generateDataDiskTemplate(config: DataDisksConfiguration): any;
