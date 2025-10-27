import Handlebars from "handlebars";

/**
 * Options for alert:actionGroup helper
 * Creates action groups for alert notifications and automation
 */
export interface ActionGroupOptions {
  name: string;
  shortName: string; // Max 12 characters, used in SMS/email notifications
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
export function alertActionGroup(
  this: unknown,
  hash: ActionGroupOptions,
): string {
  if (!hash || !hash.name) {
    throw new Error("alert:actionGroup requires name parameter");
  }
  if (!hash.shortName) {
    throw new Error("alert:actionGroup requires shortName parameter");
  }
  if (hash.shortName.length > 12) {
    throw new Error(
      "alert:actionGroup shortName must be 12 characters or less",
    );
  }

  // Parse receivers if they're JSON strings
  const parseReceivers = (receivers: unknown): unknown[] | undefined => {
    if (!receivers) return undefined;
    if (typeof receivers === "string") {
      try {
        return JSON.parse(receivers);
      } catch (e) {
        throw new Error(`Failed to parse receivers JSON: ${e}`);
      }
    }
    return receivers as unknown[];
  };

  const emailReceivers = parseReceivers(hash.emailReceivers);
  const smsReceivers = parseReceivers(hash.smsReceivers);
  const webhookReceivers = parseReceivers(hash.webhookReceivers);
  const azureFunctionReceivers = parseReceivers(hash.azureFunctionReceivers);
  const logicAppReceivers = parseReceivers(hash.logicAppReceivers);
  const automationRunbookReceivers = parseReceivers(
    hash.automationRunbookReceivers,
  );

  const result = {
    type: "microsoft.insights/actionGroups",
    apiVersion: "2023-01-01",
    name: hash.name,
    location: "global",
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      groupShortName: hash.shortName,
      enabled: hash.enabled !== undefined ? hash.enabled : true,
      ...(emailReceivers && { emailReceivers }),
      ...(smsReceivers && { smsReceivers }),
      ...(webhookReceivers && { webhookReceivers }),
      ...(azureFunctionReceivers && { azureFunctionReceivers }),
      ...(logicAppReceivers && { logicAppReceivers }),
      ...(automationRunbookReceivers && { automationRunbookReceivers }),
    },
  };

  return JSON.stringify(result, null, 2);
}

export function registerActionGroupHelpers(): void {
  Handlebars.registerHelper("alert:actionGroup", alertActionGroup);
}
