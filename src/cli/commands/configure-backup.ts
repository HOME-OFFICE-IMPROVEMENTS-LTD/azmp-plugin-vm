/**
 * CLI command for configuring Azure Backup for virtual machines
 * 
 * Usage examples:
 *   # Enable backup with Production policy
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --policy production
 * 
 *   # Create new vault and enable backup
 *   azmp vm configure-backup --vault-name myVault --create-vault --location eastus --vm-name myVM --resource-group myRG
 * 
 *   # List available backup policies
 *   azmp vm configure-backup --list-policies
 * 
 *   # Validate backup configuration
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --validate
 * 
 *   # Export ARM template
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --output backup-template.json
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {
  BackupManager,
  BackupPolicyPreset,
  createBackupConfiguration,
  generateBackupTemplate,
  BackupConfiguration,
  BackupValidationResult,
  BackupCostEstimate,
} from '../../azure/backup';

/**
 * CLI options interface
 */
interface BackupConfigOptions {
  'vault-name'?: string;
  'create-vault'?: boolean;
  location?: string;
  'vm-name'?: string;
  'resource-group'?: string;
  policy?: string;
  enabled?: boolean;
  'disk-size'?: number;
  'daily-retention'?: number;
  'weekly-retention'?: number;
  'monthly-retention'?: number;
  'yearly-retention'?: number;
  validate?: boolean;
  output?: string;
  format?: string;
  'list-policies'?: boolean;
  config?: string;
}

/**
 * Load configuration from JSON file
 */
