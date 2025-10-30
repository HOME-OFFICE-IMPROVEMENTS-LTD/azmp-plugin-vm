"use strict";
/**
 * Dashboard and Workbook Module
 *
 * Exports helpers for Azure Portal dashboards and Azure Monitor workbooks.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDashboardHelpers = registerDashboardHelpers;
const vmHealth_1 = require("./vmHealth");
const vmssScaling_1 = require("./vmssScaling");
const multiRegionHealth_1 = require("./multiRegionHealth");
const loadBalancerPerformance_1 = require("./loadBalancerPerformance");
const costAnalysis_1 = require("./costAnalysis");
const vmDiagnosticsWorkbook_1 = require("./vmDiagnosticsWorkbook");
const securityPostureWorkbook_1 = require("./securityPostureWorkbook");
const performanceAnalysisWorkbook_1 = require("./performanceAnalysisWorkbook");
__exportStar(require("./vmHealth"), exports);
__exportStar(require("./vmssScaling"), exports);
__exportStar(require("./multiRegionHealth"), exports);
__exportStar(require("./loadBalancerPerformance"), exports);
__exportStar(require("./costAnalysis"), exports);
__exportStar(require("./vmDiagnosticsWorkbook"), exports);
__exportStar(require("./securityPostureWorkbook"), exports);
__exportStar(require("./performanceAnalysisWorkbook"), exports);
/**
 * Register all dashboard and workbook helpers with Handlebars
 */
function registerDashboardHelpers() {
    // Dashboard helpers
    (0, vmHealth_1.registerVmHealthDashboardHelpers)();
    (0, vmssScaling_1.registerVmssScalingDashboardHelpers)();
    (0, multiRegionHealth_1.registerMultiRegionHealthDashboardHelpers)();
    (0, loadBalancerPerformance_1.registerLoadBalancerPerformanceDashboardHelpers)();
    (0, costAnalysis_1.registerCostAnalysisDashboardHelpers)();
    // Workbook helpers
    (0, vmDiagnosticsWorkbook_1.registerVmDiagnosticsWorkbookHelpers)();
    (0, securityPostureWorkbook_1.registerSecurityPostureWorkbookHelpers)();
    (0, performanceAnalysisWorkbook_1.registerPerformanceAnalysisWorkbookHelpers)();
}
