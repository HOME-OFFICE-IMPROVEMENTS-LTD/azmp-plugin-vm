/**
 * Template validation index
 *
 * Provides unified interface for ARM and helper validation
 */
import { ArmValidator, ValidationResult, ValidationError, ValidationWarning, createArmValidator, validateArmStructure } from "./armValidator";
import { HelperUsageValidator, HelperUsageResult, HelperUsageError, HelperUsageWarning, HelperCoverage, validateHelperUsage, getHelperCategories, isHelperAvailable } from "./helperValidator";
export { ArmValidator, ValidationResult, ValidationError, ValidationWarning, createArmValidator, validateArmStructure, HelperUsageValidator, HelperUsageResult, HelperUsageError, HelperUsageWarning, HelperCoverage, validateHelperUsage, getHelperCategories, isHelperAvailable, };
/**
 * Combined validation result
 */
export interface CombinedValidationResult {
    armValidation: ValidationResult;
    helperValidation: HelperUsageResult;
    isValid: boolean;
    summary: string;
}
/**
 * Validate template with both ARM and helper validation
 *
 * @param template - ARM template JSON
 * @param templateContent - Template content string (for helper validation)
 * @param context - Template generation context
 * @param armValidator - Optional ARM validator instance
 * @returns Promise<CombinedValidationResult>
 */
export declare function validateTemplate(template: any, templateContent: string, context?: any, armValidator?: ArmValidator): Promise<CombinedValidationResult>;
