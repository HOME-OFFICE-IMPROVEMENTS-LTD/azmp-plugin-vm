"use strict";
/**
 * Azure Diagnostic Settings Helpers
 * Configures log and metric forwarding to Log Analytics, Storage, or Event Hub
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorDiagnosticSettings = monitorDiagnosticSettings;
exports.registerDiagnosticsHelpers = registerDiagnosticsHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Configure diagnostic settings for Azure resources
 * @example
 * {{monitor:diagnosticSettings
 *   targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
 *   workspaceId="[parameters('logAnalyticsWorkspaceId')]"
 *   logs='["Administrative","Security","ServiceHealth"]'
 *   metrics='["AllMetrics"]'
 *   retentionDays=30
 * }}
 */
function monitorDiagnosticSettings(options) {
    const hash = options.hash;
    if (!hash.targetResourceId) {
        throw new Error("monitor:diagnosticSettings requires targetResourceId parameter");
    }
    if (!hash.workspaceId &&
        !hash.storageAccountId &&
        !hash.eventHubAuthorizationRuleId) {
        throw new Error("monitor:diagnosticSettings requires at least one destination (workspaceId, storageAccountId, or eventHubAuthorizationRuleId)");
    }
    // Parse logs array
    let logsArray = [];
    if (hash.logs) {
        if (typeof hash.logs === "string") {
            try {
                logsArray = JSON.parse(hash.logs);
            }
            catch {
                logsArray = [hash.logs];
            }
        }
        else if (Array.isArray(hash.logs)) {
            logsArray = hash.logs;
        }
    }
    // Parse metrics array
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
    const retentionDays = hash.retentionDays || 30;
    const settingsName = hash.name || "default";
    const result = {
        type: "Microsoft.Insights/diagnosticSettings",
        apiVersion: "2021-05-01-preview",
        scope: hash.targetResourceId,
        name: settingsName,
        properties: {
            ...(hash.workspaceId && { workspaceId: hash.workspaceId }),
            ...(hash.storageAccountId && { storageAccountId: hash.storageAccountId }),
            ...(hash.eventHubAuthorizationRuleId && {
                eventHubAuthorizationRuleId: hash.eventHubAuthorizationRuleId,
                ...(hash.eventHubName && { eventHubName: hash.eventHubName }),
            }),
            logs: logsArray.map((category) => ({
                category: category,
                enabled: true,
                retentionPolicy: {
                    enabled: retentionDays > 0,
                    days: retentionDays,
                },
            })),
            metrics: metricsArray.map((category) => ({
                category: category,
                enabled: true,
                retentionPolicy: {
                    enabled: retentionDays > 0,
                    days: retentionDays,
                },
            })),
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerDiagnosticsHelpers() {
    handlebars_1.default.registerHelper("monitor:diagnosticSettings", monitorDiagnosticSettings);
}
