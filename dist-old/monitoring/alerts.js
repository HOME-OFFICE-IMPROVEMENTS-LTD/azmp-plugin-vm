"use strict";
/**
 * Intelligent alert engine for enhanced monitoring.
 * Generates Azure Monitor alert definitions that combine
 * performance, cost, and scaling insights.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringAlertEngine = void 0;
const durationToMinutes = (duration, fallback) => {
    if (!duration)
        return fallback;
    const normalized = duration.toUpperCase();
    const isoPattern = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/;
    const match = normalized.match(isoPattern);
    if (!match) {
        return fallback;
    }
    const days = match[1] ? parseInt(match[1], 10) : 0;
    const hours = match[2] ? parseInt(match[2], 10) : 0;
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    const totalMinutes = days * 1440 + hours * 60 + minutes;
    return totalMinutes > 0 ? totalMinutes : fallback;
};
class MonitoringAlertEngine {
    static buildMetricAlertDefinition(options) {
        return {
            name: options.name,
            displayName: options.displayName,
            description: options.description,
            severity: options.severity,
            signalType: "Metric",
            scopes: [options.resourceId],
            evaluationFrequency: options.evaluationFrequency,
            windowSize: options.windowSize,
            autoMitigate: options.autoMitigate,
            enabled: true,
            condition: options.condition,
            actions: options.actions,
            insights: options.insights,
            metadata: options.metadata,
        };
    }
    static buildLogAlertDefinition(options) {
        return {
            name: options.name,
            displayName: options.displayName,
            description: options.description,
            severity: options.severity,
            signalType: "Log",
            scopes: [options.scopeId],
            evaluationFrequency: options.evaluationFrequency,
            windowSize: options.windowSize,
            autoMitigate: false,
            enabled: true,
            condition: options.condition,
            actions: options.actions,
            insights: options.insights,
            metadata: options.metadata,
        };
    }
    static createCpuAlert(options) {
        const threshold = options.threshold ?? 80;
        const evaluationFrequency = options.evaluationFrequency ?? "PT1M";
        const windowSize = options.windowSize ?? "PT5M";
        const severity = options.severity ?? 2;
        return this.buildMetricAlertDefinition({
            name: options.name ?? "cpu-high-alert",
            displayName: options.displayName ?? "High CPU Utilization",
            description: options.description ??
                "Triggers when CPU utilization exceeds the target threshold.",
            resourceId: options.resourceId,
            severity,
            evaluationFrequency,
            windowSize,
            autoMitigate: options.autoMitigate ?? true,
            condition: {
                type: "metric",
                metricName: "Percentage CPU",
                metricNamespace: "microsoft.compute/virtualmachines",
                operator: "GreaterThan",
                threshold,
                timeAggregation: "Average",
                evaluationPeriods: 3,
            },
            actions: {
                actionGroupIds: options.actionGroupIds,
                emails: options.emails,
            },
            insights: [
                `Threshold set to ${threshold}% with ${windowSize} window`,
                "Recommended to investigate workload spikes and consider scale-out policies",
            ],
            metadata: {
                signal: "cpu",
                version: "1.0.0",
            },
        });
    }
    static createMemoryAlert(options) {
        const thresholdMb = options.thresholdMb ?? 512;
        const evaluationFrequency = options.evaluationFrequency ?? "PT5M";
        const windowSize = options.windowSize ?? "PT10M";
        const severity = options.severity ?? 3;
        return this.buildMetricAlertDefinition({
            name: options.name ?? "memory-low-alert",
            displayName: options.displayName ?? "Low Available Memory",
            description: options.description ??
                "Triggers when available memory remains below the defined threshold.",
            resourceId: options.resourceId,
            severity,
            evaluationFrequency,
            windowSize,
            autoMitigate: options.autoMitigate ?? true,
            condition: {
                type: "metric",
                metricName: "Available Memory Bytes",
                metricNamespace: "microsoft.compute/virtualmachines",
                operator: "LessThan",
                threshold: thresholdMb * 1024 * 1024,
                timeAggregation: "Minimum",
                evaluationPeriods: 2,
            },
            actions: {
                actionGroupIds: options.actionGroupIds,
                emails: options.emails,
            },
            insights: [
                `Alert triggers when available memory < ${thresholdMb} MB`,
                "Consider scaling up memory or optimizing application memory usage",
            ],
            metadata: {
                signal: "memory",
                version: "1.0.0",
            },
        });
    }
    static createCostAnomalyAlert(options) {
        const thresholdPercent = options.thresholdPercent ?? 20;
        const evaluationFrequency = options.evaluationFrequency ?? "PT30M";
        const windowSize = options.windowSize ?? "P1D";
        const severity = options.severity ?? 2;
        const logCondition = {
            type: "log",
            query: `Usage\n| where TimeGenerated >= ago(2d)\n| summarize PreviousCost = sumif(PreTaxCost, TimeGenerated < ago(1d)),\n          CurrentCost = sumif(PreTaxCost, TimeGenerated >= ago(1d))\n| extend Growth = case(PreviousCost == 0, 0, ((CurrentCost - PreviousCost) / PreviousCost) * 100)\n| where Growth > ${thresholdPercent}\n| project Growth, CurrentCost, PreviousCost`,
            timeWindow: "PT24H",
            operator: "GreaterThan",
            threshold: 0,
            frequency: evaluationFrequency,
            alertSensitivity: thresholdPercent >= 30 ? "High" : "Medium",
        };
        return this.buildLogAlertDefinition({
            name: options.name ?? "cost-anomaly-alert",
            displayName: options.displayName ?? "Cost Anomaly Detected",
            description: options.description ??
                `Triggers when cost increases by more than ${thresholdPercent}% compared to the previous day.`,
            scopeId: options.scopeId,
            severity,
            evaluationFrequency,
            windowSize,
            condition: logCondition,
            actions: {
                actionGroupIds: options.actionGroupIds,
                emails: options.emails,
            },
            insights: [
                `Detects cost growth over ${thresholdPercent}% in the last 24 hours`,
                "Investigate newly provisioned resources or unexpected usage spikes",
            ],
            metadata: {
                signal: "cost",
                version: "1.0.0",
            },
        });
    }
    static createScalingHealthAlert(options) {
        const failureThreshold = options.failureCountThreshold ?? 3;
        const evaluationFrequency = options.evaluationFrequency ?? "PT5M";
        const windowSize = options.windowSize ?? "PT30M";
        const severity = options.severity ?? 2;
        const logCondition = {
            type: "log",
            query: `AzureActivity\n| where ResourceId == '${options.resourceId}'\n| where CategoryValue == 'Autoscale' and Level == 'Error'\n| summarize FailureCount = count() by bin(TimeGenerated, ${windowSize.replace("PT", "")})\n| where FailureCount >= ${failureThreshold}\n| project FailureCount`,
            timeWindow: windowSize,
            operator: "GreaterThan",
            threshold: 0,
            frequency: evaluationFrequency,
        };
        return this.buildLogAlertDefinition({
            name: options.name ?? "scaling-failure-alert",
            displayName: options.displayName ?? "Autoscale Failures Detected",
            description: `Triggers when ${failureThreshold}+ scaling failures occur within ${windowSize}.`,
            scopeId: options.resourceId,
            severity,
            evaluationFrequency,
            windowSize,
            condition: logCondition,
            actions: {
                actionGroupIds: options.actionGroupIds,
                emails: options.emails,
            },
            insights: [
                "Investigate autoscale settings and VMSS health",
                "Consider enabling predictive scaling for smoother scale-out",
            ],
            metadata: {
                signal: "scaling",
                version: "1.0.0",
            },
        });
    }
    static toMetricAlertResource(definition) {
        if (definition.condition.type !== "metric") {
            throw new Error("Alert definition is not metric-based");
        }
        return {
            type: "Microsoft.Insights/metricAlerts",
            apiVersion: "2018-03-01",
            name: definition.name,
            location: "global",
            properties: {
                description: definition.description,
                severity: definition.severity,
                enabled: definition.enabled,
                scopes: definition.scopes,
                evaluationFrequency: definition.evaluationFrequency,
                windowSize: definition.windowSize,
                autoMitigate: definition.autoMitigate,
                criteria: {
                    allOf: [
                        {
                            name: definition.displayName,
                            metricName: definition.condition.metricName,
                            metricNamespace: definition.condition.metricNamespace,
                            operator: definition.condition.operator,
                            threshold: definition.condition.threshold,
                            timeAggregation: definition.condition.timeAggregation,
                            dimensions: definition.condition.dimensions,
                            dynamicThreshold: definition.condition.dynamicThreshold,
                        },
                    ],
                },
                targetResourceType: definition.condition.metricNamespace
                    ? undefined
                    : "Microsoft.Compute/virtualMachines",
                actions: (definition.actions.actionGroupIds || []).map((actionGroupId) => ({
                    actionGroupId,
                    webhookProperties: undefined,
                })),
            },
        };
    }
    static toScheduledQueryResource(definition, workspaceId) {
        if (definition.condition.type !== "log") {
            throw new Error("Alert definition is not log-based");
        }
        const frequencyMinutes = durationToMinutes(definition.evaluationFrequency, 5);
        const windowMinutes = durationToMinutes(definition.windowSize, 60);
        return {
            type: "Microsoft.Insights/scheduledQueryRules",
            apiVersion: "2022-10-01",
            name: definition.name,
            location: "global",
            properties: {
                description: definition.description,
                enabled: definition.enabled ? "Enabled" : "Disabled",
                source: {
                    query: definition.condition.query,
                    dataSourceId: workspaceId,
                    queryType: "ResultCount",
                },
                schedule: {
                    frequencyInMinutes: frequencyMinutes,
                    timeWindowInMinutes: windowMinutes,
                },
                action: {
                    severity: definition.severity,
                    trigger: {
                        operator: definition.condition.operator,
                        threshold: definition.condition.threshold,
                    },
                    aznsAction: definition.actions.actionGroupIds || definition.actions.emails
                        ? {
                            actionGroup: definition.actions.actionGroupIds ?? [],
                            properties: definition.actions.emails
                                ? { emailAddresses: definition.actions.emails.join(",") }
                                : undefined,
                        }
                        : undefined,
                },
                autoMitigate: definition.autoMitigate,
            },
        };
    }
}
exports.MonitoringAlertEngine = MonitoringAlertEngine;
