export interface CostAnalysisDashboardOptions {
    name: string;
    location: string;
    subscriptionId: string;
    resourceGroups?: string[];
    showCostTrends?: boolean;
    showCostByService?: boolean;
    showCostByRegion?: boolean;
    showBudgetStatus?: boolean;
    timeRange?: string;
    tags?: Record<string, string>;
}
/**
 * Generate cost analysis dashboard
 */
export declare function dashboardCostAnalysis(this: unknown, options: CostAnalysisDashboardOptions): string;
export declare function registerCostAnalysisDashboardHelpers(): void;
