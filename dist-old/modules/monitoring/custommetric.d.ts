/**
 * Custom Metrics Helpers
 * Defines custom metrics for application-specific monitoring
 */
export interface CustomMetricOptions {
    name: string;
    namespace?: string;
    displayName?: string;
    description?: string;
    unit?: "Count" | "Bytes" | "Seconds" | "Percent" | "CountPerSecond" | "BytesPerSecond" | "Milliseconds";
    aggregation?: "Average" | "Sum" | "Min" | "Max" | "Total";
    dimensions?: string | string[];
}
/**
 * Define custom metric for application-specific monitoring
 * @example
 * {{monitor:customMetric
 *   name="OrderProcessingTime"
 *   namespace="ECommerce/Orders"
 *   displayName="Order Processing Time"
 *   description="Time to process customer order in milliseconds"
 *   unit="Milliseconds"
 *   aggregation="Average"
 *   dimensions='["Region","PaymentMethod","OrderType"]'
 * }}
 */
export declare function monitorCustomMetric(this: any, options: any): string;
export declare function registerCustomMetricHelpers(): void;
