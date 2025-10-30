"use strict";
/**
 * Availability Sets Module
 *
 * Provides helpers for Azure Availability Sets configuration.
 * Availability Sets ensure VMs are distributed across fault and update domains
 * for 99.95% SLA when using 2+ VMs.
 *
 * @module availability/availabilitysets
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilitySets = void 0;
exports.availabilitySet = availabilitySet;
exports.availabilitySetRef = availabilitySetRef;
exports.recommendedFaultDomains = recommendedFaultDomains;
exports.recommendedUpdateDomains = recommendedUpdateDomains;
exports.availabilitySetSLA = availabilitySetSLA;
exports.validateAvailabilitySet = validateAvailabilitySet;
exports.availabilitySetBestPractices = availabilitySetBestPractices;
exports.proximityPlacementGroup = proximityPlacementGroup;
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
function availabilitySet(config) {
    // Validate fault domain count (1-3)
    const faultDomains = config.platformFaultDomainCount ?? 2;
    if (faultDomains < 1 || faultDomains > 3) {
        throw new Error("Fault domain count must be between 1 and 3");
    }
    // Validate update domain count (1-20)
    const updateDomains = config.platformUpdateDomainCount ?? 5;
    if (updateDomains < 1 || updateDomains > 20) {
        throw new Error("Update domain count must be between 1 and 20");
    }
    const template = {
        type: "Microsoft.Compute/availabilitySets",
        apiVersion: "2023-09-01",
        name: config.name,
        location: config.location || "[resourceGroup().location]",
        sku: {
            name: config.sku || "Aligned",
        },
        properties: {
            platformFaultDomainCount: faultDomains,
            platformUpdateDomainCount: updateDomains,
        },
    };
    // Add proximity placement group if specified
    if (config.proximityPlacementGroupId) {
        template.properties.proximityPlacementGroup = {
            id: config.proximityPlacementGroupId,
        };
    }
    // Add tags if specified
    if (config.tags) {
        template.tags = config.tags;
    }
    return template;
}
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
function availabilitySetRef(availabilitySetName) {
    return {
        id: `[resourceId('Microsoft.Compute/availabilitySets', '${availabilitySetName}')]`,
    };
}
/**
 * Get recommended fault domain count based on VM count
 *
 * @param vmCount - Number of VMs in the availability set
 * @returns Recommended fault domain count
 */
function recommendedFaultDomains(vmCount) {
    if (vmCount <= 1)
        return 1;
    if (vmCount <= 3)
        return 2;
    return 3; // Maximum for standard availability sets
}
/**
 * Get recommended update domain count based on VM count
 *
 * @param vmCount - Number of VMs in the availability set
 * @returns Recommended update domain count
 */
function recommendedUpdateDomains(vmCount) {
    if (vmCount <= 1)
        return 1;
    if (vmCount <= 5)
        return Math.min(vmCount, 5);
    if (vmCount <= 10)
        return 10;
    return 20; // Maximum for availability sets
}
/**
 * Calculate expected uptime percentage for availability set
 *
 * @param vmCount - Number of VMs
 * @returns SLA percentage (e.g., 99.95)
 */
function availabilitySetSLA(vmCount) {
    if (vmCount < 2)
        return 99.9; // Single instance SLA
    return 99.95; // Availability set SLA with 2+ VMs
}
/**
 * Validate availability set configuration
 *
 * @param config - Availability set configuration to validate
 * @returns Validation result with errors if any
 */
function validateAvailabilitySet(config) {
    const errors = [];
    // Validate name
    if (!config.name || config.name.length === 0) {
        errors.push("Availability set name is required");
    }
    // Validate fault domains
    if (config.platformFaultDomainCount) {
        if (config.platformFaultDomainCount < 1 ||
            config.platformFaultDomainCount > 3) {
            errors.push("Fault domain count must be between 1 and 3");
        }
    }
    // Validate update domains
    if (config.platformUpdateDomainCount) {
        if (config.platformUpdateDomainCount < 1 ||
            config.platformUpdateDomainCount > 20) {
            errors.push("Update domain count must be between 1 and 20");
        }
    }
    // Validate SKU
    if (config.sku && !["Aligned", "Classic"].includes(config.sku)) {
        errors.push('SKU must be either "Aligned" or "Classic"');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Generate availability set best practices documentation
 *
 * @returns Best practices as markdown string
 */
function availabilitySetBestPractices() {
    return `
# Availability Set Best Practices

## When to Use
- Multiple VMs need 99.95% SLA
- VMs should survive single hardware failures
- Low-latency requirements within same region
- Cannot use availability zones (not all regions support them)

## Configuration Guidelines
- **Fault Domains**: Use 2-3 for redundancy across hardware racks
- **Update Domains**: Use 5-20 to spread planned maintenance impact
- **SKU**: Use "Aligned" for managed disks (required for Premium SSD)

## Limitations
- Cannot combine with availability zones
- Cannot select specific fault domains for VMs
- Doesn't protect against datacenter-wide outages
- Ultra Disks not supported
- Premium SSD v2 has limitations

## SLA
- Single VM: 99.9% (Premium SSD or better)
- Availability Set (2+ VMs): 99.95%
- Availability Zones (2+ VMs): 99.99%
  `.trim();
}
/**
 * Generate proximity placement group for ultra-low latency
 *
 * @param name - Proximity placement group name
 * @param location - Azure region
 * @returns Proximity placement group template
 */
function proximityPlacementGroup(name, location) {
    return {
        type: "Microsoft.Compute/proximityPlacementGroups",
        apiVersion: "2023-09-01",
        name,
        location: location || "[resourceGroup().location]",
        properties: {
            proximityPlacementGroupType: "Standard",
        },
    };
}
/**
 * Export all availability set functions
 */
exports.availabilitySets = {
    availabilitySet,
    availabilitySetRef,
    recommendedFaultDomains,
    recommendedUpdateDomains,
    availabilitySetSLA,
    validateAvailabilitySet,
    availabilitySetBestPractices,
    proximityPlacementGroup,
};
