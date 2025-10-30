export interface VmHealthDashboardOptions {
    name: string;
    location: string;
    resourceGroup?: string;
    vmResourceIds: string[];
    showCpuMetrics?: boolean;
    showMemoryMetrics?: boolean;
    showDiskMetrics?: boolean;
    showNetworkMetrics?: boolean;
    timeRange?: string;
    refreshInterval?: string;
    tags?: Record<string, string>;
}
/**
 * Generate VM health dashboard with metrics visualization
 */
export declare function dashboardVmHealth(this: unknown, options: VmHealthDashboardOptions): string;
export declare function registerVmHealthDashboardHelpers(): void;
