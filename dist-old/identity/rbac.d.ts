/**
 * Identity RBAC Module
 *
 * Provides helpers for Role-Based Access Control (RBAC)
 * Supports built-in roles, custom roles, and scope management
 *
 * @module identity/rbac
 */
/**
 * RBAC scope type
 */
export type RBACScope = "resource" | "resourceGroup" | "subscription" | "managementGroup";
/**
 * Role assignment configuration
 */
export interface RoleAssignmentConfig {
    principalId: string;
    roleDefinitionId: string;
    scope: string;
    principalType?: "User" | "Group" | "ServicePrincipal" | "ForeignGroup" | "Device";
    condition?: string;
    conditionVersion?: "2.0";
}
/**
 * Custom role definition
 */
export interface CustomRoleDefinition {
    name: string;
    description: string;
    actions: string[];
    notActions?: string[];
    dataActions?: string[];
    notDataActions?: string[];
    assignableScopes: string[];
}
/**
 * Role permission
 */
export interface RolePermission {
    actions: string[];
    notActions?: string[];
    dataActions?: string[];
    notDataActions?: string[];
}
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
export declare function assignBuiltInRole(principalId: string, roleName: string, scopeType?: RBACScope, scopeId?: string): RoleAssignmentConfig;
/**
 * 2. Custom Role Definition
 * Create custom RBAC role with specific permissions
 *
 * @param roleDefinition - Custom role definition
 * @returns Custom role template
 */
export declare function createCustomRole(roleDefinition: CustomRoleDefinition): {
    type: string;
    apiVersion: string;
    name: string;
    properties: {
        roleName: string;
        description: string;
        type: string;
        permissions: {
            actions: string[];
            notActions: string[];
            dataActions: string[];
            notDataActions: string[];
        }[];
        assignableScopes: string[];
    };
    useCases: string[];
    examples: string[];
};
/**
 * 3. Scope Management
 * Generate RBAC scopes for different levels
 *
 * @param scopeType - Type of scope
 * @param resourceName - Resource name (for resource scope)
 * @returns Scope template
 */
export declare function createScope(scopeType: RBACScope, resourceName?: string): string;
/**
 * 4. Role Assignment Template
 * Generate complete role assignment ARM template
 *
 * @param assignment - Role assignment configuration
 * @returns ARM template for role assignment
 */
export declare function roleAssignmentTemplate(assignment: RoleAssignmentConfig): any;
/**
 * 5. Least Privilege Role Recommendation
 * Recommend appropriate role based on required actions
 *
 * @param requiredActions - Required actions
 * @returns Recommended role
 */
export declare function recommendRole(requiredActions: string[]): {
    roleName: string;
    roleId: string;
    reason: string;
    alternatives?: Array<{
        name: string;
        id: string;
    }>;
};
/**
 * 6. Common Custom Role Templates
 * Pre-defined custom role templates for common scenarios
 */
export declare const customRoleTemplates: {
    /**
     * VM Start/Stop Only
     */
    vmStartStop: () => CustomRoleDefinition;
    /**
     * VM Backup Operator
     */
    vmBackupOperator: () => CustomRoleDefinition;
    /**
     * VM Network Configuration
     */
    vmNetworkConfig: () => CustomRoleDefinition;
    /**
     * VM Monitor Only
     */
    vmMonitor: () => CustomRoleDefinition;
    /**
     * VM Extension Manager
     */
    vmExtensionManager: () => CustomRoleDefinition;
};
/**
 * 7. Validate RBAC Configuration
 *
 * @param assignment - Role assignment configuration
 * @returns Validation result
 */
export declare function validateRBACConfig(assignment: RoleAssignmentConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * 8. RBAC Best Practices
 * Get RBAC best practices and recommendations
 */
export declare function getRBACBestPractices(): {
    principles: string[];
    recommendations: string[];
    antiPatterns: string[];
    tools: string[];
};
/**
 * Export all RBAC functions
 */
export declare const rbac: {
    assignBuiltInRole: typeof assignBuiltInRole;
    createCustomRole: typeof createCustomRole;
    createScope: typeof createScope;
    roleAssignmentTemplate: typeof roleAssignmentTemplate;
    recommendRole: typeof recommendRole;
    customRoleTemplates: {
        /**
         * VM Start/Stop Only
         */
        vmStartStop: () => CustomRoleDefinition;
        /**
         * VM Backup Operator
         */
        vmBackupOperator: () => CustomRoleDefinition;
        /**
         * VM Network Configuration
         */
        vmNetworkConfig: () => CustomRoleDefinition;
        /**
         * VM Monitor Only
         */
        vmMonitor: () => CustomRoleDefinition;
        /**
         * VM Extension Manager
         */
        vmExtensionManager: () => CustomRoleDefinition;
    };
    validateRBACConfig: typeof validateRBACConfig;
    getRBACBestPractices: typeof getRBACBestPractices;
};
