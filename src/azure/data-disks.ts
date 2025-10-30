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

import {
  DiskStorageAccountType,
  DiskConfiguration,
} from './disk-types';
import {
  VmSizeInfo,
  ComputeHelper,
} from './compute';

/**
 * Data disk caching modes
 * - None: No caching (best for write-heavy workloads like logs)
 * - ReadOnly: Read caching only (best for databases, read-heavy workloads)
 * - ReadWrite: Read and write caching (best for application data)
 */
export enum DiskCaching {
  None = 'None',
  ReadOnly = 'ReadOnly',
  ReadWrite = 'ReadWrite'
}

/**
 * Predefined data disk configuration presets
 */
export enum DataDiskPreset {
  Database = 'database',
  Logs = 'logs',
  AppData = 'appdata',
  HighPerformance = 'highperformance',
  Archive = 'archive',
  Custom = 'custom'
}

/**
 * Workload types for caching recommendations
 */
export enum WorkloadType {
  Database = 'database',
  Logs = 'logs',
  Application = 'application',
  Analytics = 'analytics',
  Archive = 'archive'
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
 * VM size information (minimal interface for compute.ts integration)
 */
interface VMSizeInfo {
  name: string;
  numberOfCores: number;
  memoryInMB: number;
  maxDataDiskCount: number;
  maxIOPS?: number;
  maxThroughputMBps?: number;
}

/**
 * DataDiskManager - Manages Azure data disk configuration and ARM template generation
 */
export class DataDiskManager {
  private config: DataDisksConfiguration;

  /**
   * Preset data disk configurations with predefined settings
   */
  static readonly DATA_DISK_PRESETS: Record<DataDiskPreset, PresetSpecification> = {
    [DataDiskPreset.Database]: {
      preset: DataDiskPreset.Database,
      name: 'Database',
      description: 'Optimized for database workloads (SQL Server, PostgreSQL, MySQL)',
      useCase: 'Production databases, OLTP workloads, read-heavy applications',
      diskCount: 4,
      diskSizeGB: 1024,
      diskType: DiskStorageAccountType.PremiumSSD,
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
      diskType: DiskStorageAccountType.StandardSSD,
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
      diskType: DiskStorageAccountType.StandardSSD,
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
      diskType: DiskStorageAccountType.PremiumSSD,
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
      diskType: DiskStorageAccountType.StandardHDD,
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
      diskType: DiskStorageAccountType.StandardSSD,
      caching: DiskCaching.ReadOnly,
      minDiskSlots: 0,
      estimatedMonthlyCost: 0
    }
  };

