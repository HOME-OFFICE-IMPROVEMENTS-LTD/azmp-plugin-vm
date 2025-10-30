/**
 * Options for alert:metricAlert helper
 * Creates static threshold metric alerts for Azure resources
 */
export interface MetricAlertOptions {
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
        operator: "Equals" | "NotEquals" | "GreaterThan" | "GreaterThanOrEqual" | "LessThan" | "LessThanOrEqual";
        threshold: number;
        timeAggregation: "Average" | "Minimum" | "Maximum" | "Total" | "Count";
        dimensions?: Array<{
            name: string;
            operator: "Include" | "Exclude";
            values: string[];
        }>;
    }[];
    actionGroups?: string[];
    autoMitigate?: boolean;
    tags?: Record<string, string>;
}
/**
 * Handlebars helper to create static threshold metric alert
 *
 * @example
 * ```handlebars
 * {{{alert:metricAlert
 *   name="high-cpu-alert"
 *   description="Alert when VM CPU exceeds 80%"
 *   severity=1
 *   scopes="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]'
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'ops-team')]"]'
 * }}}
 * ```
 */
export declare function alertMetricAlert(this: unknown, hash: MetricAlertOptions): string;
export declare function registerMetricAlertHelpers(): void;
