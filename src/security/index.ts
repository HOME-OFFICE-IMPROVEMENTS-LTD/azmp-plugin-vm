/**
 * Security Module - Main Index
 *
 * Provides Handlebars helpers for Azure VM security features
 * Supports encryption, Trusted Launch, and compliance templates
 *
 * @module security
 */

import * as encryption from "./encryption";
import * as trustedlaunch from "./trustedlaunch";

/**
 * Security template type
 */
export type SecurityTemplate =
  | "basic"
  | "encryption-basic"
  | "encryption-cmk"
  | "trusted-launch-standard"
  | "trusted-launch-advanced"
  | "security-compliant-soc2"
  | "security-compliant-hipaa"
  | "security-compliant-iso27001"
  | "security-compliant-fedramp"
  | "security-compliant-pci-dss"
  | "security-compliant-gdpr"
  | "security-gov-cloud"
  | "security-isolated"
  | "security-high-security";

/**
 * Security template metadata
 */
export interface SecurityTemplateMetadata {
  name: SecurityTemplate;
  displayName: string;
  description: string;
  features: string[];
  compliance: string[];
  priority: "Must-Have" | "Should-Have" | "Nice-to-Have";
}

/**
 * Security templates catalog
 */
export const securityTemplates: SecurityTemplateMetadata[] = [
  {
    name: "encryption-basic",
    displayName: "Basic Encryption",
    description: "Platform-managed encryption for OS and data disks",
    features: ["Server-Side Encryption", "Platform-managed keys"],
    compliance: ["General security"],
    priority: "Must-Have",
  },
  {
    name: "encryption-cmk",
    displayName: "Customer-Managed Key Encryption",
    description: "Encryption with customer-managed keys in Azure Key Vault",
    features: [
      "Server-Side Encryption",
      "Customer-managed keys",
      "Key Vault integration",
    ],
    compliance: ["SOC2", "HIPAA", "ISO27001", "GDPR"],
    priority: "Must-Have",
  },
  {
    name: "trusted-launch-standard",
    displayName: "Trusted Launch Standard",
    description: "Secure Boot and vTPM enabled",
    features: ["Secure Boot", "vTPM", "Generation 2 VM"],
    compliance: ["Basic security standards"],
    priority: "Should-Have",
  },
  {
    name: "trusted-launch-advanced",
    displayName: "Trusted Launch Advanced",
    description: "Full Trusted Launch with boot integrity monitoring",
    features: [
      "Secure Boot",
      "vTPM",
      "Boot Integrity Monitoring",
      "Azure Security Center",
    ],
    compliance: ["SOC2", "ISO27001", "PCI-DSS"],
    priority: "Should-Have",
  },
  {
    name: "security-compliant-soc2",
    displayName: "SOC2 Compliant",
    description: "SOC2 compliance-ready security configuration",
    features: [
      "CMK Encryption",
      "Trusted Launch Advanced",
      "Encryption at Host",
      "Logging",
    ],
    compliance: ["SOC2 Type I/II"],
    priority: "Must-Have",
  },
  {
    name: "security-compliant-hipaa",
    displayName: "HIPAA Compliant",
    description: "HIPAA compliance-ready with maximum security",
    features: [
      "ADE",
      "CMK",
      "Double Encryption",
      "Trusted Launch Maximum",
      "Attestation",
    ],
    compliance: ["HIPAA"],
    priority: "Must-Have",
  },
  {
    name: "security-compliant-iso27001",
    displayName: "ISO 27001 Compliant",
    description: "ISO 27001 information security standards",
    features: [
      "CMK Encryption",
      "Trusted Launch Advanced",
      "Access Controls",
      "Audit Logs",
    ],
    compliance: ["ISO 27001"],
    priority: "Should-Have",
  },
  {
    name: "security-compliant-fedramp",
    displayName: "FedRAMP Compliant",
    description: "US Federal government compliance with high security",
    features: [
      "ADE",
      "CMK",
      "Double Encryption",
      "Trusted Launch Maximum",
      "Key Rotation",
      "MFA",
    ],
    compliance: ["FedRAMP Moderate/High"],
    priority: "Should-Have",
  },
  {
    name: "security-compliant-pci-dss",
    displayName: "PCI DSS Compliant",
    description: "Payment Card Industry Data Security Standard",
    features: [
      "ADE",
      "CMK",
      "Trusted Launch Advanced",
      "Access Controls",
      "Network Segmentation",
    ],
    compliance: ["PCI DSS v3.2.1"],
    priority: "Should-Have",
  },
  {
    name: "security-compliant-gdpr",
    displayName: "GDPR Compliant",
    description: "EU General Data Protection Regulation compliance",
    features: [
      "CMK Encryption",
      "Data Residency",
      "Encryption at Host",
      "Access Logging",
    ],
    compliance: ["GDPR"],
    priority: "Should-Have",
  },
  {
    name: "security-gov-cloud",
    displayName: "Government Cloud",
    description: "Azure Government cloud security configuration",
    features: ["FedRAMP High", "FIPS 140-2", "IL5", "CMK", "Network Isolation"],
    compliance: ["FedRAMP High", "DoD IL5", "CJIS"],
    priority: "Nice-to-Have",
  },
  {
    name: "security-isolated",
    displayName: "Isolated Security",
    description: "Maximum isolation with dedicated hosts",
    features: [
      "Dedicated Host",
      "Network Isolation",
      "Private Endpoints",
      "CMK",
    ],
    compliance: ["High security requirements"],
    priority: "Nice-to-Have",
  },
];

