/**
 * Virtual Machine Plugin for Azure Marketplace Generator
 *
 * Provides VM templates, Handlebars helpers, and CLI commands
 * for generating Azure VM marketplace offers.
 *
 * @packageDocumentation
 */
import { IPlugin, PluginMetadata, TemplateDefinition, PluginContext } from "./types";
import { Command } from "commander";
/**
 * Virtual Machine Plugin Configuration
 */
export interface VmPluginOptions {
    /** Default VM size (e.g., Standard_D2s_v3) */
    defaultVmSize?: string;
    /** Include boot diagnostics */
    includeDiagnostics?: boolean;
    /** Create public IP address */
    includePublicIp?: boolean;
    /** Create Network Security Group */
    includeNsg?: boolean;
}
/**
 * VM Plugin Class
 *
 * Implements IPlugin interface for Azure Marketplace Generator
 */
export declare class VmPlugin implements IPlugin {
    metadata: PluginMetadata;
    private options;
    private context?;
    constructor(options?: VmPluginOptions);
    /**
     * Initialize the plugin
     */
    initialize(context: PluginContext): Promise<void>;
    /**
     * Cleanup plugin resources
     */
    cleanup(): Promise<void>;
    /**
     * Get template definitions
     */
    getTemplates(): TemplateDefinition[];
    /**
     * Get Handlebars helpers
     */
    getHandlebarsHelpers(): Record<string, (...args: any[]) => any>;
    private loadJsonInput;
    /**
     * Register CLI commands
     */
    registerCommands(program: Command): void;
}
/**
 * Default export - plugin instance
 */
export default VmPlugin;
