/**
 * Identity Managed Identity Module
 *
 * Provides helpers for Azure Managed Identity
 * Supports System-Assigned and User-Assigned identities
 *
 * @module identity/managedidentity
 */
/**
 * Managed Identity type
 */
export type ManagedIdentityType = "SystemAssigned" | "UserAssigned" | "SystemAssigned,UserAssigned";
/**
 * Managed Identity configuration
 */
export interface ManagedIdentityConfig {
    type: ManagedIdentityType;
    userAssignedIdentities?: Record<string, any>;
}
/**
 * User-Assigned Identity reference
 */
export interface UserAssignedIdentityRef {
    id: string;
    clientId?: string;
    principalId?: string;
}
/**
 * 1. System-Assigned Managed Identity
 * Automatically managed identity tied to VM lifecycle
 *
 * @returns System-assigned identity configuration
 */
export declare function systemAssignedIdentity(): ManagedIdentityConfig;
/**
 * 2. User-Assigned Managed Identity
 * Standalone identity that can be shared across multiple resources
 *
 * @param identityId - Resource ID of the user-assigned identity
 * @returns User-assigned identity configuration
 */
export declare function userAssignedIdentity(identityId: string): ManagedIdentityConfig;
/**
 * 3. Multiple Identity Assignment (Hybrid)
 * Both system-assigned and user-assigned identities
 *
 * @param userIdentityIds - Array of user-assigned identity resource IDs
 * @returns Hybrid identity configuration
 */
export declare function multipleIdentities(userIdentityIds: string[]): ManagedIdentityConfig;
/**
 * Create managed identity configuration from requirements
 *
 * @param requirements - Identity requirements
 * @returns Appropriate managed identity configuration
 */
export interface IdentityRequirements {
    sharedAcrossResources?: boolean;
    multipleIdentitiesNeeded?: boolean;
    specificUserIdentities?: string[];
    simpleUseCase?: boolean;
}
export declare function createManagedIdentity(requirements: IdentityRequirements): ManagedIdentityConfig;
/**
 * Get identity recommendations based on use case
 *
 * @param useCase - Identity use case
 * @returns Recommended identity configuration
 */
export declare function getIdentityRecommendations(useCase: "key-vault" | "storage" | "sql" | "container-registry" | "multi-service" | "cross-resource"): any;
/**
 * Validate managed identity configuration
 *
 * @param config - Managed identity configuration
 * @returns Validation result
 */
export declare function validateManagedIdentityConfig(config: ManagedIdentityConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Generate RBAC role assignment for managed identity
 *
 * @param identityPrincipalId - Principal ID of the managed identity
 * @param roleDefinitionId - Role definition ID
 * @param scope - Scope of the role assignment
 * @returns Role assignment configuration
 */
export declare function createRoleAssignment(identityPrincipalId: string, roleDefinitionId: string, scope: string): {
    type: string;
    apiVersion: string;
    name: string;
    properties: {
        roleDefinitionId: string;
        principalId: string;
        principalType: string;
        scope: string;
    };
};
/**
 * Common Azure built-in role definitions
 */
export declare const builtInRoles: {
    Contributor: string;
    Reader: string;
    Owner: string;
    "Key Vault Secrets User": string;
    "Key Vault Secrets Officer": string;
    "Key Vault Certificates User": string;
    "Key Vault Crypto User": string;
    "Storage Blob Data Contributor": string;
    "Storage Blob Data Reader": string;
    "Storage Queue Data Contributor": string;
    "Storage Queue Data Reader": string;
    "SQL DB Contributor": string;
    "SQL Security Manager": string;
    AcrPull: string;
    AcrPush: string;
    "Virtual Machine Contributor": string;
    "Virtual Machine Administrator Login": string;
    "Virtual Machine User Login": string;
};
/**
 * Export all managed identity functions
 */
export declare const managedidentity: {
    systemAssignedIdentity: typeof systemAssignedIdentity;
    userAssignedIdentity: typeof userAssignedIdentity;
    multipleIdentities: typeof multipleIdentities;
    createManagedIdentity: typeof createManagedIdentity;
    getIdentityRecommendations: typeof getIdentityRecommendations;
    validateManagedIdentityConfig: typeof validateManagedIdentityConfig;
    createRoleAssignment: typeof createRoleAssignment;
    builtInRoles: {
        Contributor: string;
        Reader: string;
        Owner: string;
        "Key Vault Secrets User": string;
        "Key Vault Secrets Officer": string;
        "Key Vault Certificates User": string;
        "Key Vault Crypto User": string;
        "Storage Blob Data Contributor": string;
        "Storage Blob Data Reader": string;
        "Storage Queue Data Contributor": string;
        "Storage Queue Data Reader": string;
        "SQL DB Contributor": string;
        "SQL Security Manager": string;
        AcrPull: string;
        AcrPush: string;
        "Virtual Machine Contributor": string;
        "Virtual Machine Administrator Login": string;
        "Virtual Machine User Login": string;
    };
};
