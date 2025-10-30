"use strict";
/**
 * CLI Command: Configure Disk Types
 *
 * Provides disk type selection and configuration for Azure VMs
 *
 * Usage:
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --vm-size Standard_DS2_v2
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --os-disk-size 128 --performance-tier P20
 *   azmp vm configure-disk-types --config disk-config.json --validate
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --data-disk-type StandardSSD_LRS --data-disk-count 2 --output template.json
 *
 * @module cli/commands/configure-disk-types
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
const disk_types_1 = require("../../azure/disk-types");
/**
 * Load configuration from JSON file
 */
function loadConfigFromFile(filePath) {
    try {
        const configData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(configData);
    }
    catch (error) {
        throw new Error(`Failed to load configuration from ${filePath}: ${error}`);
    }
}
/**
 * Display disk types catalog
 */
function displayDiskTypesCatalog() {
    console.log('\n=== Azure Managed Disk Types ===\n');
    const categories = [
        disk_types_1.DiskCategory.Performance,
        disk_types_1.DiskCategory.HighAvailability,
        disk_types_1.DiskCategory.Balanced,
        disk_types_1.DiskCategory.CostOptimized
    ];
    categories.forEach(category => {
        const diskTypes = disk_types_1.DiskTypeManager.getDiskTypesByCategory(category);
        if (diskTypes.length === 0)
            return;
        console.log(`\n${category}:`);
        console.log('─'.repeat(80));
        diskTypes.forEach(disk => {
            console.log(`\n  ${disk.label}`);
            console.log(`  Type: ${disk.type}`);
            console.log(`  Description: ${disk.description}`);
            console.log(`  Cost: ~$${disk.estimatedCostPerGBMonth.toFixed(3)}/GB/month`);
            console.log(`  Max IOPS: ${disk.maxIOPS.toLocaleString()}`);
            console.log(`  Max Throughput: ${disk.maxThroughputMBps} MB/s`);
            console.log(`  Size Range: ${disk.minSizeGB} GB - ${disk.maxSizeGB} GB`);
            console.log(`  Premium VM Required: ${disk.requiresPremiumVM ? 'Yes' : 'No'}`);
            console.log(`  Zone Support Required: ${disk.requiresZoneSupport ? 'Yes' : 'No'}`);
            console.log(`  Supported Caching: ${disk.supportedCaching.join(', ')}`);
        });
    });
    console.log('\n');
}
/**
 * Display performance tiers
 */
function displayPerformanceTiers() {
    console.log('\n=== Premium SSD Performance Tiers ===\n');
    console.log('Performance tiers allow you to set disk performance independent of disk size.\n');
    const tiers = disk_types_1.DiskTypeManager.getAllPerformanceTiers();
    console.log('Tier | Disk Size Range      | IOPS    | Throughput');
    console.log('─'.repeat(70));
    tiers.forEach(tier => {
        const sizeRange = `${tier.minDiskSizeGB}-${tier.maxDiskSizeGB} GB`.padEnd(20);
        const iops = tier.iops.toLocaleString().padEnd(8);
        const throughput = `${tier.throughputMBps} MB/s`;
        console.log(`${tier.tier.padEnd(4)} | ${sizeRange} | ${iops} | ${throughput}`);
    });
    console.log('\n');
}
/**
 * Display configuration in text format
 */
