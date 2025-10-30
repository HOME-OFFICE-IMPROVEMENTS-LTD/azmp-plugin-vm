"use strict";
/**
 * Azure Site Recovery Module
 *
 * Provides helpers for Azure Site Recovery (ASR) configuration for disaster recovery.
 * Enables replication of VMs across regions for business continuity.
 *
 * @module recovery/siterecovery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteRecovery = exports.RegionPairs = void 0;
exports.replicationPolicy = replicationPolicy;
exports.enableVMReplication = enableVMReplication;
exports.recoveryPlan = recoveryPlan;
exports.getRecommendedTargetRegion = getRecommendedTargetRegion;
exports.estimateRTO = estimateRTO;
exports.estimateRPO = estimateRPO;
exports.estimateReplicationBandwidth = estimateReplicationBandwidth;
exports.validateReplicationPolicy = validateReplicationPolicy;
exports.siteRecoveryBestPractices = siteRecoveryBestPractices;
/**
 * Generate replication policy for Site Recovery
 *
 * @param config - Replication policy configuration
 * @returns Replication policy template
 *
 * @example
 * ```handlebars
 * {{recovery:replicationPolicy name="repl-policy" vaultName="myVault"}}
 * ```
 */
function replicationPolicy(config) {
    return {
        type: "Microsoft.RecoveryServices/vaults/replicationPolicies",
        apiVersion: "2023-06-01",
        name: `${config.vaultName}/${config.name}`,
        properties: {
            providerSpecificInput: {
                instanceType: "A2A",
                recoveryPointHistory: config.recoveryPointRetentionInHours ?? 24,
                crashConsistentFrequencyInMinutes: config.crashConsistentFrequencyInMinutes ?? 5,
                appConsistentFrequencyInMinutes: config.appConsistentFrequencyInMinutes ?? 60,
                multiVmSyncStatus: "Enable",
            },
        },
    };
}
/**
 * Enable replication for a VM
 *
 * @param config - VM replication configuration
 * @returns Site Recovery replication configuration
 *
 * @example
 * ```handlebars
 * {{recovery:enableReplication vmName="myVM" vaultName="myVault" sourceRegion="eastus" targetRegion="westus2"}}
 * ```
 */
function enableVMReplication(config) {
    const targetResourceGroup = config.targetResourceGroup || `${config.vmName}-dr-rg`;
    const targetVNet = config.targetVirtualNetwork || `${config.vmName}-dr-vnet`;
    return {
        type: "Microsoft.RecoveryServices/vaults/replicationFabrics/replicationProtectionContainers/replicationProtectedItems",
        apiVersion: "2023-06-01",
        name: `${config.vaultName}/Azure/${config.sourceRegion}/${config.vmName}`,
        properties: {
            policyId: `[resourceId('Microsoft.RecoveryServices/vaults/replicationPolicies', '${config.vaultName}', '${config.replicationPolicyName}')]`,
            providerSpecificDetails: {
                instanceType: "A2A",
                fabricObjectId: `[resourceId('Microsoft.Compute/virtualMachines', '${config.vmName}')]`,
                recoveryResourceGroupId: `[resourceId('Microsoft.Resources/resourceGroups', '${targetResourceGroup}')]`,
                recoveryAzureNetworkId: `[resourceId('Microsoft.Network/virtualNetworks', '${targetVNet}')]`,
                recoverySubnetName: "default",
                primaryStagingStorageAccountCustomInput: {
                    resourceType: "Existing",
                    azureStorageAccountId: `[resourceId('Microsoft.Storage/storageAccounts', 'asr${config.sourceRegion}cache')]`,
                },
            },
        },
    };
}
/**
 * Generate recovery plan for orchestrated failover
 *
 * @param config - Recovery plan configuration
 * @returns Recovery plan template
 *
 * @example
 * ```handlebars
 * {{recovery:recoveryPlan name="app-recovery" vaultName="myVault" vmNames='["web","db"]'}}
 * ```
 */
