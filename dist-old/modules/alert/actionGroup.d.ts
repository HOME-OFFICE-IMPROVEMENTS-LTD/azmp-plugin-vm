/**
 * Options for alert:actionGroup helper
 * Creates action groups for alert notifications and automation
 */
export interface ActionGroupOptions {
    name: string;
    shortName: string;
    enabled?: boolean;
    emailReceivers?: Array<{
        name: string;
        emailAddress: string;
        useCommonAlertSchema?: boolean;
    }>;
    smsReceivers?: Array<{
        name: string;
        countryCode: string;
        phoneNumber: string;
    }>;
    webhookReceivers?: Array<{
        name: string;
        serviceUri: string;
        useCommonAlertSchema?: boolean;
        useAadAuth?: boolean;
        objectId?: string;
        identifierUri?: string;
        tenantId?: string;
    }>;
    azureFunctionReceivers?: Array<{
        name: string;
        functionAppResourceId: string;
        functionName: string;
        httpTriggerUrl: string;
        useCommonAlertSchema?: boolean;
    }>;
    logicAppReceivers?: Array<{
        name: string;
        resourceId: string;
        callbackUrl: string;
        useCommonAlertSchema?: boolean;
    }>;
    automationRunbookReceivers?: Array<{
        name: string;
        automationAccountId: string;
        runbookName: string;
        webhookResourceId: string;
        isGlobalRunbook: boolean;
        serviceUri?: string;
        useCommonAlertSchema?: boolean;
    }>;
    tags?: Record<string, string>;
}
/**
 * Handlebars helper to create action group for notifications
 *
 * @example
 * ```handlebars
 * {{{alert:actionGroup
 *   name="ops-team-action-group"
 *   shortName="ops-team"
 *   emailReceivers='[{"name":"ops-email","emailAddress":"ops@company.com","useCommonAlertSchema":true}]'
 *   smsReceivers='[{"name":"ops-sms","countryCode":"1","phoneNumber":"5551234567"}]'
 *   webhookReceivers='[{"name":"teams-webhook","serviceUri":"https://outlook.office.com/webhook/...","useCommonAlertSchema":true}]'
 * }}}
 * ```
 */
export declare function alertActionGroup(this: unknown, hash: ActionGroupOptions): string;
export declare function registerActionGroupHelpers(): void;
