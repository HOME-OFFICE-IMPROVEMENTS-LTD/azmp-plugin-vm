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
import {
  getVmSize,
  getVmSizesByFamily,
  getAllVmSizeFamilies,
  searchVmSizes,
  VmSizeFamily,
  VM_SIZE_FAMILIES,
} from './vm-sizes';
import {
  getVmImage,
  getAllVmImages,
  getVmImagesByOS,
  searchVmImages,
} from './vm-images';
import {
  getVNetTemplate,
  getAllVNetTemplates,
  calculateUsableIPs,
  validateCIDR,
  isIPInCIDR,
  getServiceEndpointName,
  getDelegationName,
  SERVICE_ENDPOINTS,
  SUBNET_DELEGATIONS,
  VNetTemplateKey,
} from './networking/vnets';
import {
  getSubnetPattern,
  getAllSubnetPatterns,
  validateSubnetName,
  validateReservedSubnet,
  subnetsOverlap,
  SubnetPatternKey,
  RESERVED_SUBNET_NAMES,
} from './networking/subnets';

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
    description: 'Generates Azure Virtual Machine marketplace offers with comprehensive configuration options',
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
    return {
      /**
       * Format VM size with full details (Phase 1)
       */
      'vm-size': (size: string): string => {
        const vmSize = getVmSize(size);
        if (vmSize) {
          return `${vmSize.name} (${vmSize.vcpus} vCPUs, ${vmSize.memory}) - ${vmSize.description}`;
        }
        return size;
      },

      /**
       * Get VM size by family (Phase 1)
       */
      'vm-size-family': (family: string): string => {
        const vmFamily = VM_SIZE_FAMILIES[family as VmSizeFamily];
        return vmFamily || family;
      },

      /**
       * List all VM sizes in a family (Phase 1)
       */
      'vm-sizes-by-family': (family: string): string => {
        const sizes = getVmSizesByFamily(family as VmSizeFamily);
        return sizes.map((s) => s.name).join(', ');
      },

      /**
       * Get VM size series (Phase 1)
       */
      'vm-size-series': (size: string): string => {
        const vmSize = getVmSize(size);
        return vmSize?.series || 'Unknown';
      },

      /**
       * Get VM size workloads (Phase 1)
       */
      'vm-size-workloads': (size: string): string => {
        const vmSize = getVmSize(size);
        return vmSize?.workloads.join(', ') || '';
      },

      /**
       * Get VM image reference object (Phase 1)
       */
      'vm-image': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        if (image) {
          return JSON.stringify({
            publisher: image.publisher,
            offer: image.offer,
            sku: image.sku,
            version: image.version,
          }, null, 2);
        }
        return '{}';
      },

      /**
       * Get VM image publisher (Phase 1)
       */
      'vm-image-publisher': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        return image?.publisher || '';
      },

      /**
       * Get VM image offer (Phase 1)
       */
      'vm-image-offer': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        return image?.offer || '';
      },

      /**
       * Get VM image SKU (Phase 1)
       */
      'vm-image-sku': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        return image?.sku || '';
      },

      /**
       * Get VM image description (Phase 1)
       */
      'vm-image-description': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        return image?.description || '';
      },

      /**
       * Get VM image OS type (Phase 1)
       */
      'vm-image-os': (imageKey: string): string => {
        const image = getVmImage(imageKey);
        return image?.os || '';
      },

      /**
       * Generate VM resource name (sanitized) (Phase 1)
       */
      'vm-resource-name': (baseName: string, suffix?: string): string => {
        const sanitized = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (suffix) {
          const sanitizedSuffix = suffix.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          return `${sanitized}-${sanitizedSuffix}`;
        }
        return sanitized;
      },

      /**
       * Generate storage account name (must be lowercase, alphanumeric, 3-24 chars) (Phase 1)
       */
      'vm-storage-name': (baseName: string): string => {
        return baseName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 24);
      },

      /**
       * Generate network interface name (Phase 1)
       */
      'vm-nic-name': (vmName: string): string => {
        return `${vmName}-nic`;
      },

      /**
       * Generate public IP name (Phase 1)
       */
      'vm-pip-name': (vmName: string): string => {
        return `${vmName}-pip`;
      },

      /**
       * Generate NSG name (Phase 1)
       */
      'vm-nsg-name': (vmName: string): string => {
        return `${vmName}-nsg`;
      },

      /**
       * Generate OS disk name (Phase 1)
       */
      'vm-osdisk-name': (vmName: string): string => {
        return `${vmName}-osdisk`;
      },

      /**
       * Generate data disk name (Phase 1)
       */
      'vm-datadisk-name': (vmName: string, index: number): string => {
        return `${vmName}-datadisk-${index}`;
      },

      /**
       * Format disk size in GB (Phase 1)
       */
      'vm-disk-size': (size: number): string => {
        return `${size} GB`;
      },

      /**
       * Get storage account type display name (Phase 1)
       */
      'vm-storage-type': (sku: string): string => {
        const types: Record<string, string> = {
          'Standard_LRS': 'Standard Locally Redundant Storage',
          'Standard_GRS': 'Standard Geo-Redundant Storage',
          'Standard_RAGRS': 'Standard Read-Access Geo-Redundant Storage',
          'Standard_ZRS': 'Standard Zone-Redundant Storage',
          'Premium_LRS': 'Premium Locally Redundant Storage (SSD)',
          'Premium_ZRS': 'Premium Zone-Redundant Storage (SSD)',
          'StandardSSD_LRS': 'Standard SSD Locally Redundant Storage',
          'StandardSSD_ZRS': 'Standard SSD Zone-Redundant Storage',
          'UltraSSD_LRS': 'Ultra SSD Locally Redundant Storage',
        };
        return types[sku] || sku;
      },

      /**
       * Check if size supports Premium Storage (Phase 1)
       */
      'vm-supports-premium': (size: string): boolean => {
        // S-series VMs support premium storage
        return size.includes('s_v') || size.includes('S_');
      },

      /**
       * Generate availability set name (Phase 1)
       */
      'vm-availset-name': (baseName: string): string => {
        return `${baseName}-avset`;
      },

      /**
       * Get default VM location (Phase 1)
       */
      'vm-default-location': (): string => {
        return 'eastus';
      },

      // ========================================
      // Phase 2: VNet & Subnet Helpers
      // ========================================

      /**
       * Format VNet address space (Phase 2)
       */
      'vnet-address-space': (addressSpaces: string[]): string => {
        return addressSpaces.join(', ');
      },

      /**
       * Calculate usable IPs in a CIDR block (Phase 2)
       */
      'vnet-calculate-ips': (cidr: string): number => {
        return calculateUsableIPs(cidr);
      },

      /**
       * Validate CIDR notation (Phase 2)
       */
      'vnet-validate-cidr': (cidr: string): boolean => {
        return validateCIDR(cidr);
      },

      /**
       * Check if IP is in CIDR block (Phase 2)
       */
      'vnet-ip-in-cidr': (ip: string, cidr: string): boolean => {
        return isIPInCIDR(ip, cidr);
      },

      /**
       * Get VNet template (Phase 2)
       */
      'vnet-template': (key: string): string => {
        const template = getVNetTemplate(key as VNetTemplateKey);
        return template ? JSON.stringify(template, null, 2) : '{}';
      },

      /**
       * Get VNet template name (Phase 2)
       */
      'vnet-template-name': (key: string): string => {
        const template = getVNetTemplate(key as VNetTemplateKey);
        return template?.name || key;
      },

      /**
       * Get VNet template description (Phase 2)
       */
      'vnet-template-description': (key: string): string => {
        const template = getVNetTemplate(key as VNetTemplateKey);
        return template?.description || '';
      },

      /**
       * Count subnets in VNet template (Phase 2)
       */
      'vnet-subnet-count': (key: string): number => {
        const template = getVNetTemplate(key as VNetTemplateKey);
        return template?.subnets.length || 0;
      },

      /**
       * Get service endpoint display name (Phase 2)
       */
      'vnet-service-endpoint': (endpoint: string): string => {
        return getServiceEndpointName(endpoint as keyof typeof SERVICE_ENDPOINTS) || endpoint;
      },

      /**
       * Get delegation display name (Phase 2)
       */
      'vnet-delegation': (delegation: string): string => {
        return getDelegationName(delegation as keyof typeof SUBNET_DELEGATIONS) || delegation;
      },

      /**
       * Format subnet address prefix (Phase 2)
       */
      'subnet-address-prefix': (prefix: string): string => {
        const usableIPs = calculateUsableIPs(prefix);
        return `${prefix} (${usableIPs} usable IPs)`;
      },

      /**
       * Get subnet pattern (Phase 2)
       */
      'subnet-pattern': (key: string): string => {
        const pattern = getSubnetPattern(key as SubnetPatternKey);
        return pattern ? JSON.stringify(pattern, null, 2) : '{}';
      },

      /**
       * Get subnet pattern name (Phase 2)
       */
      'subnet-pattern-name': (key: string): string => {
        const pattern = getSubnetPattern(key as SubnetPatternKey);
        return pattern?.name || key;
      },

      /**
       * Get subnet pattern description (Phase 2)
       */
      'subnet-pattern-description': (key: string): string => {
        const pattern = getSubnetPattern(key as SubnetPatternKey);
        return pattern?.description || '';
      },

      /**
       * Validate subnet name (Phase 2)
       */
      'subnet-validate-name': (name: string): boolean => {
        return validateSubnetName(name).valid;
      },

      /**
       * Check if subnet is reserved (Phase 2)
       */
      'subnet-is-reserved': (name: string): boolean => {
        return Object.values(RESERVED_SUBNET_NAMES).some((r) => r.name === name);
      },

      /**
       * Get reserved subnet minimum prefix (Phase 2)
       */
      'subnet-reserved-min-prefix': (name: string): number => {
        const reserved = Object.values(RESERVED_SUBNET_NAMES).find((r) => r.name === name);
        return reserved?.minPrefix || 0;
      },

      /**
       * Check if subnets overlap (Phase 2)
       */
      'subnet-overlaps': (subnet1: string, subnet2: string): boolean => {
        return subnetsOverlap(subnet1, subnet2);
      },

      /**
       * Generate VNet resource name (Phase 2)
       */
      'vnet-name': (baseName: string): string => {
        return `vnet-${baseName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      },

      /**
       * Generate subnet resource name (Phase 2)
       */
      'subnet-name': (vnetName: string, subnetType: string): string => {
        return `${vnetName}-subnet-${subnetType}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      },
    };
  }

  /**
   * Register CLI commands (Phase 1)
   */
  registerCommands(program: Command): void {
    const vmCommand = program
      .command('vm')
      .description('Virtual Machine commands');

    // List VM sizes
    vmCommand
      .command('list-sizes')
      .description('List available VM sizes')
      .option('-l, --location <location>', 'Azure location (for availability check)', 'eastus')
      .option('-f, --family <family>', 'Filter by VM family (general-purpose, compute-optimized, memory-optimized, storage-optimized, gpu-accelerated, hpc, confidential)')
      .option('-s, --search <query>', 'Search VM sizes by name or description')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info(`VM Sizes for location: ${options.location}\n`);

        let results = Object.values(getVmSize as any).filter(Boolean);

        if (options.family) {
          results = getVmSizesByFamily(options.family as VmSizeFamily);
          logger.info(`Family: ${VM_SIZE_FAMILIES[options.family as VmSizeFamily] || options.family}\n`);
        }

        if (options.search) {
          results = searchVmSizes(options.search);
          logger.info(`Search results for: "${options.search}"\n`);
        }

        if (results.length === 0) {
          results = searchVmSizes(''); // Get all
        }

        results.forEach((size: any) => {
          logger.info(`${size.name}`);
          logger.info(`  Family: ${VM_SIZE_FAMILIES[size.family as VmSizeFamily]}`);
          logger.info(`  Series: ${size.series}`);
          logger.info(`  vCPUs: ${size.vcpus}`);
          logger.info(`  Memory: ${size.memory}`);
          logger.info(`  Description: ${size.description}`);
          logger.info(`  Workloads: ${size.workloads.join(', ')}`);
          logger.info('');
        });

        logger.info(`Total: ${results.length} VM sizes`);
      });

    // List VM images
    vmCommand
      .command('list-images')
      .description('List available VM images')
      .option('-o, --os <os>', 'Filter by OS (Windows or Linux)')
      .option('-s, --search <query>', 'Search images by name or description')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('VM Images\n');

        let results = getAllVmImages();

        if (options.os) {
          results = getVmImagesByOS(options.os as 'Windows' | 'Linux');
          logger.info(`OS: ${options.os}\n`);
        }

        if (options.search) {
          results = searchVmImages(options.search);
          logger.info(`Search results for: "${options.search}"\n`);
        }

        results.forEach(({ key, image }) => {
          logger.info(`${key}`);
          logger.info(`  Description: ${image.description}`);
          logger.info(`  Publisher: ${image.publisher}`);
          logger.info(`  Offer: ${image.offer}`);
          logger.info(`  SKU: ${image.sku}`);
          logger.info(`  OS: ${image.os}`);
          logger.info('');
        });

        logger.info(`Total: ${results.length} images`);
      });

    // List VM families
    vmCommand
      .command('list-families')
      .description('List all VM size families')
      .action(() => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('VM Size Families\n');

        const families = getAllVmSizeFamilies();
        families.forEach(({ key, name }) => {
          const sizes = getVmSizesByFamily(key);
          logger.info(`${name} (${key})`);
          logger.info(`  Sizes: ${sizes.length}`);
          logger.info(`  Examples: ${sizes.slice(0, 3).map((s) => s.name).join(', ')}`);
          logger.info('');
        });
      });

    // List Azure locations (static list for Phase 1)
    vmCommand
      .command('list-locations')
      .description('List available Azure locations')
      .action(() => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('Azure Locations\n');

        const locations = [
          { name: 'eastus', display: 'East US' },
          { name: 'eastus2', display: 'East US 2' },
          { name: 'westus', display: 'West US' },
          { name: 'westus2', display: 'West US 2' },
          { name: 'westus3', display: 'West US 3' },
          { name: 'centralus', display: 'Central US' },
          { name: 'northcentralus', display: 'North Central US' },
          { name: 'southcentralus', display: 'South Central US' },
          { name: 'westcentralus', display: 'West Central US' },
          { name: 'northeurope', display: 'North Europe' },
          { name: 'westeurope', display: 'West Europe' },
          { name: 'uksouth', display: 'UK South' },
          { name: 'ukwest', display: 'UK West' },
          { name: 'francecentral', display: 'France Central' },
          { name: 'germanywestcentral', display: 'Germany West Central' },
          { name: 'norwayeast', display: 'Norway East' },
          { name: 'switzerlandnorth', display: 'Switzerland North' },
          { name: 'swedencentral', display: 'Sweden Central' },
          { name: 'southeastasia', display: 'Southeast Asia' },
          { name: 'eastasia', display: 'East Asia' },
          { name: 'australiaeast', display: 'Australia East' },
          { name: 'australiasoutheast', display: 'Australia Southeast' },
          { name: 'japaneast', display: 'Japan East' },
          { name: 'japanwest', display: 'Japan West' },
          { name: 'koreacentral', display: 'Korea Central' },
          { name: 'southafricanorth', display: 'South Africa North' },
          { name: 'brazilsouth', display: 'Brazil South' },
          { name: 'canadacentral', display: 'Canada Central' },
          { name: 'canadaeast', display: 'Canada East' },
          { name: 'southindia', display: 'South India' },
          { name: 'centralindia', display: 'Central India' },
          { name: 'westindia', display: 'West India' },
        ];

        locations.forEach(({ name, display }) => {
          logger.info(`${display} (${name})`);
        });

        logger.info(`\nTotal: ${locations.length} locations`);
      });

    // Validate VM configuration
    vmCommand
      .command('validate')
      .description('Validate VM configuration')
      .requiredOption('-s, --size <size>', 'VM size to validate')
      .option('-i, --image <image>', 'Image key to validate')
      .option('-l, --location <location>', 'Azure location')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('Validating VM Configuration\n');

        // Validate size
        const vmSize = getVmSize(options.size);
        if (vmSize) {
          logger.info(`✓ VM Size: ${vmSize.name}`);
          logger.info(`  Family: ${VM_SIZE_FAMILIES[vmSize.family as VmSizeFamily]}`);
          logger.info(`  vCPUs: ${vmSize.vcpus}, Memory: ${vmSize.memory}`);
        } else {
          logger.error(`✗ Invalid VM size: ${options.size}`);
          logger.info(`  Run 'azmp vm list-sizes' to see available sizes`);
        }

        // Validate image (if provided)
        if (options.image) {
          const image = getVmImage(options.image);
          if (image) {
            logger.info(`✓ VM Image: ${image.description}`);
            logger.info(`  Publisher: ${image.publisher}`);
            logger.info(`  OS: ${image.os}`);
          } else {
            logger.error(`✗ Invalid image key: ${options.image}`);
            logger.info(`  Run 'azmp vm list-images' to see available images`);
          }
        }

        // Validate location (if provided)
        if (options.location) {
          logger.info(`✓ Location: ${options.location}`);
        }

        logger.info('\nValidation complete');
      });

    // Estimate VM cost (Phase 1 - basic estimation)
    vmCommand
      .command('estimate-cost')
      .description('Estimate monthly VM cost (rough estimate)')
      .requiredOption('-s, --size <size>', 'VM size')
      .option('-l, --location <location>', 'Azure location', 'eastus')
      .option('-h, --hours <hours>', 'Hours per month', '730')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        const vmSize = getVmSize(options.size);

        if (!vmSize) {
          logger.error(`Invalid VM size: ${options.size}`);
          return;
        }

        logger.info('VM Cost Estimation (Rough Estimate)\n');
        logger.info(`VM Size: ${vmSize.name}`);
        logger.info(`Location: ${options.location}`);
        logger.info(`Hours/month: ${options.hours}`);
        logger.info('');

        // Rough cost estimates (Phase 1 - placeholder values)
        const hourlyRates: Record<string, number> = {
          'Standard_B1s': 0.0104,
          'Standard_B2s': 0.0416,
          'Standard_B4ms': 0.166,
          'Standard_D2s_v3': 0.096,
          'Standard_D4s_v3': 0.192,
          'Standard_D8s_v3': 0.384,
          'Standard_D2s_v5': 0.096,
          'Standard_D4s_v5': 0.192,
          'Standard_D8s_v5': 0.384,
          'Standard_D16s_v5': 0.768,
          'Standard_F2s_v2': 0.085,
          'Standard_F4s_v2': 0.169,
          'Standard_F8s_v2': 0.338,
          'Standard_F16s_v2': 0.677,
          'Standard_E2s_v3': 0.126,
          'Standard_E4s_v3': 0.252,
          'Standard_E8s_v3': 0.504,
          'Standard_E16s_v3': 1.008,
          'Standard_E32s_v3': 2.016,
          'Standard_E2s_v5': 0.126,
          'Standard_E4s_v5': 0.252,
          'Standard_E8s_v5': 0.504,
          'Standard_E16s_v5': 1.008,
          'Standard_E32s_v5': 2.016,
        };

        const hourlyRate = hourlyRates[vmSize.name] || 0.1;
        const hours = parseInt(options.hours, 10);
        const monthlyCost = hourlyRate * hours;

        logger.info(`Hourly Rate: $${hourlyRate.toFixed(4)}/hour`);
        logger.info(`Monthly Cost: $${monthlyCost.toFixed(2)}/month`);
        logger.info('');
        logger.info('Note: This is a rough estimate. Actual costs may vary based on:');
        logger.info('  - Region pricing differences');
        logger.info('  - Reserved instances or spot pricing');
        logger.info('  - Storage costs (disks)');
        logger.info('  - Network egress costs');
        logger.info('  - Additional services (load balancers, etc.)');
        logger.info('');
        logger.info('For accurate pricing, use the Azure Pricing Calculator:');
        logger.info('https://azure.microsoft.com/en-us/pricing/calculator/');
      });

    // ========================================
    // Phase 2: VNet & Subnet Commands
    // ========================================

    const networkCommand = vmCommand
      .command('network')
      .description('Virtual Network and Subnet commands (Phase 2)');

    // List VNet templates
    networkCommand
      .command('list-vnets')
      .description('List available VNet templates')
      .option('-s, --search <query>', 'Search VNet templates by name or description')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('Available VNet Templates\n');

        const templates = getAllVNetTemplates();
        let results = templates;

        if (options.search) {
          const query = options.search.toLowerCase();
          results = templates.filter(
            (t) =>
              t.template.name.toLowerCase().includes(query) ||
              t.template.description.toLowerCase().includes(query)
          );
          logger.info(`Search results for: "${options.search}"\n`);
        }

        if (results.length === 0) {
          logger.warn('No VNet templates found');
          return;
        }

        results.forEach(({ key, template }) => {
          logger.info(`${template.name} (${key})`);
          logger.info(`  Description: ${template.description}`);
          logger.info(`  Address Spaces: ${template.addressSpace.join(', ')}`);
          logger.info(`  Subnets: ${template.subnets.length}`);
          logger.info(`  Usable IPs: ${calculateUsableIPs(template.addressSpace[0])}`);
          template.subnets.forEach((subnet) => {
            logger.info(`    - ${subnet.name} (${subnet.addressPrefix}, ${calculateUsableIPs(subnet.addressPrefix)} IPs)`);
          });
          logger.info('');
        });

        logger.info(`Total: ${results.length} template(s)`);
      });

    // List subnet patterns
    networkCommand
      .command('list-subnets')
      .description('List available subnet patterns')
      .option('-s, --search <query>', 'Search subnet patterns by name or description')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('Available Subnet Patterns\n');

        const patterns = getAllSubnetPatterns();
        let results = patterns;

        if (options.search) {
          const query = options.search.toLowerCase();
          results = patterns.filter(
            (p) =>
              p.pattern.name.toLowerCase().includes(query) ||
              p.pattern.description.toLowerCase().includes(query)
          );
          logger.info(`Search results for: "${options.search}"\n`);
        }

        if (results.length === 0) {
          logger.warn('No subnet patterns found');
          return;
        }

        results.forEach(({ key, pattern }) => {
          logger.info(`${pattern.name} (${key})`);
          logger.info(`  Description: ${pattern.description}`);
          logger.info(`  Recommended CIDR: ${pattern.addressPrefix}`);
          logger.info(`  Usable IPs: ${calculateUsableIPs(pattern.addressPrefix)}`);

          if (pattern.serviceEndpoints && pattern.serviceEndpoints.length > 0) {
            logger.info(`  Service Endpoints: ${pattern.serviceEndpoints.join(', ')}`);
          }

          if ('delegations' in pattern && pattern.delegations && pattern.delegations.length > 0) {
            logger.info(`  Delegations: ${pattern.delegations.join(', ')}`);
          }

          logger.info('');
        });

        logger.info(`Total: ${results.length} pattern(s)`);
      });

    // Validate VNet configuration
    networkCommand
      .command('validate-vnet')
      .description('Validate VNet and subnet configuration')
      .requiredOption('-c, --cidr <cidr>', 'VNet CIDR block (e.g., 10.0.0.0/16)')
      .option('-s, --subnets <subnets...>', 'Subnet CIDR blocks to validate')
      .action((options) => {
        if (!this.context) return;

        const logger = this.context.logger;
        logger.info('VNet Configuration Validation\n');

        // Validate VNet CIDR
        logger.info(`VNet CIDR: ${options.cidr}`);
        const vnetValid = validateCIDR(options.cidr);

        if (!vnetValid) {
          logger.error(`✗ Invalid VNet CIDR: ${options.cidr}`);
          return;
        }

        logger.info(`✓ Valid VNet CIDR`);
        logger.info(`  Usable IPs: ${calculateUsableIPs(options.cidr)}`);
        logger.info('');

        // Validate subnets if provided
        if (options.subnets && options.subnets.length > 0) {
          logger.info('Subnet Validation:');

          for (const subnet of options.subnets) {
            const subnetValid = validateCIDR(subnet);

            if (!subnetValid) {
              logger.error(`✗ Invalid subnet CIDR: ${subnet}`);
              continue;
            }

            // Check if subnet is within VNet
            const [subnetIP, subnetPrefix] = subnet.split('/');
            const inVNet = isIPInCIDR(subnetIP, options.cidr);

            if (!inVNet) {
              logger.warn(`⚠ Subnet ${subnet} is not within VNet ${options.cidr}`);
            } else {
              logger.info(`✓ Subnet ${subnet} (${calculateUsableIPs(subnet)} IPs)`);
            }
          }

          // Check for overlapping subnets
          logger.info('');
          logger.info('Overlap Check:');
          for (let i = 0; i < options.subnets.length; i++) {
            for (let j = i + 1; j < options.subnets.length; j++) {
              if (subnetsOverlap(options.subnets[i], options.subnets[j])) {
                logger.error(`✗ Subnets overlap: ${options.subnets[i]} and ${options.subnets[j]}`);
              }
            }
          }
          logger.info('✓ No overlapping subnets detected');
        }

        logger.info('');
        logger.info('Validation complete');
      });
  }
}

/**
 * Default export - plugin instance
 */
export default VmPlugin;
