/**
 * Azure Diagnostic Settings Helpers
 * Configures log and metric forwarding to Log Analytics, Storage, or Event Hub
 */
export interface DiagnosticSettingsOptions {
    targetResourceId: string;
    workspaceId?: string;
    storageAccountId?: string;
    eventHubAuthorizationRuleId?: string;
    eventHubName?: string;
    logs?: string | string[];
    metrics?: string | string[];
    retentionDays?: number;
    name?: string;
}
/**
 * Configure diagnostic settings for Azure resources
 * @example
 * {{monitor:diagnosticSettings
 *   targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
 *   workspaceId="[parameters('logAnalyticsWorkspaceId')]"
 *   logs='["Administrative","Security","ServiceHealth"]'
 *   metrics='["AllMetrics"]'
 *   retentionDays=30
 * }}
 */
export declare function monitorDiagnosticSettings(this: any, options: any): string;
export declare function registerDiagnosticsHelpers(): void;
