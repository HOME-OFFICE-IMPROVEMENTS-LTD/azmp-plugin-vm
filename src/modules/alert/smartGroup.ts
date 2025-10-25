import Handlebars from 'handlebars';

/**
 * Options for alert:smartGroup helper
 * Creates smart groups for alert correlation and suppression
 */
export interface SmartGroupOptions {
  name: string;
  description?: string;
  enabled?: boolean;
  scopes: string | string[]; // Resource IDs to apply smart grouping
  groupingConfiguration?: {
    groupByFields: string[]; // Fields to group alerts by (e.g., alertRuleName, monitorService, severity)
    lookbackDuration?: string; // PT1H, PT6H, PT12H, P1D (default PT6H)
  };
  suppressionConfiguration?: {
    recurrenceDuration: string; // How long to suppress (PT5M, PT15M, PT30M, PT1H, PT6H, PT12H, P1D)
  };
  tags?: Record<string, string>;
}

/**
 * Handlebars helper to create smart group for alert correlation
 * 
 * Smart Groups use ML to automatically correlate related alerts and reduce noise.
 * They group alerts based on similarity patterns and suppress duplicate notifications.
 * 
 * @example
 * ```handlebars
 * {{{alert:smartGroup
 *   name="vmss-smart-group"
 *   description="Group related VMSS alerts"
 *   scopes="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
 *   groupingConfiguration='{"groupByFields":["alertRuleName","severity"],"lookbackDuration":"PT6H"}'
 *   suppressionConfiguration='{"recurrenceDuration":"PT1H"}'
 * }}}
 * ```
 * 
 * Note: Smart Groups are configured via Azure Monitor Alert Processing Rules.
 * This helper generates an alert processing rule with grouping logic.
 */
export function alertSmartGroup(this: unknown, hash: SmartGroupOptions): string {
  if (!hash || !hash.name) {
    throw new Error('alert:smartGroup requires name parameter');
  }
  if (!hash.scopes) {
    throw new Error('alert:smartGroup requires scopes parameter');
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

  // Parse grouping configuration if provided
  let groupingConfig;
  if (hash.groupingConfiguration) {
    if (typeof hash.groupingConfiguration === 'string') {
      try {
        groupingConfig = JSON.parse(hash.groupingConfiguration);
      } catch (e) {
        throw new Error(`alert:smartGroup groupingConfiguration must be valid JSON: ${e}`);
      }
    } else {
      groupingConfig = hash.groupingConfiguration;
    }
  }

  // Parse suppression configuration if provided
  let suppressionConfig;
  if (hash.suppressionConfiguration) {
    if (typeof hash.suppressionConfiguration === 'string') {
      try {
        suppressionConfig = JSON.parse(hash.suppressionConfiguration);
      } catch (e) {
        throw new Error(`alert:smartGroup suppressionConfiguration must be valid JSON: ${e}`);
      }
    } else {
      suppressionConfig = hash.suppressionConfiguration;
    }
  }

  // Build actions array based on configuration
  const actions: unknown[] = [];
  
  if (groupingConfig) {
    actions.push({
      actionType: 'AddActionGroups',
      actionGroupIds: [], // Smart grouping doesn't require action groups
      groupBy: groupingConfig.groupByFields || ['alertRuleName', 'severity'],
      ...(groupingConfig.lookbackDuration && { lookbackDuration: groupingConfig.lookbackDuration })
    });
  }

  if (suppressionConfig) {
    actions.push({
      actionType: 'RemoveAllActionGroups',
      conditions: [
        {
          field: 'Fired',
          operator: 'Equals',
          values: ['true']
        }
      ],
      recurrence: {
        recurrenceType: 'Daily',
        ...(suppressionConfig.recurrenceDuration && { 
          schedule: {
            timeZone: 'UTC',
            suppressionDuration: suppressionConfig.recurrenceDuration
          }
        })
      }
    });
  }

  const result = {
    type: 'Microsoft.AlertsManagement/actionRules',
    apiVersion: '2021-08-08',
    name: hash.name,
    location: 'global',
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      description: hash.description || `Smart group for ${hash.name}`,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      scopes: scopesArray,
      actions: actions.length > 0 ? actions : [
        {
          actionType: 'AddActionGroups',
          actionGroupIds: [],
          groupBy: ['alertRuleName', 'severity']
        }
      ]
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerSmartGroupHelpers(): void {
  Handlebars.registerHelper('alert:smartGroup', alertSmartGroup);
}
