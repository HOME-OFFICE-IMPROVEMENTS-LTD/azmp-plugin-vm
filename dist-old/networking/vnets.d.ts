/**
 * Azure Virtual Network (VNet) Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/
 */
export interface VNetConfig {
    name: string;
    addressSpace: string[];
    location: string;
    subnets: SubnetConfig[];
    dnsServers?: string[];
    ddosProtectionEnabled?: boolean;
    tags?: Record<string, string>;
}
export interface SubnetConfig {
    name: string;
    addressPrefix: string;
    serviceEndpoints?: string[];
    delegations?: string[];
    privateEndpointNetworkPolicies?: "Enabled" | "Disabled";
    privateLinkServiceNetworkPolicies?: "Enabled" | "Disabled";
}
/**
 * Pre-configured VNet templates for common scenarios
 */
export declare const VNET_TEMPLATES: {
    /**
     * Small VNet - Dev/Test environments
     * Address Space: 10.0.0.0/24 (254 usable IPs)
     */
    readonly small: {
        readonly name: "vnet-small";
        readonly addressSpace: readonly ["10.0.0.0/24"];
        readonly description: "Small VNet for dev/test - 254 IPs";
        readonly subnets: readonly [{
            readonly name: "default";
            readonly addressPrefix: "10.0.0.0/26";
            readonly description: "Default subnet - 62 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.0.64/26";
            readonly description: "Azure Bastion subnet - 62 IPs";
        }];
    };
    /**
     * Medium VNet - Standard deployments
     * Address Space: 10.0.0.0/20 (4,094 usable IPs)
     */
    readonly medium: {
        readonly name: "vnet-medium";
        readonly addressSpace: readonly ["10.0.0.0/20"];
        readonly description: "Medium VNet for standard deployments - 4,094 IPs";
        readonly subnets: readonly [{
            readonly name: "web";
            readonly addressPrefix: "10.0.0.0/24";
            readonly description: "Web tier - 254 IPs";
        }, {
            readonly name: "app";
            readonly addressPrefix: "10.0.1.0/24";
            readonly description: "Application tier - 254 IPs";
        }, {
            readonly name: "data";
            readonly addressPrefix: "10.0.2.0/24";
            readonly description: "Data tier - 254 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.15.0/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }];
    };
    /**
     * Large VNet - Enterprise deployments
     * Address Space: 10.0.0.0/16 (65,534 usable IPs)
     */
    readonly large: {
        readonly name: "vnet-large";
        readonly addressSpace: readonly ["10.0.0.0/16"];
        readonly description: "Large VNet for enterprise deployments - 65,534 IPs";
        readonly subnets: readonly [{
            readonly name: "web";
            readonly addressPrefix: "10.0.0.0/22";
            readonly description: "Web tier - 1,022 IPs";
        }, {
            readonly name: "app";
            readonly addressPrefix: "10.0.4.0/22";
            readonly description: "Application tier - 1,022 IPs";
        }, {
            readonly name: "data";
            readonly addressPrefix: "10.0.8.0/22";
            readonly description: "Data tier - 1,022 IPs";
        }, {
            readonly name: "services";
            readonly addressPrefix: "10.0.12.0/22";
            readonly description: "Services tier - 1,022 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.255.0/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }, {
            readonly name: "GatewaySubnet";
            readonly addressPrefix: "10.0.255.224/27";
            readonly description: "VPN/ExpressRoute gateway - 30 IPs";
        }];
    };
    /**
     * Hub VNet - Hub-Spoke architecture (Hub)
     * Address Space: 10.0.0.0/22 (1,022 usable IPs)
     */
    readonly hub: {
        readonly name: "vnet-hub";
        readonly addressSpace: readonly ["10.0.0.0/22"];
        readonly description: "Hub VNet for hub-spoke architecture - 1,022 IPs";
        readonly subnets: readonly [{
            readonly name: "AzureFirewallSubnet";
            readonly addressPrefix: "10.0.0.0/26";
            readonly description: "Azure Firewall subnet - 62 IPs";
        }, {
            readonly name: "GatewaySubnet";
            readonly addressPrefix: "10.0.0.64/27";
            readonly description: "VPN/ExpressRoute gateway - 30 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.0.96/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }, {
            readonly name: "management";
            readonly addressPrefix: "10.0.1.0/24";
            readonly description: "Management and monitoring - 254 IPs";
        }];
    };
    /**
     * Spoke VNet - Hub-Spoke architecture (Spoke)
     * Address Space: 10.1.0.0/16 (65,534 usable IPs)
     */
    readonly spoke: {
        readonly name: "vnet-spoke";
        readonly addressSpace: readonly ["10.1.0.0/16"];
        readonly description: "Spoke VNet for hub-spoke architecture - 65,534 IPs";
        readonly subnets: readonly [{
            readonly name: "workload";
            readonly addressPrefix: "10.1.0.0/20";
            readonly description: "Workload subnet - 4,094 IPs";
        }, {
            readonly name: "privatelink";
            readonly addressPrefix: "10.1.16.0/24";
            readonly description: "Private Link subnet - 254 IPs";
        }];
    };
};
export type VNetTemplateKey = keyof typeof VNET_TEMPLATES;
/**
 * Azure service endpoints for subnets
 */
export declare const SERVICE_ENDPOINTS: {
    readonly "Microsoft.Storage": "Azure Storage";
    readonly "Microsoft.Sql": "Azure SQL Database";
    readonly "Microsoft.AzureCosmosDB": "Azure Cosmos DB";
    readonly "Microsoft.KeyVault": "Azure Key Vault";
    readonly "Microsoft.ServiceBus": "Azure Service Bus";
    readonly "Microsoft.EventHub": "Azure Event Hubs";
    readonly "Microsoft.Web": "Azure App Service";
    readonly "Microsoft.ContainerRegistry": "Azure Container Registry";
    readonly "Microsoft.AzureActiveDirectory": "Azure Active Directory";
};
/**
 * Subnet delegations for Azure services
 */
export declare const SUBNET_DELEGATIONS: {
    readonly "Microsoft.Web/serverFarms": "Azure App Service";
    readonly "Microsoft.ContainerInstance/containerGroups": "Azure Container Instances";
    readonly "Microsoft.Netapp/volumes": "Azure NetApp Files";
    readonly "Microsoft.HardwareSecurityModules/dedicatedHSMs": "Azure Dedicated HSM";
    readonly "Microsoft.ServiceFabricMesh/networks": "Azure Service Fabric Mesh";
    readonly "Microsoft.Logic/integrationServiceEnvironments": "Azure Logic Apps";
    readonly "Microsoft.Batch/batchAccounts": "Azure Batch";
    readonly "Microsoft.Sql/managedInstances": "Azure SQL Managed Instance";
    readonly "Microsoft.DBforPostgreSQL/flexibleServers": "Azure Database for PostgreSQL";
    readonly "Microsoft.DBforMySQL/flexibleServers": "Azure Database for MySQL";
};
/**
 * Calculate the number of usable IP addresses in a CIDR block
 */
export declare function calculateUsableIPs(cidr: string): number;
/**
 * Validate CIDR notation
 */
export declare function validateCIDR(cidr: string): boolean;
/**
 * Check if an IP address is within a CIDR block
 */
export declare function isIPInCIDR(ip: string, cidr: string): boolean;
/**
 * Get VNet template by key
 */
export declare function getVNetTemplate(key: VNetTemplateKey): {
    readonly name: "vnet-small";
    readonly addressSpace: readonly ["10.0.0.0/24"];
    readonly description: "Small VNet for dev/test - 254 IPs";
    readonly subnets: readonly [{
        readonly name: "default";
        readonly addressPrefix: "10.0.0.0/26";
        readonly description: "Default subnet - 62 IPs";
    }, {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.0.64/26";
        readonly description: "Azure Bastion subnet - 62 IPs";
    }];
} | {
    readonly name: "vnet-medium";
    readonly addressSpace: readonly ["10.0.0.0/20"];
    readonly description: "Medium VNet for standard deployments - 4,094 IPs";
    readonly subnets: readonly [{
        readonly name: "web";
        readonly addressPrefix: "10.0.0.0/24";
        readonly description: "Web tier - 254 IPs";
    }, {
        readonly name: "app";
        readonly addressPrefix: "10.0.1.0/24";
        readonly description: "Application tier - 254 IPs";
    }, {
        readonly name: "data";
        readonly addressPrefix: "10.0.2.0/24";
        readonly description: "Data tier - 254 IPs";
    }, {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.15.0/27";
        readonly description: "Azure Bastion subnet - 30 IPs";
    }];
} | {
    readonly name: "vnet-large";
    readonly addressSpace: readonly ["10.0.0.0/16"];
    readonly description: "Large VNet for enterprise deployments - 65,534 IPs";
    readonly subnets: readonly [{
        readonly name: "web";
        readonly addressPrefix: "10.0.0.0/22";
        readonly description: "Web tier - 1,022 IPs";
    }, {
        readonly name: "app";
        readonly addressPrefix: "10.0.4.0/22";
        readonly description: "Application tier - 1,022 IPs";
    }, {
        readonly name: "data";
        readonly addressPrefix: "10.0.8.0/22";
        readonly description: "Data tier - 1,022 IPs";
    }, {
        readonly name: "services";
        readonly addressPrefix: "10.0.12.0/22";
        readonly description: "Services tier - 1,022 IPs";
    }, {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.255.0/27";
        readonly description: "Azure Bastion subnet - 30 IPs";
    }, {
        readonly name: "GatewaySubnet";
        readonly addressPrefix: "10.0.255.224/27";
        readonly description: "VPN/ExpressRoute gateway - 30 IPs";
    }];
} | {
    readonly name: "vnet-hub";
    readonly addressSpace: readonly ["10.0.0.0/22"];
    readonly description: "Hub VNet for hub-spoke architecture - 1,022 IPs";
    readonly subnets: readonly [{
        readonly name: "AzureFirewallSubnet";
        readonly addressPrefix: "10.0.0.0/26";
        readonly description: "Azure Firewall subnet - 62 IPs";
    }, {
        readonly name: "GatewaySubnet";
        readonly addressPrefix: "10.0.0.64/27";
        readonly description: "VPN/ExpressRoute gateway - 30 IPs";
    }, {
        readonly name: "AzureBastionSubnet";
        readonly addressPrefix: "10.0.0.96/27";
        readonly description: "Azure Bastion subnet - 30 IPs";
    }, {
        readonly name: "management";
        readonly addressPrefix: "10.0.1.0/24";
        readonly description: "Management and monitoring - 254 IPs";
    }];
} | {
    readonly name: "vnet-spoke";
    readonly addressSpace: readonly ["10.1.0.0/16"];
    readonly description: "Spoke VNet for hub-spoke architecture - 65,534 IPs";
    readonly subnets: readonly [{
        readonly name: "workload";
        readonly addressPrefix: "10.1.0.0/20";
        readonly description: "Workload subnet - 4,094 IPs";
    }, {
        readonly name: "privatelink";
        readonly addressPrefix: "10.1.16.0/24";
        readonly description: "Private Link subnet - 254 IPs";
    }];
};
/**
 * Get all VNet templates
 */
export declare function getAllVNetTemplates(): {
    key: VNetTemplateKey;
    template: {
        readonly name: "vnet-small";
        readonly addressSpace: readonly ["10.0.0.0/24"];
        readonly description: "Small VNet for dev/test - 254 IPs";
        readonly subnets: readonly [{
            readonly name: "default";
            readonly addressPrefix: "10.0.0.0/26";
            readonly description: "Default subnet - 62 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.0.64/26";
            readonly description: "Azure Bastion subnet - 62 IPs";
        }];
    } | {
        readonly name: "vnet-medium";
        readonly addressSpace: readonly ["10.0.0.0/20"];
        readonly description: "Medium VNet for standard deployments - 4,094 IPs";
        readonly subnets: readonly [{
            readonly name: "web";
            readonly addressPrefix: "10.0.0.0/24";
            readonly description: "Web tier - 254 IPs";
        }, {
            readonly name: "app";
            readonly addressPrefix: "10.0.1.0/24";
            readonly description: "Application tier - 254 IPs";
        }, {
            readonly name: "data";
            readonly addressPrefix: "10.0.2.0/24";
            readonly description: "Data tier - 254 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.15.0/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }];
    } | {
        readonly name: "vnet-large";
        readonly addressSpace: readonly ["10.0.0.0/16"];
        readonly description: "Large VNet for enterprise deployments - 65,534 IPs";
        readonly subnets: readonly [{
            readonly name: "web";
            readonly addressPrefix: "10.0.0.0/22";
            readonly description: "Web tier - 1,022 IPs";
        }, {
            readonly name: "app";
            readonly addressPrefix: "10.0.4.0/22";
            readonly description: "Application tier - 1,022 IPs";
        }, {
            readonly name: "data";
            readonly addressPrefix: "10.0.8.0/22";
            readonly description: "Data tier - 1,022 IPs";
        }, {
            readonly name: "services";
            readonly addressPrefix: "10.0.12.0/22";
            readonly description: "Services tier - 1,022 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.255.0/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }, {
            readonly name: "GatewaySubnet";
            readonly addressPrefix: "10.0.255.224/27";
            readonly description: "VPN/ExpressRoute gateway - 30 IPs";
        }];
    } | {
        readonly name: "vnet-hub";
        readonly addressSpace: readonly ["10.0.0.0/22"];
        readonly description: "Hub VNet for hub-spoke architecture - 1,022 IPs";
        readonly subnets: readonly [{
            readonly name: "AzureFirewallSubnet";
            readonly addressPrefix: "10.0.0.0/26";
            readonly description: "Azure Firewall subnet - 62 IPs";
        }, {
            readonly name: "GatewaySubnet";
            readonly addressPrefix: "10.0.0.64/27";
            readonly description: "VPN/ExpressRoute gateway - 30 IPs";
        }, {
            readonly name: "AzureBastionSubnet";
            readonly addressPrefix: "10.0.0.96/27";
            readonly description: "Azure Bastion subnet - 30 IPs";
        }, {
            readonly name: "management";
            readonly addressPrefix: "10.0.1.0/24";
            readonly description: "Management and monitoring - 254 IPs";
        }];
    } | {
        readonly name: "vnet-spoke";
        readonly addressSpace: readonly ["10.1.0.0/16"];
        readonly description: "Spoke VNet for hub-spoke architecture - 65,534 IPs";
        readonly subnets: readonly [{
            readonly name: "workload";
            readonly addressPrefix: "10.1.0.0/20";
            readonly description: "Workload subnet - 4,094 IPs";
        }, {
            readonly name: "privatelink";
            readonly addressPrefix: "10.1.16.0/24";
            readonly description: "Private Link subnet - 254 IPs";
        }];
    };
}[];
/**
 * Get service endpoint display name
 */
export declare function getServiceEndpointName(endpoint: keyof typeof SERVICE_ENDPOINTS): string;
/**
 * Get subnet delegation display name
 */
export declare function getDelegationName(delegation: keyof typeof SUBNET_DELEGATIONS): string;
