/**
 * Cross-Platform VM Extensions Module
 *
 * Provides Handlebars helpers for cross-platform VM extensions
 * Supporting 5 extensions that work on both Windows and Linux
 *
 * @module extensions/crossplatform
 */
/**
 * Cross-platform Extension interface
 */
export interface CrossPlatformExtension {
    name: string;
    publisher: string;
    type: string;
    typeHandlerVersion: string;
    autoUpgradeMinorVersion: boolean;
    settings?: Record<string, any>;
    protectedSettings?: Record<string, any>;
}
/**
 * 1. Microsoft.Azure.Monitor.AzureMonitorAgent (AMA)
 * Unified monitoring agent for Windows and Linux
 *
 * @param config - Azure Monitor Agent configuration
 * @returns Extension JSON object
 */
export interface AzureMonitorAgentConfig {
    workspaceId?: string;
    workspaceKey?: string;
    enableAutomaticUpgrade?: boolean;
}
export declare function azureMonitorAgentExtension(platform: "Windows" | "Linux", config?: AzureMonitorAgentConfig): CrossPlatformExtension;
/**
 * 2. Microsoft.Azure.Security.Monitoring.AzureSecurityAgent
 * Azure Security Center integration for both platforms
 *
 * @param platform - Target platform (Windows or Linux)
 * @returns Extension JSON object
 */
export declare function azureSecurityAgentExtension(platform: "Windows" | "Linux"): CrossPlatformExtension;
/**
 * 3. Microsoft.Azure.Monitor.DependencyAgent
 * Application performance monitoring for both platforms
 *
 * @param platform - Target platform (Windows or Linux)
 * @param config - Dependency agent configuration
 * @returns Extension JSON object
 */
export interface DependencyAgentConfig {
    enableAMA?: boolean;
    workspaceId?: string;
}
export declare function dependencyAgentExtension(platform: "Windows" | "Linux", config?: DependencyAgentConfig): CrossPlatformExtension;
/**
 * 4. Microsoft.Azure.ActiveDirectory.AADSSHLoginForLinux
 * Azure AD authentication for SSH (Linux only)
 *
 * @returns Extension JSON object
 */
export declare function aadSSHLoginExtension(): CrossPlatformExtension;
/**
 * 5. Microsoft.Azure.KeyVault.KeyVaultForLinux/Windows
 * Certificate and secret management
 *
 * @param platform - Target platform (Windows or Linux)
 * @param config - Key Vault configuration
 * @returns Extension JSON object
 */
export interface KeyVaultConfig {
    secretsManagementSettings: {
        pollingIntervalInS?: string;
        certificateStoreLocation?: string;
        certificateStoreName?: string;
        observedCertificates: Array<{
            url: string;
            certificateStoreLocation?: string;
            certificateStoreName?: string;
            accounts?: string[];
        }>;
        linkOnRenewal?: boolean;
        requireInitialSync?: boolean;
    };
    authenticationSettings?: {
        msiEndpoint?: string;
        msiClientId?: string;
    };
}
export declare function keyVaultExtension(platform: "Windows" | "Linux", config: KeyVaultConfig): CrossPlatformExtension;
/**
 * Export all cross-platform extension functions
 */
export declare const crossPlatformExtensions: {
    azureMonitorAgentExtension: typeof azureMonitorAgentExtension;
    azureSecurityAgentExtension: typeof azureSecurityAgentExtension;
    dependencyAgentExtension: typeof dependencyAgentExtension;
    aadSSHLoginExtension: typeof aadSSHLoginExtension;
    keyVaultExtension: typeof keyVaultExtension;
};
