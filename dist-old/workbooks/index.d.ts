/**
 * Azure Monitor Workbooks module for azmp-plugin-vm
 * Provides pre-built workbook templates and helpers for VM monitoring, performance analysis, and infrastructure insights
 */
export { WorkbookTemplateManager } from "./templates";
export { registerWorkbookHelpers } from "./helpers";
export type WorkbookCategory = "vm-monitoring" | "application" | "infrastructure" | "advanced-monitoring" | "scaling-analytics" | "cost-optimization";
export interface WorkbookTemplate {
    id: string;
    name: string;
    description: string;
    category: WorkbookCategory;
    tags: string[];
    version: string;
    definition: any;
    complexity?: "basic" | "intermediate" | "advanced" | "expert";
    estimatedSetupTime?: string;
    prerequisites?: string[];
}
export interface WorkbookGenerationOptions {
    templateId: string;
    subscriptionId?: string;
    resourceGroupName?: string;
    vmName?: string;
    location?: string;
    customParameters?: Record<string, any>;
}
export interface WorkbookValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
