"use strict";
/**
 * Scaling Module
 *
 * Provides Handlebars helpers for advanced scaling scenarios including
 * Virtual Machine Scale Sets and auto-scaling policies.
 *
 * @module scaling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendAppGatewaySku = exports.createAppGatewayRoutingRule = exports.createAppGatewayListener = exports.createAppGatewayProbe = exports.createAppGatewayHttpSetting = exports.createAppGatewayBackendPool = exports.createAppGatewayFrontendPort = exports.createAppGatewayFrontendConfig = exports.createAppGatewayIpConfig = exports.createApplicationGateway = exports.recommendHealthProbe = exports.createLoadBalancingRule = exports.createProbeConfig = exports.createBackendPoolConfig = exports.createFrontendIPConfig = exports.createLoadBalancer = exports.loadBalancingHelpers = exports.createFailoverPlan = exports.createMultiRegionDeploymentPlan = exports.createTrafficManagerEndpointConfig = exports.createTrafficManagerProfile = exports.multiregionHelpers = exports.createBusinessHoursSchedule = exports.createCpuScalingPolicy = exports.createScheduleProfile = exports.createMetricScaleRule = exports.createAutoScalePolicy = exports.autoscaleHelpers = exports.createVmssDefinition = exports.vmssHelpers = exports.scalingHelpers = void 0;
exports.registerScalingHelpers = registerScalingHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
const vmss_1 = require("./vmss");
const autoscale_1 = require("./autoscale");
const multiregion_1 = require("./multiregion");
const loadbalancing_1 = require("./loadbalancing");
/**
 * Combined scaling helpers map
 */
exports.scalingHelpers = {
    ...vmss_1.vmssHelpers,
    ...autoscale_1.autoscaleHelpers,
    ...multiregion_1.multiregionHelpers,
    ...loadbalancing_1.loadBalancingHelpers,
};
/**
 * Register scaling helpers with Handlebars under the `scale:` namespace.
 */
function registerScalingHelpers() {
    Object.entries(exports.scalingHelpers).forEach(([name, helper]) => {
        handlebars_1.default.registerHelper(name, function (...args) {
            const result = helper(...args);
            // Return JSON for objects to keep consistent helper behavior.
            if (typeof result === "object" && result !== null) {
                return JSON.stringify(result, null, 2);
            }
            return result;
        });
    });
}
var vmss_2 = require("./vmss");
Object.defineProperty(exports, "vmssHelpers", { enumerable: true, get: function () { return vmss_2.vmssHelpers; } });
Object.defineProperty(exports, "createVmssDefinition", { enumerable: true, get: function () { return vmss_2.createVmssDefinition; } });
var autoscale_2 = require("./autoscale");
Object.defineProperty(exports, "autoscaleHelpers", { enumerable: true, get: function () { return autoscale_2.autoscaleHelpers; } });
Object.defineProperty(exports, "createAutoScalePolicy", { enumerable: true, get: function () { return autoscale_2.createAutoScalePolicy; } });
Object.defineProperty(exports, "createMetricScaleRule", { enumerable: true, get: function () { return autoscale_2.createMetricScaleRule; } });
Object.defineProperty(exports, "createScheduleProfile", { enumerable: true, get: function () { return autoscale_2.createScheduleProfile; } });
Object.defineProperty(exports, "createCpuScalingPolicy", { enumerable: true, get: function () { return autoscale_2.createCpuScalingPolicy; } });
Object.defineProperty(exports, "createBusinessHoursSchedule", { enumerable: true, get: function () { return autoscale_2.createBusinessHoursSchedule; } });
var multiregion_2 = require("./multiregion");
Object.defineProperty(exports, "multiregionHelpers", { enumerable: true, get: function () { return multiregion_2.multiregionHelpers; } });
Object.defineProperty(exports, "createTrafficManagerProfile", { enumerable: true, get: function () { return multiregion_2.createTrafficManagerProfile; } });
Object.defineProperty(exports, "createTrafficManagerEndpointConfig", { enumerable: true, get: function () { return multiregion_2.createTrafficManagerEndpointConfig; } });
Object.defineProperty(exports, "createMultiRegionDeploymentPlan", { enumerable: true, get: function () { return multiregion_2.createMultiRegionDeploymentPlan; } });
Object.defineProperty(exports, "createFailoverPlan", { enumerable: true, get: function () { return multiregion_2.createFailoverPlan; } });
var loadbalancing_2 = require("./loadbalancing");
Object.defineProperty(exports, "loadBalancingHelpers", { enumerable: true, get: function () { return loadbalancing_2.loadBalancingHelpers; } });
Object.defineProperty(exports, "createLoadBalancer", { enumerable: true, get: function () { return loadbalancing_2.createLoadBalancer; } });
Object.defineProperty(exports, "createFrontendIPConfig", { enumerable: true, get: function () { return loadbalancing_2.createFrontendIPConfig; } });
Object.defineProperty(exports, "createBackendPoolConfig", { enumerable: true, get: function () { return loadbalancing_2.createBackendPoolConfig; } });
Object.defineProperty(exports, "createProbeConfig", { enumerable: true, get: function () { return loadbalancing_2.createProbeConfig; } });
Object.defineProperty(exports, "createLoadBalancingRule", { enumerable: true, get: function () { return loadbalancing_2.createLoadBalancingRule; } });
Object.defineProperty(exports, "recommendHealthProbe", { enumerable: true, get: function () { return loadbalancing_2.recommendHealthProbe; } });
Object.defineProperty(exports, "createApplicationGateway", { enumerable: true, get: function () { return loadbalancing_2.createApplicationGateway; } });
Object.defineProperty(exports, "createAppGatewayIpConfig", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayIpConfig; } });
Object.defineProperty(exports, "createAppGatewayFrontendConfig", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayFrontendConfig; } });
Object.defineProperty(exports, "createAppGatewayFrontendPort", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayFrontendPort; } });
Object.defineProperty(exports, "createAppGatewayBackendPool", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayBackendPool; } });
Object.defineProperty(exports, "createAppGatewayHttpSetting", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayHttpSetting; } });
Object.defineProperty(exports, "createAppGatewayProbe", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayProbe; } });
Object.defineProperty(exports, "createAppGatewayListener", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayListener; } });
Object.defineProperty(exports, "createAppGatewayRoutingRule", { enumerable: true, get: function () { return loadbalancing_2.createAppGatewayRoutingRule; } });
Object.defineProperty(exports, "recommendAppGatewaySku", { enumerable: true, get: function () { return loadbalancing_2.recommendAppGatewaySku; } });
