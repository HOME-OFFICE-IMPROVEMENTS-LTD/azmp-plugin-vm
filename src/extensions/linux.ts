/**
 * Linux VM Extensions Module
 *
 * Provides Handlebars helpers for Linux-specific VM extensions
 * Supporting 7 essential Linux extensions for Azure VMs
 *
 * @module extensions/linux
 */

/**
 * Linux Extension interface
 */
export interface LinuxExtension {
  name: string;
  publisher: string;
  type: string;
  typeHandlerVersion: string;
  autoUpgradeMinorVersion: boolean;
  settings?: Record<string, any>;
  protectedSettings?: Record<string, any>;
}

/**
 * 1. Microsoft.Azure.Extensions.CustomScript
 * Execute bash scripts for VM configuration and deployment
 *
 * @param config - Script configuration
 * @returns Extension JSON object
 */
export interface CustomScriptConfig {
  fileUris?: string[];
  commandToExecute?: string;
  skipDos2Unix?: boolean;
  timestamp?: number;
}

export function customScriptExtension(
  config: CustomScriptConfig,
): LinuxExtension {
  const settings: Record<string, any> = {};
  const protectedSettings: Record<string, any> = {};

  if (config.fileUris) {
    settings.fileUris = config.fileUris;
  }

  if (config.skipDos2Unix !== undefined) {
    settings.skipDos2Unix = config.skipDos2Unix;
  }

  if (config.timestamp) {
    settings.timestamp = config.timestamp;
  }

  if (config.commandToExecute) {
    protectedSettings.commandToExecute = config.commandToExecute;
  }

  return {
    name: "CustomScript",
    publisher: "Microsoft.Azure.Extensions",
    type: "CustomScript",
    typeHandlerVersion: "2.1",
    autoUpgradeMinorVersion: true,
    settings: Object.keys(settings).length > 0 ? settings : undefined,
    protectedSettings:
      Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
  };
}

/**
 * 2. Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux
 * Azure Monitor and Log Analytics integration for Linux
 *
 * @param workspaceId - Log Analytics workspace ID
 * @param workspaceKey - Log Analytics workspace key
 * @returns Extension JSON object
 */
export function omsAgentExtension(
  workspaceId: string,
  workspaceKey: string,
): LinuxExtension {
  return {
    name: "OmsAgentForLinux",
    publisher: "Microsoft.EnterpriseCloud.Monitoring",
    type: "OmsAgentForLinux",
    typeHandlerVersion: "1.14",
    autoUpgradeMinorVersion: true,
    settings: {
      workspaceId: workspaceId,
      stopOnMultipleConnections: false,
    },
    protectedSettings: {
      workspaceKey: workspaceKey,
    },
  };
}

/**
 * 3. Microsoft.Azure.Security.Monitoring.AzureSecurityLinuxAgent
 * Security baseline monitoring and compliance
 *
 * @returns Extension JSON object
 */
export function securityAgentExtension(): LinuxExtension {
  return {
    name: "AzureSecurityLinuxAgent",
    publisher: "Microsoft.Azure.Security.Monitoring",
    type: "AzureSecurityLinuxAgent",
    typeHandlerVersion: "2.14",
    autoUpgradeMinorVersion: true,
    settings: {
      enableGenevaUpload: true,
      enableAutoConfig: true,
    },
  };
}

/**
 * 4. Microsoft.OSTCExtensions.VMAccessForLinux
 * SSH key management and user administration
 *
 * @param config - VM Access configuration
 * @returns Extension JSON object
 */
export interface VMAccessConfig {
  username?: string;
  password?: string;
  sshKey?: string;
  resetSSH?: boolean;
  removeUser?: string;
  expiration?: string;
}

export function vmAccessExtension(config: VMAccessConfig): LinuxExtension {
  const protectedSettings: Record<string, any> = {};

  if (config.username) {
    protectedSettings.username = config.username;
  }

  if (config.password) {
    protectedSettings.password = config.password;
  }

  if (config.sshKey) {
    protectedSettings.ssh_key = config.sshKey;
  }

  if (config.resetSSH) {
    protectedSettings.reset_ssh = config.resetSSH;
  }

  if (config.removeUser) {
    protectedSettings.remove_user = config.removeUser;
  }

  if (config.expiration) {
    protectedSettings.expiration = config.expiration;
  }

  return {
    name: "VMAccessForLinux",
    publisher: "Microsoft.OSTCExtensions",
    type: "VMAccessForLinux",
    typeHandlerVersion: "1.5",
    autoUpgradeMinorVersion: true,
    protectedSettings,
  };
}

/**
 * 5. Microsoft.Azure.Monitor.DependencyAgent.DependencyAgentLinux
 * Application dependency mapping
 *
 * @returns Extension JSON object
 */
export function dependencyAgentExtension(): LinuxExtension {
  return {
    name: "DependencyAgentLinux",
    publisher: "Microsoft.Azure.Monitoring.DependencyAgent",
    type: "DependencyAgentLinux",
    typeHandlerVersion: "9.10",
    autoUpgradeMinorVersion: true,
    settings: {
      enableAMA: true,
    },
  };
}

/**
 * 6. Microsoft.HpcCompute.NvidiaGpuDriverLinux
 * NVIDIA GPU driver installation for Linux
 *
 * @returns Extension JSON object
 */
export function gpuDriverExtension(): LinuxExtension {
  return {
    name: "NvidiaGpuDriverLinux",
    publisher: "Microsoft.HpcCompute",
    type: "NvidiaGpuDriverLinux",
    typeHandlerVersion: "1.6",
    autoUpgradeMinorVersion: true,
  };
}

/**
 * 7. Microsoft.CPlat.Core.RunCommandLinux
 * Remote command execution
 *
 * @param config - Run command configuration
 * @returns Extension JSON object
 */
export interface RunCommandConfig {
  commandToExecute?: string;
  script?: string[];
  parameters?: Array<{ name: string; value: string }>;
  timeoutInSeconds?: number;
  asyncExecution?: boolean;
}

export function runCommandExtension(config: RunCommandConfig): LinuxExtension {
  const protectedSettings: Record<string, any> = {};

  if (config.commandToExecute) {
    protectedSettings.commandToExecute = config.commandToExecute;
  } else if (config.script) {
    protectedSettings.script = config.script;
  }

  if (config.parameters) {
    protectedSettings.parameters = config.parameters;
  }

  const settings: Record<string, any> = {};

  if (config.timeoutInSeconds) {
    settings.timeoutInSeconds = config.timeoutInSeconds;
  }

  if (config.asyncExecution !== undefined) {
    settings.asyncExecution = config.asyncExecution;
  }

  return {
    name: "RunCommandLinux",
    publisher: "Microsoft.CPlat.Core",
    type: "RunCommandLinux",
    typeHandlerVersion: "1.0",
    autoUpgradeMinorVersion: true,
    settings: Object.keys(settings).length > 0 ? settings : undefined,
    protectedSettings:
      Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
  };
}

/**
 * Export all Linux extension functions
 */
export const linuxExtensions = {
  customScriptExtension,
  omsAgentExtension,
  securityAgentExtension,
  vmAccessExtension,
  dependencyAgentExtension,
  gpuDriverExtension,
  runCommandExtension,
};
