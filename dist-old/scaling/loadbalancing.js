"use strict";
/**
 * Scaling Module - Load Balancing Helpers
 *
 * Provides helpers for configuring Azure Load Balancers that integrate
 * with Virtual Machine Scale Sets and support multi-region deployments.
 *
 * @module scaling/loadbalancing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBalancingHelpers = void 0;
exports.createLoadBalancer = createLoadBalancer;
exports.createFrontendIPConfig = createFrontendIPConfig;
exports.createBackendPoolConfig = createBackendPoolConfig;
exports.createProbeConfig = createProbeConfig;
exports.createLoadBalancingRule = createLoadBalancingRule;
exports.recommendHealthProbe = recommendHealthProbe;
exports.createAppGatewayIpConfig = createAppGatewayIpConfig;
exports.createAppGatewayFrontendConfig = createAppGatewayFrontendConfig;
exports.createAppGatewayFrontendPort = createAppGatewayFrontendPort;
exports.createAppGatewayBackendPool = createAppGatewayBackendPool;
exports.createAppGatewayHttpSetting = createAppGatewayHttpSetting;
exports.createAppGatewayProbe = createAppGatewayProbe;
exports.createAppGatewayListener = createAppGatewayListener;
exports.createAppGatewayRoutingRule = createAppGatewayRoutingRule;
exports.createApplicationGateway = createApplicationGateway;
exports.recommendAppGatewaySku = recommendAppGatewaySku;
/**
 * Create Load Balancer resource definition
 */
