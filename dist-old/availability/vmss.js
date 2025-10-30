"use strict";
/**
 * Virtual Machine Scale Sets Module
 *
 * Provides helpers for Azure VMSS (Virtual Machine Scale Sets) configuration.
 * VMSS enables auto-scaling, load balancing, and high availability.
 *
 * @module availability/vmss
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vmss = void 0;
exports.vmssFlexible = vmssFlexible;
exports.vmssUniform = vmssUniform;
exports.vmssAutoscale = vmssAutoscale;
exports.cpuAutoscaleRules = cpuAutoscaleRules;
exports.vmssHealthExtension = vmssHealthExtension;
exports.rollingUpgradePolicy = rollingUpgradePolicy;
exports.vmssSLA = vmssSLA;
exports.validateVMSSConfig = validateVMSSConfig;
exports.vmssBestPractices = vmssBestPractices;
/**
 * Generate VMSS with Flexible orchestration (modern, recommended)
 *
 * @param config - VMSS configuration
 * @returns VMSS Flexible template
 *
 * @example
 * ```handlebars
 * {{availability:vmssFlexible name="myVMSS" zones='["1","2","3"]' vmSize="Standard_D2s_v3"}}
 * ```
 */
function vmssFlexible(config) {
    // Validate fault domain count for Flexible (1-5)
    const faultDomainCount = config.platformFaultDomainCount ?? 1;
    if (faultDomainCount < 1 || faultDomainCount > 5) {
        throw new Error("Flexible VMSS fault domain count must be between 1 and 5");
    }
    const template = {
        type: "Microsoft.Compute/virtualMachineScaleSets",
        apiVersion: "2023-09-01",
        name: config.name,
        location: config.location || "[resourceGroup().location]",
        sku: {
            name: config.vmSize,
            tier: "Standard",
            capacity: config.instanceCount ?? 3,
        },
        properties: {
            orchestrationMode: "Flexible",
            platformFaultDomainCount: faultDomainCount,
        },
    };
    // Add zones if specified
    if (config.zones && config.zones.length > 0) {
        template.zones = config.zones;
    }
    // Add single placement group setting
    if (config.singlePlacementGroup !== undefined) {
        template.properties.singlePlacementGroup = config.singlePlacementGroup;
    }
    // Add tags
    if (config.tags) {
        template.tags = config.tags;
    }
    return template;
}
/**
 * Generate VMSS with Uniform orchestration (legacy, still widely used)
 *
 * @param config - VMSS configuration
 * @returns VMSS Uniform template
 *
 * @example
 * ```handlebars
 * {{availability:vmssUniform name="myVMSS" vmSize="Standard_D2s_v3" instanceCount=5}}
 * ```
 */
function vmssUniform(config) {
    // Validate fault domain count for Uniform (1-3)
    const faultDomainCount = config.platformFaultDomainCount ?? 2;
    if (faultDomainCount < 1 || faultDomainCount > 3) {
        throw new Error("Uniform VMSS fault domain count must be between 1 and 3");
    }
    const template = {
        type: "Microsoft.Compute/virtualMachineScaleSets",
        apiVersion: "2023-09-01",
        name: config.name,
        location: config.location || "[resourceGroup().location]",
        sku: {
            name: config.vmSize,
            tier: "Standard",
            capacity: config.instanceCount ?? 2,
        },
        properties: {
            orchestrationMode: "Uniform",
            overprovision: config.overprovision ?? true,
            upgradePolicy: {
                mode: config.upgradeMode || "Manual",
            },
            platformFaultDomainCount: faultDomainCount,
            singlePlacementGroup: config.singlePlacementGroup ?? true,
            virtualMachineProfile: {
                storageProfile: {},
                osProfile: {},
                networkProfile: {},
            },
        },
    };
    // Add zones if specified
    if (config.zones && config.zones.length > 0) {
        template.zones = config.zones;
    }
    // Add tags
    if (config.tags) {
        template.tags = config.tags;
    }
    return template;
}
/**
 * Generate auto-scaling settings for VMSS
 *
 * @param vmssName - Name of the VMSS
 * @param profile - Auto-scaling profile
 * @returns Auto-scale settings template
 *
 * @example
 * ```handlebars
 * {{availability:vmssAutoscale vmssName="myVMSS" minInstances=2 maxInstances=10}}
 * ```
 */
