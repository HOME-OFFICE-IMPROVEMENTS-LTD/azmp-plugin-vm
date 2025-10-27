/**
 * Virtual Machine Scale Sets Module
 *
 * Provides helpers for Azure VMSS (Virtual Machine Scale Sets) configuration.
 * VMSS enables auto-scaling, load balancing, and high availability.
 *
 * @module availability/vmss
 */

/**
 * VMSS Orchestration Mode
 */
export type OrchestrationMode = "Flexible" | "Uniform";

/**
 * VMSS Upgrade Mode
 */
export type UpgradeMode = "Automatic" | "Manual" | "Rolling";

/**
 * VMSS Configuration
 */
export interface VMSSConfig {
  name: string;
  location?: string;
  orchestrationMode: OrchestrationMode;
  platformFaultDomainCount?: number; // 1-5 for Flexible, 1-3 for Uniform
  zones?: string[];
  vmSize: string;
  instanceCount?: number;
  upgradeMode?: UpgradeMode;
  overprovision?: boolean;
  singlePlacementGroup?: boolean;
  tags?: Record<string, string>;
}

/**
 * VMSS Flexible Orchestration Template
 */
export interface VMSSFlexibleTemplate {
  type: "Microsoft.Compute/virtualMachineScaleSets";
  apiVersion: string;
  name: string;
  location: string;
  zones?: string[];
  sku: {
    name: string;
    tier: string;
    capacity: number;
  };
  properties: {
    orchestrationMode: "Flexible";
    platformFaultDomainCount: number;
    singlePlacementGroup?: boolean;
  };
  tags?: Record<string, string>;
}

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
export function vmssFlexible(config: VMSSConfig): VMSSFlexibleTemplate {
  // Validate fault domain count for Flexible (1-5)
  const faultDomainCount = config.platformFaultDomainCount ?? 1;
  if (faultDomainCount < 1 || faultDomainCount > 5) {
    throw new Error("Flexible VMSS fault domain count must be between 1 and 5");
  }

  const template: VMSSFlexibleTemplate = {
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
export function vmssUniform(config: VMSSConfig): any {
  // Validate fault domain count for Uniform (1-3)
  const faultDomainCount = config.platformFaultDomainCount ?? 2;
  if (faultDomainCount < 1 || faultDomainCount > 3) {
    throw new Error("Uniform VMSS fault domain count must be between 1 and 3");
  }

  const template: any = {
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
 * Auto-scaling Profile Configuration
 */
export interface AutoscaleProfile {
  name: string;
  capacity: {
    minimum: number;
    maximum: number;
    default: number;
  };
  rules: AutoscaleRule[];
}

/**
 * Auto-scaling Rule
 */
export interface AutoscaleRule {
  metricTrigger: {
    metricName: string;
    metricResourceId: string;
    timeGrain: string;
    statistic: "Average" | "Min" | "Max" | "Sum";
    timeWindow: string;
    timeAggregation: "Average" | "Minimum" | "Maximum" | "Total" | "Count";
    operator:
      | "GreaterThan"
      | "LessThan"
      | "GreaterThanOrEqual"
      | "LessThanOrEqual"
      | "Equals"
      | "NotEquals";
    threshold: number;
  };
  scaleAction: {
    direction: "Increase" | "Decrease";
    type: "ChangeCount" | "PercentChangeCount" | "ExactCount";
    value: string;
    cooldown: string;
  };
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
export function vmssAutoscale(
  vmssName: string,
  profile: AutoscaleProfile,
): any {
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
export function cpuAutoscaleRules(
  vmssResourceId: string,
  scaleOutThreshold: number = 75,
  scaleInThreshold: number = 25,
): AutoscaleRule[] {
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
 * Health probe configuration for VMSS
 */
export interface HealthProbeConfig {
  protocol: "Http" | "Https" | "Tcp";
  port: number;
  requestPath?: string; // For HTTP/HTTPS
  intervalInSeconds?: number;
  numberOfProbes?: number;
}

/**
 * Generate application health extension for VMSS
 *
 * @param config - Health probe configuration
 * @returns Application health extension
 */
export function vmssHealthExtension(config: HealthProbeConfig): any {
  const settings: any = {
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
export function rollingUpgradePolicy(
  maxBatchPercent: number = 20,
  maxUnhealthyPercent: number = 20,
  pauseTime: string = "PT0S",
): any {
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
export function vmssSLA(zoneCount: number, instanceCount: number): number {
  if (instanceCount < 2) return 99.9;
  if (zoneCount >= 2) return 99.99; // Multi-zone
  return 99.95; // Regional (fault domains)
}

/**
 * Validate VMSS configuration
 *
 * @param config - VMSS configuration
 * @returns Validation result
 */
export function validateVMSSConfig(config: VMSSConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

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
    if (
      config.platformFaultDomainCount &&
      (config.platformFaultDomainCount < 1 ||
        config.platformFaultDomainCount > 5)
    ) {
      errors.push("Flexible VMSS fault domain count must be between 1 and 5");
    }
  } else if (config.orchestrationMode === "Uniform") {
    if (
      config.platformFaultDomainCount &&
      (config.platformFaultDomainCount < 1 ||
        config.platformFaultDomainCount > 3)
    ) {
      errors.push("Uniform VMSS fault domain count must be between 1 and 3");
    }
  }

  // Validate instance count
  if (config.instanceCount && config.instanceCount < 0) {
    errors.push("Instance count must be non-negative");
  }

  if (config.instanceCount === 1) {
    warnings.push(
      "Single instance VMSS provides no high availability benefits",
    );
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
export function vmssBestPractices(): string {
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
export const vmss = {
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
