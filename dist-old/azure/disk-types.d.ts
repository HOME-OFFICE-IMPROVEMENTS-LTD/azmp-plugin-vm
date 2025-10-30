/**
 * Azure Managed Disk Type Configuration Module
 *
 * Provides disk type selection and configuration for Azure VMs, supporting:
 * - Standard HDD (Standard_LRS)
 * - Standard SSD (StandardSSD_LRS, StandardSSD_ZRS)
 * - Premium SSD (Premium_LRS, Premium_ZRS)
 * - Premium SSD v2 (PremiumV2_LRS)
 * - Ultra Disk (UltraSSD_LRS)
 *
 * Features:
 * - Disk type validation and compatibility checking
 * - Performance tier selection for Premium SSD
 * - ARM template generation
 * - Cost estimation integration
 * - Marketplace compliance validation
 *
 * @module azure/disk-types
 */
/**
 * Azure Managed Disk Storage Account Types
 */
export declare enum DiskStorageAccountType {
    StandardHDD = "Standard_LRS",
    StandardSSD = "StandardSSD_LRS",
    StandardSSDZRS = "StandardSSD_ZRS",
    PremiumSSD = "Premium_LRS",
    PremiumSSDZRS = "Premium_ZRS",
    PremiumV2 = "PremiumV2_LRS",
    UltraSSD = "UltraSSD_LRS"
}
/**
 * Disk type categories for UI grouping
 */
export declare enum DiskCategory {
    Performance = "Performance",
    Balanced = "Balanced",
    CostOptimized = "Cost-Optimized",
    HighAvailability = "High Availability"
}
/**
 * Premium SSD Performance Tiers (size-independent performance)
 */
export declare enum PremiumSSDPerformanceTier {
    P1 = "P1",
    P2 = "P2",
    P3 = "P3",
    P4 = "P4",
    P6 = "P6",
    P10 = "P10",
    P15 = "P15",
    P20 = "P20",
    P30 = "P30",
    P40 = "P40",
    P50 = "P50",
    P60 = "P60",
    P70 = "P70",
    P80 = "P80"
}
/**
 * Disk caching options
 */
export declare enum DiskCaching {
    None = "None",
    ReadOnly = "ReadOnly",
    ReadWrite = "ReadWrite"
}
/**
 * Disk type metadata
 */
export interface DiskTypeInfo {
    type: DiskStorageAccountType;
    category: DiskCategory;
    label: string;
    description: string;
    estimatedCostPerGBMonth: number;
    maxIOPS: number;
    maxThroughputMBps: number;
    requiresPremiumVM: boolean;
    requiresZoneSupport: boolean;
    supportedCaching: DiskCaching[];
    minSizeGB: number;
    maxSizeGB: number;
}
/**
 * Performance tier specifications for Premium SSD
 */
export interface PerformanceTierSpec {
    tier: PremiumSSDPerformanceTier;
    minDiskSizeGB: number;
    maxDiskSizeGB: number;
    iops: number;
    throughputMBps: number;
}
/**
 * Disk configuration for a VM
 */
export interface DiskConfiguration {
    osDiskType: DiskStorageAccountType;
    osDiskSizeGB?: number;
    osDiskCaching?: DiskCaching;
    osDiskPerformanceTier?: PremiumSSDPerformanceTier;
    dataDiskType?: DiskStorageAccountType;
    dataDisks?: DataDiskConfig[];
    enableUltraSSD?: boolean;
}
/**
 * Data disk configuration
 */
export interface DataDiskConfig {
    name: string;
    sizeGB: number;
    storageAccountType: DiskStorageAccountType;
    caching: DiskCaching;
    lun: number;
    createOption: 'Empty' | 'Attach' | 'FromImage';
    performanceTier?: PremiumSSDPerformanceTier;
}
/**
 * Disk validation result
 */
export interface DiskValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
}
/**
 * Disk Type Manager
 *
 * Manages disk type selection, validation, and ARM template generation
 */
export declare class DiskTypeManager {
    private config;
    /**
     * Disk type metadata registry
     */
    private static readonly DISK_TYPES;
    /**
     * Premium SSD performance tier specifications
     */
    private static readonly PERFORMANCE_TIERS;
    constructor(config: DiskConfiguration);
    /**
     * Get disk type information
     */
    static getDiskTypeInfo(type: DiskStorageAccountType): DiskTypeInfo;
    /**
     * Get all available disk types
     */
    static getAllDiskTypes(): DiskTypeInfo[];
    /**
     * Get disk types by category
     */
    static getDiskTypesByCategory(category: DiskCategory): DiskTypeInfo[];
    /**
     * Get performance tier specification
     */
    static getPerformanceTier(tier: PremiumSSDPerformanceTier): PerformanceTierSpec;
    /**
     * Get all performance tiers
     */
    static getAllPerformanceTiers(): PerformanceTierSpec[];
    /**
     * Get recommended performance tier for disk size
     */
    static getRecommendedPerformanceTier(diskSizeGB: number): PremiumSSDPerformanceTier;
    /**
     * Check if VM size supports premium storage
     * Handles both legacy (DS/ES/FS/GS/LS/MS series) and modern ('s' suffix before version: D4s_v3, E8s_v3)
     */
    static isPremiumCapableVMSize(vmSize: string): boolean;
    /**
     * Check if disk type requires premium-capable VM
     */
    static requiresPremiumVM(diskType: DiskStorageAccountType): boolean;
    /**
     * Check if disk type requires zone support
     */
    static requiresZoneSupport(diskType: DiskStorageAccountType): boolean;
    /**
     * Get recommended caching for disk type
     */
    static getRecommendedCaching(diskType: DiskStorageAccountType, isOSDisk: boolean): DiskCaching;
    /**
     * Validate disk configuration
     */
    validate(vmSize?: string, location?: string): DiskValidationResult;
    /**
     * Generate ARM template parameters for disk configuration
     */
    getTemplateParameters(): Record<string, any>;
    /**
     * Generate ARM template variables for disk configuration
     */
    getTemplateVariables(): Record<string, any>;
    /**
     * Generate OS disk configuration for VM resource
     */
    getOSDiskConfig(): Record<string, any>;
    /**
     * Generate data disks array for VM resource
     */
    getDataDisksArray(): any[];
    /**
     * Generate complete storage profile for VM resource
     */
    getStorageProfile(): Record<string, any>;
    /**
     * Check if configuration is marketplace compliant
     */
    isMarketplaceCompliant(): {
        compliant: boolean;
        issues: string[];
    };
}
/**
 * Helper function to create disk configuration from CLI options
 */
export declare function createDiskConfiguration(options: {
    osDiskType: string;
    osDiskSize?: number;
    osDiskCaching?: string;
    osDiskPerformanceTier?: string;
    dataDiskType?: string;
    dataDiskCount?: number;
    dataDiskSize?: number;
    enableUltraSSD?: boolean;
}): DiskConfiguration;
/**
 * Helper function to generate complete ARM template for disk configuration
 */
export declare function generateDiskTemplate(config: DiskConfiguration): any;
