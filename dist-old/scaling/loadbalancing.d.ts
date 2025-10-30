/**
 * Scaling Module - Load Balancing Helpers
 *
 * Provides helpers for configuring Azure Load Balancers that integrate
 * with Virtual Machine Scale Sets and support multi-region deployments.
 *
 * @module scaling/loadbalancing
 */
export type LoadBalancerSku = "Basic" | "Standard" | "Gateway";
export interface FrontendIPConfig {
    name: string;
    publicIpAddressId?: string;
    subnetId?: string;
    privateIpAddress?: string;
    privateIpAllocationMethod?: "Dynamic" | "Static";
    zones?: string[];
}
export interface BackendPoolConfig {
    name: string;
    vmssResourceId?: string;
    nicResourceIds?: string[];
}
export interface ProbeConfig {
    name: string;
    protocol: "Http" | "Https" | "Tcp";
    port: number;
    requestPath?: string;
    intervalInSeconds?: number;
    numberOfProbes?: number;
}
export interface LoadBalancingRuleConfig {
    name: string;
    protocol: "Tcp" | "Udp" | "All";
    backendPort: number;
    frontendPort: number;
    idleTimeoutInMinutes?: number;
    enableFloatingIP?: boolean;
    loadDistribution?: "Default" | "SourceIP" | "SourceIPProtocol";
    probeName?: string;
    frontendIPConfigName: string;
    backendPoolName: string;
}
export interface LoadBalancerOptions {
    name: string;
    location?: string;
    sku?: LoadBalancerSku;
    frontendIPConfigurations: FrontendIPConfig[];
    backendAddressPools: BackendPoolConfig[];
    probes?: ProbeConfig[];
    loadBalancingRules: LoadBalancingRuleConfig[];
    inboundNatPools?: {
        name: string;
        protocol: "Tcp" | "Udp";
        frontendPortRangeStart: number;
        frontendPortRangeEnd: number;
        backendPort: number;
        frontendIPConfigurationName: string;
    }[];
    tags?: Record<string, string>;
}
export interface HealthProbeRecommendation {
    workload: "Web" | "Api" | "TcpService";
    protocol: "Http" | "Https" | "Tcp";
    port: number;
    requestPath?: string;
    intervalInSeconds: number;
    numberOfProbes: number;
    rationale: string;
}
/**
 * Create Load Balancer resource definition
 */
export declare function createLoadBalancer(options: LoadBalancerOptions): Record<string, unknown>;
export declare function createFrontendIPConfig(config: FrontendIPConfig): Record<string, unknown>;
export declare function createBackendPoolConfig(config: BackendPoolConfig): Record<string, unknown>;
export declare function createProbeConfig(config: ProbeConfig): Record<string, unknown>;
export declare function createLoadBalancingRule(config: LoadBalancingRuleConfig): Record<string, unknown>;
/**
 * Generate health probe recommendations based on workload type
 */
