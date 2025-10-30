/**
 * Scaling Module - Multi-region Deployment Helpers
 *
 * Provides helpers for configuring global load balancing and
 * cross-region deployment strategies including Traffic Manager profiles,
 * regional endpoint definitions, and failover playbooks.
 *
 * @module scaling/multiregion
 */
export type TrafficRoutingMethod = "Priority" | "Performance" | "Weighted" | "Geographic" | "MultiValue" | "Subnet";
export type TrafficManagerMonitorProtocol = "HTTP" | "HTTPS" | "TCP";
/**
 * Traffic Manager endpoint configuration
 */
export interface TrafficManagerEndpointOptions {
    name: string;
    type: "AzureEndpoint" | "ExternalEndpoint" | "NestedEndpoints";
    targetResourceId?: string;
    target?: string;
    endpointStatus?: "Enabled" | "Disabled";
    priority?: number;
    weight?: number;
    location?: string;
    geoMapping?: string[];
    minChildEndpoints?: number;
    endpointLocation?: string;
}
/**
 * Traffic Manager profile configuration
 */
export interface TrafficManagerProfileOptions {
    name: string;
    dnsName: string;
    routingMethod?: TrafficRoutingMethod;
    ttl?: number;
    monitor?: {
        protocol?: TrafficManagerMonitorProtocol;
        port?: number;
        path?: string;
        intervalInSeconds?: number;
        timeoutInSeconds?: number;
        toleratedNumberOfFailures?: number;
    };
    endpoints?: TrafficManagerEndpointOptions[];
    trafficViewEnabled?: boolean;
    profileStatus?: "Enabled" | "Disabled";
    tags?: Record<string, string>;
}
/**
 * Multi-region deployment plan entry
 */
export interface RegionDeployment {
    region: string;
    role: "Primary" | "Secondary" | "Tertiary";
    vmssName?: string;
    trafficManagerEndpointName?: string;
    baselineCapacity?: number;
    maxCapacity?: number;
    failoverPriority?: number;
}
export interface MultiRegionDeploymentPlan {
    applicationName: string;
    trafficManagerProfile: string;
    regions: RegionDeployment[];
    replication: {
        enabled: boolean;
        recoveryVaultName?: string;
        replicationPolicyName?: string;
    };
    monitoring: {
        applicationInsightsResourceId?: string;
        actionGroupIds?: string[];
    };
}
/**
 * Failover playbook step
 */
export interface FailoverStep {
    name: string;
    description: string;
    automation?: {
        runbookName?: string;
        logicAppResourceId?: string;
    };
    validation?: string[];
}
export interface FailoverPlanOptions {
    name: string;
    primaryRegion: string;
    secondaryRegion: string;
    detectionThresholdMinutes?: number;
    steps: FailoverStep[];
}
/**
 * Create Traffic Manager profile resource definition
 */
export declare function createTrafficManagerProfile(options: TrafficManagerProfileOptions): Record<string, unknown>;
/**
 * Create Traffic Manager endpoint object used inside profile definitions
 */
export declare function createTrafficManagerEndpointConfig(options: TrafficManagerEndpointOptions): Record<string, unknown>;
/**
 * Create a high-level multi-region deployment plan
 */
export declare function createMultiRegionDeploymentPlan(plan: MultiRegionDeploymentPlan): Record<string, unknown>;
/**
 * Create a structured failover plan including operational steps
 */
export declare function createFailoverPlan(options: FailoverPlanOptions): Record<string, unknown>;
/**
 * Exported helper map for registration
 */
export declare const multiregionHelpers: {
    "scale:multiregion.profile": typeof createTrafficManagerProfile;
    "scale:multiregion.endpoint": typeof createTrafficManagerEndpointConfig;
    "scale:multiregion.deployment": typeof createMultiRegionDeploymentPlan;
    "scale:multiregion.failover": typeof createFailoverPlan;
};
