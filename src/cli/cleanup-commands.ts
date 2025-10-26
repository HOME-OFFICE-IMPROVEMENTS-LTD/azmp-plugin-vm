/**
 * Cleanup CLI Commands
 * 
 * Provides commands for cleaning up Azure resources with built-in safety mechanisms.
 * Implements defense-in-depth safety by enforcing confirmation at both CLI and PowerShell levels.
 */

import { Command } from 'commander';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PluginContext } from '../types';
import * as readline from 'readline';
import { ApprovalManager, DryRunResult } from '../utils/approval-manager';

export interface CleanupCommandsOptions {
  context: PluginContext;
}

interface VaultCleanupOptions {
  vaultName?: string;
  resourceGroup?: string;
  subscriptionName?: string;
  subscriptionId?: string;
  dryRun?: boolean;
  force?: boolean;
  confirm?: boolean;
  skipModuleUpdates?: boolean;
}

interface ScriptResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Prompt user for confirmation
 */
async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Validate PowerShell availability
 */
async function validatePowerShell(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pwsh', ['--version']);
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(
          'PowerShell 7+ (pwsh) is required but not found. ' +
          'Please install PowerShell 7+ from https://github.com/PowerShell/PowerShell'
        ));
      }
    });
    
    child.on('error', () => {
      reject(new Error(
        'PowerShell 7+ (pwsh) is required but not found. ' +
        'Please install PowerShell 7+ from https://github.com/PowerShell/PowerShell'
      ));
    });
  });
}

/**
 * Get path to cleanup PowerShell script
 */
function getCleanupScriptPath(): string {
  // Scripts are in the same repo: azmp-plugin-vm/scripts/cleanup/
  return path.join(__dirname, '../../scripts/cleanup/Delete-RecoveryServicesVault.ps1');
}

/**
 * Build PowerShell command arguments
 */
function buildPowerShellArgs(scriptPath: string, options: VaultCleanupOptions): string[] {
  const args: string[] = ['-File', scriptPath];
  
  if (options.vaultName) {
    args.push('-VaultName', options.vaultName);
  }
  
  if (options.resourceGroup) {
    args.push('-ResourceGroupName', options.resourceGroup);
  }
  
  if (options.subscriptionName) {
    args.push('-SubscriptionName', options.subscriptionName);
  }
  
  if (options.subscriptionId) {
    args.push('-SubscriptionId', options.subscriptionId);
  }
  
  if (options.dryRun) {
    args.push('-DryRun');
  }
  
  if (options.force) {
    args.push('-Force');
  }
  
  if (options.skipModuleUpdates) {
    args.push('-SkipModuleUpdates');
  }
  
  if ((options as any).json) {
    args.push('-JsonOutput');
  }
  
  return args;
}

/**
 * Execute PowerShell script
 */
async function executePowerShellScript(command: string, args: string[], context: PluginContext): Promise<ScriptResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      process.stdout.write(chunk);
    });
    
    child.stderr?.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      process.stderr.write(chunk);
    });
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code || 0
      });
    });
    
    child.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr: stderr + error.message,
        exitCode: 1
      });
    });
  });
}

/**
 * Execute vault cleanup with safety checks
 */
