/**
 * Options for alert:activityLogAlert helper
 * Creates alerts based on Azure Activity Log events
 */
export interface ActivityLogAlertOptions {
    name: string;
    description?: string;
    enabled?: boolean;
    scopes: string | string[];
    condition: {
        field: string;
        equals?: string;
        containsAny?: string[];
    }[];
    actionGroups?: string[];
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
export declare function alertActivityLogAlert(this: unknown, hash: ActivityLogAlertOptions): string;
export declare function registerActivityLogAlertHelpers(): void;
