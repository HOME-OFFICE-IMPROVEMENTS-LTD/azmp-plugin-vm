"use strict";
/**
 * Scaling Module - Multi-region Deployment Helpers
 *
 * Provides helpers for configuring global load balancing and
 * cross-region deployment strategies including Traffic Manager profiles,
 * regional endpoint definitions, and failover playbooks.
 *
 * @module scaling/multiregion
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiregionHelpers = void 0;
exports.createTrafficManagerProfile = createTrafficManagerProfile;
exports.createTrafficManagerEndpointConfig = createTrafficManagerEndpointConfig;
exports.createMultiRegionDeploymentPlan = createMultiRegionDeploymentPlan;
exports.createFailoverPlan = createFailoverPlan;
/**
 * Create Traffic Manager profile resource definition
 */
function createTrafficManagerProfile(options) {
    if (!options.name) {
        throw new Error("Traffic Manager profile requires a name");
    }
    if (!options.dnsName) {
        throw new Error("Traffic Manager profile requires a dnsName");
    }
    const routingMethod = options.routingMethod ?? "Priority";
    const monitorConfig = {
        protocol: options.monitor?.protocol ?? "HTTPS",
        port: options.monitor?.port ?? 443,
        path: options.monitor?.path ?? "/",
        intervalInSeconds: options.monitor?.intervalInSeconds ?? 30,
        timeoutInSeconds: options.monitor?.timeoutInSeconds ?? 10,
        toleratedNumberOfFailures: options.monitor?.toleratedNumberOfFailures ?? 3,
    };
    const profile = {
        type: "Microsoft.Network/trafficManagerProfiles",
        apiVersion: "2018-04-01",
        name: options.name,
        location: "global",
        properties: {
            profileStatus: options.profileStatus ?? "Enabled",
            trafficRoutingMethod: routingMethod,
            trafficViewEnrollmentStatus: options.trafficViewEnabled
                ? "Enabled"
                : "Disabled",
            dnsConfig: {
                relativeName: options.dnsName,
                ttl: options.ttl ?? 30,
            },
            monitorConfig,
            endpoints: (options.endpoints ?? []).map(createTrafficManagerEndpointConfig),
        },
    };
    if (options.tags) {
        profile.tags = options.tags;
    }
    return profile;
}
/**
 * Create Traffic Manager endpoint object used inside profile definitions
 */
function createTrafficManagerEndpointConfig(options) {
    if (!options.name) {
        throw new Error("Traffic Manager endpoint requires a name");
    }
    const endpoint = {
        name: options.name,
        type: `Microsoft.Network/trafficManagerProfiles/${options.type}`,
        properties: {
            endpointStatus: options.endpointStatus ?? "Enabled",
            priority: options.priority ?? 1,
            weight: options.weight ?? 1,
        },
    };
    if (options.type === "AzureEndpoint") {
        if (!options.targetResourceId) {
            throw new Error("Azure endpoints require a targetResourceId");
        }
        endpoint.properties.targetResourceId = options.targetResourceId;
    }
    else if (options.target) {
        endpoint.properties.target = options.target;
    }
    if (options.location) {
        endpoint.properties.endpointLocation = options.location;
    }
    else if (options.endpointLocation) {
        endpoint.properties.endpointLocation = options.endpointLocation;
    }
    if (options.geoMapping && options.geoMapping.length > 0) {
        endpoint.properties.geoMapping = options.geoMapping;
    }
    if (typeof options.minChildEndpoints === "number") {
        endpoint.properties.minChildEndpoints = options.minChildEndpoints;
    }
    return endpoint;
}
/**
 * Create a high-level multi-region deployment plan
 */
function createMultiRegionDeploymentPlan(plan) {
    if (!plan.applicationName) {
        throw new Error("Multi-region deployment plan requires an applicationName");
    }
    if (!plan.trafficManagerProfile) {
        throw new Error("Multi-region deployment plan requires a trafficManagerProfile");
    }
    if (!plan.regions || plan.regions.length < 2) {
        throw new Error("Multi-region deployment plan requires at least two regions");
    }
    const primaryRegions = plan.regions.filter((region) => region.role === "Primary");
    if (primaryRegions.length !== 1) {
        throw new Error("Multi-region deployment plan must have exactly one primary region");
    }
    return {
        applicationName: plan.applicationName,
        trafficManagerProfile: plan.trafficManagerProfile,
        regions: plan.regions.map((region) => ({
            region: region.region,
            role: region.role,
            vmssName: region.vmssName,
            trafficManagerEndpointName: region.trafficManagerEndpointName,
            baselineCapacity: region.baselineCapacity ?? 2,
            maxCapacity: region.maxCapacity ?? region.baselineCapacity ?? 2,
            failoverPriority: region.failoverPriority ?? (region.role === "Primary" ? 1 : 100),
        })),
        replication: {
            enabled: plan.replication.enabled,
            recoveryVaultName: plan.replication.recoveryVaultName,
            replicationPolicyName: plan.replication.replicationPolicyName,
        },
        monitoring: {
            applicationInsightsResourceId: plan.monitoring.applicationInsightsResourceId,
            actionGroupIds: plan.monitoring.actionGroupIds ?? [],
        },
    };
}
/**
 * Create a structured failover plan including operational steps
 */
function createFailoverPlan(options) {
    if (!options.name) {
        throw new Error("Failover plan requires a name");
    }
    if (!options.primaryRegion || !options.secondaryRegion) {
        throw new Error("Failover plan requires primaryRegion and secondaryRegion");
    }
    if (!options.steps || options.steps.length === 0) {
        throw new Error("Failover plan requires one or more steps");
    }
    return {
        name: options.name,
        detectionThresholdMinutes: options.detectionThresholdMinutes ?? 5,
        primaryRegion: options.primaryRegion,
        secondaryRegion: options.secondaryRegion,
        steps: options.steps.map((step) => ({
            name: step.name,
            description: step.description,
            automation: step.automation,
            validation: step.validation ?? [],
        })),
    };
}
/**
 * Exported helper map for registration
 */
exports.multiregionHelpers = {
    "scale:multiregion.profile": createTrafficManagerProfile,
    "scale:multiregion.endpoint": createTrafficManagerEndpointConfig,
    "scale:multiregion.deployment": createMultiRegionDeploymentPlan,
    "scale:multiregion.failover": createFailoverPlan,
};
