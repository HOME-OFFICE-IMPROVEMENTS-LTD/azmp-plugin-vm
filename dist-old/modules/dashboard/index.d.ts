/**
 * Dashboard and Workbook Module
 *
 * Exports helpers for Azure Portal dashboards and Azure Monitor workbooks.
 */
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
export declare function registerDashboardHelpers(): void;
