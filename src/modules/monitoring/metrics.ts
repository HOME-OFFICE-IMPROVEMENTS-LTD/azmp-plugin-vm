/**
 * Azure Monitor Metrics Helpers
 * Configures metric collection for VMs and VMSS
 */

import Handlebars from 'handlebars';

export interface MetricsOptions {
  targetResourceId: string;
  metricNamespace?: string;
  metrics?: string | string[];
  aggregation?: 'Average' | 'Min' | 'Max' | 'Total' | 'Count';
  frequency?: 'PT1M' | 'PT5M' | 'PT15M' | 'PT1H';
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
export function monitorMetrics(this: any, options: any): string {
  const hash = options.hash as MetricsOptions;
  
  if (!hash.targetResourceId) {
    throw new Error('monitor:metrics requires targetResourceId parameter');
  }

  // Parse metrics array if provided as string
  let metricsArray: string[] = [];
  if (hash.metrics) {
    if (typeof hash.metrics === 'string') {
      try {
        metricsArray = JSON.parse(hash.metrics);
      } catch {
        metricsArray = [hash.metrics];
      }
    } else if (Array.isArray(hash.metrics)) {
      metricsArray = hash.metrics;
    }
  }

  // Default values
  const metricNamespace = hash.metricNamespace || 'Microsoft.Compute/virtualMachines';
  const aggregation = hash.aggregation || 'Average';
  const frequency = hash.frequency || 'PT1M';

  // Generate metric configuration
  const metricConfigs = metricsArray.map(metricName => ({
    name: metricName,
    namespace: metricNamespace,
    aggregation: aggregation,
    timeGrain: frequency
  }));

  const result = {
    type: 'Microsoft.Insights/metricAlerts',
    apiVersion: '2018-03-01',
    name: '[concat(parameters(\'resourceName\'), \'-metrics\')]',
    location: 'global',
    properties: {
      description: 'Metric collection configuration',
      severity: 3,
      enabled: true,
      scopes: [hash.targetResourceId],
      evaluationFrequency: frequency,
      windowSize: frequency,
      criteria: {
        'odata.type': 'Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria',
        allOf: metricConfigs.map((config, index) => ({
          criterionType: 'StaticThresholdCriterion',
          name: `metric${index}`,
          metricNamespace: config.namespace,
          metricName: config.name,
          operator: 'GreaterThan',
          threshold: 0,
          timeAggregation: config.aggregation
        }))
      },
      autoMitigate: true
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerMetricsHelpers(): void {
  Handlebars.registerHelper('monitor:metrics', monitorMetrics);
}
