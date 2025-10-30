/**
 * Disk Snapshots Module
 *
 * Provides helpers for Azure disk snapshots and restore points.
 * Enables point-in-time backup and fast recovery for VM disks.
 *
 * @module recovery/snapshots
 */
/**
 * Snapshot Configuration
 */
export interface SnapshotConfig {
    name: string;
    diskName: string;
    location?: string;
    incremental?: boolean;
    tags?: Record<string, string>;
}
/**
 * Restore Point Collection Configuration
 */
export interface RestorePointCollectionConfig {
    name: string;
    vmName: string;
    location?: string;
    source?: "Manual" | "Schedule";
}
/**
 * Restore Point Configuration
 */
export interface RestorePointConfig {
    name: string;
    collectionName: string;
    vmName: string;
    excludeDisks?: string[];
    consistencyMode?: "ApplicationConsistent" | "CrashConsistent" | "FileSystemConsistent";
}
/**
 * Generate disk snapshot
 *
 * @param config - Snapshot configuration
 * @returns Snapshot template
 *
 * @example
 * ```handlebars
 * {{recovery:snapshot name="mySnapshot" diskName="myDisk" incremental=true}}
 * ```
 */
export declare function diskSnapshot(config: SnapshotConfig): any;
/**
 * Generate restore point collection
 *
 * @param config - Restore point collection configuration
 * @returns Restore point collection template
 *
 * @example
 * ```handlebars
 * {{recovery:restorePointCollection name="myCollection" vmName="myVM"}}
 * ```
 */
export declare function restorePointCollection(config: RestorePointCollectionConfig): any;
/**
 * Generate restore point for VM
 *
 * @param config - Restore point configuration
 * @returns Restore point template
 *
 * @example
 * ```handlebars
 * {{recovery:restorePoint name="rp-20241022" collectionName="myCollection" vmName="myVM"}}
 * ```
 */
export declare function vmRestorePoint(config: RestorePointConfig): any;
/**
 * Generate disk from snapshot
 *
 * @param diskName - New disk name
 * @param snapshotName - Source snapshot name
 * @param location - Azure region
 * @returns Disk creation template
 *
 * @example
 * ```handlebars
 * {{recovery:diskFromSnapshot diskName="restoredDisk" snapshotName="mySnapshot"}}
 * ```
 */
export declare function diskFromSnapshot(diskName: string, snapshotName: string, location?: string): any;
/**
 * Snapshot Retention Policies
 */
export declare const SnapshotRetentionPolicies: {
    /**
     * Hourly snapshots for 24 hours
     */
    hourly: {
        frequency: string;
        retention: number;
        description: string;
    };
    /**
     * Daily snapshots for 7 days
     */
    daily: {
        frequency: string;
        retention: number;
        description: string;
    };
    /**
     * Weekly snapshots for 4 weeks
     */
    weekly: {
        frequency: string;
        retention: number;
        description: string;
    };
    /**
     * Monthly snapshots for 12 months
     */
    monthly: {
        frequency: string;
        retention: number;
        description: string;
    };
};
/**
 * Calculate snapshot storage cost
 *
 * @param diskSizeGB - Disk size in GB
 * @param isIncremental - Whether using incremental snapshots
 * @param snapshotCount - Number of snapshots to retain
 * @param changeRate - Daily change rate for incremental (0-1)
 * @returns Estimated monthly cost in USD
 */
export declare function estimateSnapshotCost(diskSizeGB: number, isIncremental: boolean, snapshotCount?: number, changeRate?: number): number;
/**
 * Calculate restore time estimate
 *
 * @param diskSizeGB - Disk size in GB
 * @param isIncremental - Whether using incremental snapshot
 * @returns Estimated restore time in minutes
 */
export declare function estimateRestoreTime(diskSizeGB: number, isIncremental: boolean): number;
/**
 * Get recommended snapshot schedule based on workload type
 *
 * @param workloadType - Type of workload
 * @returns Snapshot schedule recommendation
 */
export declare function getRecommendedSnapshotSchedule(workloadType: "development" | "production" | "critical"): {
    frequency: string;
    retention: number;
    incremental: boolean;
    description: string;
};
/**
 * Validate snapshot configuration
 *
 * @param config - Snapshot configuration
 * @returns Validation result
 */
export declare function validateSnapshotConfig(config: SnapshotConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Snapshots best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function snapshotsBestPractices(): string;
/**
 * Export all snapshot functions
 */
export declare const snapshots: {
    diskSnapshot: typeof diskSnapshot;
    restorePointCollection: typeof restorePointCollection;
    vmRestorePoint: typeof vmRestorePoint;
    diskFromSnapshot: typeof diskFromSnapshot;
    SnapshotRetentionPolicies: {
        /**
         * Hourly snapshots for 24 hours
         */
        hourly: {
            frequency: string;
            retention: number;
            description: string;
        };
        /**
         * Daily snapshots for 7 days
         */
        daily: {
            frequency: string;
            retention: number;
            description: string;
        };
        /**
         * Weekly snapshots for 4 weeks
         */
        weekly: {
            frequency: string;
            retention: number;
            description: string;
        };
        /**
         * Monthly snapshots for 12 months
         */
        monthly: {
            frequency: string;
            retention: number;
            description: string;
        };
    };
    estimateSnapshotCost: typeof estimateSnapshotCost;
    estimateRestoreTime: typeof estimateRestoreTime;
    getRecommendedSnapshotSchedule: typeof getRecommendedSnapshotSchedule;
    validateSnapshotConfig: typeof validateSnapshotConfig;
    snapshotsBestPractices: typeof snapshotsBestPractices;
};