function vmssAutoscale(vmssName, profile) {
    return {
        type: "Microsoft.Insights/autoscalesettings",
        apiVersion: "2022-10-01",
        name: `${vmssName}-autoscale`,
        location: "[resourceGroup().location]",
        properties: {
            enabled: true,
            targetResourceUri: `[resourceId('Microsoft.Compute/virtualMachineScaleSets', '${vmssName}')]`,
            profiles: [profile],
        },
    };
}
/**
 * Create CPU-based auto-scaling rule
 *
 * @param vmssResourceId - Resource ID of VMSS
 * @param scaleOutThreshold - CPU % to scale out (default: 75)
 * @param scaleInThreshold - CPU % to scale in (default: 25)
 * @returns Auto-scale profile with CPU rules
 */
function cpuAutoscaleRules(vmssResourceId, scaleOutThreshold = 75, scaleInThreshold = 25) {
    return [
        // Scale out rule
        {
            metricTrigger: {
                metricName: "Percentage CPU",
                metricResourceId: vmssResourceId,
                timeGrain: "PT1M",
                statistic: "Average",
                timeWindow: "PT5M",
                timeAggregation: "Average",
                operator: "GreaterThan",
                threshold: scaleOutThreshold,
            },
            scaleAction: {
                direction: "Increase",
                type: "ChangeCount",
                value: "1",
                cooldown: "PT5M",
            },
        },
        // Scale in rule
        {
            metricTrigger: {
                metricName: "Percentage CPU",
                metricResourceId: vmssResourceId,
                timeGrain: "PT1M",
                statistic: "Average",
                timeWindow: "PT5M",
                timeAggregation: "Average",
                operator: "LessThan",
                threshold: scaleInThreshold,
            },
            scaleAction: {
                direction: "Decrease",
                type: "ChangeCount",
                value: "1",
                cooldown: "PT5M",
            },
        },
    ];
}
/**
 * Generate application health extension for VMSS
 *
 * @param config - Health probe configuration
 * @returns Application health extension
 */
function vmssHealthExtension(config) {
    const settings = {
        protocol: config.protocol,
        port: config.port,
        intervalInSeconds: config.intervalInSeconds ?? 30,
        numberOfProbes: config.numberOfProbes ?? 2,
    };
    if (config.protocol !== "Tcp" && config.requestPath) {
        settings.requestPath = config.requestPath;
    }
    return {
        name: "HealthExtension",
        properties: {
            publisher: "Microsoft.ManagedServices",
            type: "ApplicationHealthLinux", // or ApplicationHealthWindows
            typeHandlerVersion: "1.0",
            autoUpgradeMinorVersion: true,
            settings,
        },
    };
}
/**
 * Generate rolling upgrade policy
 *
 * @param maxBatchPercent - Max % of VMs to upgrade at once (default: 20)
 * @param maxUnhealthyPercent - Max % unhealthy before stopping (default: 20)
 * @param pauseTime - Pause between batches (default: PT0S)
 * @returns Rolling upgrade policy
 */
function rollingUpgradePolicy(maxBatchPercent = 20, maxUnhealthyPercent = 20, pauseTime = "PT0S") {
    return {
        maxBatchInstancePercent: maxBatchPercent,
        maxUnhealthyInstancePercent: maxUnhealthyPercent,
        maxUnhealthyUpgradedInstancePercent: maxUnhealthyPercent,
        pauseTimeBetweenBatches: pauseTime,
        prioritizeUnhealthyInstances: true,
    };
}
/**
 * Calculate expected uptime for VMSS
 *
 * @param zoneCount - Number of zones (0 for regional, 1-3 for zonal)
 * @param instanceCount - Number of instances
 * @returns SLA percentage
 */
