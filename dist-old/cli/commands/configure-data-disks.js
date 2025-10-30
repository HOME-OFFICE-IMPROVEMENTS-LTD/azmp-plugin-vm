"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const data_disks_1 = require("../../azure/data-disks");
const disk_types_1 = require("../../azure/disk-types");
/**
 * Load configuration from JSON file
 */
function loadConfigFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to load configuration from ${filePath}: ${error}`);
    }
}
/**
 * Display data disk presets catalog
 */
function displayPresetsCatalog() {
    const presets = data_disks_1.DataDiskManager.getAllPresets();
    console.log('\n=== Azure Data Disk Presets ===\n');
    presets.forEach((preset) => {
        if (preset.preset === data_disks_1.DataDiskPreset.Custom)
            return; // Skip custom in catalog
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
function displayTextOutput(config, validation, costEstimate, performance) {
    console.log('\n=== Azure Data Disk Configuration ===\n');
    // Configuration summary
    console.log('Configuration:');
    console.log(`  VM Name: ${config.vmName}`);
    console.log(`  Resource Group: ${config.resourceGroup}`);
    console.log(`  VM Size: ${config.vmSize}`);
    console.log(`  Location: ${config.location || 'eastus'}`);
    if (config.preset && config.preset !== data_disks_1.DataDiskPreset.Custom) {
        const presetInfo = data_disks_1.DataDiskManager.getPreset(config.preset);
        if (presetInfo) {
            console.log(`  Preset: ${presetInfo.name}`);
        }
    }
    else {
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
    }
    else {
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
function displayJsonOutput(config, validation, costEstimate, performance) {
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
function parseDiskType(diskTypeStr) {
    if (!diskTypeStr) {
        return disk_types_1.DiskStorageAccountType.StandardSSD;
    }
    const mapping = {
        'StandardHDD': disk_types_1.DiskStorageAccountType.StandardHDD,
        'Standard_LRS': disk_types_1.DiskStorageAccountType.StandardHDD,
        'StandardSSD': disk_types_1.DiskStorageAccountType.StandardSSD,
        'StandardSSD_LRS': disk_types_1.DiskStorageAccountType.StandardSSD,
        'StandardSSDZRS': disk_types_1.DiskStorageAccountType.StandardSSDZRS,
        'StandardSSD_ZRS': disk_types_1.DiskStorageAccountType.StandardSSDZRS,
        'PremiumSSD': disk_types_1.DiskStorageAccountType.PremiumSSD,
        'Premium_LRS': disk_types_1.DiskStorageAccountType.PremiumSSD,
        'PremiumSSDZRS': disk_types_1.DiskStorageAccountType.PremiumSSDZRS,
        'Premium_ZRS': disk_types_1.DiskStorageAccountType.PremiumSSDZRS,
        'PremiumV2': disk_types_1.DiskStorageAccountType.PremiumV2,
        'PremiumV2_LRS': disk_types_1.DiskStorageAccountType.PremiumV2,
        'UltraSSD': disk_types_1.DiskStorageAccountType.UltraSSD,
        'UltraSSD_LRS': disk_types_1.DiskStorageAccountType.UltraSSD,
    };
    return mapping[diskTypeStr] || disk_types_1.DiskStorageAccountType.StandardSSD;
}
/**
 * Parse caching from string
 */
function parseCaching(cachingStr) {
    if (!cachingStr) {
        return data_disks_1.DiskCaching.ReadWrite;
    }
    const mapping = {
        'None': data_disks_1.DiskCaching.None,
        'ReadOnly': data_disks_1.DiskCaching.ReadOnly,
        'ReadWrite': data_disks_1.DiskCaching.ReadWrite,
    };
    return mapping[cachingStr] || data_disks_1.DiskCaching.ReadWrite;
}
/**
 * Parse preset from string
 */
function parsePreset(presetStr) {
    if (!presetStr) {
        return data_disks_1.DataDiskPreset.Custom;
    }
    const mapping = {
        'database': data_disks_1.DataDiskPreset.Database,
        'db': data_disks_1.DataDiskPreset.Database,
        'logs': data_disks_1.DataDiskPreset.Logs,
        'log': data_disks_1.DataDiskPreset.Logs,
        'appdata': data_disks_1.DataDiskPreset.AppData,
        'app': data_disks_1.DataDiskPreset.AppData,
        'highperf': data_disks_1.DataDiskPreset.HighPerformance,
        'highperformance': data_disks_1.DataDiskPreset.HighPerformance,
        'archive': data_disks_1.DataDiskPreset.Archive,
        'custom': data_disks_1.DataDiskPreset.Custom,
    };
    return mapping[presetStr.toLowerCase()] || data_disks_1.DataDiskPreset.Custom;
}
/**
 * Create and register the configure-data-disks command
 */
function createConfigureDataDisksCommand() {
    return new commander_1.Command('configure-data-disks')
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
        .action(async (options) => {
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
            let config;
            if (options.config) {
                // Load from file and merge with CLI options
                const fileConfig = loadConfigFromFile(options.config);
                config = {
                    vmName: options['vm-name'],
                    resourceGroup: options['resource-group'],
                    vmSize: options['vm-size'],
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
            }
            else {
                const preset = parsePreset(options.preset);
                config = (0, data_disks_1.createDataDiskConfiguration)({
                    vmName: options['vm-name'],
                    resourceGroup: options['resource-group'],
                    vmSize: options['vm-size'],
                    preset: preset !== data_disks_1.DataDiskPreset.Custom ? preset : undefined,
                    diskCount: options['disk-count'],
                    diskSizeGB: options['disk-size'],
                    diskType: options['disk-type'],
                    caching: options.caching,
                    location: options.location,
                    lunStart: options['lun-start'],
                });
            }
            // Create manager and validate
            const manager = new data_disks_1.DataDiskManager(config);
            const validation = manager.validate();
            // Calculate cost estimate and performance
            const costEstimate = manager.estimateCosts();
            const performance = manager.calculatePerformance();
            // Output based on format
            if (options.format === 'json') {
                displayJsonOutput(config, validation, costEstimate, performance);
            }
            else if (options.format === 'template') {
                const template = (0, data_disks_1.generateDataDiskTemplate)(config);
                console.log(JSON.stringify(template, null, 2));
            }
            else {
                // Default text format
                displayTextOutput(config, validation, costEstimate, performance);
            }
            // Export template if requested
            if (options.output) {
                const template = (0, data_disks_1.generateDataDiskTemplate)(config);
                fs.writeFileSync(options.output, JSON.stringify(template, null, 2));
                console.log(`✅ ARM template exported to: ${options.output}\n`);
            }
            // Exit with error code if validation failed
            if (!validation.valid) {
                process.exit(1);
            }
        }
        catch (error) {
            console.error(`\n❌ Error: ${error}\n`);
            process.exit(1);
        }
    });
}
exports.default = createConfigureDataDisksCommand();
