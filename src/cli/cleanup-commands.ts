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

  // Build PowerShell command
  const pwshArgs = buildPowerShellArgs(scriptPath, options);
  
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
    .action(async (cmdOptions: VaultCleanupOptions) => {
      try {
        await executeVaultCleanup(cmdOptions, context);
      } catch (error) {
        context.logger.error('Vault cleanup failed:');
        context.logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
