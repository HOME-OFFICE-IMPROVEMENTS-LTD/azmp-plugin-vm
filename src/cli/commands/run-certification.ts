/**
 * CLI Command: Run Azure VM Certification Tests
 * Executes certification tests on VHD files and generates reports
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CertificationTestRunner,
  CertificationTestConfig,
  runBatchTests,
  quickValidate
} from '../../azure/certification-tests';
import {
  CertificationReportGenerator,
  ReportFormat,
  ReportConfig,
  ReportMetadata
} from '../../azure/certification-report';

/**
 * CLI command options for certification testing
 */
export interface RunCertificationOptions {
  /**
   * Path to VHD file or directory containing VHDs
   */
  vhdPath: string;

  /**
   * Azure VM size (e.g., Standard_D2s_v3)
   */
  vmSize?: string;

  /**
   * Azure region (e.g., eastus, westus2)
   */
  region?: string;

  /**
   * Skip security scan
   */
  skipSecurity?: boolean;

  /**
   * Skip performance tests
   */
  skipPerformance?: boolean;

  /**
   * Output directory for reports
   */
  outputDir?: string;

  /**
   * Report formats (comma-separated: html,json,xml,markdown)
   */
  formats?: string;

  /**
   * Quick validation mode (VHD format only)
   */
  quick?: boolean;

  /**
   * Batch mode (process all VHDs in directory)
   */
  batch?: boolean;

  /**
   * Verbose output
   */
  verbose?: boolean;

  /**
   * Company name for report header
   */
  company?: string;

  /**
   * Project name for report header
   */
  project?: string;

  /**
   * Open HTML report after generation
   */
  open?: boolean;
}

/**
 * Run certification tests on VHD file(s)
 */
