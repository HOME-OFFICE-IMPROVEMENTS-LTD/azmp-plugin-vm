"use strict";
/**
 * Azure Networking Helpers Registry
 * Integrates all networking modules into the VM Plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHubSpokePeeringCount = exports.calculateMeshPeeringCount = exports.getAllVNetPeeringTemplates = exports.getPeeringScenario = exports.getHubSpokeTopology = exports.getVNetPeeringTemplate = exports.PEERING_SCENARIOS = exports.HUB_SPOKE_TOPOLOGIES = exports.VNET_PEERING_TEMPLATES = exports.getRecommendedScaleUnits = exports.isFeatureAvailable = exports.getAllBastionTemplates = exports.getBastionFeature = exports.getBastionTemplate = exports.BASTION_FEATURES = exports.BASTION_TEMPLATES = exports.getAllAppGatewayTemplates = exports.getAppGatewayTemplate = exports.APP_GATEWAY_TEMPLATES = exports.calculateHealthCheckDuration = exports.getHealthProbesByProtocol = exports.getAllHealthProbes = exports.getAllLoadBalancerTemplates = exports.getLoadBalancingRule = exports.getBackendPool = exports.getHealthProbe = exports.getLoadBalancerTemplate = exports.LOAD_BALANCING_RULES = exports.BACKEND_POOLS = exports.HEALTH_PROBES = exports.LOAD_BALANCER_TEMPLATES = exports.getNsgRulesByProtocol = exports.getNsgRulesByDirection = exports.getAllNsgTemplates = exports.getAllNsgRules = exports.getNsgTemplate = exports.getNsgRule = exports.NSG_TEMPLATES = exports.NSG_RULES = exports.subnetsOverlap = exports.getAllSubnetPatterns = exports.getSubnetPattern = exports.SUBNET_PATTERNS = exports.isIPInCIDR = exports.validateCIDR = exports.calculateUsableIPs = exports.getAllVNetTemplates = exports.getVNetTemplate = exports.VNET_TEMPLATES = void 0;
exports.getNetworkingHelpers = getNetworkingHelpers;
exports.getNetworkingHelperNames = getNetworkingHelperNames;
// Import all networking modules
const vnets_1 = require("./vnets");
Object.defineProperty(exports, "VNET_TEMPLATES", { enumerable: true, get: function () { return vnets_1.VNET_TEMPLATES; } });
Object.defineProperty(exports, "getVNetTemplate", { enumerable: true, get: function () { return vnets_1.getVNetTemplate; } });
Object.defineProperty(exports, "getAllVNetTemplates", { enumerable: true, get: function () { return vnets_1.getAllVNetTemplates; } });
Object.defineProperty(exports, "calculateUsableIPs", { enumerable: true, get: function () { return vnets_1.calculateUsableIPs; } });
Object.defineProperty(exports, "validateCIDR", { enumerable: true, get: function () { return vnets_1.validateCIDR; } });
Object.defineProperty(exports, "isIPInCIDR", { enumerable: true, get: function () { return vnets_1.isIPInCIDR; } });
const subnets_1 = require("./subnets");
Object.defineProperty(exports, "SUBNET_PATTERNS", { enumerable: true, get: function () { return subnets_1.SUBNET_PATTERNS; } });
Object.defineProperty(exports, "getSubnetPattern", { enumerable: true, get: function () { return subnets_1.getSubnetPattern; } });
Object.defineProperty(exports, "getAllSubnetPatterns", { enumerable: true, get: function () { return subnets_1.getAllSubnetPatterns; } });
Object.defineProperty(exports, "subnetsOverlap", { enumerable: true, get: function () { return subnets_1.subnetsOverlap; } });
const nsg_1 = require("./nsg");
Object.defineProperty(exports, "NSG_RULES", { enumerable: true, get: function () { return nsg_1.NSG_RULES; } });
Object.defineProperty(exports, "NSG_TEMPLATES", { enumerable: true, get: function () { return nsg_1.NSG_TEMPLATES; } });
Object.defineProperty(exports, "getNsgRule", { enumerable: true, get: function () { return nsg_1.getNsgRule; } });
Object.defineProperty(exports, "getNsgTemplate", { enumerable: true, get: function () { return nsg_1.getNsgTemplate; } });
Object.defineProperty(exports, "getAllNsgRules", { enumerable: true, get: function () { return nsg_1.getAllNsgRules; } });
Object.defineProperty(exports, "getAllNsgTemplates", { enumerable: true, get: function () { return nsg_1.getAllNsgTemplates; } });
Object.defineProperty(exports, "getNsgRulesByDirection", { enumerable: true, get: function () { return nsg_1.getNsgRulesByDirection; } });
Object.defineProperty(exports, "getNsgRulesByProtocol", { enumerable: true, get: function () { return nsg_1.getNsgRulesByProtocol; } });
const loadbalancer_1 = require("./loadbalancer");
Object.defineProperty(exports, "LOAD_BALANCER_TEMPLATES", { enumerable: true, get: function () { return loadbalancer_1.LOAD_BALANCER_TEMPLATES; } });
Object.defineProperty(exports, "HEALTH_PROBES", { enumerable: true, get: function () { return loadbalancer_1.HEALTH_PROBES; } });
Object.defineProperty(exports, "BACKEND_POOLS", { enumerable: true, get: function () { return loadbalancer_1.BACKEND_POOLS; } });
Object.defineProperty(exports, "LOAD_BALANCING_RULES", { enumerable: true, get: function () { return loadbalancer_1.LOAD_BALANCING_RULES; } });
Object.defineProperty(exports, "getLoadBalancerTemplate", { enumerable: true, get: function () { return loadbalancer_1.getLoadBalancerTemplate; } });
Object.defineProperty(exports, "getHealthProbe", { enumerable: true, get: function () { return loadbalancer_1.getHealthProbe; } });
Object.defineProperty(exports, "getBackendPool", { enumerable: true, get: function () { return loadbalancer_1.getBackendPool; } });
Object.defineProperty(exports, "getLoadBalancingRule", { enumerable: true, get: function () { return loadbalancer_1.getLoadBalancingRule; } });
Object.defineProperty(exports, "getAllLoadBalancerTemplates", { enumerable: true, get: function () { return loadbalancer_1.getAllLoadBalancerTemplates; } });
Object.defineProperty(exports, "getAllHealthProbes", { enumerable: true, get: function () { return loadbalancer_1.getAllHealthProbes; } });
Object.defineProperty(exports, "getHealthProbesByProtocol", { enumerable: true, get: function () { return loadbalancer_1.getHealthProbesByProtocol; } });
Object.defineProperty(exports, "calculateHealthCheckDuration", { enumerable: true, get: function () { return loadbalancer_1.calculateHealthCheckDuration; } });
const appgateway_1 = require("./appgateway");
Object.defineProperty(exports, "APP_GATEWAY_TEMPLATES", { enumerable: true, get: function () { return appgateway_1.APP_GATEWAY_TEMPLATES; } });
Object.defineProperty(exports, "getAppGatewayTemplate", { enumerable: true, get: function () { return appgateway_1.getAppGatewayTemplate; } });
Object.defineProperty(exports, "getAllAppGatewayTemplates", { enumerable: true, get: function () { return appgateway_1.getAllAppGatewayTemplates; } });
const bastion_1 = require("./bastion");
Object.defineProperty(exports, "BASTION_TEMPLATES", { enumerable: true, get: function () { return bastion_1.BASTION_TEMPLATES; } });
Object.defineProperty(exports, "BASTION_FEATURES", { enumerable: true, get: function () { return bastion_1.BASTION_FEATURES; } });
Object.defineProperty(exports, "getBastionTemplate", { enumerable: true, get: function () { return bastion_1.getBastionTemplate; } });
Object.defineProperty(exports, "getBastionFeature", { enumerable: true, get: function () { return bastion_1.getBastionFeature; } });
Object.defineProperty(exports, "getAllBastionTemplates", { enumerable: true, get: function () { return bastion_1.getAllBastionTemplates; } });
Object.defineProperty(exports, "isFeatureAvailable", { enumerable: true, get: function () { return bastion_1.isFeatureAvailable; } });
Object.defineProperty(exports, "getRecommendedScaleUnits", { enumerable: true, get: function () { return bastion_1.getRecommendedScaleUnits; } });
const peering_1 = require("./peering");
Object.defineProperty(exports, "VNET_PEERING_TEMPLATES", { enumerable: true, get: function () { return peering_1.VNET_PEERING_TEMPLATES; } });
Object.defineProperty(exports, "HUB_SPOKE_TOPOLOGIES", { enumerable: true, get: function () { return peering_1.HUB_SPOKE_TOPOLOGIES; } });
Object.defineProperty(exports, "PEERING_SCENARIOS", { enumerable: true, get: function () { return peering_1.PEERING_SCENARIOS; } });
Object.defineProperty(exports, "getVNetPeeringTemplate", { enumerable: true, get: function () { return peering_1.getVNetPeeringTemplate; } });
Object.defineProperty(exports, "getHubSpokeTopology", { enumerable: true, get: function () { return peering_1.getHubSpokeTopology; } });
Object.defineProperty(exports, "getPeeringScenario", { enumerable: true, get: function () { return peering_1.getPeeringScenario; } });
Object.defineProperty(exports, "getAllVNetPeeringTemplates", { enumerable: true, get: function () { return peering_1.getAllVNetPeeringTemplates; } });
Object.defineProperty(exports, "calculateMeshPeeringCount", { enumerable: true, get: function () { return peering_1.calculateMeshPeeringCount; } });
Object.defineProperty(exports, "calculateHubSpokePeeringCount", { enumerable: true, get: function () { return peering_1.calculateHubSpokePeeringCount; } });
/**
 * Networking Handlebars Helpers Registry
 * All helpers use the 'net:' namespace prefix
 */
