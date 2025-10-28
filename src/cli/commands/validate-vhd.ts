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

import { Command } from 'commander';
import * as path from 'path';
import {
  validateVHD,
  formatValidationResult,
  VHDValidationOptions,
  VHDValidationResult,
} from '../../azure/vhd-validation';

// ============================================================================
// Command Definition
// ============================================================================

export function createValidateVHDCommand(): Command {
  const command = new Command('validate-vhd');

  command
    .description('Validate VHD file for Azure Marketplace compliance')
    .requiredOption(
      '-v, --vhd-path <path>',
      'Path to VHD file to validate'
    )
    .option(
      '-o, --os-type <type>',
      'Operating system type (Windows|Linux)',
      'Linux'
    )
    .option(
      '--no-check-generalization',
      'Skip generalization checks'
    )
    .option(
      '--no-strict-mode',
      'Disable strict validation mode (warnings become info)'
    )
    .option(
      '-f, --format <format>',
      'Output format (text|json)',
      'text'
    )
    .option(
      '--output <file>',
      'Write validation report to file (in addition to console)'
    )
    .action(async (options) => {
      await handleValidateVHD(options);
    });

  return command;
}

// ============================================================================
// Command Handler
// ============================================================================

interface ValidateVHDCommandOptions {
  vhdPath: string;
  osType: 'Windows' | 'Linux';
  checkGeneralization: boolean;
  strictMode: boolean;
  format: 'text' | 'json';
  output?: string;
}

async function handleValidateVHD(options: ValidateVHDCommandOptions): Promise<void> {
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
  const validationOptions: VHDValidationOptions = {
    vhdPath,
    osType: options.osType,
    checkGeneralization: options.checkGeneralization,
    strictMode: options.strictMode,
  };

  let result: VHDValidationResult;

  try {
    // Run validation
    console.log('Running validation checks...');
    console.log();

    result = await validateVHD(vhdPath, validationOptions);

    // Display result
    if (options.format === 'json') {
      displayJSONResult(result);
    } else {
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
    } else {
      console.log();
      console.log('✗ VHD validation FAILED');
      console.log();
      console.log('Please address the errors above before uploading to Azure Marketplace.');
      process.exit(1);
    }
  } catch (error) {
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

function displayTextResult(result: VHDValidationResult): void {
  const formattedResult = formatValidationResult(result);
  console.log(formattedResult);
}

function displayJSONResult(result: VHDValidationResult): void {
  const jsonOutput = JSON.stringify(result, null, 2);
  console.log(jsonOutput);
}

// ============================================================================
// File Output Functions
// ============================================================================

async function writeResultToFile(
  result: VHDValidationResult,
  filePath: string,
  format: 'text' | 'json'
): Promise<void> {
  const fs = await import('fs');
  const resolvedPath = path.resolve(filePath);

  let content: string;

  if (format === 'json') {
    content = JSON.stringify(result, null, 2);
  } else {
    content = formatValidationResult(result);
  }

  await fs.promises.writeFile(resolvedPath, content, 'utf-8');
}

// ============================================================================
// Export
// ============================================================================

export default createValidateVHDCommand();
