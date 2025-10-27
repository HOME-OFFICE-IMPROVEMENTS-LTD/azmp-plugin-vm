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
  zones?: ZoneArray; // Specific zones: ['1', '2', '3']
  zoneRedundant?: boolean; // Distribute across all zones
  singleZone?: ZoneNumber; // Deploy to specific zone
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
export function getAvailableZones(location: string): ZoneArray {
  // Regions with 3 availability zones
  const threeZoneRegions = [
    "eastus",
    "eastus2",
    "westus2",
    "westus3",
    "centralus",
    "southcentralus",
    "northeurope",
    "westeurope",
    "francecentral",
    "uksouth",
    "germanywestcentral",
    "norwayeast",
    "switzerlandnorth",
    "swedencentral",
    "polandcentral",
    "southeastasia",
    "eastasia",
    "australiaeast",
    "japaneast",
    "koreacentral",
    "southafricanorth",
    "brazilsouth",
    "canadacentral",
    "uaenorth",
    "qatarcentral",
    "israelcentral",
  ];

  const normalizedLocation = location.toLowerCase().replace(/\s/g, "");

  if (threeZoneRegions.includes(normalizedLocation)) {
    return ["1", "2", "3"];
  }

  // Regions without zones return empty array
  return [];
}

/**
 * Check if region supports availability zones
 *
 * @param location - Azure region name
 * @returns True if region supports zones
 */
export function supportsAvailabilityZones(location: string): boolean {
  return getAvailableZones(location).length > 0;
}

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
export function zonalVM(config: ZonalVMConfig): any {
  const template: any = {
    type: "Microsoft.Compute/virtualMachines",
    apiVersion: "2023-09-01",
    name: config.name,
    location: config.location || "[resourceGroup().location]",
    zones: [config.zone],
  };

  // Add VM size if provided
  if (config.vmSize) {
    template.properties = {
      hardwareProfile: {
        vmSize: config.vmSize,
      },
    };
  }

  return template;
}

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
export function zoneRedundantDisk(
  diskName: string,
  zones?: ZoneArray,
): {
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
} {
  return {
    type: "Microsoft.Compute/disks",
    apiVersion: "2023-04-02",
    name: diskName,
    location: "[resourceGroup().location]",
    sku: {
      name: "Premium_ZRS", // Zone-redundant storage
    },
    zones: zones || ["1", "2", "3"],
    properties: {
      creationData: {
        createOption: "Empty",
      },
      diskSizeGB: 128,
    },
  };
}

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
export function zoneRedundantIP(
  ipName: string,
  zones?: ZoneArray,
): {
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
} {
  return {
    type: "Microsoft.Network/publicIPAddresses",
    apiVersion: "2023-09-01",
    name: ipName,
    location: "[resourceGroup().location]",
    sku: {
      name: "Standard", // Standard SKU required for zone redundancy
      tier: "Regional",
    },
    zones: zones || ["1", "2", "3"],
    properties: {
      publicIPAllocationMethod: "Static",
    },
  };
}

/**
 * Calculate expected uptime percentage for zones
 *
 * @param vmCount - Number of VMs
 * @param zoneCount - Number of zones used (1-3)
 * @returns SLA percentage
 */
export function availabilityZoneSLA(
  vmCount: number,
  zoneCount: number,
): number {
  if (vmCount < 2 || zoneCount < 2) {
    return 99.9; // Single instance or single zone
  }
  return 99.99; // Multi-zone deployment with 2+ VMs
}

/**
 * Recommend zone distribution for VM count
 *
 * @param vmCount - Total number of VMs
 * @returns Recommended zone distribution
 */
export function recommendZoneDistribution(vmCount: number): {
  zones: ZoneArray;
  vmPerZone: number[];
  description: string;
} {
  if (vmCount === 1) {
    return {
      zones: ["1"],
      vmPerZone: [1],
      description: "Single VM in zone 1 (99.9% SLA)",
    };
  }

  if (vmCount === 2) {
    return {
      zones: ["1", "2"],
      vmPerZone: [1, 1],
      description: "1 VM per zone across 2 zones (99.99% SLA)",
    };
  }

  // Distribute evenly across 3 zones
  const basePerZone = Math.floor(vmCount / 3);
  const remainder = vmCount % 3;

  const vmPerZone = [
    basePerZone + (remainder > 0 ? 1 : 0),
    basePerZone + (remainder > 1 ? 1 : 0),
    basePerZone,
  ];

  return {
    zones: ["1", "2", "3"],
    vmPerZone,
    description: `${vmPerZone[0]}-${vmPerZone[1]}-${vmPerZone[2]} distribution across 3 zones (99.99% SLA)`,
  };
}

