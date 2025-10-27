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
  readonly requestPath?: string; // For HTTP/HTTPS probes
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
  readonly healthProbes: readonly string[]; // Health probe keys
  readonly backendPools: readonly string[]; // Backend pool keys
  readonly loadBalancingRules: readonly string[]; // Rule keys
}

/**
 * Common health probe configurations
 */
export const HEALTH_PROBES = {
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
} as const;

export type HealthProbeKey = keyof typeof HEALTH_PROBES;

/**
 * Common backend pool configurations
 */
export const BACKEND_POOLS = {
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
} as const;

export type BackendPoolKey = keyof typeof BACKEND_POOLS;

/**
 * Common load balancing rules
 */
export const LOAD_BALANCING_RULES = {
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
} as const;

export type LoadBalancingRuleKey = keyof typeof LOAD_BALANCING_RULES;

/**
 * Common inbound NAT rules
 */
export const INBOUND_NAT_RULES = {
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
} as const;

export type InboundNatRuleKey = keyof typeof INBOUND_NAT_RULES;

/**
 * Load Balancer templates for common scenarios
 */
export const LOAD_BALANCER_TEMPLATES = {
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
} as const;

export type LoadBalancerTemplateKey = keyof typeof LOAD_BALANCER_TEMPLATES;

/**
 * Get health probe by key
 */
export function getHealthProbe(
  key: HealthProbeKey,
): (typeof HEALTH_PROBES)[HealthProbeKey] | undefined {
  return HEALTH_PROBES[key];
}

/**
 * Get all health probes
 */
export function getAllHealthProbes(): Array<{
  key: HealthProbeKey;
  probe: (typeof HEALTH_PROBES)[HealthProbeKey];
}> {
  return Object.entries(HEALTH_PROBES).map(([key, probe]) => ({
    key: key as HealthProbeKey,
    probe,
  }));
}

/**
 * Get health probes by protocol
 */
export function getHealthProbesByProtocol(protocol: ProbeProtocol): Array<{
  key: HealthProbeKey;
  probe: (typeof HEALTH_PROBES)[HealthProbeKey];
}> {
  return getAllHealthProbes().filter(
    ({ probe }) => probe.protocol === protocol,
  );
}

/**
 * Get backend pool by key
 */
export function getBackendPool(
  key: BackendPoolKey,
): (typeof BACKEND_POOLS)[BackendPoolKey] | undefined {
  return BACKEND_POOLS[key];
}

/**
 * Get all backend pools
 */
export function getAllBackendPools(): Array<{
  key: BackendPoolKey;
  pool: (typeof BACKEND_POOLS)[BackendPoolKey];
}> {
  return Object.entries(BACKEND_POOLS).map(([key, pool]) => ({
    key: key as BackendPoolKey,
    pool,
  }));
}

/**
 * Get load balancing rule by key
 */
export function getLoadBalancingRule(
  key: LoadBalancingRuleKey,
): (typeof LOAD_BALANCING_RULES)[LoadBalancingRuleKey] | undefined {
  return LOAD_BALANCING_RULES[key];
}

/**
 * Get all load balancing rules
 */
export function getAllLoadBalancingRules(): Array<{
  key: LoadBalancingRuleKey;
  rule: (typeof LOAD_BALANCING_RULES)[LoadBalancingRuleKey];
}> {
  return Object.entries(LOAD_BALANCING_RULES).map(([key, rule]) => ({
    key: key as LoadBalancingRuleKey,
    rule,
  }));
}

/**
 * Get inbound NAT rule by key
 */
export function getInboundNatRule(
  key: InboundNatRuleKey,
): (typeof INBOUND_NAT_RULES)[InboundNatRuleKey] | undefined {
  return INBOUND_NAT_RULES[key];
}

/**
 * Get all inbound NAT rules
 */
export function getAllInboundNatRules(): Array<{
  key: InboundNatRuleKey;
  rule: (typeof INBOUND_NAT_RULES)[InboundNatRuleKey];
}> {
  return Object.entries(INBOUND_NAT_RULES).map(([key, rule]) => ({
    key: key as InboundNatRuleKey,
    rule,
  }));
}

/**
 * Get load balancer template by key
 */
export function getLoadBalancerTemplate(
  key: LoadBalancerTemplateKey,
): (typeof LOAD_BALANCER_TEMPLATES)[LoadBalancerTemplateKey] | undefined {
  return LOAD_BALANCER_TEMPLATES[key];
}

/**
 * Get all load balancer templates
 */
export function getAllLoadBalancerTemplates(): Array<{
  key: LoadBalancerTemplateKey;
  template: (typeof LOAD_BALANCER_TEMPLATES)[LoadBalancerTemplateKey];
}> {
  return Object.entries(LOAD_BALANCER_TEMPLATES).map(([key, template]) => ({
    key: key as LoadBalancerTemplateKey,
    template,
  }));
}

/**
 * Validate health probe interval
 */
export function validateProbeInterval(intervalInSeconds: number): {
  valid: boolean;
  error?: string;
} {
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
export function validateNumberOfProbes(numberOfProbes: number): {
  valid: boolean;
  error?: string;
} {
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
export function validateIdleTimeout(timeoutInMinutes: number): {
  valid: boolean;
  error?: string;
} {
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
export function calculateHealthCheckDuration(
  intervalInSeconds: number,
  numberOfProbes: number,
): number {
  return intervalInSeconds * numberOfProbes;
}