function loadConfigFromFile(filePath: string): Partial<BackupConfiguration> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load configuration from ${filePath}: ${error}`);
  }
}

/**
 * Display backup policies catalog
 */
function displayBackupPoliciesCatalog(): void {
  const presets = BackupManager.getAllPresets();

  console.log('\n=== Azure Backup Policies ===\n');

  Object.entries(presets).forEach(([key, preset]) => {
    if (key === 'custom') return; // Skip custom in catalog

    console.log(`  ${preset.name} (${key})`);
    console.log(`  ─────────────────────────────────────────────────────────────────────────`);
    console.log(`  Description: ${preset.description}`);
    console.log(`  Backup Schedule: ${preset.schedule.frequency} at ${preset.schedule.time}`);
    console.log(`  Retention:`);

    if (preset.retention.dailyRetentionDays) {
      console.log(`    • Daily: ${preset.retention.dailyRetentionDays} days`);
    }
    if (preset.retention.weeklyRetentionWeeks) {
      console.log(`    • Weekly: ${preset.retention.weeklyRetentionWeeks} weeks (${preset.retention.weeklyRetentionDays?.join(', ')})`);
    }
    if (preset.retention.monthlyRetentionMonths) {
      console.log(`    • Monthly: ${preset.retention.monthlyRetentionMonths} months (${preset.retention.monthlyRetentionWeek} ${preset.retention.monthlyRetentionDay})`);
    }
    if (preset.retention.yearlyRetentionYears) {
      console.log(`    • Yearly: ${preset.retention.yearlyRetentionYears} years (${preset.retention.yearlyRetentionMonths?.join(', ')})`);
    }

    console.log(`  Instant Restore: ${preset.instantRestore.enabled ? `${preset.instantRestore.retentionDays} days` : 'Disabled'}`);
    console.log(`  Estimated Cost: ~$${preset.estimatedMonthlyCostPer100GB}/month per 100GB VM`);
    console.log();
  });

  console.log(`\n  Custom Policy`);
  console.log(`  ─────────────────────────────────────────────────────────────────────────`);
  console.log(`  Description: Define your own retention periods`);
  console.log(`  Options: --daily-retention, --weekly-retention, --monthly-retention, --yearly-retention`);
  console.log();
}

/**
 * Display text output
 */
function displayTextOutput(
  config: BackupConfiguration,
  validation: BackupValidationResult,
  costEstimate?: BackupCostEstimate
): void {
  console.log('\n=== Backup Configuration ===\n');

  console.log(`Backup: ${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`Recovery Services Vault: ${config.vaultName}`);
  console.log(`Create New Vault: ${config.createVault ? 'Yes' : 'No (using existing)'}`);

  if (config.createVault && config.vaultConfig) {
    console.log(`  Location: ${config.vaultConfig.location}`);
    console.log(`  SKU: ${config.vaultConfig.sku}`);
    console.log(`  Public Access: ${config.vaultConfig.publicNetworkAccess ? 'Enabled' : 'Disabled'}`);
  }

  console.log(`\nBackup Policy: ${config.policyPreset}`);

  const preset = BackupManager.getPresetPolicy(config.policyPreset);
  console.log(`  Schedule: ${preset.schedule.frequency} at ${preset.schedule.time}`);
  console.log(`  Retention:`);

  if (preset.retention.dailyRetentionDays) {
    console.log(`    • Daily: ${preset.retention.dailyRetentionDays} days`);
  }
  if (preset.retention.weeklyRetentionWeeks) {
    console.log(`    • Weekly: ${preset.retention.weeklyRetentionWeeks} weeks`);
  }
  if (preset.retention.monthlyRetentionMonths) {
    console.log(`    • Monthly: ${preset.retention.monthlyRetentionMonths} months`);
  }
  if (preset.retention.yearlyRetentionYears) {
    console.log(`    • Yearly: ${preset.retention.yearlyRetentionYears} years`);
  }

  console.log(`  Instant Restore: ${preset.instantRestore.enabled ? `${preset.instantRestore.retentionDays} days` : 'Disabled'}`);

  console.log(`\nVM Details:`);
  console.log(`  VM Name: ${config.vmName}`);
  console.log(`  Resource Group: ${config.resourceGroupName}`);

  // Cost estimate
  if (costEstimate) {
    console.log(`\n=== Cost Estimate ===\n`);
    console.log(`Protected Instance: $${costEstimate.protectedInstanceCost.toFixed(2)}/month`);
    console.log(`Backup Storage: $${costEstimate.storageCost.toFixed(2)}/month`);
    console.log(`\nTotal Monthly Cost: $${costEstimate.totalMonthlyCost.toFixed(2)}`);
    console.log(`Total Annual Cost: $${costEstimate.totalAnnualCost.toFixed(2)}`);
    console.log(`\nNotes:`);
    costEstimate.notes.forEach((note) => console.log(`  • ${note}`));
  }

  // Validation
  console.log(`\n=== Validation ===\n`);

  if (validation.isValid) {
    console.log('✅ Configuration is valid\n');
  } else {
    console.log('❌ Configuration has errors:\n');
    validation.errors.forEach((error) => console.log(`  ❌ ${error}`));
    console.log();
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`));
    console.log();
  }

  if (validation.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    validation.recommendations.forEach((rec) => console.log(`  💡 ${rec}`));
    console.log();
  }

  // Marketplace compliance
  const manager = new BackupManager(config);
  const compliance = manager.isMarketplaceCompliant();

  console.log(`=== Marketplace Compliance ===\n`);
  if (compliance.compliant) {
    console.log('Status: ✅ COMPLIANT\n');
  } else {
    console.log('Status: ⚠️  NON-COMPLIANT\n');
    console.log('Issues:');
    compliance.issues.forEach((issue) => console.log(`  • ${issue}`));
    console.log();
  }
}

/**
 * Display JSON output
 */
function displayJsonOutput(
  config: BackupConfiguration,
  validation: BackupValidationResult,
  costEstimate?: BackupCostEstimate
): void {
  const manager = new BackupManager(config);
  const compliance = manager.isMarketplaceCompliant();

  const output = {
    configuration: config,
    validation,
    compliance,
    estimatedCosts: costEstimate || null,
  };

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Export ARM template to file
 */
function exportTemplate(config: BackupConfiguration, outputPath: string): void {
  const template = generateBackupTemplate(config);

  const resolvedPath = path.resolve(outputPath);
  fs.writeFileSync(resolvedPath, JSON.stringify(template, null, 2));

  console.log(`\n✅ ARM template exported to: ${resolvedPath}\n`);
}

/**
 * Configure backup command
 */
const configureBackupCommand = new Command('configure-backup')
  .description('Configure Azure Backup for virtual machines')
  .option('--vault-name <name>', 'Recovery Services Vault name (required)')
  .option('--create-vault', 'Create new Recovery Services Vault', false)
  .option('--location <location>', 'Azure region for new vault (required if --create-vault)')
  .option('--vm-name <name>', 'Virtual machine name (required)')
  .option('--resource-group <name>', 'Resource group name (required)')
  .option('--policy <preset>', 'Backup policy preset: development, production, longterm, custom', 'production')
  .option('--enabled', 'Enable backup (default: true)', true)
  .option('--disk-size <size>', 'VM disk size in GB for cost estimation', '100')
  .option('--daily-retention <days>', 'Daily retention in days (7-9999, for custom policy)')
  .option('--weekly-retention <weeks>', 'Weekly retention in weeks (1-5163, for custom policy)')
  .option('--monthly-retention <months>', 'Monthly retention in months (1-1188, for custom policy)')
  .option('--yearly-retention <years>', 'Yearly retention in years (1-99, for custom policy)')
  .option('--validate', 'Validation mode only (no template generation)', false)
  .option('--output <file>', 'Export ARM template to file')
  .option('--format <format>', 'Output format: text, json, template', 'text')
  .option('--list-policies', 'Display available backup policies', false)
  .option('--config <file>', 'Load configuration from JSON file')
  .action(async (options: BackupConfigOptions) => {
    try {
      // List policies mode
      if (options['list-policies']) {
        displayBackupPoliciesCatalog();
        return;
      }

      // Validate required options
      if (!options['vault-name'] || !options['vm-name'] || !options['resource-group']) {
        console.error('\n❌ Error: --vault-name, --vm-name, and --resource-group are required\n');
        console.log('Use --list-policies to see available backup policies');
        console.log('Use --help for usage information\n');
        process.exit(1);
      }

      // Validate create-vault requires location
      if (options['create-vault'] && !options.location) {
        console.error('\n❌ Error: --location is required when --create-vault is specified\n');
        process.exit(1);
      }

      // Create configuration
      let config: BackupConfiguration;

      if (options.config) {
        // Load from file and merge with CLI options
        const fileConfig = loadConfigFromFile(options.config);
        config = {
          enabled: options.enabled !== false,
          vaultName: options['vault-name']!,
          createVault: options['create-vault'] || false,
          policyPreset: (options.policy as BackupPolicyPreset) || BackupPolicyPreset.Production,
          vmName: options['vm-name']!,
          resourceGroupName: options['resource-group']!,
          ...fileConfig,
        };

        if (options['create-vault'] && options.location) {
          config.vaultConfig = {
            name: options['vault-name']!,
            location: options.location,
            sku: 'RS0' as any,
            publicNetworkAccess: true,
          };
        }
      } else {
        // Build custom retention if custom policy
        let customRetention: any = undefined;
        if (options.policy === 'custom') {
          customRetention = {
            daily: options['daily-retention'] ? parseInt(String(options['daily-retention'])) : undefined,
            weekly: options['weekly-retention'] ? parseInt(String(options['weekly-retention'])) : undefined,
            monthly: options['monthly-retention'] ? parseInt(String(options['monthly-retention'])) : undefined,
            yearly: options['yearly-retention'] ? parseInt(String(options['yearly-retention'])) : undefined,
          };
        }

        config = createBackupConfiguration({
          enabled: options.enabled !== false,
          vaultName: options['vault-name']!,
          createVault: options['create-vault'],
          vaultLocation: options.location,
          policyPreset: options.policy,
          vmName: options['vm-name']!,
          resourceGroupName: options['resource-group']!,
          customRetention,
        });
      }

      // Create manager and validate
      const manager = new BackupManager(config);
      const validation = manager.validate();

      // Calculate cost estimate
      const diskSize = parseInt(String(options['disk-size'] || '100'));
      const costEstimate = manager.estimateCosts(diskSize);

      // Output based on format
      if (options.format === 'json') {
        displayJsonOutput(config, validation, costEstimate);
      } else if (options.format === 'template') {
        const template = generateBackupTemplate(config);
        console.log(JSON.stringify(template, null, 2));
      } else {
        // Default text format
        displayTextOutput(config, validation, costEstimate);
      }

      // Export template if requested
      if (options.output) {
        exportTemplate(config, options.output);
      }

      // Exit with error code if validation failed
      if (!validation.isValid && !options.validate) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error}\n`);
      process.exit(1);
    }
  });

export default configureBackupCommand;