/**
 * Create Handlebars helpers for security features
 */
export function createSecurityHelpers() {
  const helpers: Record<string, Function> = {};

  // Encryption Helpers
  helpers["security:encryption.ade"] = function (
    platform: "Windows" | "Linux",
    options: any,
  ) {
    const config = options.hash || {};
    return JSON.stringify(
      encryption.azureDiskEncryption(platform, config),
      null,
      2,
    );
  };

  helpers["security:encryption.sse"] = function (options: any) {
    const config = options.hash || {};
    return JSON.stringify(encryption.serverSideEncryption(config), null, 2);
  };

  helpers["security:encryption.atHost"] = function () {
    return JSON.stringify(encryption.encryptionAtHost(), null, 2);
  };

  helpers["security:encryption.cmk"] = function (
    keyVaultId: string,
    keyUrl: string,
  ) {
    return JSON.stringify(
      encryption.customerManagedKey(keyVaultId, keyUrl),
      null,
      2,
    );
  };

  helpers["security:encryption.platform"] = function () {
    return JSON.stringify(encryption.platformManagedEncryption(), null, 2);
  };

  helpers["security:encryption.double"] = function (options: any) {
    const config = options.hash || {};
    return JSON.stringify(encryption.doubleEncryption(config), null, 2);
  };

  helpers["security:encryption.recommendations"] = function (
    compliance: string,
  ) {
    return encryption.getEncryptionRecommendations(compliance as any);
  };

  // Trusted Launch Helpers
  helpers["security:trustedLaunch.secureBoot"] = function (
    enabled: boolean = true,
  ) {
    return JSON.stringify(trustedlaunch.secureBoot(enabled), null, 2);
  };

  helpers["security:trustedLaunch.vTpm"] = function (enabled: boolean = true) {
    return JSON.stringify(trustedlaunch.vTpm(enabled), null, 2);
  };

  helpers["security:trustedLaunch.bootIntegrity"] = function (
    enabled: boolean = true,
  ) {
    return JSON.stringify(
      trustedlaunch.bootIntegrityMonitoring(enabled),
      null,
      2,
    );
  };

  helpers["security:trustedLaunch.guestAttestation"] = function (
    platform: "Windows" | "Linux",
  ) {
    return JSON.stringify(
      trustedlaunch.guestAttestationExtension(platform),
      null,
      2,
    );
  };

  helpers["security:trustedLaunch.measuredBoot"] = function () {
    return JSON.stringify(trustedlaunch.measuredBoot(), null, 2);
  };

  helpers["security:trustedLaunch.config"] = function (
    level: "standard" | "advanced" | "maximum",
    platform: "Windows" | "Linux",
  ) {
    return JSON.stringify(
      trustedlaunch.createTrustedLaunchConfig(level, platform),
      null,
      2,
    );
  };

  helpers["security:trustedLaunch.recommendations"] = function (
    compliance: string,
  ) {
    return trustedlaunch.getTrustedLaunchRecommendations(compliance as any);
  };

  helpers["security:trustedLaunch.compatibleVmSizes"] = function () {
    return trustedlaunch.getCompatibleVmSizes();
  };

  // Security Template Helpers
  helpers["security:template.get"] = function (templateName: SecurityTemplate) {
    return securityTemplates.find((t) => t.name === templateName);
  };

  helpers["security:template.list"] = function (compliance?: string) {
    if (compliance) {
      return securityTemplates.filter((t) =>
        t.compliance.some((c) =>
          c.toLowerCase().includes(compliance.toLowerCase()),
        ),
      );
    }
    return securityTemplates;
  };

  helpers["security:template.listCompliance"] = function () {
    const complianceSet = new Set<string>();
    securityTemplates.forEach((t) =>
      t.compliance.forEach((c) => complianceSet.add(c)),
    );
    return Array.from(complianceSet).sort();
  };

  // Compliance Helpers
  helpers["security:compliance.getRequirements"] = function (
    framework: string,
  ) {
    const encRec = encryption.getEncryptionRecommendations(framework as any);
    const tlRec = trustedlaunch.getTrustedLaunchRecommendations(
      framework as any,
    );

    return {
      framework,
      encryption: encRec,
      trustedLaunch: tlRec,
      templates: securityTemplates.filter((t) =>
        t.compliance.some((c) =>
          c.toLowerCase().includes(framework.toLowerCase()),
        ),
      ),
    };
  };

  helpers["security:compliance.listFrameworks"] = function () {
    return ["SOC2", "HIPAA", "ISO27001", "FedRAMP", "PCI-DSS", "GDPR"];
  };

  // Utility Helpers
  helpers["security:count.encryption"] = function () {
    return 3; // ADE, SSE, Encryption at Host
  };

  helpers["security:count.trustedLaunch"] = function () {
    return 5; // Secure Boot, vTPM, Boot Integrity, Guest Attestation, Measured Boot
  };

  helpers["security:count.templates"] = function () {
    return securityTemplates.length;
  };

  helpers["security:count.compliance"] = function () {
    return 6; // SOC2, HIPAA, ISO27001, FedRAMP, PCI-DSS, GDPR
  };

  return helpers;
}

// Export all modules
export { encryption, trustedlaunch };
export * from "./encryption";
export * from "./trustedlaunch";
