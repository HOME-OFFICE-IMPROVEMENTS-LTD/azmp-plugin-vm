/**
 * Options for alert:logAlert helper
 * Creates KQL query-based log alerts from Log Analytics
 */
export interface LogAlertOptions {
    name: string;
    description?: string;
    severity: number;
    enabled?: boolean;
    scopes: string | string[];
    evaluationFrequency?: string;
    windowSize?: string;
    query: string;
    metricMeasureColumn?: string;
    operator?: "GreaterThan" | "LessThan" | "Equal";
    threshold?: number;
    numberOfEvaluationPeriods?: number;
    minFailingPeriodsToAlert?: number;
    actionGroups?: string[];
    autoMitigate?: boolean;
    checkWorkspaceAlertsStorageConfigured?: boolean;
    skipQueryValidation?: boolean;
    muteActionsDuration?: string;
    tags?: Record<string, string>;
}
/**
 * Handlebars helper to create log alert based on KQL query
 *
 * @example
 * ```handlebars
 * {{{alert:logAlert
 *   name="failed-login-alert"
 *   description="Alert on multiple failed login attempts"
 *   severity=1
 *   scopes="[resourceId('Microsoft.OperationalInsights/workspaces', 'law-prod')]"
 *   query="SecurityEvent | where EventID == 4625 | summarize count() by Computer | where count_ > 5"
 *   operator="GreaterThan"
 *   threshold=0
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'security-team')]"]'
 * }}}
 * ```
 */
export declare function alertLogAlert(this: unknown, hash: LogAlertOptions): string;
export declare function registerLogAlertHelpers(): void;
