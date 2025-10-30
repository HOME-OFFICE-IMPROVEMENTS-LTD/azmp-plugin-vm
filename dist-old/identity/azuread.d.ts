/**
 * Identity Azure AD Module
 *
 * Provides helpers for Azure Active Directory integration
 * Supports AAD SSH Login, Conditional Access, and MFA
 *
 * @module identity/azuread
 */
/**
 * AAD SSH Login configuration
 */
export interface AADSSHLoginConfig {
    enabled: boolean;
    allowedPrincipals?: string[];
    enablePasswordlessAuth?: boolean;
}
/**
 * Conditional Access policy
 */
export interface ConditionalAccessPolicy {
    name: string;
    enabled: boolean;
    conditions: {
        locations?: string[];
        platforms?: string[];
        clientApps?: string[];
        riskLevel?: "low" | "medium" | "high";
    };
    controls: {
        requireMFA?: boolean;
        requireCompliantDevice?: boolean;
        requireDomainJoinedDevice?: boolean;
        blockAccess?: boolean;
    };
}
/**
 * MFA configuration
 */
export interface MFAConfig {
    enabled: boolean;
    methods: Array<"phone" | "email" | "authenticator" | "fido2" | "windowsHello">;
    rememberDeviceDays?: number;
    requireMFAForAdmins?: boolean;
}
/**
 * 1. Azure AD SSH Login Extension
 * Enable SSH login using Azure AD credentials
 *
 * @param config - AAD SSH login configuration
 * @returns AAD SSH login extension configuration
 */
export declare function aadSSHLoginExtension(config?: AADSSHLoginConfig): {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    properties: {
        publisher: string;
        type: string;
        typeHandlerVersion: string;
        autoUpgradeMinorVersion: boolean;
        settings: {
            enabled: boolean;
            allowedPrincipals: string[];
            enablePasswordlessAuth: boolean;
        };
    };
    features: {
        sshWithAAD: string;
        passwordless: string;
        centralizedManagement: string;
        conditionalAccess: string;
        mfaSupport: string;
    };
    requirements: string[];
    supportedDistros: string[];
};
/**
 * 2. Azure AD SSH Login for Windows
 * Enable SSH/RDP login using Azure AD credentials (Windows)
 *
 * @param config - AAD SSH/RDP login configuration
 * @returns AAD login extension for Windows
 */
export declare function aadLoginForWindows(config?: AADSSHLoginConfig): {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    properties: {
        publisher: string;
        type: string;
        typeHandlerVersion: string;
        autoUpgradeMinorVersion: boolean;
        settings: {
            enabled: boolean;
            allowedPrincipals: string[];
            enablePasswordlessAuth: boolean;
        };
    };
    features: {
        rdpWithAAD: string;
        passwordless: string;
        centralizedManagement: string;
        conditionalAccess: string;
        mfaSupport: string;
    };
    requirements: string[];
};
/**
 * 3. Conditional Access Policy
 * Define Conditional Access policy for VM access
 *
 * @param policy - Conditional Access policy configuration
 * @returns Conditional Access policy template
 */
export declare function conditionalAccessPolicy(policy: ConditionalAccessPolicy): {
    name: string;
    enabled: boolean;
    conditions: {
        locations: string[];
        platforms: string[];
        clientApps: string[];
        riskLevel: "medium" | "low" | "high";
    };
    controls: {
        requireMFA: boolean;
        requireCompliantDevice: boolean;
        requireDomainJoinedDevice: boolean;
        blockAccess: boolean;
    };
    useCases: string[];
    implementation: string[];
};
/**
 * 4. MFA Configuration
 * Multi-factor authentication setup for VM access
 *
 * @param config - MFA configuration
 * @returns MFA configuration template
 */
export declare function mfaConfiguration(config: MFAConfig): {
    enabled: boolean;
    methods: ("phone" | "email" | "authenticator" | "fido2" | "windowsHello")[];
    rememberDeviceDays: number;
    requireMFAForAdmins: boolean;
    features: {
        phoneAuth: string | null;
        emailAuth: string | null;
        authenticatorApp: string | null;
        fido2: string | null;
        windowsHello: string | null;
    };
    recommendations: string[];
    implementation: string[];
};
/**
 * 5. Passwordless Authentication
 * Enable passwordless authentication for VMs
 *
 * @param methods - Passwordless authentication methods
 * @returns Passwordless authentication configuration
 */
export declare function passwordlessAuthentication(methods?: Array<"fido2" | "windowsHello" | "authenticator">): {
    enabled: boolean;
    methods: ("authenticator" | "fido2" | "windowsHello")[];
    features: {
        fido2: {
            description: string;
            supported: string[];
            requirements: string[];
        } | null;
        windowsHello: {
            description: string;
            supported: string[];
            requirements: string[];
        } | null;
        authenticator: {
            description: string;
            supported: string[];
            requirements: string[];
        } | null;
    };
    benefits: string[];
    implementation: string[];
};
/**
 * 6. Azure AD Role-Based Access for VMs
 * Configure Azure AD roles for VM access
 *
 * @param roleType - VM access role type
 * @returns Role configuration
 */
export declare function vmAccessRole(roleType: "Administrator" | "User"): {
    roleId: string;
    name: string;
    permissions: string[];
    linuxSudoAccess: boolean;
    windowsAdminAccess: boolean;
} | {
    roleId: string;
    name: string;
    permissions: string[];
    linuxSudoAccess: boolean;
    windowsAdminAccess: boolean;
};
/**
 * 7. Create complete Azure AD integration
 *
 * @param platform - VM platform (Windows or Linux)
 * @param features - Enabled features
 * @returns Complete Azure AD integration configuration
 */
export interface AADIntegrationFeatures {
    enableSSHLogin?: boolean;
    enableConditionalAccess?: boolean;
    enableMFA?: boolean;
    enablePasswordless?: boolean;
    administratorPrincipals?: string[];
    userPrincipals?: string[];
}
export declare function createAADIntegration(platform: "Windows" | "Linux", features?: AADIntegrationFeatures): any;
/**
 * Validate Azure AD configuration
 *
 * @param config - Azure AD configuration
 * @returns Validation result
 */
export declare function validateAADConfig(config: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Export all Azure AD functions
 */
export declare const azuread: {
    aadSSHLoginExtension: typeof aadSSHLoginExtension;
    aadLoginForWindows: typeof aadLoginForWindows;
    conditionalAccessPolicy: typeof conditionalAccessPolicy;
    mfaConfiguration: typeof mfaConfiguration;
    passwordlessAuthentication: typeof passwordlessAuthentication;
    vmAccessRole: typeof vmAccessRole;
    createAADIntegration: typeof createAADIntegration;
    validateAADConfig: typeof validateAADConfig;
};
