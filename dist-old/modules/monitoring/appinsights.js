"use strict";
/**
 * Application Insights Helpers
 * Configures Application Insights for application performance monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorApplicationInsights = monitorApplicationInsights;
exports.registerAppInsightsHelpers = registerAppInsightsHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Configure Application Insights for application telemetry
 * @example
 * {{monitor:applicationInsights
 *   name="web-app-insights"
 *   location="East US"
 *   applicationType="web"
 *   workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-workspace')]"
 *   samplingPercentage=100
 *   retentionInDays=90
 * }}
 */
function monitorApplicationInsights(options) {
    const hash = options.hash;
    if (!hash.name) {
        throw new Error("monitor:applicationInsights requires name parameter");
    }
    const location = hash.location || "[resourceGroup().location]";
    const applicationType = hash.applicationType || "web";
    const samplingPercentage = hash.samplingPercentage !== undefined ? hash.samplingPercentage : 100;
    const retentionInDays = hash.retentionInDays || 90;
    const disableIpMasking = hash.disableIpMasking || false;
    const disableLocalAuth = hash.disableLocalAuth || false;
    // Workspace-based Application Insights (recommended)
    if (hash.workspaceId) {
        const result = {
            type: "Microsoft.Insights/components",
            apiVersion: "2020-02-02",
            name: hash.name,
            location: location,
            kind: applicationType,
            ...(hash.tags && { tags: hash.tags }),
            properties: {
                Application_Type: applicationType,
                WorkspaceResourceId: hash.workspaceId,
                SamplingPercentage: samplingPercentage,
                RetentionInDays: retentionInDays,
                DisableIpMasking: disableIpMasking,
                DisableLocalAuth: disableLocalAuth,
                publicNetworkAccessForIngestion: "Enabled",
                publicNetworkAccessForQuery: "Enabled",
            },
        };
        return JSON.stringify(result, null, 2);
    }
    // Classic Application Insights (legacy)
    const result = {
        type: "Microsoft.Insights/components",
        apiVersion: "2020-02-02",
        name: hash.name,
        location: location,
        kind: applicationType,
        ...(hash.tags && { tags: hash.tags }),
        properties: {
            Application_Type: applicationType,
            SamplingPercentage: samplingPercentage,
            RetentionInDays: retentionInDays,
            DisableIpMasking: disableIpMasking,
            DisableLocalAuth: disableLocalAuth,
            publicNetworkAccessForIngestion: "Enabled",
            publicNetworkAccessForQuery: "Enabled",
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerAppInsightsHelpers() {
    handlebars_1.default.registerHelper("monitor:applicationInsights", monitorApplicationInsights);
}
