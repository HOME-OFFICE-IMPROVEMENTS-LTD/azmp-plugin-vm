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
import { Command } from 'commander';
declare const configureDiagnosticsCommand: Command;
export default configureDiagnosticsCommand;
