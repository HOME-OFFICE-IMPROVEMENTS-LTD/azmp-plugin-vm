"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDiskManager = exports.WorkloadType = exports.DataDiskPreset = exports.DiskCaching = void 0;
exports.createDataDiskConfiguration = createDataDiskConfiguration;
exports.generateDataDiskTemplate = generateDataDiskTemplate;
const disk_types_1 = require("./disk-types");
/**
 * Data disk caching modes
 * - None: No caching (best for write-heavy workloads like logs)
 * - ReadOnly: Read caching only (best for databases, read-heavy workloads)
 * - ReadWrite: Read and write caching (best for application data)
 */
var DiskCaching;
(function (DiskCaching) {
    DiskCaching["None"] = "None";
    DiskCaching["ReadOnly"] = "ReadOnly";
    DiskCaching["ReadWrite"] = "ReadWrite";
})(DiskCaching || (exports.DiskCaching = DiskCaching = {}));
/**
 * Predefined data disk configuration presets
 */
var DataDiskPreset;
(function (DataDiskPreset) {
    DataDiskPreset["Database"] = "database";
    DataDiskPreset["Logs"] = "logs";
    DataDiskPreset["AppData"] = "appdata";
    DataDiskPreset["HighPerformance"] = "highperformance";
    DataDiskPreset["Archive"] = "archive";
    DataDiskPreset["Custom"] = "custom";
})(DataDiskPreset || (exports.DataDiskPreset = DataDiskPreset = {}));
/**
 * Workload types for caching recommendations
 */
var WorkloadType;
(function (WorkloadType) {
    WorkloadType["Database"] = "database";
    WorkloadType["Logs"] = "logs";
    WorkloadType["Application"] = "application";
    WorkloadType["Analytics"] = "analytics";
    WorkloadType["Archive"] = "archive";
})(WorkloadType || (exports.WorkloadType = WorkloadType = {}));
/**
 * DataDiskManager - Manages Azure data disk configuration and ARM template generation
 */
