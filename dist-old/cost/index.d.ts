/**
 * Cost Optimization module exports.
 * Aggregates analyzers, recommendation engine, budgets, templates, and helpers.
 */
export { CostAnalyzer, vmPricingData, storagePricingData, type VmCostOptions, type VmCostBreakdown, type VmCostComparison, type ReservedInstanceSavings, type SpotInstanceSavings, type StorageCostResult, type HybridBenefitSavings, type CostForecastPoint, type VmPricingModel, } from "./analyzer";
export { CostRecommendationEngine, type RightSizingParams, type RightSizingRecommendation, type IdleResourceInsight, type ReservedInstanceOpportunity, type SpotInstanceOpportunity, } from "./recommendations";
export { createBudgetDefinition, createCostAlertTemplate, type BudgetDefinitionOptions, type BudgetNotificationOptions, type BudgetDefinition, type CostAlertTemplateOptions, type CostAlertTemplate, } from "./budgets";
export { registerCostHelpers } from "./helpers";
export interface CostOptimizationTemplate {
    id: string;
    name: string;
    category: "compute" | "storage" | "network" | "licensing";
    description: string;
    tags: string[];
    metrics: string[];
    recommendedActions: string[];
}
export declare function listCostOptimizationTemplates(): CostOptimizationTemplate[];
export declare function getCostOptimizationTemplate(id: string): CostOptimizationTemplate | null;
