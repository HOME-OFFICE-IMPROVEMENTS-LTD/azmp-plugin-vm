"use strict";
/**
 * Azure Load Balancer Configuration
 * Source: https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAD_BALANCER_TEMPLATES = exports.INBOUND_NAT_RULES = exports.LOAD_BALANCING_RULES = exports.BACKEND_POOLS = exports.HEALTH_PROBES = void 0;
exports.getHealthProbe = getHealthProbe;
exports.getAllHealthProbes = getAllHealthProbes;
exports.getHealthProbesByProtocol = getHealthProbesByProtocol;
exports.getBackendPool = getBackendPool;
exports.getAllBackendPools = getAllBackendPools;
exports.getLoadBalancingRule = getLoadBalancingRule;
exports.getAllLoadBalancingRules = getAllLoadBalancingRules;
exports.getInboundNatRule = getInboundNatRule;
exports.getAllInboundNatRules = getAllInboundNatRules;
exports.getLoadBalancerTemplate = getLoadBalancerTemplate;
exports.getAllLoadBalancerTemplates = getAllLoadBalancerTemplates;
exports.validateProbeInterval = validateProbeInterval;
exports.validateNumberOfProbes = validateNumberOfProbes;
exports.validateIdleTimeout = validateIdleTimeout;
exports.calculateHealthCheckDuration = calculateHealthCheckDuration;
/**
 * Common health probe configurations
 */
