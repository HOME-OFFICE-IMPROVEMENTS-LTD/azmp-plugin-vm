/**
 * ARM Template Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
/**
 * Validation Error
 */
export interface ValidationError {
    code: string;
    message: string;
    target?: string;
    details?: ValidationError[];
}
/**
 * Validation Warning
 */
export interface ValidationWarning {
    code: string;
    message: string;
    target?: string;
}
/**
 * ARM Template Validator
 *
 * Validates ARM templates using Azure Resource Manager validation API
 */
export declare class ArmValidator {
    private subscriptionId;
    private resourceGroupName;
    private accessToken;
    constructor(subscriptionId: string, resourceGroupName: string, accessToken: string);
    /**
     * Validate ARM template using Azure validation API
     *
     * @param template - The ARM template JSON
     * @param parameters - Template parameters
     * @returns Promise<ValidationResult>
     */
    validateTemplate(template: any, parameters?: any): Promise<ValidationResult>;
    /**
     * Call Azure ARM validation API
     */
    private callAzureValidationApi;
    /**
     * Parse Azure validation API response
     */
    private parseValidationResponse;
    /**
     * Validate template without Azure API (basic JSON validation)
     *
     * @param template - The ARM template JSON
     * @returns ValidationResult
     */
    validateTemplateStructure(template: any): ValidationResult;
}
/**
 * Create ARM validator instance
 *
 * @param subscriptionId - Azure subscription ID
 * @param resourceGroupName - Resource group name for validation
 * @param accessToken - Azure access token
 * @returns ArmValidator instance
 */
export declare function createArmValidator(subscriptionId: string, resourceGroupName: string, accessToken: string): ArmValidator;
/**
 * Validate ARM template structure without Azure API
 *
 * @param template - ARM template JSON
 * @returns ValidationResult
 */
export declare function validateArmStructure(template: any): ValidationResult;