/**
 * Validate zone configuration
 *
 * @param config - Zone configuration
 * @param location - Azure region
 * @returns Validation result
 */
export function validateZoneConfig(
  config: ZoneConfig,
  location: string,
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if location supports zones
  if (!supportsAvailabilityZones(location)) {
    errors.push(`Region ${location} does not support availability zones`);
    return { valid: false, errors, warnings };
  }

  // Validate zone numbers
  if (config.zones) {
    const validZones: ZoneNumber[] = ["1", "2", "3"];
    for (const zone of config.zones) {
      if (!validZones.includes(zone)) {
        errors.push(`Invalid zone number: ${zone}. Must be '1', '2', or '3'`);
      }
    }
  }

  // Validate single zone
  if (config.singleZone) {
    const validZones: ZoneNumber[] = ["1", "2", "3"];
    if (!validZones.includes(config.singleZone)) {
      errors.push(
        `Invalid zone number: ${config.singleZone}. Must be '1', '2', or '3'`,
      );
    }
  }

  // Warning for single zone deployment
  if (config.singleZone && !config.zoneRedundant) {
    warnings.push(
      "Single zone deployment provides 99.9% SLA. Consider multi-zone for 99.99% SLA",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate availability zones best practices documentation
 *
 * @returns Best practices as markdown string
 */
export function availabilityZonesBestPractices(): string {
  return `
# Availability Zones Best Practices

## When to Use
- Need 99.99% uptime SLA
- Protection against datacenter-wide failures
- Multiple VMs across different physical locations
- Regional disaster recovery

## Configuration Guidelines
- **Multi-Zone**: Deploy VMs across 2-3 zones for highest availability
- **Zone-Redundant Resources**: Use ZRS disks and Standard SKU public IPs
- **Load Balancing**: Distribute traffic across zones
- **Latency Consideration**: Zones have ~2ms inter-zone latency

## Supported Resources
- ✅ Virtual Machines
- ✅ Managed Disks (ZRS)
- ✅ Public IP Addresses (Standard SKU)
- ✅ Load Balancers (Standard SKU)
- ✅ Application Gateways (v2)

## Limitations
- Not all regions support availability zones
- Slightly higher latency vs single zone
- Cannot combine with availability sets
- Some VM sizes not available in all zones

## SLA Comparison
- Single VM (Premium SSD): 99.9%
- Availability Set (2+ VMs): 99.95%
- Availability Zones (2+ VMs): 99.99% ⭐

## Cost Implications
- No additional cost for using zones
- Zone-redundant storage (ZRS) costs ~20% more than LRS
- Inter-zone bandwidth is free within same region
  `.trim();
}

/**
 * Get regions with availability zones support
 *
 * @returns Array of region names with zone support
 */
export function getZoneSupportedRegions(): string[] {
  return [
    // Americas
    "eastus",
    "eastus2",
    "westus2",
    "westus3",
    "centralus",
    "southcentralus",
    "canadacentral",
    "brazilsouth",

    // Europe
    "northeurope",
    "westeurope",
    "francecentral",
    "uksouth",
    "germanywestcentral",
    "norwayeast",
    "switzerlandnorth",
    "swedencentral",
    "polandcentral",

    // Asia Pacific
    "southeastasia",
    "eastasia",
    "australiaeast",
    "japaneast",
    "koreacentral",
    "southafricanorth",

    // Middle East
    "uaenorth",
    "qatarcentral",
    "israelcentral",
  ];
}

/**
 * Export all availability zone functions
 */
export const availabilityZones = {
  getAvailableZones,
  supportsAvailabilityZones,
  zonalVM,
  zoneRedundantDisk,
  zoneRedundantIP,
  availabilityZoneSLA,
  recommendZoneDistribution,
  validateZoneConfig,
  availabilityZonesBestPractices,
  getZoneSupportedRegions,
};
