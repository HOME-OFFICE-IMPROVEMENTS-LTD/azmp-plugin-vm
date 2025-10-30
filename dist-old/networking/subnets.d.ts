/**
 * Azure Subnet Configuration Patterns
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-subnet
 */
import { SubnetConfig } from "./vnets";
/**
 * Common subnet patterns for multi-tier architectures
 */
export declare const SUBNET_PATTERNS: {
    /**
     * Default subnet - General purpose workloads
     */
    readonly default: {
        readonly name: "default";
        readonly addressPrefix: "10.0.0.0/24";
        readonly description: "Default subnet for general workloads";
        readonly serviceEndpoints: readonly [];
    };
    /**
     * Web tier - Public-facing web servers
     */
    readonly web: {
        readonly name: "web";
        readonly addressPrefix: "10.0.1.0/24";
        readonly description: "Web tier subnet for public-facing web servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
    };
    /**
     * App tier - Application servers
     */
    readonly app: {
        readonly name: "app";
        readonly addressPrefix: "10.0.2.0/24";
        readonly description: "Application tier subnet for application servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
    };
    /**
     * Data tier - Database servers
     */
    readonly data: {
        readonly name: "data";
        readonly addressPrefix: "10.0.3.0/24";
        readonly description: "Data tier subnet for database servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
    };
    /**
     * Services tier - Backend services
     */
    readonly services: {
        readonly name: "services";
        readonly addressPrefix: "10.0.4.0/24";
        readonly description: "Services tier subnet for backend services";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.ServiceBus", "Microsoft.EventHub"];
    };
    /**
     * Management tier - Management and monitoring tools
     */
    readonly management: {
        readonly name: "management";
        readonly addressPrefix: "10.0.5.0/24";
        readonly description: "Management subnet for monitoring and admin tools";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
    };
    /**
     * Azure Bastion subnet - Secure VM access (required name)
     */
    readonly bastion: {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.250.0/27";
        readonly description: "Azure Bastion subnet (minimum /27)";
        readonly serviceEndpoints: readonly [];
    };
    /**
     * VPN Gateway subnet - VPN and ExpressRoute (required name)
     */
    readonly gateway: {
        readonly name: "GatewaySubnet";
        readonly addressPrefix: "10.0.255.0/27";
        readonly description: "Gateway subnet for VPN/ExpressRoute (minimum /27)";
        readonly serviceEndpoints: readonly [];
    };
    /**
     * Azure Firewall subnet - Azure Firewall (required name)
     */
    readonly firewall: {
        readonly name: "AzureFirewallSubnet";
        readonly addressPrefix: "10.0.254.0/26";
        readonly description: "Azure Firewall subnet (minimum /26)";
        readonly serviceEndpoints: readonly [];
    };
    /**
     * Private Link subnet - Private endpoints
     */
    readonly privatelink: {
        readonly name: "privatelink";
        readonly addressPrefix: "10.0.6.0/24";
        readonly description: "Private Link subnet for private endpoints";
        readonly serviceEndpoints: readonly [];
    };
    /**
     * Container subnet - Azure Container Instances
     */
    readonly container: {
        readonly name: "container";
        readonly addressPrefix: "10.0.7.0/24";
        readonly description: "Container subnet with delegation";
        readonly serviceEndpoints: readonly ["Microsoft.Storage"];
        readonly delegations: readonly ["Microsoft.ContainerInstance/containerGroups"];
    };
    /**
     * App Service subnet - Azure App Service integration
     */
    readonly appservice: {
        readonly name: "appservice";
        readonly addressPrefix: "10.0.8.0/24";
        readonly description: "App Service subnet with delegation";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql"];
        readonly delegations: readonly ["Microsoft.Web/serverFarms"];
    };
};
export type SubnetPatternKey = keyof typeof SUBNET_PATTERNS;
/**
 * Reserved subnet names that have specific requirements
 */
export declare const RESERVED_SUBNET_NAMES: {
    readonly AzureBastionSubnet: {
        readonly name: "AzureBastionSubnet";
        readonly minPrefix: 27;
        readonly description: "Azure Bastion requires exact name and minimum /27";
    };
    readonly GatewaySubnet: {
        readonly name: "GatewaySubnet";
        readonly minPrefix: 27;
        readonly description: "VPN/ExpressRoute Gateway requires exact name and minimum /27";
    };
    readonly AzureFirewallSubnet: {
        readonly name: "AzureFirewallSubnet";
        readonly minPrefix: 26;
        readonly description: "Azure Firewall requires exact name and minimum /26";
    };
    readonly AzureFirewallManagementSubnet: {
        readonly name: "AzureFirewallManagementSubnet";
        readonly minPrefix: 26;
        readonly description: "Azure Firewall Management requires exact name and minimum /26";
    };
};
/**
 * Validate subnet name against Azure requirements
 */
