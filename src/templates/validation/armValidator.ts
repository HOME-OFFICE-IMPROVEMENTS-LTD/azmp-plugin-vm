import * as https from 'https';
import { IncomingMessage } from 'http';

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
 * ARM Deployment Validation Response
 */
interface ArmValidationResponse {
  error?: {
    code: string;
    message: string;
    details?: Array<{
      code: string;
      message: string;
      target?: string;
    }>;
  };
  properties?: {
    validatedResources?: Array<{
      id: string;
      type: string;
    }>;
  };
}

/**
 * ARM Template Validator
 * 
 * Validates ARM templates using Azure Resource Manager validation API
 */
export class ArmValidator {
  private subscriptionId: string;
  private resourceGroupName: string;
  private accessToken: string;

  constructor(subscriptionId: string, resourceGroupName: string, accessToken: string) {
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
  async validateTemplate(template: any, parameters: any = {}): Promise<ValidationResult> {
    try {
      const validationPayload = {
        properties: {
          template: template,
          parameters: parameters,
          mode: 'Incremental'
        }
      };

      const response = await this.callAzureValidationApi(validationPayload);
      return this.parseValidationResponse(response);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          code: 'VALIDATION_API_ERROR',
          message: `Failed to validate template: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        warnings: []
      };
    }
  }

  /**
   * Call Azure ARM validation API
   */
  private async callAzureValidationApi(payload: any): Promise<ArmValidationResponse> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'management.azure.com',
        port: 443,
        path: `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Resources/deployments/validation/validate?api-version=2021-04-01`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${this.accessToken}`
        }
      };

      const req = https.request(options, (res: IncomingMessage) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Parse Azure validation API response
   */
  private parseValidationResponse(response: ArmValidationResponse): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (response.error) {
      result.isValid = false;
      result.errors.push({
        code: response.error.code,
        message: response.error.message,
        details: response.error.details?.map(detail => ({
          code: detail.code,
          message: detail.message,
          target: detail.target
        }))
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
  validateTemplateStructure(template: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required ARM template properties
    if (!template.$schema) {
      result.errors.push({
        code: 'MISSING_SCHEMA',
        message: 'ARM template must have $schema property'
      });
      result.isValid = false;
    }

    if (!template.contentVersion) {
      result.errors.push({
        code: 'MISSING_CONTENT_VERSION',
        message: 'ARM template must have contentVersion property'
      });
      result.isValid = false;
    }

    if (!template.resources || !Array.isArray(template.resources)) {
      result.errors.push({
        code: 'MISSING_RESOURCES',
        message: 'ARM template must have resources array'
      });
      result.isValid = false;
    }

    // Validate parameters
    if (template.parameters) {
      for (const [paramName, param] of Object.entries(template.parameters as any)) {
        if (!param || typeof param !== 'object' || !(param as any).type) {
          result.errors.push({
            code: 'INVALID_PARAMETER',
            message: `Parameter '${paramName}' must have a type property`,
            target: paramName
          });
          result.isValid = false;
        }
      }
    }

    // Validate resources
    if (template.resources && Array.isArray(template.resources)) {
      template.resources.forEach((resource: any, index: number) => {
        if (!resource.type) {
          result.errors.push({
            code: 'MISSING_RESOURCE_TYPE',
            message: `Resource at index ${index} must have a type property`,
            target: `resources[${index}]`
          });
          result.isValid = false;
        }

        if (!resource.apiVersion) {
          result.errors.push({
            code: 'MISSING_API_VERSION',
            message: `Resource at index ${index} must have an apiVersion property`,
            target: `resources[${index}]`
          });
          result.isValid = false;
        }

        if (!resource.name) {
          result.errors.push({
            code: 'MISSING_RESOURCE_NAME',
            message: `Resource at index ${index} must have a name property`,
            target: `resources[${index}]`
          });
          result.isValid = false;
        }
      });
    }

    return result;
  }
}

/**
 * Create ARM validator instance
 * 
 * @param subscriptionId - Azure subscription ID
 * @param resourceGroupName - Resource group name for validation
 * @param accessToken - Azure access token
 * @returns ArmValidator instance
 */
export function createArmValidator(
  subscriptionId: string, 
  resourceGroupName: string, 
  accessToken: string
): ArmValidator {
  return new ArmValidator(subscriptionId, resourceGroupName, accessToken);
}

/**
 * Validate ARM template structure without Azure API
 * 
 * @param template - ARM template JSON
 * @returns ValidationResult
 */
export function validateArmStructure(template: any): ValidationResult {
  const validator = new ArmValidator('', '', '');
  return validator.validateTemplateStructure(template);
}