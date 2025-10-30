"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertDynamicMetricAlert = alertDynamicMetricAlert;
exports.registerDynamicMetricAlertHelpers = registerDynamicMetricAlertHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Handlebars helper to create dynamic threshold metric alert using ML
 *
 * @example
 * ```handlebars
 * {{{alert:dynamicMetricAlert
 *   name="dynamic-cpu-alert"
 *   description="ML-based CPU anomaly detection"
 *   severity=2
 *   scopes="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","alertSensitivity":"Medium","failingPeriods":{"numberOfEvaluationPeriods":4,"minFailingPeriodsToAlert":3},"timeAggregation":"Average"}]'
 * }}}
 * ```
 */
function alertDynamicMetricAlert(hash) {
    if (!hash || !hash.name) {
        throw new Error("alert:dynamicMetricAlert requires name parameter");
    }
    if (!hash.scopes) {
        throw new Error("alert:dynamicMetricAlert requires scopes parameter");
    }
    if (!hash.criteria) {
        throw new Error("alert:dynamicMetricAlert requires criteria parameter");
    }
    // Parse criteria if it's a JSON string
    let criteriaArray = hash.criteria;
    if (typeof hash.criteria === "string") {
        try {
            criteriaArray = JSON.parse(hash.criteria);
        }
        catch (e) {
            throw new Error(`alert:dynamicMetricAlert criteria must be valid JSON array: ${e}`);
        }
    }
    // Parse scopes
    let scopesArray;
    if (typeof hash.scopes === "string") {
        try {
            scopesArray = JSON.parse(hash.scopes);
        }
        catch (e) {
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
            description: hash.description || `Dynamic metric alert for ${hash.name}`,
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
                "odata.type": "Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria",
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
function registerDynamicMetricAlertHelpers() {
    handlebars_1.default.registerHelper("alert:dynamicMetricAlert", alertDynamicMetricAlert);
}
