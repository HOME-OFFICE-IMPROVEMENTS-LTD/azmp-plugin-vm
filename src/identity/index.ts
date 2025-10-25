/**
 * Identity Module
 * 
 * Main entry point for identity and access management features
 * Integrates Managed Identity, Azure AD, and RBAC modules
 * 
 * @module identity
 */

import Handlebars from 'handlebars';
import * as managedidentity from './managedidentity';
import * as azuread from './azuread';
import * as rbac from './rbac';

// Re-export all modules
export { managedidentity, azuread, rbac };

/**
 * Identity templates metadata
 */
export const identityTemplates = [
  {
    name: 'system-assigned-identity',
    description: 'VM with system-assigned managed identity',
    features: ['Automatic identity management', 'Key Vault access', 'Azure service authentication']
  },
  {
    name: 'user-assigned-identity',
    description: 'VM with user-assigned managed identity',
    features: ['Shared identity across resources', 'Independent lifecycle', 'Centralized management']
  },
  {
    name: 'aad-ssh-login',
    description: 'Linux VM with Azure AD SSH login',
    features: ['Passwordless SSH', 'Conditional Access', 'MFA support', 'Centralized user management']
  },
  {
    name: 'aad-rdp-login',
    description: 'Windows VM with Azure AD RDP login',
    features: ['Passwordless RDP', 'Conditional Access', 'MFA support', 'Windows Hello']
  },
  {
    name: 'key-vault-access',
    description: 'VM with Key Vault access via managed identity',
    features: ['Secure secret retrieval', 'Certificate management', 'No credential storage']
  },
  {
    name: 'rbac-least-privilege',
    description: 'VM with least privilege RBAC configuration',
    features: ['Minimal permissions', 'Custom role', 'Resource-level scope']
  },
  {
    name: 'passwordless-authentication',
    description: 'VM with passwordless authentication',
    features: ['FIDO2 security keys', 'Windows Hello', 'Microsoft Authenticator', 'Phishing-resistant']
  },
  {
    name: 'conditional-access-policy',
    description: 'VM with Conditional Access policies',
    features: ['Location-based access', 'Device compliance', 'Risk-based authentication', 'MFA enforcement']
  },
  {
    name: 'identity-compliance-soc2',
    description: 'Identity configuration for SOC2 compliance',
    features: ['MFA required', 'Audit logging', 'Least privilege', 'Access reviews']
  },
  {
    name: 'identity-compliance-hipaa',
    description: 'Identity configuration for HIPAA compliance',
    features: ['MFA enforcement', 'Encryption', 'Access controls', 'Audit trails']
  },
  {
    name: 'multi-identity-hybrid',
    description: 'VM with both system and user-assigned identities',
    features: ['Maximum flexibility', 'Multiple service access', 'Hybrid scenarios']
  },
  {
    name: 'cross-resource-identity',
    description: 'User-assigned identity shared across VM scale set',
    features: ['Shared identity', 'Consistent permissions', 'Scale set support']
  }
];

/**
 * Create Handlebars helpers for identity features
 */
