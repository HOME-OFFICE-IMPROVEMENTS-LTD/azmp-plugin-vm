/**
 * VM Extensions Module - Main Index
 *
 * Provides Handlebars helpers for Azure VM Extensions
 * Supports 20 extensions across Windows, Linux, and Cross-Platform
 *
 * @module extensions
 */
import * as windows from "./windows";
import * as linux from "./linux";
import * as crossplatform from "./crossplatform";
import * as health from "./health";
/**
 * Extension category type
 */
export type ExtensionCategory = "windows" | "linux" | "crossplatform";
/**
 * Extension metadata
 */
export interface ExtensionMetadata {
    name: string;
    displayName: string;
    category: ExtensionCategory;
    platform: "Windows" | "Linux" | "Both";
    publisher: string;
    type: string;
    version: string;
    description: string;
    priority: "Must-Have" | "Should-Have" | "Nice-to-Have";
}
/**
 * All available extensions catalog
 */
export declare const extensionsCatalog: ExtensionMetadata[];
/**
 * Create Handlebars helpers for VM extensions
 * All helpers use the 'ext:' namespace
 */
export declare function createExtensionHelpers(): Record<string, Function>;
export { windows, linux, crossplatform, health };
