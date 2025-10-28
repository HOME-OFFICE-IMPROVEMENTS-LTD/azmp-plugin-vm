// High Availability Load Balancer configuration and ARM template generation
// Provides public/internal load balancers with health probes, backend pools, and NAT rules

/**
 * Load balancer types and SKUs
 */
export type LoadBalancerType = 'public' | 'internal';
export type LoadBalancerSku = 'Basic' | 'Standard';

/**
 * Health probe configuration
 */
export interface HealthProbeConfig {
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  port: number;
  path?: string; // Required for HTTP/HTTPS
  intervalInSeconds?: number; // Default: 15
  numberOfProbes?: number; // Default: 2
  timeoutInSeconds?: number; // Default: 10
}

/**
 * Backend pool configuration
 */
export interface BackendPoolConfig {
  name: string;
  vmssResourceId?: string; // For VMSS integration
  vmResourceIds?: string[]; // For standalone VMs
}

/**
 * Load balancing rule configuration
 */
export interface LoadBalancingRuleConfig {
  name: string;
  frontendPort: number;
  backendPort: number;
  protocol: 'TCP' | 'UDP';
  healthProbeName: string;
  backendPoolName: string;
  enableFloatingIP?: boolean;
  idleTimeoutInMinutes?: number; // 4-30 minutes
  enableTcpReset?: boolean; // Standard LB only
}

/**
 * NAT rule configuration for direct VM access
 */
export interface NatRuleConfig {
  name: string;
  frontendPort: number;
  backendPort: number;
  protocol: 'TCP' | 'UDP';
  targetVmIndex?: number; // For specific VM targeting
}

/**
 * Complete load balancer configuration
 */
export interface LoadBalancerConfig {
  name: string;
  type: LoadBalancerType;
  sku: LoadBalancerSku;
  availabilityZones?: string[];
  
  // Frontend configuration
  frontend: {
    publicIpName?: string; // For public LB
    subnetId?: string; // For internal LB
    privateIpAddress?: string; // Static IP for internal LB
  };
  
  // Backend and health configuration
  backendPools: BackendPoolConfig[];
  healthProbes: HealthProbeConfig[];
  loadBalancingRules: LoadBalancingRuleConfig[];
  natRules?: NatRuleConfig[];
  
  // Advanced settings
  enableOutboundRules?: boolean; // Standard LB only
  enableHaPort?: boolean; // Internal Standard LB only
  tags?: Record<string, string>;
}

/**
 * Validates load balancer configuration
 */
