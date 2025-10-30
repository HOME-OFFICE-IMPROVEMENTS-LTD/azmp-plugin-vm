export interface PerformanceAnalysisWorkbookOptions {
    name: string;
    location: string;
    resourceGroup: string;
    workspaceResourceId: string;
    resourceIds?: string[];
    showCpuAnalysis?: boolean;
    showMemoryAnalysis?: boolean;
    showDiskAnalysis?: boolean;
    showNetworkAnalysis?: boolean;
    showAnomalies?: boolean;
    tags?: Record<string, string>;
}
/**
 * Generate performance analysis workbook with detailed metrics and anomaly detection
 */
export declare function workbookPerformanceAnalysis(this: unknown, options: PerformanceAnalysisWorkbookOptions): string;
export declare function registerPerformanceAnalysisWorkbookHelpers(): void;
