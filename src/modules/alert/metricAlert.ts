import Handlebars from "handlebars";

/**
 * Options for alert:metricAlert helper
 * Creates static threshold metric alerts for Azure resources
 */
export interface MetricAlertOptions {
  name: string;
  description?: string;
  severity: number; // 0=Critical, 1=Error, 2=Warning, 3=Informational, 4=Verbose
  enabled?: boolean;
  scopes: string | string[]; // Resource IDs to monitor
  evaluationFrequency?: string; // PT1M, PT5M, PT15M, PT30M, PT1H
  windowSize?: string; // PT1M, PT5M, PT15M, PT30M, PT1H, PT6H, PT12H, PT24H
  targetResourceType?: string; // e.g., Microsoft.Compute/virtualMachines
  targetResourceRegion?: string;
  criteria: {
    metricName: string;
    metricNamespace?: string;
    operator:
      | "Equals"
      | "NotEquals"
      | "GreaterThan"
      | "GreaterThanOrEqual"
      | "LessThan"
      | "LessThanOrEqual";
    threshold: number;
    timeAggregation: "Average" | "Minimum" | "Maximum" | "Total" | "Count";
    dimensions?: Array<{
      name: string;
      operator: "Include" | "Exclude";
      values: string[];
    }>;
  }[];
  actionGroups?: string[]; // Action group resource IDs
  autoMitigate?: boolean;
  tags?: Record<string, string>;
}

/**
 * Handlebars helper to create static threshold metric alert
 *
 * @example
 * ```handlebars
 * {{{alert:metricAlert
 *   name="high-cpu-alert"
 *   description="Alert when VM CPU exceeds 80%"
 *   severity=1
 *   scopes="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
 *   criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]'
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'ops-team')]"]'
 * }}}
 * ```
 */
export function alertMetricAlert(
  this: unknown,
  hash: MetricAlertOptions,
): string {
  if (!hash || !hash.name) {
    throw new Error("alert:metricAlert requires name parameter");
  }
  if (!hash.scopes) {
    throw new Error("alert:metricAlert requires scopes parameter");
  }
  if (!hash.criteria) {
    throw new Error("alert:metricAlert requires criteria parameter");
  }

  // Parse criteria if it's a JSON string
  let criteriaArray = hash.criteria;
  if (typeof hash.criteria === "string") {
    try {
      criteriaArray = JSON.parse(hash.criteria);
    } catch (e) {
      throw new Error(
        `alert:metricAlert criteria must be valid JSON array: ${e}`,
      );
    }
  }

  // Parse scopes if it's a JSON string or single string
  let scopesArray: string[];
  if (typeof hash.scopes === "string") {
    try {
      scopesArray = JSON.parse(hash.scopes);
    } catch (e) {
      // Single scope string
      scopesArray = [hash.scopes];
    }
  } else {
    scopesArray = hash.scopes;
  }

  // Parse action groups if provided
  let actionGroupsArray: string[] | undefined;
  if (hash.actionGroups) {
    if (typeof hash.actionGroups === "string") {
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
    type: "Microsoft.Insights/metricAlerts",
    apiVersion: "2018-03-01",
    name: hash.name,
    location: "global",
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      description: hash.description || `Metric alert for ${hash.name}`,
      severity: hash.severity,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      scopes: scopesArray,
      evaluationFrequency: hash.evaluationFrequency || "PT1M",
      windowSize: hash.windowSize || "PT5M",
      ...(hash.targetResourceType && {
        targetResourceType: hash.targetResourceType,
      }),
      ...(hash.targetResourceRegion && {
        targetResourceRegion: hash.targetResourceRegion,
      }),
      criteria: {
        "odata.type":
          "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
        allOf: criteriaArray,
      },
      autoMitigate: hash.autoMitigate !== undefined ? hash.autoMitigate : true,
      ...(actionGroupsArray &&
        actionGroupsArray.length > 0 && {
          actions: actionGroupsArray.map((id) => ({ actionGroupId: id })),
        }),
    },
  };

  return JSON.stringify(result, null, 2);
}

export function registerMetricAlertHelpers(): void {
  Handlebars.registerHelper("alert:metricAlert", alertMetricAlert);
}
