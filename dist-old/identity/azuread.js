"use strict";
/**
 * Identity Azure AD Module
 *
 * Provides helpers for Azure Active Directory integration
 * Supports AAD SSH Login, Conditional Access, and MFA
 *
 * @module identity/azuread
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.azuread = void 0;
exports.aadSSHLoginExtension = aadSSHLoginExtension;
exports.aadLoginForWindows = aadLoginForWindows;
exports.conditionalAccessPolicy = conditionalAccessPolicy;
exports.mfaConfiguration = mfaConfiguration;
exports.passwordlessAuthentication = passwordlessAuthentication;
exports.vmAccessRole = vmAccessRole;
exports.createAADIntegration = createAADIntegration;
exports.validateAADConfig = validateAADConfig;
/**
 * 1. Azure AD SSH Login Extension
 * Enable SSH login using Azure AD credentials
 *
 * @param config - AAD SSH login configuration
 * @returns AAD SSH login extension configuration
 */
function aadSSHLoginExtension(config = { enabled: true }) {
    return {
        type: "Microsoft.Compute/virtualMachines/extensions",
        apiVersion: "2023-03-01",
        name: "AADSSHLoginForLinux",
        location: "[resourceGroup().location]",
        properties: {
            publisher: "Microsoft.Azure.ActiveDirectory",
            type: "AADSSHLoginForLinux",
            typeHandlerVersion: "1.0",
            autoUpgradeMinorVersion: true,
            settings: {
                enabled: config.enabled,
                allowedPrincipals: config.allowedPrincipals || [],
                enablePasswordlessAuth: config.enablePasswordlessAuth !== false,
            },
        },
        features: {
            sshWithAAD: "SSH using Azure AD credentials instead of SSH keys",
            passwordless: "Optional passwordless authentication",
            centralizedManagement: "Manage SSH access through Azure AD",
            conditionalAccess: "Apply Conditional Access policies to SSH sessions",
            mfaSupport: "Enforce MFA for SSH access",
        },
        requirements: [
            "Linux VM with OpenSSH server",
            "VM must have system-assigned or user-assigned managed identity",
            "VM must be able to reach Azure AD endpoints",
            "User must have Virtual Machine Administrator Login or User Login role",
        ],
        supportedDistros: [
            "Ubuntu 18.04 LTS and later",
            "Debian 9 and later",
            "CentOS 7 and later",
            "RHEL 7 and later",
            "SLES 12 SP2 and later",
            "OpenSUSE Leap 15.1 and later",
        ],
    };
}
/**
 * 2. Azure AD SSH Login for Windows
 * Enable SSH/RDP login using Azure AD credentials (Windows)
 *
 * @param config - AAD SSH/RDP login configuration
 * @returns AAD login extension for Windows
 */
function aadLoginForWindows(config = { enabled: true }) {
    return {
        type: "Microsoft.Compute/virtualMachines/extensions",
        apiVersion: "2023-03-01",
        name: "AADLoginForWindows",
        location: "[resourceGroup().location]",
        properties: {
            publisher: "Microsoft.Azure.ActiveDirectory",
            type: "AADLoginForWindows",
            typeHandlerVersion: "1.0",
            autoUpgradeMinorVersion: true,
            settings: {
                enabled: config.enabled,
                allowedPrincipals: config.allowedPrincipals || [],
                enablePasswordlessAuth: config.enablePasswordlessAuth !== false,
            },
        },
        features: {
            rdpWithAAD: "RDP using Azure AD credentials",
            passwordless: "Optional passwordless authentication (Windows Hello)",
            centralizedManagement: "Manage RDP access through Azure AD",
            conditionalAccess: "Apply Conditional Access policies to RDP sessions",
            mfaSupport: "Enforce MFA for RDP access",
        },
        requirements: [
            "Windows Server 2019 or later",
            "VM must have system-assigned or user-assigned managed identity",
            "VM must be able to reach Azure AD endpoints",
            "User must have Virtual Machine Administrator Login or User Login role",
        ],
    };
}
/**
 * 3. Conditional Access Policy
 * Define Conditional Access policy for VM access
 *
 * @param policy - Conditional Access policy configuration
 * @returns Conditional Access policy template
 */