async function executeVaultCleanup(options: VaultCleanupOptions, context: PluginContext): Promise<void> {
  context.logger.info('🧹 Recovery Services Vault Cleanup');
  context.logger.info('═'.repeat(60));
  
  // Validate required parameters
  if (!options.vaultName) {
    throw new Error('Vault name is required. Use --vault-name option.');
  }
  
  if (!options.resourceGroup) {
    throw new Error('Resource group is required. Use --resource-group option.');
  }

  // Check PowerShell availability
  context.logger.info('Validating PowerShell environment...');
  await validatePowerShell();
  context.logger.info('✓ PowerShell 7+ detected');
  
  // Locate cleanup script
  const scriptPath = getCleanupScriptPath();
  try {
    await fs.access(scriptPath);
    context.logger.info('✓ Cleanup script located');
  } catch {
    throw new Error(`PowerShell script not found at: ${scriptPath}`);
  }
  
  // Display execution plan
  context.logger.info('\n📋 Execution Plan:');
  context.logger.info(`   Vault: ${options.vaultName}`);
  context.logger.info(`   Resource Group: ${options.resourceGroup}`);
  if (options.subscriptionName) {
    context.logger.info(`   Subscription: ${options.subscriptionName}`);
  }
  if (options.subscriptionId) {
    context.logger.info(`   Subscription ID: ${options.subscriptionId}`);
  }
  context.logger.info(`   Mode: ${options.dryRun ? 'DRY RUN (preview only)' : 'EXECUTION'}`);
  
  // Safety checks for destructive operations
  if (!options.dryRun && !options.force) {
    if (!options.confirm) {
      throw new Error(
        'Destructive operations require explicit confirmation.\n' +
        'Use --dry-run to preview operations, or --confirm to enable confirmation prompts, or --force to skip all safety checks.'
      );
    }
    
    // CLI-level confirmation prompt
    context.logger.warn('\n⚠️  DESTRUCTIVE OPERATION WARNING');
    context.logger.warn('   This will permanently delete the Recovery Services Vault and ALL backup data!');
    context.logger.warn('   This action CANNOT be undone.');
    context.logger.warn(`   Vault: ${options.vaultName}`);
    context.logger.warn(`   Resource Group: ${options.resourceGroup}`);
    context.logger.info('');
    
    const confirmed = await promptConfirmation('Type "yes" to proceed with deletion: ');
    
    if (!confirmed) {
      context.logger.info('Operation cancelled by user');
      return;
    }
    
    context.logger.info('✓ User confirmation received');
    
    // Enable Force flag for PowerShell script after CLI confirmation
    options.force = true;
  } else if (options.dryRun) {
    context.logger.info('\n🔍 DRY RUN MODE: Previewing operations without making changes');
  }

  // Check approval requirement when using --force
  const enforceApproval = process.env.AZMP_ENFORCE_APPROVAL === 'true';
  if (options.force && !options.dryRun && enforceApproval) {
    context.logger.info('\n🔒 AZMP_ENFORCE_APPROVAL is enabled - checking for approval...');
    
    const approvalManager = new ApprovalManager();
    const approval = approvalManager.findApprovalByVault(options.vaultName!, options.resourceGroup!);
    
    if (!approval) {
      throw new Error(
        'Approval required but not found.\n' +
        'AZMP_ENFORCE_APPROVAL is enabled, requiring prior approval before Force execution.\n\n' +
        'To approve this vault cleanup:\n' +
        '  1. Run: azmp vm cleanup vault --dry-run --json > dry-run.json\n' +
        '  2. Review dry-run.json\n' +
        '  3. Run: azmp vm cleanup vault-approve dry-run.json\n' +
        '  4. Then retry with --force'
      );
    }
    
    // Check if approval is expired
    const now = new Date();
    const expiresAt = new Date(approval.expiresAt);
    if (now >= expiresAt) {
      throw new Error(
        `Approval exists but has EXPIRED (expired at ${approval.expiresAt}).\n` +
        'Please create a new approval before executing --force.'
      );
    }
    
    context.logger.info('✓ Valid approval found');
    context.logger.info(`   Approved At: ${approval.approvedAt}`);
    context.logger.info(`   Expires At: ${approval.expiresAt}`);
    context.logger.info(`   Approved By: ${approval.approvedBy}`);
    
    // Calculate time remaining
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    context.logger.info(`   Valid for: ${hoursRemaining}h ${minutesRemaining}m`);
  }

  // Build PowerShell command
  const pwshArgs = buildPowerShellArgs(scriptPath, options);
  
  if ((options as any).json) {
    // JSON mode - validate dry-run is enabled
    if (!options.dryRun) {
      throw new Error('--json flag requires --dry-run mode');
    }
    
    context.logger.info('\n🚀 Executing PowerShell script in JSON mode...');
    context.logger.debug(`Command: pwsh ${pwshArgs.join(' ')}`);
    context.logger.info('');
    
    // Execute and capture JSON output
    const result = await executePowerShellScript('pwsh', pwshArgs, context);
    
    if (result.success) {
      // Parse and validate JSON output
      try {
        const dryRunResult: DryRunResult = JSON.parse(result.stdout);
        context.logger.info('✅ Dry-run completed successfully');
        context.logger.info(`   Hash: ${dryRunResult.hash}`);
        context.logger.info(`   Operations: ${dryRunResult.operations.length}`);
        
        // Optionally save to file (for now just output)
        console.log(JSON.stringify(dryRunResult, null, 2));
      } catch (error) {
        throw new Error(`Failed to parse JSON output: ${error}`);
      }
    } else {
      throw new Error(`PowerShell script failed with exit code ${result.exitCode}`);
    }
  } else {
    // Normal mode
    context.logger.info('\n🚀 Executing PowerShell script...');
    context.logger.debug(`Command: pwsh ${pwshArgs.join(' ')}`);
    context.logger.info('');
    
    // Execute script
    const result = await executePowerShellScript('pwsh', pwshArgs, context);
    
    // Handle results
    if (result.success) {
      context.logger.info('');
      context.logger.info('✅ Vault cleanup completed successfully');
      if (options.dryRun) {
        context.logger.info('   (Dry run - no actual changes made)');
      }
    } else {
      context.logger.error('');
      context.logger.error('❌ Vault cleanup failed');
      throw new Error(`PowerShell script failed with exit code ${result.exitCode}`);
    }
  }
}

