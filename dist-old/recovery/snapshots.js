"use strict";
/**
 * Disk Snapshots Module
 *
 * Provides helpers for Azure disk snapshots and restore points.
 * Enables point-in-time backup and fast recovery for VM disks.
 *
 * @module recovery/snapshots
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshots = exports.SnapshotRetentionPolicies = void 0;
exports.diskSnapshot = diskSnapshot;
exports.restorePointCollection = restorePointCollection;
exports.vmRestorePoint = vmRestorePoint;
exports.diskFromSnapshot = diskFromSnapshot;
exports.estimateSnapshotCost = estimateSnapshotCost;
exports.estimateRestoreTime = estimateRestoreTime;
exports.getRecommendedSnapshotSchedule = getRecommendedSnapshotSchedule;
exports.validateSnapshotConfig = validateSnapshotConfig;
exports.snapshotsBestPractices = snapshotsBestPractices;
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
function diskSnapshot(config) {
    return {
        type: "Microsoft.Compute/snapshots",
        apiVersion: "2023-04-02",
        name: config.name,
        location: config.location || "[resourceGroup().location]",
        sku: {
            name: config.incremental ? "Standard_LRS" : "Standard_LRS",
        },
        properties: {
            creationData: {
                createOption: "Copy",
                sourceResourceId: `[resourceId('Microsoft.Compute/disks', '${config.diskName}')]`,
            },
            incremental: config.incremental ?? false,
            networkAccessPolicy: "AllowAll",
            publicNetworkAccess: "Enabled",
        },
        tags: config.tags || {},
    };
}
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
function restorePointCollection(config) {
    return {
        type: "Microsoft.Compute/restorePointCollections",
        apiVersion: "2023-09-01",
        name: config.name,
        location: config.location || "[resourceGroup().location]",
        properties: {
            source: {
                id: `[resourceId('Microsoft.Compute/virtualMachines', '${config.vmName}')]`,
            },
        },
    };
}
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
function vmRestorePoint(config) {
    const restorePoint = {
        type: "Microsoft.Compute/restorePointCollections/restorePoints",
        apiVersion: "2023-09-01",
        name: `${config.collectionName}/${config.name}`,
        properties: {
            consistencyMode: config.consistencyMode || "CrashConsistent",
        },
    };
    // Exclude specific disks if specified
    if (config.excludeDisks && config.excludeDisks.length > 0) {
        restorePoint.properties.excludeDisks = config.excludeDisks.map((diskName) => ({
            id: `[resourceId('Microsoft.Compute/disks', '${diskName}')]`,
        }));
    }
    return restorePoint;
}
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
function diskFromSnapshot(diskName, snapshotName, location) {
    return {
        type: "Microsoft.Compute/disks",
        apiVersion: "2023-04-02",
        name: diskName,
        location: location || "[resourceGroup().location]",
        sku: {
            name: "Premium_LRS", // Can be changed to Standard_LRS, StandardSSD_LRS, etc.
        },
        properties: {
            creationData: {
                createOption: "Copy",
                sourceResourceId: `[resourceId('Microsoft.Compute/snapshots', '${snapshotName}')]`,
            },
            diskSizeGB: null, // Will be inherited from snapshot
            diskIOPSReadWrite: null,
            diskMBpsReadWrite: null,
        },
    };
}
/**
 * Snapshot Retention Policies
 */
