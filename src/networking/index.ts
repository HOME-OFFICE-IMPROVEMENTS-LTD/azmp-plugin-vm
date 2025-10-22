/**
 * Azure Networking Helpers Registry
 * Integrates all networking modules into the VM Plugin
 */

// Import all networking modules
import { 
  VNET_TEMPLATES, 
  VNetTemplateKey, 
  getVNetTemplate, 
  getAllVNetTemplates,
  calculateUsableIPs,
  validateCIDR,
  isIPInCIDR 
} from './vnets';

import { 
  SUBNET_PATTERNS, 
  SubnetPatternKey,
  getSubnetPattern,
  getAllSubnetPatterns,
  subnetsOverlap
} from './subnets';

import { 
  NSG_RULES, 
  NSG_TEMPLATES,
  NsgRuleKey,
  NsgTemplateKey,
  getNsgRule,
  getNsgTemplate,
  getAllNsgRules,
  getAllNsgTemplates,
  getNsgRulesByDirection,
  getNsgRulesByProtocol
} from './nsg';

import {
  LOAD_BALANCER_TEMPLATES,
  HEALTH_PROBES,
  BACKEND_POOLS,
  LOAD_BALANCING_RULES,
  LoadBalancerTemplateKey,
  HealthProbeKey,
  BackendPoolKey,
  LoadBalancingRuleKey,
  getLoadBalancerTemplate,
  getHealthProbe,
  getBackendPool,
  getLoadBalancingRule,
  getAllLoadBalancerTemplates,
  getAllHealthProbes,
  getHealthProbesByProtocol,
  calculateHealthCheckDuration
} from './loadbalancer';

import {
  APP_GATEWAY_TEMPLATES,
  AppGatewayTemplateKey,
  getAppGatewayTemplate,
  getAllAppGatewayTemplates
} from './appgateway';

import {
  BASTION_TEMPLATES,
  BASTION_FEATURES,
  BastionTemplateKey,
  BastionFeatureKey,
  getBastionTemplate,
  getBastionFeature,
  getAllBastionTemplates,
  isFeatureAvailable,
  getRecommendedScaleUnits
} from './bastion';

import {
  VNET_PEERING_TEMPLATES,
  HUB_SPOKE_TOPOLOGIES,
  PEERING_SCENARIOS,
  VNetPeeringTemplateKey,
  HubSpokeTopologyKey,
  PeeringScenarioKey,
  getVNetPeeringTemplate,
  getHubSpokeTopology,
  getPeeringScenario,
  getAllVNetPeeringTemplates,
  calculateMeshPeeringCount,
  calculateHubSpokePeeringCount
} from './peering';

/**
 * Networking Handlebars Helpers Registry
 * All helpers use the 'net:' namespace prefix
 */