/**
 * Approve a dry-run result for later execution
 */
async function executeVaultApprove(
  dryRunFile: string,
  options: { ttl: string },
  context: PluginContext
): Promise<void> {
  context.logger.info('📝 Approving dry-run result...');
  
  // Parse dry-run file
  let dryRunResult: DryRunResult;
  try {
    dryRunResult = ApprovalManager.parseDryRunFile(dryRunFile);
    context.logger.info(`✓ Dry-run file parsed successfully`);
  } catch (error) {
    throw new Error(`Failed to parse dry-run file: ${error}`);
  }
  
  // Verify mode is dry-run
  if (dryRunResult.mode !== 'dry-run') {
    throw new Error('Can only approve dry-run results (mode must be "dry-run")');
  }
  
  // Display vault info
  context.logger.info('\n📋 Vault Information:');
  context.logger.info(`   Name: ${dryRunResult.vaultInfo.name}`);
  context.logger.info(`   Resource Group: ${dryRunResult.vaultInfo.resourceGroup}`);
  context.logger.info(`   Subscription: ${dryRunResult.vaultInfo.subscription}`);
  context.logger.info(`   Operations: ${dryRunResult.operations.length}`);
  context.logger.info(`   Hash: ${dryRunResult.hash}`);
  
  // Display warnings if any
  if (dryRunResult.warnings && dryRunResult.warnings.length > 0) {
    context.logger.warn('\n⚠️  Warnings:');
    dryRunResult.warnings.forEach(warning => {
      context.logger.warn(`   - ${warning}`);
    });
  }
  
  // Save approval
  const approvalManager = new ApprovalManager();
  const ttlHours = parseInt(options.ttl, 10);
  
  if (isNaN(ttlHours) || ttlHours <= 0) {
    throw new Error('TTL must be a positive number');
  }
  
  const approval = approvalManager.saveApproval(dryRunResult, ttlHours);
  
  context.logger.info('\n✅ Approval saved successfully');
  context.logger.info(`   Approved At: ${approval.approvedAt}`);
  context.logger.info(`   Expires At: ${approval.expiresAt}`);
  context.logger.info(`   Approved By: ${approval.approvedBy}`);
  context.logger.info(`   Approval Hash: ${approval.hash}`);
  context.logger.info('');
  context.logger.info('✓ You can now execute this vault cleanup with --force');
}

/**
 * Check if a vault has a valid approval
 */
