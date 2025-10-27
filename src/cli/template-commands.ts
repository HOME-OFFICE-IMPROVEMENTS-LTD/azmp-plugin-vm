/**
 * Template CLI Commands
 *
 * Provides commands for generating, validating, testing, and deploying
 * ARM templates for Azure Marketplace VM offerings.
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";
import { PluginContext } from "../types";

/**
 * Helper functions for filesystem operations
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath: string): Promise<void> {
  if (!(await pathExists(dirPath))) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function readJSON(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export interface TemplateCommandsOptions {
  context: PluginContext;
  plugin?: any; // Reference to the plugin instance to access helpers
}

/**
 * Register template commands
 */
export function registerTemplateCommands(
  parentCommand: Command,
  options: TemplateCommandsOptions,
): void {
  const { context, plugin } = options;

  const templateCommand = parentCommand
    .command("template")
    .description("ARM template generation and validation commands");

  // ========================================
  // template generate
  // ========================================
  templateCommand
    .command("generate")
    .description("Generate ARM templates from Handlebars templates")
    .option("-c, --config <path>", "Path to configuration JSON file")
    .option(
      "-o, --output <dir>",
      "Output directory for generated templates",
      "./output",
    )
    .option("--main-only", "Generate only mainTemplate.json")
    .option("--ui-only", "Generate only createUiDefinition.json")
    .option("--view-only", "Generate only viewDefinition.json")
    .action(async (cmdOptions) => {
      try {
        context.logger.info("Starting template generation...");

        // Load configuration
        let config: any = {};
        if (cmdOptions.config) {
          const configPath = path.resolve(cmdOptions.config);
          if (!(await pathExists(configPath))) {
            context.logger.error(`Configuration file not found: ${configPath}`);
            return;
          }
          config = await readJSON(configPath);
          context.logger.info(`Loaded configuration from: ${configPath}`);
        }

        // Ensure output directory exists
        const outputDir = path.resolve(cmdOptions.output);
        await ensureDir(outputDir);

        const templatesDir = path.join(__dirname, "../templates");
        const templates = {
          main: !cmdOptions.uiOnly && !cmdOptions.viewOnly,
          ui: !cmdOptions.mainOnly && !cmdOptions.viewOnly,
          view: !cmdOptions.mainOnly && !cmdOptions.uiOnly,
        };

        let generatedCount = 0;

        // Register all Handlebars helpers from the plugin
        if (plugin && typeof plugin.getHandlebarsHelpers === "function") {
          const helpers = plugin.getHandlebarsHelpers();
          Object.entries(helpers).forEach(([name, helper]) => {
            Handlebars.registerHelper(
              name,
              helper as Handlebars.HelperDelegate,
            );
          });
          context.logger.info(
            `Registered ${Object.keys(helpers).length} Handlebars helper(s)`,
          );
        }

        // Generate mainTemplate.json
        if (templates.main) {
          const mainTemplatePath = path.join(
            templatesDir,
            "mainTemplate.json.hbs",
          );
          if (await pathExists(mainTemplatePath)) {
            const source = await fs.readFile(mainTemplatePath, "utf-8");
            const template = Handlebars.compile(source);
            const output = template(config);

            const outputPath = path.join(outputDir, "mainTemplate.json");
            await fs.writeFile(outputPath, output, "utf-8");
            context.logger.info(`✓ Generated: mainTemplate.json`);
            generatedCount++;
          } else {
            context.logger.warn("mainTemplate.json.hbs not found");
          }
        }

        // Generate createUiDefinition.json
        if (templates.ui) {
          const uiTemplatePath = path.join(
            templatesDir,
            "createUiDefinition.json.hbs",
          );
          if (await pathExists(uiTemplatePath)) {
            const source = await fs.readFile(uiTemplatePath, "utf-8");
            const template = Handlebars.compile(source);
            const output = template(config);

            const outputPath = path.join(outputDir, "createUiDefinition.json");
            await fs.writeFile(outputPath, output, "utf-8");
            context.logger.info(`✓ Generated: createUiDefinition.json`);
            generatedCount++;
          } else {
            context.logger.warn("createUiDefinition.json.hbs not found");
          }
        }

        // Generate viewDefinition.json
        if (templates.view) {
          const viewTemplatePath = path.join(
            templatesDir,
            "viewDefinition.json.hbs",
          );
          if (await pathExists(viewTemplatePath)) {
            const source = await fs.readFile(viewTemplatePath, "utf-8");
            const template = Handlebars.compile(source);
            const output = template(config);

            const outputPath = path.join(outputDir, "viewDefinition.json");
            await fs.writeFile(outputPath, output, "utf-8");
            context.logger.info(`✓ Generated: viewDefinition.json`);
            generatedCount++;
          } else {
            context.logger.warn("viewDefinition.json.hbs not found");
          }
        }

        context.logger.info(
          `\n✅ Successfully generated ${generatedCount} template(s) in: ${outputDir}`,
        );
        context.logger.info(`\nNext steps:`);
        context.logger.info(`  1. Review generated templates`);
        context.logger.info(
          `  2. Run validation: azmp vm template validate ${outputDir}`,
        );
        context.logger.info(
          `  3. Test deployment: azmp vm template test ${outputDir}`,
        );
      } catch (error) {
        context.logger.error(
          `Template generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

  // ========================================
  // template validate
  // ========================================
  templateCommand
    .command("validate")
    .description("Validate ARM template syntax and structure")
    .argument("<path>", "Path to template file or directory")
    .option("--schema-only", "Validate JSON schema only (no ARM-TTK)")
    .option("--parameters", "Validate parameter consistency across templates")
    .action(async (templatePath: string, cmdOptions) => {
      try {
        context.logger.info("Starting template validation...");

        const resolvedPath = path.resolve(templatePath);
        if (!(await pathExists(resolvedPath))) {
          context.logger.error(`Path not found: ${resolvedPath}`);
          return;
        }

        const stats = await fs.stat(resolvedPath);
        const files: string[] = [];

        // Collect files to validate
        if (stats.isDirectory()) {
          const dirFiles = await fs.readdir(resolvedPath);
          for (const file of dirFiles) {
            if (file.endsWith(".json") && !file.includes("parameters")) {
              files.push(path.join(resolvedPath, file));
            }
          }
        } else if (resolvedPath.endsWith(".json")) {
          files.push(resolvedPath);
        } else {
          context.logger.error("Path must be a JSON file or directory");
          return;
        }

        if (files.length === 0) {
          context.logger.warn("No JSON template files found to validate");
          return;
        }

        let allValid = true;
        let totalErrors = 0;
        let totalWarnings = 0;

        // Validate each file
        for (const file of files) {
          const fileName = path.basename(file);
          context.logger.info(`\nValidating: ${fileName}`);

          try {
            // Read and parse JSON
            const content = await fs.readFile(file, "utf-8");
            const json = JSON.parse(content);

            // Schema validation
            if (fileName === "mainTemplate.json") {
              if (
                !json.$schema ||
                !json.$schema.includes("deploymentTemplate.json")
              ) {
                context.logger.error("  ✗ Invalid or missing $schema property");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info("  ✓ Schema is valid");
              }

              if (!json.contentVersion) {
                context.logger.error("  ✗ Missing contentVersion property");
                allValid = false;
                totalErrors++;
              }

              if (!json.parameters) {
                context.logger.warn("  ⚠ No parameters defined");
                totalWarnings++;
              }

              if (!json.resources || json.resources.length === 0) {
                context.logger.error("  ✗ No resources defined");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info(
                  `  ✓ Found ${json.resources.length} resource(s)`,
                );
              }

              if (json.outputs) {
                context.logger.info(
                  `  ✓ Found ${Object.keys(json.outputs).length} output(s)`,
                );
              }
            } else if (fileName === "createUiDefinition.json") {
              if (
                !json.$schema ||
                !json.$schema.includes("createUiDefinition")
              ) {
                context.logger.error("  ✗ Invalid or missing $schema property");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info("  ✓ Schema is valid");
              }

              if (!json.parameters || !json.parameters.steps) {
                context.logger.error("  ✗ Missing parameters.steps array");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info(
                  `  ✓ Found ${json.parameters.steps.length} wizard step(s)`,
                );
              }

              if (!json.parameters || !json.parameters.outputs) {
                context.logger.error("  ✗ Missing parameters.outputs object");
                allValid = false;
                totalErrors++;
              }
            } else if (fileName === "viewDefinition.json") {
              if (!json.$schema || !json.$schema.includes("viewdefinition")) {
                context.logger.error("  ✗ Invalid or missing $schema property");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info("  ✓ Schema is valid");
              }

              if (!json.views || json.views.length === 0) {
                context.logger.error("  ✗ No views defined");
                allValid = false;
                totalErrors++;
              } else {
                context.logger.info(`  ✓ Found ${json.views.length} view(s)`);
              }
            }

            context.logger.info(`  ✓ ${fileName} is well-formed JSON`);
          } catch (parseError) {
            context.logger.error(
              `  ✗ JSON parsing error: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
            );
            allValid = false;
            totalErrors++;
          }
        }

        // Parameter consistency validation
        if (cmdOptions.parameters && files.length > 1) {
          context.logger.info("\nValidating parameter consistency...");

          const mainTemplatePath = files.find((f) =>
            f.endsWith("mainTemplate.json"),
          );
          const uiDefinitionPath = files.find((f) =>
            f.endsWith("createUiDefinition.json"),
          );

          if (mainTemplatePath && uiDefinitionPath) {
            try {
              const mainTemplate = await readJSON(mainTemplatePath);
              const uiDefinition = await readJSON(uiDefinitionPath);

              const mainParams = Object.keys(mainTemplate.parameters || {});
              const uiOutputs = Object.keys(
                uiDefinition.parameters?.outputs || {},
              );

              // Check if all UI outputs map to main template parameters
              const unmappedOutputs = uiOutputs.filter(
                (output) => !mainParams.includes(output),
              );

              if (unmappedOutputs.length > 0) {
                context.logger.warn(
                  `  ⚠ ${unmappedOutputs.length} UI output(s) not found in mainTemplate parameters:`,
                );
                unmappedOutputs.forEach((param) => {
                  context.logger.warn(`     - ${param}`);
                });
                totalWarnings += unmappedOutputs.length;
              } else {
                context.logger.info(
                  "  ✓ All UI outputs map to mainTemplate parameters",
                );
              }
            } catch (error) {
              context.logger.error(
                `  ✗ Parameter consistency check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
              totalErrors++;
            }
          }
        }

        // Summary
        context.logger.info("\n" + "=".repeat(60));
        if (allValid && totalErrors === 0) {
          context.logger.info(
            `✅ Validation passed for ${files.length} file(s)`,
          );
          if (totalWarnings > 0) {
            context.logger.info(`⚠  ${totalWarnings} warning(s) found`);
          }
        } else {
          context.logger.error(
            `❌ Validation failed with ${totalErrors} error(s) and ${totalWarnings} warning(s)`,
          );
        }

        if (!cmdOptions.schemaOnly) {
          context.logger.info(
            "\n💡 Tip: For comprehensive validation, use ARM-TTK:",
          );
          context.logger.info(
            "   npm run install-arm-ttk && azmp validate " + resolvedPath,
          );
        }
      } catch (error) {
        context.logger.error(
          `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

  // ========================================
  // template test
  // ========================================
  templateCommand
    .command("test")
    .description("Test ARM template with sample parameters")
    .argument("<path>", "Path to template directory")
    .option("-p, --parameters <file>", "Path to parameters JSON file")
    .option("--dry-run", "Validate deployment without creating resources")
    .action(async (templatePath: string, cmdOptions) => {
      try {
        context.logger.info("Starting template deployment test...");

        const resolvedPath = path.resolve(templatePath);
        if (!(await pathExists(resolvedPath))) {
          context.logger.error(`Path not found: ${resolvedPath}`);
          return;
        }

        // Check for mainTemplate.json
        const mainTemplatePath = path.join(resolvedPath, "mainTemplate.json");
        if (!(await pathExists(mainTemplatePath))) {
          context.logger.error("mainTemplate.json not found in directory");
          return;
        }

        context.logger.info("Loading mainTemplate.json...");
        const mainTemplate = await readJSON(mainTemplatePath);

        // Load parameters if provided
        let parameters: any = {};
        if (cmdOptions.parameters) {
          const parametersPath = path.resolve(cmdOptions.parameters);
          if (!(await pathExists(parametersPath))) {
            context.logger.error(
              `Parameters file not found: ${parametersPath}`,
            );
            return;
          }
          parameters = await readJSON(parametersPath);
          context.logger.info(`Loaded parameters from: ${parametersPath}`);
        }

        // Validate parameters
        context.logger.info("\nValidating template parameters...");
        const templateParams = mainTemplate.parameters || {};
        const providedParams = parameters.parameters || {};

        let missingRequired = 0;
        let validParams = 0;

        for (const [paramName, paramDef] of Object.entries(templateParams) as [
          string,
          any,
        ][]) {
          const hasDefault = paramDef.defaultValue !== undefined;
          const isProvided = providedParams[paramName] !== undefined;

          if (!hasDefault && !isProvided) {
            context.logger.error(
              `  ✗ Missing required parameter: ${paramName}`,
            );
            missingRequired++;
          } else {
            validParams++;
          }
        }

        if (missingRequired > 0) {
          context.logger.error(
            `\n❌ ${missingRequired} required parameter(s) missing`,
          );
          context.logger.info("\nTo create a parameters file template:");
          context.logger.info(`  echo '{"parameters": {}}' > parameters.json`);
          return;
        }

        context.logger.info(
          `✓ All ${validParams} required parameters satisfied`,
        );

        // Dry run analysis
        if (cmdOptions.dryRun) {
          context.logger.info("\nDry run - analyzing template resources...");

          const resources = mainTemplate.resources || [];
          context.logger.info(
            `\nTemplate will deploy ${resources.length} resource(s):`,
          );

          const resourceTypes = new Map<string, number>();
          for (const resource of resources) {
            const type = resource.type || "Unknown";
            resourceTypes.set(type, (resourceTypes.get(type) || 0) + 1);
          }

          for (const [type, count] of resourceTypes.entries()) {
            context.logger.info(`  • ${type} (${count})`);
          }

          if (mainTemplate.outputs) {
            const outputCount = Object.keys(mainTemplate.outputs).length;
            context.logger.info(`\nTemplate defines ${outputCount} output(s)`);
          }

          context.logger.info("\n✅ Dry run completed successfully");
          context.logger.info("\n💡 To deploy to Azure:");
          context.logger.info("   1. Ensure you're logged in: az login");
          context.logger.info(
            "   2. Create resource group: az group create -n myRG -l eastus",
          );
          context.logger.info(
            `   3. Deploy: az deployment group create -g myRG --template-file ${mainTemplatePath} --parameters @parameters.json`,
          );
        } else {
          context.logger.info("\n✅ Template structure validated");
          context.logger.info(
            "\n💡 Use --dry-run to analyze deployment without creating resources",
          );
        }
      } catch (error) {
        context.logger.error(
          `Template test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

  // ========================================
  // template deploy-guide
  // ========================================
  templateCommand
    .command("deploy-guide")
    .description("Display Azure Portal deployment guide and URL")
    .option("-r, --resource-group <name>", "Target resource group name")
    .option(
      "-l, --location <location>",
      "Azure region (e.g., eastus)",
      "eastus",
    )
    .action(async (cmdOptions) => {
      context.logger.info("Azure Marketplace VM Deployment Guide");
      context.logger.info("=".repeat(60));

      context.logger.info("\n📋 Prerequisites:");
      context.logger.info("  1. Azure subscription (Free trial available)");
      context.logger.info("  2. Resource group created");
      context.logger.info(
        "  3. Generated ARM templates (mainTemplate.json, createUiDefinition.json, viewDefinition.json)",
      );

      context.logger.info("\n🔧 Deployment Options:");

      context.logger.info("\nOption 1: Azure Portal (Recommended for testing)");
      context.logger.info(
        "  1. Navigate to Azure Portal: https://portal.azure.com",
      );
      context.logger.info('  2. Search for "Deploy a custom template"');
      context.logger.info('  3. Click "Build your own template in the editor"');
      context.logger.info("  4. Paste mainTemplate.json content");
      context.logger.info('  5. Click "Save" and fill in parameters');
      context.logger.info("  6. Review and create");

      context.logger.info("\nOption 2: Azure CLI");
      context.logger.info("  # Login to Azure");
      context.logger.info("  az login");
      context.logger.info("");

      if (cmdOptions.resourceGroup) {
        context.logger.info(
          `  # Deploy to resource group: ${cmdOptions.resourceGroup}`,
        );
        context.logger.info(`  az deployment group create \\`);
        context.logger.info(
          `    --resource-group ${cmdOptions.resourceGroup} \\`,
        );
      } else {
        context.logger.info("  # Create resource group");
        context.logger.info(
          `  az group create --name myResourceGroup --location ${cmdOptions.location}`,
        );
        context.logger.info("");
        context.logger.info("  # Deploy template");
        context.logger.info("  az deployment group create \\");
        context.logger.info("    --resource-group myResourceGroup \\");
      }
      context.logger.info("    --template-file ./output/mainTemplate.json \\");
      context.logger.info("    --parameters @parameters.json");

      context.logger.info("\nOption 3: Direct Portal Link");
      const portalUrl = "https://portal.azure.com/#create/Microsoft.Template";
      context.logger.info(`  ${portalUrl}`);

      context.logger.info("\n📦 For Marketplace Publishing:");
      context.logger.info("  1. Package templates: azmp package ./output");
      context.logger.info("  2. Create Partner Center account");
      context.logger.info("  3. Create new Azure Application offer");
      context.logger.info("  4. Upload package ZIP file");
      context.logger.info("  5. Configure offer details and pricing");
      context.logger.info("  6. Submit for certification");

      context.logger.info("\n📚 Resources:");
      context.logger.info("  • Azure Portal: https://portal.azure.com");
      context.logger.info(
        "  • ARM Template docs: https://docs.microsoft.com/azure/azure-resource-manager/templates/",
      );
      context.logger.info(
        "  • Partner Center: https://partner.microsoft.com/dashboard/marketplace-offers/overview",
      );
      context.logger.info(
        "  • Marketplace docs: https://docs.microsoft.com/azure/marketplace/",
      );

      context.logger.info("\n💡 Testing Workflow:");
      context.logger.info("  1. Generate templates: azmp vm template generate");
      context.logger.info("  2. Validate: azmp vm template validate ./output");
      context.logger.info(
        "  3. Test: azmp vm template test ./output --dry-run",
      );
      context.logger.info("  4. Deploy to dev environment");
      context.logger.info("  5. Verify VM resources and monitoring");
      context.logger.info("  6. Package for production: azmp package ./output");
    });
}