function displayTextOutput(config, manager, vmSize) {
    console.log('\n=== Disk Configuration ===\n');
    // OS Disk
    const osDiskInfo = disk_types_1.DiskTypeManager.getDiskTypeInfo(config.osDiskType);
    console.log('OS Disk:');
    console.log(`  Type: ${osDiskInfo.label}`);
    console.log(`  Storage Account Type: ${config.osDiskType}`);
    if (config.osDiskSizeGB) {
        console.log(`  Size: ${config.osDiskSizeGB} GB`);
        const monthlyCost = config.osDiskSizeGB * osDiskInfo.estimatedCostPerGBMonth;
        console.log(`  Estimated Monthly Cost: $${monthlyCost.toFixed(2)}`);
    }
    console.log(`  Caching: ${config.osDiskCaching || disk_types_1.DiskTypeManager.getRecommendedCaching(config.osDiskType, true)}`);
    if (config.osDiskPerformanceTier) {
        const tierSpec = disk_types_1.DiskTypeManager.getPerformanceTier(config.osDiskPerformanceTier);
        console.log(`  Performance Tier: ${config.osDiskPerformanceTier}`);
        console.log(`  IOPS: ${tierSpec.iops.toLocaleString()}`);
        console.log(`  Throughput: ${tierSpec.throughputMBps} MB/s`);
    }
    else {
        console.log(`  Max IOPS: ${osDiskInfo.maxIOPS.toLocaleString()}`);
        console.log(`  Max Throughput: ${osDiskInfo.maxThroughputMBps} MB/s`);
    }
    // Data Disks
    if (config.dataDisks && config.dataDisks.length > 0) {
        console.log(`\nData Disks (${config.dataDisks.length}):`);
        config.dataDisks.forEach((disk, index) => {
            const diskInfo = disk_types_1.DiskTypeManager.getDiskTypeInfo(disk.storageAccountType);
            console.log(`\n  Disk ${index + 1}: ${disk.name}`);
            console.log(`    Type: ${diskInfo.label}`);
            console.log(`    Size: ${disk.sizeGB} GB`);
            console.log(`    Caching: ${disk.caching}`);
            console.log(`    LUN: ${disk.lun}`);
            const monthlyCost = disk.sizeGB * diskInfo.estimatedCostPerGBMonth;
            console.log(`    Estimated Monthly Cost: $${monthlyCost.toFixed(2)}`);
        });
    }
    else if (config.dataDiskType) {
        console.log(`\nData Disk Type: ${config.dataDiskType}`);
    }
    // Validation
    const validation = manager.validate(vmSize);
    if (validation.errors.length > 0) {
        console.log('\n❌ Validation Errors:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    if (validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    if (validation.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    // Marketplace compliance
    const compliance = manager.isMarketplaceCompliant();
    console.log('\n=== Marketplace Compliance ===');
    console.log(`Status: ${compliance.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
    if (compliance.issues.length > 0) {
        console.log('Issues:');
        compliance.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log('\n');
}
/**
 * Display configuration in JSON format
 */
function displayJsonOutput(config, manager, vmSize) {
    const validation = manager.validate(vmSize);
    const compliance = manager.isMarketplaceCompliant();
    const output = {
        configuration: config,
        validation,
        compliance,
        estimatedCosts: calculateEstimatedCosts(config)
    };
    console.log(JSON.stringify(output, null, 2));
}
/**
 * Calculate estimated costs
 */
function calculateEstimatedCosts(config) {
    let totalMonthly = 0;
    // OS disk cost
    const osDiskInfo = disk_types_1.DiskTypeManager.getDiskTypeInfo(config.osDiskType);
    const osDiskCost = (config.osDiskSizeGB || 128) * osDiskInfo.estimatedCostPerGBMonth;
    totalMonthly += osDiskCost;
    // Data disks cost
    let dataDisksCost = 0;
    if (config.dataDisks && config.dataDisks.length > 0) {
        config.dataDisks.forEach(disk => {
            const diskInfo = disk_types_1.DiskTypeManager.getDiskTypeInfo(disk.storageAccountType);
            dataDisksCost += disk.sizeGB * diskInfo.estimatedCostPerGBMonth;
        });
        totalMonthly += dataDisksCost;
    }
    return {
        osDisk: {
            sizeGB: config.osDiskSizeGB || 128,
            monthlyCost: osDiskCost,
            type: config.osDiskType
        },
        dataDisks: config.dataDisks ? {
            count: config.dataDisks.length,
            totalSizeGB: config.dataDisks.reduce((sum, d) => sum + d.sizeGB, 0),
            monthlyCost: dataDisksCost
        } : null,
        total: {
            monthlyCost: totalMonthly,
            annualCost: totalMonthly * 12
        }
    };
}
/**
 * Export ARM template to file
 */
function exportTemplate(config, outputPath) {
    const template = (0, disk_types_1.generateDiskTemplate)(config);
    const fullTemplate = {
        '$schema': 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
        contentVersion: '1.0.0.0',
        parameters: template.parameters,
        variables: template.variables,
        resources: [
            {
                type: 'Microsoft.Compute/virtualMachines',
                apiVersion: '2023-03-01',
                name: '[parameters(\'vmName\')]',
                location: '[parameters(\'location\')]',
                properties: {
                    storageProfile: template.storageProfile,
                    // ... other VM properties would go here
                }
            }
        ]
    };
    fs.writeFileSync(outputPath, JSON.stringify(fullTemplate, null, 2));
    console.log(`✅ ARM template exported to ${outputPath}`);
}
/**
 * Create and configure the command
 */
const configureDiskTypesCommand = new commander_1.Command('configure-disk-types')
    .description('Configure disk types for Azure VMs (OS disk and data disks)')
    .option('--os-disk-type <type>', 'OS disk storage account type (Standard_LRS, StandardSSD_LRS, Premium_LRS, etc.)')
    .option('--os-disk-size <size>', 'OS disk size in GB', parseInt)
    .option('--os-disk-caching <caching>', 'OS disk caching (None, ReadOnly, ReadWrite)')
    .option('--performance-tier <tier>', 'Premium SSD performance tier (P1-P80)')
    .option('--data-disk-type <type>', 'Data disk storage account type')
    .option('--data-disk-count <count>', 'Number of data disks', parseInt)
    .option('--data-disk-size <size>', 'Data disk size in GB', parseInt)
    .option('--vm-size <size>', 'VM size for compatibility validation')
    .option('--location <location>', 'Azure region for validation')
    .option('--enable-ultra-ssd', 'Enable Ultra SSD capability on VM')
    .option('--validate', 'Validate configuration only (no template generation)')
    .option('--config <file>', 'Load configuration from JSON file')
    .option('--output <file>', 'Output ARM template to file')
    .option('--format <format>', 'Output format: text, json, or template', 'text')
    .option('--list-types', 'List all available disk types')
    .option('--list-tiers', 'List all Premium SSD performance tiers')
    .action(async (options) => {
    try {
        // Handle list commands
        if (options['list-types']) {
            displayDiskTypesCatalog();
            return;
        }
        if (options['list-tiers']) {
            displayPerformanceTiers();
            return;
        }
        // Load or create configuration
        let config;
        if (options.config) {
            config = loadConfigFromFile(options.config);
            console.log(`✅ Configuration loaded from ${options.config}`);
        }
        else {
            // Validate required options
            if (!options.osDiskType) {
                console.error('❌ Error: --os-disk-type is required (or use --config to load from file)');
                console.log('\nAvailable disk types:');
                console.log('  Standard_LRS       - Standard HDD');
                console.log('  StandardSSD_LRS    - Standard SSD');
                console.log('  StandardSSD_ZRS    - Standard SSD Zone-Redundant');
                console.log('  Premium_LRS        - Premium SSD');
                console.log('  Premium_ZRS        - Premium SSD Zone-Redundant');
                console.log('  PremiumV2_LRS      - Premium SSD v2');
                console.log('  UltraSSD_LRS       - Ultra Disk');
                console.log('\nUse --list-types for detailed information.');
                process.exit(1);
            }
            // Validate disk type
            if (!Object.values(disk_types_1.DiskStorageAccountType).includes(options.osDiskType)) {
                console.error(`❌ Error: Invalid disk type '${options.osDiskType}'`);
                console.log('Use --list-types to see all available disk types.');
                process.exit(1);
            }
            config = (0, disk_types_1.createDiskConfiguration)({
                osDiskType: options.osDiskType,
                osDiskSize: options.osDiskSize,
                osDiskCaching: options.osDiskCaching,
                osDiskPerformanceTier: options.performanceTier,
                dataDiskType: options.dataDiskType,
                dataDiskCount: options.dataDiskCount,
                dataDiskSize: options.dataDiskSize,
                enableUltraSSD: options.enableUltraSsd
            });
        }
        // Create manager
        const manager = new disk_types_1.DiskTypeManager(config);
        // Validation mode
        if (options.validate) {
            console.log('🔍 Validating disk configuration...\n');
            const validation = manager.validate(options.vmSize, options.location);
            if (validation.isValid) {
                console.log('✅ Configuration is valid\n');
            }
            else {
                console.log('❌ Configuration has errors\n');
            }
            if (validation.errors.length > 0) {
                console.log('Errors:');
                validation.errors.forEach(error => console.log(`  - ${error}`));
                console.log('');
            }
            if (validation.warnings.length > 0) {
                console.log('Warnings:');
                validation.warnings.forEach(warning => console.log(`  - ${warning}`));
                console.log('');
            }
            if (validation.recommendations.length > 0) {
                console.log('Recommendations:');
                validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
                console.log('');
            }
            process.exit(validation.isValid ? 0 : 1);
        }
        // Output handling
        if (options.output) {
            exportTemplate(config, options.output);
        }
        // Display output based on format
        switch (options.format) {
            case 'json':
                displayJsonOutput(config, manager, options.vmSize);
                break;
            case 'template':
                console.log(JSON.stringify((0, disk_types_1.generateDiskTemplate)(config), null, 2));
                break;
            case 'text':
            default:
                displayTextOutput(config, manager, options.vmSize);
                break;
        }
    }
    catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
});
exports.default = configureDiskTypesCommand;
