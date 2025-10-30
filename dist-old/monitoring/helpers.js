"use strict";
/**
 * Handlebars helpers for enhanced monitoring alerts and workbooks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEnhancedMonitoringHelpers = registerEnhancedMonitoringHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
const alerts_1 = require("./alerts");
const safeStringify = (value) => {
    return new handlebars_1.default.SafeString(JSON.stringify(value, null, 2));
};
const parseOptions = (hash, required = []) => {
    required.forEach((key) => {
        if (!hash[key]) {
            throw new Error(`Missing required option "${key}"`);
        }
    });
    return hash;
};
const toMetricResource = (definition) => {
    const resource = alerts_1.MonitoringAlertEngine.toMetricAlertResource(definition);
    return safeStringify(resource);
};
const toScheduledQueryResource = (definition, workspaceId) => {
    const resource = alerts_1.MonitoringAlertEngine.toScheduledQueryResource(definition, workspaceId);
    return safeStringify(resource);
};
function registerEnhancedMonitoringHelpers() {
    handlebars_1.default.registerHelper("monitor:cpuAlert", function (options) {
        try {
            const alertOptions = parseOptions(options.hash, [
                "resourceId",
            ]);
            const definition = alerts_1.MonitoringAlertEngine.createCpuAlert(alertOptions);
            return safeStringify(definition);
        }
        catch (error) {
            return `Error generating CPU alert: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    handlebars_1.default.registerHelper("monitor:memoryAlert", function (options) {
        try {
            const alertOptions = parseOptions(options.hash, [
                "resourceId",
            ]);
            const definition = alerts_1.MonitoringAlertEngine.createMemoryAlert(alertOptions);
            return safeStringify(definition);
        }
        catch (error) {
            return `Error generating memory alert: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    handlebars_1.default.registerHelper("monitor:costAlert", function (options) {
        try {
            const alertOptions = parseOptions(options.hash, [
                "scopeId",
            ]);
            const definition = alerts_1.MonitoringAlertEngine.createCostAnomalyAlert(alertOptions);
            return safeStringify(definition);
        }
        catch (error) {
            return `Error generating cost alert: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    handlebars_1.default.registerHelper("monitor:scalingAlert", function (options) {
        try {
            const alertOptions = parseOptions(options.hash, ["resourceId"]);
            const definition = alerts_1.MonitoringAlertEngine.createScalingHealthAlert(alertOptions);
            return safeStringify(definition);
        }
        catch (error) {
            return `Error generating scaling alert: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    handlebars_1.default.registerHelper("monitor:metricResource", function (definitionJson) {
        try {
            const definition = typeof definitionJson === "string"
                ? JSON.parse(definitionJson)
                : definitionJson;
            return toMetricResource(definition);
        }
        catch (error) {
            return `Error generating metric alert resource: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    handlebars_1.default.registerHelper("monitor:logResource", function (definitionJson, workspaceId) {
        try {
            if (!workspaceId) {
                throw new Error("workspaceId parameter is required");
            }
            const definition = typeof definitionJson === "string"
                ? JSON.parse(definitionJson)
                : definitionJson;
            return toScheduledQueryResource(definition, workspaceId);
        }
        catch (error) {
            return `Error generating scheduled query resource: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
}