async function executeVaultCheck(
  options: { vaultName?: string; resourceGroup?: string },
  context: PluginContext
): Promise<void> {
  if (!options.vaultName) {
    throw new Error('Vault name is required. Use --vault-name option.');
  }
  
  if (!options.resourceGroup) {
    throw new Error('Resource group is required. Use --resource-group option.');
  }
  
  context.logger.info('🔍 Checking for vault approval...');
  context.logger.info(`   Vault: ${options.vaultName}`);
  context.logger.info(`   Resource Group: ${options.resourceGroup}`);
  context.logger.info('');
  
  const approvalManager = new ApprovalManager();
  const approval = approvalManager.findApprovalByVault(options.vaultName, options.resourceGroup);
  
  if (!approval) {
    context.logger.warn('❌ No approval found for this vault');
    context.logger.info('');
    context.logger.info('To approve a vault cleanup:');
    context.logger.info('  1. Run: azmp vm cleanup vault --dry-run --json > dry-run.json');
    context.logger.info('  2. Run: azmp vm cleanup vault-approve dry-run.json');
    process.exit(1);
  }
  
  // Check if approval is expired
  const now = new Date();
  const expiresAt = new Date(approval.expiresAt);
  const isExpired = now >= expiresAt;
  
  if (isExpired) {
    context.logger.warn('⚠️  Approval exists but has EXPIRED');
    context.logger.info(`   Approved At: ${approval.approvedAt}`);
    context.logger.info(`   Expired At: ${approval.expiresAt}`);
    context.logger.info('');
    context.logger.info('You need to create a new approval before executing --force');
    process.exit(1);
  }
  
  // Valid approval found
  context.logger.info('✅ Valid approval found');
  context.logger.info(`   Approved At: ${approval.approvedAt}`);
  context.logger.info(`   Expires At: ${approval.expiresAt}`);
  context.logger.info(`   Approved By: ${approval.approvedBy}`);
  context.logger.info(`   Operations: ${approval.operationCount}`);
  context.logger.info(`   Hash: ${approval.hash}`);
  context.logger.info('');
  
  // Calculate time remaining
  const timeRemaining = expiresAt.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  context.logger.info(`✓ Approval valid for ${hoursRemaining}h ${minutesRemaining}m`);
}

/**
 * Register cleanup commands
 */
export function registerCleanupCommands(
  parentCommand: Command,
  options: CleanupCommandsOptions
): void {
  const { context } = options;

  const cleanupCommand = parentCommand
    .command('cleanup')
    .description('Clean up Azure resources with safety mechanisms');

  // ========================================
  // cleanup vault
  // ========================================
  cleanupCommand
    .command('vault')
    .description('Delete Recovery Services Vault and all associated resources')
    .option('-n, --vault-name <name>', 'Name of the Recovery Services Vault')
    .option('-g, --resource-group <name>', 'Resource group containing the vault')
    .option('-s, --subscription-name <name>', 'Azure subscription name')
    .option('--subscription-id <id>', 'Azure subscription ID')
    .option('--dry-run', 'Preview operations without making changes')
    .option('--confirm', 'Enable confirmation prompts for destructive operations')
    .option('--force', 'Skip all safety confirmations (DANGEROUS - use with extreme caution)')
    .option('--skip-module-updates', 'Skip PowerShell module update checks')
    .option('--json', 'Output structured JSON (requires --dry-run)')
    .action(async (cmdOptions: VaultCleanupOptions & { json?: boolean }) => {
      try {
        await executeVaultCleanup(cmdOptions, context);
      } catch (error) {
        context.logger.error('Vault cleanup failed:');
        context.logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // ========================================
  // cleanup vault-approve
  // ========================================
  cleanupCommand
    .command('vault-approve <dry-run-file>')
    .description('Approve a dry-run result for later execution')
    .option('--ttl <hours>', 'Time-to-live for approval in hours (default: 24)', '24')
    .action(async (dryRunFile: string, cmdOptions: { ttl: string }) => {
      try {
        await executeVaultApprove(dryRunFile, cmdOptions, context);
      } catch (error) {
        context.logger.error('Approval failed:');
        context.logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // ========================================
  // cleanup vault-check
  // ========================================
  cleanupCommand
    .command('vault-check')
    .description('Check if a vault has a valid approval')
    .option('-n, --vault-name <name>', 'Name of the Recovery Services Vault')
    .option('-g, --resource-group <name>', 'Resource group containing the vault')
    .action(async (cmdOptions: { vaultName?: string; resourceGroup?: string }) => {
      try {
        await executeVaultCheck(cmdOptions, context);
      } catch (error) {
        context.logger.error('Check failed:');
        context.logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
