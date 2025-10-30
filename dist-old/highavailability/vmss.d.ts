/**
 * VMSS Integration for HA Clusters
 * Provides Virtual Machine Scale Sets configuration with PPG placement,
 * load balancer backend pool integration, and auto-scaling policies
 */
import { ProximityPlacementGroupConfig } from './ppg';
import { LoadBalancerConfig } from './loadbalancer';
import { HighAvailabilityConfig } from './cluster';
export interface VmssConfig {
    enabled: boolean;
    name?: string;
    instanceCount: {
        min: number;
        max: number;
        default: number;
    };
    vmSize: string;
    upgradePolicy: 'Manual' | 'Automatic' | 'Rolling';
    zones?: string[];
    platformFaultDomainCount?: number;
    singlePlacementGroup?: boolean;
    overProvision?: boolean;
    scaleInPolicy?: {
        rules: ('Default' | 'OldestVM' | 'NewestVM')[];
        forceDeletion?: boolean;
    };
    osProfile: {
        computerNamePrefix: string;
        adminUsername: string;
        adminPassword?: string;
        customData?: string;
        secrets?: Array<{
            sourceVault: {
                id: string;
            };
            vaultCertificates: Array<{
                certificateUrl: string;
                certificateStore?: string;
            }>;
        }>;
    };
    storageProfile: {
        imageReference: {
            publisher: string;
            offer: string;
            sku: string;
            version?: string;
        };
        osDisk: {
            caching: 'None' | 'ReadOnly' | 'ReadWrite';
            createOption: 'FromImage';
            diskSizeGB?: number;
            managedDisk?: {
                storageAccountType: 'Standard_LRS' | 'Standard_ZRS' | 'Premium_LRS' | 'StandardSSD_LRS' | 'UltraSSD_LRS' | 'Premium_ZRS' | 'StandardSSD_ZRS';
            };
        };
        dataDisks?: Array<{
            lun: number;
            createOption: 'Empty' | 'Attach';
            diskSizeGB: number;
            caching?: 'None' | 'ReadOnly' | 'ReadWrite';
            managedDisk?: {
                storageAccountType: 'Standard_LRS' | 'Standard_ZRS' | 'Premium_LRS' | 'StandardSSD_LRS' | 'UltraSSD_LRS' | 'Premium_ZRS' | 'StandardSSD_ZRS';
            };
        }>;
    };
    networkProfile: {
        networkInterfaceConfigurations: Array<{
            name: string;
            primary: boolean;
            enableAcceleratedNetworking?: boolean;
            enableIPForwarding?: boolean;
            networkSecurityGroup?: {
                id: string;
            };
            ipConfigurations: Array<{
                name: string;
                subnet: {
                    id: string;
                };
                primary: boolean;
                privateIPAddressVersion?: 'IPv4' | 'IPv6';
                publicIPAddressConfiguration?: {
                    name: string;
                    properties: {
                        idleTimeoutInMinutes?: number;
                        dnsSettings?: {
                            domainNameLabel: string;
                        };
                    };
                };
                loadBalancerBackendAddressPools?: Array<{
                    id: string;
                }>;
                loadBalancerInboundNatPools?: Array<{
                    id: string;
                }>;
                applicationGatewayBackendAddressPools?: Array<{
                    id: string;
                }>;
            }>;
        }>;
    };
    extensionProfile?: {
        extensions: Array<{
            name: string;
            type: string;
            publisher: string;
            typeHandlerVersion: string;
            autoUpgradeMinorVersion: boolean;
            settings?: any;
            protectedSettings?: any;
        }>;
    };
    automaticRepairsPolicy?: {
        enabled: boolean;
        gracePeriod?: string;
        repairAction?: 'Replace' | 'Restart';
    };
    tags?: Record<string, string>;
}
export interface VmssAutoscaleConfig {
    enabled: boolean;
    profiles: Array<{
        name: string;
        capacity: {
            minimum: string;
            maximum: string;
            default: string;
        };
        rules: Array<{
            scaleAction: {
                direction: 'Increase' | 'Decrease';
                type: 'ChangeCount' | 'PercentChangeCount' | 'ExactCount';
                value: string;
                cooldown: string;
            };
            metricTrigger: {
                metricName: string;
                metricNamespace?: string;
                metricResourceUri: string;
                metricResourceLocation?: string;
                timeGrain: string;
                statistic: 'Average' | 'Min' | 'Max' | 'Sum' | 'Count';
                timeWindow: string;
                timeAggregation: 'Average' | 'Minimum' | 'Maximum' | 'Total' | 'Count' | 'Last';
                operator: 'Equals' | 'NotEquals' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual';
                threshold: number;
                dimensions?: Array<{
                    name: string;
                    operator: 'Equals' | 'NotEquals';
                    values: string[];
                }>;
                dividePerInstance?: boolean;
            };
        }>;
        fixedDate?: {
            timeZone: string;
            start: string;
            end: string;
        };
        recurrence?: {
            frequency: 'None' | 'Second' | 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year';
            schedule: {
                timeZone: string;
                days: string[];
                hours: number[];
                minutes: number[];
            };
        };
    }>;
    notifications?: Array<{
        operation: 'Scale';
        email: {
            sendToSubscriptionAdministrator?: boolean;
            sendToSubscriptionCoAdministrators?: boolean;
            customEmails?: string[];
        };
        webhooks?: Array<{
            serviceUri: string;
            properties?: Record<string, string>;
        }>;
    }>;
    targetResourceUri?: string;
    tags?: Record<string, string>;
}
/**
 * Validates VMSS configuration for HA cluster deployment
 */
export declare function validateVmssConfiguration(vmssConfig: VmssConfig, haConfig: HighAvailabilityConfig, ppgConfig?: ProximityPlacementGroupConfig, lbConfig?: LoadBalancerConfig): string[];
/**
 * Validates VMSS autoscale configuration
 */
export declare function validateVmssAutoscaleConfiguration(autoscaleConfig: VmssAutoscaleConfig, vmssConfig: VmssConfig): string[];
/**
 * Generates ARM template resource for VMSS
 */
export declare function generateVmssResource(vmssConfig: VmssConfig, haConfig: HighAvailabilityConfig, ppgConfig?: ProximityPlacementGroupConfig, lbConfig?: LoadBalancerConfig): any;
/**
 * Generates ARM template resource for VMSS autoscale settings
 */
export declare function generateVmssAutoscaleResource(autoscaleConfig: VmssAutoscaleConfig, vmssConfig: VmssConfig): any;
/**
 * Generates ARM template parameters for VMSS
 */
export declare function generateVmssParameters(vmssConfig: VmssConfig): any;
/**
 * CLI helper for VMSS configuration
 */
export declare class VmssCLI {
    static validateConfiguration(vmssConfig: VmssConfig, haConfig: HighAvailabilityConfig): Promise<boolean>;
    static getVmssBestPractices(): string[];
    static getVmssExamples(): Array<{
        name: string;
        description: string;
        config: Partial<VmssConfig>;
    }>;
    static getAutoscaleExamples(): Array<{
        name: string;
        description: string;
        config: Partial<VmssAutoscaleConfig>;
    }>;
}
