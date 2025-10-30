/**
 * Log Analytics Workspace Helpers
 * Creates and configures Log Analytics workspaces for centralized logging
 */
export interface LogAnalyticsWorkspaceOptions {
    name: string;
    location?: string;
    sku?: "Free" | "PerGB2018" | "PerNode" | "Premium" | "Standalone" | "Standard";
    retentionInDays?: number;
    dailyQuotaGb?: number;
    publicNetworkAccessForIngestion?: "Enabled" | "Disabled";
    publicNetworkAccessForQuery?: "Enabled" | "Disabled";
    tags?: Record<string, string>;
}
/**
 * Create Log Analytics workspace for centralized logging
 * @example
 * {{monitor:logAnalyticsWorkspace
 *   name="vmss-logs-workspace"
 *   location="East US"
 *   sku="PerGB2018"
 *   retentionInDays=90
 *   dailyQuotaGb=10
 * }}
 */
export declare function monitorLogAnalyticsWorkspace(this: any, options: any): string;
export declare function registerWorkspaceHelpers(): void;