export function validateLoadBalancerConfiguration(config: LoadBalancerConfig): string[] {
  const errors: string[] = [];
  
  // Basic validation
  if (!config.name || config.name.length < 1) {
    errors.push('Load balancer name is required');
  }
  
  // SKU and zone validation
  if (config.availabilityZones && config.availabilityZones.length > 0 && config.sku === 'Basic') {
    errors.push('Standard SKU required for availability zone deployment');
  }
  
  // Frontend validation
  if (config.type === 'public' && !config.frontend.publicIpName) {
    errors.push('Public IP name required for public load balancer');
  }
  
  if (config.type === 'internal') {
    if (!config.frontend.subnetId) {
      errors.push('Subnet ID required for internal load balancer');
    }
    if (config.enableHaPort && config.sku === 'Basic') {
      errors.push('HA Port feature requires Standard SKU');
    }
  }
  
  // Backend pools validation
  if (config.backendPools.length === 0) {
    errors.push('At least one backend pool is required');
  }
  
  config.backendPools.forEach((pool, index) => {
    if (!pool.name) {
      errors.push(`Backend pool ${index}: name is required`);
    }
    if (!pool.vmssResourceId && (!pool.vmResourceIds || pool.vmResourceIds.length === 0)) {
      errors.push(`Backend pool ${index}: either VMSS resource ID or VM resource IDs required`);
    }
  });
  
  // Health probes validation
  if (config.healthProbes.length === 0) {
    errors.push('At least one health probe is required');
  }
  
  config.healthProbes.forEach((probe, index) => {
    if (!probe.name) {
      errors.push(`Health probe ${index}: name is required`);
    }
    if (probe.port < 1 || probe.port > 65535) {
      errors.push(`Health probe ${index}: port must be between 1-65535`);
    }
    if ((probe.protocol === 'HTTP' || probe.protocol === 'HTTPS') && !probe.path) {
      errors.push(`Health probe ${index}: path required for HTTP/HTTPS protocol`);
    }
    if (probe.intervalInSeconds && (probe.intervalInSeconds < 5 || probe.intervalInSeconds > 2147483647)) {
      errors.push(`Health probe ${index}: interval must be >= 5 seconds`);
    }
    if (probe.numberOfProbes && (probe.numberOfProbes < 1 || probe.numberOfProbes > 2147483647)) {
      errors.push(`Health probe ${index}: number of probes must be >= 1`);
    }
  });
  
  // Load balancing rules validation
  if (config.loadBalancingRules.length === 0) {
    errors.push('At least one load balancing rule is required');
  }
  
  config.loadBalancingRules.forEach((rule, index) => {
    if (!rule.name) {
      errors.push(`Load balancing rule ${index}: name is required`);
    }
    
    // Validate frontend and backend ports
    if (rule.frontendPort < 1 || rule.frontendPort > 65535) {
      errors.push(`Load balancing rule ${index}: frontend port must be between 1-65535`);
    }
    if (rule.backendPort < 1 || rule.backendPort > 65535) {
      errors.push(`Load balancing rule ${index}: backend port must be between 1-65535`);
    }
    
    // Validate health probe reference
    const healthProbeExists = config.healthProbes.some(probe => probe.name === rule.healthProbeName);
    if (!healthProbeExists) {
      errors.push(`Load balancing rule ${index}: health probe '${rule.healthProbeName}' not found`);
    }
    
    // Validate backend pool reference
    const backendPoolExists = config.backendPools.some(pool => pool.name === rule.backendPoolName);
    if (!backendPoolExists) {
      errors.push(`Load balancing rule ${index}: backend pool '${rule.backendPoolName}' not found`);
    }
    
    // Validate idle timeout
    if (rule.idleTimeoutInMinutes && (rule.idleTimeoutInMinutes < 4 || rule.idleTimeoutInMinutes > 30)) {
      errors.push(`Load balancing rule ${index}: idle timeout must be between 4-30 minutes`);
    }
    
    // Standard LB only features
    if (rule.enableTcpReset && config.sku === 'Basic') {
      errors.push(`Load balancing rule ${index}: TCP reset requires Standard SKU`);
    }
  });
  
  // NAT rules validation
  if (config.natRules) {
    config.natRules.forEach((natRule, index) => {
      if (!natRule.name) {
        errors.push(`NAT rule ${index}: name is required`);
      }
      if (natRule.frontendPort < 1 || natRule.frontendPort > 65535) {
        errors.push(`NAT rule ${index}: frontend port must be between 1-65535`);
      }
      if (natRule.backendPort < 1 || natRule.backendPort > 65535) {
        errors.push(`NAT rule ${index}: backend port must be between 1-65535`);
      }
    });
  }
  
  return errors;
}

/**
 * Generates ARM template for load balancer resource
 */
