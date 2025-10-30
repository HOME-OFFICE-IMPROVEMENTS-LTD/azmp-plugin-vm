/**
 * Scaling Module - Auto-scaling Policies
 *
 * Provides auto-scaling policy definitions for Virtual Machine Scale Sets
 * including metric-based and schedule-based scaling rules.
 *
 * @module scaling/autoscale
 */
export type MetricName = "Percentage CPU" | "Available Memory Bytes" | "Network In Total" | "Network Out Total" | "Disk Read Bytes/Sec" | "Disk Write Bytes/Sec" | "Data Disk Read Bytes/Sec" | "Data Disk Write Bytes/Sec";
export type ScaleDirection = "Increase" | "Decrease";
export type TimeAggregationType = "Average" | "Minimum" | "Maximum" | "Total" | "Count" | "Last";
export type ComparisonOperator = "Equals" | "NotEquals" | "GreaterThan" | "GreaterThanOrEqual" | "LessThan" | "LessThanOrEqual";
/**
 * Metric-based scaling rule configuration
 */
export interface MetricScaleRule {
    metricName: MetricName;
    metricResourceUri?: string;
    timeGrain: string;
    statistic: TimeAggregationType;
    timeWindow: string;
    timeAggregation: TimeAggregationType;
    operator: ComparisonOperator;
    threshold: number;
    direction: ScaleDirection;
    cooldown: string;
    type?: "ChangeCount" | "PercentChangeCount" | "ExactCount";
    value?: number;
}
/**
 * Schedule-based scaling rule configuration
 */
export interface ScheduleScaleRule {
    name: string;
    capacity: {
        minimum: number;
        maximum: number;
        default: number;
    };
    recurrence?: {
        frequency: "Week" | "Month";
        schedule: {
            timeZone: string;
            days: string[];
            hours: number[];
            minutes: number[];
        };
    };
    fixedDate?: {
        timeZone: string;
        start: string;
        end: string;
    };
}
/**
 * Auto-scaling profile configuration
 */
export interface AutoScaleProfile {
    name: string;
    capacity: {
        minimum: number;
        maximum: number;
        default: number;
    };
    rules: MetricScaleRule[];
    fixedDate?: {
        timeZone: string;
        start: string;
        end: string;
    };
    recurrence?: {
        frequency: "Week" | "Month";
        schedule: {
            timeZone: string;
            days: string[];
            hours: number[];
            minutes: number[];
        };
    };
}
/**
 * Auto-scaling policy options
 */
export interface AutoScalePolicyOptions {
    name: string;
    targetResourceUri: string;
    enabled?: boolean;
    profiles: AutoScaleProfile[];
    notifications?: {
        operation: "Scale";
        email?: {
            sendToSubscriptionAdministrator?: boolean;
            sendToSubscriptionCoAdministrators?: boolean;
            customEmails?: string[];
        };
        webhooks?: Array<{
            serviceUri: string;
            properties?: Record<string, string>;
        }>;
    }[];
    tags?: Record<string, string>;
}
/**
 * Create a metric-based scaling rule
 */
export declare function createMetricScaleRule(options: MetricScaleRule): Record<string, unknown>;
/**
 * Create a schedule-based scaling profile
 */
export declare function createScheduleProfile(options: ScheduleScaleRule): Record<string, unknown>;
/**
 * Create an auto-scaling policy resource definition
 */
export declare function createAutoScalePolicy(options: AutoScalePolicyOptions): Record<string, unknown>;
/**
 * Create a common CPU-based scaling policy
 */
export declare function createCpuScalingPolicy(options: {
    name: string;
    targetResourceUri: string;
    scaleOutThreshold?: number;
    scaleInThreshold?: number;
    minInstances?: number;
    maxInstances?: number;
    defaultInstances?: number;
}): Record<string, unknown>;
/**
 * Create a business hours scaling schedule
 */
export declare function createBusinessHoursSchedule(options: {
    name: string;
    businessHoursCapacity: {
        min: number;
        max: number;
        default: number;
    };
    offHoursCapacity: {
        min: number;
        max: number;
        default: number;
    };
    timeZone?: string;
    businessDays?: string[];
    businessHours?: {
        start: number;
        end: number;
    };
}): AutoScaleProfile[];
/**
 * Exported helper map for registration
 */
export declare const autoscaleHelpers: {
    "scale:autoscale.policy": typeof createAutoScalePolicy;
    "scale:autoscale.metric": typeof createMetricScaleRule;
    "scale:autoscale.schedule": typeof createScheduleProfile;
    "scale:autoscale.cpu": typeof createCpuScalingPolicy;
    "scale:autoscale.businessHours": typeof createBusinessHoursSchedule;
};
