"use strict";
/**
 * VMSS Integration for HA Clusters
 * Provides Virtual Machine Scale Sets configuration with PPG placement,
 * load balancer backend pool integration, and auto-scaling policies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VmssCLI = void 0;
exports.validateVmssConfiguration = validateVmssConfiguration;
exports.validateVmssAutoscaleConfiguration = validateVmssAutoscaleConfiguration;
exports.generateVmssResource = generateVmssResource;
exports.generateVmssAutoscaleResource = generateVmssAutoscaleResource;
exports.generateVmssParameters = generateVmssParameters;
/**
 * Validates VMSS configuration for HA cluster deployment
 */
function validateVmssConfiguration(vmssConfig, haConfig, ppgConfig, lbConfig) {
    const errors = [];
    if (!vmssConfig.enabled) {
        return errors;
    }
    // Basic validation
    if (!vmssConfig.vmSize) {
        errors.push('VMSS VM size is required');
    }
    if (!vmssConfig.osProfile?.computerNamePrefix) {
        errors.push('VMSS computer name prefix is required');
    }
    if (!vmssConfig.osProfile?.adminUsername) {
        errors.push('VMSS admin username is required');
    }
    // Instance count validation
    if (vmssConfig.instanceCount.min < 1) {
        errors.push('VMSS minimum instance count must be at least 1');
    }
    if (vmssConfig.instanceCount.max < vmssConfig.instanceCount.min) {
        errors.push('VMSS maximum instance count must be greater than or equal to minimum');
    }
    if (vmssConfig.instanceCount.default < vmssConfig.instanceCount.min ||
        vmssConfig.instanceCount.default > vmssConfig.instanceCount.max) {
        errors.push('VMSS default instance count must be between minimum and maximum');
    }
    // Zone validation
    if (haConfig.availabilityZones && vmssConfig.zones) {
        const invalidZones = vmssConfig.zones.filter(zone => !haConfig.availabilityZones.includes(zone));
        if (invalidZones.length > 0) {
            errors.push(`VMSS zones [${invalidZones.join(', ')}] are not available in the specified HA cluster zones`);
        }
    }
    // PPG compatibility validation
    if (ppgConfig?.enabled && vmssConfig.zones && vmssConfig.zones.length > 1) {
        // Note: PPG proximity types are determined by Azure based on the intent and VM sizes
        // Multi-zone deployments may have limitations with PPG colocation
        errors.push('Multi-zone VMSS deployments with PPG may have colocation limitations across zones');
    }
    // Single placement group validation
    if (vmssConfig.instanceCount.max > 100 && vmssConfig.singlePlacementGroup !== false) {
        errors.push('VMSS with more than 100 instances requires singlePlacementGroup to be set to false');
    }
    // Platform fault domain validation
    if (vmssConfig.platformFaultDomainCount !== undefined) {
        if (vmssConfig.platformFaultDomainCount < 1 || vmssConfig.platformFaultDomainCount > 5) {
            errors.push('VMSS platform fault domain count must be between 1 and 5');
        }
        if (vmssConfig.zones && vmssConfig.zones.length > 1 && vmssConfig.platformFaultDomainCount > 1) {
            errors.push('Multi-zone VMSS should use platformFaultDomainCount of 1 for optimal zone distribution');
        }
    }
    // Load balancer integration validation
    if (lbConfig) {
        const networkConfig = vmssConfig.networkProfile.networkInterfaceConfigurations[0];
        const ipConfig = networkConfig?.ipConfigurations[0];
        if (!ipConfig?.loadBalancerBackendAddressPools || ipConfig.loadBalancerBackendAddressPools.length === 0) {
            errors.push('VMSS must be associated with load balancer backend pools when load balancer is enabled');
        }
        // Validate backend pool references
        if (ipConfig?.loadBalancerBackendAddressPools) {
            const configuredPools = lbConfig.backendPools?.map(pool => pool.name) || [];
            ipConfig.loadBalancerBackendAddressPools.forEach((poolRef, index) => {
                // Extract pool name from resource ID (simplified validation)
                const poolName = poolRef.id.split('/').pop();
                if (poolName && !configuredPools.includes(poolName)) {
                    errors.push(`VMSS backend pool reference ${poolName} does not match any configured load balancer backend pools`);
                }
            });
        }
    }
    // Storage validation
    if (vmssConfig.storageProfile.osDisk.diskSizeGB && vmssConfig.storageProfile.osDisk.diskSizeGB < 30) {
        errors.push('VMSS OS disk size must be at least 30 GB');
    }
    // Network validation
    if (!vmssConfig.networkProfile.networkInterfaceConfigurations ||
        vmssConfig.networkProfile.networkInterfaceConfigurations.length === 0) {
        errors.push('VMSS must have at least one network interface configuration');
    }
    const primaryNics = vmssConfig.networkProfile.networkInterfaceConfigurations.filter(nic => nic.primary);
    if (primaryNics.length !== 1) {
        errors.push('VMSS must have exactly one primary network interface configuration');
    }
    return errors;
}
/**
 * Validates VMSS autoscale configuration
 */