function createLoadBalancer(options) {
    if (!options.name) {
        throw new Error("Load Balancer requires a name");
    }
    if (!options.frontendIPConfigurations ||
        options.frontendIPConfigurations.length === 0) {
        throw new Error("Load Balancer requires at least one frontendIPConfiguration");
    }
    if (!options.backendAddressPools ||
        options.backendAddressPools.length === 0) {
        throw new Error("Load Balancer requires at least one backendAddressPool");
    }
    if (!options.loadBalancingRules || options.loadBalancingRules.length === 0) {
        throw new Error("Load Balancer requires at least one loadBalancingRule");
    }
    const resource = {
        type: "Microsoft.Network/loadBalancers",
        apiVersion: "2023-09-01",
        name: options.name,
        location: options.location || "[resourceGroup().location]",
        sku: {
            name: options.sku ?? "Standard",
        },
        properties: {
            frontendIPConfigurations: options.frontendIPConfigurations.map(createFrontendIPConfig),
            backendAddressPools: options.backendAddressPools.map(createBackendPoolConfig),
            loadBalancingRules: options.loadBalancingRules.map((rule) => createLoadBalancingRule(rule)),
            probes: (options.probes ?? []).map(createProbeConfig),
            inboundNatPools: (options.inboundNatPools ?? []).map((pool) => ({
                name: pool.name,
                properties: {
                    protocol: pool.protocol,
                    frontendPortRangeStart: pool.frontendPortRangeStart,
                    frontendPortRangeEnd: pool.frontendPortRangeEnd,
                    backendPort: pool.backendPort,
                    frontendIPConfiguration: {
                        id: `[concat(resourceId('Microsoft.Network/loadBalancers', '${options.name}'), '/frontendIPConfigurations/${pool.frontendIPConfigurationName}')]`,
                    },
                },
            })),
        },
    };
    if (options.tags) {
        resource.tags = options.tags;
    }
    return resource;
}
function createFrontendIPConfig(config) {
    const properties = {};
    if (config.publicIpAddressId) {
        properties.publicIPAddress = { id: config.publicIpAddressId };
    }
    if (config.subnetId) {
        properties.subnet = { id: config.subnetId };
        if (config.privateIpAddress) {
            properties.privateIPAddress = config.privateIpAddress;
            properties.privateIPAllocationMethod =
                config.privateIpAllocationMethod ?? "Static";
        }
        else {
            properties.privateIPAllocationMethod =
                config.privateIpAllocationMethod ?? "Dynamic";
        }
    }
    const frontend = {
        name: config.name,
        properties,
    };
    if (config.zones && config.zones.length > 0) {
        frontend.zones = config.zones;
    }
    return frontend;
}
function createBackendPoolConfig(config) {
    if (!config.name) {
        throw new Error("Backend pool requires a name");
    }
    const properties = {};
    if (config.vmssResourceId) {
        properties.backendAddressPoolAddresses = undefined;
        properties.loadBalancerBackendAddresses = undefined;
        properties.virtualMachineScaleSet = {
            id: config.vmssResourceId,
        };
    }
    if (config.nicResourceIds && config.nicResourceIds.length > 0) {
        properties.backendAddressPoolAddresses = config.nicResourceIds.map((id) => ({ id }));
    }
    return {
        name: config.name,
        properties,
    };
}
function createProbeConfig(config) {
    if (!config.name) {
        throw new Error("Health probe requires a name");
    }
    const probe = {
        name: config.name,
        properties: {
            protocol: config.protocol.toUpperCase(),
            port: config.port,
            intervalInSeconds: config.intervalInSeconds ?? 30,
            numberOfProbes: config.numberOfProbes ?? 2,
        },
    };
    if ((config.protocol === "Http" || config.protocol === "Https") &&
        config.requestPath) {
        probe.properties.requestPath = config.requestPath;
    }
    return probe;
}
function createLoadBalancingRule(config) {
    if (!config.name) {
        throw new Error("Load balancing rule requires a name");
    }
    return {
        name: config.name,
        properties: {
            protocol: config.protocol.toUpperCase(),
            frontendPort: config.frontendPort,
            backendPort: config.backendPort,
            idleTimeoutInMinutes: config.idleTimeoutInMinutes ?? 4,
            enableFloatingIP: config.enableFloatingIP ?? false,
            loadDistribution: config.loadDistribution ?? "Default",
            frontendIPConfiguration: {
                id: `[concat(resourceId('Microsoft.Network/loadBalancers', parameters('loadBalancerName')), '/frontendIPConfigurations/${config.frontendIPConfigName}')]`,
            },
            backendAddressPool: {
                id: `[concat(resourceId('Microsoft.Network/loadBalancers', parameters('loadBalancerName')), '/backendAddressPools/${config.backendPoolName}')]`,
            },
            probe: config.probeName
                ? {
                    id: `[concat(resourceId('Microsoft.Network/loadBalancers', parameters('loadBalancerName')), '/probes/${config.probeName}')]`,
                }
                : undefined,
        },
    };
}
/**
 * Generate health probe recommendations based on workload type
 */
