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
export declare function validateHAConfiguration(config: HighAvailabilityConfig): string[];
/**
 * Determines if cost optimization should be disabled for HA scenario
 */
export declare function shouldDisableCostOptimization(haConfig: HighAvailabilityConfig): boolean;
/**
 * CLI helper for HA configuration validation
 */
export declare class HighAvailabilityCLI {
    static validateConfig(config: HighAvailabilityConfig): void;
    /**
     * List available HA configuration examples
     */
    static listExamples(): void;
    /**
     * Show HA best practices and recommendations
     */
    static showBestPractices(): void;
}