function validateVmssAutoscaleConfiguration(autoscaleConfig, vmssConfig) {
    const errors = [];
    if (!autoscaleConfig.enabled) {
        return errors;
    }
    if (!autoscaleConfig.profiles || autoscaleConfig.profiles.length === 0) {
        errors.push('Autoscale must have at least one profile');
    }
    autoscaleConfig.profiles.forEach((profile, profileIndex) => {
        // Capacity validation
        const minCapacity = parseInt(profile.capacity.minimum);
        const maxCapacity = parseInt(profile.capacity.maximum);
        const defaultCapacity = parseInt(profile.capacity.default);
        if (minCapacity < vmssConfig.instanceCount.min) {
            errors.push(`Autoscale profile ${profileIndex} minimum capacity (${minCapacity}) cannot be less than VMSS minimum (${vmssConfig.instanceCount.min})`);
        }
        if (maxCapacity > vmssConfig.instanceCount.max) {
            errors.push(`Autoscale profile ${profileIndex} maximum capacity (${maxCapacity}) cannot exceed VMSS maximum (${vmssConfig.instanceCount.max})`);
        }
        if (defaultCapacity < minCapacity || defaultCapacity > maxCapacity) {
            errors.push(`Autoscale profile ${profileIndex} default capacity must be between minimum and maximum`);
        }
        // Rules validation
        if (!profile.rules || profile.rules.length === 0) {
            errors.push(`Autoscale profile ${profileIndex} must have at least one rule`);
        }
        profile.rules.forEach((rule, ruleIndex) => {
            if (!rule.metricTrigger.metricName) {
                errors.push(`Autoscale profile ${profileIndex} rule ${ruleIndex} must specify a metric name`);
            }
            if (!rule.metricTrigger.metricResourceUri) {
                errors.push(`Autoscale profile ${profileIndex} rule ${ruleIndex} must specify a metric resource URI`);
            }
            if (rule.metricTrigger.threshold === undefined || rule.metricTrigger.threshold === null) {
                errors.push(`Autoscale profile ${profileIndex} rule ${ruleIndex} must specify a threshold`);
            }
        });
    });
    return errors;
}
/**
 * Generates ARM template resource for VMSS
 */
function generateVmssResource(vmssConfig, haConfig, ppgConfig, lbConfig) {
    if (!vmssConfig.enabled) {
        return null;
    }
    const resource = {
        type: 'Microsoft.Compute/virtualMachineScaleSets',
        apiVersion: '2023-03-01',
        name: '[variables(\'vmssName\')]',
        location: '[parameters(\'location\')]',
        dependsOn: [],
        sku: {
            name: vmssConfig.vmSize,
            tier: 'Standard',
            capacity: vmssConfig.instanceCount.default
        },
        properties: {
            overprovision: vmssConfig.overProvision !== false,
            upgradePolicy: {
                mode: vmssConfig.upgradePolicy
            },
            virtualMachineProfile: {
                osProfile: {
                    computerNamePrefix: vmssConfig.osProfile.computerNamePrefix,
                    adminUsername: vmssConfig.osProfile.adminUsername,
                    adminPassword: vmssConfig.osProfile.adminPassword ? '[parameters(\'adminPassword\')]' : undefined,
                    customData: vmssConfig.osProfile.customData ? '[base64(parameters(\'customData\'))]' : undefined,
                    secrets: vmssConfig.osProfile.secrets
                },
                storageProfile: vmssConfig.storageProfile,
                networkProfile: vmssConfig.networkProfile,
                extensionProfile: vmssConfig.extensionProfile,
                diagnosticsProfile: {
                    bootDiagnostics: {
                        enabled: true,
                        storageUri: '[reference(resourceId(\'Microsoft.Storage/storageAccounts\', variables(\'diagnosticsStorageAccountName\')))]' // Optional: boot diagnostics
                    }
                }
            }
        },
        tags: vmssConfig.tags || '[parameters(\'tags\')]'
    };
    // Add zones if specified
    if (vmssConfig.zones && vmssConfig.zones.length > 0) {
        resource.zones = vmssConfig.zones;
    }
    // Configure single placement group
    if (vmssConfig.singlePlacementGroup !== undefined) {
        resource.properties.singlePlacementGroup = vmssConfig.singlePlacementGroup;
    }
    // Configure platform fault domain count
    if (vmssConfig.platformFaultDomainCount !== undefined) {
        resource.properties.platformFaultDomainCount = vmssConfig.platformFaultDomainCount;
    }
    // Configure scale-in policy
    if (vmssConfig.scaleInPolicy) {
        resource.properties.scaleInPolicy = vmssConfig.scaleInPolicy;
    }
    // Configure automatic repairs
    if (vmssConfig.automaticRepairsPolicy) {
        resource.properties.automaticRepairsPolicy = vmssConfig.automaticRepairsPolicy;
    }
    // Add PPG dependency and association
    if (ppgConfig?.enabled) {
        resource.dependsOn.push('[resourceId(\'Microsoft.Compute/proximityPlacementGroups\', variables(\'ppgName\'))]');
        resource.properties.proximityPlacementGroup = {
            id: '[resourceId(\'Microsoft.Compute/proximityPlacementGroups\', variables(\'ppgName\'))]'
        };
    }
    // Add load balancer dependencies
    if (lbConfig) {
        resource.dependsOn.push('[resourceId(\'Microsoft.Network/loadBalancers\', variables(\'loadBalancerName\'))]');
    }
    return resource;
}
/**
 * Generates ARM template resource for VMSS autoscale settings
 */
