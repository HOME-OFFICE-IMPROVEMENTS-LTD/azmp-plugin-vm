/**
 * Azure Networking Helpers Registry
 * Integrates all networking modules into the VM Plugin
 */
import { VNET_TEMPLATES, VNetTemplateKey, getVNetTemplate, getAllVNetTemplates, calculateUsableIPs, validateCIDR, isIPInCIDR } from "./vnets";
import { SUBNET_PATTERNS, SubnetPatternKey, getSubnetPattern, getAllSubnetPatterns, subnetsOverlap } from "./subnets";
import { NSG_RULES, NSG_TEMPLATES, NsgRuleKey, NsgTemplateKey, getNsgRule, getNsgTemplate, getAllNsgRules, getAllNsgTemplates, getNsgRulesByDirection, getNsgRulesByProtocol } from "./nsg";
import { LOAD_BALANCER_TEMPLATES, HEALTH_PROBES, BACKEND_POOLS, LOAD_BALANCING_RULES, LoadBalancerTemplateKey, HealthProbeKey, BackendPoolKey, LoadBalancingRuleKey, getLoadBalancerTemplate, getHealthProbe, getBackendPool, getLoadBalancingRule, getAllLoadBalancerTemplates, getAllHealthProbes, getHealthProbesByProtocol, calculateHealthCheckDuration } from "./loadbalancer";
import { APP_GATEWAY_TEMPLATES, AppGatewayTemplateKey, getAppGatewayTemplate, getAllAppGatewayTemplates } from "./appgateway";
import { BASTION_TEMPLATES, BASTION_FEATURES, BastionTemplateKey, BastionFeatureKey, getBastionTemplate, getBastionFeature, getAllBastionTemplates, isFeatureAvailable, getRecommendedScaleUnits } from "./bastion";
import { VNET_PEERING_TEMPLATES, HUB_SPOKE_TOPOLOGIES, PEERING_SCENARIOS, VNetPeeringTemplateKey, HubSpokeTopologyKey, PeeringScenarioKey, getVNetPeeringTemplate, getHubSpokeTopology, getPeeringScenario, getAllVNetPeeringTemplates, calculateMeshPeeringCount, calculateHubSpokePeeringCount } from "./peering";
/**
 * Networking Handlebars Helpers Registry
 * All helpers use the 'net:' namespace prefix
 */
export declare function getNetworkingHelpers(): Record<string, (...args: any[]) => any>;
/**
 * Get all networking helper names for registration
 */
export declare function getNetworkingHelperNames(): string[];
/**
 * Export networking modules for CLI commands
 */
export { VNET_TEMPLATES, VNetTemplateKey, getVNetTemplate, getAllVNetTemplates, calculateUsableIPs, validateCIDR, isIPInCIDR, SUBNET_PATTERNS, SubnetPatternKey, getSubnetPattern, getAllSubnetPatterns, subnetsOverlap, NSG_RULES, NSG_TEMPLATES, NsgRuleKey, NsgTemplateKey, getNsgRule, getNsgTemplate, getAllNsgRules, getAllNsgTemplates, getNsgRulesByDirection, getNsgRulesByProtocol, LOAD_BALANCER_TEMPLATES, HEALTH_PROBES, BACKEND_POOLS, LOAD_BALANCING_RULES, LoadBalancerTemplateKey, HealthProbeKey, BackendPoolKey, LoadBalancingRuleKey, getLoadBalancerTemplate, getHealthProbe, getBackendPool, getLoadBalancingRule, getAllLoadBalancerTemplates, getAllHealthProbes, getHealthProbesByProtocol, calculateHealthCheckDuration, APP_GATEWAY_TEMPLATES, AppGatewayTemplateKey, getAppGatewayTemplate, getAllAppGatewayTemplates, BASTION_TEMPLATES, BASTION_FEATURES, BastionTemplateKey, BastionFeatureKey, getBastionTemplate, getBastionFeature, getAllBastionTemplates, isFeatureAvailable, getRecommendedScaleUnits, VNET_PEERING_TEMPLATES, HUB_SPOKE_TOPOLOGIES, PEERING_SCENARIOS, VNetPeeringTemplateKey, HubSpokeTopologyKey, PeeringScenarioKey, getVNetPeeringTemplate, getHubSpokeTopology, getPeeringScenario, getAllVNetPeeringTemplates, calculateMeshPeeringCount, calculateHubSpokePeeringCount, };
