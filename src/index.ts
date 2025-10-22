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
    version: '1.0.0',
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
    return {
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
  }

  /**
   * Register CLI commands
   */
  registerCommands(program: Command): void {
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
  }
}

/**
 * Default export - plugin instance
 */
export default VmPlugin;
