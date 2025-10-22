/**
 * Azure Subnet Configuration Patterns
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-subnet
 */

import { SubnetConfig } from './vnets';

/**
 * Common subnet patterns for multi-tier architectures
 */
export const SUBNET_PATTERNS = {
  /**
   * Default subnet - General purpose workloads
   */
  default: {
    name: 'default',
    addressPrefix: '10.0.0.0/24',
    description: 'Default subnet for general workloads',
    serviceEndpoints: [],
  },

  /**
   * Web tier - Public-facing web servers
   */
  web: {
    name: 'web',
    addressPrefix: '10.0.1.0/24',
    description: 'Web tier subnet for public-facing web servers',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.KeyVault'],
  },

  /**
   * App tier - Application servers
   */
  app: {
    name: 'app',
    addressPrefix: '10.0.2.0/24',
    description: 'Application tier subnet for application servers',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.Sql', 'Microsoft.KeyVault'],
  },

  /**
   * Data tier - Database servers
   */
  data: {
    name: 'data',
    addressPrefix: '10.0.3.0/24',
    description: 'Data tier subnet for database servers',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.Sql', 'Microsoft.KeyVault'],
  },

  /**
   * Services tier - Backend services
   */
  services: {
    name: 'services',
    addressPrefix: '10.0.4.0/24',
    description: 'Services tier subnet for backend services',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.ServiceBus', 'Microsoft.EventHub'],
  },

  /**
   * Management tier - Management and monitoring tools
   */
  management: {
    name: 'management',
    addressPrefix: '10.0.5.0/24',
    description: 'Management subnet for monitoring and admin tools',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.KeyVault'],
  },

  /**
   * Azure Bastion subnet - Secure VM access (required name)
   */
  bastion: {
    name: 'AzureBastionSubnet',
    addressPrefix: '10.0.250.0/27',
    description: 'Azure Bastion subnet (minimum /27)',
    serviceEndpoints: [],
  },

  /**
   * VPN Gateway subnet - VPN and ExpressRoute (required name)
   */
  gateway: {
    name: 'GatewaySubnet',
    addressPrefix: '10.0.255.0/27',
    description: 'Gateway subnet for VPN/ExpressRoute (minimum /27)',
    serviceEndpoints: [],
  },

  /**
   * Azure Firewall subnet - Azure Firewall (required name)
   */
  firewall: {
    name: 'AzureFirewallSubnet',
    addressPrefix: '10.0.254.0/26',
    description: 'Azure Firewall subnet (minimum /26)',
    serviceEndpoints: [],
  },

  /**
   * Private Link subnet - Private endpoints
   */
  privatelink: {
    name: 'privatelink',
    addressPrefix: '10.0.6.0/24',
    description: 'Private Link subnet for private endpoints',
    serviceEndpoints: [],
  },

  /**
   * Container subnet - Azure Container Instances
   */
  container: {
    name: 'container',
    addressPrefix: '10.0.7.0/24',
    description: 'Container subnet with delegation',
    serviceEndpoints: ['Microsoft.Storage'],
    delegations: ['Microsoft.ContainerInstance/containerGroups'],
  },

  /**
   * App Service subnet - Azure App Service integration
   */
  appservice: {
    name: 'appservice',
    addressPrefix: '10.0.8.0/24',
    description: 'App Service subnet with delegation',
    serviceEndpoints: ['Microsoft.Storage', 'Microsoft.Sql'],
    delegations: ['Microsoft.Web/serverFarms'],
  },
} as const;

export type SubnetPatternKey = keyof typeof SUBNET_PATTERNS;

/**
 * Reserved subnet names that have specific requirements
 */