export declare function validateSubnetName(name: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validate subnet prefix length for reserved subnets
 */
export declare function validateReservedSubnet(name: string, addressPrefix: string): {
    valid: boolean;
    error?: string;
};
/**
 * Get subnet pattern by key
 */
export declare function getSubnetPattern(key: SubnetPatternKey): {
    readonly name: "default";
    readonly addressPrefix: "10.0.0.0/24";
    readonly description: "Default subnet for general workloads";
    readonly serviceEndpoints: readonly [];
} | {
    readonly name: "web";
    readonly addressPrefix: "10.0.1.0/24";
    readonly description: "Web tier subnet for public-facing web servers";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
} | {
    readonly name: "app";
    readonly addressPrefix: "10.0.2.0/24";
    readonly description: "Application tier subnet for application servers";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
} | {
    readonly name: "data";
    readonly addressPrefix: "10.0.3.0/24";
    readonly description: "Data tier subnet for database servers";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
} | {
    readonly name: "services";
    readonly addressPrefix: "10.0.4.0/24";
    readonly description: "Services tier subnet for backend services";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.ServiceBus", "Microsoft.EventHub"];
} | {
    readonly name: "management";
    readonly addressPrefix: "10.0.5.0/24";
    readonly description: "Management subnet for monitoring and admin tools";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
} | {
    readonly name: "AzureBastionSubnet";
    readonly addressPrefix: "10.0.250.0/27";
    readonly description: "Azure Bastion subnet (minimum /27)";
    readonly serviceEndpoints: readonly [];
} | {
    readonly name: "GatewaySubnet";
    readonly addressPrefix: "10.0.255.0/27";
    readonly description: "Gateway subnet for VPN/ExpressRoute (minimum /27)";
    readonly serviceEndpoints: readonly [];
} | {
    readonly name: "AzureFirewallSubnet";
    readonly addressPrefix: "10.0.254.0/26";
    readonly description: "Azure Firewall subnet (minimum /26)";
    readonly serviceEndpoints: readonly [];
} | {
    readonly name: "privatelink";
    readonly addressPrefix: "10.0.6.0/24";
    readonly description: "Private Link subnet for private endpoints";
    readonly serviceEndpoints: readonly [];
} | {
    readonly name: "container";
    readonly addressPrefix: "10.0.7.0/24";
    readonly description: "Container subnet with delegation";
    readonly serviceEndpoints: readonly ["Microsoft.Storage"];
    readonly delegations: readonly ["Microsoft.ContainerInstance/containerGroups"];
} | {
    readonly name: "appservice";
    readonly addressPrefix: "10.0.8.0/24";
    readonly description: "App Service subnet with delegation";
    readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql"];
    readonly delegations: readonly ["Microsoft.Web/serverFarms"];
};
/**
 * Get all subnet patterns
 */
export declare function getAllSubnetPatterns(): {
    key: SubnetPatternKey;
    pattern: {
        readonly name: "default";
        readonly addressPrefix: "10.0.0.0/24";
        readonly description: "Default subnet for general workloads";
        readonly serviceEndpoints: readonly [];
    } | {
        readonly name: "web";
        readonly addressPrefix: "10.0.1.0/24";
        readonly description: "Web tier subnet for public-facing web servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
    } | {
        readonly name: "app";
        readonly addressPrefix: "10.0.2.0/24";
        readonly description: "Application tier subnet for application servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
    } | {
        readonly name: "data";
        readonly addressPrefix: "10.0.3.0/24";
        readonly description: "Data tier subnet for database servers";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"];
    } | {
        readonly name: "services";
        readonly addressPrefix: "10.0.4.0/24";
        readonly description: "Services tier subnet for backend services";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.ServiceBus", "Microsoft.EventHub"];
    } | {
        readonly name: "management";
        readonly addressPrefix: "10.0.5.0/24";
        readonly description: "Management subnet for monitoring and admin tools";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.KeyVault"];
    } | {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.250.0/27";
        readonly description: "Azure Bastion subnet (minimum /27)";
        readonly serviceEndpoints: readonly [];
    } | {
        readonly name: "GatewaySubnet";
        readonly addressPrefix: "10.0.255.0/27";
        readonly description: "Gateway subnet for VPN/ExpressRoute (minimum /27)";
        readonly serviceEndpoints: readonly [];
    } | {
        readonly name: "AzureFirewallSubnet";
        readonly addressPrefix: "10.0.254.0/26";
        readonly description: "Azure Firewall subnet (minimum /26)";
        readonly serviceEndpoints: readonly [];
    } | {
        readonly name: "privatelink";
        readonly addressPrefix: "10.0.6.0/24";
        readonly description: "Private Link subnet for private endpoints";
        readonly serviceEndpoints: readonly [];
    } | {
        readonly name: "container";
        readonly addressPrefix: "10.0.7.0/24";
        readonly description: "Container subnet with delegation";
        readonly serviceEndpoints: readonly ["Microsoft.Storage"];
        readonly delegations: readonly ["Microsoft.ContainerInstance/containerGroups"];
    } | {
        readonly name: "appservice";
        readonly addressPrefix: "10.0.8.0/24";
        readonly description: "App Service subnet with delegation";
        readonly serviceEndpoints: readonly ["Microsoft.Storage", "Microsoft.Sql"];
        readonly delegations: readonly ["Microsoft.Web/serverFarms"];
    };
}[];
/**
 * Create a subnet configuration
 */
export declare function createSubnetConfig(name: string, addressPrefix: string, options?: {
    serviceEndpoints?: string[];
    delegations?: string[];
    privateEndpointNetworkPolicies?: "Enabled" | "Disabled";
    privateLinkServiceNetworkPolicies?: "Enabled" | "Disabled";
}): SubnetConfig;
/**
 * Check if two subnets overlap
 */
export declare function subnetsOverlap(subnet1: string, subnet2: string): boolean;
