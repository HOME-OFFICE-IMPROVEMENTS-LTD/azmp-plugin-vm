/**
 * Scaling Module
 *
 * Provides Handlebars helpers for advanced scaling scenarios including
 * Virtual Machine Scale Sets and auto-scaling policies.
 *
 * @module scaling
 */
/**
 * Combined scaling helpers map
 */
export declare const scalingHelpers: {
    "scale:lb.definition": typeof import("./loadbalancing").createLoadBalancer;
    "scale:lb.frontend": typeof import("./loadbalancing").createFrontendIPConfig;
    "scale:lb.backendPool": typeof import("./loadbalancing").createBackendPoolConfig;
    "scale:lb.probe": typeof import("./loadbalancing").createProbeConfig;
    "scale:lb.rule": typeof import("./loadbalancing").createLoadBalancingRule;
    "scale:lb.recommendProbe": typeof import("./loadbalancing").recommendHealthProbe;
    "scale:appgw.definition": typeof import("./loadbalancing").createApplicationGateway;
    "scale:appgw.ipConfig": typeof import("./loadbalancing").createAppGatewayIpConfig;
    "scale:appgw.frontend": typeof import("./loadbalancing").createAppGatewayFrontendConfig;
    "scale:appgw.frontendPort": typeof import("./loadbalancing").createAppGatewayFrontendPort;
    "scale:appgw.backendPool": typeof import("./loadbalancing").createAppGatewayBackendPool;
    "scale:appgw.httpSetting": typeof import("./loadbalancing").createAppGatewayHttpSetting;
    "scale:appgw.probe": typeof import("./loadbalancing").createAppGatewayProbe;
    "scale:appgw.listener": typeof import("./loadbalancing").createAppGatewayListener;
    "scale:appgw.rule": typeof import("./loadbalancing").createAppGatewayRoutingRule;
    "scale:appgw.recommendSku": typeof import("./loadbalancing").recommendAppGatewaySku;
    "scale:multiregion.profile": typeof import("./multiregion").createTrafficManagerProfile;
    "scale:multiregion.endpoint": typeof import("./multiregion").createTrafficManagerEndpointConfig;
    "scale:multiregion.deployment": typeof import("./multiregion").createMultiRegionDeploymentPlan;
    "scale:multiregion.failover": typeof import("./multiregion").createFailoverPlan;
    "scale:autoscale.policy": typeof import("./autoscale").createAutoScalePolicy;
    "scale:autoscale.metric": typeof import("./autoscale").createMetricScaleRule;
    "scale:autoscale.schedule": typeof import("./autoscale").createScheduleProfile;
    "scale:autoscale.cpu": typeof import("./autoscale").createCpuScalingPolicy;
    "scale:autoscale.businessHours": typeof import("./autoscale").createBusinessHoursSchedule;
    "scale:vmss.definition": typeof import("./vmss").createVmssDefinition;
};
/**
 * Register scaling helpers with Handlebars under the `scale:` namespace.
 */
export declare function registerScalingHelpers(): void;
export { vmssHelpers, createVmssDefinition, type VmssDefinitionOptions, type VmssOrchestrationMode, type VmssUpgradeMode, } from "./vmss";
export { autoscaleHelpers, createAutoScalePolicy, createMetricScaleRule, createScheduleProfile, createCpuScalingPolicy, createBusinessHoursSchedule, type AutoScalePolicyOptions, type MetricScaleRule, type ScheduleScaleRule, type AutoScaleProfile, type MetricName, type ScaleDirection, type TimeAggregationType, type ComparisonOperator, } from "./autoscale";
export { multiregionHelpers, createTrafficManagerProfile, createTrafficManagerEndpointConfig, createMultiRegionDeploymentPlan, createFailoverPlan, type TrafficManagerProfileOptions, type TrafficManagerEndpointOptions, type TrafficRoutingMethod, type TrafficManagerMonitorProtocol, type MultiRegionDeploymentPlan, type RegionDeployment, type FailoverPlanOptions, type FailoverStep, } from "./multiregion";
export { loadBalancingHelpers, createLoadBalancer, createFrontendIPConfig, createBackendPoolConfig, createProbeConfig, createLoadBalancingRule, recommendHealthProbe, createApplicationGateway, createAppGatewayIpConfig, createAppGatewayFrontendConfig, createAppGatewayFrontendPort, createAppGatewayBackendPool, createAppGatewayHttpSetting, createAppGatewayProbe, createAppGatewayListener, createAppGatewayRoutingRule, recommendAppGatewaySku, type LoadBalancerOptions, type FrontendIPConfig, type BackendPoolConfig, type ProbeConfig, type LoadBalancingRuleConfig, type HealthProbeRecommendation, type LoadBalancerSku, type ApplicationGatewayOptions, type AppGatewayIpConfig, type AppGatewayFrontendConfig, type AppGatewayFrontendPortConfig, type AppGatewayBackendPoolConfig, type AppGatewayHttpSettingConfig, type AppGatewayProbeConfig, type AppGatewayListenerConfig, type AppGatewayRoutingRuleConfig, type ApplicationGatewaySkuName, type ApplicationGatewayTier, } from "./loadbalancing";
