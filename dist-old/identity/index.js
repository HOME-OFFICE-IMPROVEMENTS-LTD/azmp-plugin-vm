"use strict";
/**
 * Identity Module
 *
 * Main entry point for identity and access management features
 * Integrates Managed Identity, Azure AD, and RBAC modules
 *
 * @module identity
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityCLICommands = exports.identityTemplates = exports.rbac = exports.azuread = exports.managedidentity = void 0;
exports.createIdentityHelpers = createIdentityHelpers;
exports.registerIdentityHelpers = registerIdentityHelpers;
exports.getIdentityStats = getIdentityStats;
const handlebars_1 = __importDefault(require("handlebars"));
const managedidentity = __importStar(require("./managedidentity"));
exports.managedidentity = managedidentity;
const azuread = __importStar(require("./azuread"));
exports.azuread = azuread;
const rbac = __importStar(require("./rbac"));
exports.rbac = rbac;
/**
 * Identity templates metadata
 */
exports.identityTemplates = [
    {
        name: "system-assigned-identity",
        description: "VM with system-assigned managed identity",
        features: [
            "Automatic identity management",
            "Key Vault access",
            "Azure service authentication",
        ],
    },
    {
        name: "user-assigned-identity",
        description: "VM with user-assigned managed identity",
        features: [
            "Shared identity across resources",
            "Independent lifecycle",
            "Centralized management",
        ],
    },
    {
        name: "aad-ssh-login",
        description: "Linux VM with Azure AD SSH login",
        features: [
            "Passwordless SSH",
            "Conditional Access",
            "MFA support",
            "Centralized user management",
        ],
    },
    {
        name: "aad-rdp-login",
        description: "Windows VM with Azure AD RDP login",
        features: [
            "Passwordless RDP",
            "Conditional Access",
            "MFA support",
            "Windows Hello",
        ],
    },
    {
        name: "key-vault-access",
        description: "VM with Key Vault access via managed identity",
        features: [
            "Secure secret retrieval",
            "Certificate management",
            "No credential storage",
        ],
    },
    {
        name: "rbac-least-privilege",
        description: "VM with least privilege RBAC configuration",
        features: ["Minimal permissions", "Custom role", "Resource-level scope"],
    },
    {
        name: "passwordless-authentication",
        description: "VM with passwordless authentication",
        features: [
            "FIDO2 security keys",
            "Windows Hello",
            "Microsoft Authenticator",
            "Phishing-resistant",
        ],
    },
    {
        name: "conditional-access-policy",
        description: "VM with Conditional Access policies",
        features: [
            "Location-based access",
            "Device compliance",
            "Risk-based authentication",
            "MFA enforcement",
        ],
    },
    {
        name: "identity-compliance-soc2",
        description: "Identity configuration for SOC2 compliance",
        features: [
            "MFA required",
            "Audit logging",
            "Least privilege",
            "Access reviews",
        ],
    },
    {
        name: "identity-compliance-hipaa",
        description: "Identity configuration for HIPAA compliance",
        features: [
            "MFA enforcement",
            "Encryption",
            "Access controls",
            "Audit trails",
        ],
    },
    {
        name: "multi-identity-hybrid",
        description: "VM with both system and user-assigned identities",
        features: [
            "Maximum flexibility",
            "Multiple service access",
            "Hybrid scenarios",
        ],
    },
    {
        name: "cross-resource-identity",
        description: "User-assigned identity shared across VM scale set",
        features: [
            "Shared identity",
            "Consistent permissions",
            "Scale set support",
        ],
    },
];
/**
 * Create Handlebars helpers for identity features
 */