export const RESERVED_SUBNET_NAMES = {
  AzureBastionSubnet: {
    name: 'AzureBastionSubnet',
    minPrefix: 27,
    description: 'Azure Bastion requires exact name and minimum /27',
  },
  GatewaySubnet: {
    name: 'GatewaySubnet',
    minPrefix: 27,
    description: 'VPN/ExpressRoute Gateway requires exact name and minimum /27',
  },
  AzureFirewallSubnet: {
    name: 'AzureFirewallSubnet',
    minPrefix: 26,
    description: 'Azure Firewall requires exact name and minimum /26',
  },
  AzureFirewallManagementSubnet: {
    name: 'AzureFirewallManagementSubnet',
    minPrefix: 26,
    description: 'Azure Firewall Management requires exact name and minimum /26',
  },
} as const;

/**
 * Validate subnet name against Azure requirements
 */
export function validateSubnetName(name: string): { valid: boolean; error?: string } {
  // Check length (1-80 characters)
  if (name.length < 1 || name.length > 80) {
    return { valid: false, error: 'Subnet name must be 1-80 characters' };
  }

  // Check valid characters (alphanumeric, underscore, hyphen, period)
  const validNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validNameRegex.test(name)) {
    return { valid: false, error: 'Subnet name can only contain alphanumeric, underscore, hyphen, and period' };
  }

  // Check that it doesn't start or end with period
  if (name.startsWith('.') || name.endsWith('.')) {
    return { valid: false, error: 'Subnet name cannot start or end with a period' };
  }

  return { valid: true };
}

/**
 * Validate subnet prefix length for reserved subnets
 */
export function validateReservedSubnet(
  name: string,
  addressPrefix: string
): { valid: boolean; error?: string } {
  const reserved = Object.values(RESERVED_SUBNET_NAMES).find((r) => r.name === name);
  if (!reserved) return { valid: true };

  const match = addressPrefix.match(/\/(\d+)$/);
  if (!match) {
    return { valid: false, error: 'Invalid CIDR notation' };
  }

  const prefix = parseInt(match[1], 10);
  if (prefix > reserved.minPrefix) {
    return {
      valid: false,
      error: `${name} requires minimum /${reserved.minPrefix} (provided: /${prefix})`,
    };
  }

  return { valid: true };
}

/**
 * Get subnet pattern by key
 */
export function getSubnetPattern(key: SubnetPatternKey) {
  return SUBNET_PATTERNS[key];
}

/**
 * Get all subnet patterns
 */
export function getAllSubnetPatterns() {
  return Object.entries(SUBNET_PATTERNS).map(([key, pattern]) => ({
    key: key as SubnetPatternKey,
    pattern,
  }));
}

/**
 * Create a subnet configuration
 */
export function createSubnetConfig(
  name: string,
  addressPrefix: string,
  options?: {
    serviceEndpoints?: string[];
    delegations?: string[];
    privateEndpointNetworkPolicies?: 'Enabled' | 'Disabled';
    privateLinkServiceNetworkPolicies?: 'Enabled' | 'Disabled';
  }
): SubnetConfig {
  return {
    name,
    addressPrefix,
    serviceEndpoints: options?.serviceEndpoints,
    delegations: options?.delegations,
    privateEndpointNetworkPolicies: options?.privateEndpointNetworkPolicies,
    privateLinkServiceNetworkPolicies: options?.privateLinkServiceNetworkPolicies,
  };
}

/**
 * Check if two subnets overlap
 */
export function subnetsOverlap(subnet1: string, subnet2: string): boolean {
  const [ip1, prefix1Str] = subnet1.split('/');
  const [ip2, prefix2Str] = subnet2.split('/');
  const prefix1 = parseInt(prefix1Str, 10);
  const prefix2 = parseInt(prefix2Str, 10);

  const ipToNumber = (ipStr: string): number => {
    return ipStr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const ip1Num = ipToNumber(ip1);
  const ip2Num = ipToNumber(ip2);

  const minPrefix = Math.min(prefix1, prefix2);
  const mask = ~((1 << (32 - minPrefix)) - 1);

  return (ip1Num & mask) === (ip2Num & mask);
}
