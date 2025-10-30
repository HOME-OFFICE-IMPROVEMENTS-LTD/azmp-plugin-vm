"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertActionGroup = alertActionGroup;
exports.registerActionGroupHelpers = registerActionGroupHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
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
function alertActionGroup(hash) {
    if (!hash || !hash.name) {
        throw new Error("alert:actionGroup requires name parameter");
    }
    if (!hash.shortName) {
        throw new Error("alert:actionGroup requires shortName parameter");
    }
    if (hash.shortName.length > 12) {
        throw new Error("alert:actionGroup shortName must be 12 characters or less");
    }
    // Parse receivers if they're JSON strings
    const parseReceivers = (receivers) => {
        if (!receivers)
            return undefined;
        if (typeof receivers === "string") {
            try {
                return JSON.parse(receivers);
            }
            catch (e) {
                throw new Error(`Failed to parse receivers JSON: ${e}`);
            }
        }
        return receivers;
    };
    const emailReceivers = parseReceivers(hash.emailReceivers);
    const smsReceivers = parseReceivers(hash.smsReceivers);
    const webhookReceivers = parseReceivers(hash.webhookReceivers);
    const azureFunctionReceivers = parseReceivers(hash.azureFunctionReceivers);
    const logicAppReceivers = parseReceivers(hash.logicAppReceivers);
    const automationRunbookReceivers = parseReceivers(hash.automationRunbookReceivers);
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
function registerActionGroupHelpers() {
    handlebars_1.default.registerHelper("alert:actionGroup", alertActionGroup);
}