export declare function recommendHealthProbe(workload: HealthProbeRecommendation["workload"]): HealthProbeRecommendation;
export type ApplicationGatewaySkuName = "Standard_v2" | "WAF_v2";
export type ApplicationGatewayTier = "Standard_v2" | "WAF_v2";
export interface AppGatewayIpConfig {
    name: string;
    subnetId: string;
}
export interface AppGatewayFrontendConfig {
    name: string;
    publicIpAddressId?: string;
    subnetId?: string;
    privateIpAddress?: string;
    privateIpAllocationMethod?: "Dynamic" | "Static";
}
export interface AppGatewayFrontendPortConfig {
    name: string;
    port: number;
}
export interface AppGatewayBackendAddress {
    ipAddress?: string;
    fqdn?: string;
}
export interface AppGatewayBackendPoolConfig {
    name: string;
    addresses?: AppGatewayBackendAddress[];
}
export interface AppGatewayHttpSettingConfig {
    name: string;
    port: number;
    protocol: "Http" | "Https";
    cookieBasedAffinity?: "Enabled" | "Disabled";
    requestTimeout?: number;
    probeName?: string;
    pickHostNameFromBackendAddress?: boolean;
}
export interface AppGatewayProbeConfig {
    name: string;
    protocol: "Http" | "Https";
    path: string;
    interval?: number;
    timeout?: number;
    unhealthyThreshold?: number;
    pickHostNameFromBackendHttpSettings?: boolean;
}
export interface AppGatewayListenerConfig {
    name: string;
    frontendIPConfigName: string;
    frontendPortName: string;
    protocol: "Http" | "Https";
    sslCertificateName?: string;
    hostName?: string;
}
export interface AppGatewayRoutingRuleConfig {
    name: string;
    ruleType?: "Basic" | "PathBasedRouting";
    listenerName: string;
    backendPoolName: string;
    backendHttpSettingsName: string;
    priority?: number;
    urlPathMapName?: string;
}
export interface ApplicationGatewayOptions {
    name: string;
    location?: string;
    sku?: {
        name: ApplicationGatewaySkuName;
        tier?: ApplicationGatewayTier;
        capacity?: number;
    };
    gatewayIPConfigurations: AppGatewayIpConfig[];
    frontendIPConfigurations: AppGatewayFrontendConfig[];
    frontendPorts: AppGatewayFrontendPortConfig[];
    backendAddressPools: AppGatewayBackendPoolConfig[];
    httpSettings: AppGatewayHttpSettingConfig[];
    listeners: AppGatewayListenerConfig[];
    requestRoutingRules: AppGatewayRoutingRuleConfig[];
    probes?: AppGatewayProbeConfig[];
    enableHttp2?: boolean;
    wafConfiguration?: {
        enabled: boolean;
        mode: "Detection" | "Prevention";
        ruleSetType?: "OWASP";
        ruleSetVersion?: "3.2" | "3.1" | "3.0";
    };
    tags?: Record<string, string>;
}
export declare function createAppGatewayIpConfig(config: AppGatewayIpConfig): Record<string, unknown>;
export declare function createAppGatewayFrontendConfig(config: AppGatewayFrontendConfig): Record<string, unknown>;
export declare function createAppGatewayFrontendPort(config: AppGatewayFrontendPortConfig): Record<string, unknown>;
export declare function createAppGatewayBackendPool(config: AppGatewayBackendPoolConfig): Record<string, unknown>;
export declare function createAppGatewayHttpSetting(config: AppGatewayHttpSettingConfig): Record<string, unknown>;
export declare function createAppGatewayProbe(config: AppGatewayProbeConfig): Record<string, unknown>;
export declare function createAppGatewayListener(config: AppGatewayListenerConfig): Record<string, unknown>;
export declare function createAppGatewayRoutingRule(config: AppGatewayRoutingRuleConfig): Record<string, unknown>;
export declare function createApplicationGateway(options: ApplicationGatewayOptions): Record<string, unknown>;
export declare function recommendAppGatewaySku(workload: "web" | "api" | "missionCritical"): {
    sku: ApplicationGatewaySkuName;
    tier: ApplicationGatewayTier;
    rationale: string;
};
/**
 * Exported helper map for registration
 */
export declare const loadBalancingHelpers: {
    "scale:lb.definition": typeof createLoadBalancer;
    "scale:lb.frontend": typeof createFrontendIPConfig;
    "scale:lb.backendPool": typeof createBackendPoolConfig;
    "scale:lb.probe": typeof createProbeConfig;
    "scale:lb.rule": typeof createLoadBalancingRule;
    "scale:lb.recommendProbe": typeof recommendHealthProbe;
    "scale:appgw.definition": typeof createApplicationGateway;
    "scale:appgw.ipConfig": typeof createAppGatewayIpConfig;
    "scale:appgw.frontend": typeof createAppGatewayFrontendConfig;
    "scale:appgw.frontendPort": typeof createAppGatewayFrontendPort;
    "scale:appgw.backendPool": typeof createAppGatewayBackendPool;
    "scale:appgw.httpSetting": typeof createAppGatewayHttpSetting;
    "scale:appgw.probe": typeof createAppGatewayProbe;
    "scale:appgw.listener": typeof createAppGatewayListener;
    "scale:appgw.rule": typeof createAppGatewayRoutingRule;
    "scale:appgw.recommendSku": typeof recommendAppGatewaySku;
};
