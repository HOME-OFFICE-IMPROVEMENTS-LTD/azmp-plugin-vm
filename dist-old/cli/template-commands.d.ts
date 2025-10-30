/**
 * Template CLI Commands
 *
 * Provides commands for generating, validating, testing, and deploying
 * ARM templates for Azure Marketplace VM offerings.
 */
import { Command } from "commander";
import { PluginContext } from "../types";
export interface TemplateCommandsOptions {
    context: PluginContext;
    plugin?: any;
}
/**
 * Register template commands
 */
export declare function registerTemplateCommands(parentCommand: Command, options: TemplateCommandsOptions): void;
