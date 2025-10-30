"use strict";
/**
 * Azure VNet Peering Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PEERING_SCENARIOS = exports.HUB_SPOKE_TOPOLOGIES = exports.VNET_PEERING_TEMPLATES = void 0;
exports.getVNetPeeringTemplate = getVNetPeeringTemplate;
exports.getAllVNetPeeringTemplates = getAllVNetPeeringTemplates;
exports.getHubSpokeTopology = getHubSpokeTopology;
exports.getAllHubSpokeTopologies = getAllHubSpokeTopologies;
exports.getPeeringScenario = getPeeringScenario;
exports.getAllPeeringScenarios = getAllPeeringScenarios;
exports.validatePeeringConfig = validatePeeringConfig;
exports.isTransitivePeeringSupported = isTransitivePeeringSupported;
exports.calculateMeshPeeringCount = calculateMeshPeeringCount;
exports.calculateHubSpokePeeringCount = calculateHubSpokePeeringCount;
/**
 * VNet peering templates
 */
exports.VNET_PEERING_TEMPLATES = {
    /**
     * Hub VNet configuration
     */
    "hub-vnet": {
        name: "Hub VNet Peering",
        description: "Hub VNet in hub-and-spoke topology",
        allowVirtualNetworkAccess: true,
        allowForwardedTraffic: true,
        allowGatewayTransit: true,
        useRemoteGateways: false,
        topology: "hub-spoke",
    },
    /**
     * Spoke VNet configuration
     */
    "spoke-vnet": {
        name: "Spoke VNet Peering",
        description: "Spoke VNet in hub-and-spoke topology",
        allowVirtualNetworkAccess: true,
        allowForwardedTraffic: true,
        allowGatewayTransit: false,
        useRemoteGateways: true,
        topology: "hub-spoke",
    },
    /**
     * Mesh topology configuration
     */
    "mesh-vnet": {
        name: "Mesh VNet Peering",
        description: "VNet in mesh topology (all-to-all)",
        allowVirtualNetworkAccess: true,
        allowForwardedTraffic: true,
        allowGatewayTransit: false,
        useRemoteGateways: false,
        topology: "mesh",
    },
    /**
     * Simple point-to-point peering
     */
    "point-to-point": {
        name: "Point-to-Point VNet Peering",
        description: "Simple VNet-to-VNet peering",
        allowVirtualNetworkAccess: true,
        allowForwardedTraffic: false,
        allowGatewayTransit: false,
        useRemoteGateways: false,
        topology: "point-to-point",
    },
    /**
     * Transit VNet configuration
     */
    "transit-vnet": {
        name: "Transit VNet Peering",
        description: "VNet with transit capabilities",
        allowVirtualNetworkAccess: true,
        allowForwardedTraffic: true,
        allowGatewayTransit: true,
        useRemoteGateways: false,
        topology: "hub-spoke",
    },
};
/**
 * Hub-and-spoke topology templates
 */
exports.HUB_SPOKE_TOPOLOGIES = {
    /**
     * Single hub with multiple spokes
     */
    "single-hub": {
        hubVNet: "hub-vnet",
        spokeVNets: ["spoke-web", "spoke-app", "spoke-data"],
        enableGatewayTransit: true,
        centralizedServices: ["Azure Firewall", "VPN Gateway", "DNS"],
    },
    /**
     * Dual hub for high availability
     */
    "dual-hub": {
        hubVNet: "hub-primary",
        spokeVNets: ["hub-secondary", "spoke-web", "spoke-app", "spoke-data"],
        enableGatewayTransit: true,
        centralizedServices: [
            "Azure Firewall",
            "VPN Gateway",
            "ExpressRoute",
            "DNS",
        ],
    },
    /**
     * Regional hub-and-spoke
     */
    "regional-hub": {
        hubVNet: "hub-eastus",
        spokeVNets: ["spoke-web-eastus", "spoke-app-eastus", "spoke-data-eastus"],
        enableGatewayTransit: true,
        centralizedServices: ["Azure Firewall", "VPN Gateway"],
    },
};
/**
 * Common peering scenarios
 */
exports.PEERING_SCENARIOS = {
    "dev-prod-isolation": {
        name: "Development-Production Isolation",
        description: "Separate dev and prod environments with controlled access",
        peeringType: "point-to-point",
        allowForwardedTraffic: false,
    },
    "multi-tier-app": {
        name: "Multi-Tier Application",
        description: "Separate tiers (web, app, data) across VNets",
        peeringType: "hub-spoke",
        allowForwardedTraffic: true,
    },
    "shared-services": {
        name: "Shared Services",
        description: "Centralized services (DNS, AD) accessible from all VNets",
        peeringType: "hub-spoke",
        allowForwardedTraffic: true,
    },
    "cross-region": {
        name: "Cross-Region Connectivity",
        description: "Global VNet peering across Azure regions",
        peeringType: "point-to-point",
        allowForwardedTraffic: false,
    },
};
/**
 * Get VNet peering template by key
 */
function getVNetPeeringTemplate(key) {
    return exports.VNET_PEERING_TEMPLATES[key];
}
/**
 * Get all VNet peering templates
 */
function getAllVNetPeeringTemplates() {
    return Object.entries(exports.VNET_PEERING_TEMPLATES).map(([key, template]) => ({
        key: key,
        template,
    }));
}
/**
 * Get hub-and-spoke topology by key
 */
function getHubSpokeTopology(key) {
    return exports.HUB_SPOKE_TOPOLOGIES[key];
}
/**
 * Get all hub-and-spoke topologies
 */
function getAllHubSpokeTopologies() {
    return Object.entries(exports.HUB_SPOKE_TOPOLOGIES).map(([key, topology]) => ({
        key: key,
        topology,
    }));
}
/**
 * Get peering scenario by key
 */
function getPeeringScenario(key) {
    return exports.PEERING_SCENARIOS[key];
}
/**
 * Get all peering scenarios
 */
function getAllPeeringScenarios() {
    return Object.entries(exports.PEERING_SCENARIOS).map(([key, scenario]) => ({
        key: key,
        scenario,
    }));
}
/**
 * Validate peering configuration
 */
function validatePeeringConfig(config) {
    if (config.allowGatewayTransit && config.useRemoteGateways) {
        return {
            valid: false,
            error: "Cannot enable both allowGatewayTransit and useRemoteGateways on the same peering",
        };
    }
    return { valid: true };
}
/**
 * Check if peering is transitive (requires NVA or VPN Gateway)
 */
function isTransitivePeeringSupported(topology) {
    // VNet peering is not transitive by default
    // Requires network virtual appliance (NVA) or VPN Gateway
    return topology === "hub-spoke" && topology.includes("gateway");
}
/**
 * Calculate number of peering connections for mesh topology
 */
function calculateMeshPeeringCount(vnetCount) {
    // For n VNets in mesh topology: n * (n - 1) / 2
    return (vnetCount * (vnetCount - 1)) / 2;
}
/**
 * Calculate number of peering connections for hub-spoke topology
 */
function calculateHubSpokePeeringCount(spokeCount) {
    // One peering per spoke to hub
    return spokeCount;
}
