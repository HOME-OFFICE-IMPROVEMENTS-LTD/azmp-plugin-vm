/**
 * Azure VNet Peering Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
 */
/**
 * Peering State
 */
export type PeeringState = "Connected" | "Disconnected" | "Initiated";
/**
 * VNet Peering Template Configuration
 */
export interface VNetPeeringTemplate {
    readonly name: string;
    readonly description: string;
    readonly allowVirtualNetworkAccess: boolean;
    readonly allowForwardedTraffic: boolean;
    readonly allowGatewayTransit: boolean;
    readonly useRemoteGateways: boolean;
    readonly topology: "hub-spoke" | "mesh" | "point-to-point";
}
/**
 * Hub-and-Spoke Topology Configuration
 */
export interface HubSpokeConfig {
    readonly hubVNet: string;
    readonly spokeVNets: readonly string[];
    readonly enableGatewayTransit: boolean;
    readonly centralizedServices: readonly string[];
}
/**
 * VNet peering templates
 */
export declare const VNET_PEERING_TEMPLATES: {
    /**
     * Hub VNet configuration
     */
    readonly "hub-vnet": {
        readonly name: "Hub VNet Peering";
        readonly description: "Hub VNet in hub-and-spoke topology";
        readonly allowVirtualNetworkAccess: true;
        readonly allowForwardedTraffic: true;
        readonly allowGatewayTransit: true;
        readonly useRemoteGateways: false;
        readonly topology: "hub-spoke";
    };
    /**
     * Spoke VNet configuration
     */
    readonly "spoke-vnet": {
        readonly name: "Spoke VNet Peering";
        readonly description: "Spoke VNet in hub-and-spoke topology";
        readonly allowVirtualNetworkAccess: true;
        readonly allowForwardedTraffic: true;
        readonly allowGatewayTransit: false;
        readonly useRemoteGateways: true;
        readonly topology: "hub-spoke";
    };
    /**
     * Mesh topology configuration
     */
    readonly "mesh-vnet": {
        readonly name: "Mesh VNet Peering";
        readonly description: "VNet in mesh topology (all-to-all)";
        readonly allowVirtualNetworkAccess: true;
        readonly allowForwardedTraffic: true;
        readonly allowGatewayTransit: false;
        readonly useRemoteGateways: false;
        readonly topology: "mesh";
    };
    /**
     * Simple point-to-point peering
     */
    readonly "point-to-point": {
        readonly name: "Point-to-Point VNet Peering";
        readonly description: "Simple VNet-to-VNet peering";
        readonly allowVirtualNetworkAccess: true;
        readonly allowForwardedTraffic: false;
        readonly allowGatewayTransit: false;
        readonly useRemoteGateways: false;
        readonly topology: "point-to-point";
    };
    /**
     * Transit VNet configuration
     */
    readonly "transit-vnet": {
        readonly name: "Transit VNet Peering";
        readonly description: "VNet with transit capabilities";
        readonly allowVirtualNetworkAccess: true;
        readonly allowForwardedTraffic: true;
        readonly allowGatewayTransit: true;
        readonly useRemoteGateways: false;
        readonly topology: "hub-spoke";
    };
};
export type VNetPeeringTemplateKey = keyof typeof VNET_PEERING_TEMPLATES;
/**
 * Hub-and-spoke topology templates
 */
