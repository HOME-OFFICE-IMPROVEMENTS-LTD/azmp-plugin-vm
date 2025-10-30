/**
 * Azure Monitor Metrics Helpers
 * Configures metric collection for VMs and VMSS
 */
export interface MetricsOptions {
    targetResourceId: string;
    metricNamespace?: string;
    metrics?: string | string[];
    aggregation?: "Average" | "Min" | "Max" | "Total" | "Count";
    frequency?: "PT1M" | "PT5M" | "PT15M" | "PT1H";
}
/**
 * Configure metric collection for Azure resources
 * @example
 * {{monitor:metrics
 *   targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   metricNamespace="Microsoft.Compute/virtualMachineScaleSets"
 *   metrics='["Percentage CPU","Available Memory Bytes","Network In Total"]'
 *   aggregation="Average"
 *   frequency="PT1M"
 * }}
 */
export declare function monitorMetrics(this: any, options: any): string;
export declare function registerMetricsHelpers(): void;
