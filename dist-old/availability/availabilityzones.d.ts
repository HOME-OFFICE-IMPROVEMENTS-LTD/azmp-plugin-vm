/**
 * Availability Zones Module
 *
 * Provides helpers for Azure Availability Zones configuration.
 * Availability Zones are physically separate datacenters within a region
 * providing 99.99% SLA when using 2+ VMs across zones.
 *
 * @module availability/availabilityzones
 */
/**
 * Zone Configuration
 */
export type ZoneNumber = "1" | "2" | "3";
export type ZoneArray = ZoneNumber[];
/**
 * Zone-Redundant Configuration
 */
export interface ZoneConfig {
    zones?: ZoneArray;
    zoneRedundant?: boolean;
    singleZone?: ZoneNumber;
}
/**
 * Zonal VM Configuration
 */
export interface ZonalVMConfig {
    name: string;
    location?: string;
    zone: ZoneNumber;
    vmSize?: string;
}
/**
 * Get zones for a specific Azure region
 *
 * @param location - Azure region name
 * @returns Available zones for the region
 */
export declare function getAvailableZones(location: string): ZoneArray;
/**
 * Check if region supports availability zones
 *
 * @param location - Azure region name
 * @returns True if region supports zones
 */
export declare function supportsAvailabilityZones(location: string): boolean;
/**
 * Generate VM with zone specification
 *
 * @param config - Zonal VM configuration
 * @returns VM template with zone
 *
 * @example
 * ```handlebars
 * {{availability:zonalVM name="myVM" zone="1" vmSize="Standard_D2s_v3"}}
 * ```
 */
export declare function zonalVM(config: ZonalVMConfig): any;
/**
 * Generate zone-redundant disk configuration
 *
 * @param diskName - Name of the disk
 * @param zones - Zones for redundancy
 * @returns Managed disk with ZRS
 *
 * @example
 * ```handlebars
 * {{availability:zoneRedundantDisk name="myDisk" zones="[1,2,3]"}}
 * ```
 */
export declare function zoneRedundantDisk(diskName: string, zones?: ZoneArray): {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    sku: {
        name: string;
    };
    zones?: ZoneArray;
    properties: {
        creationData: {
            createOption: string;
        };
        diskSizeGB: number;
    };
};
/**
 * Generate zone-redundant public IP address
 *
 * @param ipName - Name of the public IP
 * @param zones - Zones for redundancy
 * @returns Public IP with zone redundancy
 *
 * @example
 * ```handlebars
 * {{availability:zoneRedundantIP name="myIP"}}
 * ```
 */
export declare function zoneRedundantIP(ipName: string, zones?: ZoneArray): {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    sku: {
        name: string;
        tier: string;
    };
    zones?: ZoneArray;
    properties: {
        publicIPAllocationMethod: string;
    };
};
/**
 * Calculate expected uptime percentage for zones
 *
 * @param vmCount - Number of VMs
 * @param zoneCount - Number of zones used (1-3)
 * @returns SLA percentage
 */
export declare function availabilityZoneSLA(vmCount: number, zoneCount: number): number;
/**
 * Recommend zone distribution for VM count
 *
 * @param vmCount - Total number of VMs
 * @returns Recommended zone distribution
 */
export declare function recommendZoneDistribution(vmCount: number): {
    zones: ZoneArray;
    vmPerZone: number[];
    description: string;
};
/**
 * Validate zone configuration
 *
 * @param config - Zone configuration
 * @param location - Azure region
 * @returns Validation result
 */
export declare function validateZoneConfig(config: ZoneConfig, location: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Generate availability zones best practices documentation
 *
 * @returns Best practices as markdown string
 */
export declare function availabilityZonesBestPractices(): string;
/**
 * Get regions with availability zones support
 *
 * @returns Array of region names with zone support
 */
export declare function getZoneSupportedRegions(): string[];
/**
 * Export all availability zone functions
 */
export declare const availabilityZones: {
    getAvailableZones: typeof getAvailableZones;
    supportsAvailabilityZones: typeof supportsAvailabilityZones;
    zonalVM: typeof zonalVM;
    zoneRedundantDisk: typeof zoneRedundantDisk;
    zoneRedundantIP: typeof zoneRedundantIP;
    availabilityZoneSLA: typeof availabilityZoneSLA;
    recommendZoneDistribution: typeof recommendZoneDistribution;
    validateZoneConfig: typeof validateZoneConfig;
    availabilityZonesBestPractices: typeof availabilityZonesBestPractices;
    getZoneSupportedRegions: typeof getZoneSupportedRegions;
};
