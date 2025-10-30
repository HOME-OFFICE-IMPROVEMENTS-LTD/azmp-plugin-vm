/**
 * Identity Module
 *
 * Main entry point for identity and access management features
 * Integrates Managed Identity, Azure AD, and RBAC modules
 *
 * @module identity
 */
import Handlebars from "handlebars";
import * as managedidentity from "./managedidentity";
import * as azuread from "./azuread";
import * as rbac from "./rbac";
export { managedidentity, azuread, rbac };
/**
 * Identity templates metadata
 */
export declare const identityTemplates: {
    name: string;
    description: string;
    features: string[];
}[];
/**
 * Create Handlebars helpers for identity features
 */
export declare function createIdentityHelpers(): Record<string, Handlebars.HelperDelegate>;
/**
 * Register all identity helpers with Handlebars
 */
export declare function registerIdentityHelpers(): Record<string, Handlebars.HelperDelegate>;
/**
 * CLI Commands for Identity Module
 */
export declare const identityCLICommands: {
    command: string;
    description: string;
    subcommands: {
        command: string;
        description: string;
        action: () => void;
    }[];
}[];
/**
 * Identity module statistics
 */
export declare function getIdentityStats(): {
    templates: number;
    helpers: number;
    modules: number;
    features: {
        managedIdentity: number;
        azureAD: number;
        rbac: number;
    };
};
/**
 * Export identity module
 */
declare const _default: {
    managedidentity: typeof managedidentity;
    azuread: typeof azuread;
    rbac: typeof rbac;
    identityTemplates: {
        name: string;
        description: string;
        features: string[];
    }[];
    createIdentityHelpers: typeof createIdentityHelpers;
    registerIdentityHelpers: typeof registerIdentityHelpers;
    identityCLICommands: {
        command: string;
        description: string;
        subcommands: {
            command: string;
            description: string;
            action: () => void;
        }[];
    }[];
    getIdentityStats: typeof getIdentityStats;
};
export default _default;
