export interface LoadBalancerPerformanceDashboardOptions {
    name: string;
    location: string;
    loadBalancerResourceId: string;
    showHealthProbe?: boolean;
    showThroughput?: boolean;
    showConnections?: boolean;
    showSnatPorts?: boolean;
    timeRange?: string;
    tags?: Record<string, string>;
}
/**
 * Generate load balancer performance dashboard
 */
export declare function dashboardLoadBalancerPerformance(this: unknown, options: LoadBalancerPerformanceDashboardOptions): string;
export declare function registerLoadBalancerPerformanceDashboardHelpers(): void;