function generateVmssAutoscaleResource(autoscaleConfig, vmssConfig) {
    if (!autoscaleConfig.enabled || !vmssConfig.enabled) {
        return null;
    }
    return {
        type: 'Microsoft.Insights/autoscalesettings',
        apiVersion: '2022-10-01',
        name: '[variables(\'autoscaleSettingsName\')]',
        location: '[parameters(\'location\')]',
        dependsOn: [
            '[resourceId(\'Microsoft.Compute/virtualMachineScaleSets\', variables(\'vmssName\'))]'
        ],
        properties: {
            name: '[variables(\'autoscaleSettingsName\')]',
            targetResourceUri: autoscaleConfig.targetResourceUri || '[resourceId(\'Microsoft.Compute/virtualMachineScaleSets\', variables(\'vmssName\'))]',
            enabled: autoscaleConfig.enabled,
            profiles: autoscaleConfig.profiles,
            notifications: autoscaleConfig.notifications
        },
        tags: autoscaleConfig.tags || '[parameters(\'tags\')]'
    };
}
/**
 * Generates ARM template parameters for VMSS
 */
function generateVmssParameters(vmssConfig) {
    if (!vmssConfig.enabled) {
        return {};
    }
    const parameters = {
        vmssInstanceCount: {
            type: 'int',
            defaultValue: vmssConfig.instanceCount.default,
            minValue: vmssConfig.instanceCount.min,
            maxValue: vmssConfig.instanceCount.max,
            metadata: {
                description: 'Number of VM instances in the scale set'
            }
        },
        vmssVmSize: {
            type: 'string',
            defaultValue: vmssConfig.vmSize,
            metadata: {
                description: 'Size of the VM instances in the scale set'
            }
        },
        vmssComputerNamePrefix: {
            type: 'string',
            defaultValue: vmssConfig.osProfile.computerNamePrefix,
            maxLength: 9,
            metadata: {
                description: 'Computer name prefix for VM instances'
            }
        },
        vmssAdminUsername: {
            type: 'string',
            defaultValue: vmssConfig.osProfile.adminUsername,
            metadata: {
                description: 'Admin username for VM instances'
            }
        }
    };
    if (vmssConfig.osProfile.adminPassword) {
        parameters.vmssAdminPassword = {
            type: 'securestring',
            metadata: {
                description: 'Admin password for VM instances'
            }
        };
    }
    if (vmssConfig.osProfile.customData) {
        parameters.vmssCustomData = {
            type: 'string',
            defaultValue: vmssConfig.osProfile.customData,
            metadata: {
                description: 'Custom data for VM instances'
            }
        };
    }
    return parameters;
}
/**
 * CLI helper for VMSS configuration
 */
