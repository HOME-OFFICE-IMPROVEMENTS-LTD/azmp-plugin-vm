// Proximity Placement Group helpers for Azure VM clusters
// Provides PPG creation, validation, and regional capability checks

import { PluginContext } from '../types';

/**
 * Proximity Placement Group configuration options
 */
export interface ProximityPlacementGroupConfig {
  enabled: boolean;
  name?: string;
  resourceGroupName?: string;
  location: string;
  intent?: {
    vmSizes: string[];
    vmssInstanceCount?: number;
  };
}

/**
 * Azure region capability for PPG and availability zones
 */
export interface RegionCapability {
  region: string;
  supportsProximityPlacementGroups: boolean;
  supportedAvailabilityZones: string[];
  recommendedVmSizes: string[];
  limitations?: string[];
}

/**
 * Validates if a region supports proximity placement groups and availability zones
 */
export function validateRegionCapability(region: string): RegionCapability {
  // TODO: Implement region validation logic
  // This will be expanded in WP1 implementation
  
  return {
    region,
    supportsProximityPlacementGroups: true, // Placeholder
    supportedAvailabilityZones: ['1', '2', '3'],
    recommendedVmSizes: ['Standard_D2s_v3', 'Standard_D4s_v3'],
    limitations: []
  };
}

/**
 * Generates ARM template resource for proximity placement group
 */
export function generateProximityPlacementGroupResource(config: ProximityPlacementGroupConfig): object {
  if (!config.enabled) {
    return {};
  }

  return {
    type: 'Microsoft.Compute/proximityPlacementGroups',
    apiVersion: '2023-03-01',
    name: config.name || '[concat(parameters("vmName"), "-ppg")]',
    location: config.location,
    properties: {
      proximityPlacementGroupType: 'Standard',
      intent: config.intent
    }
  };
}

/**
 * CLI helper for region validation
 */
export class ProximityPlacementGroupCLI {
  
  static async checkRegion(region: string): Promise<void> {
    console.log(`Checking region capability: ${region}`);
    
    const capability = validateRegionCapability(region);
    
    if (capability.supportsProximityPlacementGroups) {
      console.log(`✅ ${region} supports proximity placement groups`);
      console.log(`✅ Available zones: ${capability.supportedAvailabilityZones.join(', ')}`);
      console.log(`✅ Recommended VM sizes: ${capability.recommendedVmSizes.join(', ')}`);
    } else {
      console.log(`❌ ${region} does not support proximity placement groups`);
      if (capability.limitations) {
        capability.limitations.forEach(limitation => {
          console.log(`⚠️  ${limitation}`);
        });
      }
    }
  }
}