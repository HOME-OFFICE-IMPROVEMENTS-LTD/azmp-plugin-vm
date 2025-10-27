/**
 * Intelligent alert engine for enhanced monitoring.
 * Generates Azure Monitor alert definitions that combine
 * performance, cost, and scaling insights.
 */

export type AlertSeverity = 0 | 1 | 2 | 3 | 4;

export interface AlertActionDefinition {
  actionGroupIds?: string[];
  emails?: string[];
  webhookEndpoints?: Array<{
    serviceUri: string;
    properties?: Record<string, string>;
  }>;
}

export interface MetricAlertCondition {
  type: 'metric';
  metricName: string;
  metricNamespace?: string;
  operator: 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual';
  threshold: number;
  timeAggregation: 'Average' | 'Minimum' | 'Maximum';
  dimensions?: Array<{
    name: string;
    operator: 'Include' | 'Exclude';
    values: string[];
  }>;
  evaluationPeriods?: number;
  dynamicThreshold?: {
    enabled: boolean;
    sensitivity: 'High' | 'Medium' | 'Low';
    failSettlingPeriod?: number;
    ignoreDataBefore?: string;
  };
}

export interface LogAlertCondition {
  type: 'log';
  query: string;
  timeWindow: string; // e.g., PT1H
  operator: 'GreaterThan' | 'LessThan';
  threshold: number;
  frequency: string; // e.g., PT5M
  alertSensitivity?: 'Low' | 'Medium' | 'High';
}

export type AlertConditionDefinition = MetricAlertCondition | LogAlertCondition;

export interface AlertRuleDefinition {
  name: string;
  displayName: string;
  description: string;
  severity: AlertSeverity;
  signalType: 'Metric' | 'Log';
  scopes: string[];
  evaluationFrequency: string;
  windowSize: string;
  autoMitigate: boolean;
  enabled: boolean;
  condition: AlertConditionDefinition;
  actions: AlertActionDefinition;
  insights?: string[];
  metadata?: Record<string, string>;
}

export interface MetricAlertResource {
  type: 'Microsoft.Insights/metricAlerts';
  apiVersion: '2018-03-01';
  name: string;
  location: 'global';
  properties: {
    description: string;
    severity: AlertSeverity;
    enabled: boolean;
    scopes: string[];
    evaluationFrequency: string;
    windowSize: string;
    criteria: {
      allOf: Array<{
        name: string;
        metricName: string;
        metricNamespace?: string;
        operator: MetricAlertCondition['operator'];
        threshold: number;
        timeAggregation: MetricAlertCondition['timeAggregation'];
        dimensions?: MetricAlertCondition['dimensions'];
        dynamicThreshold?: MetricAlertCondition['dynamicThreshold'];
      }>;
    };
    autoMitigate: boolean;
    targetResourceType?: string;
    actions?: Array<{
      actionGroupId: string;
      webhookProperties?: Record<string, string>;
    }>;
  };
}

export interface ScheduledQueryResource {
  type: 'Microsoft.Insights/scheduledQueryRules';
  apiVersion: '2022-10-01';
  name: string;
  location: 'global';
  properties: {
    description: string;
    enabled: 'Enabled' | 'Disabled';
    source: {
      query: string;
      dataSourceId: string;
      queryType: 'ResultCount';
      authorizedResources?: string[];
    };
    schedule: {
      frequencyInMinutes: number;
      timeWindowInMinutes: number;
    };
    action: {
      severity: AlertSeverity;
      aznsAction?: {
        actionGroup: string[];
        emailSubject?: string;
        customWebhookPayload?: string;
        properties?: Record<string, string>;
      };
      trigger: {
        operator: 'GreaterThan' | 'LessThan';
        threshold: number;
      };
    };
    autoMitigate?: boolean;
  };
}

export interface CpuAlertOptions {
  name?: string;
  displayName?: string;
  description?: string;
  resourceId: string;
  threshold?: number;
  evaluationFrequency?: string;
  windowSize?: string;
  severity?: AlertSeverity;
  actionGroupIds?: string[];
  emails?: string[];
  autoMitigate?: boolean;
}

export interface MemoryAlertOptions extends CpuAlertOptions {
  thresholdMb?: number;
}

export interface CostAnomalyAlertOptions {
  name?: string;
  displayName?: string;
  description?: string;
  scopeId: string;
  thresholdPercent?: number;
  severity?: AlertSeverity;
  actionGroupIds?: string[];
  emails?: string[];
  evaluationFrequency?: string;
  windowSize?: string;
}

export interface ScalingHealthAlertOptions {
  name?: string;
  displayName?: string;
  resourceId: string;
  severity?: AlertSeverity;
  failureCountThreshold?: number;
  evaluationFrequency?: string;
  windowSize?: string;
  actionGroupIds?: string[];
  emails?: string[];
}

interface MetricAlertBuildOptions {
  name: string;
  displayName: string;
  description: string;
  resourceId: string;
  severity: AlertSeverity;
  evaluationFrequency: string;
  windowSize: string;
  autoMitigate: boolean;
  condition: MetricAlertCondition;
  actions: AlertActionDefinition;
  insights?: string[];
  metadata?: Record<string, string>;
}

