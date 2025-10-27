/**
 * Azure Monitoring Module
 * Provides helpers for Azure Monitor, Log Analytics, Application Insights, and custom metrics
 */

import { registerMetricsHelpers } from './metrics';
import { registerDiagnosticsHelpers } from './diagnostics';
import { registerWorkspaceHelpers } from './workspace';
import { registerAppInsightsHelpers } from './appinsights';
import { registerDataCollectionHelpers } from './datacollection';
import { registerCustomMetricHelpers } from './custommetric';

/**
 * Register all monitoring helpers
 */
export function registerMonitoringHelpers(): void {
  registerMetricsHelpers();
  registerDiagnosticsHelpers();
  registerWorkspaceHelpers();
  registerAppInsightsHelpers();
  registerDataCollectionHelpers();
  registerCustomMetricHelpers();
}

// Export individual helper registrations for selective use
export {
  registerMetricsHelpers,
  registerDiagnosticsHelpers,
  registerWorkspaceHelpers,
  registerAppInsightsHelpers,
  registerDataCollectionHelpers,
  registerCustomMetricHelpers
};

// Export types
export type {
  MetricsOptions
} from './metrics';

export type {
  DiagnosticSettingsOptions
} from './diagnostics';

export type {
  LogAnalyticsWorkspaceOptions
} from './workspace';

export type {
  ApplicationInsightsOptions
} from './appinsights';

export type {
  DataCollectionRuleOptions
} from './datacollection';

export type {
  CustomMetricOptions
} from './custommetric';
