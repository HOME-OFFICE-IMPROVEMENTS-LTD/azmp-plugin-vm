/**
 * CLI command for configuring Azure data disks for virtual machines
 * 
 * Usage examples:
 *   # Use Database preset (4x 1TB Premium SSD)
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database
 * 
 *   # Custom configuration (3x 512GB Standard SSD)
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D4s_v3 --disk-count 3 --disk-size 512 --disk-type StandardSSD --caching ReadWrite
 * 
 *   # Show available presets
 *   azmp vm configure-data-disks --show-presets
 * 
 *   # Validate configuration only
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database --validate
 * 
 *   # Export ARM template
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database --output data-disks-template.json
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {
  DataDiskManager,
  DataDiskPreset,
  DiskCaching,
  WorkloadType,
  createDataDiskConfiguration,
  generateDataDiskTemplate,
  DataDisksConfiguration,
  DataDiskValidationResult,
  DataDiskCostEstimate,
  DataDiskPerformance,
} from '../../azure/data-disks';
import { DiskStorageAccountType } from '../../azure/disk-types';

/**
 * CLI options interface
 */
interface DataDiskConfigOptions {
  'vm-name'?: string;
  'resource-group'?: string;
  'vm-size'?: string;
  'disk-count'?: number;
  'disk-size'?: number;
  'disk-type'?: string;
  caching?: string;
  preset?: string;
  location?: string;
  'lun-start'?: number;
  validate?: boolean;
  output?: string;
  format?: string;
  'show-presets'?: boolean;
  config?: string;
}

/**
 * Load configuration from JSON file
 */
