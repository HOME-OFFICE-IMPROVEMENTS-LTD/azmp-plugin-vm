import Handlebars from 'handlebars';

/**
 * Options for alert:activityLogAlert helper
 * Creates alerts based on Azure Activity Log events
 */
export interface ActivityLogAlertOptions {
  name: string;
  description?: string;
  enabled?: boolean;
  scopes: string | string[]; // Subscription or resource group IDs
  condition: {
    field: string; // e.g., category, operationName, resourceType, status
    equals?: string;
    containsAny?: string[];
  }[];
  actionGroups?: string[]; // Action group resource IDs
  tags?: Record<string, string>;
}

/**
 * Handlebars helper to create activity log alert
 * 
 * @example
 * ```handlebars
 * {{{alert:activityLogAlert
 *   name="vm-delete-alert"
 *   description="Alert when VMs are deleted"
 *   scopes="[subscription().id]"
 *   condition='[{"field":"category","equals":"Administrative"},{"field":"operationName","equals":"Microsoft.Compute/virtualMachines/delete"}]'
 *   actionGroups='["[resourceId('microsoft.insights/actionGroups', 'ops-team')]"]'
 * }}}
 * ```
 */
export function alertActivityLogAlert(this: unknown, hash: ActivityLogAlertOptions): string {
  if (!hash || !hash.name) {
    throw new Error('alert:activityLogAlert requires name parameter');
  }
  if (!hash.scopes) {
    throw new Error('alert:activityLogAlert requires scopes parameter');
  }
  if (!hash.condition) {
    throw new Error('alert:activityLogAlert requires condition parameter');
  }

  // Parse condition if it's a JSON string
  let conditionArray = hash.condition;
  if (typeof hash.condition === 'string') {
    try {
      conditionArray = JSON.parse(hash.condition);
    } catch (e) {
      throw new Error(`alert:activityLogAlert condition must be valid JSON array: ${e}`);
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
    type: 'Microsoft.Insights/activityLogAlerts',
    apiVersion: '2020-10-01',
    name: hash.name,
    location: 'global',
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      description: hash.description || `Activity log alert for ${hash.name}`,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      scopes: scopesArray,
      condition: {
        allOf: conditionArray
      },
      ...(actionGroupsArray && actionGroupsArray.length > 0 && {
        actions: {
          actionGroups: actionGroupsArray.map(id => ({ actionGroupId: id }))
        }
      })
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerActivityLogAlertHelpers(): void {
  Handlebars.registerHelper('alert:activityLogAlert', alertActivityLogAlert);
}
