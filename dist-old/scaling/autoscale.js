"use strict";
/**
 * Scaling Module - Auto-scaling Policies
 *
 * Provides auto-scaling policy definitions for Virtual Machine Scale Sets
 * including metric-based and schedule-based scaling rules.
 *
 * @module scaling/autoscale
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoscaleHelpers = void 0;
exports.createMetricScaleRule = createMetricScaleRule;
exports.createScheduleProfile = createScheduleProfile;
exports.createAutoScalePolicy = createAutoScalePolicy;
exports.createCpuScalingPolicy = createCpuScalingPolicy;
exports.createBusinessHoursSchedule = createBusinessHoursSchedule;
/**
 * Create a metric-based scaling rule
 */
function createMetricScaleRule(options) {
    if (!options.metricName) {
        throw new Error("Metric scale rule requires a metricName");
    }
    if (typeof options.threshold !== "number") {
        throw new Error("Metric scale rule requires a numeric threshold");
    }
    return {
        metricTrigger: {
            metricName: options.metricName,
            metricNamespace: "",
            metricResourceUri: options.metricResourceUri ||
                '[resourceId("Microsoft.Compute/virtualMachineScaleSets", parameters("vmssName"))]',
            timeGrain: options.timeGrain || "PT1M",
            statistic: options.statistic || "Average",
            timeWindow: options.timeWindow || "PT5M",
            timeAggregation: options.timeAggregation || "Average",
            operator: options.operator || "GreaterThan",
            threshold: options.threshold,
            dimensions: [],
            dividePerInstance: false,
        },
        scaleAction: {
            direction: options.direction,
            type: options.type || "ChangeCount",
            value: options.value?.toString() || "1",
            cooldown: options.cooldown || "PT5M",
        },
    };
}
/**
 * Create a schedule-based scaling profile
 */
function createScheduleProfile(options) {
    if (!options.name) {
        throw new Error("Schedule profile requires a name");
    }
    if (!options.capacity || typeof options.capacity.minimum !== "number") {
        throw new Error("Schedule profile requires capacity with minimum value");
    }
    const profile = {
        name: options.name,
        capacity: {
            minimum: options.capacity.minimum.toString(),
            maximum: options.capacity.maximum.toString(),
            default: options.capacity.default.toString(),
        },
        rules: [],
    };
    if (options.fixedDate) {
        profile.fixedDate = {
            timeZone: options.fixedDate.timeZone || "UTC",
            start: options.fixedDate.start,
            end: options.fixedDate.end,
        };
    }
    if (options.recurrence) {
        profile.recurrence = {
            frequency: options.recurrence.frequency,
            schedule: {
                timeZone: options.recurrence.schedule.timeZone || "UTC",
                days: options.recurrence.schedule.days,
                hours: options.recurrence.schedule.hours,
                minutes: options.recurrence.schedule.minutes,
            },
        };
    }
    return profile;
}
/**
 * Create an auto-scaling policy resource definition
 */
