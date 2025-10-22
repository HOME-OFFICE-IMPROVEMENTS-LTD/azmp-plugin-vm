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
export type ManagedIdentityType = 'SystemAssigned' | 'UserAssigned' | 'SystemAssigned,UserAssigned';

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
export function systemAssignedIdentity(): ManagedIdentityConfig {
  return {
    type: 'SystemAssigned',
    description: 'System-assigned managed identity automatically created and managed by Azure',
    lifecycle: 'Tied to VM lifecycle - created with VM, deleted with VM',
    benefits: [
      'Automatic lifecycle management',
      'No credential management needed',
      'Simplified RBAC assignment',
      'Single identity per VM'
    ],
    useCases: [
      'Access Azure Key Vault',
      'Connect to Azure Storage',
      'Authenticate to Azure SQL',
      'Access Azure services without credentials'
    ]
  } as any;
}

/**
 * 2. User-Assigned Managed Identity
 * Standalone identity that can be shared across multiple resources
 * 
 * @param identityId - Resource ID of the user-assigned identity
 * @returns User-assigned identity configuration
 */
export function userAssignedIdentity(identityId: string): ManagedIdentityConfig {
  return {
    type: 'UserAssigned',
    userAssignedIdentities: {
      [identityId]: {}
    },
    description: 'User-assigned managed identity with independent lifecycle',
    lifecycle: 'Independent lifecycle - can exist before and after VM',
    benefits: [
      'Shared across multiple resources',
      'Independent lifecycle management',
      'Centralized permission management',
      'Multiple identities per VM'
    ],
    useCases: [
      'Shared identity across VM scale sets',
      'Multi-tenant scenarios',
      'Cross-resource authentication',
      'Centralized identity management'
    ]
  } as any;
}

/**
 * 3. Multiple Identity Assignment (Hybrid)
 * Both system-assigned and user-assigned identities
 * 
 * @param userIdentityIds - Array of user-assigned identity resource IDs
 * @returns Hybrid identity configuration
 */
export function multipleIdentities(userIdentityIds: string[]): ManagedIdentityConfig {
  const userAssignedIdentities: Record<string, any> = {};
  userIdentityIds.forEach(id => {
    userAssignedIdentities[id] = {};
  });

  return {
    type: 'SystemAssigned,UserAssigned',
    userAssignedIdentities,
    description: 'Hybrid approach with both system and user-assigned identities',
    benefits: [
      'Flexibility of both identity types',
      'Default system identity for general use',
      'Specific user identities for specialized access',
      'Maximum control and flexibility'
    ],
    scenarios: [
      'Complex multi-service access patterns',
      'Gradual migration strategies',
      'Mixed authentication requirements',
      'Enterprise multi-identity needs'
    ]
  } as any;
}

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

export function createManagedIdentity(requirements: IdentityRequirements): ManagedIdentityConfig {
  // Multiple specific identities needed
  if (requirements.specificUserIdentities && requirements.specificUserIdentities.length > 0) {
    if (requirements.multipleIdentitiesNeeded) {
      return multipleIdentities(requirements.specificUserIdentities);
    }
    return userAssignedIdentity(requirements.specificUserIdentities[0]);
  }

  // Shared across resources
  if (requirements.sharedAcrossResources) {
    // Would need to create user-assigned identity first
    return {
      type: 'UserAssigned',
      userAssignedIdentities: {},
      recommendation: 'Create user-assigned identity resource first, then assign to VM'
    } as any;
  }

  // Simple use case - system assigned is best
  if (requirements.simpleUseCase) {
    return systemAssignedIdentity();
  }

  // Default to system assigned
  return systemAssignedIdentity();
}

/**
 * Get identity recommendations based on use case
 * 
 * @param useCase - Identity use case
 * @returns Recommended identity configuration
 */
