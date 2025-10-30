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
exports.dashboardCostAnalysis = dashboardCostAnalysis;
exports.registerCostAnalysisDashboardHelpers = registerCostAnalysisDashboardHelpers;
const Handlebars = __importStar(require("handlebars"));
/**
 * Generate cost analysis dashboard
 */
function dashboardCostAnalysis(options) {
    if (!options.name)
        throw new Error("name is required for dashboard:costAnalysis");
    if (!options.location)
        throw new Error("location is required for dashboard:costAnalysis");
    if (!options.subscriptionId)
        throw new Error("subscriptionId is required for dashboard:costAnalysis");
    const showCostTrends = options.showCostTrends !== false;
    const showCostByService = options.showCostByService !== false;
    const showCostByRegion = options.showCostByRegion !== false;
    const showBudgetStatus = options.showBudgetStatus !== false;
    const timeRange = options.timeRange || "P30D";
    const parts = [];
    let yPosition = 0;
    // Cost scope filter (subscription or resource groups)
    const scope = options.resourceGroups && options.resourceGroups.length > 0
        ? `/subscriptions/${options.subscriptionId}/resourceGroups/${options.resourceGroups[0]}`
        : `/subscriptions/${options.subscriptionId}`;
    if (showCostTrends) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
            metadata: {
                type: "Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart",
                settings: {
                    content: {
                        configurationId: `cost-trends-${options.name}`,
                        scope,
                        chartType: "Line",
                        granularity: "Daily",
                        grouping: [],
                        timePeriod: { type: "relative", duration: timeRange },
                        title: "Cost Trends Over Time",
                    },
                },
            },
        });
        yPosition += 4;
    }
    if (showCostByService) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart",
                settings: {
                    content: {
                        configurationId: `cost-by-service-${options.name}`,
                        scope,
                        chartType: "StackedColumn",
                        granularity: "None",
                        grouping: [{ type: "Dimension", name: "ServiceName" }],
                        timePeriod: { type: "relative", duration: timeRange },
                        title: "Cost by Service",
                    },
                },
            },
        });
    }
    if (showCostByRegion) {
        parts.push({
            position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
            metadata: {
                type: "Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart",
                settings: {
                    content: {
                        configurationId: `cost-by-region-${options.name}`,
                        scope,
                        chartType: "Pie",
                        granularity: "None",
                        grouping: [{ type: "Dimension", name: "ResourceLocation" }],
                        timePeriod: { type: "relative", duration: timeRange },
                        title: "Cost by Region",
                    },
                },
            },
        });
        yPosition += 4;
    }
    if (showBudgetStatus) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 3 },
            metadata: {
                type: "Extension/Microsoft_Azure_CostManagement/PartType/BudgetsPart",
                settings: {
                    content: {
                        scope,
                        title: "Budget Status",
                    },
                },
            },
        });
        yPosition += 3;
    }
    // Additional resource group breakdown if specified
    if (options.resourceGroups && options.resourceGroups.length > 1) {
        parts.push({
            position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
            metadata: {
                type: "Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart",
                settings: {
                    content: {
                        configurationId: `cost-by-rg-${options.name}`,
                        scope: `/subscriptions/${options.subscriptionId}`,
                        chartType: "StackedColumn",
                        granularity: "Daily",
                        grouping: [{ type: "Dimension", name: "ResourceGroupName" }],
                        filter: {
                            dimensions: {
                                name: "ResourceGroupName",
                                operator: "In",
                                values: options.resourceGroups,
                            },
                        },
                        timePeriod: { type: "relative", duration: timeRange },
                        title: "Cost by Resource Group",
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
function registerCostAnalysisDashboardHelpers() {
    Handlebars.registerHelper("dashboard:costAnalysis", function (options) {
        const opts = options?.hash || options;
        return new Handlebars.SafeString(dashboardCostAnalysis.call(this, opts));
    });
}
