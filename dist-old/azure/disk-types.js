"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskTypeManager = exports.DiskCaching = exports.PremiumSSDPerformanceTier = exports.DiskCategory = exports.DiskStorageAccountType = void 0;
exports.createDiskConfiguration = createDiskConfiguration;
exports.generateDiskTemplate = generateDiskTemplate;
/**
 * Azure Managed Disk Storage Account Types
 */
var DiskStorageAccountType;
(function (DiskStorageAccountType) {
    DiskStorageAccountType["StandardHDD"] = "Standard_LRS";
    DiskStorageAccountType["StandardSSD"] = "StandardSSD_LRS";
    DiskStorageAccountType["StandardSSDZRS"] = "StandardSSD_ZRS";
    DiskStorageAccountType["PremiumSSD"] = "Premium_LRS";
    DiskStorageAccountType["PremiumSSDZRS"] = "Premium_ZRS";
    DiskStorageAccountType["PremiumV2"] = "PremiumV2_LRS";
    DiskStorageAccountType["UltraSSD"] = "UltraSSD_LRS";
})(DiskStorageAccountType || (exports.DiskStorageAccountType = DiskStorageAccountType = {}));
/**
 * Disk type categories for UI grouping
 */
var DiskCategory;
(function (DiskCategory) {
    DiskCategory["Performance"] = "Performance";
    DiskCategory["Balanced"] = "Balanced";
    DiskCategory["CostOptimized"] = "Cost-Optimized";
    DiskCategory["HighAvailability"] = "High Availability";
})(DiskCategory || (exports.DiskCategory = DiskCategory = {}));
/**
 * Premium SSD Performance Tiers (size-independent performance)
 */
var PremiumSSDPerformanceTier;
(function (PremiumSSDPerformanceTier) {
    PremiumSSDPerformanceTier["P1"] = "P1";
    PremiumSSDPerformanceTier["P2"] = "P2";
    PremiumSSDPerformanceTier["P3"] = "P3";
    PremiumSSDPerformanceTier["P4"] = "P4";
    PremiumSSDPerformanceTier["P6"] = "P6";
    PremiumSSDPerformanceTier["P10"] = "P10";
    PremiumSSDPerformanceTier["P15"] = "P15";
    PremiumSSDPerformanceTier["P20"] = "P20";
    PremiumSSDPerformanceTier["P30"] = "P30";
    PremiumSSDPerformanceTier["P40"] = "P40";
    PremiumSSDPerformanceTier["P50"] = "P50";
    PremiumSSDPerformanceTier["P60"] = "P60";
    PremiumSSDPerformanceTier["P70"] = "P70";
    PremiumSSDPerformanceTier["P80"] = "P80";
})(PremiumSSDPerformanceTier || (exports.PremiumSSDPerformanceTier = PremiumSSDPerformanceTier = {}));
/**
 * Disk caching options
 */
var DiskCaching;
(function (DiskCaching) {
    DiskCaching["None"] = "None";
    DiskCaching["ReadOnly"] = "ReadOnly";
    DiskCaching["ReadWrite"] = "ReadWrite";
})(DiskCaching || (exports.DiskCaching = DiskCaching = {}));
/**
 * Disk Type Manager
 *
 * Manages disk type selection, validation, and ARM template generation
 */