function conditionalAccessPolicy(policy) {
    return {
        name: policy.name,
        enabled: policy.enabled,
        conditions: {
            locations: policy.conditions.locations || ["Any"],
            platforms: policy.conditions.platforms || ["Windows", "Linux", "macOS"],
            clientApps: policy.conditions.clientApps || ["SSH", "RDP"],
            riskLevel: policy.conditions.riskLevel || "low",
        },
        controls: {
            requireMFA: policy.controls.requireMFA !== false,
            requireCompliantDevice: policy.controls.requireCompliantDevice === true,
            requireDomainJoinedDevice: policy.controls.requireDomainJoinedDevice === true,
            blockAccess: policy.controls.blockAccess === true,
        },
        useCases: [
            "Block access from untrusted locations",
            "Require MFA for admin access",
            "Require compliant device for production VM access",
            "Block access during high-risk conditions",
        ],
        implementation: [
            "Create Conditional Access policy in Azure AD portal",
            "Target Azure Virtual Machines cloud app",
            "Define users/groups subject to policy",
            "Configure conditions and access controls",
            "Enable policy in report-only mode first",
            "Monitor impact and enable policy",
        ],
    };
}
/**
 * 4. MFA Configuration
 * Multi-factor authentication setup for VM access
 *
 * @param config - MFA configuration
 * @returns MFA configuration template
 */
function mfaConfiguration(config) {
    return {
        enabled: config.enabled,
        methods: config.methods || ["authenticator", "phone"],
        rememberDeviceDays: config.rememberDeviceDays || 14,
        requireMFAForAdmins: config.requireMFAForAdmins !== false,
        features: {
            phoneAuth: config.methods.includes("phone")
                ? "SMS or phone call authentication"
                : null,
            emailAuth: config.methods.includes("email")
                ? "Email verification code"
                : null,
            authenticatorApp: config.methods.includes("authenticator")
                ? "Microsoft Authenticator or other TOTP apps"
                : null,
            fido2: config.methods.includes("fido2")
                ? "Hardware security keys (FIDO2)"
                : null,
            windowsHello: config.methods.includes("windowsHello")
                ? "Windows Hello biometric authentication"
                : null,
        },
        recommendations: [
            "Use Microsoft Authenticator for push notifications",
            "Enable FIDO2 for passwordless authentication",
            "Set device remember period based on security requirements",
            "Require MFA for all administrator accounts",
            "Consider risk-based MFA with Conditional Access",
        ],
        implementation: [
            "Enable MFA in Azure AD Security settings",
            "Configure authentication methods",
            "Create Conditional Access policy requiring MFA",
            "Test MFA with pilot users first",
            "Provide user training and support",
            "Monitor MFA usage and compliance",
        ],
    };
}
/**
 * 5. Passwordless Authentication
 * Enable passwordless authentication for VMs
 *
 * @param methods - Passwordless authentication methods
 * @returns Passwordless authentication configuration
 */
function passwordlessAuthentication(methods = [
    "fido2",
    "authenticator",
]) {
    return {
        enabled: true,
        methods,
        features: {
            fido2: methods.includes("fido2")
                ? {
                    description: "FIDO2 security keys for SSH/RDP",
                    supported: ["YubiKey", "Feitian", "Google Titan", "Windows Hello"],
                    requirements: ["FIDO2-compatible security key", "WebAuthn support"],
                }
                : null,
            windowsHello: methods.includes("windowsHello")
                ? {
                    description: "Windows Hello biometric authentication",
                    supported: ["Fingerprint", "Facial recognition", "PIN"],
                    requirements: ["Windows 10/11", "Biometric hardware or camera"],
                }
                : null,
            authenticator: methods.includes("authenticator")
                ? {
                    description: "Microsoft Authenticator passwordless sign-in",
                    supported: ["iOS", "Android"],
                    requirements: [
                        "Microsoft Authenticator app",
                        "Phone sign-in enabled",
                    ],
                }
                : null,
        },
        benefits: [
            "Eliminate password-based attacks",
            "Improved user experience",
            "Reduced help desk password reset calls",
            "Phishing-resistant authentication",
            "Better security posture",
        ],
        implementation: [
            "Enable passwordless authentication methods in Azure AD",
            "Register security keys or biometric devices",
            "Configure AAD SSH/RDP Login extensions",
            "Create Conditional Access policies",
            "Test with pilot users",
            "Roll out to production users",
        ],
    };
}
/**
 * 6. Azure AD Role-Based Access for VMs
 * Configure Azure AD roles for VM access
 *
 * @param roleType - VM access role type
 * @returns Role configuration
 */
