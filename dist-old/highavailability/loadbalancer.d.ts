/**
 * Load balancer types and SKUs
 */
export type LoadBalancerType = 'public' | 'internal';
export type LoadBalancerSku = 'Basic' | 'Standard';
/**
 * Health probe configuration
 */
export interface HealthProbeConfig {
    name: string;
    protocol: 'HTTP' | 'HTTPS' | 'TCP';
    port: number;
    path?: string;
    intervalInSeconds?: number;
    numberOfProbes?: number;
    timeoutInSeconds?: number;
}
/**
 * Backend pool configuration
 */
export interface BackendPoolConfig {
    name: string;
    vmssResourceId?: string;
    vmResourceIds?: string[];
}
/**
 * Load balancing rule configuration
 */
export interface LoadBalancingRuleConfig {
    name: string;
    frontendPort: number;
    backendPort: number;
    protocol: 'TCP' | 'UDP';
    healthProbeName: string;
    backendPoolName: string;
    enableFloatingIP?: boolean;
    idleTimeoutInMinutes?: number;
    enableTcpReset?: boolean;
}
/**
 * NAT rule configuration for direct VM access
 */
export interface NatRuleConfig {
    name: string;
    frontendPort: number;
    backendPort: number;
    protocol: 'TCP' | 'UDP';
    targetVmIndex?: number;
}
/**
 * Complete load balancer configuration
 */
export interface LoadBalancerConfig {
    name: string;
    type: LoadBalancerType;
    sku: LoadBalancerSku;
    availabilityZones?: string[];
    frontend: {
        publicIpName?: string;
        subnetId?: string;
        privateIpAddress?: string;
    };
    backendPools: BackendPoolConfig[];
    healthProbes: HealthProbeConfig[];
    loadBalancingRules: LoadBalancingRuleConfig[];
    natRules?: NatRuleConfig[];
    enableOutboundRules?: boolean;
    enableHaPort?: boolean;
    tags?: Record<string, string>;
}
/**
 * Validates load balancer configuration
 */
export declare function validateLoadBalancerConfiguration(config: LoadBalancerConfig): string[];
/**
 * Generates ARM template for load balancer resource
 */
export declare function generateLoadBalancerResource(config: LoadBalancerConfig): any;
/**
 * Generates ARM parameters for load balancer
 */
export declare function generateLoadBalancerParameters(config: LoadBalancerConfig): any;
/**
 * Generates public IP resource for public load balancer
 */
export declare function generatePublicIpResource(config: LoadBalancerConfig): any | null;
/**
 * CLI helper for load balancer configuration and planning
 */
export declare class LoadBalancerCLI {
    /**
     * Validate load balancer configuration
     */
    static validateConfiguration(config: LoadBalancerConfig): void;
    /**
     * Show load balancer best practices
     */
    static showBestPractices(): void;
    /**
     * Generate sample load balancer configurations
     */
    static showExamples(): void;
}
export default LoadBalancerCLI;