function createIdentityHelpers() {
    const helpers = {};
    // ===========================
    // Managed Identity Helpers
    // ===========================
    /**
     * System-assigned managed identity
     */
    helpers["identity:managedidentity.systemAssigned"] = function () {
        return JSON.stringify(managedidentity.systemAssignedIdentity(), null, 2);
    };
    /**
     * User-assigned managed identity
     */
    helpers["identity:managedidentity.userAssigned"] = function (identityId) {
        return JSON.stringify(managedidentity.userAssignedIdentity(identityId), null, 2);
    };
    /**
     * Multiple identities (hybrid)
     */
    helpers["identity:managedidentity.multiple"] = function (userIdentityIds) {
        return JSON.stringify(managedidentity.multipleIdentities(userIdentityIds), null, 2);
    };
    /**
     * Create managed identity from requirements
     */
    helpers["identity:managedidentity.create"] = function (requirements) {
        return JSON.stringify(managedidentity.createManagedIdentity(requirements), null, 2);
    };
    /**
     * Get identity recommendations
     */
    helpers["identity:managedidentity.recommendations"] = function (useCase) {
        return JSON.stringify(managedidentity.getIdentityRecommendations(useCase), null, 2);
    };
    /**
     * Validate managed identity configuration
     */
    helpers["identity:managedidentity.validate"] = function (config) {
        return JSON.stringify(managedidentity.validateManagedIdentityConfig(config), null, 2);
    };
    /**
     * Create role assignment for managed identity
     */
    helpers["identity:managedidentity.roleAssignment"] = function (principalId, roleDefinitionId, scope) {
        return JSON.stringify(managedidentity.createRoleAssignment(principalId, roleDefinitionId, scope), null, 2);
    };
    // ===========================
    // Azure AD Helpers
    // ===========================
    /**
     * AAD SSH Login extension (Linux)
     */
    helpers["identity:azuread.sshLogin"] = function (config) {
        return JSON.stringify(azuread.aadSSHLoginExtension(config), null, 2);
    };
    /**
     * AAD Login extension (Windows)
     */
    helpers["identity:azuread.windowsLogin"] = function (config) {
        return JSON.stringify(azuread.aadLoginForWindows(config), null, 2);
    };
    /**
     * Conditional Access policy
     */
    helpers["identity:azuread.conditionalAccess"] = function (policy) {
        return JSON.stringify(azuread.conditionalAccessPolicy(policy), null, 2);
    };
    /**
     * MFA configuration
     */
    helpers["identity:azuread.mfa"] = function (config) {
        return JSON.stringify(azuread.mfaConfiguration(config), null, 2);
    };
    /**
     * Passwordless authentication
     */
    helpers["identity:azuread.passwordless"] = function (methods) {
        return JSON.stringify(azuread.passwordlessAuthentication(methods), null, 2);
    };
    /**
     * VM access role
     */
    helpers["identity:azuread.vmAccessRole"] = function (roleType) {
        return JSON.stringify(azuread.vmAccessRole(roleType), null, 2);
    };
    /**
     * Create complete AAD integration
     */
    helpers["identity:azuread.create"] = function (platform, features) {
        return JSON.stringify(azuread.createAADIntegration(platform, features), null, 2);
    };
    /**
     * Validate AAD configuration
     */
    helpers["identity:azuread.validate"] = function (config) {
        return JSON.stringify(azuread.validateAADConfig(config), null, 2);
    };
    // ===========================
    // RBAC Helpers
    // ===========================
    /**
     * Assign built-in role
     */
    helpers["identity:rbac.assignBuiltInRole"] = function (principalId, roleName, scopeType, scopeId) {
        return JSON.stringify(rbac.assignBuiltInRole(principalId, roleName, scopeType, scopeId), null, 2);
    };
    /**
     * Create custom role
     */
    helpers["identity:rbac.createCustomRole"] = function (roleDefinition) {
        return JSON.stringify(rbac.createCustomRole(roleDefinition), null, 2);
    };
    /**
     * Create RBAC scope
     */
    helpers["identity:rbac.scope"] = function (scopeType, resourceName) {
        return rbac.createScope(scopeType, resourceName);
    };
    /**
     * Role assignment template
     */
    helpers["identity:rbac.template"] = function (assignment) {
        return JSON.stringify(rbac.roleAssignmentTemplate(assignment), null, 2);
    };
    /**
     * Recommend role based on required actions
     */
    helpers["identity:rbac.recommend"] = function (requiredActions) {
        return JSON.stringify(rbac.recommendRole(requiredActions), null, 2);
    };
    /**
     * Custom role template: VM Start/Stop
     */
    helpers["identity:rbac.customRole.vmStartStop"] = function () {
        return JSON.stringify(rbac.customRoleTemplates.vmStartStop(), null, 2);
    };
    /**
     * Custom role template: VM Backup Operator
     */
    helpers["identity:rbac.customRole.vmBackup"] = function () {
        return JSON.stringify(rbac.customRoleTemplates.vmBackupOperator(), null, 2);
    };
    /**
     * Custom role template: VM Network Config
     */
    helpers["identity:rbac.customRole.vmNetwork"] = function () {
        return JSON.stringify(rbac.customRoleTemplates.vmNetworkConfig(), null, 2);
    };
    /**
     * Custom role template: VM Monitor
     */
    helpers["identity:rbac.customRole.vmMonitor"] = function () {
        return JSON.stringify(rbac.customRoleTemplates.vmMonitor(), null, 2);
    };
    /**
     * Custom role template: VM Extension Manager
     */
    helpers["identity:rbac.customRole.vmExtension"] = function () {
        return JSON.stringify(rbac.customRoleTemplates.vmExtensionManager(), null, 2);
    };
    /**
     * Validate RBAC configuration
     */
    helpers["identity:rbac.validate"] = function (assignment) {
        return JSON.stringify(rbac.validateRBACConfig(assignment), null, 2);
    };
    /**
     * Get RBAC best practices
     */
    helpers["identity:rbac.bestPractices"] = function () {
        return JSON.stringify(rbac.getRBACBestPractices(), null, 2);
    };
    // ===========================
    // Utility Helpers
    // ===========================
    /**
     * List all identity templates
     */
    helpers["identity:list"] = function () {
        return JSON.stringify(exports.identityTemplates, null, 2);
    };
    /**
     * Get specific identity template
     */
    helpers["identity:template"] = function (name) {
        const template = exports.identityTemplates.find((t) => t.name === name);
        return template ? JSON.stringify(template, null, 2) : null;
    };
    /**
     * Count identity templates
     */
    helpers["identity:count"] = function () {
        return exports.identityTemplates.length;
    };
    /**
     * Filter templates by feature
     */
    helpers["identity:filterByFeature"] = function (feature) {
        const filtered = exports.identityTemplates.filter((t) => t.features.some((f) => f.toLowerCase().includes(feature.toLowerCase())));
        return JSON.stringify(filtered, null, 2);
    };
    /**
     * Get compliance template
     */
    helpers["identity:compliance"] = function (framework) {
        const template = exports.identityTemplates.find((t) => t.name === `identity-compliance-${framework}`);
        return template ? JSON.stringify(template, null, 2) : null;
    };
    /**
     * Get built-in role ID
     */
    helpers["identity:builtInRole"] = function (roleName) {
        return (managedidentity.builtInRoles[roleName] || null);
    };
    return helpers;
}
/**
 * Register all identity helpers with Handlebars
 */