function recoveryPlan(config) {
    const groups = config.vmNames.map((vmName, index) => ({
        groupType: "Boot",
        replicationProtectedItems: [
            {
                id: `[resourceId('Microsoft.RecoveryServices/vaults/replicationFabrics/replicationProtectionContainers/replicationProtectedItems', '${config.vaultName}', 'Azure', '${config.sourceRegion}', '${vmName}')]`,
                virtualMachineId: `[resourceId('Microsoft.Compute/virtualMachines', '${vmName}')]`,
            },
        ],
        startGroupActions: [],
        endGroupActions: [],
    }));
    return {
        type: "Microsoft.RecoveryServices/vaults/replicationRecoveryPlans",
        apiVersion: "2023-06-01",
        name: `${config.vaultName}/${config.name}`,
        properties: {
            primaryFabricId: `[resourceId('Microsoft.RecoveryServices/vaults/replicationFabrics', '${config.vaultName}', 'Azure')]`,
            primaryFabricFriendlyName: config.sourceRegion,
            recoveryFabricId: `[resourceId('Microsoft.RecoveryServices/vaults/replicationFabrics', '${config.vaultName}', 'Azure')]`,
            recoveryFabricFriendlyName: config.targetRegion,
            failoverDeploymentModel: "ResourceManager",
            groups,
        },
    };
}
/**
 * Recommended Azure region pairs for disaster recovery
 */
exports.RegionPairs = {
    eastus: "westus",
    eastus2: "centralus",
    westus: "eastus",
    westus2: "westcentralus",
    westus3: "eastus",
    centralus: "eastus2",
    northcentralus: "southcentralus",
    southcentralus: "northcentralus",
    westcentralus: "westus2",
    northeurope: "westeurope",
    westeurope: "northeurope",
    uksouth: "ukwest",
    ukwest: "uksouth",
    francecentral: "francesouth",
    francesouth: "francecentral",
    germanywestcentral: "germanynorth",
    germanynorth: "germanywestcentral",
    switzerlandnorth: "switzerlandwest",
    switzerlandwest: "switzerlandnorth",
    norwayeast: "norwaywest",
    norwaywest: "norwayeast",
    brazilsouth: "southcentralus",
    southafricanorth: "southafricawest",
    southafricawest: "southafricanorth",
    australiaeast: "australiasoutheast",
    australiasoutheast: "australiaeast",
    australiacentral: "australiacentral2",
    australiacentral2: "australiacentral",
    southeastasia: "eastasia",
    eastasia: "southeastasia",
    japaneast: "japanwest",
    japanwest: "japaneast",
    koreacentral: "koreasouth",
    koreasouth: "koreacentral",
    centralindia: "southindia",
    southindia: "centralindia",
    westindia: "southindia",
    canadacentral: "canadaeast",
    canadaeast: "canadacentral",
    uaenorth: "uaecentral",
    uaecentral: "uaenorth",
};
/**
 * Get recommended target region for disaster recovery
 *
 * @param sourceRegion - Source Azure region
 * @returns Recommended target region
 */
function getRecommendedTargetRegion(sourceRegion) {
    return exports.RegionPairs[sourceRegion.toLowerCase()] || "westus2";
}
/**
 * Calculate RTO (Recovery Time Objective) for Site Recovery
 *
 * @param vmCount - Number of VMs to failover
 * @param avgVMSize - Average VM size in GB
 * @returns Estimated RTO in minutes
 */
function estimateRTO(vmCount, avgVMSize) {
    // Base failover time: 10 minutes
    // Additional time: 2 minutes per VM + 0.5 minutes per 100GB
    const baseTime = 10;
    const perVMTime = 2 * vmCount;
    const dataTime = (avgVMSize / 100) * 0.5 * vmCount;
    return Math.round(baseTime + perVMTime + dataTime);
}
/**
 * Calculate RPO (Recovery Point Objective) based on replication frequency
 *
 * @param crashConsistentFrequencyMinutes - Crash-consistent snapshot frequency
 * @returns RPO in minutes
 */
