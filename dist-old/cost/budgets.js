"use strict";
/**
 * Budget and cost alert helper utilities.
 * These helpers are used by Handlebars helpers as well as CLI commands.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBudgetDefinition = createBudgetDefinition;
exports.createCostAlertTemplate = createCostAlertTemplate;
/**
 * Create an Azure Cost Management budget definition.
 */
function createBudgetDefinition(options) {
    if (!options.name) {
        throw new Error("Budget name is required");
    }
    if (options.amount <= 0) {
        throw new Error("Budget amount must be greater than 0");
    }
    if (!options.startDate) {
        throw new Error("Budget startDate is required");
    }
    const notifications = (options.notifications ?? []).reduce((acc, notification, index) => {
        const key = `notification${index + 1}`;
        acc[key] = {
            enabled: true,
            operator: notification.operator || "GreaterThan",
            threshold: notification.threshold,
            contactEmails: notification.contactEmails,
            contactRoles: notification.contactRoles ?? [],
            thresholdType: notification.thresholdType || "Actual",
            notificationMessage: notification.message,
            webhookEndpoint: notification.webhookEndpoint,
        };
        return acc;
    }, {});
    const filters = {};
    if (options.resourceGroups && options.resourceGroups.length > 0) {
        filters.resourceGroups = options.resourceGroups;
    }
    if (options.tags && Object.keys(options.tags).length > 0) {
        filters.tags = Object.entries(options.tags).reduce((acc, [key, value]) => {
            acc[key] = [value];
            return acc;
        }, {});
    }
    return {
        name: options.name,
        properties: {
            amount: Number(options.amount.toFixed(2)),
            timeGrain: options.timeGrain,
            timePeriod: {
                startDate: options.startDate,
                endDate: options.endDate,
            },
            category: options.category,
            notifications,
            filters: Object.keys(filters).length > 0 ? filters : undefined,
        },
    };
}
/**
 * Create a cost alert template referencing a budget.
 */
function createCostAlertTemplate(options) {
    if (!options.budgetName) {
        throw new Error("budgetName is required for cost alert template");
    }
    if (!options.contactEmails || options.contactEmails.length === 0) {
        throw new Error("At least one contact email is required for cost alert template");
    }
    return {
        name: `${options.budgetName}-alert-${options.threshold}`,
        type: "BudgetAlert",
        properties: {
            condition: {
                threshold: options.threshold,
                operator: "GreaterThanOrEqualTo",
            },
            notification: {
                contactEmails: options.contactEmails,
                contactRoles: options.contactRoles ?? [],
                actionGroups: options.actionGroups ?? [],
                subject: options.subject ?? "Azure Cost Budget Alert",
                message: options.message ??
                    `Budget ${options.budgetName} exceeded ${options.threshold}%`,
            },
            linkedBudget: options.budgetName,
        },
    };
}
