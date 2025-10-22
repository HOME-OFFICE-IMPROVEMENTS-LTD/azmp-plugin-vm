/**
 * Availability Module
 * 
 * Azure Virtual Machine Availability and High Availability configurations.
 * Includes Availability Sets, Availability Zones, and Virtual Machine Scale Sets.
 * 
 * @module availability
 */

import Handlebars from 'handlebars';

// Import all availability modules
import {
  availabilitySet,
  availabilitySetRef,
  recommendedFaultDomains,
  recommendedUpdateDomains,
  availabilitySetSLA,
  validateAvailabilitySet,
  availabilitySetBestPractices,
  proximityPlacementGroup,
  type AvailabilitySetConfig
} from './availabilitysets';

import {
  getAvailableZones,
  supportsAvailabilityZones,
  zonalVM,
  zoneRedundantDisk,
  zoneRedundantIP,
  availabilityZoneSLA,
  recommendZoneDistribution,
  validateZoneConfig,
  availabilityZonesBestPractices,
  getZoneSupportedRegions,
  type ZoneNumber,
  type ZoneArray,
  type ZoneConfig,
  type ZonalVMConfig
} from './availabilityzones';

import {
  vmssFlexible,
  vmssUniform,
  vmssAutoscale,
  cpuAutoscaleRules,
  vmssHealthExtension,
  rollingUpgradePolicy,
  vmssSLA,
  validateVMSSConfig,
  vmssBestPractices,
  type VMSSConfig,
  type OrchestrationMode,
  type UpgradeMode,
  type AutoscaleProfile,
  type AutoscaleRule,
  type HealthProbeConfig
} from './vmss';

/**
 * Register all availability helpers with Handlebars
 */