class DiskTypeManager {
    config;
    /**
     * Disk type metadata registry
     */
    static DISK_TYPES = {
        [DiskStorageAccountType.StandardHDD]: {
            type: DiskStorageAccountType.StandardHDD,
            category: DiskCategory.CostOptimized,
            label: 'Standard HDD (Standard_LRS)',
            description: 'Cost-optimized magnetic storage. Best for backups, archival, and infrequent access.',
            estimatedCostPerGBMonth: 0.045,
            maxIOPS: 500,
            maxThroughputMBps: 60,
            requiresPremiumVM: false,
            requiresZoneSupport: false,
            supportedCaching: [DiskCaching.None, DiskCaching.ReadOnly],
            minSizeGB: 32,
            maxSizeGB: 32767
        },
        [DiskStorageAccountType.StandardSSD]: {
            type: DiskStorageAccountType.StandardSSD,
            category: DiskCategory.Balanced,
            label: 'Standard SSD (StandardSSD_LRS)',
            description: 'Balanced performance and cost. Good for dev/test, web servers, and light workloads.',
            estimatedCostPerGBMonth: 0.075,
            maxIOPS: 6000,
            maxThroughputMBps: 750,
            requiresPremiumVM: false,
            requiresZoneSupport: false,
            supportedCaching: [DiskCaching.None, DiskCaching.ReadOnly, DiskCaching.ReadWrite],
            minSizeGB: 4,
            maxSizeGB: 32767
        },
        [DiskStorageAccountType.StandardSSDZRS]: {
            type: DiskStorageAccountType.StandardSSDZRS,
            category: DiskCategory.HighAvailability,
            label: 'Standard SSD Zone-Redundant (StandardSSD_ZRS)',
            description: 'Zone-redundant Standard SSD for higher availability.',
            estimatedCostPerGBMonth: 0.095,
            maxIOPS: 6000,
            maxThroughputMBps: 750,
            requiresPremiumVM: false,
            requiresZoneSupport: true,
            supportedCaching: [DiskCaching.None, DiskCaching.ReadOnly, DiskCaching.ReadWrite],
            minSizeGB: 4,
            maxSizeGB: 32767
        },
        [DiskStorageAccountType.PremiumSSD]: {
            type: DiskStorageAccountType.PremiumSSD,
            category: DiskCategory.Performance,
            label: 'Premium SSD (Premium_LRS)',
            description: 'High performance, low latency SSD. Recommended for production workloads.',
            estimatedCostPerGBMonth: 0.135,
            maxIOPS: 20000,
            maxThroughputMBps: 900,
            requiresPremiumVM: true,
            requiresZoneSupport: false,
            supportedCaching: [DiskCaching.None, DiskCaching.ReadOnly, DiskCaching.ReadWrite],
            minSizeGB: 4,
            maxSizeGB: 32767
        },
        [DiskStorageAccountType.PremiumSSDZRS]: {
            type: DiskStorageAccountType.PremiumSSDZRS,
            category: DiskCategory.HighAvailability,
            label: 'Premium SSD Zone-Redundant (Premium_ZRS)',
            description: 'Zone-redundant Premium SSD for mission-critical workloads with high availability.',
            estimatedCostPerGBMonth: 0.175,
            maxIOPS: 20000,
            maxThroughputMBps: 900,
            requiresPremiumVM: true,
            requiresZoneSupport: true,
            supportedCaching: [DiskCaching.None, DiskCaching.ReadOnly, DiskCaching.ReadWrite],
            minSizeGB: 4,
            maxSizeGB: 32767
        },
        [DiskStorageAccountType.PremiumV2]: {
            type: DiskStorageAccountType.PremiumV2,
            category: DiskCategory.Performance,
            label: 'Premium SSD v2 (PremiumV2_LRS)',
            description: 'Next-gen Premium SSD with customizable IOPS and throughput.',
            estimatedCostPerGBMonth: 0.12,
            maxIOPS: 80000,
            maxThroughputMBps: 1200,
            requiresPremiumVM: true,
            requiresZoneSupport: true,
            supportedCaching: [DiskCaching.None],
            minSizeGB: 4,
            maxSizeGB: 65536
        },
        [DiskStorageAccountType.UltraSSD]: {
            type: DiskStorageAccountType.UltraSSD,
            category: DiskCategory.Performance,
            label: 'Ultra Disk (UltraSSD_LRS)',
            description: 'Ultra-low latency, high IOPS disk. Best for IO-intensive workloads like databases.',
            estimatedCostPerGBMonth: 0.25,
            maxIOPS: 160000,
            maxThroughputMBps: 4000,
            requiresPremiumVM: true,
            requiresZoneSupport: true,
            supportedCaching: [DiskCaching.None],
            minSizeGB: 4,
            maxSizeGB: 65536
        }
    };
    /**
     * Premium SSD performance tier specifications
     */
    static PERFORMANCE_TIERS = {
        [PremiumSSDPerformanceTier.P1]: { tier: PremiumSSDPerformanceTier.P1, minDiskSizeGB: 4, maxDiskSizeGB: 4, iops: 120, throughputMBps: 25 },
        [PremiumSSDPerformanceTier.P2]: { tier: PremiumSSDPerformanceTier.P2, minDiskSizeGB: 5, maxDiskSizeGB: 8, iops: 120, throughputMBps: 25 },
        [PremiumSSDPerformanceTier.P3]: { tier: PremiumSSDPerformanceTier.P3, minDiskSizeGB: 9, maxDiskSizeGB: 16, iops: 120, throughputMBps: 25 },
        [PremiumSSDPerformanceTier.P4]: { tier: PremiumSSDPerformanceTier.P4, minDiskSizeGB: 17, maxDiskSizeGB: 32, iops: 120, throughputMBps: 25 },
        [PremiumSSDPerformanceTier.P6]: { tier: PremiumSSDPerformanceTier.P6, minDiskSizeGB: 33, maxDiskSizeGB: 64, iops: 240, throughputMBps: 50 },
        [PremiumSSDPerformanceTier.P10]: { tier: PremiumSSDPerformanceTier.P10, minDiskSizeGB: 65, maxDiskSizeGB: 128, iops: 500, throughputMBps: 100 },
        [PremiumSSDPerformanceTier.P15]: { tier: PremiumSSDPerformanceTier.P15, minDiskSizeGB: 129, maxDiskSizeGB: 256, iops: 1100, throughputMBps: 125 },
        [PremiumSSDPerformanceTier.P20]: { tier: PremiumSSDPerformanceTier.P20, minDiskSizeGB: 257, maxDiskSizeGB: 511, iops: 2300, throughputMBps: 150 },
        [PremiumSSDPerformanceTier.P30]: { tier: PremiumSSDPerformanceTier.P30, minDiskSizeGB: 512, maxDiskSizeGB: 1023, iops: 5000, throughputMBps: 200 },
        [PremiumSSDPerformanceTier.P40]: { tier: PremiumSSDPerformanceTier.P40, minDiskSizeGB: 1024, maxDiskSizeGB: 2048, iops: 7500, throughputMBps: 250 },
        [PremiumSSDPerformanceTier.P50]: { tier: PremiumSSDPerformanceTier.P50, minDiskSizeGB: 2049, maxDiskSizeGB: 4096, iops: 7500, throughputMBps: 250 },
        [PremiumSSDPerformanceTier.P60]: { tier: PremiumSSDPerformanceTier.P60, minDiskSizeGB: 4097, maxDiskSizeGB: 8192, iops: 16000, throughputMBps: 500 },
        [PremiumSSDPerformanceTier.P70]: { tier: PremiumSSDPerformanceTier.P70, minDiskSizeGB: 8193, maxDiskSizeGB: 16384, iops: 18000, throughputMBps: 750 },
        [PremiumSSDPerformanceTier.P80]: { tier: PremiumSSDPerformanceTier.P80, minDiskSizeGB: 16385, maxDiskSizeGB: 32767, iops: 20000, throughputMBps: 900 }
    };
    constructor(config) {
        this.config = config;
    }
    /**
     * Get disk type information
     */
    static getDiskTypeInfo(type) {
        return DiskTypeManager.DISK_TYPES[type];
    }
    /**
     * Get all available disk types
     */
    static getAllDiskTypes() {
        return Object.values(DiskTypeManager.DISK_TYPES);
    }
    /**
     * Get disk types by category
     */
    static getDiskTypesByCategory(category) {
        return Object.values(DiskTypeManager.DISK_TYPES).filter(d => d.category === category);
    }
    /**
     * Get performance tier specification
     */
    static getPerformanceTier(tier) {
        return DiskTypeManager.PERFORMANCE_TIERS[tier];
    }
    /**
     * Get all performance tiers
     */
    static getAllPerformanceTiers() {
        return Object.values(DiskTypeManager.PERFORMANCE_TIERS);
    }
    /**
     * Get recommended performance tier for disk size
     */
    static getRecommendedPerformanceTier(diskSizeGB) {
        const tiers = Object.values(DiskTypeManager.PERFORMANCE_TIERS);
        for (const tier of tiers) {
            if (diskSizeGB >= tier.minDiskSizeGB && diskSizeGB <= tier.maxDiskSizeGB) {
                return tier.tier;
            }
        }
        return PremiumSSDPerformanceTier.P80; // Default to highest tier
    }
    /**
     * Check if VM size supports premium storage
     * Handles both legacy (DS/ES/FS/GS/LS/MS series) and modern ('s' suffix before version: D4s_v3, E8s_v3)
     */
    static isPremiumCapableVMSize(vmSize) {
        const normalized = vmSize.toLowerCase();
        // Modern pattern: 's' suffix before version number (D4s_v3, E8s_v3, B4ms)
        const modernPattern = /s(_v\d+)?$/;
        if (modernPattern.test(normalized)) {
            return true;
        }
        // Legacy series: DS, ES, FS, GS, LS, MS
        const legacySeries = ['ds', 'es', 'fs', 'gs', 'ls', 'ms'];
        return legacySeries.some(series => normalized.includes(series));
    }
    /**
     * Check if disk type requires premium-capable VM
     */
    static requiresPremiumVM(diskType) {
        return DiskTypeManager.DISK_TYPES[diskType].requiresPremiumVM;
    }
    /**
     * Check if disk type requires zone support
     */
    static requiresZoneSupport(diskType) {
        return DiskTypeManager.DISK_TYPES[diskType].requiresZoneSupport;
    }
    /**
     * Get recommended caching for disk type
     */
    static getRecommendedCaching(diskType, isOSDisk) {
        const info = DiskTypeManager.DISK_TYPES[diskType];
        // OS disks typically benefit from ReadWrite caching
        if (isOSDisk && info.supportedCaching.includes(DiskCaching.ReadWrite)) {
            return DiskCaching.ReadWrite;
        }
        // Data disks with Premium SSD benefit from ReadOnly caching
        if (!isOSDisk && diskType === DiskStorageAccountType.PremiumSSD) {
            return DiskCaching.ReadOnly;
        }
        // Ultra Disk and Premium v2 don't support caching
        if ([DiskStorageAccountType.UltraSSD, DiskStorageAccountType.PremiumV2].includes(diskType)) {
            return DiskCaching.None;
        }
        return DiskCaching.ReadOnly;
    }
    /**
     * Validate disk configuration
     */
    validate(vmSize, location) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            recommendations: []
        };
        // Validate OS disk type
        const osDiskInfo = DiskTypeManager.DISK_TYPES[this.config.osDiskType];
        if (!osDiskInfo) {
            result.isValid = false;
            result.errors.push(`Invalid OS disk type: ${this.config.osDiskType}`);
            return result;
        }
        // Validate OS disk size
        if (this.config.osDiskSizeGB) {
            if (this.config.osDiskSizeGB < osDiskInfo.minSizeGB) {
                result.isValid = false;
                result.errors.push(`OS disk size ${this.config.osDiskSizeGB} GB is below minimum ${osDiskInfo.minSizeGB} GB for ${this.config.osDiskType}`);
            }
            if (this.config.osDiskSizeGB > osDiskInfo.maxSizeGB) {
                result.isValid = false;
                result.errors.push(`OS disk size ${this.config.osDiskSizeGB} GB exceeds maximum ${osDiskInfo.maxSizeGB} GB for ${this.config.osDiskType}`);
            }
        }
        // Validate premium disk with VM size
        if (vmSize && osDiskInfo.requiresPremiumVM && !DiskTypeManager.isPremiumCapableVMSize(vmSize)) {
            result.isValid = false;
            result.errors.push(`OS disk type ${this.config.osDiskType} requires a premium-capable VM size (e.g., Standard_DS2_v2). Current size: ${vmSize}`);
        }
        // Validate zone support
        if (osDiskInfo.requiresZoneSupport) {
            result.warnings.push(`OS disk type ${this.config.osDiskType} requires zone-aware VM deployment. Ensure VM is deployed with availability zones.`);
        }
        // Validate caching
        if (this.config.osDiskCaching && !osDiskInfo.supportedCaching.includes(this.config.osDiskCaching)) {
            result.isValid = false;
            result.errors.push(`Caching ${this.config.osDiskCaching} not supported for ${this.config.osDiskType}. Supported: ${osDiskInfo.supportedCaching.join(', ')}`);
        }
        // Validate performance tier
        if (this.config.osDiskPerformanceTier) {
            if (![DiskStorageAccountType.PremiumSSD, DiskStorageAccountType.PremiumSSDZRS].includes(this.config.osDiskType)) {
                result.warnings.push(`Performance tier is only applicable to Premium SSD disks. Ignoring for ${this.config.osDiskType}.`);
            }
            else if (this.config.osDiskSizeGB) {
                const tierSpec = DiskTypeManager.PERFORMANCE_TIERS[this.config.osDiskPerformanceTier];
                if (this.config.osDiskSizeGB < tierSpec.minDiskSizeGB || this.config.osDiskSizeGB > tierSpec.maxDiskSizeGB) {
                    result.warnings.push(`Performance tier ${this.config.osDiskPerformanceTier} is not optimal for disk size ${this.config.osDiskSizeGB} GB. Recommended: ${DiskTypeManager.getRecommendedPerformanceTier(this.config.osDiskSizeGB)}`);
                }
            }
        }
        // Validate data disks
        if (this.config.dataDisks && this.config.dataDisks.length > 0) {
            this.config.dataDisks.forEach((disk, index) => {
                const dataDiskInfo = DiskTypeManager.DISK_TYPES[disk.storageAccountType];
                if (!dataDiskInfo) {
                    result.isValid = false;
                    result.errors.push(`Invalid data disk type for disk ${disk.name}: ${disk.storageAccountType}`);
                    return;
                }
                if (disk.sizeGB < dataDiskInfo.minSizeGB || disk.sizeGB > dataDiskInfo.maxSizeGB) {
                    result.isValid = false;
                    result.errors.push(`Data disk ${disk.name} size ${disk.sizeGB} GB is out of range [${dataDiskInfo.minSizeGB}, ${dataDiskInfo.maxSizeGB}] for ${disk.storageAccountType}`);
                }
                if (vmSize && dataDiskInfo.requiresPremiumVM && !DiskTypeManager.isPremiumCapableVMSize(vmSize)) {
                    result.isValid = false;
                    result.errors.push(`Data disk ${disk.name} type ${disk.storageAccountType} requires a premium-capable VM size`);
                }
                if (!dataDiskInfo.supportedCaching.includes(disk.caching)) {
                    result.isValid = false;
                    result.errors.push(`Caching ${disk.caching} not supported for data disk ${disk.name} with type ${disk.storageAccountType}`);
                }
            });
        }
        // Recommendations
        if (this.config.osDiskType === DiskStorageAccountType.StandardHDD) {
            result.recommendations.push('Consider using Standard SSD or Premium SSD for better OS disk performance in production environments.');
        }
        if (vmSize && DiskTypeManager.isPremiumCapableVMSize(vmSize) && this.config.osDiskType === DiskStorageAccountType.StandardSSD) {
            result.recommendations.push('Your VM size supports Premium SSD. Consider upgrading OS disk to Premium SSD for better performance.');
        }
        if (this.config.osDiskType === DiskStorageAccountType.UltraSSD && !this.config.enableUltraSSD) {
            result.warnings.push('Ultra Disk requires enableUltraSSD flag to be set on the VM. Ensure additionalCapabilities.ultraSSDEnabled is set to true.');
        }
        return result;
    }
    /**
     * Generate ARM template parameters for disk configuration
     */
    getTemplateParameters() {
        const params = {
            osDiskType: {
                type: 'string',
                defaultValue: this.config.osDiskType,
                allowedValues: Object.values(DiskStorageAccountType),
                metadata: {
                    description: 'OS disk storage account type (Standard HDD, Standard SSD, Premium SSD, Ultra Disk)'
                }
            }
        };
        if (this.config.osDiskSizeGB) {
            params.osDiskSizeGB = {
                type: 'int',
                defaultValue: this.config.osDiskSizeGB,
                minValue: DiskTypeManager.DISK_TYPES[this.config.osDiskType].minSizeGB,
                maxValue: DiskTypeManager.DISK_TYPES[this.config.osDiskType].maxSizeGB,
                metadata: {
                    description: 'OS disk size in GB'
                }
            };
        }
        if (this.config.dataDiskType) {
            params.dataDiskType = {
                type: 'string',
                defaultValue: this.config.dataDiskType,
                allowedValues: Object.values(DiskStorageAccountType),
                metadata: {
                    description: 'Data disk storage account type'
                }
            };
        }
        if (this.config.dataDisks && this.config.dataDisks.length > 0) {
            params.dataDiskCount = {
                type: 'int',
                defaultValue: this.config.dataDisks.length,
                minValue: 0,
                maxValue: 64,
                metadata: {
                    description: 'Number of data disks'
                }
            };
        }
        return params;
    }
    /**
     * Generate ARM template variables for disk configuration
     */
    getTemplateVariables() {
        const variables = {};
        // OS disk caching
        const osDiskCaching = this.config.osDiskCaching || DiskTypeManager.getRecommendedCaching(this.config.osDiskType, true);
        variables.osDiskCaching = osDiskCaching;
        // Performance tier for Premium SSD
        if ([DiskStorageAccountType.PremiumSSD, DiskStorageAccountType.PremiumSSDZRS].includes(this.config.osDiskType)) {
            if (this.config.osDiskPerformanceTier) {
                variables.osDiskPerformanceTier = this.config.osDiskPerformanceTier;
            }
            else if (this.config.osDiskSizeGB) {
                variables.osDiskPerformanceTier = DiskTypeManager.getRecommendedPerformanceTier(this.config.osDiskSizeGB);
            }
        }
        // Data disk defaults
        if (this.config.dataDiskType) {
            const dataDiskCaching = DiskTypeManager.getRecommendedCaching(this.config.dataDiskType, false);
            variables.dataDiskCaching = dataDiskCaching;
        }
        return variables;
    }
    /**
     * Generate OS disk configuration for VM resource
     */
    getOSDiskConfig() {
        const config = {
            createOption: 'FromImage',
            managedDisk: {
                storageAccountType: `[parameters('osDiskType')]`
            },
            caching: `[variables('osDiskCaching')]`
        };
        if (this.config.osDiskSizeGB) {
            config.diskSizeGB = `[parameters('osDiskSizeGB')]`;
        }
        // Add performance tier for Premium SSD
        if (this.config.osDiskPerformanceTier &&
            [DiskStorageAccountType.PremiumSSD, DiskStorageAccountType.PremiumSSDZRS].includes(this.config.osDiskType)) {
            config.managedDisk.tier = `[variables('osDiskPerformanceTier')]`;
        }
        return config;
    }
    /**
     * Generate data disks array for VM resource
     */
    getDataDisksArray() {
        if (!this.config.dataDisks || this.config.dataDisks.length === 0) {
            return [];
        }
        return this.config.dataDisks.map(disk => {
            const diskConfig = {
                lun: disk.lun,
                name: disk.name,
                createOption: disk.createOption,
                diskSizeGB: disk.sizeGB,
                managedDisk: {
                    storageAccountType: disk.storageAccountType
                },
                caching: disk.caching
            };
            if (disk.performanceTier &&
                [DiskStorageAccountType.PremiumSSD, DiskStorageAccountType.PremiumSSDZRS].includes(disk.storageAccountType)) {
                diskConfig.managedDisk.tier = disk.performanceTier;
            }
            return diskConfig;
        });
    }
    /**
     * Generate complete storage profile for VM resource
     */
    getStorageProfile() {
        const profile = {
            osDisk: this.getOSDiskConfig(),
            imageReference: {
                publisher: '[parameters(\'imagePublisher\')]',
                offer: '[parameters(\'imageOffer\')]',
                sku: '[parameters(\'imageSku\')]',
                version: '[parameters(\'imageVersion\')]'
            }
        };
        const dataDisks = this.getDataDisksArray();
        if (dataDisks.length > 0) {
            profile.dataDisks = dataDisks;
        }
        return profile;
    }
    /**
     * Check if configuration is marketplace compliant
     */
    isMarketplaceCompliant() {
        const issues = [];
        // OS disk type should be explicitly configured
        if (!this.config.osDiskType) {
            issues.push('OS disk type must be explicitly configured');
        }
        // Premium or Standard SSD recommended for production
        if (this.config.osDiskType === DiskStorageAccountType.StandardHDD) {
            issues.push('Standard HDD is not recommended for production workloads');
        }
        // Validate Ultra Disk configuration
        if (this.config.osDiskType === DiskStorageAccountType.UltraSSD && !this.config.enableUltraSSD) {
            issues.push('Ultra Disk requires enableUltraSSD flag to be set on VM');
        }
        return {
            compliant: issues.length === 0,
            issues
        };
    }
}
exports.DiskTypeManager = DiskTypeManager;
/**
 * Helper function to create disk configuration from CLI options
 */