export async function runCertification(
  options: RunCertificationOptions
): Promise<void> {
  try {
    console.log('Azure VM Certification Test Tool');
    console.log('================================\n');

    // Validate VHD path
    if (!options.vhdPath) {
      throw new Error('VHD path is required. Use --vhd-path <path>');
    }

    if (!fs.existsSync(options.vhdPath)) {
      throw new Error(`VHD path not found: ${options.vhdPath}`);
    }

    const stats = fs.statSync(options.vhdPath);
    const outputDir = options.outputDir || './certification-results';

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Parse report formats
    const formats = options.formats
      ? options.formats.split(',').map((f) => f.trim() as ReportFormat)
      : [ReportFormat.HTML, ReportFormat.JSON];

    // Quick validation mode
    if (options.quick) {
      console.log('Running quick VHD validation...\n');
      const validation = await quickValidate(options.vhdPath);

      console.log('Quick Validation Results:');
      console.log(`  Format: ${validation.format}`);
      console.log(`  Size: ${validation.sizeGB} GB`);
      console.log(`  Fixed Size: ${validation.isFixedSize ? '✓' : '✗'}`);
      console.log(`  1MB Aligned: ${validation.hasCorrectAlignment ? '✓' : '✗'}`);
      console.log(`  Valid: ${validation.isValid ? '✓ YES' : '✗ NO'}\n`);

      if (validation.errors.length > 0) {
        console.log('Errors:');
        validation.errors.forEach((err) => console.log(`  ✗ ${err}`));
        console.log('');
      }

      if (validation.warnings.length > 0) {
        console.log('Warnings:');
        validation.warnings.forEach((warn) => console.log(`  ⚠ ${warn}`));
        console.log('');
      }

      if (!validation.isValid) {
        process.exit(1);
      }

      return;
    }

    // Batch mode
    if (options.batch || stats.isDirectory()) {
      console.log('Running certification tests in batch mode...\n');

      const vhdFiles = stats.isDirectory()
        ? fs
            .readdirSync(options.vhdPath)
            .filter((f) => f.endsWith('.vhd'))
            .map((f) => path.join(options.vhdPath, f))
        : [options.vhdPath];

      if (vhdFiles.length === 0) {
        throw new Error('No VHD files found in directory');
      }

      console.log(`Found ${vhdFiles.length} VHD file(s):\n`);
      vhdFiles.forEach((f) => console.log(`  - ${path.basename(f)}`));
      console.log('');

      const config: Partial<CertificationTestConfig> = {
        vmSize: options.vmSize,
        region: options.region,
        skipSecurityScan: options.skipSecurity,
        skipPerformanceTest: options.skipPerformance,
        verboseOutput: options.verbose,
        outputDir
      };

      const results = await runBatchTests(vhdFiles, config);

      console.log('\nBatch Test Results Summary:');
      console.log('===========================\n');

      let totalPassed = 0;
      let totalFailed = 0;

      results.forEach((result, vhdPath) => {
        const filename = path.basename(vhdPath);
        const statusIcon = result.overallStatus === 'passed' ? '✓' : '✗';
        console.log(`${statusIcon} ${filename}: ${result.score}/100 (${result.overallStatus})`);

        if (result.overallStatus === 'passed') {
          totalPassed++;
        } else {
          totalFailed++;
        }

        // Generate reports for each VHD
        const vhdOutputDir = path.join(outputDir, path.basename(vhdPath, '.vhd'));
        if (!fs.existsSync(vhdOutputDir)) {
          fs.mkdirSync(vhdOutputDir, { recursive: true });
        }

        const generator = new CertificationReportGenerator(
          result,
          {
            outputDir: vhdOutputDir,
            formats,
            filename: 'certification-report'
          },
          {
            title: `Certification Report: ${filename}`,
            generatedDate: new Date(),
            companyName: options.company,
            projectName: options.project,
            vhdPath,
            vmSize: options.vmSize,
            region: options.region
          }
        );

        generator.generateAll().catch((err) => {
          console.error(`  Warning: Failed to generate report for ${filename}: ${err.message}`);
        });
      });

      console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed`);
      console.log(`\nReports saved to: ${outputDir}\n`);

      if (totalFailed > 0) {
        process.exit(1);
      }

      return;
    }

    // Single VHD mode
    console.log(`Testing VHD: ${path.basename(options.vhdPath)}\n`);

    const config: CertificationTestConfig = {
      vhdPath: options.vhdPath,
      vmSize: options.vmSize,
      region: options.region,
      skipSecurityScan: options.skipSecurity || false,
      skipPerformanceTest: options.skipPerformance || false,
      verboseOutput: options.verbose || false,
      outputDir
    };

    const runner = new CertificationTestRunner(config);

    console.log('Running certification tests...');
    console.log('This may take several minutes.\n');

    const results = await runner.runAll();

    // Print summary
    console.log('\n' + runner.getSummary());

    // Generate reports
    console.log('\nGenerating reports...');

    const metadata: ReportMetadata = {
      title: 'Azure VM Certification Report',
      generatedDate: new Date(),
      companyName: options.company,
      projectName: options.project,
      vhdPath: options.vhdPath,
      vmSize: options.vmSize,
      region: options.region
    };

    const reportConfig: ReportConfig = {
      outputDir,
      formats,
      filename: 'certification-report'
    };

    const generator = new CertificationReportGenerator(results, reportConfig, metadata);
    const generatedFiles = await generator.generateAll();

    console.log('\nReports generated:');
    generatedFiles.forEach((file) => {
      console.log(`  ✓ ${file}`);
    });

    // Open HTML report if requested
    if (options.open) {
      const htmlReport = generatedFiles.find((f) => f.endsWith('.html'));
      if (htmlReport) {
        const { execSync } = require('child_process');
        try {
          const openCommand =
            process.platform === 'darwin'
              ? 'open'
              : process.platform === 'win32'
              ? 'start'
              : 'xdg-open';
          execSync(`${openCommand} "${htmlReport}"`);
          console.log('\nOpened HTML report in browser');
        } catch (err) {
          console.log('\nCould not open HTML report automatically');
        }
      }
    }

    // Exit with error code if tests failed
    if (results.overallStatus === 'failed') {
      console.log('\n✗ Certification tests FAILED');
      process.exit(1);
    } else if (results.overallStatus === 'warning') {
      console.log('\n⚠ Certification tests completed with WARNINGS');
      process.exit(0);
    } else {
      console.log('\n✓ Certification tests PASSED');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Parse CLI arguments and run certification
 */
export function runCertificationCommand(args: string[]): Promise<void> {
  const options: RunCertificationOptions = {
    vhdPath: ''
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--vhd-path':
      case '-v':
        options.vhdPath = nextArg;
        i++;
        break;

      case '--vm-size':
        options.vmSize = nextArg;
        i++;
        break;

      case '--region':
      case '-r':
        options.region = nextArg;
        i++;
        break;

      case '--output-dir':
      case '-o':
        options.outputDir = nextArg;
        i++;
        break;

      case '--formats':
      case '-f':
        options.formats = nextArg;
        i++;
        break;

      case '--company':
        options.company = nextArg;
        i++;
        break;

      case '--project':
        options.project = nextArg;
        i++;
        break;

      case '--skip-security':
        options.skipSecurity = true;
        break;

      case '--skip-performance':
        options.skipPerformance = true;
        break;

      case '--quick':
      case '-q':
        options.quick = true;
        break;

      case '--batch':
      case '-b':
        options.batch = true;
        break;

      case '--verbose':
        options.verbose = true;
        break;

      case '--open':
        options.open = true;
        break;

      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return runCertification(options);
}

/**
 * Print CLI help
 */
function printHelp(): void {
  console.log(`
Azure VM Certification Test Tool
=================================

Usage:
  azmp-plugin-vm run-certification [options]

Options:
  --vhd-path, -v <path>       Path to VHD file or directory (required)
  --vm-size <size>            Azure VM size (e.g., Standard_D2s_v3)
  --region, -r <region>       Azure region (e.g., eastus, westus2)
  --output-dir, -o <dir>      Output directory for reports (default: ./certification-results)
  --formats, -f <formats>     Report formats: html,json,xml,markdown (default: html,json)
  --company <name>            Company name for report header
  --project <name>            Project name for report header
  --skip-security             Skip security scan
  --skip-performance          Skip performance tests
  --quick, -q                 Quick validation mode (VHD format only)
  --batch, -b                 Batch mode (process all VHDs in directory)
  --verbose                   Verbose output
  --open                      Open HTML report after generation
  --help, -h                  Show this help message

Examples:
  # Run full certification tests on a single VHD
  azmp-plugin-vm run-certification --vhd-path ./my-vm.vhd

  # Quick VHD format validation
  azmp-plugin-vm run-certification --vhd-path ./my-vm.vhd --quick

  # Batch test all VHDs in a directory
  azmp-plugin-vm run-certification --vhd-path ./vhds --batch

  # Run with custom output and open report
  azmp-plugin-vm run-certification --vhd-path ./my-vm.vhd --output-dir ./reports --open

  # Skip performance tests and generate only HTML report
  azmp-plugin-vm run-certification --vhd-path ./my-vm.vhd --skip-performance --formats html

For more information, visit: https://docs.microsoft.com/azure/marketplace/
  `);
}
