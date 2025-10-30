/**
 * Availability Module
 *
 * Azure Virtual Machine Availability and High Availability configurations.
 * Includes Availability Sets, Availability Zones, and Virtual Machine Scale Sets.
 *
 * @module availability
 */
import { availabilitySet, availabilitySetRef, recommendedFaultDomains, recommendedUpdateDomains, availabilitySetSLA, validateAvailabilitySet, availabilitySetBestPractices, proximityPlacementGroup, type AvailabilitySetConfig } from "./availabilitysets";
import { getAvailableZones, supportsAvailabilityZones, zonalVM, zoneRedundantDisk, zoneRedundantIP, availabilityZoneSLA, recommendZoneDistribution, validateZoneConfig, availabilityZonesBestPractices, getZoneSupportedRegions, type ZoneNumber, type ZoneArray, type ZoneConfig, type ZonalVMConfig } from "./availabilityzones";
import { vmssFlexible, vmssUniform, vmssAutoscale, cpuAutoscaleRules, vmssHealthExtension, rollingUpgradePolicy, vmssSLA, validateVMSSConfig, vmssBestPractices, type VMSSConfig, type OrchestrationMode, type UpgradeMode, type AutoscaleProfile, type AutoscaleRule, type HealthProbeConfig } from "./vmss";
/**
 * Register all availability helpers with Handlebars
 */
export declare function registerAvailabilityHelpers(): void;
/**
 * Export all availability functions
 */
export { availabilitySet, availabilitySetRef, recommendedFaultDomains, recommendedUpdateDomains, availabilitySetSLA, validateAvailabilitySet, availabilitySetBestPractices, proximityPlacementGroup, getAvailableZones, supportsAvailabilityZones, zonalVM, zoneRedundantDisk, zoneRedundantIP, availabilityZoneSLA, recommendZoneDistribution, validateZoneConfig, availabilityZonesBestPractices, getZoneSupportedRegions, vmssFlexible, vmssUniform, vmssAutoscale, cpuAutoscaleRules, vmssHealthExtension, rollingUpgradePolicy, vmssSLA, validateVMSSConfig, vmssBestPractices, type AvailabilitySetConfig, type ZoneNumber, type ZoneArray, type ZoneConfig, type ZonalVMConfig, type VMSSConfig, type OrchestrationMode, type UpgradeMode, type AutoscaleProfile, type AutoscaleRule, type HealthProbeConfig, };
