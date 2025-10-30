/**
 * Advanced Azure Monitor Workbook Templates
 *
 * Integrates performance metrics, cost analysis, and scaling patterns
 * for comprehensive VM observability and operational insights.
 */
export interface AdvancedWorkbookTemplate {
    id: string;
    name: string;
    description: string;
    category: "vm-monitoring" | "cost-optimization" | "scaling-analytics" | "advanced-monitoring";
    tags: string[];
    version: string;
    complexity: "basic" | "intermediate" | "advanced" | "expert";
    estimatedSetupTime: string;
    prerequisites: string[];
    template: WorkbookDefinition;
}
export interface WorkbookDefinition {
    version: string;
    parameters: WorkbookParameter[];
    variables: WorkbookVariable[];
    resources: WorkbookResource[];
    items: WorkbookItem[];
    metadata: {
        templateId: string;
        integrations: string[];
        dataRetention: string;
        refreshInterval: string;
        costEstimate: string;
    };
}
export interface WorkbookParameter {
    name: string;
    type: "subscription" | "resourceGroup" | "resource" | "text" | "dropdown" | "timeRange" | "multiSelect";
    label: string;
    description: string;
    defaultValue?: any;
    required: boolean;
    multiSelect?: boolean;
    query?: string;
    datasource?: WorkbookDatasource;
    dependsOn?: string[];
    validation?: {
        regex?: string;
        minLength?: number;
        maxLength?: number;
        required?: boolean;
    };
    options?: Array<{
        label: string;
        value: string;
    }>;
}
export interface WorkbookDatasource {
    type: "Azure Resource Graph" | "Azure Monitor Logs" | "Azure Monitor Metrics" | "Azure Cost Management";
    resourceType?: string;
    namespace?: string;
    resourceUri?: string;
    workspace?: string;
    subscription?: string;
    timespan?: string;
}
export interface WorkbookItem {
    type: 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    content: any;
    conditionalVisibility?: {
        parameterName: string;
        comparison: string;
        value: any;
    };
    customWidth?: string;
    name?: string;
    styleSettings?: any;
    queryType?: number;
    resourceType?: string;
    datasource?: WorkbookDatasource;
    visualization?: "table" | "chart" | "grid" | "map" | "tiles" | "graph";
    chartSettings?: {
        type: "line" | "area" | "bar" | "scatter" | "pie" | "heatmap";
        yAxis?: string[];
        xAxis?: string;
        series?: any[];
        legend?: "top" | "bottom" | "left" | "right" | "hidden";
        annotations?: any[];
    };
    gridSettings?: {
        filter: boolean;
        sort: boolean;
        formatters: any[];
    };
}
export interface WorkbookVariable {
    name: string;
    type: 3 | "static" | "parameter";
    value: any;
    datasource?: WorkbookDatasource;
}
export interface WorkbookResource {
    type: string;
    name: string;
    properties: any;
}
/**
 * Advanced Workbook Template Generator
 * Combines performance, cost, and scaling analytics
 */
export declare class AdvancedWorkbookGenerator {
    /**
     * Generate comprehensive VM performance workbook
     * Integrates performance metrics, cost analysis, and scaling insights
     */
    static generateVmPerformanceWorkbook(options?: {
        subscriptionId?: string;
        resourceGroupName?: string;
        vmName?: string;
        location?: string;
        includePerformanceAnalysis?: boolean;
        includeCostAnalysis?: boolean;
        includeScalingAnalytics?: boolean;
        timeRange?: string;
    }): WorkbookDefinition;
    /**
     * Generate VMSS scaling analytics workbook
     * Focuses on autoscale performance and cost optimization
     */
    static generateVmssScalingWorkbook(options?: {
        vmssResourceId?: string;
        includeLoadPatterns?: boolean;
        includePredictiveAnalysis?: boolean;
        includeCostProjections?: boolean;
    }): WorkbookDefinition;
    /**
     * Generate cost optimization workbook
     * Integrates performance insights with cost recommendations
     */
    static generateCostOptimizationWorkbook(options?: {
        scope?: "subscription" | "resourceGroup" | "resource";
        includeRightsizing?: boolean;
        includeReservedInstances?: boolean;
        includeSpotRecommendations?: boolean;
    }): WorkbookDefinition;
    private static createHeaderItem;
    private static createParametersItem;
    private static createVmOverviewSection;
    private static createPerformanceAnalysisSection;
    private static createCostAnalysisSection;
    private static createScalingAnalyticsSection;
    private static createRecommendationsSection;
    private static createAlertsSection;
    private static createVmssOverviewSection;
    private static createLoadPatternSection;
    private static createAutoscalePerformanceSection;
    private static createPredictiveAnalysisSection;
    private static createScalingCostSection;
    private static createScalingOptimizationSection;
    private static createCostOverviewSection;
    private static createRightsizingSection;
    private static createReservedInstanceSection;
    private static createSpotInstanceSection;
    private static createPerformanceImpactSection;
    private static createCostActionItemsSection;
    private static getStandardParameters;
    private static getVmssParameters;
    private static getCostParameters;
    private static getStandardVariables;
    private static getVmssVariables;
    private static getCostVariables;
}
/**
 * Advanced workbook template registry
 */
export declare const advancedWorkbookTemplates: AdvancedWorkbookTemplate[];