export function getIdentityRecommendations(
  useCase: 'key-vault' | 'storage' | 'sql' | 'container-registry' | 'multi-service' | 'cross-resource'
) {
  const recommendations: Record<string, any> = {
    'key-vault': {
      identityType: 'SystemAssigned',
      rbacRoles: ['Key Vault Secrets User', 'Key Vault Certificate User'],
      additionalConfig: ['Enable Key Vault firewall', 'Use private endpoint'],
      example: 'Access secrets and certificates from Key Vault'
    },
    'storage': {
      identityType: 'SystemAssigned',
      rbacRoles: ['Storage Blob Data Contributor', 'Storage Queue Data Contributor'],
      additionalConfig: ['Enable storage firewall', 'Use managed identity for storage account key'],
      example: 'Read/write blobs and queue messages'
    },
    'sql': {
      identityType: 'SystemAssigned',
      rbacRoles: ['SQL DB Contributor', 'SQL Security Manager'],
      additionalConfig: ['Enable Azure AD authentication', 'Create SQL user for managed identity'],
      example: 'Connect to Azure SQL Database without passwords'
    },
    'container-registry': {
      identityType: 'SystemAssigned',
      rbacRoles: ['AcrPull', 'AcrPush'],
      additionalConfig: ['Enable admin user (optional)', 'Configure retention policy'],
      example: 'Pull and push container images'
    },
    'multi-service': {
      identityType: 'SystemAssigned',
      rbacRoles: ['Multiple role assignments as needed'],
      additionalConfig: ['Use separate identities for different service groups', 'Implement least privilege'],
      example: 'Access multiple Azure services from single VM'
    },
    'cross-resource': {
      identityType: 'UserAssigned',
      rbacRoles: ['Service-specific roles'],
      additionalConfig: ['Create user-assigned identity first', 'Share across resources'],
      example: 'Share identity across VM scale set or multiple VMs'
    }
  };

  return recommendations[useCase];
}

/**
 * Validate managed identity configuration
 * 
 * @param config - Managed identity configuration
 * @returns Validation result
 */
export function validateManagedIdentityConfig(
  config: ManagedIdentityConfig
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type validation
  if (!config.type) {
    errors.push('Identity type is required');
  }

  // User-assigned validation
  if (config.type.includes('UserAssigned')) {
    if (!config.userAssignedIdentities || Object.keys(config.userAssignedIdentities).length === 0) {
      errors.push('User-assigned identities must be specified when using UserAssigned type');
    }
  }

  // Performance warnings
  if (config.userAssignedIdentities && Object.keys(config.userAssignedIdentities).length > 5) {
    warnings.push('Consider using fewer identities for better performance and management');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate RBAC role assignment for managed identity
 * 
 * @param identityPrincipalId - Principal ID of the managed identity
 * @param roleDefinitionId - Role definition ID
 * @param scope - Scope of the role assignment
 * @returns Role assignment configuration
 */
export function createRoleAssignment(
  identityPrincipalId: string,
  roleDefinitionId: string,
  scope: string
) {
  return {
    type: 'Microsoft.Authorization/roleAssignments',
    apiVersion: '2022-04-01',
    name: `[guid('${identityPrincipalId}', '${roleDefinitionId}', '${scope}')]`,
    properties: {
      roleDefinitionId: `[subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '${roleDefinitionId}')]`,
      principalId: identityPrincipalId,
      principalType: 'ServicePrincipal',
      scope
    }
  };
}

/**
 * Common Azure built-in role definitions
 */
export const builtInRoles = {
  // General
  'Contributor': '0a5e1bb7-8b1c-445c-9dd2-4161a9b0b10f',
  'Reader': 'acdd72a7-3385-48ef-bd42-f606fba81ae7',
  'Owner': '8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
  
  // Key Vault
  'Key Vault Secrets User': '4633458b-17de-408a-b874-0445c86b69e6',
  'Key Vault Secrets Officer': 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7',
  'Key Vault Certificates User': 'db79e9a7-68ee-4b58-9aeb-b90e7c24fcba',
  'Key Vault Crypto User': '12338af0-0e69-4776-bea7-57ae8d297424',
  
  // Storage
  'Storage Blob Data Contributor': 'ba92f5b4-2d11-453d-a403-e96b0029c9fe',
  'Storage Blob Data Reader': '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1',
  'Storage Queue Data Contributor': '974c5e8b-45b9-4653-ba55-5f855dd0fb88',
  'Storage Queue Data Reader': '19e7f393-937e-4f77-808e-94535e297925',
  
  // SQL
  'SQL DB Contributor': '9b7fa17d-e63e-47b0-bb0a-15c516ac86ec',
  'SQL Security Manager': '056cd41c-7e88-42e1-933e-88ba6a50c9c3',
  
  // Container Registry
  'AcrPull': '7f951dda-4ed3-4680-a7ca-43fe172d538d',
  'AcrPush': '8311e382-0749-4cb8-b61a-304f252e45ec',
  
  // Virtual Machines
  'Virtual Machine Contributor': '9980e02c-c2be-4d73-94e8-173b1dc7cf3c',
  'Virtual Machine Administrator Login': '1c0163c0-47e6-4577-8991-ea5c82e286e4',
  'Virtual Machine User Login': 'fb879df8-f326-4884-b1cf-06f3ad86be52'
};

/**
 * Export all managed identity functions
 */
export const managedidentity = {
  systemAssignedIdentity,
  userAssignedIdentity,
  multipleIdentities,
  createManagedIdentity,
  getIdentityRecommendations,
  validateManagedIdentityConfig,
  createRoleAssignment,
  builtInRoles
};
