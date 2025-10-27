/**
 * Azure Virtual Network (VNet) Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/
 */

export interface VNetConfig {
  name: string;
  addressSpace: string[]; // CIDR notation: ["10.0.0.0/16"]
  location: string;
  subnets: SubnetConfig[];
  dnsServers?: string[];
  ddosProtectionEnabled?: boolean;
  tags?: Record<string, string>;
}

export interface SubnetConfig {
  name: string;
  addressPrefix: string; // CIDR notation: "10.0.1.0/24"
  serviceEndpoints?: string[];
  delegations?: string[];
  privateEndpointNetworkPolicies?: "Enabled" | "Disabled";
  privateLinkServiceNetworkPolicies?: "Enabled" | "Disabled";
}

/**
 * Pre-configured VNet templates for common scenarios
 */
export const VNET_TEMPLATES = {
  /**
   * Small VNet - Dev/Test environments
   * Address Space: 10.0.0.0/24 (254 usable IPs)
   */
  small: {
    name: "vnet-small",
    addressSpace: ["10.0.0.0/24"],
    description: "Small VNet for dev/test - 254 IPs",
    subnets: [
      {
        name: "default",
        addressPrefix: "10.0.0.0/26",
        description: "Default subnet - 62 IPs",
      },
      {
        name: "AzureBastionSubnet",
        addressPrefix: "10.0.0.64/26",
        description: "Azure Bastion subnet - 62 IPs",
      },
    ],
  },

  /**
   * Medium VNet - Standard deployments
   * Address Space: 10.0.0.0/20 (4,094 usable IPs)
   */
  medium: {
    name: "vnet-medium",
    addressSpace: ["10.0.0.0/20"],
    description: "Medium VNet for standard deployments - 4,094 IPs",
    subnets: [
      {
        name: "web",
        addressPrefix: "10.0.0.0/24",
        description: "Web tier - 254 IPs",
      },
      {
        name: "app",
        addressPrefix: "10.0.1.0/24",
        description: "Application tier - 254 IPs",
      },
      {
        name: "data",
        addressPrefix: "10.0.2.0/24",
        description: "Data tier - 254 IPs",
      },
      {
        name: "AzureBastionSubnet",
        addressPrefix: "10.0.15.0/27",
        description: "Azure Bastion subnet - 30 IPs",
      },
    ],
  },

  /**
   * Large VNet - Enterprise deployments
   * Address Space: 10.0.0.0/16 (65,534 usable IPs)
   */
  large: {
    name: "vnet-large",
    addressSpace: ["10.0.0.0/16"],
    description: "Large VNet for enterprise deployments - 65,534 IPs",
    subnets: [
      {
        name: "web",
        addressPrefix: "10.0.0.0/22",
        description: "Web tier - 1,022 IPs",
      },
      {
        name: "app",
        addressPrefix: "10.0.4.0/22",
        description: "Application tier - 1,022 IPs",
      },
      {
        name: "data",
        addressPrefix: "10.0.8.0/22",
        description: "Data tier - 1,022 IPs",
      },
      {
        name: "services",
        addressPrefix: "10.0.12.0/22",
        description: "Services tier - 1,022 IPs",
      },
      {
        name: "AzureBastionSubnet",
        addressPrefix: "10.0.255.0/27",
        description: "Azure Bastion subnet - 30 IPs",
      },
      {
        name: "GatewaySubnet",
        addressPrefix: "10.0.255.224/27",
        description: "VPN/ExpressRoute gateway - 30 IPs",
      },
    ],
  },

  /**
   * Hub VNet - Hub-Spoke architecture (Hub)
   * Address Space: 10.0.0.0/22 (1,022 usable IPs)
   */
  hub: {
    name: "vnet-hub",
    addressSpace: ["10.0.0.0/22"],
    description: "Hub VNet for hub-spoke architecture - 1,022 IPs",
    subnets: [
      {
        name: "AzureFirewallSubnet",
        addressPrefix: "10.0.0.0/26",
        description: "Azure Firewall subnet - 62 IPs",
      },
      {
        name: "GatewaySubnet",
        addressPrefix: "10.0.0.64/27",
        description: "VPN/ExpressRoute gateway - 30 IPs",
      },
      {
        name: "AzureBastionSubnet",
        addressPrefix: "10.0.0.96/27",
        description: "Azure Bastion subnet - 30 IPs",
      },
      {
        name: "management",
        addressPrefix: "10.0.1.0/24",
        description: "Management and monitoring - 254 IPs",
      },
    ],
  },

  /**
   * Spoke VNet - Hub-Spoke architecture (Spoke)
   * Address Space: 10.1.0.0/16 (65,534 usable IPs)
   */
  spoke: {
    name: "vnet-spoke",
    addressSpace: ["10.1.0.0/16"],
    description: "Spoke VNet for hub-spoke architecture - 65,534 IPs",
    subnets: [
      {
        name: "workload",
        addressPrefix: "10.1.0.0/20",
        description: "Workload subnet - 4,094 IPs",
      },
      {
        name: "privatelink",
        addressPrefix: "10.1.16.0/24",
        description: "Private Link subnet - 254 IPs",
      },
    ],
  },
} as const;