exports.SnapshotRetentionPolicies = {
    /**
     * Hourly snapshots for 24 hours
     */
    hourly: {
        frequency: "Hourly",
        retention: 24,
        description: "Keep 24 hourly snapshots",
    },
    /**
     * Daily snapshots for 7 days
     */
    daily: {
        frequency: "Daily",
        retention: 7,
        description: "Keep 7 daily snapshots",
    },
    /**
     * Weekly snapshots for 4 weeks
     */
    weekly: {
        frequency: "Weekly",
        retention: 4,
        description: "Keep 4 weekly snapshots",
    },
    /**
     * Monthly snapshots for 12 months
     */
    monthly: {
        frequency: "Monthly",
        retention: 12,
        description: "Keep 12 monthly snapshots",
    },
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
function estimateSnapshotCost(diskSizeGB, isIncremental, snapshotCount = 7, changeRate = 0.1) {
    const pricePerGBMonth = 0.05; // $0.05/GB per month for snapshot storage
    if (isIncremental) {
        // First snapshot: full size
        // Subsequent snapshots: incremental based on change rate
        const firstSnapshotGB = diskSizeGB;
        const incrementalSnapshotsGB = diskSizeGB * changeRate * (snapshotCount - 1);
        const totalGB = firstSnapshotGB + incrementalSnapshotsGB;
        return Math.round(totalGB * pricePerGBMonth * 100) / 100;
    }
    else {
        // Full snapshots
        const totalGB = diskSizeGB * snapshotCount;
        return Math.round(totalGB * pricePerGBMonth * 100) / 100;
    }
}
/**
 * Calculate restore time estimate
 *
 * @param diskSizeGB - Disk size in GB
 * @param isIncremental - Whether using incremental snapshot
 * @returns Estimated restore time in minutes
 */
function estimateRestoreTime(diskSizeGB, isIncremental) {
    // Base time for disk creation
    const baseTime = 5;
    if (isIncremental) {
        // Incremental snapshots restore faster
        const dataTime = (diskSizeGB / 100) * 2; // 2 min per 100GB
        return Math.round(baseTime + dataTime);
    }
    else {
        // Full snapshots
        const dataTime = (diskSizeGB / 100) * 3; // 3 min per 100GB
        return Math.round(baseTime + dataTime);
    }
}
/**
 * Get recommended snapshot schedule based on workload type
 *
 * @param workloadType - Type of workload
 * @returns Snapshot schedule recommendation
 */
function getRecommendedSnapshotSchedule(workloadType) {
    switch (workloadType) {
        case "development":
            return {
                frequency: "Daily",
                retention: 3,
                incremental: true,
                description: "Daily snapshots, 3-day retention for quick rollback",
            };
        case "production":
            return {
                frequency: "Daily",
                retention: 7,
                incremental: true,
                description: "Daily snapshots, 7-day retention for week-long recovery",
            };
        case "critical":
            return {
                frequency: "Hourly",
                retention: 24,
                incremental: true,
                description: "Hourly snapshots, 24-hour retention for minimal data loss",
            };
        default:
            return {
                frequency: "Daily",
                retention: 7,
                incremental: true,
                description: "Default: Daily snapshots, 7-day retention",
            };
    }
}
/**
 * Validate snapshot configuration
 *
 * @param config - Snapshot configuration
 * @returns Validation result
 */
function validateSnapshotConfig(config) {
    const errors = [];
    const warnings = [];
    // Validate name
    if (!config.name || config.name.length === 0) {
        errors.push("Snapshot name is required");
    }
    // Validate name length and characters
    if (config.name.length > 80) {
        errors.push("Snapshot name must be 80 characters or less");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(config.name)) {
        errors.push("Snapshot name can only contain letters, numbers, underscores, and hyphens");
    }
    // Validate disk name
    if (!config.diskName || config.diskName.length === 0) {
        errors.push("Disk name is required");
    }
    // Recommendations
    if (!config.incremental) {
        warnings.push("Consider using incremental snapshots to reduce storage costs");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Snapshots best practices documentation
 *
 * @returns Best practices as markdown string
 */
function snapshotsBestPractices() {
    return `
# Azure Disk Snapshots Best Practices

## Snapshot Types

### Full Snapshots
- **Pros**: Independent, simple recovery
- **Cons**: Higher storage cost, slower creation
- **Use Case**: Long-term archival, compliance

### Incremental Snapshots
- **Pros**: 70-90% storage savings, faster creation
- **Cons**: Dependent chain, slightly slower restore
- **Use Case**: Daily backups, production workloads ⭐

## Scheduling Guidelines

### Development Workloads
- **Frequency**: Daily
- **Retention**: 3-7 days
- **Type**: Incremental
- **Cost**: ~$2-5/month per 100GB disk

### Production Workloads
- **Frequency**: Every 6-12 hours
- **Retention**: 7-14 days
- **Type**: Incremental
- **Cost**: ~$5-10/month per 100GB disk

### Critical Workloads
- **Frequency**: Hourly
- **Retention**: 24-48 hours
- **Type**: Incremental
- **Cost**: ~$10-15/month per 100GB disk

## Restore Points vs Snapshots

### Snapshots (Disk-Level)
- ✅ Individual disk backup
- ✅ Cross-region copy supported
- ✅ 99.9% durability
- ✅ Lower cost
- ⚠️ Manual coordination for multi-disk VMs

### Restore Points (VM-Level)
- ✅ Entire VM backup (all disks)
- ✅ Application-consistent possible
- ✅ Crash-consistent guaranteed
- ✅ Automatic multi-disk coordination
- ⚠️ Cannot copy cross-region
- ⚠️ Higher cost

## Performance Impact

### Snapshot Creation
- Minimal impact on VM performance (< 5%)
- Background process, no downtime
- Duration: ~5-15 minutes for typical disks
- Network: No egress charges

### Restore Performance
- **Full Snapshot**: 3-5 minutes per 100GB
- **Incremental Snapshot**: 2-3 minutes per 100GB
- **Restore Point**: 5-10 minutes for entire VM

## Cost Optimization

### Storage Costs
- **Snapshot Storage**: $0.05/GB per month
- **Incremental Savings**: 70-90% vs full snapshots
- **Example**: 1TB disk, 7 daily snapshots
  - Full: ~$350/month
  - Incremental: ~$70/month (80% savings)

### Best Practices
1. Use incremental snapshots
2. Set retention policies (don't keep forever)
3. Delete unused snapshots regularly
4. Schedule during off-peak hours
5. Use lifecycle management policies

## Automation

### Snapshot Naming Convention
\`\`\`
{diskName}-{YYYYMMDD}-{HHMM}
Example: osdisk-20241022-0200
\`\`\`

### Retention Tags
Add tags for automatic cleanup:
- \`retention\`: "7days", "30days", "1year"
- \`type\`: "daily", "weekly", "monthly"
- \`automated\`: "true"

### Azure Automation
Use Azure Automation runbooks or Logic Apps to:
- Create snapshots on schedule
- Delete old snapshots based on retention
- Copy critical snapshots cross-region
- Alert on snapshot failures

## Recovery Scenarios

### Single Disk Corruption
1. Identify corrupted disk
2. Stop VM (optional, but recommended)
3. Create new disk from snapshot
4. Attach new disk to VM
5. Start VM
**RTO**: 15-30 minutes

### Entire VM Recovery
1. Create restore point or use existing
2. Create new VM from restore point
3. Reconfigure networking if needed
**RTO**: 30-60 minutes

### Cross-Region Disaster Recovery
1. Copy snapshots to target region (scheduled)
2. Create disks from snapshots in target region
3. Create VM in target region
**RTO**: 2-4 hours (includes copy time)

## Security

### Access Control
- Use RBAC for snapshot management
- Separate read/write permissions
- Audit snapshot creation/deletion
- Encrypt snapshots at rest (automatic)

### Compliance
- Enable soft delete for accidental deletion protection
- Use immutable snapshots for regulatory compliance
- Tag snapshots with classification (PII, HIPAA, etc.)
- Regular audit of snapshot inventory

## Limitations

### Size Limits
- Max snapshot size: 32 TB
- Max snapshots per disk: No limit (cost consideration)
- Max restore points per collection: 500

### Regional Availability
- Snapshots are regional resources
- Must copy to another region for DR
- Restore points cannot be copied cross-region

### Performance
- Ultra disks: Use restore points, not snapshots
- Write accelerator: Must disable before snapshot
- Shared disks: Not supported for snapshots

## Monitoring

### Key Metrics
- Snapshot creation success rate
- Snapshot age (oldest snapshot)
- Total snapshot storage consumption
- Failed snapshot operations

### Alerts
- Set alerts for snapshot failures
- Monitor snapshot storage costs
- Track retention policy compliance
- Alert on missing scheduled snapshots

## Testing

### Regular Validation
- Monthly: Test snapshot restore
- Quarterly: Full VM recovery test
- Annually: Disaster recovery drill

### Documentation
- Document restore procedures
- Maintain snapshot inventory
- Track RTO/RPO achievements
- Update runbooks based on tests
  `.trim();
}
/**
 * Export all snapshot functions
 */
exports.snapshots = {
    diskSnapshot,
    restorePointCollection,
    vmRestorePoint,
    diskFromSnapshot,
    SnapshotRetentionPolicies: exports.SnapshotRetentionPolicies,
    estimateSnapshotCost,
    estimateRestoreTime,
    getRecommendedSnapshotSchedule,
    validateSnapshotConfig,
    snapshotsBestPractices,
};
