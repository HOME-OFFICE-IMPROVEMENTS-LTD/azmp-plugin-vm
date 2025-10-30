/**
 * Intelligent alert engine for enhanced monitoring.
 * Generates Azure Monitor alert definitions that combine
 * performance, cost, and scaling insights.
 */
export type AlertSeverity = 0 | 1 | 2 | 3 | 4;
export interface AlertActionDefinition {
    actionGroupIds?: string[];
    emails?: string[];
    webhookEndpoints?: Array<{
        serviceUri: string;
        properties?: Record<string, string>;
    }>;
}
export interface MetricAlertCondition {
    type: "metric";
    metricName: string;
    metricNamespace?: string;
    operator: "GreaterThan" | "GreaterThanOrEqual" | "LessThan" | "LessThanOrEqual";
    threshold: number;
    timeAggregation: "Average" | "Minimum" | "Maximum";
    dimensions?: Array<{
        name: string;
        operator: "Include" | "Exclude";
        values: string[];
    }>;
    evaluationPeriods?: number;
    dynamicThreshold?: {
        enabled: boolean;
        sensitivity: "High" | "Medium" | "Low";
        failSettlingPeriod?: number;
        ignoreDataBefore?: string;
    };
}
export interface LogAlertCondition {
    type: "log";
    query: string;
    timeWindow: string;
    operator: "GreaterThan" | "LessThan";
    threshold: number;
    frequency: string;
    alertSensitivity?: "Low" | "Medium" | "High";
}
export type AlertConditionDefinition = MetricAlertCondition | LogAlertCondition;
export interface AlertRuleDefinition {
    name: string;
    displayName: string;
    description: string;
    severity: AlertSeverity;
    signalType: "Metric" | "Log";
    scopes: string[];
    evaluationFrequency: string;
    windowSize: string;
    autoMitigate: boolean;
    enabled: boolean;
    condition: AlertConditionDefinition;
    actions: AlertActionDefinition;
    insights?: string[];
    metadata?: Record<string, string>;
}
export interface MetricAlertResource {
    type: "Microsoft.Insights/metricAlerts";
    apiVersion: "2018-03-01";
    name: string;
    location: "global";
    properties: {
        description: string;
        severity: AlertSeverity;
        enabled: boolean;
        scopes: string[];
        evaluationFrequency: string;
        windowSize: string;
        criteria: {
            allOf: Array<{
                name: string;
                metricName: string;
                metricNamespace?: string;
                operator: MetricAlertCondition["operator"];
                threshold: number;
                timeAggregation: MetricAlertCondition["timeAggregation"];
                dimensions?: MetricAlertCondition["dimensions"];
                dynamicThreshold?: MetricAlertCondition["dynamicThreshold"];
            }>;
        };
        autoMitigate: boolean;
        targetResourceType?: string;
        actions?: Array<{
            actionGroupId: string;
            webhookProperties?: Record<string, string>;
        }>;
    };
}
export interface ScheduledQueryResource {
    type: "Microsoft.Insights/scheduledQueryRules";
    apiVersion: "2022-10-01";
    name: string;
    location: "global";
    properties: {
        description: string;
        enabled: "Enabled" | "Disabled";
        source: {
            query: string;
            dataSourceId: string;
            queryType: "ResultCount";
            authorizedResources?: string[];
        };
        schedule: {
            frequencyInMinutes: number;
            timeWindowInMinutes: number;
        };
        action: {
            severity: AlertSeverity;
            aznsAction?: {
                actionGroup: string[];
                emailSubject?: string;
                customWebhookPayload?: string;
                properties?: Record<string, string>;
            };
            trigger: {
                operator: "GreaterThan" | "LessThan";
                threshold: number;
            };
        };
        autoMitigate?: boolean;
    };
}
export interface CpuAlertOptions {
    name?: string;
    displayName?: string;
    description?: string;
    resourceId: string;
    threshold?: number;
    evaluationFrequency?: string;
    windowSize?: string;
    severity?: AlertSeverity;
    actionGroupIds?: string[];
    emails?: string[];
    autoMitigate?: boolean;
}
export interface MemoryAlertOptions extends CpuAlertOptions {
    thresholdMb?: number;
}
export interface CostAnomalyAlertOptions {
    name?: string;
    displayName?: string;
    description?: string;
    scopeId: string;
    thresholdPercent?: number;
    severity?: AlertSeverity;
    actionGroupIds?: string[];
    emails?: string[];
    evaluationFrequency?: string;
    windowSize?: string;
}
export interface ScalingHealthAlertOptions {
    name?: string;
    displayName?: string;
    resourceId: string;
    severity?: AlertSeverity;
    failureCountThreshold?: number;
    evaluationFrequency?: string;
    windowSize?: string;
    actionGroupIds?: string[];
    emails?: string[];
}
export declare class MonitoringAlertEngine {
    private static buildMetricAlertDefinition;
    private static buildLogAlertDefinition;
    static createCpuAlert(options: CpuAlertOptions): AlertRuleDefinition;
    static createMemoryAlert(options: MemoryAlertOptions): AlertRuleDefinition;
    static createCostAnomalyAlert(options: CostAnomalyAlertOptions): AlertRuleDefinition;
    static createScalingHealthAlert(options: ScalingHealthAlertOptions): AlertRuleDefinition;
    static toMetricAlertResource(definition: AlertRuleDefinition): MetricAlertResource;
    static toScheduledQueryResource(definition: AlertRuleDefinition, workspaceId: string): ScheduledQueryResource;
}
