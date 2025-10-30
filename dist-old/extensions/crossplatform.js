"use strict";
/**
 * Cross-Platform VM Extensions Module
 *
 * Provides Handlebars helpers for cross-platform VM extensions
 * Supporting 5 extensions that work on both Windows and Linux
 *
 * @module extensions/crossplatform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossPlatformExtensions = void 0;
exports.azureMonitorAgentExtension = azureMonitorAgentExtension;
exports.azureSecurityAgentExtension = azureSecurityAgentExtension;
exports.dependencyAgentExtension = dependencyAgentExtension;
exports.aadSSHLoginExtension = aadSSHLoginExtension;
exports.keyVaultExtension = keyVaultExtension;
function azureMonitorAgentExtension(platform, config = {}) {
    const type = platform === "Windows"
        ? "AzureMonitorWindowsAgent"
        : "AzureMonitorLinuxAgent";
    return {
        name: "AzureMonitorAgent",
        publisher: "Microsoft.Azure.Monitor",
        type: type,
        typeHandlerVersion: "1.22",
        autoUpgradeMinorVersion: true,
        settings: {
            workspaceId: config.workspaceId,
            enableAutomaticUpgrade: config.enableAutomaticUpgrade ?? true,
        },
        protectedSettings: config.workspaceKey
            ? {
                workspaceKey: config.workspaceKey,
            }
            : undefined,
    };
}
/**
 * 2. Microsoft.Azure.Security.Monitoring.AzureSecurityAgent
 * Azure Security Center integration for both platforms
 *
 * @param platform - Target platform (Windows or Linux)
 * @returns Extension JSON object
 */
function azureSecurityAgentExtension(platform) {
    return {
        name: "AzureSecurityAgent",
        publisher: "Microsoft.Azure.Security.Monitoring",
        type: platform === "Windows"
            ? "AzureSecurityWindowsAgent"
            : "AzureSecurityLinuxAgent",
        typeHandlerVersion: "2.14",
        autoUpgradeMinorVersion: true,
        settings: {
            enableGenevaUpload: true,
            enableAutoConfig: true,
            reportSuccessOnUnsupportedDistro: true,
        },
    };
}
function dependencyAgentExtension(platform, config = {}) {
    const type = platform === "Windows" ? "DependencyAgentWindows" : "DependencyAgentLinux";
    return {
        name: "DependencyAgent",
        publisher: "Microsoft.Azure.Monitoring.DependencyAgent",
        type: type,
        typeHandlerVersion: "9.10",
        autoUpgradeMinorVersion: true,
        settings: {
            enableAMA: config.enableAMA ?? true,
            workspaceId: config.workspaceId,
        },
    };
}
/**
 * 4. Microsoft.Azure.ActiveDirectory.AADSSHLoginForLinux
 * Azure AD authentication for SSH (Linux only)
 *
 * @returns Extension JSON object
 */
function aadSSHLoginExtension() {
    return {
        name: "AADSSHLoginForLinux",
        publisher: "Microsoft.Azure.ActiveDirectory",
        type: "AADSSHLoginForLinux",
        typeHandlerVersion: "1.0",
        autoUpgradeMinorVersion: true,
    };
}
function keyVaultExtension(platform, config) {
    const type = platform === "Windows" ? "KeyVaultForWindows" : "KeyVaultForLinux";
    const version = platform === "Windows" ? "3.0" : "2.0";
    // Set default certificate store for Windows
    if (platform === "Windows" && config.secretsManagementSettings) {
        if (!config.secretsManagementSettings.certificateStoreLocation) {
            config.secretsManagementSettings.certificateStoreLocation =
                "LocalMachine";
        }
        if (!config.secretsManagementSettings.certificateStoreName) {
            config.secretsManagementSettings.certificateStoreName = "MY";
        }
    }
    return {
        name: "KeyVault",
        publisher: "Microsoft.Azure.KeyVault",
        type: type,
        typeHandlerVersion: version,
        autoUpgradeMinorVersion: true,
        settings: {
            secretsManagementSettings: {
                pollingIntervalInS: config.secretsManagementSettings.pollingIntervalInS ?? "3600",
                certificateStoreLocation: config.secretsManagementSettings.certificateStoreLocation,
                certificateStoreName: config.secretsManagementSettings.certificateStoreName,
                observedCertificates: config.secretsManagementSettings.observedCertificates,
                linkOnRenewal: config.secretsManagementSettings.linkOnRenewal ?? false,
                requireInitialSync: config.secretsManagementSettings.requireInitialSync ?? false,
            },
            authenticationSettings: config.authenticationSettings,
        },
    };
}
/**
 * Export all cross-platform extension functions
 */
exports.crossPlatformExtensions = {
    azureMonitorAgentExtension,
    azureSecurityAgentExtension,
    dependencyAgentExtension,
    aadSSHLoginExtension,
    keyVaultExtension,
};
