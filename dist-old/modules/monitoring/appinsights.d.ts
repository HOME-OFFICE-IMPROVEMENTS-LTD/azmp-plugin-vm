/**
 * Application Insights Helpers
 * Configures Application Insights for application performance monitoring
 */
export interface ApplicationInsightsOptions {
    name: string;
    location?: string;
    applicationType?: "web" | "other";
    workspaceId?: string;
    samplingPercentage?: number;
    retentionInDays?: number;
    disableIpMasking?: boolean;
    disableLocalAuth?: boolean;
    tags?: Record<string, string>;
}
/**
 * Configure Application Insights for application telemetry
 * @example
 * {{monitor:applicationInsights
 *   name="web-app-insights"
 *   location="East US"
 *   applicationType="web"
 *   workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-workspace')]"
 *   samplingPercentage=100
 *   retentionInDays=90
 * }}
 */
export declare function monitorApplicationInsights(this: any, options: any): string;
export declare function registerAppInsightsHelpers(): void;