class DataDiskManager {
    config;
    /**
     * Preset data disk configurations with predefined settings
     */
    static DATA_DISK_PRESETS = {
        [DataDiskPreset.Database]: {
            preset: DataDiskPreset.Database,
            name: 'Database',
            description: 'Optimized for database workloads (SQL Server, PostgreSQL, MySQL)',
            useCase: 'Production databases, OLTP workloads, read-heavy applications',
            diskCount: 4,
            diskSizeGB: 1024,
            diskType: disk_types_1.DiskStorageAccountType.PremiumSSD,
            caching: DiskCaching.ReadOnly,
            minDiskSlots: 4,
            estimatedMonthlyCost: 614 // 4 x 1TB Premium SSD @ $153.60/month
        },
        [DataDiskPreset.Logs]: {
            preset: DataDiskPreset.Logs,
            name: 'Logs',
            description: 'Optimized for log file storage and write-heavy workloads',
            useCase: 'Application logs, transaction logs, telemetry data',
            diskCount: 2,
            diskSizeGB: 512,
            diskType: disk_types_1.DiskStorageAccountType.StandardSSD,
            caching: DiskCaching.None,
            minDiskSlots: 2,
            estimatedMonthlyCost: 77 // 2 x 512GB Standard SSD @ $38.40/month
        },
        [DataDiskPreset.AppData]: {
            preset: DataDiskPreset.AppData,
            name: 'Application Data',
            description: 'Balanced configuration for application data and file storage',
            useCase: 'Application files, user data, content storage',
            diskCount: 2,
            diskSizeGB: 256,
            diskType: disk_types_1.DiskStorageAccountType.StandardSSD,
            caching: DiskCaching.ReadWrite,
            minDiskSlots: 2,
            estimatedMonthlyCost: 38 // 2 x 256GB Standard SSD @ $19.20/month
        },
        [DataDiskPreset.HighPerformance]: {
            preset: DataDiskPreset.HighPerformance,
            name: 'High Performance',
            description: 'Maximum performance for I/O intensive workloads',
            useCase: 'Analytics, big data processing, high-performance computing',
            diskCount: 8,
            diskSizeGB: 2048,
            diskType: disk_types_1.DiskStorageAccountType.PremiumSSD,
            caching: DiskCaching.ReadOnly,
            minDiskSlots: 8,
            estimatedMonthlyCost: 2458 // 8 x 2TB Premium SSD @ $307.20/month
        },
        [DataDiskPreset.Archive]: {
            preset: DataDiskPreset.Archive,
            name: 'Archive',
            description: 'Cost-optimized for long-term data retention',
            useCase: 'Backups, archives, infrequently accessed data',
            diskCount: 1,
            diskSizeGB: 4096,
            diskType: disk_types_1.DiskStorageAccountType.StandardHDD,
            caching: DiskCaching.None,
            minDiskSlots: 1,
            estimatedMonthlyCost: 77 // 1 x 4TB Standard HDD @ $76.80/month
        },
        [DataDiskPreset.Custom]: {
            preset: DataDiskPreset.Custom,
            name: 'Custom',
            description: 'Build your own data disk configuration',
            useCase: 'Custom requirements not covered by presets',
            diskCount: 0,
            diskSizeGB: 128,
            diskType: disk_types_1.DiskStorageAccountType.StandardSSD,
            caching: DiskCaching.ReadOnly,
            minDiskSlots: 0,
            estimatedMonthlyCost: 0
        }
    };
    constructor(config) {
        this.config = {
            ...config,
            location: config.location || 'eastus', // Default to eastus
            lunStart: config.lunStart ?? 0
        };
    }
    // ==========================================================================
    // STATIC METHODS (Presets & Utilities)
    // ==========================================================================
    /**
     * Get all available data disk presets
     * @returns Array of preset specifications with costs
     */
    static getAllPresets() {
        return Object.values(DataDiskManager.DATA_DISK_PRESETS)
            .filter(p => p.preset !== DataDiskPreset.Custom);
    }
    /**
     * Get specific preset configuration
     * @param preset - Preset key
     * @returns Preset specification or null if not found
     */
    static getPreset(preset) {
        return DataDiskManager.DATA_DISK_PRESETS[preset] || null;
    }
    /**
     * Get recommended preset based on workload type
     * @param workloadType - Type of workload
     * @param vmSize - Target VM size
     * @returns Recommended preset key
     */
    static getRecommendedPreset(workloadType, vmSize) {
        const maxDisks = DataDiskManager.getMaxDataDisks(vmSize);
        switch (workloadType) {
            case WorkloadType.Database:
                return maxDisks >= 4 ? DataDiskPreset.Database : DataDiskPreset.AppData;
            case WorkloadType.Logs:
                return DataDiskPreset.Logs;
            case WorkloadType.Application:
                return DataDiskPreset.AppData;
            case WorkloadType.Analytics:
                return maxDisks >= 8 ? DataDiskPreset.HighPerformance : DataDiskPreset.Database;
            case WorkloadType.Archive:
                return DataDiskPreset.Archive;
            default:
                return DataDiskPreset.AppData;
        }
    }
    /**
     * Get recommended caching mode for workload
     * @param workloadType - Type of workload
     * @returns Recommended caching mode
     */
    static getRecommendedCaching(workloadType) {
        switch (workloadType) {
            case WorkloadType.Database:
            case WorkloadType.Analytics:
                return DiskCaching.ReadOnly; // Read-heavy, protect writes
            case WorkloadType.Logs:
            case WorkloadType.Archive:
                return DiskCaching.None; // Write-heavy or sequential access
            case WorkloadType.Application:
                return DiskCaching.ReadWrite; // Balanced read/write
            default:
                return DiskCaching.ReadOnly;
        }
    }
    /**
     * Get maximum data disks for VM size
     * @param vmSize - VM size (e.g., 'Standard_D4s_v3')
     * @returns Max data disk count (default: 4 if unknown)
     */
    static getMaxDataDisks(vmSize) {
        // Static VM size lookup table (subset of common sizes)
        // For full list, integrate with compute.ts dynamically
        const VM_SIZES = {
            // B-series (Burstable)
            'Standard_B1s': 2,
            'Standard_B1ms': 2,
            'Standard_B2s': 4,
            'Standard_B2ms': 4,
            'Standard_B4ms': 8,
            'Standard_B8ms': 16,
            'Standard_B12ms': 16,
            'Standard_B16ms': 32,
            'Standard_B20ms': 32,
            // D-series v3 (General Purpose)
            'Standard_D2s_v3': 4,
            'Standard_D4s_v3': 8,
            'Standard_D8s_v3': 16,
            'Standard_D16s_v3': 32,
            'Standard_D32s_v3': 32,
            'Standard_D48s_v3': 32,
            'Standard_D64s_v3': 32,
            // E-series v3 (Memory Optimized)
            'Standard_E2s_v3': 4,
            'Standard_E4s_v3': 8,
            'Standard_E8s_v3': 16,
            'Standard_E16s_v3': 32,
            'Standard_E32s_v3': 32,
            'Standard_E48s_v3': 32,
            'Standard_E64s_v3': 32,
            // F-series v2 (Compute Optimized)
            'Standard_F2s_v2': 4,
            'Standard_F4s_v2': 8,
            'Standard_F8s_v2': 16,
            'Standard_F16s_v2': 32,
            'Standard_F32s_v2': 32,
            'Standard_F48s_v2': 32,
            'Standard_F64s_v2': 32,
            // M-series (Large Memory)
            'Standard_M8ms': 8,
            'Standard_M16ms': 16,
            'Standard_M32ms': 32,
            'Standard_M64ms': 32,
            'Standard_M128ms': 32
        };
        return VM_SIZES[vmSize] || 4; // Default to 4 if unknown
    }
    /**
     * Validate disk size range
     * @param sizeGB - Disk size in GB
     * @returns True if valid (4-32767 GB)
     */
    static isValidDiskSize(sizeGB) {
        return sizeGB >= 4 && sizeGB <= 32767;
    }
    /**
     * Validate LUN range
     * @param lun - Logical Unit Number
     * @returns True if valid (0-63)
     */
    static isValidLun(lun) {
        return lun >= 0 && lun <= 63;
    }
    /**
     * Get VM size category for premium capability check
     * @param vmSize - VM size name
     * @returns True if VM supports premium disks
     */
    static isPremiumCapable(vmSize) {
        // Check legacy premium series (v1 generation)
        // These use series names directly in the SKU: DS-series, ES-series, etc.
        const legacyPremiumSeries = ['DS', 'ES', 'FS', 'GS', 'LS', 'MS', 'NV', 'NC'];
        for (const series of legacyPremiumSeries) {
            if (vmSize.includes(series)) {
                return true;
            }
        }
        // Modern VMs (v2+): premium-capable VMs have 's' suffix before version
        // Examples: Standard_D4s_v3, Standard_E8s_v3, Standard_B4ms, Standard_F16s_v2
        // Non-premium: Standard_D4_v3, Standard_E8_v3 (no 's' suffix)
        // Pattern: ends with 's_v[digit]+' or just 's' at the end
        return /s(_v\d+)?$/.test(vmSize);
    }
    // ==========================================================================
    // INSTANCE METHODS (Validation & Generation)
    // ==========================================================================
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
    validate() {
        const errors = [];
        const warnings = [];
        // 1. Get VM size limits
        const vmLimits = this.getVmLimits();
        // 2. Check disk count vs VM limit
        if (this.config.diskCount > vmLimits.maxDataDiskCount) {
            errors.push(`Disk count (${this.config.diskCount}) exceeds VM limit for '${this.config.vmSize}' (max: ${vmLimits.maxDataDiskCount} disks). ` +
                `Reduce disk count or choose a larger VM size.`);
        }
        // 3. Validate default disk size
        if (!DataDiskManager.isValidDiskSize(this.config.diskSizeGB)) {
            errors.push(`Default disk size (${this.config.diskSizeGB} GB) is invalid. Must be 4-32767 GB.`);
        }
        // 4. Validate disk overrides
        if (this.config.diskOverrides && this.config.diskOverrides.length > 0) {
            for (const override of this.config.diskOverrides) {
                // Check override index
                if (override.matchIndex < 0 || override.matchIndex >= this.config.diskCount) {
                    errors.push(`Override matchIndex ${override.matchIndex} is out of range (0-${this.config.diskCount - 1}).`);
                }
                // Check override disk size
                if (override.sizeGB && !DataDiskManager.isValidDiskSize(override.sizeGB)) {
                    errors.push(`Override disk size (${override.sizeGB} GB) at index ${override.matchIndex} is invalid. Must be 4-32767 GB.`);
                }
                // Check override LUN
                if (override.lun !== undefined && !DataDiskManager.isValidLun(override.lun)) {
                    errors.push(`Override LUN ${override.lun} at index ${override.matchIndex} is invalid. Must be 0-63.`);
                }
            }
        }
        // 5. Validate LUN assignments
        const luns = this.getAssignedLuns();
        const uniqueLuns = new Set(luns);
        if (luns.length !== uniqueLuns.size) {
            const duplicates = luns.filter((lun, idx) => luns.indexOf(lun) !== idx);
            errors.push(`Duplicate LUN assignments detected: ${[...new Set(duplicates)].join(', ')}. ` +
                `Ensure all disks have unique LUN numbers.`);
        }
        // 6. Check IOPS/throughput limits (warnings only)
        const performance = this.calculatePerformance();
        if (performance.totalIOPS > vmLimits.maxIOPS) {
            warnings.push(`Total IOPS (${performance.totalIOPS.toLocaleString()}) exceeds VM limit (${vmLimits.maxIOPS.toLocaleString()}). ` +
                `Performance may be throttled. Consider reducing disk count or using lower-tier disks.`);
        }
        if (performance.totalThroughputMBps > vmLimits.maxThroughputMBps) {
            warnings.push(`Total throughput (${performance.totalThroughputMBps} MB/s) exceeds VM limit (${vmLimits.maxThroughputMBps} MB/s). ` +
                `Performance may be throttled.`);
        }
        // 7. Check Premium disk compatibility
        if (this.usesPremiumDisks() && !DataDiskManager.isPremiumCapable(this.config.vmSize)) {
            errors.push(`VM size '${this.config.vmSize}' does not support Premium disks. ` +
                `Choose a premium-capable VM (e.g., DS, ES, FS series) or use Standard/StandardSSD disks.`);
        }
        // 8. Warnings for best practices
        if (this.config.diskCount > 16) {
            warnings.push(`Using ${this.config.diskCount} data disks may impact VM boot time. ` +
                `Consider disk striping (RAID) to consolidate disks.`);
        }
        if (this.config.diskCount === 0) {
            warnings.push(`No data disks configured. VM will only have OS disk. ` +
                `Consider adding data disks for application data separation.`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            vmLimits,
            calculated: {
                totalIOPS: performance.totalIOPS,
                totalThroughputMBps: performance.totalThroughputMBps
            }
        };
    }
    /**
     * Calculate cost estimate using DiskTypeManager pricing
     * @returns Cost breakdown for all data disks
     */
    estimateCosts() {
        if (this.config.diskCount === 0) {
            return {
                costPerDiskMonthly: 0,
                totalMonthlyCost: 0,
                totalAnnualCost: 0,
                breakdown: []
            };
        }
        // Group disks by type for cost calculation
        const disksByType = this.groupDisksByType();
        const breakdown = [];
        let totalMonthlyCost = 0;
        for (const [diskType, disks] of Object.entries(disksByType)) {
            const diskCount = disks.length;
            const avgSizeGB = disks.reduce((sum, d) => sum + d.sizeGB, 0) / diskCount;
            // Get pricing from DiskTypeManager
            const pricePerGBMonth = this.getPricePerGBMonth(diskType);
            const subtotalMonthly = diskCount * avgSizeGB * pricePerGBMonth;
            breakdown.push({
                diskType: diskType,
                diskCount,
                sizeGB: Math.round(avgSizeGB),
                pricePerGBMonth,
                subtotalMonthly
            });
            totalMonthlyCost += subtotalMonthly;
        }
        const costPerDiskMonthly = totalMonthlyCost / this.config.diskCount;
        return {
            costPerDiskMonthly,
            totalMonthlyCost,
            totalAnnualCost: totalMonthlyCost * 12,
            breakdown
        };
    }
    /**
     * Calculate performance characteristics
     * @returns IOPS and throughput totals using DiskTypeManager
     */
    calculatePerformance() {
        const perDiskIOPS = [];
        const perDiskThroughputMBps = [];
        let totalIOPS = 0;
        let totalThroughputMBps = 0;
        // Calculate performance for each disk
        for (let i = 0; i < this.config.diskCount; i++) {
            const disk = this.getDiskConfig(i);
            const { iops, throughputMBps } = this.getDiskPerformance(disk.type, disk.sizeGB);
            perDiskIOPS.push(iops);
            perDiskThroughputMBps.push(throughputMBps);
            totalIOPS += iops;
            totalThroughputMBps += throughputMBps;
        }
        // Determine performance tier
        const performanceTier = this.determinePerformanceTier();
        return {
            totalIOPS,
            totalThroughputMBps,
            perDiskIOPS,
            perDiskThroughputMBps,
            performanceTier
        };
    }
    /**
     * Get ARM template parameters for data disks
     * @returns Parameter definitions object
     */
    getTemplateParameters() {
        return {
            dataDiskCount: {
                type: 'int',
                defaultValue: this.config.diskCount,
                minValue: 0,
                maxValue: 32,
                metadata: {
                    description: 'Number of data disks to attach (0-32)'
                }
            },
            dataDiskSizeGB: {
                type: 'int',
                defaultValue: this.config.diskSizeGB,
                minValue: 4,
                maxValue: 32767,
                metadata: {
                    description: 'Size of each data disk in GB'
                }
            },
            dataDiskType: {
                type: 'string',
                defaultValue: this.config.diskType,
                allowedValues: [
                    'Standard_LRS',
                    'StandardSSD_LRS',
                    'StandardSSD_ZRS',
                    'Premium_LRS',
                    'Premium_ZRS',
                    'PremiumV2_LRS',
                    'UltraSSD_LRS'
                ],
                metadata: {
                    description: 'Data disk storage account type'
                }
            },
            dataDiskCaching: {
                type: 'string',
                defaultValue: this.config.caching,
                allowedValues: ['None', 'ReadOnly', 'ReadWrite'],
                metadata: {
                    description: 'Data disk caching mode'
                }
            }
        };
    }
    /**
     * Get ARM template variables for data disks
     * @returns Variable definitions object
     */
    getTemplateVariables() {
        return {
            dataDiskNamePrefix: `[concat(parameters('vmName'), '-datadisk-')]`,
            lunStart: this.config.lunStart || 0
        };
    }
    /**
     * Get data disk resources for VM storageProfile.dataDisks array
     * @returns Array of disk definitions with copy properties
     *
     * Returns format compatible with ARM template storageProfile:
     * For multiple disks: single object with copy property
     * For single disk: object without copy property
     */
    getDataDiskResources() {
        if (this.config.diskCount === 0) {
            return [];
        }
        const baseDisk = {
            lun: "[add(variables('lunStart'), copyIndex('dataDisks'))]",
            name: "[concat(variables('dataDiskNamePrefix'), copyIndex('dataDisks'))]",
            createOption: 'Empty',
            diskSizeGB: '[parameters("dataDiskSizeGB")]',
            managedDisk: {
                storageAccountType: '[parameters("dataDiskType")]'
            },
            caching: '[parameters("dataDiskCaching")]'
        };
        // If diskCount > 1, add copy property for loop expansion
        if (this.config.diskCount > 1) {
            return [{
                    copy: {
                        name: 'dataDisks',
                        count: '[parameters("dataDiskCount")]'
                    },
                    ...baseDisk
                }];
        }
        // Single disk: no copy needed
        return [baseDisk];
    }
    /**
     * Get complete storage profile (OS disk + data disks)
     * @param osDiskConfig - OS disk configuration
     * @returns Complete storage profile object
     */
    getStorageProfile(osDiskConfig) {
        const dataDisks = this.getDataDiskResources();
        const storageProfile = {
            imageReference: {
                publisher: '[parameters("imagePublisher")]',
                offer: '[parameters("imageOffer")]',
                sku: '[parameters("imageSku")]',
                version: 'latest'
            },
            osDisk: osDiskConfig
        };
        // Only add dataDisks if there are any
        if (dataDisks.length > 0) {
            storageProfile.dataDisks = dataDisks;
        }
        return storageProfile;
    }
    // ==========================================================================
    // PRIVATE HELPER METHODS
    // ==========================================================================
    /**
     * Get VM size limits
     */
    getVmLimits() {
        const maxDataDiskCount = DataDiskManager.getMaxDataDisks(this.config.vmSize);
        // Estimate IOPS/throughput limits based on VM size
        // These are approximations; real values vary by VM series
        const coreMatch = this.config.vmSize.match(/(\d+)/);
        const cores = coreMatch ? parseInt(coreMatch[1]) : 2;
        return {
            maxDataDiskCount,
            maxIOPS: cores * 2000, // Rough estimate: 2000 IOPS per core
            maxThroughputMBps: cores * 50 // Rough estimate: 50 MB/s per core
        };
    }
    /**
     * Get assigned LUNs for all disks
     */
    getAssignedLuns() {
        const luns = [];
        const lunStart = this.config.lunStart || 0;
        for (let i = 0; i < this.config.diskCount; i++) {
            // Check if this disk has an override LUN
            const override = this.config.diskOverrides?.find(o => o.matchIndex === i);
            const lun = override?.lun ?? (lunStart + i);
            luns.push(lun);
        }
        return luns;
    }
    /**
     * Check if any disks use Premium tier
     */
    usesPremiumDisks() {
        // Check default disk type
        if (this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumSSD ||
            this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumSSDZRS ||
            this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumV2) {
            return true;
        }
        // Check overrides
        if (this.config.diskOverrides) {
            return this.config.diskOverrides.some(override => override.type === disk_types_1.DiskStorageAccountType.PremiumSSD ||
                override.type === disk_types_1.DiskStorageAccountType.PremiumSSDZRS ||
                override.type === disk_types_1.DiskStorageAccountType.PremiumV2);
        }
        return false;
    }
    /**
     * Get disk configuration for specific index (applying overrides)
     */
    getDiskConfig(index) {
        const override = this.config.diskOverrides?.find(o => o.matchIndex === index);
        const lunStart = this.config.lunStart || 0;
        return {
            sizeGB: override?.sizeGB ?? this.config.diskSizeGB,
            type: override?.type ?? this.config.diskType,
            caching: override?.caching ?? this.config.caching,
            lun: override?.lun ?? (lunStart + index)
        };
    }
    /**
     * Group disks by type for cost calculation
     */
    groupDisksByType() {
        const groups = {};
        for (let i = 0; i < this.config.diskCount; i++) {
            const disk = this.getDiskConfig(i);
            if (!groups[disk.type]) {
                groups[disk.type] = [];
            }
            groups[disk.type].push({ sizeGB: disk.sizeGB, type: disk.type });
        }
        return groups;
    }
    /**
     * Get price per GB per month for disk type
     */
    getPricePerGBMonth(diskType) {
        // Approximate Azure pricing (as of 2024)
        const pricing = {
            [disk_types_1.DiskStorageAccountType.StandardHDD]: 0.019, // $0.019/GB/month
            [disk_types_1.DiskStorageAccountType.StandardSSD]: 0.075, // $0.075/GB/month
            [disk_types_1.DiskStorageAccountType.StandardSSDZRS]: 0.094, // $0.094/GB/month (ZRS premium)
            [disk_types_1.DiskStorageAccountType.PremiumSSD]: 0.150, // $0.150/GB/month
            [disk_types_1.DiskStorageAccountType.PremiumSSDZRS]: 0.188, // $0.188/GB/month (ZRS premium)
            [disk_types_1.DiskStorageAccountType.PremiumV2]: 0.180, // $0.180/GB/month
            [disk_types_1.DiskStorageAccountType.UltraSSD]: 0.240 // $0.240/GB/month (base, excludes IOPS/throughput)
        };
        return pricing[diskType] || 0.075;
    }
    /**
     * Get disk performance (IOPS and throughput)
     */
    getDiskPerformance(diskType, sizeGB) {
        // Simplified performance model (actual performance varies by disk size)
        const performanceMap = {
            [disk_types_1.DiskStorageAccountType.StandardHDD]: { iopsPerGB: 0.5, throughputPerGB: 0.06 }, // 500 IOPS, 60 MB/s for 1TB
            [disk_types_1.DiskStorageAccountType.StandardSSD]: { iopsPerGB: 4, throughputPerGB: 0.06 }, // 4000 IOPS, 60 MB/s for 1TB
            [disk_types_1.DiskStorageAccountType.StandardSSDZRS]: { iopsPerGB: 4, throughputPerGB: 0.06 },
            [disk_types_1.DiskStorageAccountType.PremiumSSD]: { iopsPerGB: 5, throughputPerGB: 0.2 }, // 5000 IOPS, 200 MB/s for 1TB
            [disk_types_1.DiskStorageAccountType.PremiumSSDZRS]: { iopsPerGB: 5, throughputPerGB: 0.2 },
            [disk_types_1.DiskStorageAccountType.PremiumV2]: { iopsPerGB: 10, throughputPerGB: 0.3 }, // Higher performance
            [disk_types_1.DiskStorageAccountType.UltraSSD]: { iopsPerGB: 20, throughputPerGB: 0.4 } // Highest performance
        };
        const perf = performanceMap[diskType] || performanceMap[disk_types_1.DiskStorageAccountType.StandardSSD];
        return {
            iops: Math.min(Math.floor(sizeGB * perf.iopsPerGB), 20000), // Cap at 20K IOPS per disk
            throughputMBps: Math.min(Math.floor(sizeGB * perf.throughputPerGB), 900) // Cap at 900 MB/s per disk
        };
    }
    /**
     * Determine performance tier based on disk types
     */
    determinePerformanceTier() {
        if (this.config.diskType === disk_types_1.DiskStorageAccountType.UltraSSD) {
            return 'Ultra';
        }
        if (this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumSSD ||
            this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumSSDZRS ||
            this.config.diskType === disk_types_1.DiskStorageAccountType.PremiumV2) {
            return 'Premium';
        }
        // Check overrides
        if (this.config.diskOverrides) {
            const hasUltra = this.config.diskOverrides.some(o => o.type === disk_types_1.DiskStorageAccountType.UltraSSD);
            if (hasUltra)
                return 'Ultra';
            const hasPremium = this.config.diskOverrides.some(o => o.type === disk_types_1.DiskStorageAccountType.PremiumSSD ||
                o.type === disk_types_1.DiskStorageAccountType.PremiumSSDZRS ||
                o.type === disk_types_1.DiskStorageAccountType.PremiumV2);
            if (hasPremium)
                return 'Premium';
        }
        return 'Standard';
    }
}
exports.DataDiskManager = DataDiskManager;
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Create data disk configuration from CLI options
 * @param options - Commander parsed options
 * @returns DataDisksConfiguration object
 */
function createDataDiskConfiguration(options) {
    // Handle preset vs custom configuration
    let diskCount = parseInt(options.diskCount || '0');
    let diskSizeGB = parseInt(options.diskSize || '128');
    let diskType = options.diskType || disk_types_1.DiskStorageAccountType.StandardSSD;
    let caching = options.caching || DiskCaching.ReadOnly;
    let preset;
    if (options.preset) {
        const presetSpec = DataDiskManager.getPreset(options.preset);
        if (presetSpec) {
            diskCount = presetSpec.diskCount;
            diskSizeGB = presetSpec.diskSizeGB;
            diskType = presetSpec.diskType;
            caching = presetSpec.caching;
            preset = presetSpec.preset;
        }
    }
    return {
        vmName: options.vmName,
        resourceGroup: options.resourceGroup,
        vmSize: options.vmSize,
        location: options.location,
        diskCount,
        diskSizeGB,
        diskType,
        caching,
        lunStart: options.lunStart ? parseInt(options.lunStart) : 0,
        preset
    };
}
/**
 * Generate complete ARM template with data disks
 * @param config - Data disk configuration
 * @returns Complete ARM template JSON
 */
function generateDataDiskTemplate(config) {
    const manager = new DataDiskManager(config);
    const validation = manager.validate();
    if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    return {
        $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
        contentVersion: '1.0.0.0',
        parameters: manager.getTemplateParameters(),
        variables: manager.getTemplateVariables(),
        resources: [
            {
                type: 'Microsoft.Compute/virtualMachines',
                apiVersion: '2023-09-01',
                name: '[parameters("vmName")]',
                location: '[parameters("location")]',
                properties: {
                    storageProfile: manager.getStorageProfile({
                        createOption: 'FromImage',
                        managedDisk: {
                            storageAccountType: '[parameters("osDiskType")]'
                        }
                    })
                }
            }
        ]
    };
}
