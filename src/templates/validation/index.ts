/**
 * Template validation index
 *
 * Provides unified interface for ARM and helper validation
 */

import {
  ArmValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  createArmValidator,
  validateArmStructure,
} from "./armValidator";

import {
  HelperUsageValidator,
  HelperUsageResult,
  HelperUsageError,
  HelperUsageWarning,
  HelperCoverage,
  validateHelperUsage,
  getHelperCategories,
  isHelperAvailable,
} from "./helperValidator";

export {
  ArmValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  createArmValidator,
  validateArmStructure,
  HelperUsageValidator,
  HelperUsageResult,
  HelperUsageError,
  HelperUsageWarning,
  HelperCoverage,
  validateHelperUsage,
  getHelperCategories,
  isHelperAvailable,
};

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
export async function validateTemplate(
  template: any,
  templateContent: string,
  context: any = {},
  armValidator?: ArmValidator,
): Promise<CombinedValidationResult> {
  // ARM validation
  let armValidation: ValidationResult;
  if (armValidator) {
    armValidation = await armValidator.validateTemplate(template);
  } else {
    armValidation = validateArmStructure(template);
  }

  // Helper validation
  const helperValidation = validateHelperUsage(templateContent, context);

  // Combined result
  const isValid = armValidation.isValid && helperValidation.isValid;

  const summary = generateValidationSummary(armValidation, helperValidation);

  return {
    armValidation,
    helperValidation,
    isValid,
    summary,
  };
}

/**
 * Generate validation summary
 */
function generateValidationSummary(
  armValidation: ValidationResult,
  helperValidation: HelperUsageResult,
): string {
  const lines: string[] = [];

  if (armValidation.isValid && helperValidation.isValid) {
    lines.push("✅ Template validation passed");
  } else {
    lines.push("❌ Template validation failed");
  }

  // ARM validation summary
  if (armValidation.errors.length > 0) {
    lines.push(`ARM Errors: ${armValidation.errors.length}`);
  }
  if (armValidation.warnings.length > 0) {
    lines.push(`ARM Warnings: ${armValidation.warnings.length}`);
  }

  // Helper validation summary
  if (helperValidation.errors.length > 0) {
    lines.push(`Helper Errors: ${helperValidation.errors.length}`);
  }
  if (helperValidation.warnings.length > 0) {
    lines.push(`Helper Warnings: ${helperValidation.warnings.length}`);
  }

  // Coverage summary
  lines.push(
    `Helper Coverage: ${helperValidation.coverage.coveragePercentage}% (${helperValidation.coverage.usedHelpers}/${helperValidation.coverage.totalHelpers})`,
  );

  return lines.join("\n");
}
