// High Availability cluster orchestration and configuration
// Coordinates PPG, VMSS, and Load Balancer for complete HA solution

import { ProximityPlacementGroupConfig } from './ppg';

/**
 * Complete high availability cluster configuration
 */
export interface HighAvailabilityConfig {
  enabled: boolean;
  proximityPlacementGroup?: ProximityPlacementGroupConfig;
  availabilityZones: string[];
  loadBalancer: {
    type: 'public' | 'internal';
    sku: 'Basic' | 'Standard';
    healthProbe: {
      protocol: 'HTTP' | 'TCP';
      port: number;
      path?: string;
      intervalInSeconds?: number;
      numberOfProbes?: number;
    };
  };
  vmss: {
    instanceCount: number;
    maxInstanceCount: number;
    autoscale: boolean;
    upgradePolicy?: 'Automatic' | 'Manual' | 'Rolling';
  };
  healthExtension?: {
    enabled: boolean;
    port: number;
    endpoint: string;
  };
}

/**
 * Validates HA configuration for conflicts and requirements
 */
export function validateHAConfiguration(config: HighAvailabilityConfig): string[] {
  const errors: string[] = [];
  
  // Validate zone requirements
  if (config.availabilityZones.length === 0) {
    errors.push('At least one availability zone must be specified for HA');
  }
  
  // Validate load balancer requirements
  if (config.availabilityZones.length > 1 && config.loadBalancer.sku === 'Basic') {
    errors.push('Standard Load Balancer SKU required for multi-zone deployments');
  }
  
  // Validate VMSS instance count
  if (config.vmss.instanceCount < 2) {
    errors.push('Minimum 2 instances required for high availability');
  }
  
  if (config.vmss.maxInstanceCount < config.vmss.instanceCount) {
    errors.push('Maximum instance count must be >= initial instance count');
  }
  
  // Validate health probe configuration
  if (config.loadBalancer.healthProbe.protocol === 'HTTP' && !config.loadBalancer.healthProbe.path) {
    errors.push('HTTP health probe requires a path parameter');
  }
  
  return errors;
}

/**
 * Determines if cost optimization should be disabled for HA scenario
 */
export function shouldDisableCostOptimization(haConfig: HighAvailabilityConfig): boolean {
  // Auto-shutdown conflicts with load balancer health probes
  return haConfig.enabled && haConfig.loadBalancer.healthProbe.protocol !== undefined;
}

/**
 * CLI helper for HA configuration validation
 */
export class HighAvailabilityCLI {
  
  static validateConfig(config: HighAvailabilityConfig): void {
    console.log('Validating high availability configuration...');
    
    const errors = validateHAConfiguration(config);
    
    if (errors.length === 0) {
      console.log('✅ HA configuration is valid');
      
      if (shouldDisableCostOptimization(config)) {
        console.log('⚠️  Cost optimization (auto-shutdown) will be disabled for HA workloads');
      }
    } else {
      console.log('❌ HA configuration has errors:');
      errors.forEach(error => console.log(`   • ${error}`));
    }
  }
  
  static listExamples(): void {
    console.log('Available HA examples:');
    console.log('  • ha-basic.json      - Public LB + 3 zones');
    console.log('  • ha-private.json    - Internal LB + PPG');
    console.log('  • ha-full-stack.json - HA + cost optimization');
  }
}