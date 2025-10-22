/**
 * Azure VNet Peering Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
 */

/**
 * Peering State
 */
export type PeeringState = 'Connected' | 'Disconnected' | 'Initiated';

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
  readonly topology: 'hub-spoke' | 'mesh' | 'point-to-point';
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
export const VNET_PEERING_TEMPLATES = {
  /**
   * Hub VNet configuration
   */
  'hub-vnet': {
    name: 'Hub VNet Peering',
    description: 'Hub VNet in hub-and-spoke topology',
    allowVirtualNetworkAccess: true,
    allowForwardedTraffic: true,
    allowGatewayTransit: true,
    useRemoteGateways: false,
    topology: 'hub-spoke',
  },

  /**
   * Spoke VNet configuration
   */
  'spoke-vnet': {
    name: 'Spoke VNet Peering',
    description: 'Spoke VNet in hub-and-spoke topology',
    allowVirtualNetworkAccess: true,
    allowForwardedTraffic: true,
    allowGatewayTransit: false,
    useRemoteGateways: true,
    topology: 'hub-spoke',
  },

  /**
   * Mesh topology configuration
   */
  'mesh-vnet': {
    name: 'Mesh VNet Peering',
    description: 'VNet in mesh topology (all-to-all)',
    allowVirtualNetworkAccess: true,
    allowForwardedTraffic: true,
    allowGatewayTransit: false,
    useRemoteGateways: false,
    topology: 'mesh',
  },

  /**
   * Simple point-to-point peering
   */
  'point-to-point': {
    name: 'Point-to-Point VNet Peering',
    description: 'Simple VNet-to-VNet peering',
    allowVirtualNetworkAccess: true,
    allowForwardedTraffic: false,
    allowGatewayTransit: false,
    useRemoteGateways: false,
    topology: 'point-to-point',
  },

  /**
   * Transit VNet configuration
   */
  'transit-vnet': {
    name: 'Transit VNet Peering',
    description: 'VNet with transit capabilities',
    allowVirtualNetworkAccess: true,
    allowForwardedTraffic: true,
    allowGatewayTransit: true,
    useRemoteGateways: false,
    topology: 'hub-spoke',
  },
} as const;

export type VNetPeeringTemplateKey = keyof typeof VNET_PEERING_TEMPLATES;

/**
 * Hub-and-spoke topology templates
 */
export const HUB_SPOKE_TOPOLOGIES = {
  /**
   * Single hub with multiple spokes
   */
  'single-hub': {
    hubVNet: 'hub-vnet',
    spokeVNets: ['spoke-web', 'spoke-app', 'spoke-data'],
    enableGatewayTransit: true,
    centralizedServices: ['Azure Firewall', 'VPN Gateway', 'DNS'],
  },

  /**
   * Dual hub for high availability
   */
  'dual-hub': {
    hubVNet: 'hub-primary',
    spokeVNets: ['hub-secondary', 'spoke-web', 'spoke-app', 'spoke-data'],
    enableGatewayTransit: true,
    centralizedServices: ['Azure Firewall', 'VPN Gateway', 'ExpressRoute', 'DNS'],
  },

  /**
   * Regional hub-and-spoke
   */
  'regional-hub': {
    hubVNet: 'hub-eastus',
    spokeVNets: ['spoke-web-eastus', 'spoke-app-eastus', 'spoke-data-eastus'],
    enableGatewayTransit: true,
    centralizedServices: ['Azure Firewall', 'VPN Gateway'],
  },
} as const;

export type HubSpokeTopologyKey = keyof typeof HUB_SPOKE_TOPOLOGIES;

/**
 * Common peering scenarios
 */
