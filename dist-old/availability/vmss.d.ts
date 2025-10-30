/**
 * Virtual Machine Scale Sets Module
 *
 * Provides helpers for Azure VMSS (Virtual Machine Scale Sets) configuration.
 * VMSS enables auto-scaling, load balancing, and high availability.
 *
 * @module availability/vmss
 */
/**
 * VMSS Orchestration Mode
 */
export type OrchestrationMode = "Flexible" | "Uniform";
/**
 * VMSS Upgrade Mode
 */
export type UpgradeMode = "Automatic" | "Manual" | "Rolling";
/**
 * VMSS Configuration
 */
export interface VMSSConfig {
    name: string;
    location?: string;
    orchestrationMode: OrchestrationMode;
    platformFaultDomainCount?: number;
    zones?: string[];
    vmSize: string;
    instanceCount?: number;
    upgradeMode?: UpgradeMode;
    overprovision?: boolean;
    singlePlacementGroup?: boolean;
    tags?: Record<string, string>;
}
/**
 * VMSS Flexible Orchestration Template
 */
export interface VMSSFlexibleTemplate {
    type: "Microsoft.Compute/virtualMachineScaleSets";
    apiVersion: string;
    name: string;
    location: string;
    zones?: string[];
    sku: {
        name: string;
        tier: string;
        capacity: number;
    };
    properties: {
        orchestrationMode: "Flexible";
        platformFaultDomainCount: number;
        singlePlacementGroup?: boolean;
    };
    tags?: Record<string, string>;
}
/**
 * Generate VMSS with Flexible orchestration (modern, recommended)
 *
 * @param config - VMSS configuration
 * @returns VMSS Flexible template
 *
 * @example
 * ```handlebars
 * {{availability:vmssFlexible name="myVMSS" zones='["1","2","3"]' vmSize="Standard_D2s_v3"}}
 * ```
 */
export declare function vmssFlexible(config: VMSSConfig): VMSSFlexibleTemplate;
/**
 * Generate VMSS with Uniform orchestration (legacy, still widely used)
 *
 * @param config - VMSS configuration
 * @returns VMSS Uniform template
 *
 * @example
 * ```handlebars
 * {{availability:vmssUniform name="myVMSS" vmSize="Standard_D2s_v3" instanceCount=5}}
 * ```
 */
export declare function vmssUniform(config: VMSSConfig): any;
/**
 * Auto-scaling Profile Configuration
 */
export interface AutoscaleProfile {
    name: string;
    capacity: {
        minimum: number;
        maximum: number;
        default: number;
    };
    rules: AutoscaleRule[];
}
/**
 * Auto-scaling Rule
 */
export interface AutoscaleRule {
    metricTrigger: {
        metricName: string;
        metricResourceId: string;
        timeGrain: string;
        statistic: "Average" | "Min" | "Max" | "Sum";
        timeWindow: string;
        timeAggregation: "Average" | "Minimum" | "Maximum" | "Total" | "Count";
        operator: "GreaterThan" | "LessThan" | "GreaterThanOrEqual" | "LessThanOrEqual" | "Equals" | "NotEquals";
        threshold: number;
    };
    scaleAction: {
        direction: "Increase" | "Decrease";
        type: "ChangeCount" | "PercentChangeCount" | "ExactCount";
        value: string;
        cooldown: string;
    };
}
/**
 * Generate auto-scaling settings for VMSS
 *
 * @param vmssName - Name of the VMSS
 * @param profile - Auto-scaling profile
 * @returns Auto-scale settings template
 *
 * @example
 * ```handlebars
 * {{availability:vmssAutoscale vmssName="myVMSS" minInstances=2 maxInstances=10}}
 * ```
 */
export declare function vmssAutoscale(vmssName: string, profile: AutoscaleProfile): any;
/**
 * Create CPU-based auto-scaling rule
 *
 * @param vmssResourceId - Resource ID of VMSS
 * @param scaleOutThreshold - CPU % to scale out (default: 75)
 * @param scaleInThreshold - CPU % to scale in (default: 25)
 * @returns Auto-scale profile with CPU rules
 */
export declare function cpuAutoscaleRules(vmssResourceId: string, scaleOutThreshold?: number, scaleInThreshold?: number): AutoscaleRule[];
/**
 * Health probe configuration for VMSS
 */
export interface HealthProbeConfig {
    protocol: "Http" | "Https" | "Tcp";
    port: number;
    requestPath?: string;
    intervalInSeconds?: number;
    numberOfProbes?: number;
}
/**
 * Generate application health extension for VMSS
 *
 * @param config - Health probe configuration
 * @returns Application health extension
 */
export declare function vmssHealthExtension(config: HealthProbeConfig): any;
/**
 * Generate rolling upgrade policy
 *
 * @param maxBatchPercent - Max % of VMs to upgrade at once (default: 20)
 * @param maxUnhealthyPercent - Max % unhealthy before stopping (default: 20)
 * @param pauseTime - Pause between batches (default: PT0S)
 * @returns Rolling upgrade policy
 */
export declare function rollingUpgradePolicy(maxBatchPercent?: number, maxUnhealthyPercent?: number, pauseTime?: string): any;
/**
 * Calculate expected uptime for VMSS
 *
 * @param zoneCount - Number of zones (0 for regional, 1-3 for zonal)
 * @param instanceCount - Number of instances
 * @returns SLA percentage
 */
export declare function vmssSLA(zoneCount: number, instanceCount: number): number;
/**
 * Validate VMSS configuration
 *
 * @param config - VMSS configuration
 * @returns Validation result
 */
export declare function validateVMSSConfig(config: VMSSConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * VMSS best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function vmssBestPractices(): string;
/**
 * Export all VMSS functions
 */
export declare const vmss: {
    vmssFlexible: typeof vmssFlexible;
    vmssUniform: typeof vmssUniform;
    vmssAutoscale: typeof vmssAutoscale;
    cpuAutoscaleRules: typeof cpuAutoscaleRules;
    vmssHealthExtension: typeof vmssHealthExtension;
    rollingUpgradePolicy: typeof rollingUpgradePolicy;
    vmssSLA: typeof vmssSLA;
    validateVMSSConfig: typeof validateVMSSConfig;
    vmssBestPractices: typeof vmssBestPractices;
};
