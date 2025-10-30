export interface VmssScalingDashboardOptions {
    name: string;
    location: string;
    vmssResourceId: string;
    showInstanceCount?: boolean;
    showCpuMetrics?: boolean;
    showMemoryMetrics?: boolean;
    showRequestMetrics?: boolean;
    timeRange?: string;
    refreshInterval?: string;
    tags?: Record<string, string>;
}
/**
 * Generate VMSS scaling dashboard with autoscale metrics
 */
export declare function dashboardVmssScaling(this: unknown, options: VmssScalingDashboardOptions): string;
export declare function registerVmssScalingDashboardHelpers(): void;
