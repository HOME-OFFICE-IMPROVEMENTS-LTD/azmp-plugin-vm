/**
 * Azure Load Balancer Configuration
 * Source: https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview
 */
/**
 * Load Balancer SKU types
 */
export type LoadBalancerSku = "Basic" | "Standard" | "Gateway";
/**
 * Load Balancer tier
 */
export type LoadBalancerTier = "Regional" | "Global";
/**
 * Health Probe Protocol
 */
export type ProbeProtocol = "Http" | "Https" | "Tcp";
/**
 * Load Balancing Rule Protocol
 */
export type LoadBalancingProtocol = "Tcp" | "Udp" | "All";
/**
 * Health Probe Configuration
 */
export interface HealthProbeConfig {
    readonly name: string;
    readonly description: string;
    readonly protocol: ProbeProtocol;
    readonly port: number;
    readonly requestPath?: string;
    readonly intervalInSeconds: number;
    readonly numberOfProbes: number;
}
/**
 * Backend Pool Configuration
 */
export interface BackendPoolConfig {
    readonly name: string;
    readonly description: string;
}
/**
 * Load Balancing Rule Configuration
 */
export interface LoadBalancingRuleConfig {
    readonly name: string;
    readonly description: string;
    readonly protocol: LoadBalancingProtocol;
    readonly frontendPort: number;
    readonly backendPort: number;
    readonly enableFloatingIP: boolean;
    readonly idleTimeoutInMinutes: number;
    readonly enableTcpReset: boolean;
}
/**
 * Inbound NAT Rule Configuration
 */
export interface InboundNatRuleConfig {
    readonly name: string;
    readonly description: string;
    readonly protocol: "Tcp" | "Udp";
    readonly frontendPort: number;
    readonly backendPort: number;
    readonly enableFloatingIP: boolean;
    readonly idleTimeoutInMinutes: number;
    readonly enableTcpReset: boolean;
}
/**
 * Load Balancer Template Configuration
 */
export interface LoadBalancerTemplate {
    readonly name: string;
    readonly description: string;
    readonly sku: LoadBalancerSku;
    readonly tier: LoadBalancerTier;
    readonly isPublic: boolean;
    readonly healthProbes: readonly string[];
    readonly backendPools: readonly string[];
    readonly loadBalancingRules: readonly string[];
}
/**
 * Common health probe configurations
 */