function vmAccessRole(roleType) {
    const roles = {
        Administrator: {
            roleId: "1c0163c0-47e6-4577-8991-ea5c82e286e4",
            name: "Virtual Machine Administrator Login",
            permissions: [
                "Full administrative access via SSH/RDP",
                "Can elevate to root/administrator",
                "Can install software and configure system",
                "Can manage all VM settings",
            ],
            linuxSudoAccess: true,
            windowsAdminAccess: true,
        },
        User: {
            roleId: "fb879df8-f326-4884-b1cf-06f3ad86be52",
            name: "Virtual Machine User Login",
            permissions: [
                "Standard user access via SSH/RDP",
                "Cannot elevate to root/administrator",
                "Limited system configuration access",
                "Can run user-level applications",
            ],
            linuxSudoAccess: false,
            windowsAdminAccess: false,
        },
    };
    return roles[roleType];
}
function createAADIntegration(platform, features = {}) {
    const config = {
        platform,
        features: {},
    };
    // AAD SSH/RDP Login
    if (features.enableSSHLogin !== false) {
        config.features.aadLogin =
            platform === "Linux"
                ? aadSSHLoginExtension({
                    enabled: true,
                    allowedPrincipals: [
                        ...(features.administratorPrincipals || []),
                        ...(features.userPrincipals || []),
                    ],
                    enablePasswordlessAuth: features.enablePasswordless !== false,
                })
                : aadLoginForWindows({
                    enabled: true,
                    allowedPrincipals: [
                        ...(features.administratorPrincipals || []),
                        ...(features.userPrincipals || []),
                    ],
                    enablePasswordlessAuth: features.enablePasswordless !== false,
                });
    }
    // Conditional Access
    if (features.enableConditionalAccess) {
        config.features.conditionalAccess = conditionalAccessPolicy({
            name: "VM Access Policy",
            enabled: true,
            conditions: {
                locations: ["Trusted"],
                platforms: [platform],
                clientApps: platform === "Linux" ? ["SSH"] : ["RDP"],
            },
            controls: {
                requireMFA: features.enableMFA !== false,
                requireCompliantDevice: true,
            },
        });
    }
    // MFA
    if (features.enableMFA !== false) {
        config.features.mfa = mfaConfiguration({
            enabled: true,
            methods: features.enablePasswordless
                ? ["authenticator", "fido2", "windowsHello"]
                : ["authenticator", "phone"],
            requireMFAForAdmins: true,
        });
    }
    // Passwordless
    if (features.enablePasswordless) {
        config.features.passwordless = passwordlessAuthentication(platform === "Windows"
            ? ["fido2", "windowsHello", "authenticator"]
            : ["fido2", "authenticator"]);
    }
    // Role assignments
    config.roleAssignments = {
        administrators: features.administratorPrincipals?.map((principal) => ({
            principalId: principal,
            role: vmAccessRole("Administrator"),
        })) || [],
        users: features.userPrincipals?.map((principal) => ({
            principalId: principal,
            role: vmAccessRole("User"),
        })) || [],
    };
    return config;
}
/**
 * Validate Azure AD configuration
 *
 * @param config - Azure AD configuration
 * @returns Validation result
 */
function validateAADConfig(config) {
    const errors = [];
    const warnings = [];
    // Platform validation
    if (!config.platform || !["Windows", "Linux"].includes(config.platform)) {
        errors.push("Platform must be either Windows or Linux");
    }
    // AAD Login validation
    if (config.features?.aadLogin) {
        if (config.platform === "Linux" &&
            !config.features.aadLogin.properties?.type?.includes("Linux")) {
            errors.push("Linux platform requires AADSSHLoginForLinux extension");
        }
        if (config.platform === "Windows" &&
            !config.features.aadLogin.properties?.type?.includes("Windows")) {
            errors.push("Windows platform requires AADLoginForWindows extension");
        }
    }
    // Managed identity warning
    if (config.features?.aadLogin && !config.managedIdentity) {
        warnings.push("AAD Login requires managed identity - ensure VM has system or user-assigned identity");
    }
    // Conditional Access validation
    if (config.features?.conditionalAccess &&
        !config.features?.conditionalAccess.enabled) {
        warnings.push("Conditional Access policy is defined but not enabled");
    }
    // MFA recommendations
    if (config.features?.mfa && config.features.mfa.methods.length < 2) {
        warnings.push("Consider enabling multiple MFA methods for redundancy");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Export all Azure AD functions
 */
exports.azuread = {
    aadSSHLoginExtension,
    aadLoginForWindows,
    conditionalAccessPolicy,
    mfaConfiguration,
    passwordlessAuthentication,
    vmAccessRole,
    createAADIntegration,
    validateAADConfig,
};
