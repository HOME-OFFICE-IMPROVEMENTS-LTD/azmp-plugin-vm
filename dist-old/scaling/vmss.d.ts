/**
 * Scaling Module - Virtual Machine Scale Set Definition
 *
 * Provides the base VMSS resource definition helper that other scaling helpers
 * can build upon.
 *
 * @module scaling/vmss
 */
export type VmssOrchestrationMode = "Uniform" | "Flexible";
export type VmssUpgradeMode = "Manual" | "Automatic" | "Rolling";
/**
 * Options accepted by the VMSS definition helper.
 */
export interface VmssDefinitionOptions {
    name: string;
    vmSize: string;
    location?: string;
    instanceCount?: number;
    orchestrationMode?: VmssOrchestrationMode;
    upgradeMode?: VmssUpgradeMode;
    overprovision?: boolean;
    singlePlacementGroup?: boolean;
    platformFaultDomainCount?: number;
    zones?: string[];
    tags?: Record<string, string>;
}
/**
 * Create the core Virtual Machine Scale Set ARM template resource definition.
 *
 * @param options - VMSS configuration options
 * @returns ARM template resource for VMSS
 */
export declare function createVmssDefinition(options: VmssDefinitionOptions): Record<string, unknown>;
/**
 * Exported helper map for registration.
 */
export declare const vmssHelpers: {
    "scale:vmss.definition": typeof createVmssDefinition;
};
