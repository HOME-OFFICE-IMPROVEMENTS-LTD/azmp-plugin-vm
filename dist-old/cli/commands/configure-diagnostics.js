"use strict";
/**
 * CLI Command: Configure VM Diagnostics
 *
 * Configures Azure VM diagnostics for marketplace compliance.
 * Implements P0-2: Diagnostics Extension Auto-Enable.
 *
 * Usage:
 *   azmp vm configure-diagnostics --vm-name <name> --os-type <Windows|Linux>
 *   azmp vm configure-diagnostics --validate --config <file>
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
const path = __importStar(require("path"));
const diagnostics_1 = require("../../azure/diagnostics");
// ============================================================================
// Command Implementation
// ============================================================================
const configureDiagnosticsCommand = new commander_1.Command('configure-diagnostics')
    .description('Configure VM diagnostics for Azure Marketplace compliance')
    .option('--vm-name <name>', 'Virtual machine name')
    .option('--os-type <type>', 'Operating system type (Windows or Linux)', validateOsType)
    .option('--location <location>', 'Azure region (e.g., eastus)')
    .option('--storage-account <name>', 'Diagnostics storage account name (auto-generated if not specified)')
    .option('--storage-rg <resourceGroup>', 'Resource group for existing storage account')
    .option('--no-boot-diagnostics', 'Disable boot diagnostics')
    .option('--no-guest-diagnostics', 'Disable guest-level diagnostics')
    .option('--retention-days <days>', 'Diagnostics logs retention period (1-365)', parseInt)
    .option('--validate', 'Validate diagnostics configuration without creating resources')
    .option('--config <file>', 'Load configuration from JSON file')
    .option('--output <file>', 'Output ARM template to file (JSON format)')
    .option('--format <format>', 'Output format: text, json, template', 'text')
    .option('--enable', 'Enable diagnostics (default: true)')
    .option('--disable', 'Disable diagnostics')
    .action(async (options) => {
    try {
        await handleConfigureDiagnostics(options);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// ============================================================================
// Command Handler
// ============================================================================
async function handleConfigureDiagnostics(options) {
    // Load configuration from file if provided
    let config;
    if (options.config) {
        config = loadConfigFromFile(options.config);
    }
    else {
        // Build configuration from CLI options
        config = buildConfigFromOptions(options);
    }
    // Validate configuration
    const manager = new diagnostics_1.DiagnosticsManager(config);
    const validation = manager.validate();
    if (!validation.valid) {
        console.error('❌ Diagnostics configuration is invalid:\n');
        validation.errors.forEach((error) => {
            console.error(`  • ${error}`);
        });
        process.exit(1);
    }
    // Check marketplace compliance
    const compliant = (0, diagnostics_1.isMarketplaceCompliant)(config);
    if (options.validate) {
        // Validation mode - report status
        outputValidationResults(config, validation, compliant, options.format);
        return;
    }
    // Generate diagnostics template
    const template = (0, diagnostics_1.generateDiagnosticsTemplate)(config);
    // Output results
    switch (options.format) {
        case 'json':
            outputJson(config, template, compliant);
            break;
        case 'template':
            outputTemplate(template);
            break;
        default:
            outputText(config, template, compliant);
            break;
    }
    // Save to file if requested
    if (options.output) {
        saveTemplateToFile(template, options.output);
        console.log(`\n✅ ARM template saved to: ${options.output}`);
    }
    // Exit with appropriate code
    process.exit(compliant ? 0 : 1);
}
// ============================================================================
// Configuration Builders
// ============================================================================
function buildConfigFromOptions(options) {
    // Validate required options
    if (!options.vmName) {
        throw new Error('--vm-name is required');
    }
    if (!options.osType) {
        throw new Error('--os-type is required (Windows or Linux)');
    }
    if (!options.location) {
        throw new Error('--location is required');
    }
    const enabled = options.disable ? false : true;
    return {
        enabled,
        vmName: options.vmName,
        osType: options.osType,
        location: options.location,
        storageAccountName: options.storageAccount,
        storageAccountResourceGroup: options.storageRg,
        enableBootDiagnostics: options.bootDiagnostics,
        enableGuestDiagnostics: options.guestDiagnostics,
        retentionDays: options.retentionDays,
    };
}
function loadConfigFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Configuration file not found: ${filePath}`);
    }
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const config = JSON.parse(content);
        // Validate required fields
        if (!config.vmName || !config.osType || !config.location) {
            throw new Error('Configuration file must contain vmName, osType, and location');
        }
        return config;
    }
    catch (error) {
        throw new Error(`Failed to load configuration file: ${error.message}`);
    }
}
// ============================================================================
// Validation Functions
// ============================================================================
function validateOsType(value) {
    const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (normalized !== 'Windows' && normalized !== 'Linux') {
        throw new Error('OS type must be Windows or Linux');
    }
    return normalized;
}
// ============================================================================
// Output Formatters
// ============================================================================
function outputValidationResults(config, validation, compliant, format) {
    if (format === 'json') {
        console.log(JSON.stringify({
            valid: validation.valid,
            marketplaceCompliant: compliant,
            errors: validation.errors,
            configuration: config,
        }, null, 2));
    }
    else {
        console.log('='.repeat(70));
        console.log('DIAGNOSTICS CONFIGURATION VALIDATION');
        console.log('='.repeat(70));
        console.log();
        console.log(`VM Name:              ${config.vmName}`);
        console.log(`OS Type:              ${config.osType}`);
        console.log(`Location:             ${config.location}`);
        console.log(`Enabled:              ${config.enabled ? 'Yes' : 'No'}`);
        console.log(`Boot Diagnostics:     ${config.enableBootDiagnostics !== false ? 'Enabled' : 'Disabled'}`);
        console.log(`Guest Diagnostics:    ${config.enableGuestDiagnostics !== false ? 'Enabled' : 'Disabled'}`);
        console.log(`Storage Account:      ${config.storageAccountName || '(auto-generated)'}`);
        console.log(`Retention Days:       ${config.retentionDays || 7}`);
        console.log();
        if (validation.valid) {
            console.log('✅ Configuration is valid');
        }
        else {
            console.log('❌ Configuration has errors:');
            validation.errors.forEach((error) => {
                console.log(`  • ${error}`);
            });
        }
        console.log();
        if (compliant) {
            console.log('✅ Configuration meets Azure Marketplace requirements');
        }
        else {
            console.log('⚠️  Configuration does NOT meet Azure Marketplace requirements');
            console.log('   Marketplace requires both boot and guest diagnostics enabled');
        }
        console.log();
    }
}
function outputText(config, template, compliant) {
    console.log('='.repeat(70));
    console.log('DIAGNOSTICS CONFIGURATION');
    console.log('='.repeat(70));
    console.log();
    console.log('Configuration:');
    console.log(`  VM Name:              ${config.vmName}`);
    console.log(`  OS Type:              ${config.osType}`);
    console.log(`  Location:             ${config.location}`);
    console.log(`  Enabled:              ${config.enabled ? 'Yes' : 'No'}`);
    console.log(`  Boot Diagnostics:     ${config.enableBootDiagnostics !== false ? 'Enabled' : 'Disabled'}`);
    console.log(`  Guest Diagnostics:    ${config.enableGuestDiagnostics !== false ? 'Enabled' : 'Disabled'}`);
    console.log(`  Storage Account:      ${config.storageAccountName || '(auto-generated)'}`);
    console.log(`  Retention Days:       ${config.retentionDays || 7}`);
    console.log();
    console.log('ARM Template Resources:');
    template.resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.type}`);
        if (resource.name) {
            console.log(`     Name: ${resource.name}`);
        }
    });
    console.log();
    console.log('Marketplace Compliance:');
    if (compliant) {
        console.log('  ✅ Configuration meets Azure Marketplace requirements');
    }
    else {
        console.log('  ⚠️  Configuration does NOT meet Azure Marketplace requirements');
        console.log('     Marketplace requires both boot and guest diagnostics enabled');
    }
    console.log();
    console.log('Next Steps:');
    if (compliant) {
        console.log('  1. Review the generated ARM template');
        console.log('  2. Integrate into your marketplace offer template');
        console.log('  3. Test deployment in Azure');
        console.log('  4. Submit for marketplace certification');
    }
    else {
        console.log('  1. Enable both boot and guest diagnostics');
        console.log('  2. Re-run this command with --enable flag');
        console.log('  3. Validate with --validate flag');
    }
    console.log();
}
function outputJson(config, template, compliant) {
    console.log(JSON.stringify({
        configuration: config,
        template,
        marketplaceCompliant: compliant,
    }, null, 2));
}
function outputTemplate(template) {
    console.log(JSON.stringify(template, null, 2));
}
function saveTemplateToFile(template, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf-8');
}
// ============================================================================
// Export
// ============================================================================
exports.default = configureDiagnosticsCommand;