export function registerAvailabilityHelpers() {
  // Availability Sets
  Handlebars.registerHelper('availability:set', function(options: any) {
    const config: AvailabilitySetConfig = {
      name: options.hash.name,
      platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
      platformUpdateDomainCount: options.hash.updateDomains ?? options.hash.platformUpdateDomainCount,
      proximityPlacementGroupId: options.hash.proximityPlacementGroupId,
      sku: options.hash.sku || 'Aligned',
      tags: options.hash.tags
    };
    return JSON.stringify(availabilitySet(config), null, 2);
  });

  Handlebars.registerHelper('availability:setRef', function(name: string) {
    return JSON.stringify(availabilitySetRef(name));
  });

  Handlebars.registerHelper('availability:recommendedFaultDomains', function(vmCount: number) {
    return recommendedFaultDomains(vmCount);
  });

  Handlebars.registerHelper('availability:recommendedUpdateDomains', function(vmCount: number) {
    return recommendedUpdateDomains(vmCount);
  });

  Handlebars.registerHelper('availability:setSLA', function(vmCount: number) {
    return availabilitySetSLA(vmCount);
  });

  Handlebars.registerHelper('availability:proximityPlacementGroup', function(name: string, location?: string) {
    return JSON.stringify(proximityPlacementGroup(name, location), null, 2);
  });

  // Availability Zones
  Handlebars.registerHelper('availability:zones', function(location: string) {
    return JSON.stringify(getAvailableZones(location));
  });

  Handlebars.registerHelper('availability:supportsZones', function(location: string) {
    return supportsAvailabilityZones(location);
  });

  Handlebars.registerHelper('availability:zonalVM', function(options: any) {
    const config: ZonalVMConfig = {
      name: options.hash.name,
      location: options.hash.location,
      zone: options.hash.zone,
      vmSize: options.hash.vmSize
    };
    return JSON.stringify(zonalVM(config), null, 2);
  });

  Handlebars.registerHelper('availability:zoneRedundantDisk', function(diskName: string, zones?: string[]) {
    const zoneArray = zones as ZoneArray | undefined;
    return JSON.stringify(zoneRedundantDisk(diskName, zoneArray), null, 2);
  });

  Handlebars.registerHelper('availability:zoneRedundantIP', function(ipName: string, zones?: string[]) {
    const zoneArray = zones as ZoneArray | undefined;
    return JSON.stringify(zoneRedundantIP(ipName, zoneArray), null, 2);
  });

  Handlebars.registerHelper('availability:zoneSLA', function(vmCount: number, zoneCount: number) {
    return availabilityZoneSLA(vmCount, zoneCount);
  });

  Handlebars.registerHelper('availability:recommendZoneDistribution', function(vmCount: number) {
    return JSON.stringify(recommendZoneDistribution(vmCount));
  });

  Handlebars.registerHelper('availability:zoneSupportedRegions', function() {
    return JSON.stringify(getZoneSupportedRegions());
  });

  // VMSS (Virtual Machine Scale Sets)
  Handlebars.registerHelper('availability:vmssFlexible', function(options: any) {
    const config: VMSSConfig = {
      name: options.hash.name,
      location: options.hash.location,
      orchestrationMode: 'Flexible',
      platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
      zones: options.hash.zones,
      vmSize: options.hash.vmSize,
      instanceCount: options.hash.instanceCount ?? options.hash.instances,
      singlePlacementGroup: options.hash.singlePlacementGroup,
      tags: options.hash.tags
    };
    return JSON.stringify(vmssFlexible(config), null, 2);
  });

  Handlebars.registerHelper('availability:vmssUniform', function(options: any) {
    const config: VMSSConfig = {
      name: options.hash.name,
      location: options.hash.location,
      orchestrationMode: 'Uniform',
      platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
      zones: options.hash.zones,
      vmSize: options.hash.vmSize,
      instanceCount: options.hash.instanceCount ?? options.hash.instances,
      upgradeMode: options.hash.upgradeMode,
      overprovision: options.hash.overprovision,
      singlePlacementGroup: options.hash.singlePlacementGroup,
      tags: options.hash.tags
    };
    return JSON.stringify(vmssUniform(config), null, 2);
  });

  Handlebars.registerHelper('availability:vmssAutoscale', function(vmssName: string, options: any) {
    const profile: AutoscaleProfile = {
      name: options.hash.profileName || 'defaultProfile',
      capacity: {
        minimum: options.hash.minInstances ?? 2,
        maximum: options.hash.maxInstances ?? 10,
        default: options.hash.defaultInstances ?? 3
      },
      rules: options.hash.rules || []
    };
    return JSON.stringify(vmssAutoscale(vmssName, profile), null, 2);
  });

  Handlebars.registerHelper('availability:cpuAutoscaleRules', function(vmssResourceId: string, options: any) {
    const scaleOutThreshold = options.hash.scaleOutThreshold ?? 75;
    const scaleInThreshold = options.hash.scaleInThreshold ?? 25;
    return JSON.stringify(cpuAutoscaleRules(vmssResourceId, scaleOutThreshold, scaleInThreshold), null, 2);
  });

  Handlebars.registerHelper('availability:vmssHealthExtension', function(options: any) {
    const config: HealthProbeConfig = {
      protocol: options.hash.protocol || 'Http',
      port: options.hash.port || 80,
      requestPath: options.hash.requestPath,
      intervalInSeconds: options.hash.intervalInSeconds,
      numberOfProbes: options.hash.numberOfProbes
    };
    return JSON.stringify(vmssHealthExtension(config), null, 2);
  });

  Handlebars.registerHelper('availability:rollingUpgradePolicy', function(options: any) {
    const maxBatchPercent = options.hash.maxBatchPercent ?? 20;
    const maxUnhealthyPercent = options.hash.maxUnhealthyPercent ?? 20;
    const pauseTime = options.hash.pauseTime ?? 'PT0S';
    return JSON.stringify(rollingUpgradePolicy(maxBatchPercent, maxUnhealthyPercent, pauseTime), null, 2);
  });

  Handlebars.registerHelper('availability:vmssSLA', function(zoneCount: number, instanceCount: number) {
    return vmssSLA(zoneCount, instanceCount);
  });

  // Best Practices
  Handlebars.registerHelper('availability:bestPractices', function(type: string) {
    switch (type) {
      case 'sets':
      case 'availabilitysets':
        return new Handlebars.SafeString(availabilitySetBestPractices());
      case 'zones':
      case 'availabilityzones':
        return new Handlebars.SafeString(availabilityZonesBestPractices());
      case 'vmss':
      case 'scaleset':
      case 'scalesets':
        return new Handlebars.SafeString(vmssBestPractices());
      default:
        return new Handlebars.SafeString(`
# Azure VM Availability Options

## Availability Sets
${availabilitySetBestPractices()}

## Availability Zones
${availabilityZonesBestPractices()}

## Virtual Machine Scale Sets
${vmssBestPractices()}
        `.trim());
    }
  });
}

/**
 * Export all availability functions
 */
export {
  // Availability Sets
  availabilitySet,
  availabilitySetRef,
  recommendedFaultDomains,
  recommendedUpdateDomains,
  availabilitySetSLA,
  validateAvailabilitySet,
  availabilitySetBestPractices,
  proximityPlacementGroup,
  
  // Availability Zones
  getAvailableZones,
  supportsAvailabilityZones,
  zonalVM,
  zoneRedundantDisk,
  zoneRedundantIP,
  availabilityZoneSLA,
  recommendZoneDistribution,
  validateZoneConfig,
  availabilityZonesBestPractices,
  getZoneSupportedRegions,
  
  // VMSS
  vmssFlexible,
  vmssUniform,
  vmssAutoscale,
  cpuAutoscaleRules,
  vmssHealthExtension,
  rollingUpgradePolicy,
  vmssSLA,
  validateVMSSConfig,
  vmssBestPractices,
  
  // Types
  type AvailabilitySetConfig,
  type ZoneNumber,
  type ZoneArray,
  type ZoneConfig,
  type ZonalVMConfig,
  type VMSSConfig,
  type OrchestrationMode,
  type UpgradeMode,
  type AutoscaleProfile,
  type AutoscaleRule,
  type HealthProbeConfig
};
