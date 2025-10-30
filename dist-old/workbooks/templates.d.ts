/**
 * Azure Monitor Workbook Templates
 * Pre-built workbook definitions for VM monitoring, application insights, and infrastructure analysis
 */
import { WorkbookTemplate, WorkbookGenerationOptions } from "./index";
/**
 * WorkbookTemplateManager class
 * Manages workbook templates and provides generation capabilities
 */
export declare class WorkbookTemplateManager {
    private static readonly ALL_TEMPLATES;
    /**
     * Get all available workbook templates
     */
    static getAllTemplates(): WorkbookTemplate[];
    /**
     * Get templates by category
     */
    static getTemplatesByCategory(category: WorkbookTemplate["category"]): WorkbookTemplate[];
    /**
     * Get a specific template by ID
     */
    static getTemplate(templateId: string): WorkbookTemplate | null;
    /**
     * Search templates by tags
     */
    static searchTemplatesByTags(tags: string[]): WorkbookTemplate[];
    /**
     * Generate a workbook from a template with custom parameters
     */
    static generateWorkbook(options: WorkbookGenerationOptions): any;
    /**
     * Apply custom parameters to a workbook definition
     */
    private static applyCustomParameters;
    /**
     * Validate a workbook template definition
     */
    static validateTemplate(template: WorkbookTemplate): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get template statistics
     */
    static getTemplateStats(): {
        total: number;
        byCategory: Record<string, number>;
        byTags: Record<string, number>;
    };
}
