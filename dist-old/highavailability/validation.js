"use strict";
// High Availability configuration validation and compatibility checks
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCompleteHAConfig = validateCompleteHAConfig;
exports.validateFeatureCompatibility = validateFeatureCompatibility;
const ppg_1 = require("./ppg");
/**
 * Validates complete HA configuration including regional capabilities
 */
function validateCompleteHAConfig(config, region) {
    const result = {
        isValid: true,
        errors: [],
        warnings: [],
        recommendations: []
    };
    // Check regional capabilities
    const regionCapability = (0, ppg_1.validateRegionCapability)(region);
    if (!regionCapability.supportsProximityPlacementGroups && config.proximityPlacementGroup?.enabled) {
        result.errors.push(`Region ${region} does not support proximity placement groups`);
        result.isValid = false;
    }
    // Validate availability zones
    const unsupportedZones = config.availabilityZones.filter(zone => !regionCapability.supportedAvailabilityZones.includes(zone));
    if (unsupportedZones.length > 0) {
        result.errors.push(`Unsupported availability zones for ${region}: ${unsupportedZones.join(', ')}`);
        result.isValid = false;
    }
    // Add warnings for suboptimal configurations
    if (config.vmss.instanceCount < config.availabilityZones.length) {
        result.warnings.push('Instance count is less than number of zones - uneven distribution');
    }
    if (config.loadBalancer.sku === 'Basic' && config.availabilityZones.length > 1) {
        result.errors.push('Standard Load Balancer required for multi-zone deployments');
        result.isValid = false;
    }
    // Add recommendations
    if (config.vmss.autoscale && !config.healthExtension?.enabled) {
        result.recommendations.push('Enable health extensions for better autoscale decisions');
    }
    return result;
}
/**
 * Validates compatibility with other features (cost optimization, security, etc.)
 */
function validateFeatureCompatibility(haConfig, otherConfig) {
    const issues = [];
    // Check auto-shutdown compatibility
    if (otherConfig.enableAutoShutdown && haConfig.enabled) {
        issues.push('Auto-shutdown should be disabled for HA workloads to prevent service disruption');
    }
    // Check ephemeral disk compatibility with zones
    if (otherConfig.useEphemeralOSDisk && haConfig.availabilityZones.length > 0) {
        // This is actually compatible, just note the requirement
        // Issues would be added here if there were actual conflicts
    }
    return issues;
}
