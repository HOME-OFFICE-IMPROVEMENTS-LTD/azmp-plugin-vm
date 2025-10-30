"use strict";
/**
 * Custom Metrics Helpers
 * Defines custom metrics for application-specific monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorCustomMetric = monitorCustomMetric;
exports.registerCustomMetricHelpers = registerCustomMetricHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Define custom metric for application-specific monitoring
 * @example
 * {{monitor:customMetric
 *   name="OrderProcessingTime"
 *   namespace="ECommerce/Orders"
 *   displayName="Order Processing Time"
 *   description="Time to process customer order in milliseconds"
 *   unit="Milliseconds"
 *   aggregation="Average"
 *   dimensions='["Region","PaymentMethod","OrderType"]'
 * }}
 */
function monitorCustomMetric(options) {
    const hash = options.hash;
    if (!hash.name) {
        throw new Error("monitor:customMetric requires name parameter");
    }
    const namespace = hash.namespace || "Custom/Metrics";
    const displayName = hash.displayName || hash.name;
    const description = hash.description || `Custom metric: ${hash.name}`;
    const unit = hash.unit || "Count";
    const aggregation = hash.aggregation || "Average";
    // Parse dimensions array
    let dimensionsArray = [];
    if (hash.dimensions) {
        if (typeof hash.dimensions === "string") {
            try {
                dimensionsArray = JSON.parse(hash.dimensions);
            }
            catch {
                dimensionsArray = [hash.dimensions];
            }
        }
        else if (Array.isArray(hash.dimensions)) {
            dimensionsArray = hash.dimensions;
        }
    }
    // Custom metrics are defined at the application level
    // This generates a reference structure for documentation
    const result = {
        metricDefinition: {
            name: hash.name,
            namespace: namespace,
            displayName: displayName,
            description: description,
            unit: unit,
            aggregationType: aggregation,
            dimensions: dimensionsArray.map((dim) => ({
                name: dim,
                displayName: dim,
                toBeExportedForShoebox: true,
            })),
            fillGapWithZero: false,
            category: "Custom",
            resourceIdDimensionNameOverride: "ResourceId",
        },
        usage: {
            emitInstrumentation: `Use Application Insights SDK to emit custom metric "${hash.name}" with namespace "${namespace}"`,
            example: {
                dotNet: `telemetryClient.GetMetric("${hash.name}", ${dimensionsArray.map((d) => `"${d}"`).join(", ")}).TrackValue(value);`,
                python: `telemetry_client.track_metric("${hash.name}", value, properties={${dimensionsArray.map((d) => `"${d}": dimension_value`).join(", ")}})`,
                node: `appInsights.defaultClient.trackMetric({name: "${hash.name}", value: value, ${dimensionsArray.length > 0 ? `properties: {${dimensionsArray.map((d) => `"${d}": dimensionValue`).join(", ")}}` : ""}})`,
            },
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerCustomMetricHelpers() {
    handlebars_1.default.registerHelper("monitor:customMetric", monitorCustomMetric);
}
