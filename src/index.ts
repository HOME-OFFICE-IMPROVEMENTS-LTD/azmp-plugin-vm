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
    version: '1.2.0',
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
    
    // Combine VM helpers with networking helpers
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

    // Return combined helpers (VM + Networking)
    return {
      ...vmHelpers,
      ...networkingHelpers
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
    // Networking Commands
    // ========================================
    const networkCommand = program
      .command('network')
      .description('Networking commands for VNets, subnets, NSGs, and load balancers');

    // VNet Commands
    const vnetCommand = networkCommand
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
    const subnetCommand = networkCommand
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
    const nsgCommand = networkCommand
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
    const lbCommand = networkCommand
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
    const appgwCommand = networkCommand
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
    const bastionCommand = networkCommand
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
    const peeringCommand = networkCommand
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
  }
}

/**
 * Default export - plugin instance
 */
export default VmPlugin;
