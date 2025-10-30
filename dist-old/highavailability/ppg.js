"use strict";
// Proximity Placement Group helpers for Azure VM clusters
// Provides PPG creation, validation, and regional capability checks
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProximityPlacementGroupCLI = void 0;
exports.validateRegionCapability = validateRegionCapability;
exports.generateProximityPlacementGroupResource = generateProximityPlacementGroupResource;
exports.generatePPGParameters = generatePPGParameters;
exports.generatePPGReference = generatePPGReference;
exports.validatePPGConfiguration = validatePPGConfiguration;
/**
 * Validates if a region supports proximity placement groups and availability zones
 */
function validateRegionCapability(region) {
    // Azure regions with PPG and availability zone support
    // Based on Azure documentation as of 2025-10-27
    const regionCapabilities = {
        // North America
        'eastus': {
            region: 'eastus',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'eastus2': {
            region: 'eastus2',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'westus2': {
            region: 'westus2',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'westus3': {
            region: 'westus3',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'centralus': {
            region: 'centralus',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        // Europe
        'northeurope': {
            region: 'northeurope',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'westeurope': {
            region: 'westeurope',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'uksouth': {
            region: 'uksouth',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'francecentral': {
            region: 'francecentral',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        // Asia Pacific
        'southeastasia': {
            region: 'southeastasia',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'eastasia': {
            region: 'eastasia',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'japaneast': {
            region: 'japaneast',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        'australiaeast': {
            region: 'australiaeast',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3', 'Standard_F2s_v2', 'Standard_F4s_v2'],
            limitations: []
        },
        // Regions with limitations
        'westus': {
            region: 'westus',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: [],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3'],
            limitations: ['No availability zones support', 'PPG available but limited capacity']
        },
        'southcentralus': {
            region: 'southcentralus',
            supportsProximityPlacementGroups: true,
            supportedAvailabilityZones: ['1', '2', '3'],
            recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3'],
            limitations: ['Limited VM size selection for PPG']
        }
    };
    const capability = regionCapabilities[region.toLowerCase()];
    if (!capability) {
        // Unknown region - return conservative defaults
        return {
            region,
            supportsProximityPlacementGroups: false,
            supportedAvailabilityZones: [],
            recommendedVmSizes: [],
            limitations: ['Region not validated for PPG support', 'Contact Azure support for capability confirmation']
        };
    }
    return capability;
}
/**
 * Generates ARM template resource for proximity placement group
 */
function generateProximityPlacementGroupResource(config) {
    if (!config.enabled) {
        return {};
    }
    const ppgName = config.name || '[concat(parameters("vmName"), "-ppg")]';
    const resourceGroupName = config.resourceGroupName || '[resourceGroup().name]';
    return {
        type: 'Microsoft.Compute/proximityPlacementGroups',
        apiVersion: '2023-03-01',
        name: ppgName,
        location: config.location || '[resourceGroup().location]',
        properties: {
            proximityPlacementGroupType: 'Standard',
            intent: config.intent || {
                vmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3']
            }
        },
        tags: {
            purpose: 'HighAvailabilityCluster',
            createdBy: 'azmp-plugin-vm',
            version: '1.11.0'
        }
    };
}
/**
 * Generates ARM template parameter for PPG configuration
 */
function generatePPGParameters() {
    return {
        enableProximityPlacementGroup: {
            type: 'bool',
            defaultValue: false,
            metadata: {
                description: 'Enable proximity placement group for low-latency clustering'
            }
        },
        proximityPlacementGroupName: {
            type: 'string',
            defaultValue: '[concat(parameters("vmName"), "-ppg")]',
            metadata: {
                description: 'Name for the proximity placement group'
            }
        }
    };
}
/**
 * Generates conditional PPG reference for VM/VMSS resources
 */
function generatePPGReference(config) {
    if (!config.enabled) {
        return {};
    }
    return {
        proximityPlacementGroup: {
            id: `[resourceId('Microsoft.Compute/proximityPlacementGroups', '${config.name || '[parameters("proximityPlacementGroupName")]'}')]`
        }
    };
}
/**
 * Validates PPG configuration against VM size and zone requirements
 */
function validatePPGConfiguration(config, vmSize, availabilityZones) {
    const errors = [];
    if (!config.enabled) {
        return errors;
    }
    // Validate region capability
    const regionCapability = validateRegionCapability(config.location);
    if (!regionCapability.supportsProximityPlacementGroups) {
        errors.push(`Region ${config.location} does not support proximity placement groups`);
    }
    // Validate VM size compatibility
    if (config.intent?.vmSizes && !config.intent.vmSizes.includes(vmSize)) {
        errors.push(`VM size ${vmSize} not included in PPG intent configuration`);
    }
    // Validate zone compatibility
    if (availabilityZones.length > 0) {
        const unsupportedZones = availabilityZones.filter(zone => !regionCapability.supportedAvailabilityZones.includes(zone));
        if (unsupportedZones.length > 0) {
            errors.push(`Availability zones ${unsupportedZones.join(', ')} not supported in ${config.location}`);
        }
    }
    return errors;
}
/**
 * CLI helper for region validation
 */
class ProximityPlacementGroupCLI {
    static checkRegion(region) {
        console.log(`\n🔍 Checking region capability: ${region.toUpperCase()}`);
        console.log("=".repeat(50));
        const capability = validateRegionCapability(region);
        // PPG Support
        if (capability.supportsProximityPlacementGroups) {
            console.log(`✅ Proximity Placement Groups: SUPPORTED`);
        }
        else {
            console.log(`❌ Proximity Placement Groups: NOT SUPPORTED`);
        }
        // Availability Zones
        if (capability.supportedAvailabilityZones.length > 0) {
            console.log(`✅ Availability Zones: ${capability.supportedAvailabilityZones.join(', ')}`);
        }
        else {
            console.log(`❌ Availability Zones: NOT SUPPORTED`);
        }
        // Recommended VM Sizes
        if (capability.recommendedVmSizes.length > 0) {
            console.log(`✅ Recommended VM Sizes:`);
            capability.recommendedVmSizes.forEach(size => {
                console.log(`   • ${size}`);
            });
        }
        else {
            console.log(`⚠️  No recommended VM sizes available`);
        }
        // Limitations
        if (capability.limitations && capability.limitations.length > 0) {
            console.log(`\n⚠️  Limitations:`);
            capability.limitations.forEach(limitation => {
                console.log(`   • ${limitation}`);
            });
        }
        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (capability.supportsProximityPlacementGroups && capability.supportedAvailabilityZones.length >= 2) {
            console.log(`   • Region ${region} is EXCELLENT for HA clusters`);
            console.log(`   • Use PPG + multi-zone VMSS for optimal performance`);
        }
        else if (capability.supportsProximityPlacementGroups) {
            console.log(`   • Region ${region} supports PPG but limited zones`);
            console.log(`   • Consider PPG for low-latency, single-zone deployments`);
        }
        else {
            console.log(`   • Region ${region} not recommended for HA clusters`);
            console.log(`   • Consider alternative regions with PPG support`);
        }
        console.log("=".repeat(50));
    }
    static listSupportedRegions() {
        console.log(`\n🌍 Azure Regions with PPG + Zone Support:`);
        console.log("=".repeat(60));
        const regions = [
            'eastus', 'eastus2', 'westus2', 'westus3', 'centralus',
            'northeurope', 'westeurope', 'uksouth', 'francecentral',
            'southeastasia', 'eastasia', 'japaneast', 'australiaeast'
        ];
        regions.forEach(region => {
            const capability = validateRegionCapability(region);
            const zoneCount = capability.supportedAvailabilityZones.length;
            const status = capability.supportsProximityPlacementGroups && zoneCount >= 2 ? '✅' : '⚠️ ';
            console.log(`${status} ${region.padEnd(20)} (${zoneCount} zones)`);
        });
        console.log('\n💡 ✅ = Recommended for HA clusters');
        console.log('   ⚠️  = Limited support or single zone');
        console.log("=".repeat(60));
    }
    static validateVmSize(vmSize, region) {
        console.log(`\n🖥️  Validating VM size: ${vmSize} in ${region.toUpperCase()}`);
        console.log("=".repeat(50));
        const capability = validateRegionCapability(region);
        const isRecommended = capability.recommendedVmSizes.includes(vmSize);
        if (isRecommended) {
            console.log(`✅ ${vmSize} is RECOMMENDED for PPG in ${region}`);
        }
        else {
            console.log(`⚠️  ${vmSize} not in recommended list for ${region}`);
            console.log(`💡 Consider these alternatives:`);
            capability.recommendedVmSizes.slice(0, 3).forEach(size => {
                console.log(`   • ${size}`);
            });
        }
        console.log("=".repeat(50));
    }
}
exports.ProximityPlacementGroupCLI = ProximityPlacementGroupCLI;
