/**
 * Security Trusted Launch Module
 *
 * Provides helpers for Azure Trusted Launch features
 * Supports Secure Boot, vTPM, and Boot Integrity Monitoring
 *
 * @module security/trustedlaunch
 */
/**
 * Trusted Launch security type
 */
export type SecurityType = "TrustedLaunch" | "ConfidentialVM" | "Standard";
/**
 * Trusted Launch configuration
 */
export interface TrustedLaunchConfig {
    securityType: SecurityType;
    uefiSettings?: {
        secureBootEnabled: boolean;
        vTpmEnabled: boolean;
    };
    bootIntegrityMonitoring?: boolean;
    guestAttestation?: boolean;
}
/**
 * 1. Secure Boot
 * Ensures only signed bootloaders and OS kernels can run
 *
 * @param enabled - Enable Secure Boot
 * @returns Secure Boot configuration
 */
export declare function secureBoot(enabled?: boolean): {
    feature: string;
    enabled: boolean;
    description: string;
    requirements: string[];
    benefits: string[];
};
/**
 * 2. Virtual Trusted Platform Module (vTPM)
 * Virtualized TPM 2.0 device for attestation and key protection
 *
 * @param enabled - Enable vTPM
 * @returns vTPM configuration
 */
export declare function vTpm(enabled?: boolean): {
    feature: string;
    enabled: boolean;
    description: string;
    requirements: string[];
    capabilities: string[];
    benefits: string[];
};
/**
 * 3. Boot Integrity Monitoring
 * Azure Security Center integration for boot chain monitoring
 *
 * @param enabled - Enable boot integrity monitoring
 * @returns Boot integrity monitoring configuration
 */
export declare function bootIntegrityMonitoring(enabled?: boolean): {
    feature: string;
    enabled: boolean;
    description: string;
    requirements: string[];
    capabilities: string[];
    alerts: string[];
};
/**
 * 4. Guest Attestation Extension
 * Enables runtime attestation and verification
 *
 * @param platform - Target platform
 * @returns Guest attestation extension configuration
 */
export declare function guestAttestationExtension(platform: "Windows" | "Linux"): {
    name: string;
    publisher: string;
    type: string;
    typeHandlerVersion: string;
    autoUpgradeMinorVersion: boolean;
    enableAutomaticUpgrade: boolean;
    settings: {
        AttestationConfig: {
            MaaSettings: {
                maaEndpoint: string;
                maaTenantName: string;
            };
            AscSettings: {
                ascReportingEndpoint: string;
                ascReportingFrequency: string;
            };
            useCustomToken: string;
            disableAlerts: string;
        };
    };
    platform: "Windows" | "Linux";
};
/**
 * 5. Measured Boot
 * Records measurements of boot chain components
 *
 * @returns Measured boot configuration
 */
export declare function measuredBoot(): {
    feature: string;
    enabled: boolean;
    description: string;
    measurements: string[];
    pcrBanks: string[];
    benefits: string[];
};
/**
 * Create complete Trusted Launch configuration
 *
 * @param level - Security level (standard, advanced, maximum)
 * @param platform - Target platform
 * @returns Complete Trusted Launch configuration
 */
export declare function createTrustedLaunchConfig(level: "standard" | "advanced" | "maximum", platform: "Windows" | "Linux"): TrustedLaunchConfig;
/**
 * Get Trusted Launch recommendations based on compliance
 *
 * @param compliance - Compliance framework
 * @returns Recommended Trusted Launch features
 */
export declare function getTrustedLaunchRecommendations(compliance: "SOC2" | "HIPAA" | "ISO27001" | "FedRAMP" | "PCI-DSS" | "GDPR"): any;
/**
 * Validate Trusted Launch configuration
 *
 * @param config - Trusted Launch configuration
 * @param vmGeneration - VM generation (1 or 2)
 * @returns Validation result
 */
export declare function validateTrustedLaunchConfig(config: TrustedLaunchConfig, vmGeneration: 1 | 2): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Get compatible VM sizes for Trusted Launch
 *
 * @returns List of compatible VM size families
 */
export declare function getCompatibleVmSizes(): string[];
/**
 * Export all Trusted Launch functions
 */
export declare const trustedlaunch: {
    secureBoot: typeof secureBoot;
    vTpm: typeof vTpm;
    bootIntegrityMonitoring: typeof bootIntegrityMonitoring;
    guestAttestationExtension: typeof guestAttestationExtension;
    measuredBoot: typeof measuredBoot;
    createTrustedLaunchConfig: typeof createTrustedLaunchConfig;
    getTrustedLaunchRecommendations: typeof getTrustedLaunchRecommendations;
    validateTrustedLaunchConfig: typeof validateTrustedLaunchConfig;
    getCompatibleVmSizes: typeof getCompatibleVmSizes;
};
