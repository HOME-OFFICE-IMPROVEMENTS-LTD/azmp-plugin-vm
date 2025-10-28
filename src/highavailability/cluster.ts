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
  
  /**
   * List available HA configuration examples
   */
  static listExamples(): void {
    console.log('\n🏗️  High Availability Examples');
    console.log('='.repeat(50));

    console.log('\n🔸 Basic 2-VM HA Cluster:');
    console.log('   • 2 VMs in different availability zones');
    console.log('   • Load balancer with health probe');
    console.log('   • Shared storage with backup');
    console.log('   • Basic monitoring and alerting');
    
    console.log('\n🔸 Enterprise 3-Tier HA:');
    console.log('   • Frontend: 3+ VMs across zones with load balancer');
    console.log('   • Application: VMSS with auto-scaling (2-10 instances)');
    console.log('   • Database: Primary + standby with Azure SQL HA');
    console.log('   • PPG for application tier performance');
    
    console.log('\n🔸 High-Performance Computing Cluster:');
    console.log('   • VMSS with proximity placement groups');
    console.log('   • InfiniBand networking');
    console.log('   • Shared file systems (HPC Cache/Lustre)');
    console.log('   • GPU-enabled compute nodes');
    
    console.log('\n🔸 Multi-Region DR Setup:');
    console.log('   • Primary region: Full HA cluster');
    console.log('   • Secondary region: Standby infrastructure');
    console.log('   • Azure Site Recovery for VM replication');
    console.log('   • Cross-region load balancing');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run azmp vm ha plan-ppg to start planning');
    console.log('   2. Use azmp vm template generate with HA parameters');
    console.log('   3. Validate configuration with azmp vm ha validate');
    console.log('   4. Deploy and test failover scenarios');
  }

  /**
   * Show HA best practices and recommendations
   */
  static showBestPractices(): void {
    console.log('\n📋 High Availability Best Practices');
    console.log('='.repeat(50));

    console.log('\n🎯 Design Principles:');
    console.log('   • Use availability zones for redundancy');
    console.log('   • Implement load balancing for traffic distribution');
    console.log('   • Design for graceful degradation');
    console.log('   • Plan for maintenance windows');
    
    console.log('\n🏗️  Infrastructure Guidelines:');
    console.log('   • Minimum 2 instances per tier');
    console.log('   • Use managed disks with ZRS or GRS');
    console.log('   • Implement network security groups');
    console.log('   • Enable boot diagnostics and monitoring');
    
    console.log('\n🔧 Configuration Recommendations:');
    console.log('   • Set up automated backups');
    console.log('   • Configure health probes and alerts');
    console.log('   • Use proximity placement groups for performance');
    console.log('   • Implement proper logging and monitoring');
    
    console.log('\n🚨 Common Pitfalls:');
    console.log('   • Single points of failure');
    console.log('   • Insufficient monitoring');
    console.log('   • Inadequate backup strategies');
    console.log('   • Improper resource sizing');
  }
}
