"use strict";
/**
 * Identity RBAC Module
 *
 * Provides helpers for Role-Based Access Control (RBAC)
 * Supports built-in roles, custom roles, and scope management
 *
 * @module identity/rbac
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = exports.customRoleTemplates = void 0;
exports.assignBuiltInRole = assignBuiltInRole;
exports.createCustomRole = createCustomRole;
exports.createScope = createScope;
exports.roleAssignmentTemplate = roleAssignmentTemplate;
exports.recommendRole = recommendRole;
exports.validateRBACConfig = validateRBACConfig;
exports.getRBACBestPractices = getRBACBestPractices;
/**
 * 1. Built-in Role Assignment
 * Assign Azure built-in role to a principal
 *
 * @param principalId - Principal ID (user, group, or service principal)
 * @param roleName - Built-in role name
 * @param scopeType - Scope type
 * @param scopeId - Scope identifier
 * @returns Role assignment template
 */
function assignBuiltInRole(principalId, roleName, scopeType = "resource", scopeId) {
    // Get role definition ID from built-in roles
    const roleMap = {
        // General roles
        Owner: "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
        Contributor: "b24988ac-6180-42a0-ab88-20f7382dd24c",
        Reader: "acdd72a7-3385-48ef-bd42-f606fba81ae7",
        // VM-specific roles
        "Virtual Machine Contributor": "9980e02c-c2be-4d73-94e8-173b1dc7cf3c",
        "Virtual Machine Administrator Login": "1c0163c0-47e6-4577-8991-ea5c82e286e4",
        "Virtual Machine User Login": "fb879df8-f326-4884-b1cf-06f3ad86be52",
        "Virtual Machine Data Access Administrator": "66f75aeb-eabe-4b70-9f1e-c350c4c9ad04",
        // Key Vault roles
        "Key Vault Administrator": "00482a5a-887f-4fb3-b355-3b78b0e5c5b8",
        "Key Vault Secrets User": "4633458b-17de-408a-b874-0445c86b69e6",
        "Key Vault Secrets Officer": "b86a8fe4-44ce-4948-aee5-eccb2c155cd7",
        "Key Vault Certificates User": "db79e9a7-68ee-4b58-9aeb-b90e7c24fcba",
        "Key Vault Crypto User": "12338af0-0e69-4776-bea7-57ae8d297424",
        // Storage roles
        "Storage Blob Data Owner": "b7e6dc6d-f1e8-4753-8033-0f276bb0955b",
        "Storage Blob Data Contributor": "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
        "Storage Blob Data Reader": "2a2b9908-6ea1-4ae2-8e65-a410df84e7d1",
        "Storage Queue Data Contributor": "974c5e8b-45b9-4653-ba55-5f855dd0fb88",
        // Network roles
        "Network Contributor": "4d97b98b-1d4f-4787-a291-c67834d212e7",
        // Monitoring roles
        "Monitoring Contributor": "749f88d5-cbae-40b8-bcfc-e573ddc772fa",
        "Monitoring Reader": "43d0d8ad-25c7-4714-9337-8ba259a9fe05",
        "Log Analytics Contributor": "92aaf0da-9dab-42b6-94a3-d43ce8d16293",
        "Log Analytics Reader": "73c42c96-874c-492b-b04d-ab87d138a893",
        // Security roles
        "Security Admin": "fb1c8493-542b-48eb-b624-b4c8fea62acd",
        "Security Reader": "39bc4728-0917-49c7-9d2c-d95423bc2eb4",
    };
    const roleDefinitionId = roleMap[roleName];
    if (!roleDefinitionId) {
        throw new Error(`Unknown built-in role: ${roleName}`);
    }
    // Construct scope
    let scope;
    switch (scopeType) {
        case "resource":
            scope =
                scopeId ||
                    "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]";
            break;
        case "resourceGroup":
            scope = "[resourceGroup().id]";
            break;
        case "subscription":
            scope = "[subscription().id]";
            break;
        case "managementGroup":
            scope = scopeId || "[managementGroup().id]";
            break;
    }
    return {
        principalId,
        roleDefinitionId,
        scope,
        principalType: "ServicePrincipal",
    };
}
/**
 * 2. Custom Role Definition
 * Create custom RBAC role with specific permissions
 *
 * @param roleDefinition - Custom role definition
 * @returns Custom role template
 */
function createCustomRole(roleDefinition) {
    return {
        type: "Microsoft.Authorization/roleDefinitions",
        apiVersion: "2022-04-01",
        name: "[guid(resourceGroup().id, '" + roleDefinition.name + "')]",
        properties: {
            roleName: roleDefinition.name,
            description: roleDefinition.description,
            type: "CustomRole",
            permissions: [
                {
                    actions: roleDefinition.actions,
                    notActions: roleDefinition.notActions || [],
                    dataActions: roleDefinition.dataActions || [],
                    notDataActions: roleDefinition.notDataActions || [],
                },
            ],
            assignableScopes: roleDefinition.assignableScopes,
        },
        useCases: [
            "Fine-grained access control",
            "Compliance requirements",
            "Least privilege principle",
            "Separation of duties",
        ],
        examples: [
            "VM Start/Stop Only role",
            "Read-only VM configuration",
            "VM backup operator",
            "VM network configuration only",
        ],
    };
}
/**
 * 3. Scope Management
 * Generate RBAC scopes for different levels
 *
 * @param scopeType - Type of scope
 * @param resourceName - Resource name (for resource scope)
 * @returns Scope template
 */
