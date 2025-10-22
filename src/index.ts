/**
 * Virtual Machine Plugin for Azure Marketplace Generator
 * 
 * Provides VM templates, Handlebars helpers, and CLI commands
 * for generating Azure VM marketplace offers.
 * 
 * @packageDocumentation
 */

import { IPlugin, PluginMetadata, TemplateDefinition, PluginContext } from './types';
import { Command } from 'commander';
import * as path from 'path';
import { getNetworkingHelpers } from './networking';
import { createExtensionHelpers } from './extensions';
import { createSecurityHelpers } from './security';
import { createIdentityHelpers } from './identity';

/**
 * Virtual Machine Plugin Configuration
 */
export interface VmPluginOptions {
  /** Default VM size (e.g., Standard_D2s_v3) */
  defaultVmSize?: string;
  /** Include boot diagnostics */
  includeDiagnostics?: boolean;
  /** Create public IP address */
  includePublicIp?: boolean;
  /** Create Network Security Group */
  includeNsg?: boolean;
}

/**
 * VM Plugin Class
 * 
 * Implements IPlugin interface for Azure Marketplace Generator
 */
export class VmPlugin implements IPlugin {
  metadata: PluginMetadata = {
    id: 'vm',
    name: 'Virtual Machine Plugin',
    description: 'Generates Azure Virtual Machine marketplace offers',
    version: '1.3.0',
    author: 'HOME OFFICE IMPROVEMENTS LTD'
  };

  private options: VmPluginOptions;
  private context?: PluginContext;