function estimateRPO(crashConsistentFrequencyMinutes) {
    // RPO is approximately equal to replication frequency + network latency
    return crashConsistentFrequencyMinutes + 5; // +5 min for network
}
/**
 * Estimate replication bandwidth requirements
 *
 * @param vmSizeGB - VM size in GB
 * @param dailyChangeRate - Daily change rate (0-1, e.g., 0.1 = 10%)
 * @returns Required bandwidth in Mbps
 */
function estimateReplicationBandwidth(vmSizeGB, dailyChangeRate = 0.1) {
    // Initial replication: Full size
    // Ongoing replication: Change rate
    const dailyChangeGB = vmSizeGB * dailyChangeRate;
    const hourlyChangeGB = dailyChangeGB / 24;
    const secondsChangeGB = hourlyChangeGB / 3600;
    const mbps = secondsChangeGB * 8 * 1024; // Convert GB to Mbps
    return Math.round(mbps * 10) / 10; // Round to 1 decimal
}
/**
 * Validate replication policy configuration
 *
 * @param config - Replication policy configuration
 * @returns Validation result
 */
function validateReplicationPolicy(config) {
    const errors = [];
    const warnings = [];
    // Validate recovery point retention (1-72 hours)
    if (config.recoveryPointRetentionInHours) {
        if (config.recoveryPointRetentionInHours < 1 ||
            config.recoveryPointRetentionInHours > 72) {
            errors.push("Recovery point retention must be between 1 and 72 hours");
        }
    }
    // Validate crash-consistent frequency (5-240 minutes)
    if (config.crashConsistentFrequencyInMinutes) {
        if (config.crashConsistentFrequencyInMinutes < 5 ||
            config.crashConsistentFrequencyInMinutes > 240) {
            errors.push("Crash-consistent frequency must be between 5 and 240 minutes");
        }
    }
    // Validate app-consistent frequency (0-240 minutes)
    if (config.appConsistentFrequencyInMinutes !== undefined) {
        if (config.appConsistentFrequencyInMinutes < 0 ||
            config.appConsistentFrequencyInMinutes > 240) {
            errors.push("App-consistent frequency must be between 0 and 240 minutes");
        }
    }
    // Warnings
    if (config.crashConsistentFrequencyInMinutes &&
        config.crashConsistentFrequencyInMinutes > 30) {
        warnings.push("Crash-consistent frequency > 30 minutes may result in higher RPO");
    }
    if (config.recoveryPointRetentionInHours &&
        config.recoveryPointRetentionInHours < 24) {
        warnings.push("Recovery point retention < 24 hours is not recommended for production");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Site Recovery best practices documentation
 *
 * @returns Best practices as markdown string
 */
function siteRecoveryBestPractices() {
    return `
# Azure Site Recovery Best Practices

## Overview
Azure Site Recovery (ASR) provides disaster recovery for VMs by replicating them across Azure regions.

## Architecture

### Region Pairs
- Use Microsoft-recommended paired regions for optimal performance
- Paired regions share same data residency and compliance boundaries
- Updates are rolled out sequentially to paired regions
- Example: East US ↔ West US, North Europe ↔ West Europe

### Network Design
- **Source Region**: Primary workload location
- **Target Region**: Disaster recovery location
- **Cache Storage**: Staging storage in source region
- **VNet Peering**: Enable between source and target regions

## Replication Policies

### Recovery Point Retention
- **Minimum**: 1 hour (not recommended for production)
- **Recommended**: 24 hours (1 day)
- **Maximum**: 72 hours (3 days)
- More retention = more recovery options but higher cost

### Snapshot Frequencies
- **Crash-Consistent**: 5-30 minutes (recommended: 5 minutes)
  - Captures disk state at point in time
  - No application coordination
  - Used for all VMs
  
- **App-Consistent**: 60-240 minutes (recommended: 60 minutes)
  - Coordinates with applications (VSS/Linux scripts)
  - Ensures application state consistency
  - Requires VM agent and app integration

## Performance

### Bandwidth Requirements
- **Initial Replication**: Full VM size (can take hours/days)
- **Ongoing Replication**: 5-20% of VM size daily (typical)
- **Example**: 1TB VM with 10% daily change = ~5 Mbps sustained

### Network Optimization
- Use ExpressRoute for predictable latency
- Enable accelerated networking
- Schedule initial replication during off-peak hours
- Monitor replication lag (should be < 15 minutes)

## RTO/RPO Targets

### Recovery Point Objective (RPO)
- **Typical**: 5-15 minutes
- **Worst Case**: Crash-consistent frequency + network lag
- **Best Practice**: 5-minute crash-consistent snapshots

### Recovery Time Objective (RTO)
- **Planned Failover**: 10-30 minutes
- **Unplanned Failover**: 30-60 minutes
- **Factors**: VM count, VM size, network speed

### Example RTOs
- 1 VM (100GB): ~15 minutes
- 10 VMs (500GB avg): ~30 minutes
- 50 VMs (1TB avg): ~90 minutes

## Recovery Plans

### Design Principles
- Group VMs by application tier (web → app → database)
- Define boot order (database first, web last)
- Add pre/post failover scripts for automation
- Test regularly (quarterly minimum)

### Multi-Tier Applications
1. **Tier 1** (Boot Priority 1): Databases, domain controllers
2. **Tier 2** (Boot Priority 2): Application servers
3. **Tier 3** (Boot Priority 3): Web servers, load balancers

## Cost Optimization

### Pricing Components
- **Protected Instance**: ~$25/month per VM
- **Storage**: Replication cache storage (~10% of VM size)
- **Network**: Cross-region bandwidth (free within Azure)

### Cost Examples
- Small VM (32GB): ~$30/month
- Medium VM (256GB): ~$40/month
- Large VM (1TB): ~$65/month

### Optimization Tips
- Exclude temporary/cache disks from replication
- Use standard storage for cache (not premium)
- Disable replication for non-critical VMs
- Group VMs in recovery plans to reduce management

## Testing

### Test Failover
- Run quarterly test failovers
- Use isolated VNet for testing
- Validate application functionality
- Document RTO/RPO achieved
- Clean up test VMs after validation

### Monitoring
- Set up alerts for replication lag
- Monitor replication health daily
- Review ASR reports weekly
- Track bandwidth consumption

## Limitations

### Supported Scenarios
- ✅ Azure-to-Azure replication
- ✅ Cross-region replication
- ✅ Managed disks (standard, premium, ultra)
- ✅ Availability zones

### Not Supported
- ❌ VMs with write accelerator
- ❌ Shared disks
- ❌ Ultra disks (use snapshots)
- ❌ Proximity placement groups

### Size Limits
- Max VM disks: 32 data disks
- Max single disk: 32 TB
- Max churn per disk: 20 MB/s
- Max churn per VM: 54 MB/s

## Compliance

### Data Residency
- Source and target data stay within paired regions
- Metadata stored in Recovery Services Vault region
- No data leaves Azure

### Security
- Encryption at rest (Storage Service Encryption)
- Encryption in transit (HTTPS/TLS)
- RBAC for access control
- Azure AD integration
  `.trim();
}
/**
 * Export all Site Recovery functions
 */
exports.siteRecovery = {
    replicationPolicy,
    enableVMReplication,
    recoveryPlan,
    RegionPairs: exports.RegionPairs,
    getRecommendedTargetRegion,
    estimateRTO,
    estimateRPO,
    estimateReplicationBandwidth,
    validateReplicationPolicy,
    siteRecoveryBestPractices,
};