export function createIdentityHelpers() {
  const helpers: Record<string, Handlebars.HelperDelegate> = {};

  // ===========================
  // Managed Identity Helpers
  // ===========================

  /**
   * System-assigned managed identity
   */
  helpers['identity:managedidentity.systemAssigned'] = function() {
    return JSON.stringify(managedidentity.systemAssignedIdentity(), null, 2);
  };

  /**
   * User-assigned managed identity
   */
  helpers['identity:managedidentity.userAssigned'] = function(identityId: string) {
    return JSON.stringify(managedidentity.userAssignedIdentity(identityId), null, 2);
  };

  /**
   * Multiple identities (hybrid)
   */
  helpers['identity:managedidentity.multiple'] = function(userIdentityIds: string[]) {
    return JSON.stringify(managedidentity.multipleIdentities(userIdentityIds), null, 2);
  };

  /**
   * Create managed identity from requirements
   */
  helpers['identity:managedidentity.create'] = function(requirements: managedidentity.IdentityRequirements) {
    return JSON.stringify(managedidentity.createManagedIdentity(requirements), null, 2);
  };

  /**
   * Get identity recommendations
   */
  helpers['identity:managedidentity.recommendations'] = function(
    useCase: 'key-vault' | 'storage' | 'sql' | 'container-registry' | 'multi-service' | 'cross-resource'
  ) {
    return JSON.stringify(managedidentity.getIdentityRecommendations(useCase), null, 2);
  };

  /**
   * Validate managed identity configuration
   */
  helpers['identity:managedidentity.validate'] = function(config: managedidentity.ManagedIdentityConfig) {
    return JSON.stringify(managedidentity.validateManagedIdentityConfig(config), null, 2);
  };

  /**
   * Create role assignment for managed identity
   */
  helpers['identity:managedidentity.roleAssignment'] = function(
    principalId: string,
    roleDefinitionId: string,
    scope: string
  ) {
    return JSON.stringify(managedidentity.createRoleAssignment(principalId, roleDefinitionId, scope), null, 2);
  };

  // ===========================
  // Azure AD Helpers
  // ===========================

  /**
   * AAD SSH Login extension (Linux)
   */
  helpers['identity:azuread.sshLogin'] = function(config?: azuread.AADSSHLoginConfig) {
    return JSON.stringify(azuread.aadSSHLoginExtension(config), null, 2);
  };

  /**
   * AAD Login extension (Windows)
   */
  helpers['identity:azuread.windowsLogin'] = function(config?: azuread.AADSSHLoginConfig) {
    return JSON.stringify(azuread.aadLoginForWindows(config), null, 2);
  };

  /**
   * Conditional Access policy
   */
  helpers['identity:azuread.conditionalAccess'] = function(policy: azuread.ConditionalAccessPolicy) {
    return JSON.stringify(azuread.conditionalAccessPolicy(policy), null, 2);
  };

  /**
   * MFA configuration
   */
  helpers['identity:azuread.mfa'] = function(config: azuread.MFAConfig) {
    return JSON.stringify(azuread.mfaConfiguration(config), null, 2);
  };

  /**
   * Passwordless authentication
   */
  helpers['identity:azuread.passwordless'] = function(
    methods?: Array<'fido2' | 'windowsHello' | 'authenticator'>
  ) {
    return JSON.stringify(azuread.passwordlessAuthentication(methods), null, 2);
  };

  /**
   * VM access role
   */
  helpers['identity:azuread.vmAccessRole'] = function(roleType: 'Administrator' | 'User') {
    return JSON.stringify(azuread.vmAccessRole(roleType), null, 2);
  };

  /**
   * Create complete AAD integration
   */
  helpers['identity:azuread.create'] = function(
    platform: 'Windows' | 'Linux',
    features?: azuread.AADIntegrationFeatures
  ) {
    return JSON.stringify(azuread.createAADIntegration(platform, features), null, 2);
  };

  /**
   * Validate AAD configuration
   */
  helpers['identity:azuread.validate'] = function(config: any) {
    return JSON.stringify(azuread.validateAADConfig(config), null, 2);
  };

  // ===========================
  // RBAC Helpers
  // ===========================

  /**
   * Assign built-in role
   */
  helpers['identity:rbac.assignBuiltInRole'] = function(
    principalId: string,
    roleName: string,
    scopeType?: rbac.RBACScope,
    scopeId?: string
  ) {
    return JSON.stringify(rbac.assignBuiltInRole(principalId, roleName, scopeType, scopeId), null, 2);
  };

  /**
   * Create custom role
   */
  helpers['identity:rbac.createCustomRole'] = function(roleDefinition: rbac.CustomRoleDefinition) {
    return JSON.stringify(rbac.createCustomRole(roleDefinition), null, 2);
  };

  /**
   * Create RBAC scope
   */
  helpers['identity:rbac.scope'] = function(scopeType: rbac.RBACScope, resourceName?: string) {
    return rbac.createScope(scopeType, resourceName);
  };

  /**
   * Role assignment template
   */
  helpers['identity:rbac.template'] = function(assignment: rbac.RoleAssignmentConfig) {
    return JSON.stringify(rbac.roleAssignmentTemplate(assignment), null, 2);
  };

  /**
   * Recommend role based on required actions
   */
  helpers['identity:rbac.recommend'] = function(requiredActions: string[]) {
    return JSON.stringify(rbac.recommendRole(requiredActions), null, 2);
  };

  /**
   * Custom role template: VM Start/Stop
   */
  helpers['identity:rbac.customRole.vmStartStop'] = function() {
    return JSON.stringify(rbac.customRoleTemplates.vmStartStop(), null, 2);
  };

  /**
   * Custom role template: VM Backup Operator
   */
  helpers['identity:rbac.customRole.vmBackup'] = function() {
    return JSON.stringify(rbac.customRoleTemplates.vmBackupOperator(), null, 2);
  };

  /**
   * Custom role template: VM Network Config
   */
  helpers['identity:rbac.customRole.vmNetwork'] = function() {
    return JSON.stringify(rbac.customRoleTemplates.vmNetworkConfig(), null, 2);
  };

  /**
   * Custom role template: VM Monitor
   */
  helpers['identity:rbac.customRole.vmMonitor'] = function() {
    return JSON.stringify(rbac.customRoleTemplates.vmMonitor(), null, 2);
  };

  /**
   * Custom role template: VM Extension Manager
   */
  helpers['identity:rbac.customRole.vmExtension'] = function() {
    return JSON.stringify(rbac.customRoleTemplates.vmExtensionManager(), null, 2);
  };

  /**
   * Validate RBAC configuration
   */
  helpers['identity:rbac.validate'] = function(assignment: rbac.RoleAssignmentConfig) {
    return JSON.stringify(rbac.validateRBACConfig(assignment), null, 2);
  };

  /**
   * Get RBAC best practices
   */
  helpers['identity:rbac.bestPractices'] = function() {
    return JSON.stringify(rbac.getRBACBestPractices(), null, 2);
  };

  // ===========================
  // Utility Helpers
  // ===========================

  /**
   * List all identity templates
   */
  helpers['identity:list'] = function() {
    return JSON.stringify(identityTemplates, null, 2);
  };

  /**
   * Get specific identity template
   */
  helpers['identity:template'] = function(name: string) {
    const template = identityTemplates.find(t => t.name === name);
    return template ? JSON.stringify(template, null, 2) : null;
  };

  /**
   * Count identity templates
   */
  helpers['identity:count'] = function() {
    return identityTemplates.length;
  };

  /**
   * Filter templates by feature
   */
  helpers['identity:filterByFeature'] = function(feature: string) {
    const filtered = identityTemplates.filter(t => 
      t.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
    );
    return JSON.stringify(filtered, null, 2);
  };

  /**
   * Get compliance template
   */
  helpers['identity:compliance'] = function(framework: 'soc2' | 'hipaa') {
    const template = identityTemplates.find(t => t.name === `identity-compliance-${framework}`);
    return template ? JSON.stringify(template, null, 2) : null;
  };

  /**
   * Get built-in role ID
   */
  helpers['identity:builtInRole'] = function(roleName: string) {
    return (managedidentity.builtInRoles as Record<string, string>)[roleName] || null;
  };

  return helpers;
}