export function generateLoadBalancerResource(config: LoadBalancerConfig): any {
  const resource: any = {
    type: 'Microsoft.Network/loadBalancers',
    apiVersion: '2023-04-01',
    name: `[parameters('${config.name}Name')]`,
    location: '[parameters(\'location\')]',
    sku: {
      name: config.sku,
      tier: config.sku === 'Standard' ? 'Regional' : 'Regional'
    },
    properties: {
      frontendIPConfigurations: [] as any[],
      backendAddressPools: [] as any[],
      probes: [] as any[],
      loadBalancingRules: [] as any[],
      inboundNatRules: [] as any[]
    },
    tags: config.tags || {},
    zones: config.availabilityZones || undefined
  };
  
  // Frontend IP configuration
  if (config.type === 'public') {
    resource.properties.frontendIPConfigurations.push({
      name: 'LoadBalancerFrontEnd',
      properties: {
        publicIPAddress: {
          id: `[resourceId('Microsoft.Network/publicIPAddresses', parameters('${config.frontend.publicIpName}Name'))]`
        }
      }
    });
  } else {
    const internalFrontend: any = {
      name: 'LoadBalancerFrontEnd',
      properties: {
        subnet: {
          id: `[parameters('${config.name}SubnetId')]`
        }
      }
    };
    
    if (config.frontend.privateIpAddress) {
      internalFrontend.properties.privateIPAddress = config.frontend.privateIpAddress;
      internalFrontend.properties.privateIPAllocationMethod = 'Static';
    } else {
      internalFrontend.properties.privateIPAllocationMethod = 'Dynamic';
    }
    
    resource.properties.frontendIPConfigurations.push(internalFrontend);
  }
  
  // Backend address pools
  config.backendPools.forEach(pool => {
    resource.properties.backendAddressPools.push({
      name: pool.name,
      properties: {}
    });
  });
  
  // Health probes
  config.healthProbes.forEach(probe => {
    const probeResource: any = {
      name: probe.name,
      properties: {
        protocol: probe.protocol,
        port: probe.port,
        intervalInSeconds: probe.intervalInSeconds || 15,
        numberOfProbes: probe.numberOfProbes || 2
      }
    };
    
    if (probe.protocol === 'HTTP' || probe.protocol === 'HTTPS') {
      probeResource.properties.requestPath = probe.path;
    }
    
    if (probe.timeoutInSeconds) {
      probeResource.properties.timeoutInSeconds = probe.timeoutInSeconds;
    }
    
    resource.properties.probes.push(probeResource);
  });
  
  // Load balancing rules
  config.loadBalancingRules.forEach(rule => {
    const ruleResource: any = {
      name: rule.name,
      properties: {
        frontendIPConfiguration: {
          id: `[resourceId('Microsoft.Network/loadBalancers/frontendIpConfigurations', parameters('${config.name}Name'), 'LoadBalancerFrontEnd')]`
        },
        backendAddressPool: {
          id: `[resourceId('Microsoft.Network/loadBalancers/backendAddressPools', parameters('${config.name}Name'), '${rule.backendPoolName}')]`
        },
        probe: {
          id: `[resourceId('Microsoft.Network/loadBalancers/probes', parameters('${config.name}Name'), '${rule.healthProbeName}')]`
        },
        protocol: rule.protocol,
        frontendPort: rule.frontendPort,
        backendPort: rule.backendPort,
        enableFloatingIP: rule.enableFloatingIP || false,
        idleTimeoutInMinutes: rule.idleTimeoutInMinutes || 4
      }
    };
    
    if (rule.enableTcpReset && config.sku === 'Standard') {
      ruleResource.properties.enableTcpReset = true;
    }
    
    resource.properties.loadBalancingRules.push(ruleResource);
  });
  
  // NAT rules
  if (config.natRules && config.natRules.length > 0) {
    config.natRules.forEach(natRule => {
      resource.properties.inboundNatRules.push({
        name: natRule.name,
        properties: {
          frontendIPConfiguration: {
            id: `[resourceId('Microsoft.Network/loadBalancers/frontendIpConfigurations', parameters('${config.name}Name'), 'LoadBalancerFrontEnd')]`
          },
          protocol: natRule.protocol,
          frontendPort: natRule.frontendPort,
          backendPort: natRule.backendPort
        }
      });
    });
  }
  
  return resource;
}

/**
 * Generates ARM parameters for load balancer
 */
export function generateLoadBalancerParameters(config: LoadBalancerConfig): any {
  const parameters: any = {
    [`${config.name}Name`]: {
      type: 'string',
      defaultValue: config.name,
      metadata: {
        description: `Name of the ${config.type} load balancer`
      }
    }
  };
  
  if (config.type === 'public' && config.frontend.publicIpName) {
    parameters[`${config.frontend.publicIpName}Name`] = {
      type: 'string',
      defaultValue: config.frontend.publicIpName,
      metadata: {
        description: 'Name of the public IP address for the load balancer'
      }
    };
  }
  
  if (config.type === 'internal') {
    parameters[`${config.name}SubnetId`] = {
      type: 'string',
      metadata: {
        description: 'Resource ID of the subnet for internal load balancer'
      }
    };
  }
  
  return parameters;
}

/**
 * Generates public IP resource for public load balancer
 */