interface LogAlertBuildOptions {
  name: string;
  displayName: string;
  description: string;
  scopeId: string;
  severity: AlertSeverity;
  evaluationFrequency: string;
  windowSize: string;
  condition: LogAlertCondition;
  actions: AlertActionDefinition;
  insights?: string[];
  metadata?: Record<string, string>;
}

const durationToMinutes = (duration: string, fallback: number): number => {
  if (!duration) return fallback;
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

export class MonitoringAlertEngine {
  private static buildMetricAlertDefinition(options: MetricAlertBuildOptions): AlertRuleDefinition {
    return {
      name: options.name,
      displayName: options.displayName,
      description: options.description,
      severity: options.severity,
      signalType: 'Metric',
      scopes: [options.resourceId],
      evaluationFrequency: options.evaluationFrequency,
      windowSize: options.windowSize,
      autoMitigate: options.autoMitigate,
      enabled: true,
      condition: options.condition,
      actions: options.actions,
      insights: options.insights,
      metadata: options.metadata
    };
  }

  private static buildLogAlertDefinition(options: LogAlertBuildOptions): AlertRuleDefinition {
    return {
      name: options.name,
      displayName: options.displayName,
      description: options.description,
      severity: options.severity,
      signalType: 'Log',
      scopes: [options.scopeId],
      evaluationFrequency: options.evaluationFrequency,
      windowSize: options.windowSize,
      autoMitigate: false,
      enabled: true,
      condition: options.condition,
      actions: options.actions,
      insights: options.insights,
      metadata: options.metadata
    };
  }

  public static createCpuAlert(options: CpuAlertOptions): AlertRuleDefinition {
    const threshold = options.threshold ?? 80;
    const evaluationFrequency = options.evaluationFrequency ?? 'PT1M';
    const windowSize = options.windowSize ?? 'PT5M';
    const severity: AlertSeverity = options.severity ?? 2;

    return this.buildMetricAlertDefinition({
      name: options.name ?? 'cpu-high-alert',
      displayName: options.displayName ?? 'High CPU Utilization',
      description: options.description ?? 'Triggers when CPU utilization exceeds the target threshold.',
      resourceId: options.resourceId,
      severity,
      evaluationFrequency,
      windowSize,
      autoMitigate: options.autoMitigate ?? true,
      condition: {
        type: 'metric',
        metricName: 'Percentage CPU',
        metricNamespace: 'microsoft.compute/virtualmachines',
        operator: 'GreaterThan',
        threshold,
        timeAggregation: 'Average',
        evaluationPeriods: 3
      },
      actions: {
        actionGroupIds: options.actionGroupIds,
        emails: options.emails
      },
      insights: [
        `Threshold set to ${threshold}% with ${windowSize} window`,
        'Recommended to investigate workload spikes and consider scale-out policies'
      ],
      metadata: {
        signal: 'cpu',
        version: '1.0.0'
      }
    });
  }

  public static createMemoryAlert(options: MemoryAlertOptions): AlertRuleDefinition {
    const thresholdMb = options.thresholdMb ?? 512;
    const evaluationFrequency = options.evaluationFrequency ?? 'PT5M';
    const windowSize = options.windowSize ?? 'PT10M';
    const severity: AlertSeverity = options.severity ?? 3;

    return this.buildMetricAlertDefinition({
      name: options.name ?? 'memory-low-alert',
      displayName: options.displayName ?? 'Low Available Memory',
      description: options.description ?? 'Triggers when available memory remains below the defined threshold.',
      resourceId: options.resourceId,
      severity,
      evaluationFrequency,
      windowSize,
      autoMitigate: options.autoMitigate ?? true,
      condition: {
        type: 'metric',
        metricName: 'Available Memory Bytes',
        metricNamespace: 'microsoft.compute/virtualmachines',
        operator: 'LessThan',
        threshold: thresholdMb * 1024 * 1024,
        timeAggregation: 'Minimum',
        evaluationPeriods: 2
      },
      actions: {
        actionGroupIds: options.actionGroupIds,
        emails: options.emails
      },
      insights: [
        `Alert triggers when available memory < ${thresholdMb} MB`,
        'Consider scaling up memory or optimizing application memory usage'
      ],
      metadata: {
        signal: 'memory',
        version: '1.0.0'
      }
    });
  }

  public static createCostAnomalyAlert(options: CostAnomalyAlertOptions): AlertRuleDefinition {
    const thresholdPercent = options.thresholdPercent ?? 20;
    const evaluationFrequency = options.evaluationFrequency ?? 'PT30M';
    const windowSize = options.windowSize ?? 'P1D';
    const severity: AlertSeverity = options.severity ?? 2;

    const logCondition: LogAlertCondition = {
      type: 'log',
      query: `Usage\n| where TimeGenerated >= ago(2d)\n| summarize PreviousCost = sumif(PreTaxCost, TimeGenerated < ago(1d)),\n          CurrentCost = sumif(PreTaxCost, TimeGenerated >= ago(1d))\n| extend Growth = case(PreviousCost == 0, 0, ((CurrentCost - PreviousCost) / PreviousCost) * 100)\n| where Growth > ${thresholdPercent}\n| project Growth, CurrentCost, PreviousCost`,
      timeWindow: 'PT24H',
      operator: 'GreaterThan',
      threshold: 0,
      frequency: evaluationFrequency,
      alertSensitivity: thresholdPercent >= 30 ? 'High' : 'Medium'
    };

    return this.buildLogAlertDefinition({
      name: options.name ?? 'cost-anomaly-alert',
      displayName: options.displayName ?? 'Cost Anomaly Detected',
      description: options.description ?? `Triggers when cost increases by more than ${thresholdPercent}% compared to the previous day.`,
      scopeId: options.scopeId,
      severity,
      evaluationFrequency,
      windowSize,
      condition: logCondition,
      actions: {
        actionGroupIds: options.actionGroupIds,
        emails: options.emails
      },
      insights: [
        `Detects cost growth over ${thresholdPercent}% in the last 24 hours`,
        'Investigate newly provisioned resources or unexpected usage spikes'
      ],
      metadata: {
        signal: 'cost',
        version: '1.0.0'
      }
    });
  }

  public static createScalingHealthAlert(options: ScalingHealthAlertOptions): AlertRuleDefinition {
    const failureThreshold = options.failureCountThreshold ?? 3;
    const evaluationFrequency = options.evaluationFrequency ?? 'PT5M';
    const windowSize = options.windowSize ?? 'PT30M';
    const severity: AlertSeverity = options.severity ?? 2;

    const logCondition: LogAlertCondition = {
      type: 'log',
      query: `AzureActivity\n| where ResourceId == '${options.resourceId}'\n| where CategoryValue == 'Autoscale' and Level == 'Error'\n| summarize FailureCount = count() by bin(TimeGenerated, ${windowSize.replace('PT', '')})\n| where FailureCount >= ${failureThreshold}\n| project FailureCount`,
      timeWindow: windowSize,
      operator: 'GreaterThan',
      threshold: 0,
      frequency: evaluationFrequency
    };

    return this.buildLogAlertDefinition({
      name: options.name ?? 'scaling-failure-alert',
      displayName: options.displayName ?? 'Autoscale Failures Detected',
      description: `Triggers when ${failureThreshold}+ scaling failures occur within ${windowSize}.`,
      scopeId: options.resourceId,
      severity,
      evaluationFrequency,
      windowSize,
      condition: logCondition,
      actions: {
        actionGroupIds: options.actionGroupIds,
        emails: options.emails
      },
      insights: [
        'Investigate autoscale settings and VMSS health',
        'Consider enabling predictive scaling for smoother scale-out'
      ],
      metadata: {
        signal: 'scaling',
        version: '1.0.0'
      }
    });
  }

  public static toMetricAlertResource(definition: AlertRuleDefinition): MetricAlertResource {
    if (definition.condition.type !== 'metric') {
      throw new Error('Alert definition is not metric-based');
    }

    return {
      type: 'Microsoft.Insights/metricAlerts',
      apiVersion: '2018-03-01',
      name: definition.name,
      location: 'global',
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
              dynamicThreshold: definition.condition.dynamicThreshold
            }
          ]
        },
        targetResourceType: definition.condition.metricNamespace ? undefined : 'Microsoft.Compute/virtualMachines',
        actions: (definition.actions.actionGroupIds || []).map((actionGroupId) => ({
          actionGroupId,
          webhookProperties: undefined
        }))
      }
    };
  }

  public static toScheduledQueryResource(definition: AlertRuleDefinition, workspaceId: string): ScheduledQueryResource {
    if (definition.condition.type !== 'log') {
      throw new Error('Alert definition is not log-based');
    }

    const frequencyMinutes = durationToMinutes(definition.evaluationFrequency, 5);
    const windowMinutes = durationToMinutes(definition.windowSize, 60);

    return {
      type: 'Microsoft.Insights/scheduledQueryRules',
      apiVersion: '2022-10-01',
      name: definition.name,
      location: 'global',
      properties: {
        description: definition.description,
        enabled: definition.enabled ? 'Enabled' : 'Disabled',
        source: {
          query: definition.condition.query,
          dataSourceId: workspaceId,
          queryType: 'ResultCount'
        },
        schedule: {
          frequencyInMinutes: frequencyMinutes,
          timeWindowInMinutes: windowMinutes
        },
        action: {
          severity: definition.severity,
          trigger: {
            operator: definition.condition.operator,
            threshold: definition.condition.threshold
          },
          aznsAction: definition.actions.actionGroupIds || definition.actions.emails
            ? {
              actionGroup: definition.actions.actionGroupIds ?? [],
              properties: definition.actions.emails
                ? { emailAddresses: definition.actions.emails.join(',') }
                : undefined
            }
            : undefined
        },
        autoMitigate: definition.autoMitigate
      }
    };
  }
}