function createDiskConfiguration(options) {
    const config = {
        osDiskType: options.osDiskType
    };
    if (options.osDiskSize) {
        config.osDiskSizeGB = options.osDiskSize;
    }
    if (options.osDiskCaching) {
        config.osDiskCaching = options.osDiskCaching;
    }
    if (options.osDiskPerformanceTier) {
        config.osDiskPerformanceTier = options.osDiskPerformanceTier;
    }
    if (options.dataDiskType) {
        config.dataDiskType = options.dataDiskType;
    }
    if (options.dataDiskCount && options.dataDiskCount > 0) {
        config.dataDisks = [];
        const diskSize = options.dataDiskSize || 128;
        const diskType = options.dataDiskType || DiskStorageAccountType.StandardSSD;
        const caching = DiskTypeManager.getRecommendedCaching(diskType, false);
        for (let i = 0; i < options.dataDiskCount; i++) {
            config.dataDisks.push({
                name: `datadisk${i}`,
                sizeGB: diskSize,
                storageAccountType: diskType,
                caching,
                lun: i,
                createOption: 'Empty'
            });
        }
    }
    if (options.enableUltraSSD) {
        config.enableUltraSSD = true;
    }
    return config;
}
/**
 * Helper function to generate complete ARM template for disk configuration
 */
function generateDiskTemplate(config) {
    const manager = new DiskTypeManager(config);
    return {
        parameters: manager.getTemplateParameters(),
        variables: manager.getTemplateVariables(),
        storageProfile: manager.getStorageProfile()
    };
}