export type VNetTemplateKey = keyof typeof VNET_TEMPLATES;

/**
 * Azure service endpoints for subnets
 */
export const SERVICE_ENDPOINTS = {
  "Microsoft.Storage": "Azure Storage",
  "Microsoft.Sql": "Azure SQL Database",
  "Microsoft.AzureCosmosDB": "Azure Cosmos DB",
  "Microsoft.KeyVault": "Azure Key Vault",
  "Microsoft.ServiceBus": "Azure Service Bus",
  "Microsoft.EventHub": "Azure Event Hubs",
  "Microsoft.Web": "Azure App Service",
  "Microsoft.ContainerRegistry": "Azure Container Registry",
  "Microsoft.AzureActiveDirectory": "Azure Active Directory",
} as const;

/**
 * Subnet delegations for Azure services
 */
export const SUBNET_DELEGATIONS = {
  "Microsoft.Web/serverFarms": "Azure App Service",
  "Microsoft.ContainerInstance/containerGroups": "Azure Container Instances",
  "Microsoft.Netapp/volumes": "Azure NetApp Files",
  "Microsoft.HardwareSecurityModules/dedicatedHSMs": "Azure Dedicated HSM",
  "Microsoft.ServiceFabricMesh/networks": "Azure Service Fabric Mesh",
  "Microsoft.Logic/integrationServiceEnvironments": "Azure Logic Apps",
  "Microsoft.Batch/batchAccounts": "Azure Batch",
  "Microsoft.Sql/managedInstances": "Azure SQL Managed Instance",
  "Microsoft.DBforPostgreSQL/flexibleServers": "Azure Database for PostgreSQL",
  "Microsoft.DBforMySQL/flexibleServers": "Azure Database for MySQL",
} as const;

/**
 * Calculate the number of usable IP addresses in a CIDR block
 */
export function calculateUsableIPs(cidr: string): number {
  const match = cidr.match(/\/(\d+)$/);
  if (!match) return 0;

  const prefixLength = parseInt(match[1], 10);
  if (prefixLength < 0 || prefixLength > 32) return 0;

  const totalIPs = Math.pow(2, 32 - prefixLength);
  // Azure reserves 5 IPs in each subnet (network, gateway, DNS x2, broadcast)
  return Math.max(0, totalIPs - 5);
}

/**
 * Validate CIDR notation
 */
export function validateCIDR(cidr: string): boolean {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  if (!cidrRegex.test(cidr)) return false;

  const [ip, prefix] = cidr.split("/");
  const octets = ip.split(".").map(Number);

  // Validate octets (0-255)
  if (octets.some((octet) => octet < 0 || octet > 255)) return false;

  // Validate prefix length (0-32)
  const prefixLength = parseInt(prefix, 10);
  if (prefixLength < 0 || prefixLength > 32) return false;

  return true;
}

/**
 * Check if an IP address is within a CIDR block
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  const [cidrIP, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);

  const ipToNumber = (ipStr: string): number => {
    return (
      ipStr
        .split(".")
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  };

  const ipNum = ipToNumber(ip);
  const cidrNum = ipToNumber(cidrIP);
  const mask = ~((1 << (32 - prefix)) - 1);

  return (ipNum & mask) === (cidrNum & mask);
}

/**
 * Get VNet template by key
 */
export function getVNetTemplate(key: VNetTemplateKey) {
  return VNET_TEMPLATES[key];
}

/**
 * Get all VNet templates
 */
export function getAllVNetTemplates() {
  return Object.entries(VNET_TEMPLATES).map(([key, template]) => ({
    key: key as VNetTemplateKey,
    template,
  }));
}

/**
 * Get service endpoint display name
 */
export function getServiceEndpointName(
  endpoint: keyof typeof SERVICE_ENDPOINTS,
): string {
  return SERVICE_ENDPOINTS[endpoint];
}

/**
 * Get subnet delegation display name
 */
export function getDelegationName(
  delegation: keyof typeof SUBNET_DELEGATIONS,
): string {
  return SUBNET_DELEGATIONS[delegation];
}
