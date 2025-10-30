"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertMetricAlert = alertMetricAlert;
exports.registerMetricAlertHelpers = registerMetricAlertHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Handlebars helper to create static threshold metric alert
 *
 * @example
 * ```handlebars
 * {{{alert:metricAlert
 *   name="high-cpu-alert"
 *   description="Alert when VM CPU exceeds 80%"
 *   severity=1
 *   scopes="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]'
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'ops-team')]"]'
 * }}}
 * ```
 */
function alertMetricAlert(hash) {
    if (!hash || !hash.name) {
        throw new Error("alert:metricAlert requires name parameter");
    }
    if (!hash.scopes) {
        throw new Error("alert:metricAlert requires scopes parameter");
    }
    if (!hash.criteria) {
        throw new Error("alert:metricAlert requires criteria parameter");
    }
    // Parse criteria if it's a JSON string
    let criteriaArray = hash.criteria;
    if (typeof hash.criteria === "string") {
        try {
            criteriaArray = JSON.parse(hash.criteria);
        }
        catch (e) {
            throw new Error(`alert:metricAlert criteria must be valid JSON array: ${e}`);
        }
    }
    // Parse scopes if it's a JSON string or single string
    let scopesArray;
    if (typeof hash.scopes === "string") {
        try {
            scopesArray = JSON.parse(hash.scopes);
        }
        catch (e) {
            // Single scope string
            scopesArray = [hash.scopes];
        }
    }
    else {
        scopesArray = hash.scopes;
    }
    // Parse action groups if provided
    let actionGroupsArray;
    if (hash.actionGroups) {
        if (typeof hash.actionGroups === "string") {
            try {
                actionGroupsArray = JSON.parse(hash.actionGroups);
            }
            catch (e) {
                actionGroupsArray = [hash.actionGroups];
            }
        }
        else {
            actionGroupsArray = hash.actionGroups;
        }
    }
    const result = {
        type: "Microsoft.Insights/metricAlerts",
        apiVersion: "2018-03-01",
        name: hash.name,
        location: "global",
        ...(hash.tags && { tags: hash.tags }),
        properties: {
            description: hash.description || `Metric alert for ${hash.name}`,
            severity: hash.severity,
            enabled: hash.enabled !== undefined ? hash.enabled : true,
            scopes: scopesArray,
            evaluationFrequency: hash.evaluationFrequency || "PT1M",
            windowSize: hash.windowSize || "PT5M",
            ...(hash.targetResourceType && {
                targetResourceType: hash.targetResourceType,
            }),
            ...(hash.targetResourceRegion && {
                targetResourceRegion: hash.targetResourceRegion,
            }),
            criteria: {
                "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
                allOf: criteriaArray,
            },
            autoMitigate: hash.autoMitigate !== undefined ? hash.autoMitigate : true,
            ...(actionGroupsArray &&
                actionGroupsArray.length > 0 && {
                actions: actionGroupsArray.map((id) => ({ actionGroupId: id })),
            }),
        },
    };
    return JSON.stringify(result, null, 2);
}
function registerMetricAlertHelpers() {
    handlebars_1.default.registerHelper("alert:metricAlert", alertMetricAlert);
}