function loadConfigFromFile(filePath: string): Partial<DataDisksConfiguration> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load configuration from ${filePath}: ${error}`);
  }
}

/**
 * Display data disk presets catalog
 */
function displayPresetsCatalog(): void {
  const presets = DataDiskManager.getAllPresets();

  console.log('\n=== Azure Data Disk Presets ===\n');

  presets.forEach((preset) => {
    if (preset.preset === DataDiskPreset.Custom) return; // Skip custom in catalog

    console.log(`  ${preset.name} (${preset.preset})`);
    console.log(`  ─────────────────────────────────────────────────────────────────────────`);
    console.log(`  Description: ${preset.description}`);
    console.log(`  Use Case: ${preset.useCase}`);
    console.log(`  Configuration:`);
    console.log(`    • Disk Count: ${preset.diskCount}`);
    console.log(`    • Disk Size: ${preset.diskSizeGB} GB each`);
    console.log(`    • Disk Type: ${preset.diskType}`);
    console.log(`    • Caching: ${preset.caching}`);
    console.log(`  Estimated Cost: ~$${preset.estimatedMonthlyCost}/month`);
    console.log();
  });

  console.log('Use a preset with: --preset <name>');
  console.log('Examples: --preset database, --preset logs, --preset highperf\n');
}

/**
 * Display text output
 */
function displayTextOutput(
  config: DataDisksConfiguration,
  validation: DataDiskValidationResult,
  costEstimate: DataDiskCostEstimate,
  performance: DataDiskPerformance
): void {
  console.log('\n=== Azure Data Disk Configuration ===\n');

  // Configuration summary
  console.log('Configuration:');
  console.log(`  VM Name: ${config.vmName}`);
  console.log(`  Resource Group: ${config.resourceGroup}`);
  console.log(`  VM Size: ${config.vmSize}`);
  console.log(`  Location: ${config.location || 'eastus'}`);
  
  if (config.preset && config.preset !== DataDiskPreset.Custom) {
    const presetInfo = DataDiskManager.getPreset(config.preset);
    if (presetInfo) {
      console.log(`  Preset: ${presetInfo.name}`);
    }
  } else {
    console.log(`  Preset: Custom`);
  }

  console.log(`  Disk Count: ${config.diskCount}`);
  console.log(`  Disk Size: ${config.diskSizeGB} GB each`);
  console.log(`  Disk Type: ${config.diskType}`);
  console.log(`  Caching: ${config.caching}`);
  console.log(`  LUN Start: ${config.lunStart ?? 0}`);
  console.log();

  // VM limits
  if (validation.vmLimits) {
    console.log('VM Size Limits:');
    console.log(`  Max Data Disks: ${validation.vmLimits.maxDataDiskCount}`);
    console.log(`  Max IOPS: ${validation.vmLimits.maxIOPS?.toLocaleString() || 'N/A'}`);
    console.log(`  Max Throughput: ${validation.vmLimits.maxThroughputMBps || 'N/A'} MB/s`);
    console.log();
  }

  // Validation results
  if (validation.valid) {
    console.log('✅ Validation: PASSED\n');
  } else {
    console.log('❌ Validation: FAILED\n');
    console.log('Errors:');
    validation.errors.forEach((error) => {
      console.log(`  • ${error}`);
    });
    console.log();
  }

  // Warnings
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
    console.log();
  }

  // Performance estimate
  console.log('Performance Estimate:');
  console.log(`  Total IOPS: ${performance.totalIOPS.toLocaleString()}`);
  console.log(`  Total Throughput: ${performance.totalThroughputMBps} MB/s`);
  
  if (performance.perDiskIOPS && performance.perDiskIOPS.length > 0) {
    console.log('  Per-Disk Breakdown:');
    performance.perDiskIOPS.forEach((iops, index) => {
      const throughput = performance.perDiskThroughputMBps[index];
      console.log(`    • Disk ${index}: ${iops.toLocaleString()} IOPS, ${throughput} MB/s`);
    });
  }
  console.log();

  // Cost estimate
  console.log('Cost Estimate:');
  console.log(`  Cost per Disk: $${costEstimate.costPerDiskMonthly.toFixed(2)}/month`);
  console.log(`  Total Monthly: $${costEstimate.totalMonthlyCost.toFixed(2)}/month`);
  console.log(`  Total Annual: $${costEstimate.totalAnnualCost.toFixed(2)}/year`);
  
  if (costEstimate.breakdown && costEstimate.breakdown.length > 0) {
    console.log('  Breakdown by Type:');
    costEstimate.breakdown.forEach((item) => {
      console.log(`    • ${item.diskCount}x ${item.sizeGB}GB ${item.diskType}: $${item.subtotalMonthly.toFixed(2)}/month`);
    });
  }
  console.log();
}

/**
 * Display JSON output
 */
function displayJsonOutput(
  config: DataDisksConfiguration,
  validation: DataDiskValidationResult,
  costEstimate: DataDiskCostEstimate,
  performance: DataDiskPerformance
): void {
  const output = {
    configuration: config,
    validation,
    costEstimate,
    performance,
  };

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Parse disk type from string
 */
function parseDiskType(diskTypeStr?: string): DiskStorageAccountType {
  if (!diskTypeStr) {
    return DiskStorageAccountType.StandardSSD;
  }

  const mapping: Record<string, DiskStorageAccountType> = {
    'StandardHDD': DiskStorageAccountType.StandardHDD,
    'Standard_LRS': DiskStorageAccountType.StandardHDD,
    'StandardSSD': DiskStorageAccountType.StandardSSD,
    'StandardSSD_LRS': DiskStorageAccountType.StandardSSD,
    'StandardSSDZRS': DiskStorageAccountType.StandardSSDZRS,
    'StandardSSD_ZRS': DiskStorageAccountType.StandardSSDZRS,
    'PremiumSSD': DiskStorageAccountType.PremiumSSD,
    'Premium_LRS': DiskStorageAccountType.PremiumSSD,
    'PremiumSSDZRS': DiskStorageAccountType.PremiumSSDZRS,
    'Premium_ZRS': DiskStorageAccountType.PremiumSSDZRS,
    'PremiumV2': DiskStorageAccountType.PremiumV2,
    'PremiumV2_LRS': DiskStorageAccountType.PremiumV2,
    'UltraSSD': DiskStorageAccountType.UltraSSD,
    'UltraSSD_LRS': DiskStorageAccountType.UltraSSD,
  };

  return mapping[diskTypeStr] || DiskStorageAccountType.StandardSSD;
}

/**
 * Parse caching from string
 */
function parseCaching(cachingStr?: string): DiskCaching {
  if (!cachingStr) {
    return DiskCaching.ReadWrite;
  }

  const mapping: Record<string, DiskCaching> = {
    'None': DiskCaching.None,
    'ReadOnly': DiskCaching.ReadOnly,
    'ReadWrite': DiskCaching.ReadWrite,
  };

  return mapping[cachingStr] || DiskCaching.ReadWrite;
}

/**
 * Parse preset from string
 */
function parsePreset(presetStr?: string): DataDiskPreset {
  if (!presetStr) {
    return DataDiskPreset.Custom;
  }

  const mapping: Record<string, DataDiskPreset> = {
    'database': DataDiskPreset.Database,
    'db': DataDiskPreset.Database,
    'logs': DataDiskPreset.Logs,
    'log': DataDiskPreset.Logs,
    'appdata': DataDiskPreset.AppData,
    'app': DataDiskPreset.AppData,
    'highperf': DataDiskPreset.HighPerformance,
    'highperformance': DataDiskPreset.HighPerformance,
    'archive': DataDiskPreset.Archive,
    'custom': DataDiskPreset.Custom,
  };

  return mapping[presetStr.toLowerCase()] || DataDiskPreset.Custom;
}

/**
 * Create and register the configure-data-disks command
 */
function createConfigureDataDisksCommand(): Command {
  return new Command('configure-data-disks')
    .description('Configure Azure data disks for virtual machines')
    .option('--vm-name <name>', 'Virtual machine name (required)')
    .option('--resource-group <name>', 'Resource group name (required)')
    .option('--vm-size <size>', 'VM size (e.g., Standard_D8s_v3) (required)')
    .option('--disk-count <count>', 'Number of data disks (1-32)', '1')
    .option('--disk-size <size>', 'Disk size in GB per disk (4-32767)', '1024')
    .option('--disk-type <type>', 'Disk type: StandardHDD, StandardSSD, PremiumSSD, UltraSSD, etc.', 'StandardSSD')
    .option('--caching <caching>', 'Disk caching: None, ReadOnly, ReadWrite', 'ReadWrite')
    .option('--preset <preset>', 'Use preset: database, logs, appdata, highperf, archive')
    .option('--location <location>', 'Azure region (defaults to eastus)', 'eastus')
    .option('--lun-start <lun>', 'Starting LUN number (0-63)', '0')
    .option('--validate', 'Validation mode only (no template generation)', false)
    .option('--output <file>', 'Export ARM template to file')
    .option('--format <format>', 'Output format: text, json, template', 'text')
    .option('--show-presets', 'Display available data disk presets', false)
    .option('--config <file>', 'Load configuration from JSON file')
    .action(async (options: DataDiskConfigOptions) => {
      try {
        // Show presets mode
        if (options['show-presets']) {
          displayPresetsCatalog();
          return;
        }

        // Validate required options
        if (!options['vm-name'] || !options['resource-group'] || !options['vm-size']) {
          console.error('\n❌ Error: --vm-name, --resource-group, and --vm-size are required\n');
          console.log('Use --show-presets to see available data disk presets');
          console.log('Use --help for usage information\n');
          process.exit(1);
        }

        // Create configuration
        let config: DataDisksConfiguration;

        if (options.config) {
          // Load from file and merge with CLI options
          const fileConfig = loadConfigFromFile(options.config);
          config = {
            vmName: options['vm-name']!,
            resourceGroup: options['resource-group']!,
            vmSize: options['vm-size']!,
            diskCount: options['disk-count'] || 1,
            diskSizeGB: options['disk-size'] || 1024,
            diskType: parseDiskType(options['disk-type']),
            caching: parseCaching(options.caching),
            location: options.location || 'eastus',
            lunStart: options['lun-start'] || 0,
            ...fileConfig,
          };

          if (options.preset) {
            config.preset = parsePreset(options.preset);
          }
        } else {
          const preset = parsePreset(options.preset);

          config = createDataDiskConfiguration({
            vmName: options['vm-name']!,
            resourceGroup: options['resource-group']!,
            vmSize: options['vm-size']!,
            preset: preset !== DataDiskPreset.Custom ? preset : undefined,
            diskCount: options['disk-count'],
            diskSizeGB: options['disk-size'],
            diskType: options['disk-type'],
            caching: options.caching,
            location: options.location,
            lunStart: options['lun-start'],
          });
        }

        // Create manager and validate
        const manager = new DataDiskManager(config);
        const validation = manager.validate();

        // Calculate cost estimate and performance
        const costEstimate = manager.estimateCosts();
        const performance = manager.calculatePerformance();

        // Output based on format
        if (options.format === 'json') {
          displayJsonOutput(config, validation, costEstimate, performance);
        } else if (options.format === 'template') {
          const template = generateDataDiskTemplate(config);
          console.log(JSON.stringify(template, null, 2));
        } else {
          // Default text format
          displayTextOutput(config, validation, costEstimate, performance);
        }

        // Export template if requested
        if (options.output) {
          const template = generateDataDiskTemplate(config);
          fs.writeFileSync(options.output, JSON.stringify(template, null, 2));
          console.log(`✅ ARM template exported to: ${options.output}\n`);
        }

        // Exit with error code if validation failed
        if (!validation.valid) {
          process.exit(1);
        }

      } catch (error) {
        console.error(`\n❌ Error: ${error}\n`);
        process.exit(1);
      }
    });
}

export default createConfigureDataDisksCommand();