/**
 * Register all identity helpers with Handlebars
 */
export function registerIdentityHelpers() {
  const helpers = createIdentityHelpers();
  Object.keys(helpers).forEach(name => {
    Handlebars.registerHelper(name, helpers[name]);
  });
  return helpers;
}

/**
 * CLI Commands for Identity Module
 */
export const identityCLICommands = [
  {
    command: 'identity',
    description: 'Manage identity and access features',
    subcommands: [
      {
        command: 'list',
        description: 'List all available identity templates',
        action: () => {
          console.log('Available Identity Templates:');
          identityTemplates.forEach((template, index) => {
            console.log(`\n${index + 1}. ${template.name}`);
            console.log(`   Description: ${template.description}`);
            console.log(`   Features: ${template.features.join(', ')}`);
          });
        }
      },
      {
        command: 'list-managed-identity',
        description: 'List managed identity options',
        action: () => {
          console.log('Managed Identity Options:');
          console.log('\n1. System-Assigned Identity');
          console.log('   - Automatic lifecycle management');
          console.log('   - Tied to VM lifecycle');
          console.log('\n2. User-Assigned Identity');
          console.log('   - Independent lifecycle');
          console.log('   - Shared across resources');
          console.log('\n3. Multiple Identities (Hybrid)');
          console.log('   - Both system and user-assigned');
          console.log('   - Maximum flexibility');
        }
      },
      {
        command: 'list-aad-features',
        description: 'List Azure AD integration features',
        action: () => {
          console.log('Azure AD Integration Features:');
          console.log('\n1. AAD SSH Login (Linux)');
          console.log('   - SSH with Azure AD credentials');
          console.log('   - Passwordless authentication');
          console.log('\n2. AAD RDP Login (Windows)');
          console.log('   - RDP with Azure AD credentials');
          console.log('   - Windows Hello support');
          console.log('\n3. Conditional Access');
          console.log('   - Location-based policies');
          console.log('   - Device compliance checks');
          console.log('\n4. Multi-Factor Authentication');
          console.log('   - Phone, email, authenticator app');
          console.log('   - FIDO2 security keys');
        }
      },
      {
        command: 'list-rbac-roles',
        description: 'List built-in RBAC roles for VMs',
        action: () => {
          console.log('Built-in RBAC Roles for Virtual Machines:');
          console.log('\n1. Virtual Machine Contributor');
          console.log('   - Full VM management');
          console.log('\n2. Virtual Machine Administrator Login');
          console.log('   - Admin SSH/RDP access');
          console.log('\n3. Virtual Machine User Login');
          console.log('   - Standard user SSH/RDP access');
          console.log('\n4. Reader');
          console.log('   - Read-only access');
          console.log('\n5. Contributor');
          console.log('   - Full management (all resources)');
        }
      }
    ]
  }
];

/**
 * Identity module statistics
 */
export function getIdentityStats() {
  return {
    templates: identityTemplates.length,
    helpers: Object.keys(createIdentityHelpers()).length,
    modules: 3, // managedidentity, azuread, rbac
    features: {
      managedIdentity: 8, // system, user, multiple, create, recommendations, validate, roleAssignment, builtInRoles
      azureAD: 8, // sshLogin, windowsLogin, conditionalAccess, mfa, passwordless, vmAccessRole, create, validate
      rbac: 13 // assignBuiltInRole, createCustomRole, scope, template, recommend, 5 custom role templates, validate, bestPractices
    }
  };
}

/**
 * Export identity module
 */
export default {
  managedidentity,
  azuread,
  rbac,
  identityTemplates,
  createIdentityHelpers,
  registerIdentityHelpers,
  identityCLICommands,
  getIdentityStats
};
