/**
 * Helper Usage Validation
 *
 * Validates that helpers are used appropriately in generated templates
 */
export interface HelperUsageResult {
    isValid: boolean;
    errors: HelperUsageError[];
    warnings: HelperUsageWarning[];
    coverage: HelperCoverage;
}
export interface HelperUsageError {
    helper: string;
    message: string;
    context?: string;
}
export interface HelperUsageWarning {
    helper: string;
    message: string;
    context?: string;
}
export interface HelperCoverage {
    totalHelpers: number;
    usedHelpers: number;
    unusedHelpers: string[];
    coveragePercentage: number;
}
/**
 * Helper Usage Validator
 */
export declare class HelperUsageValidator {
    private templateContent;
    private context;
    constructor(templateContent: string, context?: any);
    /**
     * Validate helper usage in template
     */
    validate(): HelperUsageResult;
    /**
     * Calculate helper coverage
     */
    private calculateCoverage;
    /**
     * Find helpers used in template
     */
    private findUsedHelpers;
    /**
     * Validate helper usage patterns
     */
    private validateHelperPatterns;
    /**
     * Validate deprecated helpers
     */
    private validateDeprecatedHelpers;
    /**
     * Validate required helpers for specific configurations
     */
    private validateRequiredHelpers;
}
/**
 * Validate helper usage in template
 *
 * @param templateContent - Generated template content
 * @param context - Template generation context
 * @returns HelperUsageResult
 */
export declare function validateHelperUsage(templateContent: string, context?: any): HelperUsageResult;
/**
 * Get helper categories and their helpers
 */
export declare function getHelperCategories(): Record<string, string[]>;
/**
 * Check if helper is available
 *
 * @param helperName - Name of the helper
 * @returns boolean
 */
export declare function isHelperAvailable(helperName: string): boolean;