class VmssCLI {
    static async validateConfiguration(vmssConfig, haConfig) {
        const errors = validateVmssConfiguration(vmssConfig, haConfig);
        if (errors.length > 0) {
            console.error('❌ VMSS configuration validation failed:');
            errors.forEach(error => console.error(`  • ${error}`));
            return false;
        }
        console.log('✅ VMSS configuration is valid');
        return true;
    }
    static getVmssBestPractices() {
        return [
            '🔧 **Instance Configuration**',
            '  • Use Standard_D2s_v3 or larger for production workloads',
            '  • Enable accelerated networking for network-intensive applications',
            '  • Configure at least 2 instances for high availability',
            '',
            '🌍 **Zone Distribution**',
            '  • Deploy across multiple availability zones for maximum resilience',
            '  • Use platformFaultDomainCount=1 for multi-zone deployments',
            '  • Consider Ultra PPG for zone-spanning proximity requirements',
            '',
            '📈 **Scaling Configuration**',
            '  • Set appropriate min/max instance counts based on workload patterns',
            '  • Use rolling upgrade policy for production environments',
            '  • Configure scale-in policy to prefer newer instances',
            '',
            '🔍 **Health Monitoring**',
            '  • Enable automatic repairs with appropriate grace period',
            '  • Configure application health extension for workload-aware health checks',
            '  • Use custom health probes aligned with application readiness',
            '',
            '💾 **Storage Optimization**',
            '  • Use Premium SSD for performance-critical workloads',
            '  • Size OS disk appropriately (minimum 30GB recommended)',
            '  • Consider separate data disks for application data',
            '',
            '🔐 **Security Best Practices**',
            '  • Use managed identity for Azure resource access',
            '  • Store secrets in Azure Key Vault, not in custom data',
            '  • Configure NSG rules to restrict unnecessary network access',
            '  • Enable boot diagnostics for troubleshooting',
            '',
            '⚡ **Performance Tuning**',
            '  • Disable over-provisioning for predictable scaling behavior',
            '  • Use single placement group = false for large scale sets (>100 instances)',
            '  • Configure autoscale rules based on application-specific metrics'
        ];
    }
    static getVmssExamples() {
        return [
            {
                name: 'Web Tier VMSS',
                description: 'High-availability web tier with load balancer integration',
                config: {
                    enabled: true,
                    instanceCount: { min: 2, max: 10, default: 3 },
                    vmSize: 'Standard_D2s_v3',
                    upgradePolicy: 'Rolling',
                    zones: ['1', '2', '3'],
                    platformFaultDomainCount: 1,
                    singlePlacementGroup: true,
                    automaticRepairsPolicy: {
                        enabled: true,
                        gracePeriod: 'PT30M'
                    }
                }
            },
            {
                name: 'Application Tier VMSS',
                description: 'Scalable application tier with premium storage',
                config: {
                    enabled: true,
                    instanceCount: { min: 3, max: 20, default: 5 },
                    vmSize: 'Standard_D4s_v3',
                    upgradePolicy: 'Rolling',
                    zones: ['1', '2', '3'],
                    storageProfile: {
                        imageReference: {
                            publisher: 'Canonical',
                            offer: 'UbuntuServer',
                            sku: '18.04-LTS',
                            version: 'latest'
                        },
                        osDisk: {
                            caching: 'ReadWrite',
                            createOption: 'FromImage',
                            managedDisk: {
                                storageAccountType: 'Premium_LRS'
                            }
                        }
                    }
                }
            },
            {
                name: 'Large Scale VMSS',
                description: 'Large scale deployment across multiple placement groups',
                config: {
                    enabled: true,
                    instanceCount: { min: 10, max: 1000, default: 50 },
                    vmSize: 'Standard_D2s_v3',
                    upgradePolicy: 'Rolling',
                    zones: ['1', '2', '3'],
                    platformFaultDomainCount: 1,
                    singlePlacementGroup: false,
                    scaleInPolicy: {
                        rules: ['NewestVM']
                    }
                }
            }
        ];
    }
    static getAutoscaleExamples() {
        return [
            {
                name: 'CPU-based Autoscale',
                description: 'Scale based on average CPU utilization',
                config: {
                    enabled: true,
                    profiles: [
                        {
                            name: 'DefaultProfile',
                            capacity: {
                                minimum: '2',
                                maximum: '10',
                                default: '3'
                            },
                            rules: [
                                {
                                    scaleAction: {
                                        direction: 'Increase',
                                        type: 'ChangeCount',
                                        value: '1',
                                        cooldown: 'PT5M'
                                    },
                                    metricTrigger: {
                                        metricName: 'Percentage CPU',
                                        metricResourceUri: '[resourceId(\'Microsoft.Compute/virtualMachineScaleSets\', variables(\'vmssName\'))]',
                                        timeGrain: 'PT1M',
                                        statistic: 'Average',
                                        timeWindow: 'PT5M',
                                        timeAggregation: 'Average',
                                        operator: 'GreaterThan',
                                        threshold: 70
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            {
                name: 'Schedule-based Autoscale',
                description: 'Scale based on time schedules for predictable workloads',
                config: {
                    enabled: true,
                    profiles: [
                        {
                            name: 'BusinessHours',
                            capacity: {
                                minimum: '5',
                                maximum: '20',
                                default: '8'
                            },
                            rules: [],
                            recurrence: {
                                frequency: 'Week',
                                schedule: {
                                    timeZone: 'Pacific Standard Time',
                                    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                    hours: [8],
                                    minutes: [0]
                                }
                            }
                        }
                    ]
                }
            }
        ];
    }
}
exports.VmssCLI = VmssCLI;