export function generatePublicIpResource(config: LoadBalancerConfig): any | null {
  if (config.type !== 'public' || !config.frontend.publicIpName) {
    return null;
  }
  
  return {
    type: 'Microsoft.Network/publicIPAddresses',
    apiVersion: '2023-04-01',
    name: `[parameters('${config.frontend.publicIpName}Name')]`,
    location: '[parameters(\'location\')]',
    sku: {
      name: config.sku === 'Standard' ? 'Standard' : 'Basic',
      tier: 'Regional'
    },
    properties: {
      publicIPAllocationMethod: config.sku === 'Standard' ? 'Static' : 'Dynamic',
      dnsSettings: {
        domainNameLabel: `[concat(parameters('${config.frontend.publicIpName}Name'), '-', uniqueString(resourceGroup().id))]`
      }
    },
    tags: config.tags || {},
    zones: config.availabilityZones || undefined
  };
}

/**
 * CLI helper for load balancer configuration and planning
 */
export class LoadBalancerCLI {
  /**
   * Validate load balancer configuration
   */
  static validateConfiguration(config: LoadBalancerConfig): void {
    console.log(`\n🔍 Validating Load Balancer Configuration: ${config.name}`);
    console.log('='.repeat(60));
    
    const errors = validateLoadBalancerConfiguration(config);
    
    if (errors.length === 0) {
      console.log('✅ Load balancer configuration is valid');
      console.log(`📊 Type: ${config.type} | SKU: ${config.sku}`);
      console.log(`🔗 Backend Pools: ${config.backendPools.length}`);
      console.log(`❤️  Health Probes: ${config.healthProbes.length}`);
      console.log(`⚖️  Load Balancing Rules: ${config.loadBalancingRules.length}`);
      
      if (config.natRules && config.natRules.length > 0) {
        console.log(`🔌 NAT Rules: ${config.natRules.length}`);
      }
      
      if (config.availabilityZones && config.availabilityZones.length > 0) {
        console.log(`🌐 Availability Zones: ${config.availabilityZones.join(', ')}`);
      }
    } else {
      console.log('❌ Load balancer configuration has errors:');
      errors.forEach(error => console.log(`   • ${error}`));
    }
  }
  
  /**
   * Show load balancer best practices
   */
  static showBestPractices(): void {
    console.log('\n🏗️  Load Balancer Best Practices');
    console.log('='.repeat(50));
    
    console.log('\n📊 SKU Selection:');
    console.log('   • Use Standard SKU for production workloads');
    console.log('   • Standard SKU required for availability zones');
    console.log('   • Standard SKU supports outbound rules and HA Ports');
    console.log('   • Basic SKU for development/testing only');
    
    console.log('\n❤️  Health Probe Guidelines:');
    console.log('   • Use HTTP probes for web applications');
    console.log('   • Probe a lightweight health endpoint');
    console.log('   • Set appropriate timeout and retry values');
    console.log('   • Monitor probe failures and adjust as needed');
    
    console.log('\n⚖️  Load Balancing Rules:');
    console.log('   • Use session affinity only when necessary');
    console.log('   • Configure appropriate idle timeout');
    console.log('   • Enable floating IP for SQL Always On');
    console.log('   • Consider TCP reset for Standard LB');
    
    console.log('\n🔒 Security Considerations:');
    console.log('   • Use internal LB for backend tiers');
    console.log('   • Implement NSG rules for traffic filtering');
    console.log('   • Consider WAF for web application protection');
    console.log('   • Monitor and log LB metrics regularly');
  }
  
  /**
   * Generate sample load balancer configurations
   */
  static showExamples(): void {
    console.log('\n📚 Load Balancer Examples');
    console.log('='.repeat(40));
    
    console.log('\n🌐 Public Web Application LB:');
    console.log('   • Standard SKU with static public IP');
    console.log('   • HTTP health probe on /health endpoint');
    console.log('   • Load balancing rule: 80 -> 80 (HTTP)');
    console.log('   • Load balancing rule: 443 -> 443 (HTTPS)');
    console.log('   • Multiple availability zones');
    
    console.log('\n🔒 Internal Application LB:');
    console.log('   • Standard SKU with internal frontend');
    console.log('   • TCP health probe on application port');
    console.log('   • Custom backend pools for different tiers');
    console.log('   • NAT rules for admin access');
    
    console.log('\n⚡ High Performance LB:');
    console.log('   • Standard SKU with HA Ports enabled');
    console.log('   • Direct Server Return (floating IP)');
    console.log('   • TCP health probes for low latency');
    console.log('   • Proximity placement groups integration');
    
    console.log('\n💡 Use azmp vm ha plan-lb for interactive planning');
  }
}

export default LoadBalancerCLI;