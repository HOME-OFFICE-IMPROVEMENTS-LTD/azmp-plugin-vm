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
 * Helper categories and their expected usage patterns
 */
const HELPER_CATEGORIES = {
  VM_CORE: [
    "vmSizes",
    "vmSize",
    "osImages",
    "osImage",
    "storageTypes",
    "diskSize",
    "createVm",
    "vmProperties",
    "hardwareProfile",
    "osProfile",
    "storageProfile",
  ],
  NETWORKING: [
    "createVNet",
    "createSubnet",
    "createNSG",
    "nsgRule",
    "createPublicIP",
    "createLoadBalancer",
    "createApplicationGateway",
    "createBastion",
  ],
  EXTENSIONS: [
    "customScriptExtension",
    "diagnosticsExtension",
    "antiMalwareExtension",
    "domainJoinExtension",
    "networkWatcherExtension",
  ],
  SECURITY: [
    "diskEncryption",
    "trustedLaunch",
    "securityType",
    "encryptionAtHost",
  ],
  IDENTITY: [
    "managedIdentity",
    "systemAssignedIdentity",
    "userAssignedIdentity",
    "rbacAssignment",
  ],
  AVAILABILITY: [
    "availabilitySet",
    "availabilityZones",
    "vmssFlexible",
    "vmssUniform",
  ],
  RECOVERY: [
    "recoveryServicesVault",
    "backupPolicy",
    "enableVMBackup",
    "siteRecovery",
  ],
};

/**
 * Helper Usage Validator
 */
export class HelperUsageValidator {
  private templateContent: string;
  private context: any;

  constructor(templateContent: string, context: any = {}) {
    this.templateContent = templateContent;
    this.context = context;
  }

  /**
   * Validate helper usage in template
   */
  validate(): HelperUsageResult {
    const result: HelperUsageResult = {
      isValid: true,
      errors: [],
      warnings: [],
      coverage: this.calculateCoverage(),
    };

    // Check for proper helper usage patterns
    this.validateHelperPatterns(result);

    // Check for deprecated helper usage
    this.validateDeprecatedHelpers(result);

    // Check for missing required helpers
    this.validateRequiredHelpers(result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Calculate helper coverage
   */
  private calculateCoverage(): HelperCoverage {
    const allHelpers = Object.values(HELPER_CATEGORIES).flat();
    const usedHelpers = this.findUsedHelpers();
    const unusedHelpers = allHelpers.filter(
      (helper) => !usedHelpers.includes(helper),
    );

    return {
      totalHelpers: allHelpers.length,
      usedHelpers: usedHelpers.length,
      unusedHelpers,
      coveragePercentage: Math.round(
        (usedHelpers.length / allHelpers.length) * 100,
      ),
    };
  }

  /**
   * Find helpers used in template
   */
  private findUsedHelpers(): string[] {
    const helperPattern = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*[^}]*\}\}/g;
    const usedHelpers = new Set<string>();
    let match;

    while ((match = helperPattern.exec(this.templateContent)) !== null) {
      const helperName = match[1];
      // Filter out Handlebars built-ins
      if (
        ![
          "if",
          "unless",
          "each",
          "with",
          "eq",
          "ne",
          "gt",
          "lt",
          "and",
          "or",
        ].includes(helperName)
      ) {
        usedHelpers.add(helperName);
      }
    }

