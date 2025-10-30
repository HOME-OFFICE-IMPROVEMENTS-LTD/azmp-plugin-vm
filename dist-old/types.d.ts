/**
 * Type definitions for the VM Plugin
 *
 * Re-exports types from the generator and adds VM-specific types
 */
/**
 * Plugin metadata
 */
export interface PluginMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    author?: string;
    requiredGeneratorVersion?: string;
}
/**
 * Template definition
 */
export interface TemplateDefinition {
    type: string;
    name: string;
    description: string;
    version: string;
    templatePath: string;
    files?: Record<string, string>;
    parameters?: Record<string, any>;
}
/**
 * Plugin context provided by generator
 */
export interface PluginContext {
    generatorVersion: string;
    templatesDir: string;
    outputDir: string;
    config: any;
    logger: {
        info: (message: string, ...args: any[]) => void;
        warn: (message: string, ...args: any[]) => void;
        error: (message: string, ...args: any[]) => void;
        debug: (message: string, ...args: any[]) => void;
    };
}
/**
 * Plugin interface
 */
export interface IPlugin {
    metadata: PluginMetadata;
    initialize?(context: PluginContext): Promise<void> | void;
    cleanup?(): Promise<void> | void;
    getTemplates?(): TemplateDefinition[];
    getHandlebarsHelpers?(): Record<string, (...args: any[]) => any>;
    registerCommands?(program: any): void;
}
