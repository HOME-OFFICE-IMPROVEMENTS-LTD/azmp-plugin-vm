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
exports.dashboardMultiRegionHealth = dashboardMultiRegionHealth;
exports.registerMultiRegionHealthDashboardHelpers = registerMultiRegionHealthDashboardHelpers;
const Handlebars = __importStar(require("handlebars"));
/**
 * Generate multi-region health dashboard
 */
function dashboardMultiRegionHealth(options) {
    if (!options.name)
        throw new Error("name is required for dashboard:multiRegionHealth");
    if (!options.location)
        throw new Error("location is required for dashboard:multiRegionHealth");
    if (!options.regions || options.regions.length === 0) {
        throw new Error("regions array is required for dashboard:multiRegionHealth");
    }
    const showAvailability = options.showAvailability !== false;
    const showLatency = options.showLatency !== false;
    const showThroughput = options.showThroughput !== false;
    const timeRange = options.timeRange || "PT6H";
    const parts = [];
    let yPosition = 0;
    options.regions.forEach((region) => {
        // Region header (text tile)
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 1 },
            metadata: {
                type: "Extension/HubsExtension/PartType/MarkdownPart",
                settings: {
                    content: {
                        settings: {
                            content: `## ${region.name}`,
                            markdownSource: 1,
                        },
                    },
                },
            },
        });
        yPosition++;
        let xPosition = 0;
        // VM availability metrics
        if (showAvailability &&
            region.vmResourceIds &&
            region.vmResourceIds.length > 0) {
            region.vmResourceIds.forEach((vmId) => {
                parts.push({
                    position: { x: xPosition * 6, y: yPosition, colSpan: 6, rowSpan: 3 },
                    metadata: {
                        type: "Extension/HubsExtension/PartType/MonitorChartPart",
                        settings: {
                            content: {
                                options: {
                                    chart: {
                                        metrics: [
                                            {
                                                resourceMetadata: { id: vmId },
                                                name: "VmAvailabilityMetric",
                                                aggregationType: 4,
                                                namespace: "Microsoft.Compute/virtualMachines",
                                                metricVisualization: { displayName: "VM Availability" },
                                            },
                                        ],
                                        title: `VM Availability - ${region.name}`,
                                        titleKind: 1,
                                        visualization: { chartType: 2 },
                                        timespan: { relative: { duration: timeRange } },
                                    },
                                },
                            },
                        },
                    },
                });
                xPosition = (xPosition + 1) % 2;
                if (xPosition === 0)
                    yPosition += 3;
            });
        }
        // VMSS metrics
        if (region.vmssResourceIds && region.vmssResourceIds.length > 0) {
            region.vmssResourceIds.forEach((vmssId) => {
                if (showLatency) {
                    parts.push({
                        position: {
                            x: xPosition * 6,
                            y: yPosition,
                            colSpan: 6,
                            rowSpan: 3,
                        },
                        metadata: {
                            type: "Extension/HubsExtension/PartType/MonitorChartPart",
                            settings: {
                                content: {
                                    options: {
                                        chart: {
                                            metrics: [
                                                {
                                                    resourceMetadata: { id: vmssId },
                                                    name: "Network In Total",
                                                    aggregationType: 4,
                                                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                                                    metricVisualization: {
                                                        displayName: "Network Latency",
                                                    },
                                                },
                                            ],
                                            title: `VMSS Network - ${region.name}`,
                                            titleKind: 1,
                                            visualization: { chartType: 2 },
                                            timespan: { relative: { duration: timeRange } },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    xPosition = (xPosition + 1) % 2;
                    if (xPosition === 0)
                        yPosition += 3;
                }
            });
        }
        // Load balancer metrics
        if (showThroughput && region.loadBalancerResourceId) {
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
                                            resourceMetadata: { id: region.loadBalancerResourceId },
                                            name: "ByteCount",
                                            aggregationType: 1,
                                            namespace: "Microsoft.Network/loadBalancers",
                                            metricVisualization: { displayName: "Byte Count" },
                                        },
                                        {
                                            resourceMetadata: { id: region.loadBalancerResourceId },
                                            name: "PacketCount",
                                            aggregationType: 1,
                                            namespace: "Microsoft.Network/loadBalancers",
                                            metricVisualization: { displayName: "Packet Count" },
                                        },
                                    ],
                                    title: `Load Balancer Throughput - ${region.name}`,
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
        yPosition += 1; // Spacing between regions
    });
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
function registerMultiRegionHealthDashboardHelpers() {
    Handlebars.registerHelper("dashboard:multiRegionHealth", function (options) {
        const opts = options?.hash ||
            options;
        return new Handlebars.SafeString(dashboardMultiRegionHealth.call(this, opts));
    });
}