function getNetworkingHelpers() {
    return {
        // ========================================
        // VNet Helpers (net:vnet.*)
        // ========================================
        /**
         * Get VNet template configuration
         */
        "net:vnet.template": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get VNet template name
         */
        "net:vnet.name": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get VNet template description
         */
        "net:vnet.description": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template?.description || "";
        },
        /**
         * Get VNet address space (first CIDR)
         */
        "net:vnet.addressSpace": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template?.addressSpace[0] || "";
        },
        /**
         * Get all VNet address spaces
         */
        "net:vnet.addressSpaces": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template ? JSON.stringify(template.addressSpace) : "[]";
        },
        /**
         * Get VNet subnets count
         */
        "net:vnet.subnetCount": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template?.subnets.length || 0;
        },
        /**
         * Get VNet subnets configuration
         */
        "net:vnet.subnets": (key) => {
            const template = (0, vnets_1.getVNetTemplate)(key);
            return template ? JSON.stringify(template.subnets, null, 2) : "[]";
        },
        /**
         * Calculate usable IPs in a CIDR block
         */
        "net:vnet.usableIPs": (cidr) => {
            return (0, vnets_1.calculateUsableIPs)(cidr);
        },
        /**
         * Validate CIDR notation
         */
        "net:vnet.validateCIDR": (cidr) => {
            return (0, vnets_1.validateCIDR)(cidr);
        },
        /**
         * Check if IP is in CIDR range
         */
        "net:vnet.ipInRange": (ip, cidr) => {
            return (0, vnets_1.isIPInCIDR)(ip, cidr);
        },
        // ========================================
        // Subnet Helpers (net:subnet.*)
        // ========================================
        /**
         * Get subnet pattern configuration
         */
        "net:subnet.pattern": (key) => {
            const pattern = (0, subnets_1.getSubnetPattern)(key);
            return pattern ? JSON.stringify(pattern, null, 2) : "{}";
        },
        /**
         * Get subnet pattern name
         */
        "net:subnet.name": (key) => {
            const pattern = (0, subnets_1.getSubnetPattern)(key);
            return pattern?.name || key;
        },
        /**
         * Get subnet pattern description
         */
        "net:subnet.description": (key) => {
            const pattern = (0, subnets_1.getSubnetPattern)(key);
            return pattern?.description || "";
        },
        /**
         * Get subnet address prefix
         */
        "net:subnet.addressPrefix": (key) => {
            const pattern = (0, subnets_1.getSubnetPattern)(key);
            return pattern?.addressPrefix || "";
        },
        /**
         * Get subnet service endpoints
         */
        "net:subnet.serviceEndpoints": (key) => {
            const pattern = (0, subnets_1.getSubnetPattern)(key);
            return pattern ? JSON.stringify(pattern.serviceEndpoints || []) : "[]";
        },
        /**
         * Check if subnets overlap
         */
        "net:subnet.overlap": (cidr1, cidr2) => {
            return (0, subnets_1.subnetsOverlap)(cidr1, cidr2);
        },
        // ========================================
        // NSG Helpers (net:nsg.*)
        // ========================================
        /**
         * Get NSG rule configuration
         */
        "net:nsg.rule": (key) => {
            const rule = (0, nsg_1.getNsgRule)(key);
            return rule ? JSON.stringify(rule, null, 2) : "{}";
        },
        /**
         * Get NSG rule name
         */
        "net:nsg.ruleName": (key) => {
            const rule = (0, nsg_1.getNsgRule)(key);
            return rule?.name || key;
        },
        /**
         * Get NSG rule priority
         */
        "net:nsg.rulePriority": (key) => {
            const rule = (0, nsg_1.getNsgRule)(key);
            return rule?.priority || 1000;
        },
        /**
         * Get NSG template configuration
         */
        "net:nsg.template": (key) => {
            const template = (0, nsg_1.getNsgTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get NSG template name
         */
        "net:nsg.templateName": (key) => {
            const template = (0, nsg_1.getNsgTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get NSG template rules count
         */
        "net:nsg.rulesCount": (key) => {
            const template = (0, nsg_1.getNsgTemplate)(key);
            return template?.rules.length || 0;
        },
        // ========================================
        // Load Balancer Helpers (net:lb.*)
        // ========================================
        /**
         * Get Load Balancer template configuration
         */
        "net:lb.template": (key) => {
            const template = (0, loadbalancer_1.getLoadBalancerTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get Load Balancer template name
         */
        "net:lb.name": (key) => {
            const template = (0, loadbalancer_1.getLoadBalancerTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get Load Balancer SKU
         */
        "net:lb.sku": (key) => {
            const template = (0, loadbalancer_1.getLoadBalancerTemplate)(key);
            return template?.sku || "Standard";
        },
        /**
         * Check if Load Balancer is public
         */
        "net:lb.isPublic": (key) => {
            const template = (0, loadbalancer_1.getLoadBalancerTemplate)(key);
            return template?.isPublic || false;
        },
        /**
         * Get health probe configuration
         */
        "net:lb.healthProbe": (key) => {
            const probe = (0, loadbalancer_1.getHealthProbe)(key);
            return probe ? JSON.stringify(probe, null, 2) : "{}";
        },
        /**
         * Calculate health check duration
         */
        "net:lb.healthCheckDuration": (intervalSeconds, probeCount) => {
            return (0, loadbalancer_1.calculateHealthCheckDuration)(intervalSeconds, probeCount);
        },
        // ========================================
        // Application Gateway Helpers (net:appgw.*)
        // ========================================
        /**
         * Get Application Gateway template configuration
         */
        "net:appgw.template": (key) => {
            const template = (0, appgateway_1.getAppGatewayTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get Application Gateway template name
         */
        "net:appgw.name": (key) => {
            const template = (0, appgateway_1.getAppGatewayTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get Application Gateway SKU
         */
        "net:appgw.sku": (key) => {
            const template = (0, appgateway_1.getAppGatewayTemplate)(key);
            return template?.sku || "Standard_v2";
        },
        /**
         * Check if WAF is enabled
         */
        "net:appgw.wafEnabled": (key) => {
            const template = (0, appgateway_1.getAppGatewayTemplate)(key);
            return template?.enableWaf || false;
        },
        /**
         * Get Application Gateway capacity
         */
        "net:appgw.capacity": (key) => {
            const template = (0, appgateway_1.getAppGatewayTemplate)(key);
            return template?.capacity || 2;
        },
        // ========================================
        // Bastion Helpers (net:bastion.*)
        // ========================================
        /**
         * Get Bastion template configuration
         */
        "net:bastion.template": (key) => {
            const template = (0, bastion_1.getBastionTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get Bastion template name
         */
        "net:bastion.name": (key) => {
            const template = (0, bastion_1.getBastionTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get Bastion SKU
         */
        "net:bastion.sku": (key) => {
            const template = (0, bastion_1.getBastionTemplate)(key);
            return template?.sku || "Standard";
        },
        /**
         * Get Bastion scale units
         */
        "net:bastion.scaleUnits": (key) => {
            const template = (0, bastion_1.getBastionTemplate)(key);
            return template?.scaleUnits || 2;
        },
        /**
         * Check if Bastion feature is enabled
         */
        "net:bastion.featureEnabled": (templateKey, feature) => {
            const template = (0, bastion_1.getBastionTemplate)(templateKey);
            if (!template)
                return false;
            switch (feature) {
                case "tunneling":
                    return template.enableTunneling;
                case "ipConnect":
                    return template.enableIpConnect;
                case "shareableLink":
                    return template.enableShareableLink;
                case "fileCopy":
                    return template.enableFileCopy;
                default:
                    return false;
            }
        },
        /**
         * Get Bastion feature configuration
         */
        "net:bastion.feature": (key) => {
            const feature = (0, bastion_1.getBastionFeature)(key);
            return feature ? JSON.stringify(feature, null, 2) : "{}";
        },
        /**
         * Check if feature is available for SKU
         */
        "net:bastion.featureAvailable": (feature, sku) => {
            return (0, bastion_1.isFeatureAvailable)(feature, sku);
        },
        /**
         * Get recommended scale units
         */
        "net:bastion.recommendedScale": (sessions) => {
            return (0, bastion_1.getRecommendedScaleUnits)(sessions);
        },
        // ========================================
        // VNet Peering Helpers (net:peering.*)
        // ========================================
        /**
         * Get VNet peering template configuration
         */
        "net:peering.template": (key) => {
            const template = (0, peering_1.getVNetPeeringTemplate)(key);
            return template ? JSON.stringify(template, null, 2) : "{}";
        },
        /**
         * Get VNet peering template name
         */
        "net:peering.name": (key) => {
            const template = (0, peering_1.getVNetPeeringTemplate)(key);
            return template?.name || key;
        },
        /**
         * Get peering topology type
         */
        "net:peering.topology": (key) => {
            const template = (0, peering_1.getVNetPeeringTemplate)(key);
            return template?.topology || "point-to-point";
        },
        /**
         * Check if gateway transit is enabled
         */
        "net:peering.gatewayTransit": (key) => {
            const template = (0, peering_1.getVNetPeeringTemplate)(key);
            return template?.allowGatewayTransit || false;
        },
        /**
         * Get hub-and-spoke topology
         */
        "net:peering.hubSpoke": (key) => {
            const topology = (0, peering_1.getHubSpokeTopology)(key);
            return topology ? JSON.stringify(topology, null, 2) : "{}";
        },
        /**
         * Get peering scenario
         */
        "net:peering.scenario": (key) => {
            const scenario = (0, peering_1.getPeeringScenario)(key);
            return scenario ? JSON.stringify(scenario, null, 2) : "{}";
        },
        /**
         * Calculate mesh peering count
         */
        "net:peering.meshCount": (vnetCount) => {
            return (0, peering_1.calculateMeshPeeringCount)(vnetCount);
        },
        /**
         * Calculate hub-spoke peering count
         */
        "net:peering.hubSpokeCount": (spokeCount) => {
            return (0, peering_1.calculateHubSpokePeeringCount)(spokeCount);
        },
        // ========================================
        // Common Networking Helpers (net:common.*)
        // ========================================
        /**
         * Generate networking resource name
         */
        "net:common.resourceName": (baseName, resourceType, suffix) => {
            const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
            const cleanType = resourceType.toLowerCase().replace(/[^a-z0-9-]/g, "-");
            const parts = [cleanBase, cleanType];
            if (suffix) {
                const cleanSuffix = suffix.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                parts.push(cleanSuffix);
            }
            return parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        },
        /**
         * Generate VNet resource name
         */
        "net:common.vnetName": (baseName) => {
            return `vnet-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate subnet resource name
         */
        "net:common.subnetName": (baseName, tier) => {
            const parts = ["subnet", baseName];
            if (tier)
                parts.push(tier);
            return parts
                .join("-")
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate NSG resource name
         */
        "net:common.nsgName": (baseName) => {
            return `nsg-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate Load Balancer resource name
         */
        "net:common.lbName": (baseName) => {
            return `lb-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate Application Gateway resource name
         */
        "net:common.appgwName": (baseName) => {
            return `appgw-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate Bastion resource name
         */
        "net:common.bastionName": (baseName) => {
            return `bastion-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        },
        /**
         * Generate peering resource name
         */
        "net:common.peeringName": (sourceVNet, targetVNet) => {
            return `peer-${sourceVNet}-to-${targetVNet}`
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-");
        },
    };
}
/**
 * Get all networking helper names for registration
 */
function getNetworkingHelperNames() {
    return Object.keys(getNetworkingHelpers());
}
