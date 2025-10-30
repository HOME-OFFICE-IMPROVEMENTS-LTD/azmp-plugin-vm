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
export type SecurityTemplate = "basic" | "encryption-basic" | "encryption-cmk" | "trusted-launch-standard" | "trusted-launch-advanced" | "security-compliant-soc2" | "security-compliant-hipaa" | "security-compliant-iso27001" | "security-compliant-fedramp" | "security-compliant-pci-dss" | "security-compliant-gdpr" | "security-gov-cloud" | "security-isolated" | "security-high-security";
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
export declare const securityTemplates: SecurityTemplateMetadata[];
/**
 * Create Handlebars helpers for security features
 */
export declare function createSecurityHelpers(): Record<string, Function>;
export { encryption, trustedlaunch };
export * from "./encryption";
export * from "./trustedlaunch";
