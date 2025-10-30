/**
 * Options for alert:dynamicMetricAlert helper
 * Creates ML-based dynamic threshold metric alerts
 */
export interface DynamicMetricAlertOptions {
    name: string;
    description?: string;
    severity: number;
    enabled?: boolean;
    scopes: string | string[];
    evaluationFrequency?: string;
    windowSize?: string;
    targetResourceType?: string;
    targetResourceRegion?: string;
    criteria: {
        metricName: string;
        metricNamespace?: string;
        operator: "GreaterThan" | "LessThan" | "GreaterOrLessThan";
        alertSensitivity: "Low" | "Medium" | "High";
        failingPeriods: {
            numberOfEvaluationPeriods: number;
            minFailingPeriodsToAlert: number;
        };
        timeAggregation: "Average" | "Minimum" | "Maximum" | "Total" | "Count";
        dimensions?: Array<{
            name: string;
            operator: "Include" | "Exclude";
            values: string[];
        }>;
        ignoreDataBefore?: string;
    }[];
    actionGroups?: string[];
    autoMitigate?: boolean;
    tags?: Record<string, string>;
}
/**
 * Handlebars helper to create dynamic threshold metric alert using ML
 *
 * @example
 * ```handlebars
 * {{{alert:dynamicMetricAlert
 *   name="dynamic-cpu-alert"
 *   description="ML-based CPU anomaly detection"
 *   severity=2
 *   scopes="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","alertSensitivity":"Medium","failingPeriods":{"numberOfEvaluationPeriods":4,"minFailingPeriodsToAlert":3},"timeAggregation":"Average"}]'
 * }}}
 * ```
 */
export declare function alertDynamicMetricAlert(this: unknown, hash: DynamicMetricAlertOptions): string;
export declare function registerDynamicMetricAlertHelpers(): void;