function registerIdentityHelpers() {
    const helpers = createIdentityHelpers();
    Object.keys(helpers).forEach((name) => {
        handlebars_1.default.registerHelper(name, helpers[name]);
    });
    return helpers;
}
/**
 * CLI Commands for Identity Module
 */
exports.identityCLICommands = [
    {
        command: "identity",
        description: "Manage identity and access features",
        subcommands: [
            {
                command: "list",
                description: "List all available identity templates",
                action: () => {
                    console.log("Available Identity Templates:");
                    exports.identityTemplates.forEach((template, index) => {
                        console.log(`\n${index + 1}. ${template.name}`);
                        console.log(`   Description: ${template.description}`);
                        console.log(`   Features: ${template.features.join(", ")}`);
                    });
                },
            },
            {
                command: "list-managed-identity",
                description: "List managed identity options",
                action: () => {
                    console.log("Managed Identity Options:");
                    console.log("\n1. System-Assigned Identity");
                    console.log("   - Automatic lifecycle management");
                    console.log("   - Tied to VM lifecycle");
                    console.log("\n2. User-Assigned Identity");
                    console.log("   - Independent lifecycle");
                    console.log("   - Shared across resources");
                    console.log("\n3. Multiple Identities (Hybrid)");
                    console.log("   - Both system and user-assigned");
                    console.log("   - Maximum flexibility");
                },
            },
            {
                command: "list-aad-features",
                description: "List Azure AD integration features",
                action: () => {
                    console.log("Azure AD Integration Features:");
                    console.log("\n1. AAD SSH Login (Linux)");
                    console.log("   - SSH with Azure AD credentials");
                    console.log("   - Passwordless authentication");
                    console.log("\n2. AAD RDP Login (Windows)");
                    console.log("   - RDP with Azure AD credentials");
                    console.log("   - Windows Hello support");
                    console.log("\n3. Conditional Access");
                    console.log("   - Location-based policies");
                    console.log("   - Device compliance checks");
                    console.log("\n4. Multi-Factor Authentication");
                    console.log("   - Phone, email, authenticator app");
                    console.log("   - FIDO2 security keys");
                },
            },
            {
                command: "list-rbac-roles",
                description: "List built-in RBAC roles for VMs",
                action: () => {
                    console.log("Built-in RBAC Roles for Virtual Machines:");
                    console.log("\n1. Virtual Machine Contributor");
                    console.log("   - Full VM management");
                    console.log("\n2. Virtual Machine Administrator Login");
                    console.log("   - Admin SSH/RDP access");
                    console.log("\n3. Virtual Machine User Login");
                    console.log("   - Standard user SSH/RDP access");
                    console.log("\n4. Reader");
                    console.log("   - Read-only access");
                    console.log("\n5. Contributor");
                    console.log("   - Full management (all resources)");
                },
            },
        ],
    },
];
/**
 * Identity module statistics
 */
function getIdentityStats() {
    return {
        templates: exports.identityTemplates.length,
        helpers: Object.keys(createIdentityHelpers()).length,
        modules: 3, // managedidentity, azuread, rbac
        features: {
            managedIdentity: 8, // system, user, multiple, create, recommendations, validate, roleAssignment, builtInRoles
            azureAD: 8, // sshLogin, windowsLogin, conditionalAccess, mfa, passwordless, vmAccessRole, create, validate
            rbac: 13, // assignBuiltInRole, createCustomRole, scope, template, recommend, 5 custom role templates, validate, bestPractices
        },
    };
}
/**
 * Export identity module
 */
exports.default = {
    managedidentity,
    azuread,
    rbac,
    identityTemplates: exports.identityTemplates,
    createIdentityHelpers,
    registerIdentityHelpers,
    identityCLICommands: exports.identityCLICommands,
    getIdentityStats,
};
