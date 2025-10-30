"use strict";
/**
 * Log Analytics Workspace Helpers
 * Creates and configures Log Analytics workspaces for centralized logging
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorLogAnalyticsWorkspace = monitorLogAnalyticsWorkspace;
exports.registerWorkspaceHelpers = registerWorkspaceHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Create Log Analytics workspace for centralized logging
 * @example
 * {{monitor:logAnalyticsWorkspace
 *   name="vmss-logs-workspace"
 *   location="East US"
 *   sku="PerGB2018"
 *   retentionInDays=90
 *   dailyQuotaGb=10
 * }}
 */
function monitorLogAnalyticsWorkspace(options) {
    const hash = options.hash;
    if (!hash.name) {
        throw new Error("monitor:logAnalyticsWorkspace requires name parameter");
    }
    const location = hash.location || "[resourceGroup().location]";
    const sku = hash.sku || "PerGB2018";
    const retentionInDays = hash.retentionInDays || 30;
    const publicNetworkAccessForIngestion = hash.publicNetworkAccessForIngestion || "Enabled";
    const publicNetworkAccessForQuery = hash.publicNetworkAccessForQuery || "Enabled";
    const result = {
        type: "Microsoft.OperationalInsights/workspaces",
        apiVersion: "2022-10-01",
        name: hash.name,
        location: location,
        ...(hash.tags && { tags: hash.tags }),
        properties: {
            sku: {
                name: sku,
            },
            retentionInDays: retentionInDays,
            features: {
                enableLogAccessUsingOnlyResourcePermissions: true,
            },
            workspaceCapping: hash.dailyQuotaGb
                ? {
                    dailyQuotaGb: hash.dailyQuotaGb,
                }
                : undefined,
            publicNetworkAccessForIngestion: publicNetworkAccessForIngestion,
            publicNetworkAccessForQuery: publicNetworkAccessForQuery,
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerWorkspaceHelpers() {
    handlebars_1.default.registerHelper("monitor:logAnalyticsWorkspace", monitorLogAnalyticsWorkspace);
}