export function getNetworkingHelpers(): Record<string, (...args: any[]) => any> {
  return {
    // ========================================
    // VNet Helpers (net:vnet.*)
    // ========================================

    /**
     * Get VNet template configuration
     */
    'net:vnet.template': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get VNet template name
     */
    'net:vnet.name': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template?.name || key;
    },

    /**
     * Get VNet template description
     */
    'net:vnet.description': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template?.description || '';
    },

    /**
     * Get VNet address space (first CIDR)
     */
    'net:vnet.addressSpace': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template?.addressSpace[0] || '';
    },

    /**
     * Get all VNet address spaces
     */
    'net:vnet.addressSpaces': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template ? JSON.stringify(template.addressSpace) : '[]';
    },

    /**
     * Get VNet subnets count
     */
    'net:vnet.subnetCount': (key: string): number => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template?.subnets.length || 0;
    },

    /**
     * Get VNet subnets configuration
     */
    'net:vnet.subnets': (key: string): string => {
      const template = getVNetTemplate(key as VNetTemplateKey);
      return template ? JSON.stringify(template.subnets, null, 2) : '[]';
    },

    /**
     * Calculate usable IPs in a CIDR block
     */
    'net:vnet.usableIPs': (cidr: string): number => {
      return calculateUsableIPs(cidr);
    },

    /**
     * Validate CIDR notation
     */
    'net:vnet.validateCIDR': (cidr: string): boolean => {
      return validateCIDR(cidr);
    },

    /**
     * Check if IP is in CIDR range
     */
    'net:vnet.ipInRange': (ip: string, cidr: string): boolean => {
      return isIPInCIDR(ip, cidr);
    },

    // ========================================
    // Subnet Helpers (net:subnet.*)
    // ========================================

    /**
     * Get subnet pattern configuration
     */
    'net:subnet.pattern': (key: string): string => {
      const pattern = getSubnetPattern(key as SubnetPatternKey);
      return pattern ? JSON.stringify(pattern, null, 2) : '{}';
    },

    /**
     * Get subnet pattern name
     */
    'net:subnet.name': (key: string): string => {
      const pattern = getSubnetPattern(key as SubnetPatternKey);
      return pattern?.name || key;
    },

    /**
     * Get subnet pattern description
     */
    'net:subnet.description': (key: string): string => {
      const pattern = getSubnetPattern(key as SubnetPatternKey);
      return pattern?.description || '';
    },

    /**
     * Get subnet address prefix
     */
    'net:subnet.addressPrefix': (key: string): string => {
      const pattern = getSubnetPattern(key as SubnetPatternKey);
      return pattern?.addressPrefix || '';
    },

    /**
     * Get subnet service endpoints
     */
    'net:subnet.serviceEndpoints': (key: string): string => {
      const pattern = getSubnetPattern(key as SubnetPatternKey);
      return pattern ? JSON.stringify(pattern.serviceEndpoints || []) : '[]';
    },

    /**
     * Check if subnets overlap
     */
    'net:subnet.overlap': (cidr1: string, cidr2: string): boolean => {
      return subnetsOverlap(cidr1, cidr2);
    },

    // ========================================
    // NSG Helpers (net:nsg.*)
    // ========================================

    /**
     * Get NSG rule configuration
     */
    'net:nsg.rule': (key: string): string => {
      const rule = getNsgRule(key as NsgRuleKey);
      return rule ? JSON.stringify(rule, null, 2) : '{}';
    },

    /**
     * Get NSG rule name
     */
    'net:nsg.ruleName': (key: string): string => {
      const rule = getNsgRule(key as NsgRuleKey);
      return rule?.name || key;
    },

    /**
     * Get NSG rule priority
     */
    'net:nsg.rulePriority': (key: string): number => {
      const rule = getNsgRule(key as NsgRuleKey);
      return rule?.priority || 1000;
    },

    /**
     * Get NSG template configuration
     */
    'net:nsg.template': (key: string): string => {
      const template = getNsgTemplate(key as NsgTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get NSG template name
     */
    'net:nsg.templateName': (key: string): string => {
      const template = getNsgTemplate(key as NsgTemplateKey);
      return template?.name || key;
    },

    /**
     * Get NSG template rules count
     */
    'net:nsg.rulesCount': (key: string): number => {
      const template = getNsgTemplate(key as NsgTemplateKey);
      return template?.rules.length || 0;
    },

    // ========================================
    // Load Balancer Helpers (net:lb.*)
    // ========================================

    /**
     * Get Load Balancer template configuration
     */
    'net:lb.template': (key: string): string => {
      const template = getLoadBalancerTemplate(key as LoadBalancerTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get Load Balancer template name
     */
    'net:lb.name': (key: string): string => {
      const template = getLoadBalancerTemplate(key as LoadBalancerTemplateKey);
      return template?.name || key;
    },

    /**
     * Get Load Balancer SKU
     */
    'net:lb.sku': (key: string): string => {
      const template = getLoadBalancerTemplate(key as LoadBalancerTemplateKey);
      return template?.sku || 'Standard';
    },

    /**
     * Check if Load Balancer is public
     */
    'net:lb.isPublic': (key: string): boolean => {
      const template = getLoadBalancerTemplate(key as LoadBalancerTemplateKey);
      return template?.isPublic || false;
    },

    /**
     * Get health probe configuration
     */
    'net:lb.healthProbe': (key: string): string => {
      const probe = getHealthProbe(key as HealthProbeKey);
      return probe ? JSON.stringify(probe, null, 2) : '{}';
    },

    /**
     * Calculate health check duration
     */
    'net:lb.healthCheckDuration': (intervalSeconds: number, probeCount: number): number => {
      return calculateHealthCheckDuration(intervalSeconds, probeCount);
    },

    // ========================================
    // Application Gateway Helpers (net:appgw.*)
    // ========================================

    /**
     * Get Application Gateway template configuration
     */
    'net:appgw.template': (key: string): string => {
      const template = getAppGatewayTemplate(key as AppGatewayTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get Application Gateway template name
     */
    'net:appgw.name': (key: string): string => {
      const template = getAppGatewayTemplate(key as AppGatewayTemplateKey);
      return template?.name || key;
    },

    /**
     * Get Application Gateway SKU
     */
    'net:appgw.sku': (key: string): string => {
      const template = getAppGatewayTemplate(key as AppGatewayTemplateKey);
      return template?.sku || 'Standard_v2';
    },

    /**
     * Check if WAF is enabled
     */
    'net:appgw.wafEnabled': (key: string): boolean => {
      const template = getAppGatewayTemplate(key as AppGatewayTemplateKey);
      return template?.enableWaf || false;
    },

    /**
     * Get Application Gateway capacity
     */
    'net:appgw.capacity': (key: string): number => {
      const template = getAppGatewayTemplate(key as AppGatewayTemplateKey);
      return template?.capacity || 2;
    },

    // ========================================
    // Bastion Helpers (net:bastion.*)
    // ========================================

    /**
     * Get Bastion template configuration
     */
    'net:bastion.template': (key: string): string => {
      const template = getBastionTemplate(key as BastionTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get Bastion template name
     */
    'net:bastion.name': (key: string): string => {
      const template = getBastionTemplate(key as BastionTemplateKey);
      return template?.name || key;
    },

    /**
     * Get Bastion SKU
     */
    'net:bastion.sku': (key: string): string => {
      const template = getBastionTemplate(key as BastionTemplateKey);
      return template?.sku || 'Standard';
    },

    /**
     * Get Bastion scale units
     */
    'net:bastion.scaleUnits': (key: string): number => {
      const template = getBastionTemplate(key as BastionTemplateKey);
      return template?.scaleUnits || 2;
    },

    /**
     * Check if Bastion feature is enabled
     */
    'net:bastion.featureEnabled': (templateKey: string, feature: string): boolean => {
      const template = getBastionTemplate(templateKey as BastionTemplateKey);
      if (!template) return false;
      
      switch (feature) {
        case 'tunneling':
          return template.enableTunneling;
        case 'ipConnect':
          return template.enableIpConnect;
        case 'shareableLink':
          return template.enableShareableLink;
        case 'fileCopy':
          return template.enableFileCopy;
        default:
          return false;
      }
    },

    /**
     * Get Bastion feature configuration
     */
    'net:bastion.feature': (key: string): string => {
      const feature = getBastionFeature(key as BastionFeatureKey);
      return feature ? JSON.stringify(feature, null, 2) : '{}';
    },

    /**
     * Check if feature is available for SKU
     */
    'net:bastion.featureAvailable': (feature: string, sku: string): boolean => {
      return isFeatureAvailable(feature as BastionFeatureKey, sku as 'Basic' | 'Standard' | 'Premium');
    },

    /**
     * Get recommended scale units
     */
    'net:bastion.recommendedScale': (sessions: number): number => {
      return getRecommendedScaleUnits(sessions);
    },

    // ========================================
    // VNet Peering Helpers (net:peering.*)
    // ========================================

    /**
     * Get VNet peering template configuration
     */
    'net:peering.template': (key: string): string => {
      const template = getVNetPeeringTemplate(key as VNetPeeringTemplateKey);
      return template ? JSON.stringify(template, null, 2) : '{}';
    },

    /**
     * Get VNet peering template name
     */
    'net:peering.name': (key: string): string => {
      const template = getVNetPeeringTemplate(key as VNetPeeringTemplateKey);
      return template?.name || key;
    },

    /**
     * Get peering topology type
     */
    'net:peering.topology': (key: string): string => {
      const template = getVNetPeeringTemplate(key as VNetPeeringTemplateKey);
      return template?.topology || 'point-to-point';
    },

    /**
     * Check if gateway transit is enabled
     */
    'net:peering.gatewayTransit': (key: string): boolean => {
      const template = getVNetPeeringTemplate(key as VNetPeeringTemplateKey);
      return template?.allowGatewayTransit || false;
    },

    /**
     * Get hub-and-spoke topology
     */
    'net:peering.hubSpoke': (key: string): string => {
      const topology = getHubSpokeTopology(key as HubSpokeTopologyKey);
      return topology ? JSON.stringify(topology, null, 2) : '{}';
    },

    /**
     * Get peering scenario
     */
    'net:peering.scenario': (key: string): string => {
      const scenario = getPeeringScenario(key as PeeringScenarioKey);
      return scenario ? JSON.stringify(scenario, null, 2) : '{}';
    },

    /**
     * Calculate mesh peering count
     */
    'net:peering.meshCount': (vnetCount: number): number => {
      return calculateMeshPeeringCount(vnetCount);
    },

    /**
     * Calculate hub-spoke peering count
     */
    'net:peering.hubSpokeCount': (spokeCount: number): number => {
      return calculateHubSpokePeeringCount(spokeCount);
    },

    // ========================================
    // Common Networking Helpers (net:common.*)
    // ========================================

    /**
     * Generate networking resource name
     */
    'net:common.resourceName': (baseName: string, resourceType: string, suffix?: string): string => {
      const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const cleanType = resourceType.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const parts = [cleanBase, cleanType];
      
      if (suffix) {
        const cleanSuffix = suffix.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        parts.push(cleanSuffix);
      }
      
      return parts.join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    },

    /**
     * Generate VNet resource name
     */
    'net:common.vnetName': (baseName: string): string => {
      return `vnet-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate subnet resource name
     */
    'net:common.subnetName': (baseName: string, tier?: string): string => {
      const parts = ['subnet', baseName];
      if (tier) parts.push(tier);
      return parts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate NSG resource name
     */
    'net:common.nsgName': (baseName: string): string => {
      return `nsg-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate Load Balancer resource name
     */
    'net:common.lbName': (baseName: string): string => {
      return `lb-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate Application Gateway resource name
     */
    'net:common.appgwName': (baseName: string): string => {
      return `appgw-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate Bastion resource name
     */
    'net:common.bastionName': (baseName: string): string => {
      return `bastion-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    },

    /**
     * Generate peering resource name
     */
    'net:common.peeringName': (sourceVNet: string, targetVNet: string): string => {
      return `peer-${sourceVNet}-to-${targetVNet}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
  };
}

/**
 * Get all networking helper names for registration
 */
export function getNetworkingHelperNames(): string[] {
  return Object.keys(getNetworkingHelpers());
}

/**
 * Export networking modules for CLI commands
 */
export {
  // VNet exports
  VNET_TEMPLATES,
  VNetTemplateKey,
  getVNetTemplate,
  getAllVNetTemplates,
  calculateUsableIPs,
  validateCIDR,
  isIPInCIDR,

  // Subnet exports
  SUBNET_PATTERNS,
  SubnetPatternKey,
  getSubnetPattern,
  getAllSubnetPatterns,
  subnetsOverlap,

  // NSG exports
  NSG_RULES,
  NSG_TEMPLATES,
  NsgRuleKey,
  NsgTemplateKey,
  getNsgRule,
  getNsgTemplate,
  getAllNsgRules,
  getAllNsgTemplates,
  getNsgRulesByDirection,
  getNsgRulesByProtocol,

  // Load Balancer exports
  LOAD_BALANCER_TEMPLATES,
  HEALTH_PROBES,
  BACKEND_POOLS,
  LOAD_BALANCING_RULES,
  LoadBalancerTemplateKey,
  HealthProbeKey,
  BackendPoolKey,
  LoadBalancingRuleKey,
  getLoadBalancerTemplate,
  getHealthProbe,
  getBackendPool,
  getLoadBalancingRule,
  getAllLoadBalancerTemplates,
  getAllHealthProbes,
  getHealthProbesByProtocol,
  calculateHealthCheckDuration,

  // Application Gateway exports
  APP_GATEWAY_TEMPLATES,
  AppGatewayTemplateKey,
  getAppGatewayTemplate,
  getAllAppGatewayTemplates,

  // Bastion exports
  BASTION_TEMPLATES,
  BASTION_FEATURES,
  BastionTemplateKey,
  BastionFeatureKey,
  getBastionTemplate,
  getBastionFeature,
  getAllBastionTemplates,
  isFeatureAvailable,
  getRecommendedScaleUnits,

  // Peering exports
  VNET_PEERING_TEMPLATES,
  HUB_SPOKE_TOPOLOGIES,
  PEERING_SCENARIOS,
  VNetPeeringTemplateKey,
  HubSpokeTopologyKey,
  PeeringScenarioKey,
  getVNetPeeringTemplate,
  getHubSpokeTopology,
  getPeeringScenario,
  getAllVNetPeeringTemplates,
  calculateMeshPeeringCount,
  calculateHubSpokePeeringCount
};