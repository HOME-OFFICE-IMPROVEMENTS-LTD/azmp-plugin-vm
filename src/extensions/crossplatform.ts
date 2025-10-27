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

export function azureMonitorAgentExtension(
  platform: "Windows" | "Linux",
  config: AzureMonitorAgentConfig = {},
): CrossPlatformExtension {
  const type =
    platform === "Windows"
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
export function azureSecurityAgentExtension(
  platform: "Windows" | "Linux",
): CrossPlatformExtension {
  return {
    name: "AzureSecurityAgent",
    publisher: "Microsoft.Azure.Security.Monitoring",
    type:
      platform === "Windows"
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

export function dependencyAgentExtension(
  platform: "Windows" | "Linux",
  config: DependencyAgentConfig = {},
): CrossPlatformExtension {
  const type =
    platform === "Windows" ? "DependencyAgentWindows" : "DependencyAgentLinux";

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
export function aadSSHLoginExtension(): CrossPlatformExtension {
  return {
    name: "AADSSHLoginForLinux",
    publisher: "Microsoft.Azure.ActiveDirectory",
    type: "AADSSHLoginForLinux",
    typeHandlerVersion: "1.0",
    autoUpgradeMinorVersion: true,
  };
}

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
    certificateStoreLocation?: string; // Windows only
    certificateStoreName?: string; // Windows only
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

export function keyVaultExtension(
  platform: "Windows" | "Linux",
  config: KeyVaultConfig,
): CrossPlatformExtension {
  const type =
    platform === "Windows" ? "KeyVaultForWindows" : "KeyVaultForLinux";
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
        pollingIntervalInS:
          config.secretsManagementSettings.pollingIntervalInS ?? "3600",
        certificateStoreLocation:
          config.secretsManagementSettings.certificateStoreLocation,
        certificateStoreName:
          config.secretsManagementSettings.certificateStoreName,
        observedCertificates:
          config.secretsManagementSettings.observedCertificates,
        linkOnRenewal: config.secretsManagementSettings.linkOnRenewal ?? false,
        requireInitialSync:
          config.secretsManagementSettings.requireInitialSync ?? false,
      },
      authenticationSettings: config.authenticationSettings,
    },
  };
}

/**
 * Export all cross-platform extension functions
 */
export const crossPlatformExtensions = {
  azureMonitorAgentExtension,
  azureSecurityAgentExtension,
  dependencyAgentExtension,
  aadSSHLoginExtension,
  keyVaultExtension,
};