export declare const HEALTH_PROBES: {
    /**
     * HTTP probe on port 80
     */
    readonly "http-80": {
        readonly name: "http-probe-80";
        readonly description: "HTTP health probe on port 80";
        readonly protocol: "Http";
        readonly port: 80;
        readonly requestPath: "/";
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * HTTPS probe on port 443
     */
    readonly "https-443": {
        readonly name: "https-probe-443";
        readonly description: "HTTPS health probe on port 443";
        readonly protocol: "Https";
        readonly port: 443;
        readonly requestPath: "/";
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * HTTP probe on port 8080
     */
    readonly "http-8080": {
        readonly name: "http-probe-8080";
        readonly description: "HTTP health probe on port 8080";
        readonly protocol: "Http";
        readonly port: 8080;
        readonly requestPath: "/health";
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * TCP probe on port 80
     */
    readonly "tcp-80": {
        readonly name: "tcp-probe-80";
        readonly description: "TCP health probe on port 80";
        readonly protocol: "Tcp";
        readonly port: 80;
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * TCP probe on port 443
     */
    readonly "tcp-443": {
        readonly name: "tcp-probe-443";
        readonly description: "TCP health probe on port 443";
        readonly protocol: "Tcp";
        readonly port: 443;
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * TCP probe on port 22 (SSH)
     */
    readonly "tcp-22": {
        readonly name: "tcp-probe-22";
        readonly description: "TCP health probe on port 22 (SSH)";
        readonly protocol: "Tcp";
        readonly port: 22;
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * TCP probe on port 3389 (RDP)
     */
    readonly "tcp-3389": {
        readonly name: "tcp-probe-3389";
        readonly description: "TCP health probe on port 3389 (RDP)";
        readonly protocol: "Tcp";
        readonly port: 3389;
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
    /**
     * HTTP health endpoint probe
     */
    readonly "http-health": {
        readonly name: "http-probe-health";
        readonly description: "HTTP health endpoint probe";
        readonly protocol: "Http";
        readonly port: 80;
        readonly requestPath: "/health";
        readonly intervalInSeconds: 10;
        readonly numberOfProbes: 2;
    };
    /**
     * HTTPS health endpoint probe
     */
    readonly "https-health": {
        readonly name: "https-probe-health";
        readonly description: "HTTPS health endpoint probe";
        readonly protocol: "Https";
        readonly port: 443;
        readonly requestPath: "/health";
        readonly intervalInSeconds: 10;
        readonly numberOfProbes: 2;
    };
    /**
     * Custom application probe
     */
    readonly "http-api": {
        readonly name: "http-probe-api";
        readonly description: "HTTP API health probe";
        readonly protocol: "Http";
        readonly port: 8080;
        readonly requestPath: "/api/health";
        readonly intervalInSeconds: 15;
        readonly numberOfProbes: 2;
    };
};
export type HealthProbeKey = keyof typeof HEALTH_PROBES;
/**
 * Common backend pool configurations
 */
export declare const BACKEND_POOLS: {
    /**
     * Web tier backend pool
     */
    readonly "web-pool": {
        readonly name: "web-backend-pool";
        readonly description: "Backend pool for web tier VMs";
    };
    /**
     * App tier backend pool
     */
    readonly "app-pool": {
        readonly name: "app-backend-pool";
        readonly description: "Backend pool for application tier VMs";
    };
    /**
     * API tier backend pool
     */
    readonly "api-pool": {
        readonly name: "api-backend-pool";
        readonly description: "Backend pool for API tier VMs";
    };
    /**
     * Database tier backend pool
     */
    readonly "data-pool": {
        readonly name: "data-backend-pool";
        readonly description: "Backend pool for database tier VMs";
    };
    /**
     * Default backend pool
     */
    readonly "default-pool": {
        readonly name: "default-backend-pool";
        readonly description: "Default backend pool";
    };
};
export type BackendPoolKey = keyof typeof BACKEND_POOLS;
/**
 * Common load balancing rules
 */
export declare const LOAD_BALANCING_RULES: {
    /**
     * HTTP load balancing rule
     */
    readonly "http-rule": {
        readonly name: "http-lb-rule";
        readonly description: "Load balancing rule for HTTP traffic";
        readonly protocol: "Tcp";
        readonly frontendPort: 80;
        readonly backendPort: 80;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
    /**
     * HTTPS load balancing rule
     */
    readonly "https-rule": {
        readonly name: "https-lb-rule";
        readonly description: "Load balancing rule for HTTPS traffic";
        readonly protocol: "Tcp";
        readonly frontendPort: 443;
        readonly backendPort: 443;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
    /**
     * Custom app port 8080
     */
    readonly "app-8080-rule": {
        readonly name: "app-8080-lb-rule";
        readonly description: "Load balancing rule for app port 8080";
        readonly protocol: "Tcp";
        readonly frontendPort: 8080;
        readonly backendPort: 8080;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
    /**
     * SQL Server load balancing
     */
    readonly "sql-rule": {
        readonly name: "sql-lb-rule";
        readonly description: "Load balancing rule for SQL Server";
        readonly protocol: "Tcp";
        readonly frontendPort: 1433;
        readonly backendPort: 1433;
        readonly enableFloatingIP: true;
        readonly idleTimeoutInMinutes: 30;
        readonly enableTcpReset: true;
    };
    /**
     * PostgreSQL load balancing
     */
    readonly "postgresql-rule": {
        readonly name: "postgresql-lb-rule";
        readonly description: "Load balancing rule for PostgreSQL";
        readonly protocol: "Tcp";
        readonly frontendPort: 5432;
        readonly backendPort: 5432;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 30;
        readonly enableTcpReset: true;
    };
    /**
     * MySQL load balancing
     */
    readonly "mysql-rule": {
        readonly name: "mysql-lb-rule";
        readonly description: "Load balancing rule for MySQL";
        readonly protocol: "Tcp";
        readonly frontendPort: 3306;
        readonly backendPort: 3306;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 30;
        readonly enableTcpReset: true;
    };
    /**
     * All ports load balancing (HA Ports)
     */
    readonly "ha-ports-rule": {
        readonly name: "ha-ports-lb-rule";
        readonly description: "HA Ports load balancing rule (all ports)";
        readonly protocol: "All";
        readonly frontendPort: 0;
        readonly backendPort: 0;
        readonly enableFloatingIP: true;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
};
export type LoadBalancingRuleKey = keyof typeof LOAD_BALANCING_RULES;
/**
 * Common inbound NAT rules
 */
export declare const INBOUND_NAT_RULES: {
    /**
     * SSH NAT rule
     */
    readonly "ssh-nat": {
        readonly name: "ssh-nat-rule";
        readonly description: "Inbound NAT rule for SSH";
        readonly protocol: "Tcp";
        readonly frontendPort: 2222;
        readonly backendPort: 22;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
    /**
     * RDP NAT rule
     */
    readonly "rdp-nat": {
        readonly name: "rdp-nat-rule";
        readonly description: "Inbound NAT rule for RDP";
        readonly protocol: "Tcp";
        readonly frontendPort: 3390;
        readonly backendPort: 3389;
        readonly enableFloatingIP: false;
        readonly idleTimeoutInMinutes: 4;
        readonly enableTcpReset: true;
    };
};
export type InboundNatRuleKey = keyof typeof INBOUND_NAT_RULES;
/**
 * Load Balancer templates for common scenarios
 */
export declare const LOAD_BALANCER_TEMPLATES: {
    /**
     * Public web load balancer
     */
    readonly "public-web": {
        readonly name: "Public Web Load Balancer";
        readonly description: "Public-facing load balancer for web traffic";
        readonly sku: "Standard";
        readonly tier: "Regional";
        readonly isPublic: true;
        readonly healthProbes: readonly ["http-80", "https-443"];
        readonly backendPools: readonly ["web-pool"];
        readonly loadBalancingRules: readonly ["http-rule", "https-rule"];
    };
    /**
     * Internal app load balancer
     */
    readonly "internal-app": {
        readonly name: "Internal App Load Balancer";
        readonly description: "Internal load balancer for application tier";
        readonly sku: "Standard";
        readonly tier: "Regional";
        readonly isPublic: false;
        readonly healthProbes: readonly ["http-8080"];
        readonly backendPools: readonly ["app-pool"];
        readonly loadBalancingRules: readonly ["app-8080-rule"];
    };
    /**
     * Internal database load balancer
     */
    readonly "internal-database": {
        readonly name: "Internal Database Load Balancer";
        readonly description: "Internal load balancer for database tier";
        readonly sku: "Standard";
        readonly tier: "Regional";
        readonly isPublic: false;
        readonly healthProbes: readonly ["tcp-3306", "tcp-5432"];
        readonly backendPools: readonly ["data-pool"];
        readonly loadBalancingRules: readonly ["mysql-rule", "postgresql-rule"];
    };
    /**
     * HA Ports internal load balancer
     */
    readonly "internal-ha-ports": {
        readonly name: "Internal HA Ports Load Balancer";
        readonly description: "Internal load balancer with HA Ports for all traffic";
        readonly sku: "Standard";
        readonly tier: "Regional";
        readonly isPublic: false;
        readonly healthProbes: readonly ["tcp-443"];
        readonly backendPools: readonly ["default-pool"];
        readonly loadBalancingRules: readonly ["ha-ports-rule"];
    };
    /**
     * Public SSH/RDP jump box
     */
    readonly "public-jumpbox": {
        readonly name: "Public Jump Box Load Balancer";
        readonly description: "Public load balancer for SSH/RDP access";
        readonly sku: "Standard";
        readonly tier: "Regional";
        readonly isPublic: true;
        readonly healthProbes: readonly ["tcp-22", "tcp-3389"];
        readonly backendPools: readonly ["default-pool"];
        readonly loadBalancingRules: readonly [];
    };
};
export type LoadBalancerTemplateKey = keyof typeof LOAD_BALANCER_TEMPLATES;
/**
 * Get health probe by key
 */
export declare function getHealthProbe(key: HealthProbeKey): (typeof HEALTH_PROBES)[HealthProbeKey] | undefined;
/**
 * Get all health probes
 */
export declare function getAllHealthProbes(): Array<{
    key: HealthProbeKey;
    probe: (typeof HEALTH_PROBES)[HealthProbeKey];
}>;
/**
 * Get health probes by protocol
 */
export declare function getHealthProbesByProtocol(protocol: ProbeProtocol): Array<{
    key: HealthProbeKey;
    probe: (typeof HEALTH_PROBES)[HealthProbeKey];
}>;
/**
 * Get backend pool by key
 */
export declare function getBackendPool(key: BackendPoolKey): (typeof BACKEND_POOLS)[BackendPoolKey] | undefined;
/**
 * Get all backend pools
 */
export declare function getAllBackendPools(): Array<{
    key: BackendPoolKey;
    pool: (typeof BACKEND_POOLS)[BackendPoolKey];
}>;
/**
 * Get load balancing rule by key
 */
export declare function getLoadBalancingRule(key: LoadBalancingRuleKey): (typeof LOAD_BALANCING_RULES)[LoadBalancingRuleKey] | undefined;
/**
 * Get all load balancing rules
 */
export declare function getAllLoadBalancingRules(): Array<{
    key: LoadBalancingRuleKey;
    rule: (typeof LOAD_BALANCING_RULES)[LoadBalancingRuleKey];
}>;
/**
 * Get inbound NAT rule by key
 */
export declare function getInboundNatRule(key: InboundNatRuleKey): (typeof INBOUND_NAT_RULES)[InboundNatRuleKey] | undefined;
/**
 * Get all inbound NAT rules
 */
export declare function getAllInboundNatRules(): Array<{
    key: InboundNatRuleKey;
    rule: (typeof INBOUND_NAT_RULES)[InboundNatRuleKey];
}>;
/**
 * Get load balancer template by key
 */
export declare function getLoadBalancerTemplate(key: LoadBalancerTemplateKey): (typeof LOAD_BALANCER_TEMPLATES)[LoadBalancerTemplateKey] | undefined;
/**
 * Get all load balancer templates
 */
export declare function getAllLoadBalancerTemplates(): Array<{
    key: LoadBalancerTemplateKey;
    template: (typeof LOAD_BALANCER_TEMPLATES)[LoadBalancerTemplateKey];
}>;
/**
 * Validate health probe interval
 */
export declare function validateProbeInterval(intervalInSeconds: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate number of probes
 */
export declare function validateNumberOfProbes(numberOfProbes: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate idle timeout
 */
export declare function validateIdleTimeout(timeoutInMinutes: number): {
    valid: boolean;
    error?: string;
};
/**
 * Calculate health check duration
 */
export declare function calculateHealthCheckDuration(intervalInSeconds: number, numberOfProbes: number): number;
