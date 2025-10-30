"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardLoadBalancerPerformance = dashboardLoadBalancerPerformance;
exports.registerLoadBalancerPerformanceDashboardHelpers = registerLoadBalancerPerformanceDashboardHelpers;
const Handlebars = __importStar(require("handlebars"));
/**
 * Generate load balancer performance dashboard
 */
function dashboardLoadBalancerPerformance(options) {
    if (!options.name)
        throw new Error("name is required for dashboard:loadBalancerPerformance");
    if (!options.location)
        throw new Error("location is required for dashboard:loadBalancerPerformance");
    if (!options.loadBalancerResourceId)
        throw new Error("loadBalancerResourceId is required for dashboard:loadBalancerPerformance");
    const showHealthProbe = options.showHealthProbe !== false;
    const showThroughput = options.showThroughput !== false;
    const showConnections = options.showConnections !== false;
    const showSnatPorts = options.showSnatPorts !== false;
    const timeRange = options.timeRange || "PT1H";
    const parts = [];
    let yPosition = 0;
    if (showHealthProbe) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "VipAvailability",
                                        aggregationType: 4,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: {
                                            displayName: "Data Path Availability",
                                        },
                                    },
                                ],
                                title: "Health Probe Status",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
        parts.push({
            position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "DipAvailability",
                                        aggregationType: 4,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: { displayName: "Health Probe Status" },
                                    },
                                ],
                                title: "Backend Instance Health",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
        yPosition += 4;
    }
    if (showThroughput) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "ByteCount",
                                        aggregationType: 1,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: { displayName: "Byte Count" },
                                    },
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "PacketCount",
                                        aggregationType: 1,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: { displayName: "Packet Count" },
                                    },
                                ],
                                title: "Data Throughput",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
        yPosition += 4;
    }
    if (showConnections) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "SYNCount",
                                        aggregationType: 1,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: { displayName: "SYN Count" },
                                    },
                                ],
                                title: "New Connections (SYN Count)",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
        parts.push({
            position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "AllocatedSnatPorts",
                                        aggregationType: 4,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: {
                                            displayName: "Allocated SNAT Ports",
                                        },
                                    },
                                ],
                                title: "Active Connections",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
        yPosition += 4;
    }
    if (showSnatPorts) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MonitorChartPart",
                settings: {
                    content: {
                        options: {
                            chart: {
                                metrics: [
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "UsedSnatPorts",
                                        aggregationType: 4,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: { displayName: "Used SNAT Ports" },
                                    },
                                    {
                                        resourceMetadata: { id: options.loadBalancerResourceId },
                                        name: "AllocatedSnatPorts",
                                        aggregationType: 4,
                                        namespace: "Microsoft.Network/loadBalancers",
                                        metricVisualization: {
                                            displayName: "Allocated SNAT Ports",
                                        },
                                    },
                                ],
                                title: "SNAT Port Usage",
                                titleKind: 1,
                                visualization: { chartType: 2 },
                                timespan: { relative: { duration: timeRange } },
                            },
                        },
                    },
                },
            },
        });
    }
    const dashboard = {
        type: "Microsoft.Portal/dashboards",
        apiVersion: "2020-09-01-preview",
        name: options.name,
        location: options.location,
        tags: options.tags || {},
        properties: {
            lenses: [{ order: 0, parts }],
            metadata: {
                model: {
                    timeRange: {
                        value: { relative: { duration: timeRange } },
                        type: "MsPortalFx.Composition.Configuration.ValueTypes.TimeRange",
                    },
                    filterLocale: { value: "en-us" },
                },
            },
        },
    };
    return JSON.stringify(dashboard, null, 2);
}
function registerLoadBalancerPerformanceDashboardHelpers() {
    Handlebars.registerHelper("dashboard:loadBalancerPerformance", function (options) {
        const opts = options?.hash ||
            options;
        return new Handlebars.SafeString(dashboardLoadBalancerPerformance.call(this, opts));
    });
}