function recommendHealthProbe(workload) {
    switch (workload) {
        case "Web":
            return {
                workload,
                protocol: "Http",
                port: 80,
                requestPath: "/health",
                intervalInSeconds: 15,
                numberOfProbes: 2,
                rationale: "Use HTTP probe for web workloads with application health endpoint",
            };
        case "Api":
            return {
                workload,
                protocol: "Https",
                port: 443,
                requestPath: "/healthz",
                intervalInSeconds: 10,
                numberOfProbes: 2,
                rationale: "HTTPS probe with secure health endpoint ensures API availability monitoring",
            };
        case "TcpService":
        default:
            return {
                workload: "TcpService",
                protocol: "Tcp",
                port: 3389,
                intervalInSeconds: 15,
                numberOfProbes: 3,
                rationale: "TCP probe verifies port availability for non-HTTP services; adjust port as needed",
            };
    }
}
function createAppGatewayIpConfig(config) {
    if (!config.name || !config.subnetId) {
        throw new Error("Application Gateway IP configuration requires name and subnetId");
    }
    return {
        name: config.name,
        properties: {
            subnet: {
                id: config.subnetId,
            },
        },
    };
}
function createAppGatewayFrontendConfig(config) {
    const properties = {};
    if (config.publicIpAddressId) {
        properties.publicIPAddress = { id: config.publicIpAddressId };
    }
    if (config.subnetId) {
        properties.subnet = { id: config.subnetId };
        if (config.privateIpAddress) {
            properties.privateIPAddress = config.privateIpAddress;
            properties.privateIPAllocationMethod =
                config.privateIpAllocationMethod ?? "Static";
        }
        else {
            properties.privateIPAllocationMethod =
                config.privateIpAllocationMethod ?? "Dynamic";
        }
    }
    return {
        name: config.name,
        properties,
    };
}
function createAppGatewayFrontendPort(config) {
    return {
        name: config.name,
        properties: {
            port: config.port,
        },
    };
}
function createAppGatewayBackendPool(config) {
    return {
        name: config.name,
        properties: {
            backendAddresses: (config.addresses ?? []).map((address) => ({
                ipAddress: address.ipAddress,
                fqdn: address.fqdn,
            })),
        },
    };
}
function createAppGatewayHttpSetting(config) {
    return {
        name: config.name,
        properties: {
            port: config.port,
            protocol: config.protocol,
            cookieBasedAffinity: config.cookieBasedAffinity ?? "Disabled",
            requestTimeout: config.requestTimeout ?? 30,
            probe: config.probeName
                ? {
                    id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/probes/${config.probeName}')]`,
                }
                : undefined,
            pickHostNameFromBackendAddress: config.pickHostNameFromBackendAddress ?? false,
        },
    };
}
function createAppGatewayProbe(config) {
    return {
        name: config.name,
        properties: {
            protocol: config.protocol,
            path: config.path,
            interval: config.interval ?? 30,
            timeout: config.timeout ?? 30,
            unhealthyThreshold: config.unhealthyThreshold ?? 3,
            pickHostNameFromBackendHttpSettings: config.pickHostNameFromBackendHttpSettings ?? false,
        },
    };
}
function createAppGatewayListener(config) {
    return {
        name: config.name,
        properties: {
            protocol: config.protocol,
            frontendIPConfiguration: {
                id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/frontendIPConfigurations/${config.frontendIPConfigName}')]`,
            },
            frontendPort: {
                id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/frontendPorts/${config.frontendPortName}')]`,
            },
            sslCertificate: config.sslCertificateName
                ? {
                    id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/sslCertificates/${config.sslCertificateName}')]`,
                }
                : undefined,
            hostName: config.hostName,
        },
    };
}
function createAppGatewayRoutingRule(config) {
    return {
        name: config.name,
        properties: {
            ruleType: config.ruleType ?? "Basic",
            httpsRedirect: undefined,
            priority: config.priority,
            httpListener: {
                id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/httpListeners/${config.listenerName}')]`,
            },
            backendAddressPool: {
                id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/backendAddressPools/${config.backendPoolName}')]`,
            },
            backendHttpSettings: {
                id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/backendHttpSettingsCollection/${config.backendHttpSettingsName}')]`,
            },
            urlPathMap: config.urlPathMapName
                ? {
                    id: `[concat(resourceId('Microsoft.Network/applicationGateways', parameters('applicationGatewayName')), '/urlPathMaps/${config.urlPathMapName}')]`,
                }
                : undefined,
        },
    };
}
function createApplicationGateway(options) {
    if (!options.name) {
        throw new Error("Application Gateway requires a name");
    }
    if (!options.gatewayIPConfigurations ||
        options.gatewayIPConfigurations.length === 0) {
        throw new Error("Application Gateway requires at least one gateway IP configuration");
    }
    if (!options.frontendIPConfigurations ||
        options.frontendIPConfigurations.length === 0) {
        throw new Error("Application Gateway requires at least one frontend IP configuration");
    }
    if (!options.frontendPorts || options.frontendPorts.length === 0) {
        throw new Error("Application Gateway requires at least one frontend port");
    }
    if (!options.backendAddressPools ||
        options.backendAddressPools.length === 0) {
        throw new Error("Application Gateway requires at least one backend pool");
    }
    if (!options.httpSettings || options.httpSettings.length === 0) {
        throw new Error("Application Gateway requires at least one HTTP setting");
    }
    if (!options.listeners || options.listeners.length === 0) {
        throw new Error("Application Gateway requires at least one listener");
    }
    if (!options.requestRoutingRules ||
        options.requestRoutingRules.length === 0) {
        throw new Error("Application Gateway requires at least one routing rule");
    }
    const resource = {
        type: "Microsoft.Network/applicationGateways",
        apiVersion: "2023-09-01",
        name: options.name,
        location: options.location || "[resourceGroup().location]",
        properties: {
            sku: {
                name: options.sku?.name ?? "Standard_v2",
                tier: options.sku?.tier ?? options.sku?.name ?? "Standard_v2",
                capacity: options.sku?.capacity ?? 2,
            },
            enableHttp2: options.enableHttp2 ?? true,
            gatewayIPConfigurations: options.gatewayIPConfigurations.map(createAppGatewayIpConfig),
            frontendIPConfigurations: options.frontendIPConfigurations.map(createAppGatewayFrontendConfig),
            frontendPorts: options.frontendPorts.map(createAppGatewayFrontendPort),
            backendAddressPools: options.backendAddressPools.map(createAppGatewayBackendPool),
            backendHttpSettingsCollection: options.httpSettings.map(createAppGatewayHttpSetting),
            httpListeners: options.listeners.map(createAppGatewayListener),
            requestRoutingRules: options.requestRoutingRules.map(createAppGatewayRoutingRule),
            probes: (options.probes ?? []).map(createAppGatewayProbe),
        },
    };
    if (options.wafConfiguration) {
        resource.properties.webApplicationFirewallConfiguration = {
            enabled: options.wafConfiguration.enabled,
            firewallMode: options.wafConfiguration.mode,
            ruleSetType: options.wafConfiguration.ruleSetType ?? "OWASP",
            ruleSetVersion: options.wafConfiguration.ruleSetVersion ?? "3.2",
        };
    }
    if (options.tags) {
        resource.tags = options.tags;
    }
    return resource;
}
function recommendAppGatewaySku(workload) {
    switch (workload) {
        case "missionCritical":
            return {
                sku: "WAF_v2",
                tier: "WAF_v2",
                rationale: "Mission-critical workloads benefit from WAF_v2 for advanced security and autoscaling.",
            };
        case "api":
            return {
                sku: "Standard_v2",
                tier: "Standard_v2",
                rationale: "Standard_v2 provides autoscaling and zone redundancy ideal for API workloads.",
            };
        case "web":
        default:
            return {
                sku: "Standard_v2",
                tier: "Standard_v2",
                rationale: "Standard_v2 balances cost and performance for typical web applications.",
            };
    }
}
/**
 * Exported helper map for registration
 */
exports.loadBalancingHelpers = {
    "scale:lb.definition": createLoadBalancer,
    "scale:lb.frontend": createFrontendIPConfig,
    "scale:lb.backendPool": createBackendPoolConfig,
    "scale:lb.probe": createProbeConfig,
    "scale:lb.rule": createLoadBalancingRule,
    "scale:lb.recommendProbe": recommendHealthProbe,
    "scale:appgw.definition": createApplicationGateway,
    "scale:appgw.ipConfig": createAppGatewayIpConfig,
    "scale:appgw.frontend": createAppGatewayFrontendConfig,
    "scale:appgw.frontendPort": createAppGatewayFrontendPort,
    "scale:appgw.backendPool": createAppGatewayBackendPool,
    "scale:appgw.httpSetting": createAppGatewayHttpSetting,
    "scale:appgw.probe": createAppGatewayProbe,
    "scale:appgw.listener": createAppGatewayListener,
    "scale:appgw.rule": createAppGatewayRoutingRule,
    "scale:appgw.recommendSku": recommendAppGatewaySku,
};
