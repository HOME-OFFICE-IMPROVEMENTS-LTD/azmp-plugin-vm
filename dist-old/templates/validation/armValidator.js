"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmValidator = void 0;
exports.createArmValidator = createArmValidator;
exports.validateArmStructure = validateArmStructure;
const https = __importStar(require("https"));
/**
 * ARM Template Validator
 *
 * Validates ARM templates using Azure Resource Manager validation API
 */
class ArmValidator {
    subscriptionId;
    resourceGroupName;
    accessToken;
    constructor(subscriptionId, resourceGroupName, accessToken) {
        this.subscriptionId = subscriptionId;
        this.resourceGroupName = resourceGroupName;
        this.accessToken = accessToken;
    }
    /**
     * Validate ARM template using Azure validation API
     *
     * @param template - The ARM template JSON
     * @param parameters - Template parameters
     * @returns Promise<ValidationResult>
     */
    async validateTemplate(template, parameters = {}) {
        try {
            const validationPayload = {
                properties: {
                    template: template,
                    parameters: parameters,
                    mode: "Incremental",
                },
            };
            const response = await this.callAzureValidationApi(validationPayload);
            return this.parseValidationResponse(response);
        }
        catch (error) {
            return {
                isValid: false,
                errors: [
                    {
                        code: "VALIDATION_API_ERROR",
                        message: `Failed to validate template: ${error instanceof Error ? error.message : "Unknown error"}`,
                    },
                ],
                warnings: [],
            };
        }
    }
    /**
     * Call Azure ARM validation API
     */
    async callAzureValidationApi(payload) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(payload);
            const options = {
                hostname: "management.azure.com",
                port: 443,
                path: `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Resources/deployments/validation/validate?api-version=2021-04-01`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData),
                    Authorization: `Bearer ${this.accessToken}`,
                },
            };
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        const response = JSON.parse(data);
                        resolve(response);
                    }
                    catch (error) {
                        reject(new Error(`Failed to parse response: ${error}`));
                    }
                });
            });
            req.on("error", (error) => {
                reject(error);
            });
            req.write(postData);
            req.end();
        });
    }
    /**
     * Parse Azure validation API response
     */
    parseValidationResponse(response) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (response.error) {
            result.isValid = false;
            result.errors.push({
                code: response.error.code,
                message: response.error.message,
                details: response.error.details?.map((detail) => ({
                    code: detail.code,
                    message: detail.message,
                    target: detail.target,
                })),
            });
        }
        return result;
    }
    /**
     * Validate template without Azure API (basic JSON validation)
     *
     * @param template - The ARM template JSON
     * @returns ValidationResult
     */
    validateTemplateStructure(template) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        // Check required ARM template properties
        if (!template.$schema) {
            result.errors.push({
                code: "MISSING_SCHEMA",
                message: "ARM template must have $schema property",
            });
            result.isValid = false;
        }
        if (!template.contentVersion) {
            result.errors.push({
                code: "MISSING_CONTENT_VERSION",
                message: "ARM template must have contentVersion property",
            });
            result.isValid = false;
        }
        if (!template.resources || !Array.isArray(template.resources)) {
            result.errors.push({
                code: "MISSING_RESOURCES",
                message: "ARM template must have resources array",
            });
            result.isValid = false;
        }
        // Validate parameters
        if (template.parameters) {
            for (const [paramName, param] of Object.entries(template.parameters)) {
                if (!param || typeof param !== "object" || !param.type) {
                    result.errors.push({
                        code: "INVALID_PARAMETER",
                        message: `Parameter '${paramName}' must have a type property`,
                        target: paramName,
                    });
                    result.isValid = false;
                }
            }
        }
        // Validate resources
        if (template.resources && Array.isArray(template.resources)) {
            template.resources.forEach((resource, index) => {
                if (!resource.type) {
                    result.errors.push({
                        code: "MISSING_RESOURCE_TYPE",
                        message: `Resource at index ${index} must have a type property`,
                        target: `resources[${index}]`,
                    });
                    result.isValid = false;
                }
                if (!resource.apiVersion) {
                    result.errors.push({
                        code: "MISSING_API_VERSION",
                        message: `Resource at index ${index} must have an apiVersion property`,
                        target: `resources[${index}]`,
                    });
                    result.isValid = false;
                }
                if (!resource.name) {
                    result.errors.push({
                        code: "MISSING_RESOURCE_NAME",
                        message: `Resource at index ${index} must have a name property`,
                        target: `resources[${index}]`,
                    });
                    result.isValid = false;
                }
            });
        }
        return result;
    }
}
exports.ArmValidator = ArmValidator;
/**
 * Create ARM validator instance
 *
 * @param subscriptionId - Azure subscription ID
 * @param resourceGroupName - Resource group name for validation
 * @param accessToken - Azure access token
 * @returns ArmValidator instance
 */
function createArmValidator(subscriptionId, resourceGroupName, accessToken) {
    return new ArmValidator(subscriptionId, resourceGroupName, accessToken);
}
/**
 * Validate ARM template structure without Azure API
 *
 * @param template - ARM template JSON
 * @returns ValidationResult
 */
function validateArmStructure(template) {
    const validator = new ArmValidator("", "", "");
    return validator.validateTemplateStructure(template);
}