  constructor(config: DataDisksConfiguration) {
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
  static getAllPresets(): PresetSpecification[] {
    return Object.values(DataDiskManager.DATA_DISK_PRESETS)
      .filter(p => p.preset !== DataDiskPreset.Custom);
  }

  /**
   * Get specific preset configuration
   * @param preset - Preset key
   * @returns Preset specification or null if not found
   */
  static getPreset(preset: DataDiskPreset): PresetSpecification | null {
    return DataDiskManager.DATA_DISK_PRESETS[preset] || null;
  }

  /**
   * Get recommended preset based on workload type
   * @param workloadType - Type of workload
   * @param vmSize - Target VM size
   * @returns Recommended preset key
   */
  static getRecommendedPreset(
    workloadType: WorkloadType,
    vmSize: string
  ): DataDiskPreset {
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
  static getRecommendedCaching(workloadType: WorkloadType): DiskCaching {
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
  static getMaxDataDisks(vmSize: string): number {
    // Static VM size lookup table (subset of common sizes)
    // For full list, integrate with compute.ts dynamically
    const VM_SIZES: Record<string, number> = {
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
  static isValidDiskSize(sizeGB: number): boolean {
    return sizeGB >= 4 && sizeGB <= 32767;
  }

  /**
   * Validate LUN range
   * @param lun - Logical Unit Number
   * @returns True if valid (0-63)
   */
  static isValidLun(lun: number): boolean {
    return lun >= 0 && lun <= 63;
  }

  /**
   * Get VM size category for premium capability check
   * @param vmSize - VM size name
   * @returns True if VM supports premium disks
   */
  static isPremiumCapable(vmSize: string): boolean {
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
  validate(): DataDiskValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Get VM size limits
    const vmLimits = this.getVmLimits();

    // 2. Check disk count vs VM limit
    if (this.config.diskCount > vmLimits.maxDataDiskCount) {
      errors.push(
        `Disk count (${this.config.diskCount}) exceeds VM limit for '${this.config.vmSize}' (max: ${vmLimits.maxDataDiskCount} disks). ` +
        `Reduce disk count or choose a larger VM size.`
      );
    }

    // 3. Validate default disk size
    if (!DataDiskManager.isValidDiskSize(this.config.diskSizeGB)) {
      errors.push(
        `Default disk size (${this.config.diskSizeGB} GB) is invalid. Must be 4-32767 GB.`
      );
    }

    // 4. Validate disk overrides
    if (this.config.diskOverrides && this.config.diskOverrides.length > 0) {
      for (const override of this.config.diskOverrides) {
        // Check override index
        if (override.matchIndex < 0 || override.matchIndex >= this.config.diskCount) {
          errors.push(
            `Override matchIndex ${override.matchIndex} is out of range (0-${this.config.diskCount - 1}).`
          );
        }

        // Check override disk size
        if (override.sizeGB && !DataDiskManager.isValidDiskSize(override.sizeGB)) {
          errors.push(
            `Override disk size (${override.sizeGB} GB) at index ${override.matchIndex} is invalid. Must be 4-32767 GB.`
          );
        }

        // Check override LUN
        if (override.lun !== undefined && !DataDiskManager.isValidLun(override.lun)) {
          errors.push(
            `Override LUN ${override.lun} at index ${override.matchIndex} is invalid. Must be 0-63.`
          );
        }
      }
    }

    // 5. Validate LUN assignments
    const luns = this.getAssignedLuns();
    const uniqueLuns = new Set(luns);
    if (luns.length !== uniqueLuns.size) {
      const duplicates = luns.filter((lun, idx) => luns.indexOf(lun) !== idx);
      errors.push(
        `Duplicate LUN assignments detected: ${[...new Set(duplicates)].join(', ')}. ` +
        `Ensure all disks have unique LUN numbers.`
      );
    }

    // 6. Check IOPS/throughput limits (warnings only)
    const performance = this.calculatePerformance();
    if (performance.totalIOPS > vmLimits.maxIOPS) {
      warnings.push(
        `Total IOPS (${performance.totalIOPS.toLocaleString()}) exceeds VM limit (${vmLimits.maxIOPS.toLocaleString()}). ` +
        `Performance may be throttled. Consider reducing disk count or using lower-tier disks.`
      );
    }
    if (performance.totalThroughputMBps > vmLimits.maxThroughputMBps) {
      warnings.push(
        `Total throughput (${performance.totalThroughputMBps} MB/s) exceeds VM limit (${vmLimits.maxThroughputMBps} MB/s). ` +
        `Performance may be throttled.`
      );
    }

    // 7. Check Premium disk compatibility
    if (this.usesPremiumDisks() && !DataDiskManager.isPremiumCapable(this.config.vmSize)) {
      errors.push(
        `VM size '${this.config.vmSize}' does not support Premium disks. ` +
        `Choose a premium-capable VM (e.g., DS, ES, FS series) or use Standard/StandardSSD disks.`
      );
    }

    // 8. Warnings for best practices
    if (this.config.diskCount > 16) {
      warnings.push(
        `Using ${this.config.diskCount} data disks may impact VM boot time. ` +
        `Consider disk striping (RAID) to consolidate disks.`
      );
    }

    if (this.config.diskCount === 0) {
      warnings.push(
        `No data disks configured. VM will only have OS disk. ` +
        `Consider adding data disks for application data separation.`
      );
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
  estimateCosts(): DataDiskCostEstimate {
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
    const breakdown: DataDiskCostEstimate['breakdown'] = [];
    let totalMonthlyCost = 0;

    for (const [diskType, disks] of Object.entries(disksByType)) {
      const diskCount = disks.length;
      const avgSizeGB = disks.reduce((sum, d) => sum + d.sizeGB, 0) / diskCount;

      // Get pricing from DiskTypeManager
      const pricePerGBMonth = this.getPricePerGBMonth(diskType as DiskStorageAccountType);
      const subtotalMonthly = diskCount * avgSizeGB * pricePerGBMonth;

      breakdown.push({
        diskType: diskType as DiskStorageAccountType,
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
  calculatePerformance(): DataDiskPerformance {
    const perDiskIOPS: number[] = [];
    const perDiskThroughputMBps: number[] = [];
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
  getTemplateParameters(): Record<string, any> {
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
  getTemplateVariables(): Record<string, any> {
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
  getDataDiskResources(): any[] {
    if (this.config.diskCount === 0) {
      return [];
    }

    const baseDisk: any = {
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
  getStorageProfile(osDiskConfig: any): any {
    const dataDisks = this.getDataDiskResources();

    const storageProfile: any = {
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
  private getVmLimits() {
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
  private getAssignedLuns(): number[] {
    const luns: number[] = [];
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
  private usesPremiumDisks(): boolean {
    // Check default disk type
    if (this.config.diskType === DiskStorageAccountType.PremiumSSD ||
        this.config.diskType === DiskStorageAccountType.PremiumSSDZRS ||
        this.config.diskType === DiskStorageAccountType.PremiumV2) {
      return true;
    }

    // Check overrides
    if (this.config.diskOverrides) {
      return this.config.diskOverrides.some(override =>
        override.type === DiskStorageAccountType.PremiumSSD ||
        override.type === DiskStorageAccountType.PremiumSSDZRS ||
        override.type === DiskStorageAccountType.PremiumV2
      );
    }

    return false;
  }

  /**
   * Get disk configuration for specific index (applying overrides)
   */
  private getDiskConfig(index: number): {
    sizeGB: number;
    type: DiskStorageAccountType;
    caching: DiskCaching;
    lun: number;
  } {
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
  private groupDisksByType(): Record<string, Array<{ sizeGB: number; type: DiskStorageAccountType }>> {
    const groups: Record<string, Array<{ sizeGB: number; type: DiskStorageAccountType }>> = {};

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
  private getPricePerGBMonth(diskType: DiskStorageAccountType): number {
    // Approximate Azure pricing (as of 2024)
    const pricing: Record<DiskStorageAccountType, number> = {
      [DiskStorageAccountType.StandardHDD]: 0.019,      // $0.019/GB/month
      [DiskStorageAccountType.StandardSSD]: 0.075,      // $0.075/GB/month
      [DiskStorageAccountType.StandardSSDZRS]: 0.094,   // $0.094/GB/month (ZRS premium)
      [DiskStorageAccountType.PremiumSSD]: 0.150,       // $0.150/GB/month
      [DiskStorageAccountType.PremiumSSDZRS]: 0.188,    // $0.188/GB/month (ZRS premium)
      [DiskStorageAccountType.PremiumV2]: 0.180,        // $0.180/GB/month
      [DiskStorageAccountType.UltraSSD]: 0.240          // $0.240/GB/month (base, excludes IOPS/throughput)
    };

    return pricing[diskType] || 0.075;
  }

  /**
   * Get disk performance (IOPS and throughput)
   */
  private getDiskPerformance(diskType: DiskStorageAccountType, sizeGB: number): {
    iops: number;
    throughputMBps: number;
  } {
    // Simplified performance model (actual performance varies by disk size)
    const performanceMap: Record<DiskStorageAccountType, { iopsPerGB: number; throughputPerGB: number }> = {
      [DiskStorageAccountType.StandardHDD]: { iopsPerGB: 0.5, throughputPerGB: 0.06 },    // 500 IOPS, 60 MB/s for 1TB
      [DiskStorageAccountType.StandardSSD]: { iopsPerGB: 4, throughputPerGB: 0.06 },       // 4000 IOPS, 60 MB/s for 1TB
      [DiskStorageAccountType.StandardSSDZRS]: { iopsPerGB: 4, throughputPerGB: 0.06 },
      [DiskStorageAccountType.PremiumSSD]: { iopsPerGB: 5, throughputPerGB: 0.2 },        // 5000 IOPS, 200 MB/s for 1TB
      [DiskStorageAccountType.PremiumSSDZRS]: { iopsPerGB: 5, throughputPerGB: 0.2 },
      [DiskStorageAccountType.PremiumV2]: { iopsPerGB: 10, throughputPerGB: 0.3 },        // Higher performance
      [DiskStorageAccountType.UltraSSD]: { iopsPerGB: 20, throughputPerGB: 0.4 }          // Highest performance
    };

    const perf = performanceMap[diskType] || performanceMap[DiskStorageAccountType.StandardSSD];

    return {
      iops: Math.min(Math.floor(sizeGB * perf.iopsPerGB), 20000), // Cap at 20K IOPS per disk
      throughputMBps: Math.min(Math.floor(sizeGB * perf.throughputPerGB), 900) // Cap at 900 MB/s per disk
    };
  }

  /**
   * Determine performance tier based on disk types
   */
  private determinePerformanceTier(): 'Standard' | 'Premium' | 'Ultra' {
    if (this.config.diskType === DiskStorageAccountType.UltraSSD) {
      return 'Ultra';
    }

    if (this.config.diskType === DiskStorageAccountType.PremiumSSD ||
        this.config.diskType === DiskStorageAccountType.PremiumSSDZRS ||
        this.config.diskType === DiskStorageAccountType.PremiumV2) {
      return 'Premium';
    }

    // Check overrides
    if (this.config.diskOverrides) {
      const hasUltra = this.config.diskOverrides.some(o => o.type === DiskStorageAccountType.UltraSSD);
      if (hasUltra) return 'Ultra';

      const hasPremium = this.config.diskOverrides.some(o =>
        o.type === DiskStorageAccountType.PremiumSSD ||
        o.type === DiskStorageAccountType.PremiumSSDZRS ||
        o.type === DiskStorageAccountType.PremiumV2
      );
      if (hasPremium) return 'Premium';
    }

    return 'Standard';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create data disk configuration from CLI options
 * @param options - Commander parsed options
 * @returns DataDisksConfiguration object
 */
export function createDataDiskConfiguration(options: any): DataDisksConfiguration {
  // Handle preset vs custom configuration
  let diskCount = parseInt(options.diskCount || '0');
  let diskSizeGB = parseInt(options.diskSize || '128');
  let diskType = options.diskType || DiskStorageAccountType.StandardSSD;
  let caching = options.caching || DiskCaching.ReadOnly;
  let preset: DataDiskPreset | undefined;

  if (options.preset) {
    const presetSpec = DataDiskManager.getPreset(options.preset as DataDiskPreset);
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
export function generateDataDiskTemplate(config: DataDisksConfiguration): any {
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
