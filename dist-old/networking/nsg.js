"use strict";
/**
 * Azure Network Security Group (NSG) Configuration
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_TAGS = exports.NSG_TEMPLATES = exports.NSG_RULES = void 0;
exports.getNsgRule = getNsgRule;
exports.getAllNsgRules = getAllNsgRules;
exports.getNsgRulesByDirection = getNsgRulesByDirection;
exports.getNsgRulesByProtocol = getNsgRulesByProtocol;
exports.getNsgTemplate = getNsgTemplate;
exports.getAllNsgTemplates = getAllNsgTemplates;
exports.validateNsgPriority = validateNsgPriority;
exports.validatePortRange = validatePortRange;
exports.getServiceTagDescription = getServiceTagDescription;
exports.createNsgRule = createNsgRule;
/**
 * Common NSG security rules for Azure deployments
 * Priority ranges: 100-4096 (lower number = higher priority)
 */
exports.NSG_RULES = {
    /**
     * HTTP - Web traffic (port 80)
     */
    "allow-http": {
        name: "Allow-HTTP",
        description: "Allow inbound HTTP traffic on port 80",
        priority: 100,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "80",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * HTTPS - Secure web traffic (port 443)
     */
    "allow-https": {
        name: "Allow-HTTPS",
        description: "Allow inbound HTTPS traffic on port 443",
        priority: 110,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "443",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * SSH - Secure shell access (port 22)
     */
    "allow-ssh": {
        name: "Allow-SSH",
        description: "Allow inbound SSH traffic on port 22",
        priority: 200,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "22",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * RDP - Remote Desktop Protocol (port 3389)
     */
    "allow-rdp": {
        name: "Allow-RDP",
        description: "Allow inbound RDP traffic on port 3389",
        priority: 210,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "3389",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * SQL Server - Database access (port 1433)
     */
    "allow-sql": {
        name: "Allow-SQL",
        description: "Allow inbound SQL Server traffic on port 1433",
        priority: 300,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "1433",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * MySQL - Database access (port 3306)
     */
    "allow-mysql": {
        name: "Allow-MySQL",
        description: "Allow inbound MySQL traffic on port 3306",
        priority: 310,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "3306",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * PostgreSQL - Database access (port 5432)
     */
    "allow-postgresql": {
        name: "Allow-PostgreSQL",
        description: "Allow inbound PostgreSQL traffic on port 5432",
        priority: 320,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "5432",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Redis - Cache access (port 6379)
     */
    "allow-redis": {
        name: "Allow-Redis",
        description: "Allow inbound Redis traffic on port 6379",
        priority: 330,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "6379",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * MongoDB - NoSQL database (port 27017)
     */
    "allow-mongodb": {
        name: "Allow-MongoDB",
        description: "Allow inbound MongoDB traffic on port 27017",
        priority: 340,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "27017",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Custom application port 8080
     */
    "allow-app-8080": {
        name: "Allow-App-8080",
        description: "Allow inbound application traffic on port 8080",
        priority: 400,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "8080",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * Custom application port 8443
     */
    "allow-app-8443": {
        name: "Allow-App-8443",
        description: "Allow inbound secure application traffic on port 8443",
        priority: 410,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "8443",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * SMTP - Email (port 25)
     */
    "allow-smtp": {
        name: "Allow-SMTP",
        description: "Allow outbound SMTP traffic on port 25",
        priority: 500,
        direction: "Outbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "25",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "Internet",
    },
    /**
     * SMTPS - Secure email (port 587)
     */
    "allow-smtps": {
        name: "Allow-SMTPS",
        description: "Allow outbound secure SMTP traffic on port 587",
        priority: 510,
        direction: "Outbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "587",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "Internet",
    },
    /**
     * DNS - Domain name resolution (port 53)
     */
    "allow-dns": {
        name: "Allow-DNS",
        description: "Allow outbound DNS traffic on port 53",
        priority: 520,
        direction: "Outbound",
        access: "Allow",
        protocol: "*",
        sourcePortRange: "*",
        destinationPortRange: "53",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "Internet",
    },
    /**
     * NTP - Network time protocol (port 123)
     */
    "allow-ntp": {
        name: "Allow-NTP",
        description: "Allow outbound NTP traffic on port 123",
        priority: 530,
        direction: "Outbound",
        access: "Allow",
        protocol: "Udp",
        sourcePortRange: "*",
        destinationPortRange: "123",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "Internet",
    },
    /**
     * LDAP - Directory services (port 389)
     */
    "allow-ldap": {
        name: "Allow-LDAP",
        description: "Allow inbound LDAP traffic on port 389",
        priority: 600,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "389",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * LDAPS - Secure directory services (port 636)
     */
    "allow-ldaps": {
        name: "Allow-LDAPS",
        description: "Allow inbound secure LDAP traffic on port 636",
        priority: 610,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "636",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * WinRM - Windows Remote Management (port 5985)
     */
    "allow-winrm-http": {
        name: "Allow-WinRM-HTTP",
        description: "Allow inbound WinRM HTTP traffic on port 5985",
        priority: 700,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "5985",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * WinRM HTTPS - Secure Windows Remote Management (port 5986)
     */
    "allow-winrm-https": {
        name: "Allow-WinRM-HTTPS",
        description: "Allow inbound WinRM HTTPS traffic on port 5986",
        priority: 710,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "5986",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Kubernetes API Server (port 6443)
     */
    "allow-k8s-api": {
        name: "Allow-K8s-API",
        description: "Allow inbound Kubernetes API traffic on port 6443",
        priority: 800,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "6443",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Docker - Container management (port 2375)
     */
    "allow-docker": {
        name: "Allow-Docker",
        description: "Allow inbound Docker traffic on port 2375",
        priority: 810,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "2375",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Docker TLS - Secure container management (port 2376)
     */
    "allow-docker-tls": {
        name: "Allow-Docker-TLS",
        description: "Allow inbound secure Docker traffic on port 2376",
        priority: 820,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "2376",
        sourceAddressPrefix: "VirtualNetwork",
        destinationAddressPrefix: "*",
    },
    /**
     * Deny all inbound traffic (should be last rule)
     */
    "deny-all-inbound": {
        name: "Deny-All-Inbound",
        description: "Deny all other inbound traffic",
        priority: 4000,
        direction: "Inbound",
        access: "Deny",
        protocol: "*",
        sourcePortRange: "*",
        destinationPortRange: "*",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
    /**
     * Deny all outbound traffic (should be last rule)
     */
    "deny-all-outbound": {
        name: "Deny-All-Outbound",
        description: "Deny all other outbound traffic",
        priority: 4000,
        direction: "Outbound",
        access: "Deny",
        protocol: "*",
        sourcePortRange: "*",
        destinationPortRange: "*",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
    },
};
/**
 * Common NSG rule templates for specific scenarios
 */
exports.NSG_TEMPLATES = {
    /**
     * Web server - HTTP/HTTPS only
     */
    "web-server": {
        name: "Web Server",
        description: "Allow HTTP and HTTPS traffic",
        rules: ["allow-http", "allow-https"],
    },
    /**
     * Database server - SQL, MySQL, PostgreSQL
     */
    "database-server": {
        name: "Database Server",
        description: "Allow database traffic from VNet only",
        rules: ["allow-sql", "allow-mysql", "allow-postgresql"],
    },
    /**
     * Linux server - SSH access
     */
    "linux-server": {
        name: "Linux Server",
        description: "Allow SSH access",
        rules: ["allow-ssh"],
    },
    /**
     * Windows server - RDP and WinRM
     */
    "windows-server": {
        name: "Windows Server",
        description: "Allow RDP and WinRM access",
        rules: [
            "allow-rdp",
            "allow-winrm-http",
            "allow-winrm-https",
        ],
    },
    /**
     * Application server - Web + App ports
     */
    "app-server": {
        name: "Application Server",
        description: "Allow web and application traffic",
        rules: [
            "allow-http",
            "allow-https",
            "allow-app-8080",
            "allow-app-8443",
        ],
    },
    /**
     * Container host - Docker + Kubernetes
     */
    "container-host": {
        name: "Container Host",
        description: "Allow container orchestration traffic",
        rules: [
            "allow-docker",
            "allow-docker-tls",
            "allow-k8s-api",
        ],
    },
    /**
     * Bastion/Jump box - SSH and RDP
     */
    bastion: {
        name: "Bastion Host",
        description: "Allow SSH and RDP for jump box",
        rules: ["allow-ssh", "allow-rdp"],
    },
    /**
     * Locked down - Deny all
     */
    "locked-down": {
        name: "Locked Down",
        description: "Deny all traffic (use VNet service endpoints)",
        rules: ["deny-all-inbound", "deny-all-outbound"],
    },
};
/**
 * Well-known Azure service tags for NSG rules
 * Source: https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview
 */
exports.SERVICE_TAGS = {
    Internet: "Internet - All public internet addresses",
    VirtualNetwork: "VirtualNetwork - All VNet addresses",
    AzureLoadBalancer: "AzureLoadBalancer - Azure infrastructure load balancer",
    AzureCloud: "AzureCloud - All Azure datacenter IP addresses",
    Storage: "Storage - Azure Storage service",
    Sql: "Sql - Azure SQL Database service",
    AzureCosmosDB: "AzureCosmosDB - Azure Cosmos DB service",
    AzureKeyVault: "AzureKeyVault - Azure Key Vault service",
    EventHub: "EventHub - Azure Event Hubs service",
    ServiceBus: "ServiceBus - Azure Service Bus service",
    AzureActiveDirectory: "AzureActiveDirectory - Azure AD service",
    AzureMonitor: "AzureMonitor - Azure Monitor service",
    AzureBackup: "AzureBackup - Azure Backup service",
    AppService: "AppService - Azure App Service",
};
/**
 * Get NSG rule by key
 */
function getNsgRule(key) {
    return exports.NSG_RULES[key];
}
/**
 * Get all NSG rules
 */
function getAllNsgRules() {
    return Object.entries(exports.NSG_RULES).map(([key, rule]) => ({
        key: key,
        rule,
    }));
}
/**
 * Get NSG rules by direction
 */
function getNsgRulesByDirection(direction) {
    return getAllNsgRules().filter(({ rule }) => rule.direction === direction);
}
/**
 * Get NSG rules by protocol
 */
function getNsgRulesByProtocol(protocol) {
    return getAllNsgRules().filter(({ rule }) => rule.protocol === protocol);
}
/**
 * Get NSG template by key
 */
function getNsgTemplate(key) {
    return exports.NSG_TEMPLATES[key];
}
/**
 * Get all NSG templates
 */
function getAllNsgTemplates() {
    return Object.entries(exports.NSG_TEMPLATES).map(([key, template]) => ({
        key: key,
        template,
    }));
}
/**
 * Validate NSG rule priority (100-4096)
 */
function validateNsgPriority(priority) {
    if (priority < 100 || priority > 4096) {
        return {
            valid: false,
            error: "NSG rule priority must be between 100 and 4096",
        };
    }
    return { valid: true };
}
/**
 * Validate port range
 */
function validatePortRange(portRange) {
    // Allow * for any port
    if (portRange === "*")
        return { valid: true };
    // Allow single port (e.g., "80")
    const singlePort = /^\d+$/;
    if (singlePort.test(portRange)) {
        const port = parseInt(portRange, 10);
        if (port >= 0 && port <= 65535)
            return { valid: true };
        return { valid: false, error: "Port must be between 0 and 65535" };
    }
    // Allow port range (e.g., "80-443")
    const rangePort = /^(\d+)-(\d+)$/;
    const match = portRange.match(rangePort);
    if (match) {
        const startPort = parseInt(match[1], 10);
        const endPort = parseInt(match[2], 10);
        if (startPort >= 0 && endPort <= 65535 && startPort <= endPort) {
            return { valid: true };
        }
        return { valid: false, error: "Invalid port range" };
    }
    return {
        valid: false,
        error: "Invalid port format. Use * or number or range (e.g., 80-443)",
    };
}
/**
 * Get service tag description
 */
function getServiceTagDescription(tag) {
    return exports.SERVICE_TAGS[tag] || tag;
}
/**
 * Create custom NSG rule
 */
function createNsgRule(config) {
    return {
        name: config.name,
        description: config.description || "",
        priority: config.priority || 1000,
        direction: config.direction || "Inbound",
        access: config.access || "Allow",
        protocol: config.protocol || "Tcp",
        sourcePortRange: config.sourcePortRange || "*",
        destinationPortRange: config.destinationPortRange || "*",
        sourceAddressPrefix: config.sourceAddressPrefix || "*",
        destinationAddressPrefix: config.destinationAddressPrefix || "*",
    };
}
