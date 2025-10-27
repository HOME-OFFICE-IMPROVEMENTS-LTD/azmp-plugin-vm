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

import { registerMetricAlertHelpers } from "./metricAlert";
import { registerDynamicMetricAlertHelpers } from "./dynamicMetricAlert";
import { registerLogAlertHelpers } from "./logAlert";
import { registerActivityLogAlertHelpers } from "./activityLogAlert";
import { registerActionGroupHelpers } from "./actionGroup";
import { registerSmartGroupHelpers } from "./smartGroup";

export {
  registerMetricAlertHelpers,
  registerDynamicMetricAlertHelpers,
  registerLogAlertHelpers,
  registerActivityLogAlertHelpers,
  registerActionGroupHelpers,
  registerSmartGroupHelpers,
};

export type { MetricAlertOptions } from "./metricAlert";
export type { DynamicMetricAlertOptions } from "./dynamicMetricAlert";
export type { LogAlertOptions } from "./logAlert";
export type { ActivityLogAlertOptions } from "./activityLogAlert";
export type { ActionGroupOptions } from "./actionGroup";
export type { SmartGroupOptions } from "./smartGroup";

/**
 * Register all alert helpers with Handlebars
 */
export function registerAlertHelpers(): void {
  registerMetricAlertHelpers();
  registerDynamicMetricAlertHelpers();
  registerLogAlertHelpers();
  registerActivityLogAlertHelpers();
  registerActionGroupHelpers();
  registerSmartGroupHelpers();
}
