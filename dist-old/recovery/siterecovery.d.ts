/**
 * Azure Site Recovery Module
 *
 * Provides helpers for Azure Site Recovery (ASR) configuration for disaster recovery.
 * Enables replication of VMs across regions for business continuity.
 *
 * @module recovery/siterecovery
 */
/**
 * Site Recovery Configuration
 */
export interface SiteRecoveryConfig {
    name: string;
    vaultName: string;
    sourceRegion: string;
    targetRegion: string;
    replicationPolicyName?: string;
}
/**
 * Replication Policy Configuration
 */
export interface ReplicationPolicyConfig {
    name: string;
    vaultName: string;
    recoveryPointRetentionInHours?: number;
    appConsistentFrequencyInMinutes?: number;
    crashConsistentFrequencyInMinutes?: number;
}
/**
 * VM Replication Configuration
 */
export interface VMReplicationConfig {
    vmName: string;
    vaultName: string;
    sourceRegion: string;
    targetRegion: string;
    targetResourceGroup?: string;
    targetVirtualNetwork?: string;
    replicationPolicyName: string;
}
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
export declare function replicationPolicy(config: ReplicationPolicyConfig): any;
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
export declare function enableVMReplication(config: VMReplicationConfig): any;
/**
 * Recovery Plan Configuration
 */
export interface RecoveryPlanConfig {
    name: string;
    vaultName: string;
    sourceRegion: string;
    targetRegion: string;
    vmNames: string[];
    bootOrder?: number;
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
export declare function recoveryPlan(config: RecoveryPlanConfig): any;
/**
 * Recommended Azure region pairs for disaster recovery
 */
export declare const RegionPairs: Record<string, string>;
/**
 * Get recommended target region for disaster recovery
 *
 * @param sourceRegion - Source Azure region
 * @returns Recommended target region
 */
export declare function getRecommendedTargetRegion(sourceRegion: string): string;
/**
 * Calculate RTO (Recovery Time Objective) for Site Recovery
 *
 * @param vmCount - Number of VMs to failover
 * @param avgVMSize - Average VM size in GB
 * @returns Estimated RTO in minutes
 */
export declare function estimateRTO(vmCount: number, avgVMSize: number): number;
/**
 * Calculate RPO (Recovery Point Objective) based on replication frequency
 *
 * @param crashConsistentFrequencyMinutes - Crash-consistent snapshot frequency
 * @returns RPO in minutes
 */
export declare function estimateRPO(crashConsistentFrequencyMinutes: number): number;
/**
 * Estimate replication bandwidth requirements
 *
 * @param vmSizeGB - VM size in GB
 * @param dailyChangeRate - Daily change rate (0-1, e.g., 0.1 = 10%)
 * @returns Required bandwidth in Mbps
 */
export declare function estimateReplicationBandwidth(vmSizeGB: number, dailyChangeRate?: number): number;
/**
 * Validate replication policy configuration
 *
 * @param config - Replication policy configuration
 * @returns Validation result
 */
export declare function validateReplicationPolicy(config: ReplicationPolicyConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Site Recovery best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function siteRecoveryBestPractices(): string;
/**
 * Export all Site Recovery functions
 */
export declare const siteRecovery: {
    replicationPolicy: typeof replicationPolicy;
    enableVMReplication: typeof enableVMReplication;
    recoveryPlan: typeof recoveryPlan;
    RegionPairs: Record<string, string>;
    getRecommendedTargetRegion: typeof getRecommendedTargetRegion;
    estimateRTO: typeof estimateRTO;
    estimateRPO: typeof estimateRPO;
    estimateReplicationBandwidth: typeof estimateReplicationBandwidth;
    validateReplicationPolicy: typeof validateReplicationPolicy;
    siteRecoveryBestPractices: typeof siteRecoveryBestPractices;
};
