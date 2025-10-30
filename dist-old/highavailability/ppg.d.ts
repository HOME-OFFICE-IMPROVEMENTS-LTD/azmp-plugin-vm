/**
 * Proximity Placement Group configuration options
 */
export interface ProximityPlacementGroupConfig {
    enabled: boolean;
    name?: string;
    resourceGroupName?: string;
    location: string;
    intent?: {
        vmSizes: string[];
        vmssInstanceCount?: number;
    };
}
/**
 * Azure region capability for PPG and availability zones
 */
export interface RegionCapability {
    region: string;
    supportsProximityPlacementGroups: boolean;
    supportedAvailabilityZones: string[];
    recommendedVmSizes: string[];
    limitations?: string[];
}
/**
 * Validates if a region supports proximity placement groups and availability zones
 */
export declare function validateRegionCapability(region: string): RegionCapability;
/**
 * Generates ARM template resource for proximity placement group
 */
export declare function generateProximityPlacementGroupResource(config: ProximityPlacementGroupConfig): object;
/**
 * Generates ARM template parameter for PPG configuration
 */
export declare function generatePPGParameters(): object;
/**
 * Generates conditional PPG reference for VM/VMSS resources
 */
export declare function generatePPGReference(config: ProximityPlacementGroupConfig): object;
/**
 * Validates PPG configuration against VM size and zone requirements
 */
export declare function validatePPGConfiguration(config: ProximityPlacementGroupConfig, vmSize: string, availabilityZones: string[]): string[];
/**
 * CLI helper for region validation
 */
export declare class ProximityPlacementGroupCLI {
    static checkRegion(region: string): void;
    static listSupportedRegions(): void;
    static validateVmSize(vmSize: string, region: string): void;
}
