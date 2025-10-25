/**
 * Identity Module Tests
 * 
 * Tests for Managed Identity, Azure AD, and RBAC features
 */

import { managedidentity, azuread, rbac, createIdentityHelpers, identityTemplates } from '../identity';

describe('Identity Module', () => {
  // ===========================
  // Managed Identity Tests
  // ===========================
  describe('Managed Identity', () => {
    describe('systemAssignedIdentity', () => {
      it('should create system-assigned identity configuration', () => {
        const config = managedidentity.systemAssignedIdentity();
        
        expect(config.type).toBe('SystemAssigned');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('benefits');
        expect(config).toHaveProperty('useCases');
      });
    });

    describe('userAssignedIdentity', () => {
      it('should create user-assigned identity configuration', () => {
        const identityId = '/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myIdentity';
        const config = managedidentity.userAssignedIdentity(identityId);
        
        expect(config.type).toBe('UserAssigned');
        expect(config.userAssignedIdentities).toBeDefined();
        expect(config.userAssignedIdentities![identityId]).toEqual({});
        expect(config).toHaveProperty('description');
      });
    });

    describe('multipleIdentities', () => {
      it('should create hybrid identity configuration', () => {
        const identityIds = [
          '/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1',
          '/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity2'
        ];
        const config = managedidentity.multipleIdentities(identityIds);
        
        expect(config.type).toBe('SystemAssigned,UserAssigned');
        expect(Object.keys(config.userAssignedIdentities!)).toHaveLength(2);
        expect(config).toHaveProperty('benefits');
      });
    });

    describe('createManagedIdentity', () => {
      it('should create system-assigned for simple use case', () => {
        const config = managedidentity.createManagedIdentity({ simpleUseCase: true });
        
        expect(config.type).toBe('SystemAssigned');
      });

      it('should create user-assigned for shared resources', () => {
        const config = managedidentity.createManagedIdentity({ sharedAcrossResources: true });
        
        expect(config.type).toBe('UserAssigned');
      });

      it('should create multiple identities when specific user identities provided', () => {
        const config = managedidentity.createManagedIdentity({
          multipleIdentitiesNeeded: true,
          specificUserIdentities: ['/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id1']
        });
        
        expect(config.type).toBe('SystemAssigned,UserAssigned');
      });
    });

    describe('getIdentityRecommendations', () => {
      it('should return recommendations for Key Vault use case', () => {
        const recommendations = managedidentity.getIdentityRecommendations('key-vault');
        
        expect(recommendations.identityType).toBe('SystemAssigned');
        expect(recommendations.rbacRoles).toContain('Key Vault Secrets User');
      });

      it('should return recommendations for storage use case', () => {
        const recommendations = managedidentity.getIdentityRecommendations('storage');
        
        expect(recommendations.identityType).toBe('SystemAssigned');
        expect(recommendations.rbacRoles).toContain('Storage Blob Data Contributor');
      });

      it('should return recommendations for cross-resource use case', () => {
        const recommendations = managedidentity.getIdentityRecommendations('cross-resource');
        
        expect(recommendations.identityType).toBe('UserAssigned');
      });
    });

    describe('validateManagedIdentityConfig', () => {
      it('should validate correct configuration', () => {
        const config = managedidentity.systemAssignedIdentity();
        const result = managedidentity.validateManagedIdentityConfig(config);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing type', () => {
        const config: any = {};
        const result = managedidentity.validateManagedIdentityConfig(config);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Identity type is required');
      });

      it('should catch missing user-assigned identities', () => {
        const config: any = { type: 'UserAssigned' };
        const result = managedidentity.validateManagedIdentityConfig(config);
        
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('createRoleAssignment', () => {
      it('should create role assignment configuration', () => {
        const assignment = managedidentity.createRoleAssignment(
          'principal-id',
          'role-definition-id',
          '/subscriptions/xxx/resourceGroups/rg'
        );
        
        expect(assignment.type).toBe('Microsoft.Authorization/roleAssignments');
        expect(assignment.properties.principalId).toBe('principal-id');
        expect(assignment.properties.roleDefinitionId).toContain('role-definition-id');
      });
    });

    describe('builtInRoles', () => {
      it('should contain common built-in roles', () => {
        expect(managedidentity.builtInRoles).toHaveProperty('Contributor');
        expect(managedidentity.builtInRoles).toHaveProperty('Reader');
        expect(managedidentity.builtInRoles).toHaveProperty('Key Vault Secrets User');
        expect(managedidentity.builtInRoles).toHaveProperty('Storage Blob Data Contributor');
      });
    });
  });

  // ===========================
  // Azure AD Tests
  // ===========================
  describe('Azure AD', () => {
    describe('aadSSHLoginExtension', () => {
      it('should create AAD SSH Login extension', () => {
        const extension = azuread.aadSSHLoginExtension();
        
        expect(extension.type).toBe('Microsoft.Compute/virtualMachines/extensions');
        expect(extension.name).toBe('AADSSHLoginForLinux');
        expect(extension.properties.publisher).toBe('Microsoft.Azure.ActiveDirectory');
      });

      it('should support custom configuration', () => {
        const extension = azuread.aadSSHLoginExtension({
          enabled: true,
          allowedPrincipals: ['user1', 'user2'],
          enablePasswordlessAuth: true
        });
        
        expect(extension.properties.settings.enabled).toBe(true);
        expect(extension.properties.settings.allowedPrincipals).toHaveLength(2);
      });
    });

    describe('aadLoginForWindows', () => {
      it('should create AAD Login extension for Windows', () => {
        const extension = azuread.aadLoginForWindows();
        
        expect(extension.type).toBe('Microsoft.Compute/virtualMachines/extensions');
        expect(extension.name).toBe('AADLoginForWindows');
        expect(extension.properties.type).toBe('AADLoginForWindows');
      });
    });

    describe('conditionalAccessPolicy', () => {
      it('should create Conditional Access policy', () => {
        const policy = azuread.conditionalAccessPolicy({
          name: 'VM Access Policy',
          enabled: true,
          conditions: {
            locations: ['US', 'EU'],
            platforms: ['Windows', 'Linux']
          },
          controls: {
            requireMFA: true,
            requireCompliantDevice: true
          }
        });
        
        expect(policy.name).toBe('VM Access Policy');
        expect(policy.enabled).toBe(true);
        expect(policy.controls.requireMFA).toBe(true);
      });
    });

    describe('mfaConfiguration', () => {
      it('should create MFA configuration', () => {
        const mfa = azuread.mfaConfiguration({
          enabled: true,
          methods: ['phone', 'authenticator'],
          requireMFAForAdmins: true
        });
        
        expect(mfa.enabled).toBe(true);
        expect(mfa.methods).toContain('phone');
        expect(mfa.methods).toContain('authenticator');
      });
    });

    describe('passwordlessAuthentication', () => {
      it('should create passwordless auth configuration', () => {
        const passwordless = azuread.passwordlessAuthentication(['fido2', 'authenticator']);
        
        expect(passwordless.enabled).toBe(true);
        expect(passwordless.methods).toContain('fido2');
        expect(passwordless.methods).toContain('authenticator');
      });
    });

    describe('vmAccessRole', () => {
      it('should return Administrator role', () => {
        const role = azuread.vmAccessRole('Administrator');
        
        expect(role.name).toBe('Virtual Machine Administrator Login');
        expect(role.linuxSudoAccess).toBe(true);
        expect(role.windowsAdminAccess).toBe(true);
      });

      it('should return User role', () => {
        const role = azuread.vmAccessRole('User');
        
        expect(role.name).toBe('Virtual Machine User Login');
        expect(role.linuxSudoAccess).toBe(false);
        expect(role.windowsAdminAccess).toBe(false);
      });
    });

    describe('createAADIntegration', () => {
      it('should create complete AAD integration for Linux', () => {
        const integration = azuread.createAADIntegration('Linux', {
          enableSSHLogin: true,
          enableMFA: true,
          enablePasswordless: true
        });
        
        expect(integration.platform).toBe('Linux');
        expect(integration.features).toHaveProperty('aadLogin');
        expect(integration.features).toHaveProperty('mfa');
      });

      it('should create complete AAD integration for Windows', () => {
        const integration = azuread.createAADIntegration('Windows', {
          enableSSHLogin: true,
          enableConditionalAccess: true
        });
        
        expect(integration.platform).toBe('Windows');
        expect(integration.features).toHaveProperty('aadLogin');
        expect(integration.features).toHaveProperty('conditionalAccess');
      });
    });

    describe('validateAADConfig', () => {
      it('should validate correct configuration', () => {
        const config = {
          platform: 'Linux',
          features: {
            aadLogin: azuread.aadSSHLoginExtension()
          }
        };
        const result = azuread.validateAADConfig(config);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch invalid platform', () => {
        const config = { platform: 'Invalid' };
        const result = azuread.validateAADConfig(config);
        
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================
  // RBAC Tests
  // ===========================
  describe('RBAC', () => {
    describe('assignBuiltInRole', () => {
      it('should assign built-in role', () => {
        const assignment = rbac.assignBuiltInRole(
          'principal-id',
          'Virtual Machine Contributor',
          'resource',
          'vm-name'
        );
        
        expect(assignment.principalId).toBe('principal-id');
        expect(assignment.roleDefinitionId).toBe('9980e02c-c2be-4d73-94e8-173b1dc7cf3c');
      });

      it('should throw error for unknown role', () => {
        expect(() => {
          rbac.assignBuiltInRole('principal-id', 'Unknown Role');
        }).toThrow('Unknown built-in role');
      });
    });

    describe('createCustomRole', () => {
      it('should create custom role definition', () => {
        const roleDefinition = {
          name: 'Custom VM Role',
          description: 'Custom role for VM operations',
          actions: ['Microsoft.Compute/virtualMachines/read'],
          assignableScopes: ['/subscriptions/xxx']
        };
        const role = rbac.createCustomRole(roleDefinition);
        
        expect(role.type).toBe('Microsoft.Authorization/roleDefinitions');
        expect(role.properties.roleName).toBe('Custom VM Role');
        expect(role.properties.permissions[0].actions).toContain('Microsoft.Compute/virtualMachines/read');
      });
    });

    describe('createScope', () => {
      it('should create resource scope', () => {
        const scope = rbac.createScope('resource', 'myVM');
        
        expect(scope).toContain('Microsoft.Compute/virtualMachines');
        expect(scope).toContain('myVM');
      });

      it('should create resource group scope', () => {
        const scope = rbac.createScope('resourceGroup');
        
        expect(scope).toBe('[resourceGroup().id]');
      });

      it('should create subscription scope', () => {
        const scope = rbac.createScope('subscription');
        
        expect(scope).toBe('[subscription().id]');
      });

      it('should throw error for resource scope without name', () => {
        expect(() => {
          rbac.createScope('resource');
        }).toThrow('Resource name is required');
      });
    });

    describe('roleAssignmentTemplate', () => {
      it('should create role assignment template', () => {
        const assignment = {
          principalId: 'principal-id',
          roleDefinitionId: 'role-id',
          scope: '/subscriptions/xxx',
          principalType: 'ServicePrincipal' as const
        };
        const template = rbac.roleAssignmentTemplate(assignment);
        
        expect(template.type).toBe('Microsoft.Authorization/roleAssignments');
        expect(template.properties.principalId).toBe('principal-id');
      });
    });

    describe('recommendRole', () => {
      it('should recommend Reader for read-only actions', () => {
        const recommendation = rbac.recommendRole(['Microsoft.Compute/*/read']);
        
        expect(recommendation.roleName).toBe('Reader');
      });

      it('should recommend VM Contributor for full VM management', () => {
        const recommendation = rbac.recommendRole(['Microsoft.Compute/virtualMachines/*']);
        
        expect(recommendation.roleName).toBe('Virtual Machine Contributor');
      });

      it('should recommend VM User Login for login action', () => {
        const recommendation = rbac.recommendRole(['Microsoft.Compute/virtualMachines/login/action']);
        
        expect(recommendation.roleName).toBe('Virtual Machine User Login');
      });
    });

    describe('customRoleTemplates', () => {
      it('should provide VM Start/Stop role template', () => {
        const role = rbac.customRoleTemplates.vmStartStop();
        
        expect(role.name).toBe('Virtual Machine Start/Stop Operator');
        expect(role.actions).toContain('Microsoft.Compute/virtualMachines/start/action');
        expect(role.actions).toContain('Microsoft.Compute/virtualMachines/powerOff/action');
      });

      it('should provide VM Backup Operator role template', () => {
        const role = rbac.customRoleTemplates.vmBackupOperator();
        
        expect(role.name).toBe('Virtual Machine Backup Operator');
        expect(role.actions.some(a => a.includes('backup'))).toBe(true);
      });

      it('should provide VM Network Config role template', () => {
        const role = rbac.customRoleTemplates.vmNetworkConfig();
        
        expect(role.name).toBe('Virtual Machine Network Configuration');
        expect(role.actions.some(a => a.includes('Network'))).toBe(true);
      });
    });

    describe('validateRBACConfig', () => {
      it('should validate correct configuration', () => {
        const assignment = {
          principalId: 'principal-id',
          roleDefinitionId: 'role-id',
          scope: '/subscriptions/xxx'
        };
        const result = rbac.validateRBACConfig(assignment);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing principal ID', () => {
        const assignment: any = {
          roleDefinitionId: 'role-id',
          scope: '/subscriptions/xxx'
        };
        const result = rbac.validateRBACConfig(assignment);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Principal ID is required');
      });

      it('should warn about Owner role', () => {
        const assignment = {
          principalId: 'principal-id',
          roleDefinitionId: '8e3af657-a8ff-443c-a75c-2fe8c4bcb635', // Owner
          scope: '/subscriptions/xxx'
        };
        const result = rbac.validateRBACConfig(assignment);
        
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    describe('getRBACBestPractices', () => {
      it('should return best practices', () => {
        const practices = rbac.getRBACBestPractices();
        
        expect(practices).toHaveProperty('principles');
        expect(practices).toHaveProperty('recommendations');
        expect(practices).toHaveProperty('antiPatterns');
        expect(practices).toHaveProperty('tools');
      });
    });
  });

  // ===========================
  // Identity Templates Tests
  // ===========================
  describe('Identity Templates', () => {
    it('should have identity templates', () => {
      expect(identityTemplates.length).toBeGreaterThan(0);
    });

    it('should have system-assigned-identity template', () => {
      const template = identityTemplates.find(t => t.name === 'system-assigned-identity');
      expect(template).toBeDefined();
      expect(template?.features.length).toBeGreaterThan(0);
    });

    it('should have aad-ssh-login template', () => {
      const template = identityTemplates.find(t => t.name === 'aad-ssh-login');
      expect(template).toBeDefined();
      expect(template?.description).toContain('SSH');
    });

    it('should have compliance templates', () => {
      const soc2 = identityTemplates.find(t => t.name === 'identity-compliance-soc2');
      const hipaa = identityTemplates.find(t => t.name === 'identity-compliance-hipaa');
      
      expect(soc2).toBeDefined();
      expect(hipaa).toBeDefined();
    });
  });

  // ===========================
  // Handlebars Helpers Tests
  // ===========================
  describe('Handlebars Helpers', () => {
    let helpers: Record<string, (...args: any[]) => any>;

    beforeAll(() => {
      helpers = createIdentityHelpers();
    });

    it('should create identity helpers', () => {
      expect(Object.keys(helpers).length).toBeGreaterThan(0);
    });

    it('should have managed identity helpers', () => {
      expect(helpers['identity:managedidentity.systemAssigned']).toBeDefined();
      expect(helpers['identity:managedidentity.userAssigned']).toBeDefined();
      expect(helpers['identity:managedidentity.multiple']).toBeDefined();
    });

    it('should have Azure AD helpers', () => {
      expect(helpers['identity:azuread.sshLogin']).toBeDefined();
      expect(helpers['identity:azuread.windowsLogin']).toBeDefined();
      expect(helpers['identity:azuread.conditionalAccess']).toBeDefined();
      expect(helpers['identity:azuread.mfa']).toBeDefined();
    });

    it('should have RBAC helpers', () => {
      expect(helpers['identity:rbac.assignBuiltInRole']).toBeDefined();
      expect(helpers['identity:rbac.createCustomRole']).toBeDefined();
      expect(helpers['identity:rbac.scope']).toBeDefined();
    });

    it('should have utility helpers', () => {
      expect(helpers['identity:list']).toBeDefined();
      expect(helpers['identity:template']).toBeDefined();
      expect(helpers['identity:count']).toBeDefined();
    });

    it('should have helper count matching expected', () => {
      // 7 managed identity + 8 Azure AD + 13 RBAC + 5 utility = 33 helpers
      expect(Object.keys(helpers).length).toBe(33);
    });
  });
});
