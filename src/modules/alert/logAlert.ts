import Handlebars from "handlebars";

/**
 * Options for alert:logAlert helper
 * Creates KQL query-based log alerts from Log Analytics
 */
export interface LogAlertOptions {
  name: string;
  description?: string;
  severity: number; // 0=Critical, 1=Error, 2=Warning, 3=Informational, 4=Verbose
  enabled?: boolean;
  scopes: string | string[]; // Log Analytics workspace resource IDs
  evaluationFrequency?: string; // PT5M, PT10M, PT15M, PT30M, PT1H
  windowSize?: string; // PT5M, PT10M, PT15M, PT30M, PT1H, PT6H, PT12H, PT24H, P1D
  query: string; // KQL query
  metricMeasureColumn?: string; // For metric measurement alerts
  operator?: "GreaterThan" | "LessThan" | "Equal"; // For result count alerts
  threshold?: number;
  numberOfEvaluationPeriods?: number;
  minFailingPeriodsToAlert?: number;
  actionGroups?: string[]; // Action group resource IDs
  autoMitigate?: boolean;
  checkWorkspaceAlertsStorageConfigured?: boolean;
  skipQueryValidation?: boolean;
  muteActionsDuration?: string; // ISO 8601 duration
  tags?: Record<string, string>;
}

/**
 * Handlebars helper to create log alert based on KQL query
 *
 * @example
 * ```handlebars
 * {{{alert:logAlert
 *   name="failed-login-alert"
 *   description="Alert on multiple failed login attempts"
 *   severity=1
 *   scopes="[resourceId('Microsoft.OperationalInsights/workspaces', 'law-prod')]"
 *   query="SecurityEvent | where EventID == 4625 | summarize count() by Computer | where count_ > 5"
 *   operator="GreaterThan"
 *   threshold=0
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'security-team')]"]'
 * }}}
 * ```
 */
export function alertLogAlert(this: unknown, hash: LogAlertOptions): string {
  if (!hash || !hash.name) {
    throw new Error("alert:logAlert requires name parameter");
  }
  if (!hash.scopes) {
    throw new Error("alert:logAlert requires scopes parameter");
  }
  if (!hash.query || hash.query.trim() === "") {
    throw new Error("alert:logAlert requires query parameter");
  }

  // Parse scopes
  let scopesArray: string[];
  if (typeof hash.scopes === "string") {
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
    type: "Microsoft.Insights/scheduledQueryRules",
    apiVersion: "2021-08-01",
    name: hash.name,
    location: "global",
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      description: hash.description || `Log alert for ${hash.name}`,
      severity: hash.severity,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      scopes: scopesArray,
      evaluationFrequency: hash.evaluationFrequency || "PT5M",
      windowSize: hash.windowSize || "PT5M",
      criteria: {
        allOf: [
          {
            query: hash.query,
            timeAggregation: "Count",
            ...(hash.metricMeasureColumn && {
              metricMeasureColumn: hash.metricMeasureColumn,
            }),
            operator: hash.operator || "GreaterThan",
            threshold: hash.threshold !== undefined ? hash.threshold : 0,
            failingPeriods: {
              numberOfEvaluationPeriods: hash.numberOfEvaluationPeriods || 1,
              minFailingPeriodsToAlert: hash.minFailingPeriodsToAlert || 1,
            },
          },
        ],
      },
      autoMitigate: hash.autoMitigate !== undefined ? hash.autoMitigate : true,
      ...(actionGroupsArray &&
        actionGroupsArray.length > 0 && {
          actions: {
            actionGroups: actionGroupsArray,
            ...(hash.muteActionsDuration && {
              customProperties: {
                muteActionsDuration: hash.muteActionsDuration,
              },
            }),
          },
        }),
      checkWorkspaceAlertsStorageConfigured:
        hash.checkWorkspaceAlertsStorageConfigured !== undefined
          ? hash.checkWorkspaceAlertsStorageConfigured
          : false,
      skipQueryValidation:
        hash.skipQueryValidation !== undefined
          ? hash.skipQueryValidation
          : false,
    },
  };

  return JSON.stringify(result, null, 2);
}

export function registerLogAlertHelpers(): void {
  Handlebars.registerHelper("alert:logAlert", alertLogAlert);
}
