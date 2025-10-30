"use strict";
/**
 * Azure Monitor Metrics Helpers
 * Configures metric collection for VMs and VMSS
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorMetrics = monitorMetrics;
exports.registerMetricsHelpers = registerMetricsHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Configure metric collection for Azure resources
 * @example
 * {{monitor:metrics
 *   targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   metricNamespace="Microsoft.Compute/virtualMachineScaleSets"
 *   metrics='["Percentage CPU","Available Memory Bytes","Network In Total"]'
 *   aggregation="Average"
 *   frequency="PT1M"
 * }}
 */
function monitorMetrics(options) {
    const hash = options.hash;
    if (!hash.targetResourceId) {
        throw new Error("monitor:metrics requires targetResourceId parameter");
    }
    // Parse metrics array if provided as string
    let metricsArray = [];
    if (hash.metrics) {
        if (typeof hash.metrics === "string") {
            try {
                metricsArray = JSON.parse(hash.metrics);
            }
            catch {
                metricsArray = [hash.metrics];
            }
        }
        else if (Array.isArray(hash.metrics)) {
            metricsArray = hash.metrics;
        }
    }
    // Default values
    const metricNamespace = hash.metricNamespace || "Microsoft.Compute/virtualMachines";
    const aggregation = hash.aggregation || "Average";
    const frequency = hash.frequency || "PT1M";
    // Generate metric configuration
    const metricConfigs = metricsArray.map((metricName) => ({
        name: metricName,
        namespace: metricNamespace,
        aggregation: aggregation,
        timeGrain: frequency,
    }));
    const result = {
        type: "Microsoft.Insights/metricAlerts",
        apiVersion: "2018-03-01",
        name: "[concat(parameters('resourceName'), '-metrics')]",
        location: "global",
        properties: {
            description: "Metric collection configuration",
            severity: 3,
            enabled: true,
            scopes: [hash.targetResourceId],
            evaluationFrequency: frequency,
            windowSize: frequency,
            criteria: {
                "odata.type": "Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria",
                allOf: metricConfigs.map((config, index) => ({
                    criterionType: "StaticThresholdCriterion",
                    name: `metric${index}`,
                    metricNamespace: config.namespace,
                    metricName: config.name,
                    operator: "GreaterThan",
                    threshold: 0,
                    timeAggregation: config.aggregation,
                })),
            },
            autoMitigate: true,
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerMetricsHelpers() {
    handlebars_1.default.registerHelper("monitor:metrics", monitorMetrics);
}
