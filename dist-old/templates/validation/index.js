"use strict";
/**
 * Template validation index
 *
 * Provides unified interface for ARM and helper validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHelperAvailable = exports.getHelperCategories = exports.validateHelperUsage = exports.HelperUsageValidator = exports.validateArmStructure = exports.createArmValidator = exports.ArmValidator = void 0;
exports.validateTemplate = validateTemplate;
const armValidator_1 = require("./armValidator");
Object.defineProperty(exports, "ArmValidator", { enumerable: true, get: function () { return armValidator_1.ArmValidator; } });
Object.defineProperty(exports, "createArmValidator", { enumerable: true, get: function () { return armValidator_1.createArmValidator; } });
Object.defineProperty(exports, "validateArmStructure", { enumerable: true, get: function () { return armValidator_1.validateArmStructure; } });
const helperValidator_1 = require("./helperValidator");
Object.defineProperty(exports, "HelperUsageValidator", { enumerable: true, get: function () { return helperValidator_1.HelperUsageValidator; } });
Object.defineProperty(exports, "validateHelperUsage", { enumerable: true, get: function () { return helperValidator_1.validateHelperUsage; } });
Object.defineProperty(exports, "getHelperCategories", { enumerable: true, get: function () { return helperValidator_1.getHelperCategories; } });
Object.defineProperty(exports, "isHelperAvailable", { enumerable: true, get: function () { return helperValidator_1.isHelperAvailable; } });
/**
 * Validate template with both ARM and helper validation
 *
 * @param template - ARM template JSON
 * @param templateContent - Template content string (for helper validation)
 * @param context - Template generation context
 * @param armValidator - Optional ARM validator instance
 * @returns Promise<CombinedValidationResult>
 */
async function validateTemplate(template, templateContent, context = {}, armValidator) {
    // ARM validation
    let armValidation;
    if (armValidator) {
        armValidation = await armValidator.validateTemplate(template);
    }
    else {
        armValidation = (0, armValidator_1.validateArmStructure)(template);
    }
    // Helper validation
    const helperValidation = (0, helperValidator_1.validateHelperUsage)(templateContent, context);
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
function generateValidationSummary(armValidation, helperValidation) {
    const lines = [];
    if (armValidation.isValid && helperValidation.isValid) {
        lines.push("✅ Template validation passed");
    }
    else {
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
    lines.push(`Helper Coverage: ${helperValidation.coverage.coveragePercentage}% (${helperValidation.coverage.usedHelpers}/${helperValidation.coverage.totalHelpers})`);
    return lines.join("\n");
}
