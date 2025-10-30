"use strict";
/**
 * Azure Monitoring Module
 * Provides helpers for Azure Monitor, Log Analytics, Application Insights, and custom metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomMetricHelpers = exports.registerDataCollectionHelpers = exports.registerAppInsightsHelpers = exports.registerWorkspaceHelpers = exports.registerDiagnosticsHelpers = exports.registerMetricsHelpers = void 0;
exports.registerMonitoringHelpers = registerMonitoringHelpers;
const metrics_1 = require("./metrics");
Object.defineProperty(exports, "registerMetricsHelpers", { enumerable: true, get: function () { return metrics_1.registerMetricsHelpers; } });
const diagnostics_1 = require("./diagnostics");
Object.defineProperty(exports, "registerDiagnosticsHelpers", { enumerable: true, get: function () { return diagnostics_1.registerDiagnosticsHelpers; } });
const workspace_1 = require("./workspace");
Object.defineProperty(exports, "registerWorkspaceHelpers", { enumerable: true, get: function () { return workspace_1.registerWorkspaceHelpers; } });
const appinsights_1 = require("./appinsights");
Object.defineProperty(exports, "registerAppInsightsHelpers", { enumerable: true, get: function () { return appinsights_1.registerAppInsightsHelpers; } });
const datacollection_1 = require("./datacollection");
Object.defineProperty(exports, "registerDataCollectionHelpers", { enumerable: true, get: function () { return datacollection_1.registerDataCollectionHelpers; } });
const custommetric_1 = require("./custommetric");
Object.defineProperty(exports, "registerCustomMetricHelpers", { enumerable: true, get: function () { return custommetric_1.registerCustomMetricHelpers; } });
/**
 * Register all monitoring helpers
 */
function registerMonitoringHelpers() {
    (0, metrics_1.registerMetricsHelpers)();
    (0, diagnostics_1.registerDiagnosticsHelpers)();
    (0, workspace_1.registerWorkspaceHelpers)();
    (0, appinsights_1.registerAppInsightsHelpers)();
    (0, datacollection_1.registerDataCollectionHelpers)();
    (0, custommetric_1.registerCustomMetricHelpers)();
}
