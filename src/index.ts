/**
 * Virtual Machine Plugin for Azure Marketplace Generator
 *
 * Provides VM templates, Handlebars helpers, and CLI commands
 * for generating Azure VM marketplace offers.
 *
 * @packageDocumentation
 */

import {
  IPlugin,
  PluginMetadata,
  TemplateDefinition,
  PluginContext,
} from "./types";
import { Command } from "commander";
import * as path from "path";
import Handlebars from "handlebars";
import { getNetworkingHelpers } from "./networking";
import { createExtensionHelpers } from "./extensions";
import { createSecurityHelpers } from "./security";
import { createIdentityHelpers } from "./identity";
import { registerAvailabilityHelpers } from "./availability";
import { registerRecoveryHelpers } from "./recovery";
import { registerScalingHelpers, scalingHelpers } from "./scaling";
import { registerMonitoringHelpers } from "./modules/monitoring";
import { registerAlertHelpers } from "./modules/alert";
import { registerDashboardHelpers } from "./modules/dashboard";
import { registerCostHelpers } from "./cost";
import { registerPerformanceHelpers } from "./performance";
import { registerEnhancedMonitoringHelpers } from "./monitoring";
import * as availabilityHelpers from "./availability/availabilitysets";
import * as zoneHelpers from "./availability/availabilityzones";
import * as vmssHelpers from "./availability/vmss";
import * as backupHelpers from "./recovery/backup";
import * as siteRecoveryHelpers from "./recovery/siterecovery";
import * as snapshotHelpers from "./recovery/snapshots";
import type { WorkbookCategory } from "./workbooks";

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
    id: "vm",
    name: "Virtual Machine Plugin",
    description:
      "Generates Azure Virtual Machine marketplace offers with comprehensive HA/DR and Enterprise Scaling",
    version: "1.10.0",
    author: "HOME OFFICE IMPROVEMENTS LTD",
  };

  private options: VmPluginOptions;
  private context?: PluginContext;

  constructor(options: VmPluginOptions = {}) {
    this.options = {
      defaultVmSize: options.defaultVmSize || "Standard_D2s_v3",
      includeDiagnostics: options.includeDiagnostics !== false,
      includePublicIp: options.includePublicIp !== false,
      includeNsg: options.includeNsg !== false,
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.logger.info(`Initializing VM Plugin v${this.metadata.version}`);
    context.logger.debug("VM Plugin options:", this.options);

    // Register basic comparison helper
    Handlebars.registerHelper("eq", function (a: any, b: any) {
      return a === b;
    });

    // Register availability and recovery helpers with Handlebars
    registerAvailabilityHelpers();
    registerRecoveryHelpers();
    registerScalingHelpers();
    registerMonitoringHelpers();
    registerEnhancedMonitoringHelpers();
    registerAlertHelpers();
    registerDashboardHelpers();
    registerCostHelpers();
    registerPerformanceHelpers();
  }

  /**
   * Cleanup plugin resources
   */
  async cleanup(): Promise<void> {
    if (this.context) {
      this.context.logger.info("Cleaning up VM Plugin");
    }
  }

  /**
   * Get template definitions
   */
  getTemplates(): TemplateDefinition[] {
    const templatesDir = path.join(__dirname, "templates");

    return [
      {
        type: "vm",
        name: "Virtual Machine",
        description:
          "Azure Virtual Machine with comprehensive networking, extensions, HA/DR, and Enterprise Scaling",
        version: "1.10.0",
        templatePath: templatesDir,
        files: {
          mainTemplate: "mainTemplate.json.hbs",
          createUiDefinition: "createUiDefinition.json.hbs",
          viewDefinition: "viewDefinition.json.hbs",
        },
        parameters: {
          vmSize: {
            type: "string",
            defaultValue: this.options.defaultVmSize,
            metadata: {
              description: "Size of the virtual machine",
            },
          },
          adminUsername: {
            type: "string",
            metadata: {
              description: "Admin username for the VM",
            },
          },
          authenticationType: {
            type: "string",
            defaultValue: "sshPublicKey",
            allowedValues: ["sshPublicKey", "password"],
            metadata: {
              description: "Type of authentication to use",
            },
          },
          adminPasswordOrKey: {
            type: "securestring",
            metadata: {
              description: "SSH public key or password for the admin user",
            },
          },
          // Networking parameters
          virtualNetworkName: {
            type: "string",
            defaultValue: "",
            metadata: {
              description: "Virtual network name",
            },
          },
          subnetName: {
            type: "string",
            defaultValue: "default",
            metadata: {
              description: "Subnet name",
            },
          },
          publicIPName: {
            type: "string",
            defaultValue: "",
            metadata: {
              description: "Public IP address name",
            },
          },
          // Extension parameters
          installExtensions: {
            type: "bool",
            defaultValue: true,
            metadata: {
              description: "Whether to install VM extensions",
            },
          },
          installMonitoringExtension: {
            type: "bool",
            defaultValue: true,
            metadata: {
              description: "Whether to install Azure Monitor Agent",
            },
          },
          installSecurityExtension: {
            type: "bool",
            defaultValue: true,
            metadata: {
              description: "Whether to install Azure Security Agent",
            },
          },
          enableManagedIdentity: {
            type: "bool",
            defaultValue: true,
            metadata: {
              description: "Whether to enable system-assigned managed identity",
            },
          },
          // HA/DR parameters
          createAvailabilitySet: {
            type: "bool",
            defaultValue: false,
            metadata: {
              description: "Whether to create an Availability Set",
            },
          },
          useAvailabilityZones: {
            type: "bool",
            defaultValue: false,
            metadata: {
              description: "Whether to deploy VM in Availability Zones",
            },
          },
          enableBackup: {
            type: "bool",
            defaultValue: false,
            metadata: {
              description: "Whether to enable Azure Backup",
            },
          },
          enableSnapshot: {
            type: "bool",
            defaultValue: false,
            metadata: {
              description: "Whether to enable disk snapshots",
            },
          },
        },
      },
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

    // Create availability helpers object for CLI access
    const availHelpers = {
      "availability:zones": zoneHelpers.getAvailableZones,
      "availability:supportsZones": zoneHelpers.supportsAvailabilityZones,
      "availability:setSLA": availabilityHelpers.availabilitySetSLA,
      "availability:zoneSLA": zoneHelpers.availabilityZoneSLA,
      "availability:vmssSLA": vmssHelpers.vmssSLA,
    };

    // Create recovery helpers object for CLI access
    const recovHelpers = {
      "recovery:estimateBackupStorage": backupHelpers.estimateBackupStorage,
      "recovery:getRecommendedTargetRegion":
        siteRecoveryHelpers.getRecommendedTargetRegion,
      "recovery:estimateRTO": siteRecoveryHelpers.estimateRTO,
    };

    // Create scaling helpers object for CLI access
    const scaleHelpers = {
      ...scalingHelpers,
    };

    // Combine VM helpers with networking, extension, security, and identity helpers
    const vmHelpers = {
      /**
       * Format VM size with description
       */
      "vm-size": (size: string): string => {
        const sizeDescriptions: Record<string, string> = {
          Standard_D2s_v3: "General purpose - 2 vCPUs, 8 GB RAM",
          Standard_D4s_v3: "General purpose - 4 vCPUs, 16 GB RAM",
          Standard_D8s_v3: "General purpose - 8 vCPUs, 32 GB RAM",
          Standard_F2s_v2: "Compute optimized - 2 vCPUs, 4 GB RAM",
          Standard_F4s_v2: "Compute optimized - 4 vCPUs, 8 GB RAM",
          Standard_E2s_v3: "Memory optimized - 2 vCPUs, 16 GB RAM",
          Standard_E4s_v3: "Memory optimized - 4 vCPUs, 32 GB RAM",
        };
        return sizeDescriptions[size] || size;
      },

      /**
       * Get VM image reference
       */
      "vm-image": (publisher: string, offer: string, sku: string): string => {
        return JSON.stringify({
          publisher,
          offer,
          sku,
          version: "latest",
        });
      },

      /**
       * Generate VM resource name
       */
      "vm-resource-name": (baseName: string, suffix: string): string => {
        return `${baseName}-${suffix}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");
      },

      /**
       * Convert object to JSON string
       */
      json: (obj: any): string => {
        return JSON.stringify(obj);
      },
    };

    // Return combined helpers (VM + Networking + Extensions + Security + Identity + Availability + Recovery + Scaling)
    return {
      ...vmHelpers,
      ...networkingHelpers,
      ...extensionHelpers,
      ...securityHelpers,
      ...identityHelpers,
      ...availHelpers,
      ...recovHelpers,
      ...scaleHelpers,
    };
  }

  private async loadJsonInput(
    input: string | undefined,
    label: string,
  ): Promise<any> {
    if (!input || typeof input !== "string" || input.trim().length === 0) {
      throw new Error(`${label} option is required`);
    }

    const trimmed = input.trim();

    try {
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return JSON.parse(trimmed);
      }

      const fs = await import("fs/promises");
      const content = await fs.readFile(trimmed, "utf8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to parse ${label}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Register CLI commands
   */
  registerCommands(program: Command): void {
    // ========================================
    // VM Commands
    // ========================================
    const vmCommand = program
      .command("vm")
      .description("Virtual Machine commands");

    // Import and register template commands
    if (this.context) {
      const { registerTemplateCommands } = require("./cli/template-commands");
      registerTemplateCommands(vmCommand, {
        context: this.context,
        plugin: this,
      });

      // Import and register cleanup commands
      const { registerCleanupCommands } = require("./cli/cleanup-commands");
      registerCleanupCommands(vmCommand, { context: this.context });

      // Import and register HA commands
      const { registerHACommands } = require("./cli/ha-commands");
      registerHACommands(vmCommand);

      // Register validate-vhd command (P0-1: VHD Validation)
      const validateVhdCommand = require("./cli/commands/validate-vhd").default;
      vmCommand.addCommand(validateVhdCommand);

      // Register configure-diagnostics command (P0-2: Diagnostics Auto-Enable)
      const configureDiagnosticsCommand = require("./cli/commands/configure-diagnostics").default;
      vmCommand.addCommand(configureDiagnosticsCommand);

      // Register configure-disk-types command (P1-1: Disk Type Selection)
      const configureDiskTypesCommand = require("./cli/commands/configure-disk-types").default;
      vmCommand.addCommand(configureDiskTypesCommand);

      // Register configure-backup command (P1-2: Backup Auto-Enable)
      const configureBackupCommand = require("./cli/commands/configure-backup").default;
      vmCommand.addCommand(configureBackupCommand);

      // Register configure-data-disks command (P1-3: Data Disk Support)
      const configureDataDisksCommand = require("./cli/commands/configure-data-disks").default;
      vmCommand.addCommand(configureDataDisksCommand);

      // Register configure-monitoring command (P1-4: Monitoring & Alerts Support)
      const configureMonitoringCommand = require("./cli/commands/configure-monitoring").default;
      vmCommand.addCommand(configureMonitoringCommand);

      // Register configure-hybrid-benefit command (P1-5: Azure Hybrid Benefit Support)
      const configureHybridBenefitCommand = require("./cli/commands/configure-hybrid-benefit").default;
      vmCommand.addCommand(configureHybridBenefitCommand);
    }

    vmCommand
      .command("list-sizes")
      .description(
        "List available VM sizes for a location (requires Azure credentials)",
      )
      .option("-l, --location <location>", "Azure location", "eastus")
      .option(
        "-s, --subscription <subscription>",
        "Azure subscription ID (required for Azure API)",
        process.env.AZURE_SUBSCRIPTION_ID,
      )
      .action(async (options) => {
        if (this.context) {
          if (!options.subscription) {
            this.context.logger.error(
              "Azure subscription ID required. Use --subscription or set AZURE_SUBSCRIPTION_ID environment variable.",
            );
            return;
          }

          try {
            this.context.logger.info(
              `Listing VM sizes for location: ${options.location}`,
            );

            // Use Azure SDK for real API call
            const { azureAuth, ComputeHelper } = await import("./azure");
            const credential = azureAuth.getCredential();
            const compute = new ComputeHelper(credential, options.subscription);

            const sizes = await compute.listVmSizes(options.location);

            if (sizes.length === 0) {
              this.context.logger.info("No VM sizes found for this location.");
            } else {
              this.context.logger.info(`Found ${sizes.length} VM sizes:`);
              sizes.slice(0, 20).forEach((size) => {
                this.context!.logger.info(
                  `  ${size.name.padEnd(25)} - ${size.numberOfCores} cores, ${(size.memoryInMB / 1024).toFixed(1)}GB RAM, ${size.maxDataDiskCount} data disks`,
                );
              });

              if (sizes.length > 20) {
                this.context.logger.info(`  ... and ${sizes.length - 20} more`);
              }
            }
          } catch (error) {
            this.context.logger.error(
              `Failed to list VM sizes: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            this.context.logger.error(
              "Ensure Azure credentials are configured (az login or environment variables).",
            );
          }
        }
      });

    vmCommand
      .command("list-images")
      .description(
        "List popular VM images for a location (requires Azure credentials)",
      )
      .option("-l, --location <location>", "Azure location", "eastus")
      .option(
        "-p, --publisher <publisher>",
        "Image publisher (optional, defaults to popular images)",
      )
      .option(
        "-s, --subscription <subscription>",
        "Azure subscription ID (required for Azure API)",
        process.env.AZURE_SUBSCRIPTION_ID,
      )
      .action(async (options) => {
        if (this.context) {
          if (!options.subscription) {
            this.context.logger.error(
              "Azure subscription ID required. Use --subscription or set AZURE_SUBSCRIPTION_ID environment variable.",
            );
            return;
          }

          try {
            const { azureAuth, ComputeHelper } = await import("./azure");
            const credential = azureAuth.getCredential();
            const compute = new ComputeHelper(credential, options.subscription);

            if (options.publisher) {
              // List images for specific publisher
              this.context.logger.info(
                `Listing images for publisher: ${options.publisher} in ${options.location}`,
              );
              const offers = await compute.listVmImageOffers(
                options.location,
                options.publisher,
              );

              if (offers.length === 0) {
                this.context.logger.info(
                  `No offers found for publisher ${options.publisher}`,
                );
              } else {
                this.context.logger.info(`Found ${offers.length} offers:`);
                offers.forEach((offer) => {
                  this.context!.logger.info(`  ${offer}`);
                });
              }
            } else {
              // List popular images
              this.context.logger.info(
                `Listing popular VM images for ${options.location}...`,
              );
              const images = await compute.listPopularVmImages(
                options.location,
              );

              if (images.length === 0) {
                this.context.logger.info(
                  "No popular images available for this location.",
                );
              } else {
                this.context.logger.info(
                  `Found ${images.length} popular images:`,
                );
                images.forEach((img) => {
                  this.context!.logger.info(
                    `  ${img.publisher}/${img.offer} - ${img.sku} (${img.version})`,
                  );
                });
              }
            }
          } catch (error) {
            this.context.logger.error(
              `Failed to list VM images: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            this.context.logger.error(
              "Ensure Azure credentials are configured (az login or environment variables).",
            );
          }
        }
      });

    vmCommand
      .command("validate-credentials")
      .description("Validate Azure credentials and subscription access")
      .option(
        "-s, --subscription <subscription>",
        "Azure subscription ID",
        process.env.AZURE_SUBSCRIPTION_ID,
      )
      .action(async (options) => {
        if (this.context) {
          try {
            this.context.logger.info("Validating Azure credentials...");

            const { azureAuth } = await import("./azure");
            const isValid = await azureAuth.validateCredentials(
              options.subscription,
            );

            if (isValid) {
              this.context.logger.info("✅ Azure credentials are valid");
              const status = azureAuth.getAuthStatus();
              this.context.logger.info(
                `   Credential type: ${status.credentialType}`,
              );

              if (options.subscription) {
                this.context.logger.info(
                  `   Subscription: ${options.subscription}`,
                );
              }
            } else {
              this.context.logger.error(
                "❌ Azure credentials validation failed",
              );
              this.context.logger.error(
                '   Please run "az login" or configure environment variables:',
              );
              this.context.logger.error("   - AZURE_CLIENT_ID");
              this.context.logger.error("   - AZURE_CLIENT_SECRET");
              this.context.logger.error("   - AZURE_TENANT_ID");
            }
          } catch (error) {
            this.context.logger.error(
              `Failed to validate credentials: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      });

    // ========================================
    // Workbook Commands
    // ========================================

    vmCommand
      .command("wb-ls")
      .description("List available Azure Monitor workbook templates")
      .option(
        "-c, --category <category>",
        "Filter by category (vm-monitoring, application, infrastructure, advanced-monitoring, scaling-analytics, cost-optimization)",
      )
      .option("-t, --tags <tags>", "Filter by tags (comma-separated)")
      .action(async (options) => {
        if (this.context) {
          try {
            const { WorkbookTemplateManager } = await import("./workbooks");

            let templates = WorkbookTemplateManager.getAllTemplates();

            // Filter by category if specified
            if (options.category) {
              const categoryInput = (options.category as string)
                .trim()
                .toLowerCase() as WorkbookCategory;
              const validCategories: WorkbookCategory[] = [
                "vm-monitoring",
                "application",
                "infrastructure",
                "advanced-monitoring",
                "scaling-analytics",
                "cost-optimization",
              ];

              if (!validCategories.includes(categoryInput)) {
                this.context.logger.warn(
                  `⚠️  Unknown category "${options.category}". Supported categories: ${validCategories.join(", ")}`,
                );
                templates = [];
              } else {
                templates =
                  WorkbookTemplateManager.getTemplatesByCategory(categoryInput);
              }
            }

            // Filter by tags if specified
            if (options.tags && templates.length > 0) {
              const normalizedTags = options.tags
                .split(",")
                .map((tag: string) => tag.trim().toLowerCase())
                .filter(Boolean);

              templates = templates.filter((template) =>
                normalizedTags.some((tag: string) =>
                  template.tags.includes(tag),
                ),
              );
            }

            if (templates.length === 0) {
              this.context.logger.info(
                "No workbook templates found matching the criteria",
              );
              return;
            }

            this.context.logger.info(
              `\n📊 Available Workbook Templates (${templates.length}):\n`,
            );

            const byCategory = templates.reduce(
              (acc: Record<string, any[]>, template) => {
                if (!acc[template.category]) acc[template.category] = [];
                acc[template.category].push(template);
                return acc;
              },
              {},
            );

            for (const [category, categoryTemplates] of Object.entries(
              byCategory,
            )) {
              this.context.logger.info(
                `🔸 ${category.toUpperCase().replace("-", " ")}:`,
              );
              categoryTemplates.forEach((template: any) => {
                if (template && this.context) {
                  this.context.logger.info(
                    `   ${template.id.padEnd(25)} - ${template.name}`,
                  );
                  this.context.logger.info(
                    `   ${" ".repeat(27)}${template.description}`,
                  );
                  this.context.logger.info(
                    `   ${" ".repeat(27)}Tags: ${template.tags.join(", ")}\n`,
                  );
                }
              });
            }

            this.context.logger.info(
              `💡 Use "azmp vm wb-gen --template <id>" to generate a workbook`,
            );
          } catch (error) {
            this.context.logger.error(
              `Failed to list workbooks: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      });

    vmCommand
      .command("wb-gen")
      .description("Generate Azure Monitor workbook from template")
      .option("-t, --template <template>", "Workbook template ID (required)")
      .option(
        "-s, --subscription <subscription>",
        "Azure subscription ID",
        process.env.AZURE_SUBSCRIPTION_ID,
      )
      .option("-g, --resource-group <group>", "Resource group name")
      .option("-v, --vm <vmName>", "Virtual machine name")
      .option("-l, --location <location>", "Azure region")
      .option("-o, --output <file>", "Output file path (defaults to stdout)")
      .option("-p, --parameters <params>", "Custom parameters as JSON string")
      .action(async (options) => {
        if (this.context) {
          try {
            if (!options.template) {
              this.context.logger.error(
                "❌ Template ID is required. Use --template <id>",
              );
              this.context.logger.info(
                '💡 Use "azmp vm wb-ls" to see available templates',
              );
              return;
            }

            const { WorkbookTemplateManager } = await import("./workbooks");

            // Parse custom parameters if provided
            let customParameters = {};
            if (options.parameters) {
              try {
                customParameters = JSON.parse(options.parameters);
              } catch (error) {
                this.context.logger.error(
                  "❌ Invalid JSON in --parameters option",
                );
                return;
              }
            }

            // Generate workbook
            const generationOptions = {
              templateId: options.template,
              subscriptionId: options.subscription,
              resourceGroupName: options.resourceGroup,
              vmName: options.vm,
              location: options.location,
              customParameters,
            };

            const workbook =
              WorkbookTemplateManager.generateWorkbook(generationOptions);
            const workbookJson = JSON.stringify(workbook, null, 2);

            // Output to file or stdout
            if (options.output) {
              const fs = await import("fs/promises");
              await fs.writeFile(options.output, workbookJson, "utf8");
              this.context.logger.info(
                `✅ Workbook generated successfully: ${options.output}`,
              );
              this.context.logger.info(
                `📊 Template: ${workbook.metadata.templateName}`,
              );
            } else {
              console.log(workbookJson);
            }
          } catch (error) {
            this.context.logger.error(
              `Failed to generate workbook: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      });

    vmCommand
      .command("wb-val")
      .description("Validate Azure Monitor workbook JSON file")
      .option("-f, --file <file>", "Workbook JSON file path (required)")
      .option("-v, --verbose", "Show detailed validation results")
      .action(async (options) => {
        if (this.context) {
          try {
            if (!options.file) {
              this.context.logger.error(
                "❌ File path is required. Use --file <path>",
              );
              return;
            }

            // Read and parse workbook file
            const fs = await import("fs/promises");
            const fileContent = await fs.readFile(options.file, "utf8");

            let workbookData;
            try {
              workbookData = JSON.parse(fileContent);
            } catch (error) {
              this.context.logger.error("❌ Invalid JSON in workbook file");
              return;
            }

            const { WorkbookTemplateManager } = await import("./workbooks");

            // Basic workbook structure validation
            const errors: string[] = [];
            const warnings: string[] = [];

            // Check required properties
            if (!workbookData.version) {
              errors.push("Missing required property: version");
            }

            if (!Array.isArray(workbookData.items)) {
              errors.push("Missing or invalid property: items (must be array)");
            } else {
              // Validate items
              workbookData.items.forEach((item: any, index: number) => {
                if (typeof item.type !== "number") {
                  errors.push(
                    `Item ${index}: missing or invalid type property`,
                  );
                }
                if (!item.content) {
                  errors.push(`Item ${index}: missing content property`);
                }
              });
            }

            // Check metadata if present
            if (workbookData.metadata) {
              if (workbookData.metadata.templateId) {
                const template = WorkbookTemplateManager.getTemplate(
                  workbookData.metadata.templateId,
                );
                if (!template) {
                  warnings.push(
                    `Unknown template ID: ${workbookData.metadata.templateId}`,
                  );
                } else {
                  this.context.logger.info(
                    `📊 Template: ${template.name} (${template.version})`,
                  );
                }
              }
            }

            // Report results
            const isValid = errors.length === 0;

            if (isValid) {
              this.context.logger.info("✅ Workbook validation passed");
              this.context.logger.info(`📁 File: ${options.file}`);
              this.context.logger.info(
                `📊 Items: ${workbookData.items?.length || 0}`,
              );
            } else {
              this.context.logger.error("❌ Workbook validation failed");
              if (this.context) {
                errors.forEach((error) =>
                  this.context!.logger.error(`   • ${error}`),
                );
              }
            }

            if (warnings.length > 0 && this.context) {
              this.context.logger.warn("⚠️  Warnings:");
              warnings.forEach((warning) =>
                this.context!.logger.warn(`   • ${warning}`),
              );
            }

            if (options.verbose && isValid) {
              this.context.logger.info("\n📋 Detailed Validation Results:");
              this.context.logger.info(`   Version: ${workbookData.version}`);
              this.context.logger.info(
                `   Items: ${workbookData.items?.length || 0}`,
              );
              if (workbookData.metadata) {
                this.context.logger.info(
                  `   Generated: ${workbookData.metadata.generatedAt || "Unknown"}`,
                );
                this.context.logger.info(
                  `   Generated by: ${workbookData.metadata.generatedBy || "Unknown"}`,
                );
              }
            }
          } catch (error) {
            this.context.logger.error(
              `Failed to validate workbook: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      });

    // ========================================
    // Cost Optimization Commands
    // ========================================

    vmCommand
      .command("co-estimate")
      .description(
        "Estimate VM cost for a specific size, region, and pricing model",
      )
      .option("-s, --size <vmSize>", "Azure VM size (e.g., Standard_D2s_v3)")
      .option("-r, --region <region>", "Azure region", "eastus")
      .option(
        "-p, --pricing <model>",
        "Pricing model (payg, reserved1year, reserved3year, spot)",
        "payg",
      )
      .option(
        "-h, --hours <hours>",
        "Number of hours (defaults to 730 for monthly)",
        "730",
      )
      .option(
        "-o, --os-type <type>",
        "Operating system type (linux or windows)",
        "linux",
      )
      .option(
        "--hybrid-benefit",
        "Apply Azure Hybrid Benefit (Windows licensing credit)",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.size) {
            this.context.logger.error(
              "❌ VM size is required. Use --size <vmSize>",
            );
            return;
          }

          const { CostAnalyzer } = await import("./cost");
          const hours = Number(options.hours);
          const pricingModel = (options.pricing || "payg").toLowerCase();
          const result = CostAnalyzer.calculateVmCost({
            vmSize: options.size,
            region: options.region,
            pricingModel: pricingModel,
            hours: Number.isNaN(hours) ? undefined : hours,
            osType: options.osType,
            applyHybridBenefit: Boolean(options.hybridBenefit),
          });

          this.context.logger.info(
            `\n💰 Cost estimate for ${options.size} in ${options.region}`,
          );
          this.context.logger.info(
            `   Pricing model: ${result.pricingModel.toUpperCase()} (${result.currency})`,
          );
          this.context.logger.info(
            `   Hourly cost: $${result.hourlyCost.toFixed(4)}`,
          );
          this.context.logger.info(
            `   Monthly cost (${result.hours}h): $${result.monthlyCost.toFixed(2)}`,
          );
          if (options.osType === "windows") {
            if (result.details.appliedHybridBenefit) {
              this.context.logger.info(
                "   Azure Hybrid Benefit applied (Windows licensing excluded)",
              );
            } else {
              this.context.logger.info("   Includes Windows licensing premium");
            }
          }
        } catch (error) {
          this.context.logger.error(
            `Failed to estimate VM cost: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("co-compare")
      .description("Compare multiple VM sizes by cost")
      .option("-s, --sizes <sizes>", "Comma separated VM sizes", "")
      .option("-r, --region <region>", "Azure region", "eastus")
      .option(
        "-p, --pricing <model>",
        "Pricing model (payg, reserved1year, reserved3year, spot)",
        "payg",
      )
      .option("-h, --hours <hours>", "Number of hours to evaluate", "730")
      .option(
        "-o, --os-type <type>",
        "Operating system type (linux or windows)",
        "linux",
      )
      .option(
        "--hybrid-benefit",
        "Apply Azure Hybrid Benefit (Windows licensing credit)",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          const sizeList = (options.sizes || "")
            .split(",")
            .map((size: string) => size.trim())
            .filter((size: string) => size.length > 0);

          if (sizeList.length === 0) {
            this.context.logger.error(
              "❌ At least one VM size is required. Use --sizes <size1,size2,...>",
            );
            return;
          }

          const { CostAnalyzer } = await import("./cost");
          const hours = Number(options.hours);
          const pricingModel = (options.pricing || "payg").toLowerCase();
          const results = CostAnalyzer.compareVmSizes(
            sizeList,
            options.region,
            {
              pricingModel: pricingModel,
              hours: Number.isNaN(hours) ? undefined : hours,
              osType: options.osType,
              applyHybridBenefit: Boolean(options.hybridBenefit),
            },
          );

          this.context.logger.info(
            `\n📊 Cost comparison (${options.region}, ${options.pricing.toUpperCase()}, ${results[0]?.currency})`,
          );
          results.forEach((entry) => {
            this.context!.logger.info(
              `   ${entry.vmSize.padEnd(20)} Hourly: $${entry.hourlyCost.toFixed(4)}  Monthly: $${entry.monthlyCost.toFixed(2)}`,
            );
          });
        } catch (error) {
          this.context.logger.error(
            `Failed to compare VM sizes: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("co-reserve")
      .description("Calculate Reserved Instance savings for a VM size")
      .option("-s, --size <vmSize>", "Azure VM size", "")
      .option("-r, --region <region>", "Azure region", "eastus")
      .option(
        "-t, --term <term>",
        "Reserved Instance term (1year or 3year)",
        "1year",
      )
      .option(
        "-o, --os-type <type>",
        "Operating system type (linux or windows)",
        "linux",
      )
      .option(
        "-h, --hours <hours>",
        "Number of hours (defaults to 730 for monthly)",
        "730",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.size) {
            this.context.logger.error(
              "❌ VM size is required. Use --size <vmSize>",
            );
            return;
          }

          const term = options.term === "3year" ? "3year" : "1year";
          const hours = Number(options.hours);
          const { CostAnalyzer } = await import("./cost");
          const savings = CostAnalyzer.calculateReservedInstanceSavings(
            options.size,
            options.region,
            term,
            {
              osType: options.osType,
              hours: Number.isNaN(hours) ? undefined : hours,
            },
          );

          this.context.logger.info(
            `\n🛒 Reserved Instance analysis for ${options.size} (${options.region})`,
          );
          this.context.logger.info(
            `   Term: ${term === "1year" ? "1 year" : "3 year"}`,
          );
          this.context.logger.info(
            `   PAYG monthly: $${savings.paygCost.toFixed(2)}`,
          );
          this.context.logger.info(
            `   RI monthly:   $${savings.reservedCost.toFixed(2)}`,
          );
          this.context.logger.info(
            `   Savings:      $${savings.savings.toFixed(2)} (${savings.savingsPercent.toFixed(2)}%)`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to calculate Reserved Instance savings: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("co-rightsize")
      .description(
        "Generate right-sizing recommendation from utilization metrics",
      )
      .option("-c, --current-size <vmSize>", "Current VM size", "")
      .option("-r, --region <region>", "Azure region", "eastus")
      .option("--cpu-avg <percent>", "Average CPU utilization (0-100)", "35")
      .option(
        "--memory-avg <percent>",
        "Average memory utilization (0-100)",
        "40",
      )
      .option("--disk-avg <percent>", "Average disk utilization (0-100)")
      .option(
        "-o, --os-type <type>",
        "Operating system type (linux or windows)",
        "linux",
      )
      .option("-h, --hours <hours>", "Monthly hours for cost comparison", "730")
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.currentSize) {
            this.context.logger.error(
              "❌ Current VM size is required. Use --current-size <vmSize>",
            );
            return;
          }

          const cpu = Number(options.cpuAvg);
          const memory = Number(options.memoryAvg);
          const disk =
            options.diskAvg !== undefined ? Number(options.diskAvg) : undefined;
          const hours = Number(options.hours);

          const { CostRecommendationEngine } = await import("./cost");
          const recommendation =
            CostRecommendationEngine.getRightSizingRecommendation({
              currentSize: options.currentSize,
              region: options.region,
              avgCpuPercent: cpu,
              avgMemoryPercent: memory,
              avgDiskPercent: disk,
              osType: options.osType,
              hoursPerMonth: Number.isNaN(hours) ? undefined : hours,
            });

          if (!recommendation) {
            this.context.logger.info(
              "ℹ️  No right-sizing recommendation. Current size appears appropriate for provided utilization.",
            );
            return;
          }

          this.context.logger.info(
            `\n📉 Right-sizing recommendation for ${options.currentSize}`,
          );
          this.context.logger.info(
            `   Suggested size: ${recommendation.recommendedSize}`,
          );
          this.context.logger.info(
            `   Monthly savings: $${recommendation.monthlySavings.toFixed(2)}`,
          );
          this.context.logger.info(
            `   Annual savings:  $${recommendation.annualSavings.toFixed(2)}`,
          );
          this.context.logger.info(
            `   Confidence: ${recommendation.confidence.toUpperCase()}`,
          );
          this.context.logger.info(`   Rationale: ${recommendation.rationale}`);
        } catch (error) {
          this.context.logger.error(
            `Failed to generate right-sizing recommendation: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("co-budget")
      .description(
        "Generate a cost budget definition with optional alert template",
      )
      .option("-n, --name <name>", "Budget name", "")
      .option("-a, --amount <amount>", "Budget amount in USD", "")
      .option(
        "-g, --timegrain <grain>",
        "Time grain (Monthly, Quarterly, Annually)",
        "Monthly",
      )
      .option("--start <date>", "Budget start date (YYYY-MM-DD)")
      .option("--end <date>", "Budget end date (optional)")
      .option(
        "-c, --category <category>",
        "Budget category (Cost or Usage)",
        "Cost",
      )
      .option(
        "--notify <notification>",
        "Notification rule in format threshold:email1;email2 (repeatable)",
        (value, previous: string[]) => {
          const list = previous || [];
          list.push(value);
          return list;
        },
      )
      .option(
        "--action-group <group>",
        "Action group resource ID (repeatable)",
        (value, previous: string[]) => {
          const list = previous || [];
          list.push(value);
          return list;
        },
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.name) {
            this.context.logger.error(
              "❌ Budget name is required. Use --name <name>",
            );
            return;
          }
          if (!options.amount) {
            this.context.logger.error(
              "❌ Budget amount is required. Use --amount <value>",
            );
            return;
          }

          const amount = Number(options.amount);
          if (Number.isNaN(amount) || amount <= 0) {
            this.context.logger.error(
              "❌ Budget amount must be a positive number.",
            );
            return;
          }

          const { createBudgetDefinition, createCostAlertTemplate } =
            await import("./cost");
          const notifications = (options.notify || []).map((rule: string) => {
            const [thresholdPart, emailsPart] = rule.split(":");
            const threshold = Number(thresholdPart);
            const contactEmails = (emailsPart || "")
              .split(";")
              .map((email) => email.trim())
              .filter((email) => email.length > 0);

            if (Number.isNaN(threshold) || contactEmails.length === 0) {
              throw new Error(`Invalid notification rule: ${rule}`);
            }

            return {
              threshold,
              contactEmails,
            };
          });

          const startDate =
            options.start ||
            new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              .toISOString()
              .split("T")[0];

          const budget = createBudgetDefinition({
            name: options.name,
            amount,
            timeGrain: options.timegrain,
            startDate,
            endDate: options.end || undefined,
            category: options.category,
            notifications,
          });

          this.context.logger.info("\n📑 Budget definition (JSON):");
          this.context.logger.info(JSON.stringify(budget, null, 2));

          if (notifications.length > 0) {
            const alert = createCostAlertTemplate({
              budgetName: options.name,
              threshold: notifications[0].threshold,
              contactEmails: notifications[0].contactEmails,
              actionGroups: options.actionGroup || [],
            });

            this.context.logger.info("\n🚨 Sample alert template:");
            this.context.logger.info(JSON.stringify(alert, null, 2));
          } else {
            this.context.logger.info(
              "ℹ️  Add notifications with --notify 80:ops@example.com",
            );
          }
        } catch (error) {
          this.context.logger.error(
            `Failed to generate budget information: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    // ========================================
    // Performance Optimization Commands
    // ========================================

    vmCommand
      .command("pf-analyze")
      .description(
        "Analyze VM performance metrics and generate optimization recommendations",
      )
      .option("-s, --size <vmSize>", "Current VM size", "")
      .option(
        "-m, --metrics <metrics>",
        "Performance metrics JSON string or path to JSON file",
        "",
      )
      .option("-o, --output <file>", "Write full analysis to a JSON file")
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.size) {
            this.context.logger.error(
              "❌ VM size is required. Use --size <vmSize>",
            );
            return;
          }
          if (!options.metrics) {
            this.context.logger.error(
              "❌ Metrics input is required. Use --metrics <json|string>",
            );
            return;
          }

          const rawMetrics = await this.loadJsonInput(
            options.metrics,
            "metrics",
          );
          const { PerformanceAnalyzer } = await import("./performance");
          const analysis = PerformanceAnalyzer.analyzePerformance(
            options.size,
            rawMetrics,
          );

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(analysis, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Performance analysis written to ${options.output}`,
            );
          }

          this.context.logger.info(
            `\n⚙️  Performance analysis for ${analysis.vmSize}`,
          );
          this.context.logger.info(
            `   Overall score: ${analysis.overallScore}/100`,
          );
          this.context.logger.info(
            `   CPU utilization: ${analysis.utilizationAnalysis.cpuUtilization}`,
          );
          this.context.logger.info(
            `   Memory utilization: ${analysis.utilizationAnalysis.memoryUtilization}`,
          );
          this.context.logger.info(
            `   Disk utilization: ${analysis.utilizationAnalysis.diskUtilization}`,
          );
          this.context.logger.info(
            `   Network utilization: ${analysis.utilizationAnalysis.networkUtilization}`,
          );
          if (analysis.recommendations.length > 0) {
            this.context.logger.info(
              "   Top recommendation: " + analysis.recommendations[0].title,
            );
          }
        } catch (error) {
          this.context.logger.error(
            `Failed to analyze performance: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-burst")
      .description(
        "Evaluate burst capability and suitability for burst-capable VM sizes",
      )
      .option("-s, --size <vmSize>", "Current VM size", "")
      .option(
        "-m, --metrics <metrics>",
        "Performance metrics JSON string or path to JSON file",
        "",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.size) {
            this.context.logger.error(
              "❌ VM size is required. Use --size <vmSize>",
            );
            return;
          }
          if (!options.metrics) {
            this.context.logger.error(
              "❌ Metrics input is required. Use --metrics <json|string>",
            );
            return;
          }

          const rawMetrics = await this.loadJsonInput(
            options.metrics,
            "metrics",
          );
          const { PerformanceAnalyzer } = await import("./performance");
          const burst = PerformanceAnalyzer.analyzeBurstCapability(
            options.size,
            rawMetrics,
          );

          this.context.logger.info(`\n⚡ Burst analysis for ${burst.vmSize}`);
          this.context.logger.info(
            `   Supports burst: ${burst.supportsBurst ? "Yes" : "No"}`,
          );
          if (burst.supportsBurst) {
            this.context.logger.info(
              `   Burst sustainability: ${burst.burstConfiguration.sustainabilityMinutes.toFixed(1)} minutes`,
            );
          } else if (burst.recommendations.targetVmSize) {
            this.context.logger.info(
              `   Consider migrating to: ${burst.recommendations.targetVmSize}`,
            );
          }
          this.context.logger.info(
            `   Suitability: ${burst.workloadSuitability.toUpperCase()}`,
          );

          if (burst.recommendations.reasoning) {
            this.context.logger.info(
              `   Recommendation: ${burst.recommendations.reasoning}`,
            );
          }
        } catch (error) {
          this.context.logger.error(
            `Failed to evaluate burst capability: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-disk")
      .description(
        "Analyze disk performance and recommend optimal storage tier",
      )
      .option(
        "-t, --tier <tier>",
        "Current disk tier (Standard_HDD, Standard_SSD, Premium_SSD, Ultra_SSD)",
        "",
      )
      .option("-s, --size <vmSize>", "Current VM size", "")
      .option(
        "-m, --metrics <metrics>",
        "Performance metrics JSON string or path to JSON file",
        "",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.tier) {
            this.context.logger.error(
              "❌ Disk tier is required. Use --tier <currentTier>",
            );
            return;
          }
          if (!options.size) {
            this.context.logger.error(
              "❌ VM size is required. Use --size <vmSize>",
            );
            return;
          }
          if (!options.metrics) {
            this.context.logger.error(
              "❌ Metrics input is required. Use --metrics <json|string>",
            );
            return;
          }

          const rawMetrics = await this.loadJsonInput(
            options.metrics,
            "metrics",
          );
          const { PerformanceAnalyzer } = await import("./performance");
          const diskAnalysis = PerformanceAnalyzer.analyzeDiskPerformance(
            options.tier,
            rawMetrics,
            options.size,
          );

          this.context.logger.info(`\n💾 Disk analysis for ${options.size}`);
          this.context.logger.info(
            `   Current tier: ${diskAnalysis.currentTier}`,
          );
          this.context.logger.info(
            `   Recommended tier: ${diskAnalysis.recommendations.recommendedTier}`,
          );
          this.context.logger.info(
            `   Reasoning: ${diskAnalysis.recommendations.reasoning}`,
          );
          this.context.logger.info(
            `   Performance gain: ${diskAnalysis.recommendations.performanceGain}`,
          );
          this.context.logger.info(
            `   Cost impact: ${diskAnalysis.recommendations.costImpact}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to analyze disk performance: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-compare")
      .description("Compare multiple VM sizes for a workload profile")
      .option("-s, --sizes <sizes>", "Comma-separated list of VM sizes", "")
      .option(
        "-p, --profile <profile>",
        "Workload profile (cpu-intensive, memory-intensive, io-intensive, balanced)",
        "balanced",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          const sizeList = (options.sizes || "")
            .split(",")
            .map((size: string) => size.trim())
            .filter((size: string) => size.length > 0);

          if (sizeList.length === 0) {
            this.context.logger.error(
              "❌ At least one VM size is required. Use --sizes <size1,size2,...>",
            );
            return;
          }

          const { PerformanceAnalyzer } = await import("./performance");
          const comparison = PerformanceAnalyzer.compareVmPerformance(
            sizeList,
            options.profile,
          );

          this.context.logger.info(
            `\n📈 VM performance comparison for profile "${options.profile}"`,
          );
          comparison.slice(0, 5).forEach((result, index) => {
            this.context!.logger.info(
              `   ${index + 1}. ${result.vmSize} (score: ${result.suitabilityScore.toFixed(1)})`,
            );
            this.context!.logger.info(`      Pros: ${result.pros.join("; ")}`);
            if (result.cons.length > 0) {
              this.context!.logger.info(
                `      Cons: ${result.cons.join("; ")}`,
              );
            }
          });
        } catch (error) {
          this.context.logger.error(
            `Failed to compare VM performance: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-load")
      .description("Analyze workload metrics to detect scaling patterns")
      .option(
        "-m, --metrics <metrics>",
        "Array of metrics with timestamp,cpuPercent,memoryPercent (JSON string or file)",
        "",
      )
      .option("-o, --output <file>", "Write load pattern to JSON file")
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.metrics) {
            this.context.logger.error(
              "❌ Metrics input is required. Use --metrics <json|string>",
            );
            return;
          }

          const rawMetrics = await this.loadJsonInput(
            options.metrics,
            "metrics",
          );
          if (!Array.isArray(rawMetrics)) {
            this.context.logger.error(
              "❌ Metrics input must be an array of records.",
            );
            return;
          }
          const normalized = rawMetrics.map((entry: any) => ({
            ...entry,
            timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
          }));

          const { AutoscaleEngine } = await import("./performance");
          const pattern = AutoscaleEngine.analyzeLoadPattern(normalized);

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(pattern, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Load pattern written to ${options.output}`,
            );
          }

          this.context.logger.info(
            `\n📊 Load pattern detected: ${pattern.patternType.toUpperCase()}`,
          );
          this.context.logger.info(`   Confidence: ${pattern.confidence}%`);
          this.context.logger.info(
            `   Average load: ${pattern.characteristics.averageLoad.toFixed(1)}%`,
          );
          this.context.logger.info(
            `   Peak load: ${pattern.characteristics.peakLoad.toFixed(1)}%`,
          );
          this.context.logger.info(
            `   Recommended instances: ${pattern.scalingRecommendations.recommendedMinInstances}-${pattern.scalingRecommendations.recommendedMaxInstances}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to analyze load pattern: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-autoscale")
      .description("Generate an autoscale configuration from a load pattern")
      .option("-r, --resource-uri <uri>", "VMSS resource URI", "")
      .option(
        "-p, --pattern <pattern>",
        "Load pattern JSON (string or file)",
        "",
      )
      .option("--predictive", "Enable predictive autoscale")
      .option("--cost", "Optimize for cost (slower scale-out)")
      .option(
        "--performance",
        "Optimize for performance (more aggressive scaling)",
      )
      .option(
        "--notify <email>",
        "Notification email (repeatable)",
        (value: string, previous: string[] = []) => {
          previous.push(value);
          return previous;
        },
      )
      .option(
        "-o, --output <file>",
        "Write autoscale configuration to JSON file",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.resourceUri) {
            this.context.logger.error(
              "❌ Resource URI is required. Use --resource-uri <uri>",
            );
            return;
          }
          if (!options.pattern) {
            this.context.logger.error(
              "❌ Load pattern input is required. Use --pattern <json|string>",
            );
            return;
          }

          const loadPattern = await this.loadJsonInput(
            options.pattern,
            "pattern",
          );
          const { AutoscaleEngine } = await import("./performance");
          const config = AutoscaleEngine.generateAutoscaleConfiguration(
            options.resourceUri,
            loadPattern,
            {
              enablePredictive: Boolean(options.predictive),
              costOptimized: Boolean(options.cost),
              performanceOptimized: Boolean(options.performance),
              notificationEmails: options.notify,
            },
          );

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(config, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Autoscale configuration written to ${options.output}`,
            );
          }

          this.context.logger.info(
            `\n🚀 Autoscale configuration generated for ${options.resourceUri}`,
          );
          this.context.logger.info(`   Profiles: ${config.profiles.length}`);
          if (config.profiles[0]) {
            const capacity = config.profiles[0].capacity;
            this.context.logger.info(
              `   Default capacity: ${capacity.minimum}-${capacity.maximum} (default ${capacity.default})`,
            );
            this.context.logger.info(
              `   Rules: ${config.profiles[0].rules.length}`,
            );
          }
          if (config.predictiveAutoscalePolicy) {
            this.context.logger.info(
              `   Predictive scaling: ${config.predictiveAutoscalePolicy.scaleMode}`,
            );
          }
        } catch (error) {
          this.context.logger.error(
            `Failed to generate autoscale configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("pf-simulate")
      .description("Simulate autoscale behaviour against historical metrics")
      .option(
        "-m, --metrics <metrics>",
        "Array of metrics with timestamp,cpuPercent,instances (JSON string or file)",
        "",
      )
      .option(
        "-c, --config <config>",
        "Autoscale configuration JSON (string or file)",
        "",
      )
      .option(
        "--vm-size <vmSize>",
        "VM size for cost modelling",
        "Standard_D2s_v3",
      )
      .option("-o, --output <file>", "Write simulation results to JSON file")
      .action(async (options) => {
        if (!this.context) return;
        try {
          if (!options.metrics) {
            this.context.logger.error(
              "❌ Metrics input is required. Use --metrics <json|string>",
            );
            return;
          }
          if (!options.config) {
            this.context.logger.error(
              "❌ Autoscale configuration is required. Use --config <json|string>",
            );
            return;
          }

          const metricsRaw = await this.loadJsonInput(
            options.metrics,
            "metrics",
          );
          if (!Array.isArray(metricsRaw)) {
            this.context.logger.error(
              "❌ Metrics input must be an array of records.",
            );
            return;
          }
          const metrics = metricsRaw.map((entry: any) => ({
            ...entry,
            timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
          }));

          const config = await this.loadJsonInput(options.config, "config");

          const { AutoscaleEngine } = await import("./performance");
          const simulation = AutoscaleEngine.simulateScaling(
            metrics,
            config,
            options.vmSize,
          );

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(simulation, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Simulation results written to ${options.output}`,
            );
          }

          this.context.logger.info(`\n🧪 Autoscale simulation summary`);
          this.context.logger.info(
            `   Scale events: ${simulation.summary.totalScaleEvents}`,
          );
          this.context.logger.info(
            `   Average instances: ${simulation.summary.averageInstances.toFixed(2)}`,
          );
          this.context.logger.info(
            `   Total cost (simulated): $${simulation.summary.totalCost.toFixed(2)}`,
          );
          this.context.logger.info(
            `   Performance score: ${simulation.summary.performanceScore.toFixed(1)}`,
          );
          this.context.logger.info(
            `   Efficiency score: ${simulation.summary.efficiencyScore.toFixed(1)}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to simulate autoscale behaviour: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    // ========================================
    // Monitoring Alert Commands
    // ========================================

    const collectValues = (value: string, previous: string[] = []) => {
      previous.push(value);
      return previous;
    };

    vmCommand
      .command("mon-alert-cpu")
      .description("Generate a CPU utilization metric alert definition")
      .requiredOption(
        "--resource-id <id>",
        "Target resource ID (e.g., VM resource ID)",
      )
      .option("--threshold <percent>", "CPU percentage threshold", "80")
      .option(
        "--severity <0-4>",
        "Alert severity (0=Sev0, 4=Informational)",
        "2",
      )
      .option(
        "--frequency <duration>",
        "Evaluation frequency (ISO 8601 duration)",
        "PT1M",
      )
      .option(
        "--window <duration>",
        "Alert evaluation window (ISO 8601 duration)",
        "PT5M",
      )
      .option(
        "--action-group <id>",
        "Action group resource ID (repeatable)",
        collectValues,
      )
      .option(
        "--email <address>",
        "Notification email (repeatable)",
        collectValues,
      )
      .option("--output <file>", "Write alert definition JSON to file")
      .option(
        "--arm",
        "Emit Azure metric alert resource payload instead of logical definition",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          const threshold = Number(options.threshold);
          const severity = Number(options.severity) as 0 | 1 | 2 | 3 | 4;
          if (Number.isNaN(threshold)) {
            this.context.logger.error("❌ Threshold must be a number");
            return;
          }
          if (Number.isNaN(severity) || severity < 0 || severity > 4) {
            this.context.logger.error("❌ Severity must be between 0 and 4");
            return;
          }

          const { MonitoringAlertEngine } = await import("./monitoring");
          const definition = MonitoringAlertEngine.createCpuAlert({
            resourceId: options.resourceId,
            threshold,
            severity,
            evaluationFrequency: options.frequency,
            windowSize: options.window,
            actionGroupIds: options.actionGroup,
            emails: options.email,
          });

          let outputPayload: unknown = definition;
          if (options.arm) {
            outputPayload =
              MonitoringAlertEngine.toMetricAlertResource(definition);
          }

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(outputPayload, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Alert definition written to ${options.output}`,
            );
          } else {
            this.context.logger.info(JSON.stringify(outputPayload, null, 2));
          }

          this.context.logger.info(
            `⚙️  CPU alert ready for resource ${options.resourceId}`,
          );
          this.context.logger.info(
            `   Threshold: ${threshold}% | Severity: ${severity}`,
          );
          this.context.logger.info(
            `   Window: ${options.window} | Frequency: ${options.frequency}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to generate CPU alert: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("mon-alert-memory")
      .description("Generate a low available memory metric alert definition")
      .requiredOption("--resource-id <id>", "Target resource ID")
      .option(
        "--threshold-mb <value>",
        "Available memory threshold (MB)",
        "512",
      )
      .option(
        "--severity <0-4>",
        "Alert severity (0=Sev0, 4=Informational)",
        "3",
      )
      .option(
        "--frequency <duration>",
        "Evaluation frequency (ISO 8601 duration)",
        "PT5M",
      )
      .option(
        "--window <duration>",
        "Alert evaluation window (ISO 8601 duration)",
        "PT10M",
      )
      .option(
        "--action-group <id>",
        "Action group resource ID (repeatable)",
        collectValues,
      )
      .option(
        "--email <address>",
        "Notification email (repeatable)",
        collectValues,
      )
      .option("--output <file>", "Write alert definition JSON to file")
      .option(
        "--arm",
        "Emit Azure metric alert resource payload instead of logical definition",
      )
      .action(async (options) => {
        if (!this.context) return;
        try {
          const thresholdMb = Number(
            options.thresholdMb ||
              options.thresholdmb ||
              options["threshold-mb"],
          );
          if (Number.isNaN(thresholdMb)) {
            this.context.logger.error("❌ threshold-mb must be a number");
            return;
          }
          const severity = Number(options.severity) as 0 | 1 | 2 | 3 | 4;
          if (Number.isNaN(severity) || severity < 0 || severity > 4) {
            this.context.logger.error("❌ Severity must be between 0 and 4");
            return;
          }

          const { MonitoringAlertEngine } = await import("./monitoring");
          const definition = MonitoringAlertEngine.createMemoryAlert({
            resourceId: options.resourceId,
            thresholdMb,
            severity,
            evaluationFrequency: options.frequency,
            windowSize: options.window,
            actionGroupIds: options.actionGroup,
            emails: options.email,
          });

          let outputPayload: unknown = definition;
          if (options.arm) {
            outputPayload =
              MonitoringAlertEngine.toMetricAlertResource(definition);
          }

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(outputPayload, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Alert definition written to ${options.output}`,
            );
          } else {
            this.context.logger.info(JSON.stringify(outputPayload, null, 2));
          }

          this.context.logger.info(
            `🧠 Memory alert ready for resource ${options.resourceId}`,
          );
          this.context.logger.info(
            `   Threshold: ${thresholdMb} MB | Severity: ${severity}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to generate memory alert: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("mon-alert-cost")
      .description("Generate a cost anomaly log alert definition")
      .requiredOption("--scope-id <id>", "Scope resource ID for cost analysis")
      .option("--threshold <percent>", "Cost increase threshold (%)", "20")
      .option("--severity <0-4>", "Alert severity", "2")
      .option(
        "--frequency <duration>",
        "Evaluation frequency (ISO 8601 duration)",
        "PT30M",
      )
      .option(
        "--window <duration>",
        "Evaluation window (ISO 8601 duration)",
        "P1D",
      )
      .option(
        "--action-group <id>",
        "Action group resource ID (repeatable)",
        collectValues,
      )
      .option(
        "--email <address>",
        "Notification email (repeatable)",
        collectValues,
      )
      .option(
        "--workspace-id <id>",
        "Log Analytics workspace resource ID (required for --arm output)",
      )
      .option("--output <file>", "Write alert definition JSON to file")
      .option("--arm", "Emit Azure scheduled query alert resource payload")
      .action(async (options) => {
        if (!this.context) return;
        try {
          const thresholdPercent = Number(options.threshold);
          if (Number.isNaN(thresholdPercent)) {
            this.context.logger.error("❌ Threshold must be numeric");
            return;
          }
          const severity = Number(options.severity) as 0 | 1 | 2 | 3 | 4;
          if (Number.isNaN(severity) || severity < 0 || severity > 4) {
            this.context.logger.error("❌ Severity must be between 0 and 4");
            return;
          }

          const { MonitoringAlertEngine } = await import("./monitoring");
          const definition = MonitoringAlertEngine.createCostAnomalyAlert({
            scopeId: options.scopeId,
            thresholdPercent,
            severity,
            evaluationFrequency: options.frequency,
            windowSize: options.window,
            actionGroupIds: options.actionGroup,
            emails: options.email,
          });

          let outputPayload: unknown = definition;
          if (options.arm) {
            if (!options.workspaceId) {
              this.context.logger.error(
                "❌ --workspace-id is required when using --arm",
              );
              return;
            }
            outputPayload = MonitoringAlertEngine.toScheduledQueryResource(
              definition,
              options.workspaceId,
            );
          }

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(outputPayload, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Alert definition written to ${options.output}`,
            );
          } else {
            this.context.logger.info(JSON.stringify(outputPayload, null, 2));
          }

          this.context.logger.info(
            `💰 Cost anomaly alert ready for scope ${options.scopeId}`,
          );
          this.context.logger.info(
            `   Threshold: ${thresholdPercent}% | Severity: ${severity}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to generate cost anomaly alert: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    vmCommand
      .command("mon-alert-scaling")
      .description(
        "Generate a scaling failure alert definition for VM scale sets",
      )
      .requiredOption("--resource-id <id>", "VMSS resource ID")
      .option(
        "--failures <count>",
        "Number of failures in the window to trigger",
        "3",
      )
      .option("--severity <0-4>", "Alert severity", "2")
      .option(
        "--frequency <duration>",
        "Evaluation frequency (ISO 8601 duration)",
        "PT5M",
      )
      .option(
        "--window <duration>",
        "Evaluation window (ISO 8601 duration)",
        "PT30M",
      )
      .option(
        "--action-group <id>",
        "Action group resource ID (repeatable)",
        collectValues,
      )
      .option(
        "--email <address>",
        "Notification email (repeatable)",
        collectValues,
      )
      .option(
        "--workspace-id <id>",
        "Log Analytics workspace resource ID (required for --arm output)",
      )
      .option("--output <file>", "Write alert definition JSON to file")
      .option("--arm", "Emit Azure scheduled query alert resource payload")
      .action(async (options) => {
        if (!this.context) return;
        try {
          const failureThreshold = Number(options.failures);
          if (Number.isNaN(failureThreshold) || failureThreshold <= 0) {
            this.context.logger.error("❌ failures must be a positive number");
            return;
          }
          const severity = Number(options.severity) as 0 | 1 | 2 | 3 | 4;
          if (Number.isNaN(severity) || severity < 0 || severity > 4) {
            this.context.logger.error("❌ Severity must be between 0 and 4");
            return;
          }

          const { MonitoringAlertEngine } = await import("./monitoring");
          const definition = MonitoringAlertEngine.createScalingHealthAlert({
            resourceId: options.resourceId,
            failureCountThreshold: failureThreshold,
            severity,
            evaluationFrequency: options.frequency,
            windowSize: options.window,
            actionGroupIds: options.actionGroup,
            emails: options.email,
          });

          let outputPayload: unknown = definition;
          if (options.arm) {
            if (!options.workspaceId) {
              this.context.logger.error(
                "❌ --workspace-id is required when using --arm",
              );
              return;
            }
            outputPayload = MonitoringAlertEngine.toScheduledQueryResource(
              definition,
              options.workspaceId,
            );
          }

          if (options.output) {
            const fs = await import("fs/promises");
            await fs.writeFile(
              options.output,
              JSON.stringify(outputPayload, null, 2),
              "utf8",
            );
            this.context.logger.info(
              `✅ Alert definition written to ${options.output}`,
            );
          } else {
            this.context.logger.info(JSON.stringify(outputPayload, null, 2));
          }

          this.context.logger.info(
            `🚨 Scaling alert ready for ${options.resourceId}`,
          );
          this.context.logger.info(
            `   Failure threshold: ${failureThreshold} | Severity: ${severity}`,
          );
        } catch (error) {
          this.context.logger.error(
            `Failed to generate scaling alert: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

    // ========================================
    // High Availability Commands (Flat Structure)
    // ========================================

    program
      .command("zones")
      .description("List availability zones for a region")
      .option("-r, --region <region>", "Azure region", "eastus")
      .action((options) => {
        if (this.context) {
          const helpers = this.getHandlebarsHelpers();
          const zones = helpers["availability:zones"](options.region);
          this.context.logger.info(
            `Availability zones in ${options.region}: ${zones.join(", ")}`,
          );
        }
      });

    program
      .command("zone-check")
      .description("Check if a region supports availability zones")
      .option("-r, --region <region>", "Azure region", "eastus")
      .action((options) => {
        if (this.context) {
          const helpers = this.getHandlebarsHelpers();
          const supported = helpers["availability:supportsZones"](
            options.region,
          );
          this.context.logger.info(
            `Zone support for ${options.region}: ${supported ? "Yes" : "No"}`,
          );
        }
      });

    program
      .command("sla")
      .description("Calculate SLA for availability configuration")
      .option(
        "-t, --type <type>",
        "Configuration type (set, zone, vmss)",
        "set",
      )
      .option(
        "-o, --orchestration <mode>",
        "VMSS orchestration mode",
        "Flexible",
      )
      .action((options) => {
        if (this.context) {
          const helpers = this.getHandlebarsHelpers();
          let sla: number;
          if (options.type === "set") {
            sla = helpers["availability:setSLA"](2); // Default 2 VMs for SLA calculation
          } else if (options.type === "zone") {
            sla = helpers["availability:zoneSLA"](1, 1); // 1 VM in 1 zone
          } else {
            sla = helpers["availability:vmssSLA"](
              options.orchestration === "Flexible" ? 1 : 0,
              2,
            );
          }
          this.context.logger.info(`SLA for ${options.type}: ${sla}%`);
        }
      });

    program
      .command("ha-config")
      .description("Recommend high availability configuration")
      .option("-v, --vm-count <count>", "Number of VMs", "3")
      .option(
        "-c, --criticality <level>",
        "Workload criticality (low, medium, high)",
        "medium",
      )
      .action((options) => {
        const vmCount = parseInt(options.vmCount);
        const criticality = options.criticality.toLowerCase();

        if (this.context) {
          this.context.logger.info("Recommended HA Configuration:");

          if (vmCount === 1) {
            this.context.logger.info(
              "  Type: Single VM with Premium SSD (SLA: 99.9%)",
            );
            this.context.logger.info(
              "  Consider: Use availability zones for critical workloads",
            );
          } else if (vmCount === 2) {
            if (criticality === "high") {
              this.context.logger.info(
                "  Type: 2 VMs across availability zones (SLA: 99.99%)",
              );
            } else {
              this.context.logger.info(
                "  Type: Availability Set with 2 fault domains (SLA: 99.95%)",
              );
            }
          } else {
            if (criticality === "high") {
              this.context.logger.info(
                "  Type: VMSS Flexible with zone distribution (SLA: 99.99%)",
              );
            } else {
              this.context.logger.info(
                "  Type: VMSS Flexible or Availability Set (SLA: 99.95%)",
              );
            }
          }
        }
      });

    // ========================================
    // Disaster Recovery Commands (Flat Structure)
    // ========================================

    program
      .command("backup-size")
      .description("Estimate backup storage requirements")
      .option("-s, --vm-size <size>", "VM disk size in GB", "128")
      .option("-c, --change-rate <rate>", "Daily change rate (0-1)", "0.05")
      .option("-r, --retention <days>", "Retention days", "30")
      .action((options) => {
        const vmSize = parseInt(options.vmSize);
        const changeRate = parseFloat(options.changeRate);
        const retention = parseInt(options.retention);

        if (this.context) {
          const helpers = this.getHandlebarsHelpers();
          const estimate = helpers["recovery:estimateBackupStorage"](
            vmSize,
            changeRate,
            retention,
          );
          this.context.logger.info(
            `Backup storage estimate: ${Math.round(estimate)} GB`,
          );
          this.context.logger.info(`  VM size: ${vmSize} GB`);
          this.context.logger.info(
            `  Daily change: ${(changeRate * 100).toFixed(1)}%`,
          );
          this.context.logger.info(`  Retention: ${retention} days`);
        }
      });

    program
      .command("region-pairs")
      .description("List Azure region pairs for disaster recovery")
      .option("-r, --region <region>", "Source region (optional)")
      .action((options) => {
        if (this.context) {
          const helpers = this.getHandlebarsHelpers();

          if (options.region) {
            const target = helpers["recovery:getRecommendedTargetRegion"](
              options.region,
            );
            this.context.logger.info(
              `Paired region for ${options.region}: ${target}`,
            );
          } else {
            this.context.logger.info("Common Azure region pairs:");
            this.context.logger.info("  East US → West US");
            this.context.logger.info("  East US 2 → Central US");
            this.context.logger.info("  West US 2 → West Central US");
            this.context.logger.info("  North Europe → West Europe");
            this.context.logger.info("  Southeast Asia → East Asia");
            this.context.logger.info("  UK South → UK West");
          }
        }
      });

    program
      .command("rto")
      .description("Estimate Recovery Time Objective")
      .option("-v, --vm-count <count>", "Number of VMs", "5")
      .option("-s, --avg-size <size>", "Average VM size in GB", "128")
      .action((options) => {
        const vmCount = parseInt(options.vmCount);
        const avgSize = parseInt(options.avgSize);

        if (this.context) {
          const helpers = this.getHandlebarsHelpers();
          const rto = helpers["recovery:estimateRTO"](vmCount, avgSize);
          this.context.logger.info(`Estimated RTO: ${rto} minutes`);
          this.context.logger.info(`  VMs to recover: ${vmCount}`);
          this.context.logger.info(`  Average VM size: ${avgSize} GB`);
        }
      });

    program
      .command("backup-presets")
      .description("List backup policy presets")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available backup presets:");
          this.context.logger.info(
            "  development: Daily at 2 AM, 7 days retention",
          );
          this.context.logger.info(
            "  production: Daily at 2 AM, 30 days retention",
          );
          this.context.logger.info(
            "  longterm: Daily at 2 AM, 365 days retention, monthly/yearly copies",
          );
        }
      });

    program
      .command("snapshot-policies")
      .description("List snapshot retention policies")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available snapshot retention policies:");
          this.context.logger.info(
            "  hourly: Every hour, 24 snapshots retained",
          );
          this.context.logger.info("  daily: Daily, 7 snapshots retained");
          this.context.logger.info("  weekly: Weekly, 4 snapshots retained");
          this.context.logger.info("  monthly: Monthly, 12 snapshots retained");
        }
      });

    program
      .command("snapshot-schedule")
      .description("Recommend snapshot schedule based on workload")
      .option(
        "-c, --criticality <level>",
        "Workload criticality (low, medium, high)",
        "medium",
      )
      .option(
        "-t, --change-frequency <freq>",
        "Change frequency (low, medium, high)",
        "medium",
      )
      .action((options) => {
        const criticality = options.criticality.toLowerCase();
        const changeFreq = options.changeFrequency.toLowerCase();

        if (this.context) {
          this.context.logger.info("Recommended snapshot schedule:");

          if (criticality === "high" || changeFreq === "high") {
            this.context.logger.info("  Frequency: Hourly");
            this.context.logger.info("  Retention: 24 snapshots (1 day)");
            this.context.logger.info(
              "  Additional: Daily snapshots for 7 days",
            );
          } else if (criticality === "medium" || changeFreq === "medium") {
            this.context.logger.info("  Frequency: Every 4 hours");
            this.context.logger.info("  Retention: 6 snapshots (1 day)");
            this.context.logger.info(
              "  Additional: Daily snapshots for 7 days",
            );
          } else {
            this.context.logger.info("  Frequency: Daily");
            this.context.logger.info("  Retention: 7 snapshots (1 week)");
          }
        }
      });

    // ========================================
    // Networking Commands (Top-Level)
    // ========================================

    // VNet Commands
    const vnetCommand = program
      .command("vnet")
      .description("Virtual Network operations");

    vnetCommand
      .command("list-templates")
      .description("List available VNet template types")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available VNet templates:");
          this.context.logger.info(
            "  - single-tier: Single subnet VNet for simple deployments",
          );
          this.context.logger.info(
            "  - multi-tier: Multi-tier VNet with web, app, and data subnets",
          );
          this.context.logger.info(
            "  - hub-spoke: Hub VNet for hub-spoke topology",
          );
          this.context.logger.info(
            "  - spoke: Spoke VNet for hub-spoke topology",
          );
          this.context.logger.info(
            "  - peered: VNet with peering configuration",
          );
        }
      });

    vnetCommand
      .command("create-template")
      .description("Generate VNet ARM template configuration")
      .option("-t, --type <type>", "VNet template type", "single-tier")
      .option("-n, --name <name>", "VNet name", "myVNet")
      .option("-a, --address <address>", "Address space (CIDR)", "10.0.0.0/16")
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
      .command("subnet")
      .description("Subnet operations");

    subnetCommand
      .command("list-templates")
      .description("List available subnet template types")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available subnet templates:");
          this.context.logger.info("  - web: Web tier subnet (default: /24)");
          this.context.logger.info(
            "  - app: Application tier subnet (default: /24)",
          );
          this.context.logger.info("  - data: Data tier subnet (default: /24)");
          this.context.logger.info(
            "  - gateway: Gateway subnet (default: /27)",
          );
          this.context.logger.info(
            "  - bastion: Azure Bastion subnet (default: /26)",
          );
        }
      });

    // NSG Commands
    const nsgCommand = program
      .command("nsg")
      .description("Network Security Group operations");

    nsgCommand
      .command("list-templates")
      .description("List available NSG rule templates")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available NSG rule templates:");
          this.context.logger.info(
            "  - web: HTTP/HTTPS access (ports 80, 443)",
          );
          this.context.logger.info("  - ssh: SSH access (port 22)");
          this.context.logger.info("  - rdp: RDP access (port 3389)");
          this.context.logger.info(
            "  - database: Database access (ports 1433, 3306, 5432)",
          );
          this.context.logger.info("  - deny-all: Deny all inbound traffic");
        }
      });

    nsgCommand
      .command("create-rule")
      .description("Generate NSG rule configuration")
      .option("-t, --type <type>", "Rule template type", "web")
      .option("-p, --priority <priority>", "Rule priority", "100")
      .option("-s, --source <source>", "Source address prefix", "*")
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
      .command("lb")
      .description("Load Balancer operations");

    lbCommand
      .command("list-templates")
      .description("List available load balancer template types")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available load balancer templates:");
          this.context.logger.info(
            "  - public-web: Public LB for web traffic (ports 80, 443)",
          );
          this.context.logger.info(
            "  - internal-app: Internal LB for app tier",
          );
          this.context.logger.info(
            "  - internal-database: Internal LB for database tier",
          );
          this.context.logger.info(
            "  - internal-ha-ports: Internal LB with HA ports",
          );
          this.context.logger.info(
            "  - public-jumpbox: Public LB for jumpbox access",
          );
        }
      });

    // Application Gateway Commands
    const appgwCommand = program
      .command("appgw")
      .description("Application Gateway operations");

    appgwCommand
      .command("list-templates")
      .description("List available Application Gateway template types")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available Application Gateway templates:");
          this.context.logger.info(
            "  - basic-web: Basic web application gateway",
          );
          this.context.logger.info(
            "  - waf-enabled: WAF-enabled for enhanced security",
          );
          this.context.logger.info(
            "  - multi-site: Multi-site hosting configuration",
          );
          this.context.logger.info(
            "  - high-security: High-security with SSL policies",
          );
        }
      });

    // Bastion Commands
    const bastionCommand = program
      .command("bastion")
      .description("Azure Bastion operations");

    bastionCommand
      .command("list-skus")
      .description("List available Bastion SKUs")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available Bastion SKUs:");
          this.context.logger.info("  - basic: Basic SKU (2 scale units)");
          this.context.logger.info(
            "  - standard: Standard SKU (2-50 scale units)",
          );
          this.context.logger.info(
            "  - premium: Premium SKU with advanced features",
          );
        }
      });

    // Peering Commands
    const peeringCommand = program
      .command("peering")
      .description("VNet Peering operations");

    peeringCommand
      .command("list-topologies")
      .description("List available peering topology templates")
      .action(() => {
        if (this.context) {
          this.context.logger.info("Available peering topologies:");
          this.context.logger.info(
            "  - hub-vnet: Hub VNet in hub-spoke topology",
          );
          this.context.logger.info(
            "  - spoke-vnet: Spoke VNet in hub-spoke topology",
          );
          this.context.logger.info("  - mesh-vnet: VNet in mesh topology");
          this.context.logger.info(
            "  - point-to-point: Direct VNet-to-VNet peering",
          );
          this.context.logger.info(
            "  - transit-vnet: Transit VNet for routing",
          );
        }
      });

    // ========================================
    // Extension Commands
    // ========================================
    const extCommand = program
      .command("ext")
      .description("VM Extension commands");

    extCommand
      .command("list")
      .description("List all available VM extensions")
      .option(
        "-c, --category <category>",
        "Filter by category (windows, linux, crossplatform)",
      )
      .action((options) => {
        if (!this.context) return;

        const { extensionsCatalog } = require("./extensions");
        let extensions = extensionsCatalog;

        if (options.category) {
          extensions = extensions.filter(
            (ext: any) => ext.category === options.category,
          );
        }

        this.context.logger.info(
          `Available VM Extensions (${extensions.length}):`,
        );
        extensions.forEach((ext: any) => {
          this.context!.logger.info(`  - ${ext.displayName} (${ext.platform})`);
          this.context!.logger.info(`    ${ext.description}`);
          this.context!.logger.info(
            `    Publisher: ${ext.publisher}, Type: ${ext.type}, Version: ${ext.version}`,
          );
          this.context!.logger.info(`    Priority: ${ext.priority}`);
        });
      });

    extCommand
      .command("list-windows")
      .description("List Windows-specific extensions")
      .action(() => {
        if (!this.context) return;

        const { extensionsCatalog } = require("./extensions");
        const extensions = extensionsCatalog.filter(
          (ext: any) => ext.category === "windows",
        );

        this.context.logger.info(
          `Windows VM Extensions (${extensions.length}):`,
        );
        extensions.forEach((ext: any) => {
          this.context!.logger.info(
            `  - ${ext.displayName}: ${ext.description}`,
          );
        });
      });

    extCommand
      .command("list-linux")
      .description("List Linux-specific extensions")
      .action(() => {
        if (!this.context) return;

        const { extensionsCatalog } = require("./extensions");
        const extensions = extensionsCatalog.filter(
          (ext: any) => ext.category === "linux",
        );

        this.context.logger.info(`Linux VM Extensions (${extensions.length}):`);
        extensions.forEach((ext: any) => {
          this.context!.logger.info(
            `  - ${ext.displayName}: ${ext.description}`,
          );
        });
      });

    extCommand
      .command("list-crossplatform")
      .description("List cross-platform extensions")
      .action(() => {
        if (!this.context) return;

        const { extensionsCatalog } = require("./extensions");
        const extensions = extensionsCatalog.filter(
          (ext: any) => ext.category === "crossplatform",
        );

        this.context.logger.info(
          `Cross-Platform VM Extensions (${extensions.length}):`,
        );
        extensions.forEach((ext: any) => {
          this.context!.logger.info(
            `  - ${ext.displayName} (${ext.platform}): ${ext.description}`,
          );
        });
      });

    // ========================================
    // Security Commands
    // ========================================
    const securityCommand = program
      .command("security")
      .description("VM Security commands");

    securityCommand
      .command("list")
      .description("List all available security templates")
      .action(() => {
        if (!this.context) return;

        const { securityTemplates } = require("./security");

        this.context.logger.info(
          `Available Security Templates (${securityTemplates.length}):`,
        );
        securityTemplates.forEach((template: any, index: number) => {
          this.context!.logger.info(`\n${index + 1}. ${template.name}`);
          this.context!.logger.info(`   Description: ${template.description}`);
          this.context!.logger.info(
            `   Features: ${template.features.join(", ")}`,
          );
        });
      });

    securityCommand
      .command("list-encryption")
      .description("List encryption options")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Encryption Options:");
        this.context.logger.info("\n1. Azure Disk Encryption (ADE)");
        this.context.logger.info("   - BitLocker (Windows) / dm-crypt (Linux)");
        this.context.logger.info("   - Key Vault integration");
        this.context.logger.info("\n2. Server-Side Encryption (SSE)");
        this.context.logger.info("   - Platform-managed keys (PMK)");
        this.context.logger.info("   - Customer-managed keys (CMK)");
        this.context.logger.info("\n3. Encryption at Host");
        this.context.logger.info("   - VM host-level encryption");
        this.context.logger.info("   - Temp disk and cache encryption");
      });

    securityCommand
      .command("list-trusted-launch")
      .description("List Trusted Launch features")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Trusted Launch Features:");
        this.context.logger.info("\n1. Secure Boot");
        this.context.logger.info("   - Boot integrity protection");
        this.context.logger.info("   - Prevent malicious bootloaders");
        this.context.logger.info("\n2. vTPM (Virtual Trusted Platform Module)");
        this.context.logger.info("   - Hardware security module");
        this.context.logger.info("   - Key storage and attestation");
        this.context.logger.info("\n3. Boot Integrity Monitoring");
        this.context.logger.info("   - Azure Security Center integration");
        this.context.logger.info("   - Continuous monitoring");
        this.context.logger.info("\n4. Guest Attestation");
        this.context.logger.info("   - Runtime attestation");
        this.context.logger.info("   - Security policy enforcement");
        this.context.logger.info("\n5. Measured Boot");
        this.context.logger.info("   - Boot chain measurements");
        this.context.logger.info("   - TPM-based validation");
      });

    securityCommand
      .command("list-compliance")
      .description("List compliance frameworks")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Compliance Frameworks:");
        this.context.logger.info("\n1. SOC2");
        this.context.logger.info("2. HIPAA");
        this.context.logger.info("3. ISO 27001");
        this.context.logger.info("4. FedRAMP");
        this.context.logger.info("5. PCI-DSS");
        this.context.logger.info("6. GDPR");
      });

    // ========================================
    // Identity Commands
    // ========================================
    const identityCommand = program
      .command("identity")
      .description("Identity and Access commands");

    identityCommand
      .command("list")
      .description("List all available identity templates")
      .action(() => {
        if (!this.context) return;

        const { identityTemplates } = require("./identity");

        this.context.logger.info(
          `Available Identity Templates (${identityTemplates.length}):`,
        );
        identityTemplates.forEach((template: any, index: number) => {
          this.context!.logger.info(`\n${index + 1}. ${template.name}`);
          this.context!.logger.info(`   Description: ${template.description}`);
          this.context!.logger.info(
            `   Features: ${template.features.join(", ")}`,
          );
        });
      });

    identityCommand
      .command("list-managed-identity")
      .description("List managed identity options")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Managed Identity Options:");
        this.context.logger.info("\n1. System-Assigned Identity");
        this.context.logger.info("   - Automatic lifecycle management");
        this.context.logger.info("   - Tied to VM lifecycle");
        this.context.logger.info("\n2. User-Assigned Identity");
        this.context.logger.info("   - Independent lifecycle");
        this.context.logger.info("   - Shared across resources");
        this.context.logger.info("\n3. Multiple Identities (Hybrid)");
        this.context.logger.info("   - Both system and user-assigned");
        this.context.logger.info("   - Maximum flexibility");
      });

    identityCommand
      .command("list-aad-features")
      .description("List Azure AD integration features")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Azure AD Integration Features:");
        this.context.logger.info("\n1. AAD SSH Login (Linux)");
        this.context.logger.info("   - SSH with Azure AD credentials");
        this.context.logger.info("   - Passwordless authentication");
        this.context.logger.info("\n2. AAD RDP Login (Windows)");
        this.context.logger.info("   - RDP with Azure AD credentials");
        this.context.logger.info("   - Windows Hello support");
        this.context.logger.info("\n3. Conditional Access");
        this.context.logger.info("   - Location-based policies");
        this.context.logger.info("   - Device compliance checks");
        this.context.logger.info("\n4. Multi-Factor Authentication");
        this.context.logger.info("   - Phone, email, authenticator app");
        this.context.logger.info("   - FIDO2 security keys");
      });

    identityCommand
      .command("list-rbac-roles")
      .description("List built-in RBAC roles for VMs")
      .action(() => {
        if (!this.context) return;

        this.context.logger.info("Built-in RBAC Roles for Virtual Machines:");
        this.context.logger.info("\n1. Virtual Machine Contributor");
        this.context.logger.info("   - Full VM management");
        this.context.logger.info("\n2. Virtual Machine Administrator Login");
        this.context.logger.info("   - Admin SSH/RDP access");
        this.context.logger.info("\n3. Virtual Machine User Login");
        this.context.logger.info("   - Standard user SSH/RDP access");
        this.context.logger.info("\n4. Reader");
        this.context.logger.info("   - Read-only access");
        this.context.logger.info("\n5. Contributor");
        this.context.logger.info("   - Full management (all resources)");
      });

    // ========================================
    // Monitoring Commands
    // ========================================
    const monitorCommand = program
      .command("mon")
      .description("Azure Monitor and observability commands");

    monitorCommand
      .command("workspace")
      .description("Generate Log Analytics workspace configuration")
      .requiredOption("-n, --name <name>", "Workspace name")
      .requiredOption("-l, --location <location>", "Azure region")
      .option("-s, --sku <sku>", "Workspace SKU", "PerGB2018")
      .option("-r, --retention <days>", "Data retention in days", "30")
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerMonitoringHelpers();

        const helper = Handlebars.helpers["monitor:logAnalyticsWorkspace"];
        const result = helper.call(null, {
          hash: {
            name: options.name,
            location: options.location,
            sku: options.sku,
            retentionInDays: parseInt(options.retention),
          },
        });

        this.context.logger.info("Log Analytics Workspace configuration:");
        this.context.logger.info(result);
      });

    monitorCommand
      .command("diagnostics")
      .description("Generate diagnostic settings configuration")
      .requiredOption("-n, --name <name>", "Diagnostic setting name")
      .requiredOption("-r, --resource-id <id>", "Target resource ID")
      .requiredOption("-w, --workspace-id <id>", "Log Analytics workspace ID")
      .option("-l, --logs <categories>", "Log categories (JSON array)", "[]")
      .option(
        "-m, --metrics <categories>",
        "Metric categories (JSON array)",
        "[]",
      )
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerMonitoringHelpers();

        const helper = Handlebars.helpers["monitor:diagnosticSettings"];
        const result = helper.call(null, {
          hash: {
            name: options.name,
            targetResourceId: options.resourceId,
            workspaceId: options.workspaceId,
            logs: options.logs,
            metrics: options.metrics,
          },
        });

        this.context.logger.info("Diagnostic Settings configuration:");
        this.context.logger.info(result);
      });

    monitorCommand
      .command("metrics")
      .description("Generate metrics collection configuration")
      .requiredOption("-r, --resource-id <id>", "Target resource ID")
      .requiredOption("-m, --metrics <names>", "Metric names (JSON array)")
      .option("-a, --aggregation <type>", "Aggregation type", "Average")
      .option("-f, --frequency <freq>", "Collection frequency", "PT1M")
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerMonitoringHelpers();

        const helper = Handlebars.helpers["monitor:metrics"];
        const result = helper.call(null, {
          hash: {
            targetResourceId: options.resourceId,
            metrics: options.metrics,
            aggregation: options.aggregation,
            frequency: options.frequency,
          },
        });

        this.context.logger.info("Metrics configuration:");
        this.context.logger.info(result);
      });

    // ========================================
    // Alert Commands
    // ========================================
    const alertCommand = program
      .command("alert")
      .description("Azure Monitor alert commands");

    alertCommand
      .command("metric")
      .description("Generate metric alert configuration")
      .requiredOption("-n, --name <name>", "Alert name")
      .requiredOption("-s, --scopes <ids>", "Resource scopes (JSON array)")
      .requiredOption("-c, --criteria <json>", "Alert criteria (JSON array)")
      .option("-d, --description <desc>", "Alert description")
      .option("--severity <level>", "Alert severity (0-4)", "2")
      .option("--frequency <freq>", "Evaluation frequency", "PT5M")
      .option("--window <size>", "Time window", "PT15M")
      .option("-a, --action-groups <ids>", "Action group IDs (JSON array)")
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerAlertHelpers();

        const helper = Handlebars.helpers["alert:metricAlert"];
        const result = helper.call(null, {
          name: options.name,
          description:
            options.description || `Metric alert for ${options.name}`,
          severity: parseInt(options.severity),
          scopes: options.scopes,
          evaluationFrequency: options.frequency,
          windowSize: options.window,
          criteria: options.criteria,
          actionGroupIds: options.actionGroups,
        });

        this.context.logger.info("Metric Alert configuration:");
        this.context.logger.info(result);
      });

    alertCommand
      .command("log")
      .description("Generate log query alert configuration")
      .requiredOption("-n, --name <name>", "Alert name")
      .requiredOption("-s, --scopes <ids>", "Resource scopes (JSON array)")
      .requiredOption("-q, --query <kql>", "KQL query")
      .option("-d, --description <desc>", "Alert description")
      .option("--severity <level>", "Alert severity (0-4)", "2")
      .option("--frequency <freq>", "Evaluation frequency", "PT5M")
      .option("--window <size>", "Time window", "PT15M")
      .option("--threshold <value>", "Result count threshold", "0")
      .option("-a, --action-groups <ids>", "Action group IDs (JSON array)")
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerAlertHelpers();

        const helper = Handlebars.helpers["alert:logAlert"];
        const result = helper.call(null, {
          name: options.name,
          description: options.description || `Log alert for ${options.name}`,
          severity: parseInt(options.severity),
          scopes: options.scopes,
          evaluationFrequency: options.frequency,
          windowSize: options.window,
          query: options.query,
          threshold: parseInt(options.threshold),
          actionGroupIds: options.actionGroups,
        });

        this.context.logger.info("Log Alert configuration:");
        this.context.logger.info(result);
      });

    alertCommand
      .command("action-group")
      .description("Generate action group configuration")
      .requiredOption("-n, --name <name>", "Action group name")
      .requiredOption("-s, --short-name <short>", "Short name (max 12 chars)")
      .option("-e, --email-receivers <json>", "Email receivers (JSON array)")
      .option("--sms-receivers <json>", "SMS receivers (JSON array)")
      .option("--webhook-receivers <json>", "Webhook receivers (JSON array)")
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerAlertHelpers();

        const helper = Handlebars.helpers["alert:actionGroup"];
        const result = helper.call(null, {
          name: options.name,
          shortName: options.shortName,
          emailReceivers: options.emailReceivers,
          smsReceivers: options.smsReceivers,
          webhookReceivers: options.webhookReceivers,
        });

        this.context.logger.info("Action Group configuration:");
        this.context.logger.info(result);
      });

    // ========================================
    // Dashboard Commands
    // ========================================
    const dashboardCommand = program
      .command("dash")
      .description("Azure Portal dashboard commands");

    dashboardCommand
      .command("vm-health")
      .description("Generate VM health monitoring dashboard")
      .requiredOption("-n, --name <name>", "Dashboard name")
      .requiredOption("-l, --location <location>", "Azure region")
      .requiredOption("-v, --vm-ids <ids>", "VM resource IDs (JSON array)")
      .option("--show-cpu", "Include CPU metrics", true)
      .option("--show-memory", "Include memory metrics", true)
      .option("--show-disk", "Include disk metrics", true)
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerDashboardHelpers();

        const helper = Handlebars.helpers["dashboard:vmHealth"];
        const result = helper.call(null, {
          name: options.name,
          location: options.location,
          vmResourceIds: options.vmIds,
          showCpu: options.showCpu,
          showMemory: options.showMemory,
          showDisk: options.showDisk,
        });

        this.context.logger.info("VM Health Dashboard configuration:");
        this.context.logger.info(result);
      });

    dashboardCommand
      .command("vmss-scaling")
      .description("Generate VMSS autoscaling dashboard")
      .requiredOption("-n, --name <name>", "Dashboard name")
      .requiredOption("-l, --location <location>", "Azure region")
      .requiredOption("-v, --vmss-id <id>", "VMSS resource ID")
      .option("--show-instances", "Include instance count", true)
      .option("--show-cpu", "Include CPU metrics", true)
      .option("--show-network", "Include network metrics", true)
      .action((options) => {
        if (!this.context) return;

        const Handlebars = require("handlebars");
        registerDashboardHelpers();

        const helper = Handlebars.helpers["dashboard:vmssScaling"];
        const result = helper.call(null, {
          name: options.name,
          location: options.location,
          vmssResourceId: options.vmssId,
          showInstanceCount: options.showInstances,
          showCpu: options.showCpu,
          showNetwork: options.showNetwork,
        });

        this.context.logger.info("VMSS Scaling Dashboard configuration:");
        this.context.logger.info(result);
      });
  }
}

/**
 * Default export - plugin instance
 */
export default VmPlugin;
