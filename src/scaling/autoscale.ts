/**
 * Scaling Module - Auto-scaling Policies
 *
 * Provides auto-scaling policy definitions for Virtual Machine Scale Sets
 * including metric-based and schedule-based scaling rules.
 *
 * @module scaling/autoscale
 */

export type MetricName = 
  | 'Percentage CPU'
  | 'Available Memory Bytes'
  | 'Network In Total'
  | 'Network Out Total'
  | 'Disk Read Bytes/Sec'
  | 'Disk Write Bytes/Sec'
  | 'Data Disk Read Bytes/Sec'
  | 'Data Disk Write Bytes/Sec';

export type ScaleDirection = 'Increase' | 'Decrease';
export type TimeAggregationType = 'Average' | 'Minimum' | 'Maximum' | 'Total' | 'Count' | 'Last';
export type ComparisonOperator = 'Equals' | 'NotEquals' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual';

/**
 * Metric-based scaling rule configuration
 */
export interface MetricScaleRule {
  metricName: MetricName;
  metricResourceUri?: string;
  timeGrain: string; // ISO 8601 duration (e.g., 'PT1M' for 1 minute)
  statistic: TimeAggregationType;
  timeWindow: string; // ISO 8601 duration (e.g., 'PT5M' for 5 minutes)
  timeAggregation: TimeAggregationType;
  operator: ComparisonOperator;
  threshold: number;
  direction: ScaleDirection;
  cooldown: string; // ISO 8601 duration (e.g., 'PT5M' for 5 minutes)
  type?: 'ChangeCount' | 'PercentChangeCount' | 'ExactCount';
  value?: number; // Scale amount
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
    frequency: 'Week' | 'Month';
    schedule: {
      timeZone: string;
      days: string[];
      hours: number[];
      minutes: number[];
    };
  };
  fixedDate?: {
    timeZone: string;
    start: string; // ISO 8601 datetime
    end: string;   // ISO 8601 datetime
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
    frequency: 'Week' | 'Month';
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
    operation: 'Scale';
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
export function createMetricScaleRule(options: MetricScaleRule): Record<string, unknown> {
  if (!options.metricName) {
    throw new Error('Metric scale rule requires a metricName');
  }

  if (typeof options.threshold !== 'number') {
    throw new Error('Metric scale rule requires a numeric threshold');
  }

  return {
    metricTrigger: {
      metricName: options.metricName,
      metricNamespace: '',
      metricResourceUri: options.metricResourceUri || '[resourceId("Microsoft.Compute/virtualMachineScaleSets", parameters("vmssName"))]',
      timeGrain: options.timeGrain || 'PT1M',
      statistic: options.statistic || 'Average',
      timeWindow: options.timeWindow || 'PT5M',
      timeAggregation: options.timeAggregation || 'Average',
      operator: options.operator || 'GreaterThan',
      threshold: options.threshold,
      dimensions: [],
      dividePerInstance: false
    },
    scaleAction: {
      direction: options.direction,
      type: options.type || 'ChangeCount',
      value: options.value?.toString() || '1',
      cooldown: options.cooldown || 'PT5M'
    }
  };
}

/**
 * Create a schedule-based scaling profile
 */
export function createScheduleProfile(options: ScheduleScaleRule): Record<string, unknown> {
  if (!options.name) {
    throw new Error('Schedule profile requires a name');
  }

  if (!options.capacity || typeof options.capacity.minimum !== 'number') {
    throw new Error('Schedule profile requires capacity with minimum value');
  }

  const profile: Record<string, any> = {
    name: options.name,
    capacity: {
      minimum: options.capacity.minimum.toString(),
      maximum: options.capacity.maximum.toString(),
      default: options.capacity.default.toString()
    },
    rules: []
  };

  if (options.fixedDate) {
    profile.fixedDate = {
      timeZone: options.fixedDate.timeZone || 'UTC',
      start: options.fixedDate.start,
      end: options.fixedDate.end
    };
  }

  if (options.recurrence) {
    profile.recurrence = {
      frequency: options.recurrence.frequency,
      schedule: {
        timeZone: options.recurrence.schedule.timeZone || 'UTC',
        days: options.recurrence.schedule.days,
        hours: options.recurrence.schedule.hours,
        minutes: options.recurrence.schedule.minutes
      }
    };
  }

  return profile;
}

/**
 * Create an auto-scaling policy resource definition
 */
export function createAutoScalePolicy(options: AutoScalePolicyOptions): Record<string, unknown> {
  if (!options.name) {
    throw new Error('Auto-scale policy requires a name');
  }

  if (!options.targetResourceUri) {
    throw new Error('Auto-scale policy requires a targetResourceUri');
  }

  if (!options.profiles || options.profiles.length === 0) {
    throw new Error('Auto-scale policy requires at least one profile');
  }

  const resource: Record<string, any> = {
    type: 'Microsoft.Insights/autoscalesettings',
    apiVersion: '2022-10-01',
    name: options.name,
    location: '[resourceGroup().location]',
    properties: {
      name: options.name,
      enabled: options.enabled !== false,
      targetResourceUri: options.targetResourceUri,
      profiles: options.profiles.map(profile => {
        const profileDef: Record<string, any> = {
          name: profile.name,
          capacity: {
            minimum: profile.capacity.minimum.toString(),
            maximum: profile.capacity.maximum.toString(),
            default: profile.capacity.default.toString()
          },
          rules: profile.rules.map(rule => createMetricScaleRule(rule))
        };

        if (profile.fixedDate) {
          profileDef.fixedDate = {
            timeZone: profile.fixedDate.timeZone || 'UTC',
            start: profile.fixedDate.start,
            end: profile.fixedDate.end
          };
        }

        if (profile.recurrence) {
          profileDef.recurrence = {
            frequency: profile.recurrence.frequency,
            schedule: {
              timeZone: profile.recurrence.schedule.timeZone || 'UTC',
              days: profile.recurrence.schedule.days,
              hours: profile.recurrence.schedule.hours,
              minutes: profile.recurrence.schedule.minutes
            }
          };
        }

        return profileDef;
      })
    }
  };

  if (options.notifications && options.notifications.length > 0) {
    resource.properties.notifications = options.notifications;
  }

  if (options.tags) {
    resource.tags = options.tags;
  }

  return resource;
}

/**
 * Create a common CPU-based scaling policy
 */
export function createCpuScalingPolicy(options: {
  name: string;
  targetResourceUri: string;
  scaleOutThreshold?: number;
  scaleInThreshold?: number;
  minInstances?: number;
  maxInstances?: number;
  defaultInstances?: number;
}): Record<string, unknown> {
  const scaleOutThreshold = options.scaleOutThreshold ?? 75;
  const scaleInThreshold = options.scaleInThreshold ?? 25;
  const minInstances = options.minInstances ?? 2;
  const maxInstances = options.maxInstances ?? 10;
  const defaultInstances = options.defaultInstances ?? 2;

  return createAutoScalePolicy({
    name: options.name,
    targetResourceUri: options.targetResourceUri,
    profiles: [{
      name: 'Default Profile',
      capacity: {
        minimum: minInstances,
        maximum: maxInstances,
        default: defaultInstances
      },
      rules: [
        {
          metricName: 'Percentage CPU',
          timeGrain: 'PT1M',
          statistic: 'Average',
          timeWindow: 'PT5M',
          timeAggregation: 'Average',
          operator: 'GreaterThan',
          threshold: scaleOutThreshold,
          direction: 'Increase',
          cooldown: 'PT5M',
          type: 'ChangeCount',
          value: 1
        },
        {
          metricName: 'Percentage CPU',
          timeGrain: 'PT1M',
          statistic: 'Average',
          timeWindow: 'PT5M',
          timeAggregation: 'Average',
          operator: 'LessThan',
          threshold: scaleInThreshold,
          direction: 'Decrease',
          cooldown: 'PT5M',
          type: 'ChangeCount',
          value: 1
        }
      ]
    }]
  });
}

/**
 * Create a business hours scaling schedule
 */
export function createBusinessHoursSchedule(options: {
  name: string;
  businessHoursCapacity: { min: number; max: number; default: number };
  offHoursCapacity: { min: number; max: number; default: number };
  timeZone?: string;
  businessDays?: string[];
  businessHours?: { start: number; end: number };
}): AutoScaleProfile[] {
  const timeZone = options.timeZone || 'UTC';
  const businessDays = options.businessDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const businessHours = options.businessHours || { start: 9, end: 17 };

  return [
    {
      name: 'Business Hours Profile',
      capacity: {
        minimum: options.businessHoursCapacity.min,
        maximum: options.businessHoursCapacity.max,
        default: options.businessHoursCapacity.default
      },
      rules: [],
      recurrence: {
        frequency: 'Week',
        schedule: {
          timeZone,
          days: businessDays,
          hours: Array.from({ length: businessHours.end - businessHours.start }, (_, i) => businessHours.start + i),
          minutes: [0]
        }
      }
    },
    {
      name: 'Off Hours Profile',
      capacity: {
        minimum: options.offHoursCapacity.min,
        maximum: options.offHoursCapacity.max,
        default: options.offHoursCapacity.default
      },
      rules: [],
      recurrence: {
        frequency: 'Week',
        schedule: {
          timeZone,
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: [
            ...Array.from({ length: businessHours.start }, (_, i) => i),
            ...Array.from({ length: 24 - businessHours.end }, (_, i) => businessHours.end + i)
          ],
          minutes: [0]
        }
      }
    }
  ];
}

/**
 * Exported helper map for registration
 */
export const autoscaleHelpers = {
  'scale:autoscale.policy': createAutoScalePolicy,
  'scale:autoscale.metric': createMetricScaleRule,
  'scale:autoscale.schedule': createScheduleProfile,
  'scale:autoscale.cpu': createCpuScalingPolicy,
  'scale:autoscale.businessHours': createBusinessHoursSchedule
};