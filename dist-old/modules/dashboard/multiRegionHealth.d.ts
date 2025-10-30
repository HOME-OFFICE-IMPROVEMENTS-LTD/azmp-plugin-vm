export interface MultiRegionHealthDashboardOptions {
    name: string;
    location: string;
    regions: Array<{
        name: string;
        vmResourceIds?: string[];
        vmssResourceIds?: string[];
        loadBalancerResourceId?: string;
    }>;
    showAvailability?: boolean;
    showLatency?: boolean;
    showThroughput?: boolean;
    timeRange?: string;
    tags?: Record<string, string>;
}
/**
 * Generate multi-region health dashboard
 */
export declare function dashboardMultiRegionHealth(this: unknown, options: MultiRegionHealthDashboardOptions): string;
export declare function registerMultiRegionHealthDashboardHelpers(): void;