export declare const HUB_SPOKE_TOPOLOGIES: {
    /**
     * Single hub with multiple spokes
     */
    readonly "single-hub": {
        readonly hubVNet: "hub-vnet";
        readonly spokeVNets: readonly ["spoke-web", "spoke-app", "spoke-data"];
        readonly enableGatewayTransit: true;
        readonly centralizedServices: readonly ["Azure Firewall", "VPN Gateway", "DNS"];
    };
    /**
     * Dual hub for high availability
     */
    readonly "dual-hub": {
        readonly hubVNet: "hub-primary";
        readonly spokeVNets: readonly ["hub-secondary", "spoke-web", "spoke-app", "spoke-data"];
        readonly enableGatewayTransit: true;
        readonly centralizedServices: readonly ["Azure Firewall", "VPN Gateway", "ExpressRoute", "DNS"];
    };
    /**
     * Regional hub-and-spoke
     */
    readonly "regional-hub": {
        readonly hubVNet: "hub-eastus";
        readonly spokeVNets: readonly ["spoke-web-eastus", "spoke-app-eastus", "spoke-data-eastus"];
        readonly enableGatewayTransit: true;
        readonly centralizedServices: readonly ["Azure Firewall", "VPN Gateway"];
    };
};
export type HubSpokeTopologyKey = keyof typeof HUB_SPOKE_TOPOLOGIES;
/**
 * Common peering scenarios
 */
export declare const PEERING_SCENARIOS: {
    readonly "dev-prod-isolation": {
        readonly name: "Development-Production Isolation";
        readonly description: "Separate dev and prod environments with controlled access";
        readonly peeringType: "point-to-point";
        readonly allowForwardedTraffic: false;
    };
    readonly "multi-tier-app": {
        readonly name: "Multi-Tier Application";
        readonly description: "Separate tiers (web, app, data) across VNets";
        readonly peeringType: "hub-spoke";
        readonly allowForwardedTraffic: true;
    };
    readonly "shared-services": {
        readonly name: "Shared Services";
        readonly description: "Centralized services (DNS, AD) accessible from all VNets";
        readonly peeringType: "hub-spoke";
        readonly allowForwardedTraffic: true;
    };
    readonly "cross-region": {
        readonly name: "Cross-Region Connectivity";
        readonly description: "Global VNet peering across Azure regions";
        readonly peeringType: "point-to-point";
        readonly allowForwardedTraffic: false;
    };
};
export type PeeringScenarioKey = keyof typeof PEERING_SCENARIOS;
/**
 * Get VNet peering template by key
 */
export declare function getVNetPeeringTemplate(key: VNetPeeringTemplateKey): (typeof VNET_PEERING_TEMPLATES)[VNetPeeringTemplateKey] | undefined;
/**
 * Get all VNet peering templates
 */
export declare function getAllVNetPeeringTemplates(): Array<{
    key: VNetPeeringTemplateKey;
    template: (typeof VNET_PEERING_TEMPLATES)[VNetPeeringTemplateKey];
}>;
/**
 * Get hub-and-spoke topology by key
 */
export declare function getHubSpokeTopology(key: HubSpokeTopologyKey): (typeof HUB_SPOKE_TOPOLOGIES)[HubSpokeTopologyKey] | undefined;
/**
 * Get all hub-and-spoke topologies
 */
export declare function getAllHubSpokeTopologies(): Array<{
    key: HubSpokeTopologyKey;
    topology: (typeof HUB_SPOKE_TOPOLOGIES)[HubSpokeTopologyKey];
}>;
/**
 * Get peering scenario by key
 */
export declare function getPeeringScenario(key: PeeringScenarioKey): (typeof PEERING_SCENARIOS)[PeeringScenarioKey] | undefined;
/**
 * Get all peering scenarios
 */
export declare function getAllPeeringScenarios(): Array<{
    key: PeeringScenarioKey;
    scenario: (typeof PEERING_SCENARIOS)[PeeringScenarioKey];
}>;
/**
 * Validate peering configuration
 */
export declare function validatePeeringConfig(config: {
    allowGatewayTransit: boolean;
    useRemoteGateways: boolean;
}): {
    valid: boolean;
    error?: string;
};
/**
 * Check if peering is transitive (requires NVA or VPN Gateway)
 */
export declare function isTransitivePeeringSupported(topology: string): boolean;
/**
 * Calculate number of peering connections for mesh topology
 */
export declare function calculateMeshPeeringCount(vnetCount: number): number;
/**
 * Calculate number of peering connections for hub-spoke topology
 */
export declare function calculateHubSpokePeeringCount(spokeCount: number): number;