function vmssSLA(zoneCount, instanceCount) {
    if (instanceCount < 2)
        return 99.9;
    if (zoneCount >= 2)
        return 99.99; // Multi-zone
    return 99.95; // Regional (fault domains)
}
/**
 * Validate VMSS configuration
 *
 * @param config - VMSS configuration
 * @returns Validation result
 */
function validateVMSSConfig(config) {
    const errors = [];
    const warnings = [];
    // Validate name
    if (!config.name || config.name.length === 0) {
        errors.push("VMSS name is required");
    }
    // Validate VM size
    if (!config.vmSize || config.vmSize.length === 0) {
        errors.push("VM size is required");
    }
    // Validate fault domain count based on orchestration mode
    if (config.orchestrationMode === "Flexible") {
        if (config.platformFaultDomainCount &&
            (config.platformFaultDomainCount < 1 ||
                config.platformFaultDomainCount > 5)) {
            errors.push("Flexible VMSS fault domain count must be between 1 and 5");
        }
    }
    else if (config.orchestrationMode === "Uniform") {
        if (config.platformFaultDomainCount &&
            (config.platformFaultDomainCount < 1 ||
                config.platformFaultDomainCount > 3)) {
            errors.push("Uniform VMSS fault domain count must be between 1 and 3");
        }
    }
    // Validate instance count
    if (config.instanceCount && config.instanceCount < 0) {
        errors.push("Instance count must be non-negative");
    }
    if (config.instanceCount === 1) {
        warnings.push("Single instance VMSS provides no high availability benefits");
    }
    // Warning for zones
    if (!config.zones || config.zones.length === 0) {
        warnings.push("Consider using availability zones for 99.99% SLA");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * VMSS best practices documentation
 *
 * @returns Best practices as markdown string
 */
function vmssBestPractices() {
    return `
# VMSS (Virtual Machine Scale Sets) Best Practices

## Orchestration Modes

### Flexible (Modern, Recommended)
- ✅ Mix VM sizes within same scale set
- ✅ Better control over VM lifecycle
- ✅ Support for 1-5 fault domains
- ✅ Easier integration with existing VMs
- ⚠️ No automatic instance repairs yet

### Uniform (Legacy, Still Widely Used)
- ✅ Simpler configuration
- ✅ Automatic instance repairs
- ✅ Built-in autoscaling
- ⚠️ All VMs must be identical
- ⚠️ Limited to 1-3 fault domains

## Configuration Guidelines

### Capacity Planning
- **Minimum**: Set to expected baseline load
- **Default**: Set to typical load
- **Maximum**: Set to peak load capacity
- **Overprovision**: Enable for faster scale-out (Uniform only)

### Zones
- Deploy across 2-3 zones for 99.99% SLA
- Single zone: 99.9% SLA (not recommended)
- Regional (no zones): 99.95% SLA

### Auto-Scaling
- CPU-based: 75% scale out, 25% scale in
- Custom metrics: Application-specific
- Cooldown: 5+ minutes to prevent flapping
- Schedule-based: For predictable workloads

### Health Monitoring
- Enable application health extension
- HTTP probes for web workloads
- TCP probes for non-HTTP services
- 30-second intervals recommended

### Upgrade Policy
- **Automatic**: Best for stateless apps
- **Rolling**: Controlled upgrades with health checks
- **Manual**: Full control, requires manual intervention

## SLA Comparison
- Regional VMSS (2+ VMs): 99.95%
- Multi-zone VMSS (2+ VMs): 99.99% ⭐

## Cost Optimization
- Use burstable VMs (B-series) for dev/test
- Enable autoscaling to match demand
- Use Spot VMs for fault-tolerant workloads
- Right-size based on actual usage
  `.trim();
}
/**
 * Export all VMSS functions
 */
exports.vmss = {
    vmssFlexible,
    vmssUniform,
    vmssAutoscale,
    cpuAutoscaleRules,
    vmssHealthExtension,
    rollingUpgradePolicy,
    vmssSLA,
    validateVMSSConfig,
    vmssBestPractices,
};
