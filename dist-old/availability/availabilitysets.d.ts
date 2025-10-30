/**
 * Availability Sets Module
 *
 * Provides helpers for Azure Availability Sets configuration.
 * Availability Sets ensure VMs are distributed across fault and update domains
 * for 99.95% SLA when using 2+ VMs.
 *
 * @module availability/availabilitysets
 */
/**
 * Availability Set Configuration
 */
export interface AvailabilitySetConfig {
    name: string;
    location?: string;
    platformFaultDomainCount?: number;
    platformUpdateDomainCount?: number;
    proximityPlacementGroupId?: string;
    sku?: "Aligned" | "Classic";
    tags?: Record<string, string>;
}
/**
 * Availability Set Template
 */
export interface AvailabilitySetTemplate {
    type: "Microsoft.Compute/availabilitySets";
    apiVersion: string;
    name: string;
    location: string;
    sku: {
        name: string;
    };
    properties: {
        platformFaultDomainCount: number;
        platformUpdateDomainCount: number;
        proximityPlacementGroup?: {
            id: string;
        };
    };
    tags?: Record<string, string>;
}
/**
 * Generate Availability Set ARM template
 *
 * @param config - Availability Set configuration
 * @returns ARM template JSON object
 *
 * @example
 * ```handlebars
 * {{availability:availabilitySet name="myAvSet" faultDomains=3 updateDomains=5}}
 * ```
 */
export declare function availabilitySet(config: AvailabilitySetConfig): AvailabilitySetTemplate;
/**
 * Generate Availability Set reference for VM
 *
 * @param availabilitySetName - Name of the availability set
 * @returns Availability set reference object
 *
 * @example
 * ```handlebars
 * {{availability:availabilitySetRef name="myAvSet"}}
 * ```
 */
export declare function availabilitySetRef(availabilitySetName: string): {
    id: string;
};
/**
 * Get recommended fault domain count based on VM count
 *
 * @param vmCount - Number of VMs in the availability set
 * @returns Recommended fault domain count
 */
export declare function recommendedFaultDomains(vmCount: number): number;
/**
 * Get recommended update domain count based on VM count
 *
 * @param vmCount - Number of VMs in the availability set
 * @returns Recommended update domain count
 */
export declare function recommendedUpdateDomains(vmCount: number): number;
/**
 * Calculate expected uptime percentage for availability set
 *
 * @param vmCount - Number of VMs
 * @returns SLA percentage (e.g., 99.95)
 */
export declare function availabilitySetSLA(vmCount: number): number;
/**
 * Validate availability set configuration
 *
 * @param config - Availability set configuration to validate
 * @returns Validation result with errors if any
 */
export declare function validateAvailabilitySet(config: AvailabilitySetConfig): {
    valid: boolean;
    errors: string[];
};
/**
 * Generate availability set best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function availabilitySetBestPractices(): string;
/**
 * Generate proximity placement group for ultra-low latency
 *
 * @param name - Proximity placement group name
 * @param location - Azure region
 * @returns Proximity placement group template
 */
export declare function proximityPlacementGroup(name: string, location?: string): {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    properties: {
        proximityPlacementGroupType: string;
    };
};
/**
 * Export all availability set functions
 */
export declare const availabilitySets: {
    availabilitySet: typeof availabilitySet;
    availabilitySetRef: typeof availabilitySetRef;
    recommendedFaultDomains: typeof recommendedFaultDomains;
    recommendedUpdateDomains: typeof recommendedUpdateDomains;
    availabilitySetSLA: typeof availabilitySetSLA;
    validateAvailabilitySet: typeof validateAvailabilitySet;
    availabilitySetBestPractices: typeof availabilitySetBestPractices;
    proximityPlacementGroup: typeof proximityPlacementGroup;
};
