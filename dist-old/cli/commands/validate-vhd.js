"use strict";
/**
 * CLI Command: validate-vhd
 *
 * Validates VHD files for Azure Marketplace compliance
 *
 * Usage:
 *   azmp-plugin-vm validate-vhd --vhd-path <path-to-vhd>
 *   azmp-plugin-vm validate-vhd --vhd-path <path> --os-type Windows --strict
 *
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-1, AC-6)
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
exports.createValidateVHDCommand = createValidateVHDCommand;
const commander_1 = require("commander");
const path = __importStar(require("path"));
const vhd_validation_1 = require("../../azure/vhd-validation");
// ============================================================================
// Command Definition
// ============================================================================
function createValidateVHDCommand() {
    const command = new commander_1.Command('validate-vhd');
    command
        .description('Validate VHD file for Azure Marketplace compliance')
        .requiredOption('-v, --vhd-path <path>', 'Path to VHD file to validate')
        .option('-o, --os-type <type>', 'Operating system type (Windows|Linux)', 'Linux')
        .option('--no-check-generalization', 'Skip generalization checks')
        .option('--no-strict-mode', 'Disable strict validation mode (warnings become info)')
        .option('-f, --format <format>', 'Output format (text|json)', 'text')
        .option('--output <file>', 'Write validation report to file (in addition to console)')
        .action(async (options) => {
        await handleValidateVHD(options);
    });
    return command;
}
async function handleValidateVHD(options) {
    console.log('═'.repeat(80));
    console.log('Azure Marketplace VHD Validator');
    console.log('═'.repeat(80));
    console.log();
    // Resolve VHD path
    const vhdPath = path.resolve(options.vhdPath);
    console.log(`Validating VHD: ${vhdPath}`);
    console.log(`OS Type: ${options.osType}`);
    console.log(`Strict Mode: ${options.strictMode ? 'Enabled' : 'Disabled'}`);
    console.log(`Check Generalization: ${options.checkGeneralization ? 'Yes' : 'No'}`);
    console.log();
    // Build validation options
    const validationOptions = {
        vhdPath,
        osType: options.osType,
        checkGeneralization: options.checkGeneralization,
        strictMode: options.strictMode,
    };
    let result;
    try {
        // Run validation
        console.log('Running validation checks...');
        console.log();
        result = await (0, vhd_validation_1.validateVHD)(vhdPath, validationOptions);
        // Display result
        if (options.format === 'json') {
            displayJSONResult(result);
        }
        else {
            displayTextResult(result);
        }
        // Write to file if requested
        if (options.output) {
            await writeResultToFile(result, options.output, options.format);
            console.log();
            console.log(`Validation report written to: ${options.output}`);
        }
        // Exit with appropriate code
        if (result.valid) {
            console.log();
            console.log('✓ VHD validation PASSED');
            process.exit(0);
        }
        else {
            console.log();
            console.log('✗ VHD validation FAILED');
            console.log();
            console.log('Please address the errors above before uploading to Azure Marketplace.');
            process.exit(1);
        }
    }
    catch (error) {
        console.error();
        console.error('✗ Validation failed with error:');
        console.error(error instanceof Error ? error.message : String(error));
        console.error();
        process.exit(1);
    }
}
// ============================================================================
// Display Functions
// ============================================================================
function displayTextResult(result) {
    const formattedResult = (0, vhd_validation_1.formatValidationResult)(result);
    console.log(formattedResult);
}
function displayJSONResult(result) {
    const jsonOutput = JSON.stringify(result, null, 2);
    console.log(jsonOutput);
}
// ============================================================================
// File Output Functions
// ============================================================================
async function writeResultToFile(result, filePath, format) {
    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
    const resolvedPath = path.resolve(filePath);
    let content;
    if (format === 'json') {
        content = JSON.stringify(result, null, 2);
    }
    else {
        content = (0, vhd_validation_1.formatValidationResult)(result);
    }
    await fs.promises.writeFile(resolvedPath, content, 'utf-8');
}
// ============================================================================
// Export
// ============================================================================
exports.default = createValidateVHDCommand();