  constructor(options: VmPluginOptions = {}) {
    this.options = {
      defaultVmSize: options.defaultVmSize || 'Standard_D2s_v3',
      includeDiagnostics: options.includeDiagnostics !== false,
      includePublicIp: options.includePublicIp !== false,
      includeNsg: options.includeNsg !== false
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.logger.info(`Initializing VM Plugin v${this.metadata.version}`);
    context.logger.debug('VM Plugin options:', this.options);
  }

  /**
   * Cleanup plugin resources
   */
  async cleanup(): Promise<void> {
    if (this.context) {
      this.context.logger.info('Cleaning up VM Plugin');
    }
  }

  /**
   * Get template definitions
   */
  getTemplates(): TemplateDefinition[] {
    const templatesDir = path.join(__dirname, '../templates');
    
    return [
      {
        type: 'vm',
        name: 'Virtual Machine',
        description: 'Azure Virtual Machine with networking and storage',
        version: '1.0.0',
        templatePath: templatesDir,
        files: {
          mainTemplate: 'mainTemplate.json.hbs',
          createUiDefinition: 'createUiDefinition.json.hbs',
          viewDefinition: 'viewDefinition.json.hbs'
        },
        parameters: {
          vmSize: {
            type: 'string',
            defaultValue: this.options.defaultVmSize,
            metadata: {
              description: 'Size of the virtual machine'
            }
          },
          adminUsername: {
            type: 'string',
            metadata: {
              description: 'Admin username for the VM'
            }
          },
          authenticationType: {
            type: 'string',
            defaultValue: 'sshPublicKey',
            allowedValues: ['sshPublicKey', 'password'],
            metadata: {
              description: 'Type of authentication to use'
            }
          }
        }
      }
    ];
  }

  /**
   * Get Handlebars helpers
   */
  getHandlebarsHelpers(): Record<string, (...args: any[]) => any> {
    // Get networking helpers with net: namespace
    const networkingHelpers = getNetworkingHelpers();
    
    // Get extension helpers with ext: namespace
    const extensionHelpers = createExtensionHelpers();
    
    // Get security helpers with security: namespace
    const securityHelpers = createSecurityHelpers();
    
    // Get identity helpers with identity: namespace
    const identityHelpers = createIdentityHelpers();
    
    // Combine VM helpers with networking, extension, security, and identity helpers
    const vmHelpers = {
      /**
       * Format VM size with description
       */
      'vm-size': (size: string): string => {
        const sizeDescriptions: Record<string, string> = {
          'Standard_D2s_v3': 'General purpose - 2 vCPUs, 8 GB RAM',
          'Standard_D4s_v3': 'General purpose - 4 vCPUs, 16 GB RAM',
          'Standard_D8s_v3': 'General purpose - 8 vCPUs, 32 GB RAM',
          'Standard_F2s_v2': 'Compute optimized - 2 vCPUs, 4 GB RAM',
          'Standard_F4s_v2': 'Compute optimized - 4 vCPUs, 8 GB RAM',
          'Standard_E2s_v3': 'Memory optimized - 2 vCPUs, 16 GB RAM',
          'Standard_E4s_v3': 'Memory optimized - 4 vCPUs, 32 GB RAM'
        };
        return sizeDescriptions[size] || size;
      },

      /**
       * Get VM image reference
       */
      'vm-image': (publisher: string, offer: string, sku: string): string => {
        return JSON.stringify({
          publisher,
          offer,
          sku,
          version: 'latest'
        });
      },

      /**
       * Generate VM resource name
       */
      'vm-resource-name': (baseName: string, suffix: string): string => {
        return `${baseName}-${suffix}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      }
    };

    // Return combined helpers (VM + Networking + Extensions + Security + Identity)
    return {
      ...vmHelpers,
      ...networkingHelpers,
      ...extensionHelpers,
      ...securityHelpers,
      ...identityHelpers
    };
  }

  /**
   * Register CLI commands
   */
  registerCommands(program: Command): void {
    // ========================================
    // VM Commands
    // ========================================
    const vmCommand = program
      .command('vm')
      .description('Virtual Machine commands');

    vmCommand
      .command('list-sizes')
      .description('List available VM sizes for a location')
      .option('-l, --location <location>', 'Azure location', 'eastus')
      .action((options) => {
        if (this.context) {
          this.context.logger.info(`Listing VM sizes for location: ${options.location}`);
          // TODO: Implement actual Azure API call
          this.context.logger.info('Standard_D2s_v3, Standard_D4s_v3, Standard_D8s_v3...');
        }
      });

    vmCommand
      .command('list-images')
      .description('List available VM images')
      .option('-p, --publisher <publisher>', 'Image publisher', 'Canonical')
      .action((options) => {
        if (this.context) {
          this.context.logger.info(`Listing images for publisher: ${options.publisher}`);
          // TODO: Implement actual Azure API call
          this.context.logger.info('Ubuntu 22.04-LTS, Ubuntu 20.04-LTS...');
        }
      });

    // ========================================
    // Networking Commands (Top-Level)
    // ========================================

    // VNet Commands
    const vnetCommand = program
      .command('vnet')
      .description('Virtual Network operations');

    vnetCommand
      .command('list-templates')
      .description('List available VNet template types')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available VNet templates:');
          this.context.logger.info('  - single-tier: Single subnet VNet for simple deployments');
          this.context.logger.info('  - multi-tier: Multi-tier VNet with web, app, and data subnets');
          this.context.logger.info('  - hub-spoke: Hub VNet for hub-spoke topology');
          this.context.logger.info('  - spoke: Spoke VNet for hub-spoke topology');
          this.context.logger.info('  - peered: VNet with peering configuration');
        }
      });

    vnetCommand
      .command('create-template')
      .description('Generate VNet ARM template configuration')
      .option('-t, --type <type>', 'VNet template type', 'single-tier')
      .option('-n, --name <name>', 'VNet name', 'myVNet')
      .option('-a, --address <address>', 'Address space (CIDR)', '10.0.0.0/16')
      .action((options) => {
        if (this.context) {
          this.context.logger.info(`Creating VNet template: ${options.type}`);
          this.context.logger.info(`  Name: ${options.name}`);
          this.context.logger.info(`  Address space: ${options.address}`);
          // Template would be generated using net:vnet.template helper
        }
      });

    // Subnet Commands
    const subnetCommand = program
      .command('subnet')
      .description('Subnet operations');

    subnetCommand
      .command('list-templates')
      .description('List available subnet template types')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available subnet templates:');
          this.context.logger.info('  - web: Web tier subnet (default: /24)');
          this.context.logger.info('  - app: Application tier subnet (default: /24)');
          this.context.logger.info('  - data: Data tier subnet (default: /24)');
          this.context.logger.info('  - gateway: Gateway subnet (default: /27)');
          this.context.logger.info('  - bastion: Azure Bastion subnet (default: /26)');
        }
      });

    // NSG Commands
    const nsgCommand = program
      .command('nsg')
      .description('Network Security Group operations');

    nsgCommand
      .command('list-templates')
      .description('List available NSG rule templates')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available NSG rule templates:');
          this.context.logger.info('  - web: HTTP/HTTPS access (ports 80, 443)');
          this.context.logger.info('  - ssh: SSH access (port 22)');
          this.context.logger.info('  - rdp: RDP access (port 3389)');
          this.context.logger.info('  - database: Database access (ports 1433, 3306, 5432)');
          this.context.logger.info('  - deny-all: Deny all inbound traffic');
        }
      });

    nsgCommand
      .command('create-rule')
      .description('Generate NSG rule configuration')
      .option('-t, --type <type>', 'Rule template type', 'web')
      .option('-p, --priority <priority>', 'Rule priority', '100')
      .option('-s, --source <source>', 'Source address prefix', '*')
      .action((options) => {
        if (this.context) {
          this.context.logger.info(`Creating NSG rule: ${options.type}`);
          this.context.logger.info(`  Priority: ${options.priority}`);
          this.context.logger.info(`  Source: ${options.source}`);
          // Rule would be generated using net:nsg.rule helper
        }
      });

    // Load Balancer Commands
    const lbCommand = program
      .command('lb')
      .description('Load Balancer operations');

    lbCommand
      .command('list-templates')
      .description('List available load balancer template types')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available load balancer templates:');
          this.context.logger.info('  - public-web: Public LB for web traffic (ports 80, 443)');
          this.context.logger.info('  - internal-app: Internal LB for app tier');
          this.context.logger.info('  - internal-database: Internal LB for database tier');
          this.context.logger.info('  - internal-ha-ports: Internal LB with HA ports');
          this.context.logger.info('  - public-jumpbox: Public LB for jumpbox access');
        }
      });

    // Application Gateway Commands
    const appgwCommand = program
      .command('appgw')
      .description('Application Gateway operations');

    appgwCommand
      .command('list-templates')
      .description('List available Application Gateway template types')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available Application Gateway templates:');
          this.context.logger.info('  - basic-web: Basic web application gateway');
          this.context.logger.info('  - waf-enabled: WAF-enabled for enhanced security');
          this.context.logger.info('  - multi-site: Multi-site hosting configuration');
          this.context.logger.info('  - high-security: High-security with SSL policies');
        }
      });

    // Bastion Commands
    const bastionCommand = program
      .command('bastion')
      .description('Azure Bastion operations');

    bastionCommand
      .command('list-skus')
      .description('List available Bastion SKUs')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available Bastion SKUs:');
          this.context.logger.info('  - basic: Basic SKU (2 scale units)');
          this.context.logger.info('  - standard: Standard SKU (2-50 scale units)');
          this.context.logger.info('  - premium: Premium SKU with advanced features');
        }
      });

    // Peering Commands
    const peeringCommand = program
      .command('peering')
      .description('VNet Peering operations');

    peeringCommand
      .command('list-topologies')
      .description('List available peering topology templates')
      .action(() => {
        if (this.context) {
          this.context.logger.info('Available peering topologies:');
          this.context.logger.info('  - hub-vnet: Hub VNet in hub-spoke topology');
          this.context.logger.info('  - spoke-vnet: Spoke VNet in hub-spoke topology');
          this.context.logger.info('  - mesh-vnet: VNet in mesh topology');
          this.context.logger.info('  - point-to-point: Direct VNet-to-VNet peering');
          this.context.logger.info('  - transit-vnet: Transit VNet for routing');
        }
      });

    // ========================================
    // Extension Commands
    // ========================================
    const extCommand = program
      .command('ext')
      .description('VM Extension commands');

    extCommand
      .command('list')
      .description('List all available VM extensions')
      .option('-c, --category <category>', 'Filter by category (windows, linux, crossplatform)')
      .action((options) => {
        if (!this.context) return;
        
        const { extensionsCatalog } = require('./extensions');
        let extensions = extensionsCatalog;
        
        if (options.category) {
          extensions = extensions.filter((ext: any) => ext.category === options.category);
        }
        
        this.context.logger.info(`Available VM Extensions (${extensions.length}):`);
        extensions.forEach((ext: any) => {
          this.context!.logger.info(`  - ${ext.displayName} (${ext.platform})`);
          this.context!.logger.info(`    ${ext.description}`);
          this.context!.logger.info(`    Publisher: ${ext.publisher}, Type: ${ext.type}, Version: ${ext.version}`);
          this.context!.logger.info(`    Priority: ${ext.priority}`);
        });
      });

    extCommand
      .command('list-windows')
      .description('List Windows-specific extensions')
      .action(() => {
        if (!this.context) return;
        
        const { extensionsCatalog } = require('./extensions');
        const extensions = extensionsCatalog.filter((ext: any) => ext.category === 'windows');
        
        this.context.logger.info(`Windows VM Extensions (${extensions.length}):`);
        extensions.forEach((ext: any) => {
          this.context!.logger.info(`  - ${ext.displayName}: ${ext.description}`);
        });
      });

    extCommand
      .command('list-linux')
      .description('List Linux-specific extensions')
      .action(() => {
        if (!this.context) return;
        
        const { extensionsCatalog } = require('./extensions');
        const extensions = extensionsCatalog.filter((ext: any) => ext.category === 'linux');
        
        this.context.logger.info(`Linux VM Extensions (${extensions.length}):`);
        extensions.forEach((ext: any) => {
          this.context!.logger.info(`  - ${ext.displayName}: ${ext.description}`);
        });
      });

    extCommand
      .command('list-crossplatform')
      .description('List cross-platform extensions')
      .action(() => {
        if (!this.context) return;
        
        const { extensionsCatalog } = require('./extensions');
        const extensions = extensionsCatalog.filter((ext: any) => ext.category === 'crossplatform');
        
        this.context.logger.info(`Cross-Platform VM Extensions (${extensions.length}):`);
        extensions.forEach((ext: any) => {
          this.context!.logger.info(`  - ${ext.displayName} (${ext.platform}): ${ext.description}`);
        });
      });

    // ========================================
    // Security Commands
    // ========================================
    const securityCommand = program
      .command('security')
      .description('VM Security commands');

    securityCommand
      .command('list')
      .description('List all available security templates')
      .action(() => {
        if (!this.context) return;
        
        const { securityTemplates } = require('./security');
        
        this.context.logger.info(`Available Security Templates (${securityTemplates.length}):`);
        securityTemplates.forEach((template: any, index: number) => {
          this.context!.logger.info(`\n${index + 1}. ${template.name}`);
          this.context!.logger.info(`   Description: ${template.description}`);
          this.context!.logger.info(`   Features: ${template.features.join(', ')}`);
        });
      });

    securityCommand
      .command('list-encryption')
      .description('List encryption options')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Encryption Options:');
        this.context.logger.info('\n1. Azure Disk Encryption (ADE)');
        this.context.logger.info('   - BitLocker (Windows) / dm-crypt (Linux)');
        this.context.logger.info('   - Key Vault integration');
        this.context.logger.info('\n2. Server-Side Encryption (SSE)');
        this.context.logger.info('   - Platform-managed keys (PMK)');
        this.context.logger.info('   - Customer-managed keys (CMK)');
        this.context.logger.info('\n3. Encryption at Host');
        this.context.logger.info('   - VM host-level encryption');
        this.context.logger.info('   - Temp disk and cache encryption');
      });

    securityCommand
      .command('list-trusted-launch')
      .description('List Trusted Launch features')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Trusted Launch Features:');
        this.context.logger.info('\n1. Secure Boot');
        this.context.logger.info('   - Boot integrity protection');
        this.context.logger.info('   - Prevent malicious bootloaders');
        this.context.logger.info('\n2. vTPM (Virtual Trusted Platform Module)');
        this.context.logger.info('   - Hardware security module');
        this.context.logger.info('   - Key storage and attestation');
        this.context.logger.info('\n3. Boot Integrity Monitoring');
        this.context.logger.info('   - Azure Security Center integration');
        this.context.logger.info('   - Continuous monitoring');
        this.context.logger.info('\n4. Guest Attestation');
        this.context.logger.info('   - Runtime attestation');
        this.context.logger.info('   - Security policy enforcement');
        this.context.logger.info('\n5. Measured Boot');
        this.context.logger.info('   - Boot chain measurements');
        this.context.logger.info('   - TPM-based validation');
      });

    securityCommand
      .command('list-compliance')
      .description('List compliance frameworks')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Compliance Frameworks:');
        this.context.logger.info('\n1. SOC2');
        this.context.logger.info('2. HIPAA');
        this.context.logger.info('3. ISO 27001');
        this.context.logger.info('4. FedRAMP');
        this.context.logger.info('5. PCI-DSS');
        this.context.logger.info('6. GDPR');
      });

    // ========================================
    // Identity Commands
    // ========================================
    const identityCommand = program
      .command('identity')
      .description('Identity and Access commands');

    identityCommand
      .command('list')
      .description('List all available identity templates')
      .action(() => {
        if (!this.context) return;
        
        const { identityTemplates } = require('./identity');
        
        this.context.logger.info(`Available Identity Templates (${identityTemplates.length}):`);
        identityTemplates.forEach((template: any, index: number) => {
          this.context!.logger.info(`\n${index + 1}. ${template.name}`);
          this.context!.logger.info(`   Description: ${template.description}`);
          this.context!.logger.info(`   Features: ${template.features.join(', ')}`);
        });
      });

    identityCommand
      .command('list-managed-identity')
      .description('List managed identity options')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Managed Identity Options:');
        this.context.logger.info('\n1. System-Assigned Identity');
        this.context.logger.info('   - Automatic lifecycle management');
        this.context.logger.info('   - Tied to VM lifecycle');
        this.context.logger.info('\n2. User-Assigned Identity');
        this.context.logger.info('   - Independent lifecycle');
        this.context.logger.info('   - Shared across resources');
        this.context.logger.info('\n3. Multiple Identities (Hybrid)');
        this.context.logger.info('   - Both system and user-assigned');
        this.context.logger.info('   - Maximum flexibility');
      });

    identityCommand
      .command('list-aad-features')
      .description('List Azure AD integration features')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Azure AD Integration Features:');
        this.context.logger.info('\n1. AAD SSH Login (Linux)');
        this.context.logger.info('   - SSH with Azure AD credentials');
        this.context.logger.info('   - Passwordless authentication');
        this.context.logger.info('\n2. AAD RDP Login (Windows)');
        this.context.logger.info('   - RDP with Azure AD credentials');
        this.context.logger.info('   - Windows Hello support');
        this.context.logger.info('\n3. Conditional Access');
        this.context.logger.info('   - Location-based policies');
        this.context.logger.info('   - Device compliance checks');
        this.context.logger.info('\n4. Multi-Factor Authentication');
        this.context.logger.info('   - Phone, email, authenticator app');
        this.context.logger.info('   - FIDO2 security keys');
      });

    identityCommand
      .command('list-rbac-roles')
      .description('List built-in RBAC roles for VMs')
      .action(() => {
        if (!this.context) return;
        
        this.context.logger.info('Built-in RBAC Roles for Virtual Machines:');
        this.context.logger.info('\n1. Virtual Machine Contributor');
        this.context.logger.info('   - Full VM management');
        this.context.logger.info('\n2. Virtual Machine Administrator Login');
        this.context.logger.info('   - Admin SSH/RDP access');
        this.context.logger.info('\n3. Virtual Machine User Login');
        this.context.logger.info('   - Standard user SSH/RDP access');
        this.context.logger.info('\n4. Reader');
        this.context.logger.info('   - Read-only access');
        this.context.logger.info('\n5. Contributor');
        this.context.logger.info('   - Full management (all resources)');
      });
  }
}

/**
 * Default export - plugin instance
 */
export default VmPlugin;