function createAutoScalePolicy(options) {
    if (!options.name) {
        throw new Error("Auto-scale policy requires a name");
    }
    if (!options.targetResourceUri) {
        throw new Error("Auto-scale policy requires a targetResourceUri");
    }
    if (!options.profiles || options.profiles.length === 0) {
        throw new Error("Auto-scale policy requires at least one profile");
    }
    const resource = {
        type: "Microsoft.Insights/autoscalesettings",
        apiVersion: "2022-10-01",
        name: options.name,
        location: "[resourceGroup().location]",
        properties: {
            name: options.name,
            enabled: options.enabled !== false,
            targetResourceUri: options.targetResourceUri,
            profiles: options.profiles.map((profile) => {
                const profileDef = {
                    name: profile.name,
                    capacity: {
                        minimum: profile.capacity.minimum.toString(),
                        maximum: profile.capacity.maximum.toString(),
                        default: profile.capacity.default.toString(),
                    },
                    rules: profile.rules.map((rule) => createMetricScaleRule(rule)),
                };
                if (profile.fixedDate) {
                    profileDef.fixedDate = {
                        timeZone: profile.fixedDate.timeZone || "UTC",
                        start: profile.fixedDate.start,
                        end: profile.fixedDate.end,
                    };
                }
                if (profile.recurrence) {
                    profileDef.recurrence = {
                        frequency: profile.recurrence.frequency,
                        schedule: {
                            timeZone: profile.recurrence.schedule.timeZone || "UTC",
                            days: profile.recurrence.schedule.days,
                            hours: profile.recurrence.schedule.hours,
                            minutes: profile.recurrence.schedule.minutes,
                        },
                    };
                }
                return profileDef;
            }),
        },
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
function createCpuScalingPolicy(options) {
    const scaleOutThreshold = options.scaleOutThreshold ?? 75;
    const scaleInThreshold = options.scaleInThreshold ?? 25;
    const minInstances = options.minInstances ?? 2;
    const maxInstances = options.maxInstances ?? 10;
    const defaultInstances = options.defaultInstances ?? 2;
    return createAutoScalePolicy({
        name: options.name,
        targetResourceUri: options.targetResourceUri,
        profiles: [
            {
                name: "Default Profile",
                capacity: {
                    minimum: minInstances,
                    maximum: maxInstances,
                    default: defaultInstances,
                },
                rules: [
                    {
                        metricName: "Percentage CPU",
                        timeGrain: "PT1M",
                        statistic: "Average",
                        timeWindow: "PT5M",
                        timeAggregation: "Average",
                        operator: "GreaterThan",
                        threshold: scaleOutThreshold,
                        direction: "Increase",
                        cooldown: "PT5M",
                        type: "ChangeCount",
                        value: 1,
                    },
                    {
                        metricName: "Percentage CPU",
                        timeGrain: "PT1M",
                        statistic: "Average",
                        timeWindow: "PT5M",
                        timeAggregation: "Average",
                        operator: "LessThan",
                        threshold: scaleInThreshold,
                        direction: "Decrease",
                        cooldown: "PT5M",
                        type: "ChangeCount",
                        value: 1,
                    },
                ],
            },
        ],
    });
}
/**
 * Create a business hours scaling schedule
 */
function createBusinessHoursSchedule(options) {
    const timeZone = options.timeZone || "UTC";
    const businessDays = options.businessDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
    ];
    const businessHours = options.businessHours || { start: 9, end: 17 };
    return [
        {
            name: "Business Hours Profile",
            capacity: {
                minimum: options.businessHoursCapacity.min,
                maximum: options.businessHoursCapacity.max,
                default: options.businessHoursCapacity.default,
            },
            rules: [],
            recurrence: {
                frequency: "Week",
                schedule: {
                    timeZone,
                    days: businessDays,
                    hours: Array.from({ length: businessHours.end - businessHours.start }, (_, i) => businessHours.start + i),
                    minutes: [0],
                },
            },
        },
        {
            name: "Off Hours Profile",
            capacity: {
                minimum: options.offHoursCapacity.min,
                maximum: options.offHoursCapacity.max,
                default: options.offHoursCapacity.default,
            },
            rules: [],
            recurrence: {
                frequency: "Week",
                schedule: {
                    timeZone,
                    days: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                    hours: [
                        ...Array.from({ length: businessHours.start }, (_, i) => i),
                        ...Array.from({ length: 24 - businessHours.end }, (_, i) => businessHours.end + i),
                    ],
                    minutes: [0],
                },
            },
        },
    ];
}
/**
 * Exported helper map for registration
 */
exports.autoscaleHelpers = {
    "scale:autoscale.policy": createAutoScalePolicy,
    "scale:autoscale.metric": createMetricScaleRule,
    "scale:autoscale.schedule": createScheduleProfile,
    "scale:autoscale.cpu": createCpuScalingPolicy,
    "scale:autoscale.businessHours": createBusinessHoursSchedule,
};
