/**
 * Health Extensions for HA Clusters
 * Provides application-level health monitoring, automatic repair policies,
 * and health signal correlation between load balancer probes and application health
 */
import { LoadBalancerConfig } from './loadbalancer';
import { VmssConfig } from './vmss';
export interface ApplicationHealthExtensionConfig {
    enabled: boolean;
    protocol: 'http' | 'https' | 'tcp';
    port: number;
    requestPath?: string;
    intervalInSeconds?: number;
    numberOfProbes?: number;
    gracePeriod?: string;
    autoUpgradeMinorVersion?: boolean;
    settings?: {
        protocol?: string;
        port?: number;
        requestPath?: string;
        intervalInSeconds?: number;
        numberOfProbes?: number;
        gracePeriod?: string;
    };
    protectedSettings?: {};
}
export interface CustomHealthProbeConfig {
    enabled: boolean;
    name: string;
    description?: string;
    script?: {
        scriptPath: string;
        scriptArguments?: string;
        timeoutInSeconds?: number;
        intervalInSeconds?: number;
        retryCount?: number;
    };
    httpEndpoint?: {
        url: string;
        method?: 'GET' | 'POST' | 'HEAD';
        headers?: Record<string, string>;
        expectedStatusCodes?: number[];
        timeoutInSeconds?: number;
        intervalInSeconds?: number;
        retryCount?: number;
    };
    commandLine?: {
        command: string;
        arguments?: string[];
        workingDirectory?: string;
        timeoutInSeconds?: number;
        intervalInSeconds?: number;
        retryCount?: number;
    };
    healthThresholds?: {
        healthyThreshold: number;
        unhealthyThreshold: number;
        consecutiveFailuresRequired?: number;
    };
}
export interface HealthMonitoringConfig {
    applicationHealthExtension: ApplicationHealthExtensionConfig;
    customHealthProbes?: CustomHealthProbeConfig[];
    healthSignalCorrelation?: {
        enabled: boolean;
        loadBalancerProbeCorrelation?: boolean;
        healthGracePeriod?: string;
        repairGracePeriod?: string;
        maxRepairActions?: number;
        repairCooldown?: string;
    };
    automaticRepairPolicy?: {
        enabled: boolean;
        gracePeriod?: string;
        repairAction?: 'Replace' | 'Restart' | 'Reimage';
        maxInstanceRepairsPercent?: number;
        enableAutomaticOSUpgrade?: boolean;
    };
    healthReporting?: {
        enabled: boolean;
        logAnalyticsWorkspaceId?: string;
        applicationInsightsInstrumentationKey?: string;
        customMetrics?: Array<{
            name: string;
            description: string;
            unit: string;
            aggregationType: 'Average' | 'Maximum' | 'Minimum' | 'Total' | 'Count';
        }>;
    };
}
/**
 * Validates health extension configuration
 */
export declare function validateHealthExtensionConfiguration(healthConfig: HealthMonitoringConfig, vmssConfig: VmssConfig, lbConfig?: LoadBalancerConfig): string[];
/**
 * Generates ARM template extension for Application Health
 */
export declare function generateApplicationHealthExtension(healthConfig: HealthMonitoringConfig, vmssConfig: VmssConfig): any;
/**
 * Generates ARM template for custom health monitoring script
 */
export declare function generateCustomHealthMonitoringExtension(healthConfig: HealthMonitoringConfig): any;
/**
 * Generates ARM template parameters for health extensions
 */
export declare function generateHealthExtensionParameters(healthConfig: HealthMonitoringConfig): any;
/**
 * CLI helper for health extension configuration
 */
export declare class HealthExtensionCLI {
    static validateConfiguration(healthConfig: HealthMonitoringConfig, vmssConfig: VmssConfig): Promise<boolean>;
    static getHealthExtensionBestPractices(): string[];
    static getHealthExtensionExamples(): Array<{
        name: string;
        description: string;
        config: Partial<HealthMonitoringConfig>;
    }>;
    static getHealthProbeTemplates(): Array<{
        name: string;
        type: string;
        template: string;
    }>;
}