export const PEERING_SCENARIOS = {
  'dev-prod-isolation': {
    name: 'Development-Production Isolation',
    description: 'Separate dev and prod environments with controlled access',
    peeringType: 'point-to-point',
    allowForwardedTraffic: false,
  },
  'multi-tier-app': {
    name: 'Multi-Tier Application',
    description: 'Separate tiers (web, app, data) across VNets',
    peeringType: 'hub-spoke',
    allowForwardedTraffic: true,
  },
  'shared-services': {
    name: 'Shared Services',
    description: 'Centralized services (DNS, AD) accessible from all VNets',
    peeringType: 'hub-spoke',
    allowForwardedTraffic: true,
  },
  'cross-region': {
    name: 'Cross-Region Connectivity',
    description: 'Global VNet peering across Azure regions',
    peeringType: 'point-to-point',
    allowForwardedTraffic: false,
  },
} as const;

export type PeeringScenarioKey = keyof typeof PEERING_SCENARIOS;

/**
 * Get VNet peering template by key
 */
export function getVNetPeeringTemplate(
  key: VNetPeeringTemplateKey
): typeof VNET_PEERING_TEMPLATES[VNetPeeringTemplateKey] | undefined {
  return VNET_PEERING_TEMPLATES[key];
}

/**
 * Get all VNet peering templates
 */
export function getAllVNetPeeringTemplates(): Array<{
  key: VNetPeeringTemplateKey;
  template: typeof VNET_PEERING_TEMPLATES[VNetPeeringTemplateKey];
}> {
  return Object.entries(VNET_PEERING_TEMPLATES).map(([key, template]) => ({
    key: key as VNetPeeringTemplateKey,
    template,
  }));
}

/**
 * Get hub-and-spoke topology by key
 */
export function getHubSpokeTopology(
  key: HubSpokeTopologyKey
): typeof HUB_SPOKE_TOPOLOGIES[HubSpokeTopologyKey] | undefined {
  return HUB_SPOKE_TOPOLOGIES[key];
}

/**
 * Get all hub-and-spoke topologies
 */
export function getAllHubSpokeTopologies(): Array<{
  key: HubSpokeTopologyKey;
  topology: typeof HUB_SPOKE_TOPOLOGIES[HubSpokeTopologyKey];
}> {
  return Object.entries(HUB_SPOKE_TOPOLOGIES).map(([key, topology]) => ({
    key: key as HubSpokeTopologyKey,
    topology,
  }));
}

/**
 * Get peering scenario by key
 */
export function getPeeringScenario(
  key: PeeringScenarioKey
): typeof PEERING_SCENARIOS[PeeringScenarioKey] | undefined {
  return PEERING_SCENARIOS[key];
}

/**
 * Get all peering scenarios
 */
export function getAllPeeringScenarios(): Array<{
  key: PeeringScenarioKey;
  scenario: typeof PEERING_SCENARIOS[PeeringScenarioKey];
}> {
  return Object.entries(PEERING_SCENARIOS).map(([key, scenario]) => ({
    key: key as PeeringScenarioKey,
    scenario,
  }));
}

/**
 * Validate peering configuration
 */
export function validatePeeringConfig(config: {
  allowGatewayTransit: boolean;
  useRemoteGateways: boolean;
}): { valid: boolean; error?: string } {
  if (config.allowGatewayTransit && config.useRemoteGateways) {
    return {
      valid: false,
      error: 'Cannot enable both allowGatewayTransit and useRemoteGateways on the same peering',
    };
  }
  return { valid: true };
}

/**
 * Check if peering is transitive (requires NVA or VPN Gateway)
 */
export function isTransitivePeeringSupported(topology: string): boolean {
  // VNet peering is not transitive by default
  // Requires network virtual appliance (NVA) or VPN Gateway
  return topology === 'hub-spoke' && topology.includes('gateway');
}

/**
 * Calculate number of peering connections for mesh topology
 */
export function calculateMeshPeeringCount(vnetCount: number): number {
  // For n VNets in mesh topology: n * (n - 1) / 2
  return (vnetCount * (vnetCount - 1)) / 2;
}

/**
 * Calculate number of peering connections for hub-spoke topology
 */
export function calculateHubSpokePeeringCount(spokeCount: number): number {
  // One peering per spoke to hub
  return spokeCount;
}
