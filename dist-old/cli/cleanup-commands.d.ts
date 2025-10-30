/**
 * Cleanup CLI Commands
 *
 * Provides commands for cleaning up Azure resources with built-in safety mechanisms.
 * Implements defense-in-depth safety by enforcing confirmation at both CLI and PowerShell levels.
 */
import { Command } from "commander";
import { PluginContext } from "../types";
export interface CleanupCommandsOptions {
    context: PluginContext;
}
/**
 * Register cleanup commands
 */
export declare function registerCleanupCommands(parentCommand: Command, options: CleanupCommandsOptions): void;
