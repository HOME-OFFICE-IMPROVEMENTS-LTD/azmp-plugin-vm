export interface VmDiagnosticsWorkbookOptions {
    name: string;
    location: string;
    resourceGroup: string;
    vmResourceIds: string[];
    workspaceResourceId?: string;
    showBootDiagnostics?: boolean;
    showPerformanceCounters?: boolean;
    showEventLogs?: boolean;
    showNetworkDiagnostics?: boolean;
    tags?: Record<string, string>;
}
/**
 * Generate VM diagnostics workbook with detailed troubleshooting queries
 */
export declare function workbookVmDiagnostics(this: unknown, options: VmDiagnosticsWorkbookOptions): string;
export declare function registerVmDiagnosticsWorkbookHelpers(): void;
