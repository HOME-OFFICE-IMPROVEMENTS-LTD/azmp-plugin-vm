import Handlebars from 'handlebars';

/**
 * Options for alert:dynamicMetricAlert helper
 * Creates ML-based dynamic threshold metric alerts
 */
export interface DynamicMetricAlertOptions {
  name: string;
  description?: string;
  severity: number; // 0=Critical, 1=Error, 2=Warning, 3=Informational, 4=Verbose
  enabled?: boolean;
  scopes: string | string[]; // Resource IDs to monitor
  evaluationFrequency?: string; // PT1M, PT5M, PT15M, PT30M, PT1H
  windowSize?: string; // PT1M, PT5M, PT15M, PT30M, PT1H, PT6H, PT12H, PT24H
  targetResourceType?: string;
  targetResourceRegion?: string;
  criteria: {
    metricName: string;
    metricNamespace?: string;
    operator: 'GreaterThan' | 'LessThan' | 'GreaterOrLessThan';
    alertSensitivity: 'Low' | 'Medium' | 'High';
    failingPeriods: {
      numberOfEvaluationPeriods: number;
      minFailingPeriodsToAlert: number;
    };
    timeAggregation: 'Average' | 'Minimum' | 'Maximum' | 'Total' | 'Count';
    dimensions?: Array<{
      name: string;
      operator: 'Include' | 'Exclude';
      values: string[];
    }>;
    ignoreDataBefore?: string; // ISO 8601 date
  }[];
  actionGroups?: string[]; // Action group resource IDs
  autoMitigate?: boolean;
  tags?: Record<string, string>;
}

/**
 * Handlebars helper to create dynamic threshold metric alert using ML
 * 
 * @example
 * ```handlebars
 * {{{alert:dynamicMetricAlert
 *   name="dynamic-cpu-alert"
 *   description="ML-based CPU anomaly detection"
 *   severity=2
 *   scopes="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","alertSensitivity":"Medium","failingPeriods":{"numberOfEvaluationPeriods":4,"minFailingPeriodsToAlert":3},"timeAggregation":"Average"}]'
 * }}}
 * ```
 */
export function alertDynamicMetricAlert(this: unknown, hash: DynamicMetricAlertOptions): string {
  if (!hash || !hash.name) {
    throw new Error('alert:dynamicMetricAlert requires name parameter');
  }
  if (!hash.scopes) {
    throw new Error('alert:dynamicMetricAlert requires scopes parameter');
  }
  if (!hash.criteria) {
    throw new Error('alert:dynamicMetricAlert requires criteria parameter');
  }

  // Parse criteria if it's a JSON string
  let criteriaArray = hash.criteria;
  if (typeof hash.criteria === 'string') {
    try {
      criteriaArray = JSON.parse(hash.criteria);
    } catch (e) {
      throw new Error(`alert:dynamicMetricAlert criteria must be valid JSON array: ${e}`);
    }
  }

  // Parse scopes
  let scopesArray: string[];
  if (typeof hash.scopes === 'string') {
    try {
      scopesArray = JSON.parse(hash.scopes);
    } catch (e) {
      scopesArray = [hash.scopes];
    }
  } else {
    scopesArray = hash.scopes;
  }

  // Parse action groups if provided
  let actionGroupsArray: string[] | undefined;
  if (hash.actionGroups) {
    if (typeof hash.actionGroups === 'string') {
      try {
        actionGroupsArray = JSON.parse(hash.actionGroups);
      } catch (e) {
        actionGroupsArray = [hash.actionGroups];
      }
    } else {
      actionGroupsArray = hash.actionGroups;
    }
  }

  const result = {
    type: 'Microsoft.Insights/metricAlerts',
    apiVersion: '2018-03-01',
    name: hash.name,
    location: 'global',
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      description: hash.description || `Dynamic metric alert for ${hash.name}`,
      severity: hash.severity,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      scopes: scopesArray,
      evaluationFrequency: hash.evaluationFrequency || 'PT1M',
      windowSize: hash.windowSize || 'PT5M',
      ...(hash.targetResourceType && { targetResourceType: hash.targetResourceType }),
      ...(hash.targetResourceRegion && { targetResourceRegion: hash.targetResourceRegion }),
      criteria: {
        'odata.type': 'Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria',
        allOf: criteriaArray
      },
      autoMitigate: hash.autoMitigate !== undefined ? hash.autoMitigate : true,
      ...(actionGroupsArray && actionGroupsArray.length > 0 && {
        actions: actionGroupsArray.map(id => ({ actionGroupId: id }))
      })
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerDynamicMetricAlertHelpers(): void {
  Handlebars.registerHelper('alert:dynamicMetricAlert', alertDynamicMetricAlert);
}