    return Array.from(usedHelpers);
  }

  /**
   * Validate helper usage patterns
   */
  private validateHelperPatterns(result: HelperUsageResult): void {
    // Check for VM size validation
    if (
      this.templateContent.includes("vmSize") &&
      !this.templateContent.includes("validateVmSize")
    ) {
      result.warnings.push({
        helper: "vmSize",
        message: "Consider using validateVmSize helper to ensure valid VM size",
      });
    }

    // Check for proper OS image usage
    if (
      this.templateContent.includes("osImage") &&
      !this.templateContent.includes("getOsImageReference")
    ) {
      result.warnings.push({
        helper: "osImage",
        message:
          "Consider using getOsImageReference helper for consistent image references",
      });
    }

    // Check for security best practices
    if (this.templateContent.includes("Microsoft.Compute/virtualMachines")) {
      if (
        !this.templateContent.includes("trustedLaunch") &&
        !this.templateContent.includes("securityType")
      ) {
        result.warnings.push({
          helper: "trustedLaunch",
          message: "Consider enabling Trusted Launch for enhanced security",
        });
      }

      if (
        !this.templateContent.includes("diskEncryption") &&
        !this.templateContent.includes("encryptionAtHost")
      ) {
        result.warnings.push({
          helper: "diskEncryption",
          message: "Consider enabling disk encryption for data protection",
        });
      }
    }

    // Check for managed identity usage
    if (
      this.templateContent.includes("Microsoft.Compute/virtualMachines") &&
      !this.templateContent.includes("managedIdentity") &&
      !this.templateContent.includes("systemAssignedIdentity")
    ) {
      result.warnings.push({
        helper: "managedIdentity",
        message:
          "Consider using Managed Identity for secure Azure service authentication",
      });
    }
  }

  /**
   * Validate deprecated helpers
   */
  private validateDeprecatedHelpers(result: HelperUsageResult): void {
    const deprecatedHelpers = [
      "basicVm", // Use createVm instead
      "simpleNetworking", // Use createVNet, createSubnet instead
      "defaultStorage", // Use storageProfile helper instead
    ];

    deprecatedHelpers.forEach((deprecated) => {
      if (this.templateContent.includes(deprecated)) {
        result.errors.push({
          helper: deprecated,
          message: `Helper '${deprecated}' is deprecated and should not be used`,
        });
      }
    });
  }

  /**
   * Validate required helpers for specific configurations
   */
  private validateRequiredHelpers(result: HelperUsageResult): void {
    // If creating VMs, certain helpers should be present
    if (this.templateContent.includes("Microsoft.Compute/virtualMachines")) {
      const requiredForVm = ["vmSize", "osProfile", "storageProfile"];

      requiredForVm.forEach((required) => {
        if (!this.templateContent.includes(required)) {
          result.errors.push({
            helper: required,
            message: `Helper '${required}' is required when creating virtual machines`,
          });
        }
      });
    }

    // If creating networking resources, validate dependencies
    if (this.templateContent.includes("Microsoft.Network/networkInterfaces")) {
      if (
        !this.templateContent.includes("createVNet") &&
        !this.templateContent.includes("subnetRef")
      ) {
        result.errors.push({
          helper: "createVNet",
          message:
            "Network interface requires VNet configuration using createVNet or subnetRef helper",
        });
      }
    }

    // If using availability zones, validate region support
    if (
      this.templateContent.includes("availabilityZones") &&
      !this.templateContent.includes("supportsAvailabilityZones")
    ) {
      result.warnings.push({
        helper: "supportsAvailabilityZones",
        message: "Consider validating region support for availability zones",
      });
    }
  }
}

/**
 * Validate helper usage in template
 *
 * @param templateContent - Generated template content
 * @param context - Template generation context
 * @returns HelperUsageResult
 */
export function validateHelperUsage(
  templateContent: string,
  context: any = {},
): HelperUsageResult {
  const validator = new HelperUsageValidator(templateContent, context);
  return validator.validate();
}

/**
 * Get helper categories and their helpers
 */
export function getHelperCategories(): Record<string, string[]> {
  return HELPER_CATEGORIES;
}

/**
 * Check if helper is available
 *
 * @param helperName - Name of the helper
 * @returns boolean
 */
export function isHelperAvailable(helperName: string): boolean {
  const allHelpers = Object.values(HELPER_CATEGORIES).flat();
  return allHelpers.includes(helperName);
}
