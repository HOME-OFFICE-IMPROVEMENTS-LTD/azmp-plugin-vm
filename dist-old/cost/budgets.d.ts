/**
 * Budget and cost alert helper utilities.
 * These helpers are used by Handlebars helpers as well as CLI commands.
 */
export type BudgetTimeGrain = "Monthly" | "Quarterly" | "Annually";
export type BudgetCategory = "Cost" | "Usage";
export interface BudgetNotificationOptions {
    threshold: number;
    contactEmails: string[];
    contactRoles?: string[];
    thresholdType?: "Actual" | "Forecasted";
    operator?: "GreaterThan" | "GreaterThanOrEqualTo";
    message?: string;
    webhookEndpoint?: string;
}
export interface BudgetDefinitionOptions {
    name: string;
    amount: number;
    timeGrain: BudgetTimeGrain;
    startDate: string;
    endDate?: string;
    category: BudgetCategory;
    notifications?: BudgetNotificationOptions[];
    resourceGroups?: string[];
    tags?: Record<string, string>;
}
export interface BudgetDefinition {
    name: string;
    properties: {
        amount: number;
        timeGrain: BudgetTimeGrain;
        timePeriod: {
            startDate: string;
            endDate?: string;
        };
        category: BudgetCategory;
        notifications: Record<string, any>;
        filters?: {
            resourceGroups?: string[];
            tags?: Record<string, string[]>;
        };
    };
}
export interface CostAlertTemplateOptions {
    budgetName: string;
    threshold: number;
    contactEmails: string[];
    contactRoles?: string[];
    actionGroups?: string[];
    subject?: string;
    message?: string;
}
export interface CostAlertTemplate {
    name: string;
    type: "BudgetAlert";
    properties: {
        condition: {
            threshold: number;
            operator: "GreaterThan" | "GreaterThanOrEqualTo";
        };
        notification: {
            contactEmails: string[];
            contactRoles: string[];
            actionGroups: string[];
            subject: string;
            message: string;
        };
        linkedBudget: string;
    };
}
/**
 * Create an Azure Cost Management budget definition.
 */
export declare function createBudgetDefinition(options: BudgetDefinitionOptions): BudgetDefinition;
/**
 * Create a cost alert template referencing a budget.
 */
export declare function createCostAlertTemplate(options: CostAlertTemplateOptions): CostAlertTemplate;