exports.HEALTH_PROBES = {
    /**
     * HTTP probe on port 80
     */
    "http-80": {
        name: "http-probe-80",
        description: "HTTP health probe on port 80",
        protocol: "Http",
        port: 80,
        requestPath: "/",
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * HTTPS probe on port 443
     */
    "https-443": {
        name: "https-probe-443",
        description: "HTTPS health probe on port 443",
        protocol: "Https",
        port: 443,
        requestPath: "/",
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * HTTP probe on port 8080
     */
    "http-8080": {
        name: "http-probe-8080",
        description: "HTTP health probe on port 8080",
        protocol: "Http",
        port: 8080,
        requestPath: "/health",
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * TCP probe on port 80
     */
    "tcp-80": {
        name: "tcp-probe-80",
        description: "TCP health probe on port 80",
        protocol: "Tcp",
        port: 80,
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * TCP probe on port 443
     */
    "tcp-443": {
        name: "tcp-probe-443",
        description: "TCP health probe on port 443",
        protocol: "Tcp",
        port: 443,
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * TCP probe on port 22 (SSH)
     */
    "tcp-22": {
        name: "tcp-probe-22",
        description: "TCP health probe on port 22 (SSH)",
        protocol: "Tcp",
        port: 22,
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * TCP probe on port 3389 (RDP)
     */
    "tcp-3389": {
        name: "tcp-probe-3389",
        description: "TCP health probe on port 3389 (RDP)",
        protocol: "Tcp",
        port: 3389,
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
    /**
     * HTTP health endpoint probe
     */
    "http-health": {
        name: "http-probe-health",
        description: "HTTP health endpoint probe",
        protocol: "Http",
        port: 80,
        requestPath: "/health",
        intervalInSeconds: 10,
        numberOfProbes: 2,
    },
    /**
     * HTTPS health endpoint probe
     */
    "https-health": {
        name: "https-probe-health",
        description: "HTTPS health endpoint probe",
        protocol: "Https",
        port: 443,
        requestPath: "/health",
        intervalInSeconds: 10,
        numberOfProbes: 2,
    },
    /**
     * Custom application probe
     */
    "http-api": {
        name: "http-probe-api",
        description: "HTTP API health probe",
        protocol: "Http",
        port: 8080,
        requestPath: "/api/health",
        intervalInSeconds: 15,
        numberOfProbes: 2,
    },
};
/**
 * Common backend pool configurations
 */
exports.BACKEND_POOLS = {
    /**
     * Web tier backend pool
     */
    "web-pool": {
        name: "web-backend-pool",
        description: "Backend pool for web tier VMs",
    },
    /**
     * App tier backend pool
     */
    "app-pool": {
        name: "app-backend-pool",
        description: "Backend pool for application tier VMs",
    },
    /**
     * API tier backend pool
     */
    "api-pool": {
        name: "api-backend-pool",
        description: "Backend pool for API tier VMs",
    },
    /**
     * Database tier backend pool
     */
    "data-pool": {
        name: "data-backend-pool",
        description: "Backend pool for database tier VMs",
    },
    /**
     * Default backend pool
     */
    "default-pool": {
        name: "default-backend-pool",
        description: "Default backend pool",
    },
};
/**
 * Common load balancing rules
 */
exports.LOAD_BALANCING_RULES = {
    /**
     * HTTP load balancing rule
     */
    "http-rule": {
        name: "http-lb-rule",
        description: "Load balancing rule for HTTP traffic",
        protocol: "Tcp",
        frontendPort: 80,
        backendPort: 80,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
    /**
     * HTTPS load balancing rule
     */
    "https-rule": {
        name: "https-lb-rule",
        description: "Load balancing rule for HTTPS traffic",
        protocol: "Tcp",
        frontendPort: 443,
        backendPort: 443,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
    /**
     * Custom app port 8080
     */
    "app-8080-rule": {
        name: "app-8080-lb-rule",
        description: "Load balancing rule for app port 8080",
        protocol: "Tcp",
        frontendPort: 8080,
        backendPort: 8080,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
    /**
     * SQL Server load balancing
     */
    "sql-rule": {
        name: "sql-lb-rule",
        description: "Load balancing rule for SQL Server",
        protocol: "Tcp",
        frontendPort: 1433,
        backendPort: 1433,
        enableFloatingIP: true, // Required for SQL AlwaysOn
        idleTimeoutInMinutes: 30,
        enableTcpReset: true,
    },
    /**
     * PostgreSQL load balancing
     */
    "postgresql-rule": {
        name: "postgresql-lb-rule",
        description: "Load balancing rule for PostgreSQL",
        protocol: "Tcp",
        frontendPort: 5432,
        backendPort: 5432,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 30,
        enableTcpReset: true,
    },
    /**
     * MySQL load balancing
     */
    "mysql-rule": {
        name: "mysql-lb-rule",
        description: "Load balancing rule for MySQL",
        protocol: "Tcp",
        frontendPort: 3306,
        backendPort: 3306,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 30,
        enableTcpReset: true,
    },
    /**
     * All ports load balancing (HA Ports)
     */
    "ha-ports-rule": {
        name: "ha-ports-lb-rule",
        description: "HA Ports load balancing rule (all ports)",
        protocol: "All",
        frontendPort: 0,
        backendPort: 0,
        enableFloatingIP: true,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
};
/**
 * Common inbound NAT rules
 */
exports.INBOUND_NAT_RULES = {
    /**
     * SSH NAT rule
     */
    "ssh-nat": {
        name: "ssh-nat-rule",
        description: "Inbound NAT rule for SSH",
        protocol: "Tcp",
        frontendPort: 2222,
        backendPort: 22,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
    /**
     * RDP NAT rule
     */
    "rdp-nat": {
        name: "rdp-nat-rule",
        description: "Inbound NAT rule for RDP",
        protocol: "Tcp",
        frontendPort: 3390,
        backendPort: 3389,
        enableFloatingIP: false,
        idleTimeoutInMinutes: 4,
        enableTcpReset: true,
    },
};
/**
 * Load Balancer templates for common scenarios
 */
exports.LOAD_BALANCER_TEMPLATES = {
    /**
     * Public web load balancer
     */
    "public-web": {
        name: "Public Web Load Balancer",
        description: "Public-facing load balancer for web traffic",
        sku: "Standard",
        tier: "Regional",
        isPublic: true,
        healthProbes: ["http-80", "https-443"],
        backendPools: ["web-pool"],
        loadBalancingRules: ["http-rule", "https-rule"],
    },
    /**
     * Internal app load balancer
     */
    "internal-app": {
        name: "Internal App Load Balancer",
        description: "Internal load balancer for application tier",
        sku: "Standard",
        tier: "Regional",
        isPublic: false,
        healthProbes: ["http-8080"],
        backendPools: ["app-pool"],
        loadBalancingRules: ["app-8080-rule"],
    },
    /**
     * Internal database load balancer
     */
    "internal-database": {
        name: "Internal Database Load Balancer",
        description: "Internal load balancer for database tier",
        sku: "Standard",
        tier: "Regional",
        isPublic: false,
        healthProbes: ["tcp-3306", "tcp-5432"],
        backendPools: ["data-pool"],
        loadBalancingRules: ["mysql-rule", "postgresql-rule"],
    },
    /**
     * HA Ports internal load balancer
     */
    "internal-ha-ports": {
        name: "Internal HA Ports Load Balancer",
        description: "Internal load balancer with HA Ports for all traffic",
        sku: "Standard",
        tier: "Regional",
        isPublic: false,
        healthProbes: ["tcp-443"],
        backendPools: ["default-pool"],
        loadBalancingRules: ["ha-ports-rule"],
    },
    /**
     * Public SSH/RDP jump box
     */
    "public-jumpbox": {
        name: "Public Jump Box Load Balancer",
        description: "Public load balancer for SSH/RDP access",
        sku: "Standard",
        tier: "Regional",
        isPublic: true,
        healthProbes: ["tcp-22", "tcp-3389"],
        backendPools: ["default-pool"],
        loadBalancingRules: [],
    },
};
/**
 * Get health probe by key
 */
function getHealthProbe(key) {
    return exports.HEALTH_PROBES[key];
}
/**
 * Get all health probes
 */
function getAllHealthProbes() {
    return Object.entries(exports.HEALTH_PROBES).map(([key, probe]) => ({
        key: key,
        probe,
    }));
}
/**
 * Get health probes by protocol
 */
function getHealthProbesByProtocol(protocol) {
    return getAllHealthProbes().filter(({ probe }) => probe.protocol === protocol);
}
/**
 * Get backend pool by key
 */
function getBackendPool(key) {
    return exports.BACKEND_POOLS[key];
}
/**
 * Get all backend pools
 */
function getAllBackendPools() {
    return Object.entries(exports.BACKEND_POOLS).map(([key, pool]) => ({
        key: key,
        pool,
    }));
}
/**
 * Get load balancing rule by key
 */
function getLoadBalancingRule(key) {
    return exports.LOAD_BALANCING_RULES[key];
}
/**
 * Get all load balancing rules
 */
function getAllLoadBalancingRules() {
    return Object.entries(exports.LOAD_BALANCING_RULES).map(([key, rule]) => ({
        key: key,
        rule,
    }));
}
/**
 * Get inbound NAT rule by key
 */
function getInboundNatRule(key) {
    return exports.INBOUND_NAT_RULES[key];
}
/**
 * Get all inbound NAT rules
 */
function getAllInboundNatRules() {
    return Object.entries(exports.INBOUND_NAT_RULES).map(([key, rule]) => ({
        key: key,
        rule,
    }));
}
/**
 * Get load balancer template by key
 */
function getLoadBalancerTemplate(key) {
    return exports.LOAD_BALANCER_TEMPLATES[key];
}
/**
 * Get all load balancer templates
 */
function getAllLoadBalancerTemplates() {
    return Object.entries(exports.LOAD_BALANCER_TEMPLATES).map(([key, template]) => ({
        key: key,
        template,
    }));
}
/**
 * Validate health probe interval
 */
function validateProbeInterval(intervalInSeconds) {
    if (intervalInSeconds < 5 || intervalInSeconds > 2147483646) {
        return {
            valid: false,
            error: "Probe interval must be between 5 and 2147483646 seconds",
        };
    }
    return { valid: true };
}
/**
 * Validate number of probes
 */
function validateNumberOfProbes(numberOfProbes) {
    if (numberOfProbes < 1 || numberOfProbes > 2147483647) {
        return {
            valid: false,
            error: "Number of probes must be between 1 and 2147483647",
        };
    }
    return { valid: true };
}
/**
 * Validate idle timeout
 */
function validateIdleTimeout(timeoutInMinutes) {
    if (timeoutInMinutes < 4 || timeoutInMinutes > 30) {
        return {
            valid: false,
            error: "Idle timeout must be between 4 and 30 minutes",
        };
    }
    return { valid: true };
}
/**
 * Calculate health check duration
 */
function calculateHealthCheckDuration(intervalInSeconds, numberOfProbes) {
    return intervalInSeconds * numberOfProbes;
}