function createScope(scopeType, resourceName) {
    switch (scopeType) {
        case "resource":
            if (!resourceName) {
                throw new Error("Resource name is required for resource scope");
            }
            return `[resourceId('Microsoft.Compute/virtualMachines', '${resourceName}')]`;
        case "resourceGroup":
            return "[resourceGroup().id]";
        case "subscription":
            return "[subscription().id]";
        case "managementGroup":
            return "[managementGroup().id]";
        default:
            throw new Error(`Invalid scope type: ${scopeType}`);
    }
}
/**
 * 4. Role Assignment Template
 * Generate complete role assignment ARM template
 *
 * @param assignment - Role assignment configuration
 * @returns ARM template for role assignment
 */
function roleAssignmentTemplate(assignment) {
    const template = {
        type: "Microsoft.Authorization/roleAssignments",
        apiVersion: "2022-04-01",
        name: `[guid('${assignment.principalId}', '${assignment.roleDefinitionId}', '${assignment.scope}')]`,
        properties: {
            roleDefinitionId: `[subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '${assignment.roleDefinitionId}')]`,
            principalId: assignment.principalId,
            principalType: assignment.principalType || "ServicePrincipal",
        },
    };
    // Add conditional access if specified
    if (assignment.condition) {
        template.properties.condition = assignment.condition;
        template.properties.conditionVersion = assignment.conditionVersion || "2.0";
    }
    return template;
}
/**
 * 5. Least Privilege Role Recommendation
 * Recommend appropriate role based on required actions
 *
 * @param requiredActions - Required actions
 * @returns Recommended role
 */
function recommendRole(requiredActions) {
    // VM read-only
    if (requiredActions.every((action) => action.startsWith("Microsoft.Compute/*/read"))) {
        return {
            roleName: "Reader",
            roleId: "acdd72a7-3385-48ef-bd42-f606fba81ae7",
            reason: "Only read operations required",
        };
    }
    // VM full management
    if (requiredActions.includes("Microsoft.Compute/virtualMachines/*")) {
        return {
            roleName: "Virtual Machine Contributor",
            roleId: "9980e02c-c2be-4d73-94e8-173b1dc7cf3c",
            reason: "Full VM management required",
            alternatives: [
                { name: "Contributor", id: "b24988ac-6180-42a0-ab88-20f7382dd24c" },
            ],
        };
    }
    // VM login
    if (requiredActions.includes("Microsoft.Compute/virtualMachines/login/action")) {
        return {
            roleName: "Virtual Machine User Login",
            roleId: "fb879df8-f326-4884-b1cf-06f3ad86be52",
            reason: "VM login access required",
            alternatives: [
                {
                    name: "Virtual Machine Administrator Login",
                    id: "1c0163c0-47e6-4577-8991-ea5c82e286e4",
                },
            ],
        };
    }
    // Key Vault access
    if (requiredActions.some((action) => action.startsWith("Microsoft.KeyVault/"))) {
        return {
            roleName: "Key Vault Secrets User",
            roleId: "4633458b-17de-408a-b874-0445c86b69e6",
            reason: "Key Vault access required",
            alternatives: [
                {
                    name: "Key Vault Secrets Officer",
                    id: "b86a8fe4-44ce-4948-aee5-eccb2c155cd7",
                },
            ],
        };
    }
    // Storage access
    if (requiredActions.some((action) => action.startsWith("Microsoft.Storage/"))) {
        return {
            roleName: "Storage Blob Data Contributor",
            roleId: "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
            reason: "Storage access required",
            alternatives: [
                {
                    name: "Storage Blob Data Reader",
                    id: "2a2b9908-6ea1-4ae2-8e65-a410df84e7d1",
                },
            ],
        };
    }
    // Default to Reader for safety
    return {
        roleName: "Reader",
        roleId: "acdd72a7-3385-48ef-bd42-f606fba81ae7",
        reason: "Default safe role - consider creating custom role for specific needs",
    };
}
/**
 * 6. Common Custom Role Templates
 * Pre-defined custom role templates for common scenarios
 */
