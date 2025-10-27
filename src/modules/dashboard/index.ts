/**
 * Dashboard and Workbook Module
 *
 * Exports helpers for Azure Portal dashboards and Azure Monitor workbooks.
 */

import { registerVmHealthDashboardHelpers } from "./vmHealth";
import { registerVmssScalingDashboardHelpers } from "./vmssScaling";
import { registerMultiRegionHealthDashboardHelpers } from "./multiRegionHealth";
import { registerLoadBalancerPerformanceDashboardHelpers } from "./loadBalancerPerformance";
import { registerCostAnalysisDashboardHelpers } from "./costAnalysis";
import { registerVmDiagnosticsWorkbookHelpers } from "./vmDiagnosticsWorkbook";
import { registerSecurityPostureWorkbookHelpers } from "./securityPostureWorkbook";
import { registerPerformanceAnalysisWorkbookHelpers } from "./performanceAnalysisWorkbook";

export * from "./vmHealth";
export * from "./vmssScaling";
export * from "./multiRegionHealth";
export * from "./loadBalancerPerformance";
export * from "./costAnalysis";
export * from "./vmDiagnosticsWorkbook";
export * from "./securityPostureWorkbook";
export * from "./performanceAnalysisWorkbook";

/**
 * Register all dashboard and workbook helpers with Handlebars
 */
export function registerDashboardHelpers(): void {
  // Dashboard helpers
  registerVmHealthDashboardHelpers();
  registerVmssScalingDashboardHelpers();
  registerMultiRegionHealthDashboardHelpers();
  registerLoadBalancerPerformanceDashboardHelpers();
  registerCostAnalysisDashboardHelpers();

  // Workbook helpers
  registerVmDiagnosticsWorkbookHelpers();
  registerSecurityPostureWorkbookHelpers();
  registerPerformanceAnalysisWorkbookHelpers();
}
