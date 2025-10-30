"use strict";
/**
 * Alert Module
 *
 * Provides Handlebars helpers for creating Azure Monitor alerts:
 * - Metric alerts (static and dynamic thresholds)
 * - Log alerts (KQL-based)
 * - Activity log alerts
 * - Action groups (notifications)
 * - Smart groups (correlation/suppression)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSmartGroupHelpers = exports.registerActionGroupHelpers = exports.registerActivityLogAlertHelpers = exports.registerLogAlertHelpers = exports.registerDynamicMetricAlertHelpers = exports.registerMetricAlertHelpers = void 0;
exports.registerAlertHelpers = registerAlertHelpers;
const metricAlert_1 = require("./metricAlert");
Object.defineProperty(exports, "registerMetricAlertHelpers", { enumerable: true, get: function () { return metricAlert_1.registerMetricAlertHelpers; } });
const dynamicMetricAlert_1 = require("./dynamicMetricAlert");
Object.defineProperty(exports, "registerDynamicMetricAlertHelpers", { enumerable: true, get: function () { return dynamicMetricAlert_1.registerDynamicMetricAlertHelpers; } });
const logAlert_1 = require("./logAlert");
Object.defineProperty(exports, "registerLogAlertHelpers", { enumerable: true, get: function () { return logAlert_1.registerLogAlertHelpers; } });
const activityLogAlert_1 = require("./activityLogAlert");
Object.defineProperty(exports, "registerActivityLogAlertHelpers", { enumerable: true, get: function () { return activityLogAlert_1.registerActivityLogAlertHelpers; } });
const actionGroup_1 = require("./actionGroup");
Object.defineProperty(exports, "registerActionGroupHelpers", { enumerable: true, get: function () { return actionGroup_1.registerActionGroupHelpers; } });
const smartGroup_1 = require("./smartGroup");
Object.defineProperty(exports, "registerSmartGroupHelpers", { enumerable: true, get: function () { return smartGroup_1.registerSmartGroupHelpers; } });
/**
 * Register all alert helpers with Handlebars
 */
function registerAlertHelpers() {
    (0, metricAlert_1.registerMetricAlertHelpers)();
    (0, dynamicMetricAlert_1.registerDynamicMetricAlertHelpers)();
    (0, logAlert_1.registerLogAlertHelpers)();
    (0, activityLogAlert_1.registerActivityLogAlertHelpers)();
    (0, actionGroup_1.registerActionGroupHelpers)();
    (0, smartGroup_1.registerSmartGroupHelpers)();
}
