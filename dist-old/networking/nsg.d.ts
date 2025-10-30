/**
 * Azure Network Security Group (NSG) Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview
 */
/**
 * NSG Security Rule Configuration
 */
export interface NsgRuleConfig {
    readonly name: string;
    readonly description: string;
    readonly priority: number;
    readonly direction: "Inbound" | "Outbound";
    readonly access: "Allow" | "Deny";
    readonly protocol: "Tcp" | "Udp" | "Icmp" | "*";
    readonly sourcePortRange: string;
    readonly destinationPortRange: string;
    readonly sourceAddressPrefix: string;
    readonly destinationAddressPrefix: string;
}
/**
 * Common NSG security rules for Azure deployments
 * Priority ranges: 100-4096 (lower number = higher priority)
 */
export declare const NSG_RULES: {
    /**
     * HTTP - Web traffic (port 80)
     */
    readonly "allow-http": {
        readonly name: "Allow-HTTP";
        readonly description: "Allow inbound HTTP traffic on port 80";
        readonly priority: 100;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "80";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * HTTPS - Secure web traffic (port 443)
     */
    readonly "allow-https": {
        readonly name: "Allow-HTTPS";
        readonly description: "Allow inbound HTTPS traffic on port 443";
        readonly priority: 110;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "443";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * SSH - Secure shell access (port 22)
     */
    readonly "allow-ssh": {
        readonly name: "Allow-SSH";
        readonly description: "Allow inbound SSH traffic on port 22";
        readonly priority: 200;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "22";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * RDP - Remote Desktop Protocol (port 3389)
     */
    readonly "allow-rdp": {
        readonly name: "Allow-RDP";
        readonly description: "Allow inbound RDP traffic on port 3389";
        readonly priority: 210;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "3389";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * SQL Server - Database access (port 1433)
     */
    readonly "allow-sql": {
        readonly name: "Allow-SQL";
        readonly description: "Allow inbound SQL Server traffic on port 1433";
        readonly priority: 300;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "1433";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * MySQL - Database access (port 3306)
     */
    readonly "allow-mysql": {
        readonly name: "Allow-MySQL";
        readonly description: "Allow inbound MySQL traffic on port 3306";
        readonly priority: 310;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "3306";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * PostgreSQL - Database access (port 5432)
     */
    readonly "allow-postgresql": {
        readonly name: "Allow-PostgreSQL";
        readonly description: "Allow inbound PostgreSQL traffic on port 5432";
        readonly priority: 320;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "5432";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Redis - Cache access (port 6379)
     */
    readonly "allow-redis": {
        readonly name: "Allow-Redis";
        readonly description: "Allow inbound Redis traffic on port 6379";
        readonly priority: 330;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "6379";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * MongoDB - NoSQL database (port 27017)
     */
    readonly "allow-mongodb": {
        readonly name: "Allow-MongoDB";
        readonly description: "Allow inbound MongoDB traffic on port 27017";
        readonly priority: 340;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "27017";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Custom application port 8080
     */
    readonly "allow-app-8080": {
        readonly name: "Allow-App-8080";
        readonly description: "Allow inbound application traffic on port 8080";
        readonly priority: 400;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "8080";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Custom application port 8443
     */
    readonly "allow-app-8443": {
        readonly name: "Allow-App-8443";
        readonly description: "Allow inbound secure application traffic on port 8443";
        readonly priority: 410;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "8443";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * SMTP - Email (port 25)
     */
    readonly "allow-smtp": {
        readonly name: "Allow-SMTP";
        readonly description: "Allow outbound SMTP traffic on port 25";
        readonly priority: 500;
        readonly direction: "Outbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "25";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "Internet";
    };
    /**
     * SMTPS - Secure email (port 587)
     */
    readonly "allow-smtps": {
        readonly name: "Allow-SMTPS";
        readonly description: "Allow outbound secure SMTP traffic on port 587";
        readonly priority: 510;
        readonly direction: "Outbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "587";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "Internet";
    };
    /**
     * DNS - Domain name resolution (port 53)
     */
    readonly "allow-dns": {
        readonly name: "Allow-DNS";
        readonly description: "Allow outbound DNS traffic on port 53";
        readonly priority: 520;
        readonly direction: "Outbound";
        readonly access: "Allow";
        readonly protocol: "*";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "53";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "Internet";
    };
    /**
     * NTP - Network time protocol (port 123)
     */
    readonly "allow-ntp": {
        readonly name: "Allow-NTP";
        readonly description: "Allow outbound NTP traffic on port 123";
        readonly priority: 530;
        readonly direction: "Outbound";
        readonly access: "Allow";
        readonly protocol: "Udp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "123";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "Internet";
    };
    /**
     * LDAP - Directory services (port 389)
     */
    readonly "allow-ldap": {
        readonly name: "Allow-LDAP";
        readonly description: "Allow inbound LDAP traffic on port 389";
        readonly priority: 600;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "389";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * LDAPS - Secure directory services (port 636)
     */
    readonly "allow-ldaps": {
        readonly name: "Allow-LDAPS";
        readonly description: "Allow inbound secure LDAP traffic on port 636";
        readonly priority: 610;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "636";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * WinRM - Windows Remote Management (port 5985)
     */
    readonly "allow-winrm-http": {
        readonly name: "Allow-WinRM-HTTP";
        readonly description: "Allow inbound WinRM HTTP traffic on port 5985";
        readonly priority: 700;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "5985";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * WinRM HTTPS - Secure Windows Remote Management (port 5986)
     */
    readonly "allow-winrm-https": {
        readonly name: "Allow-WinRM-HTTPS";
        readonly description: "Allow inbound WinRM HTTPS traffic on port 5986";
        readonly priority: 710;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "5986";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Kubernetes API Server (port 6443)
     */
    readonly "allow-k8s-api": {
        readonly name: "Allow-K8s-API";
        readonly description: "Allow inbound Kubernetes API traffic on port 6443";
        readonly priority: 800;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "6443";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Docker - Container management (port 2375)
     */
    readonly "allow-docker": {
        readonly name: "Allow-Docker";
        readonly description: "Allow inbound Docker traffic on port 2375";
        readonly priority: 810;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "2375";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Docker TLS - Secure container management (port 2376)
     */
    readonly "allow-docker-tls": {
        readonly name: "Allow-Docker-TLS";
        readonly description: "Allow inbound secure Docker traffic on port 2376";
        readonly priority: 820;
        readonly direction: "Inbound";
        readonly access: "Allow";
        readonly protocol: "Tcp";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "2376";
        readonly sourceAddressPrefix: "VirtualNetwork";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Deny all inbound traffic (should be last rule)
     */
    readonly "deny-all-inbound": {
        readonly name: "Deny-All-Inbound";
        readonly description: "Deny all other inbound traffic";
        readonly priority: 4000;
        readonly direction: "Inbound";
        readonly access: "Deny";
        readonly protocol: "*";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "*";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
    /**
     * Deny all outbound traffic (should be last rule)
     */
    readonly "deny-all-outbound": {
        readonly name: "Deny-All-Outbound";
        readonly description: "Deny all other outbound traffic";
        readonly priority: 4000;
        readonly direction: "Outbound";
        readonly access: "Deny";
        readonly protocol: "*";
        readonly sourcePortRange: "*";
        readonly destinationPortRange: "*";
        readonly sourceAddressPrefix: "*";
        readonly destinationAddressPrefix: "*";
    };
};
export type NsgRuleKey = keyof typeof NSG_RULES;
/**
 * Common NSG rule templates for specific scenarios
 */
export declare const NSG_TEMPLATES: {
    /**
     * Web server - HTTP/HTTPS only
     */
    readonly "web-server": {
        readonly name: "Web Server";
        readonly description: "Allow HTTP and HTTPS traffic";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Database server - SQL, MySQL, PostgreSQL
     */
    readonly "database-server": {
        readonly name: "Database Server";
        readonly description: "Allow database traffic from VNet only";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Linux server - SSH access
     */
    readonly "linux-server": {
        readonly name: "Linux Server";
        readonly description: "Allow SSH access";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Windows server - RDP and WinRM
     */
    readonly "windows-server": {
        readonly name: "Windows Server";
        readonly description: "Allow RDP and WinRM access";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Application server - Web + App ports
     */
    readonly "app-server": {
        readonly name: "Application Server";
        readonly description: "Allow web and application traffic";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Container host - Docker + Kubernetes
     */
    readonly "container-host": {
        readonly name: "Container Host";
        readonly description: "Allow container orchestration traffic";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Bastion/Jump box - SSH and RDP
     */
    readonly bastion: {
        readonly name: "Bastion Host";
        readonly description: "Allow SSH and RDP for jump box";
        readonly rules: NsgRuleKey[];
    };
    /**
     * Locked down - Deny all
     */
    readonly "locked-down": {
        readonly name: "Locked Down";
        readonly description: "Deny all traffic (use VNet service endpoints)";
        readonly rules: NsgRuleKey[];
    };
};
export type NsgTemplateKey = keyof typeof NSG_TEMPLATES;
/**
 * Well-known Azure service tags for NSG rules
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview
 */
export declare const SERVICE_TAGS: {
    readonly Internet: "Internet - All public internet addresses";
    readonly VirtualNetwork: "VirtualNetwork - All VNet addresses";
    readonly AzureLoadBalancer: "AzureLoadBalancer - Azure infrastructure load balancer";
    readonly AzureCloud: "AzureCloud - All Azure datacenter IP addresses";
    readonly Storage: "Storage - Azure Storage service";
    readonly Sql: "Sql - Azure SQL Database service";
    readonly AzureCosmosDB: "AzureCosmosDB - Azure Cosmos DB service";
    readonly AzureKeyVault: "AzureKeyVault - Azure Key Vault service";
    readonly EventHub: "EventHub - Azure Event Hubs service";
    readonly ServiceBus: "ServiceBus - Azure Service Bus service";
    readonly AzureActiveDirectory: "AzureActiveDirectory - Azure AD service";
    readonly AzureMonitor: "AzureMonitor - Azure Monitor service";
    readonly AzureBackup: "AzureBackup - Azure Backup service";
    readonly AppService: "AppService - Azure App Service";
};
/**
 * Get NSG rule by key
 */
export declare function getNsgRule(key: NsgRuleKey): (typeof NSG_RULES)[NsgRuleKey] | undefined;
/**
 * Get all NSG rules
 */
export declare function getAllNsgRules(): Array<{
    key: NsgRuleKey;
    rule: (typeof NSG_RULES)[NsgRuleKey];
}>;
/**
 * Get NSG rules by direction
 */
export declare function getNsgRulesByDirection(direction: "Inbound" | "Outbound"): Array<{
    key: NsgRuleKey;
    rule: (typeof NSG_RULES)[NsgRuleKey];
}>;
/**
 * Get NSG rules by protocol
 */
export declare function getNsgRulesByProtocol(protocol: "Tcp" | "Udp" | "Icmp" | "*"): Array<{
    key: NsgRuleKey;
    rule: (typeof NSG_RULES)[NsgRuleKey];
}>;
/**
 * Get NSG template by key
 */
export declare function getNsgTemplate(key: NsgTemplateKey): (typeof NSG_TEMPLATES)[NsgTemplateKey] | undefined;
/**
 * Get all NSG templates
 */
export declare function getAllNsgTemplates(): Array<{
    key: NsgTemplateKey;
    template: (typeof NSG_TEMPLATES)[NsgTemplateKey];
}>;
/**
 * Validate NSG rule priority (100-4096)
 */
export declare function validateNsgPriority(priority: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate port range
 */
export declare function validatePortRange(portRange: string): {
    valid: boolean;
    error?: string;
};
/**
 * Get service tag description
 */
export declare function getServiceTagDescription(tag: keyof typeof SERVICE_TAGS): string;
/**
 * Create custom NSG rule
 */
export declare function createNsgRule(config: Partial<NsgRuleConfig> & {
    name: string;
}): NsgRuleConfig;
