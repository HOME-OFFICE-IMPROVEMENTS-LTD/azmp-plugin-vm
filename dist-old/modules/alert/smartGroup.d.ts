/**
 * Options for alert:smartGroup helper
 * Creates smart groups for alert correlation and suppression
 */
export interface SmartGroupOptions {
    name: string;
    description?: string;
    enabled?: boolean;
    scopes: string | string[];
    groupingConfiguration?: {
        groupByFields: string[];
        lookbackDuration?: string;
    };
    suppressionConfiguration?: {
        recurrenceDuration: string;
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
export declare function alertSmartGroup(this: unknown, hash: SmartGroupOptions): string;
export declare function registerSmartGroupHelpers(): void;