exports.customRoleTemplates = {
    /**
     * VM Start/Stop Only
     */
    vmStartStop: () => ({
        name: "Virtual Machine Start/Stop Operator",
        description: "Can start and stop virtual machines but cannot modify configuration",
        actions: [
            "Microsoft.Compute/virtualMachines/read",
            "Microsoft.Compute/virtualMachines/start/action",
            "Microsoft.Compute/virtualMachines/powerOff/action",
            "Microsoft.Compute/virtualMachines/restart/action",
        ],
        notActions: [],
        assignableScopes: ["[subscription().id]"],
    }),
    /**
     * VM Backup Operator
     */
    vmBackupOperator: () => ({
        name: "Virtual Machine Backup Operator",
        description: "Can perform backup operations on virtual machines",
        actions: [
            "Microsoft.Compute/virtualMachines/read",
            "Microsoft.RecoveryServices/Vaults/backupFabrics/protectionContainers/protectedItems/backup/action",
            "Microsoft.RecoveryServices/Vaults/backupFabrics/protectionContainers/protectedItems/read",
            "Microsoft.RecoveryServices/Vaults/backupFabrics/protectionContainers/protectedItems/write",
        ],
        notActions: [],
        assignableScopes: ["[subscription().id]"],
    }),
    /**
     * VM Network Configuration
     */
    vmNetworkConfig: () => ({
        name: "Virtual Machine Network Configuration",
        description: "Can configure network settings for virtual machines",
        actions: [
            "Microsoft.Compute/virtualMachines/read",
            "Microsoft.Network/networkInterfaces/*",
            "Microsoft.Network/virtualNetworks/subnets/join/action",
            "Microsoft.Network/publicIPAddresses/join/action",
            "Microsoft.Network/networkSecurityGroups/join/action",
        ],
        notActions: [],
        assignableScopes: ["[subscription().id]"],
    }),
    /**
     * VM Monitor Only
     */
    vmMonitor: () => ({
        name: "Virtual Machine Monitor",
        description: "Can view VM metrics and diagnostics but cannot modify",
        actions: [
            "Microsoft.Compute/virtualMachines/read",
            "Microsoft.Insights/metrics/read",
            "Microsoft.Insights/metricDefinitions/read",
            "Microsoft.Insights/diagnosticSettings/read",
            "Microsoft.OperationalInsights/workspaces/query/read",
        ],
        notActions: [],
        assignableScopes: ["[subscription().id]"],
    }),
    /**
     * VM Extension Manager
     */
    vmExtensionManager: () => ({
        name: "Virtual Machine Extension Manager",
        description: "Can manage VM extensions but cannot modify VM configuration",
        actions: [
            "Microsoft.Compute/virtualMachines/read",
            "Microsoft.Compute/virtualMachines/extensions/*",
        ],
        notActions: [],
        assignableScopes: ["[subscription().id]"],
    }),
};
/**
 * 7. Validate RBAC Configuration
 *
 * @param assignment - Role assignment configuration
 * @returns Validation result
 */
function validateRBACConfig(assignment) {
    const errors = [];
    const warnings = [];
    // Principal ID validation
    if (!assignment.principalId || assignment.principalId.trim() === "") {
        errors.push("Principal ID is required");
    }
    // Role definition validation
    if (!assignment.roleDefinitionId ||
        assignment.roleDefinitionId.trim() === "") {
        errors.push("Role definition ID is required");
    }
    // Scope validation
    if (!assignment.scope || assignment.scope.trim() === "") {
        errors.push("Scope is required");
    }
    // Conditional access validation
    if (assignment.condition && !assignment.conditionVersion) {
        warnings.push("Condition version should be specified when using conditional access");
    }
    // Over-privileged warning
    if (assignment.roleDefinitionId === "8e3af657-a8ff-443c-a75c-2fe8c4bcb635") {
        // Owner role
        warnings.push("Owner role grants full access - consider using a more restrictive role");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * 8. RBAC Best Practices
 * Get RBAC best practices and recommendations
 */
function getRBACBestPractices() {
    return {
        principles: [
            "Least Privilege: Grant only the minimum permissions needed",
            "Separation of Duties: Divide responsibilities among multiple roles",
            "Just-In-Time Access: Use PIM for temporary elevated access",
            "Regular Review: Audit role assignments regularly",
            "Custom Roles: Create custom roles for specific needs",
        ],
        recommendations: [
            "Use built-in roles when possible",
            "Avoid using Owner role in production",
            "Apply roles at the appropriate scope level",
            "Document role assignments and their purpose",
            "Use Azure AD groups for role assignments instead of individual users",
            "Implement conditional access for sensitive operations",
            "Monitor role assignment changes",
            "Use managed identities instead of service principals when possible",
        ],
        antiPatterns: [
            "Assigning Owner role to service principals",
            "Granting subscription-level access when resource-level is sufficient",
            "Creating overly broad custom roles",
            "Not reviewing and removing unused role assignments",
            "Using the same role for all environments (dev, test, prod)",
        ],
        tools: [
            "Azure Policy: Enforce RBAC policies",
            "Azure Advisor: Get RBAC recommendations",
            "Azure Monitor: Track role assignment changes",
            "Privileged Identity Management (PIM): Just-in-time access",
            "Access Reviews: Regular access certification",
        ],
    };
}
/**
 * Export all RBAC functions
 */
exports.rbac = {
    assignBuiltInRole,
    createCustomRole,
    createScope,
    roleAssignmentTemplate,
    recommendRole,
    customRoleTemplates: exports.customRoleTemplates,
    validateRBACConfig,
    getRBACBestPractices,
};
