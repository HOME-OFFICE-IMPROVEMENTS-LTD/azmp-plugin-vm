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
exports.dashboardVmHealth = dashboardVmHealth;
exports.registerVmHealthDashboardHelpers = registerVmHealthDashboardHelpers;
const Handlebars = __importStar(require("handlebars"));
/**
 * Generate VM health dashboard with metrics visualization
 */
function dashboardVmHealth(options) {
    // Validation
    if (!options.name)
        throw new Error("name is required for dashboard:vmHealth");
    if (!options.location)
        throw new Error("location is required for dashboard:vmHealth");
    if (!options.vmResourceIds || options.vmResourceIds.length === 0) {
        throw new Error("vmResourceIds array is required for dashboard:vmHealth");
    }
    // Defaults
    const showCpuMetrics = options.showCpuMetrics !== false;
    const showMemoryMetrics = options.showMemoryMetrics !== false;
    const showDiskMetrics = options.showDiskMetrics !== false;
    const showNetworkMetrics = options.showNetworkMetrics !== false;
    const timeRange = options.timeRange || "PT1H";
    const refreshInterval = options.refreshInterval || "PT5M";
    // Build dashboard parts (tiles)
    const parts = [];
    let position = 0;
    options.vmResourceIds.forEach((vmResourceId, vmIndex) => {
        if (showCpuMetrics) {
            parts.push({
                position: {
                    x: (position % 3) * 6,
                    y: Math.floor(position / 3) * 4,
                    colSpan: 6,
                    rowSpan: 4,
                },
                metadata: {
                    type: "Extension/HubsExtension/PartType/MonitorChartPart",
                    settings: {
                        content: {
                            options: {
                                chart: {
                                    metrics: [
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Percentage CPU",
                                            aggregationType: 4, // Average
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "CPU %" },
                                        },
                                    ],
                                    title: `VM ${vmIndex + 1} - CPU Usage`,
                                    titleKind: 1,
                                    visualization: {
                                        chartType: 2,
                                        legendVisualization: { isVisible: true },
                                    },
                                    timespan: { relative: { duration: timeRange } },
                                },
                            },
                        },
                    },
                },
            });
            position++;
        }
        if (showMemoryMetrics) {
            parts.push({
                position: {
                    x: (position % 3) * 6,
                    y: Math.floor(position / 3) * 4,
                    colSpan: 6,
                    rowSpan: 4,
                },
                metadata: {
                    type: "Extension/HubsExtension/PartType/MonitorChartPart",
                    settings: {
                        content: {
                            options: {
                                chart: {
                                    metrics: [
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Available Memory Bytes",
                                            aggregationType: 4,
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "Available Memory" },
                                        },
                                    ],
                                    title: `VM ${vmIndex + 1} - Memory Available`,
                                    titleKind: 1,
                                    visualization: { chartType: 2 },
                                    timespan: { relative: { duration: timeRange } },
                                },
                            },
                        },
                    },
                },
            });
            position++;
        }
        if (showDiskMetrics) {
            parts.push({
                position: {
                    x: (position % 3) * 6,
                    y: Math.floor(position / 3) * 4,
                    colSpan: 6,
                    rowSpan: 4,
                },
                metadata: {
                    type: "Extension/HubsExtension/PartType/MonitorChartPart",
                    settings: {
                        content: {
                            options: {
                                chart: {
                                    metrics: [
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Disk Read Bytes",
                                            aggregationType: 1, // Total
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "Disk Read" },
                                        },
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Disk Write Bytes",
                                            aggregationType: 1,
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "Disk Write" },
                                        },
                                    ],
                                    title: `VM ${vmIndex + 1} - Disk I/O`,
                                    titleKind: 1,
                                    visualization: { chartType: 2 },
                                    timespan: { relative: { duration: timeRange } },
                                },
                            },
                        },
                    },
                },
            });
            position++;
        }
        if (showNetworkMetrics) {
            parts.push({
                position: {
                    x: (position % 3) * 6,
                    y: Math.floor(position / 3) * 4,
                    colSpan: 6,
                    rowSpan: 4,
                },
                metadata: {
                    type: "Extension/HubsExtension/PartType/MonitorChartPart",
                    settings: {
                        content: {
                            options: {
                                chart: {
                                    metrics: [
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Network In Total",
                                            aggregationType: 1,
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "Network In" },
                                        },
                                        {
                                            resourceMetadata: { id: vmResourceId },
                                            name: "Network Out Total",
                                            aggregationType: 1,
                                            namespace: "Microsoft.Compute/virtualMachines",
                                            metricVisualization: { displayName: "Network Out" },
                                        },
                                    ],
                                    title: `VM ${vmIndex + 1} - Network Traffic`,
                                    titleKind: 1,
                                    visualization: { chartType: 2 },
                                    timespan: { relative: { duration: timeRange } },
                                },
                            },
                        },
                    },
                },
            });
            position++;
        }
    });
    const dashboard = {
        type: "Microsoft.Portal/dashboards",
        apiVersion: "2020-09-01-preview",
        name: options.name,
        location: options.location,
        tags: options.tags || {},
        properties: {
            lenses: [
                {
                    order: 0,
                    parts,
                },
            ],
            metadata: {
                model: {
                    timeRange: {
                        value: { relative: { duration: timeRange } },
                        type: "MsPortalFx.Composition.Configuration.ValueTypes.TimeRange",
                    },
                    filterLocale: { value: "en-us" },
                    filters: {
                        value: {
                            MsPortalFx_TimeRange: {
                                model: {
                                    format: "utc",
                                    granularity: "auto",
                                    relative: refreshInterval,
                                },
                                displayCache: {},
                                filteredPartIds: [],
                            },
                        },
                    },
                },
            },
        },
    };
    return JSON.stringify(dashboard, null, 2);
}
function registerVmHealthDashboardHelpers() {
    Handlebars.registerHelper("dashboard:vmHealth", function (options) {
        const opts = options?.hash || options;
        return new Handlebars.SafeString(dashboardVmHealth.call(this, opts));
    });
}
