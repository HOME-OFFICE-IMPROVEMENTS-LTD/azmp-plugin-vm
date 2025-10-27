/**
 * Windows VM Extensions Module
 *
 * Provides Handlebars helpers for Windows-specific VM extensions
 * Supporting 8 essential Windows extensions for Azure VMs
 *
 * @module extensions/windows
 */

/**
 * Windows Extension interface
 */
export interface WindowsExtension {
  name: string;
  publisher: string;
  type: string;
  typeHandlerVersion: string;
  autoUpgradeMinorVersion: boolean;
  settings?: Record<string, any>;
  protectedSettings?: Record<string, any>;
}

/**
 * Custom Script Extension configuration
 */
export interface CustomScriptExtensionConfig {
  fileUris?: string[];
  commandToExecute?: string;
  scriptUrl?: string;
  scriptName?: string;
  arguments?: string;
  timestamp?: number;
}

/**
 * 1. Microsoft.Compute.CustomScriptExtension
 * Execute PowerShell scripts for VM configuration and deployment
 *
 * @param config - Script configuration
 * @returns Extension JSON object
 */
export function customScriptExtension(
  config: CustomScriptExtensionConfig,
): WindowsExtension {
  const settings: Record<string, any> = {};
  const protectedSettings: Record<string, any> = {};

  if (config.fileUris) {
    settings.fileUris = config.fileUris;
  }

  if (config.commandToExecute) {
    protectedSettings.commandToExecute = config.commandToExecute;
  }

  if (config.timestamp) {
    settings.timestamp = config.timestamp;
  }

  return {
    name: "CustomScriptExtension",
    publisher: "Microsoft.Compute",
    type: "CustomScriptExtension",
    typeHandlerVersion: "1.10",
    autoUpgradeMinorVersion: true,
    settings: Object.keys(settings).length > 0 ? settings : undefined,
    protectedSettings:
      Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
  };
}

/**
 * 2. Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent
 * Azure Monitor and Log Analytics integration
 *
 * @param workspaceId - Log Analytics workspace ID
 * @param workspaceKey - Log Analytics workspace key
 * @returns Extension JSON object
 */
export function monitoringAgentExtension(
  workspaceId: string,
  workspaceKey: string,
): WindowsExtension {
  return {
    name: "MicrosoftMonitoringAgent",
    publisher: "Microsoft.EnterpriseCloud.Monitoring",
    type: "MicrosoftMonitoringAgent",
    typeHandlerVersion: "1.0",
    autoUpgradeMinorVersion: true,
    settings: {
      workspaceId: workspaceId,
    },
    protectedSettings: {
      workspaceKey: workspaceKey,
    },
  };
}

/**
 * 3. Microsoft.Azure.Security.IaaSAntimalware
 * Windows Defender Antimalware configuration
 *
 * @param config - Antimalware configuration
 * @returns Extension JSON object
 */
export interface AntimalwareConfig {
  realtimeProtection?: boolean;
  scheduledScanDay?: number; // 0-8: 0=Everyday, 1-7=Days, 8=Disabled
  scheduledScanTime?: number; // 0-1380 minutes from midnight
  scheduledScanType?: "Quick" | "Full";
  exclusions?: {
    paths?: string[];
    extensions?: string[];
    processes?: string[];
  };
}

export function antimalwareExtension(
  config: AntimalwareConfig = {},
): WindowsExtension {
  const settings = {
    AntimalwareEnabled: true,
    RealtimeProtectionEnabled: config.realtimeProtection ?? true,
    ScheduledScanSettings: {
      isEnabled: config.scheduledScanDay !== 8,
      day: config.scheduledScanDay ?? 7, // Sunday by default
      time: config.scheduledScanTime ?? 120, // 2 AM by default
      scanType: config.scheduledScanType ?? "Quick",
    },
    Exclusions: config.exclusions ?? {
      Paths: "",
      Extensions: "",
      Processes: "",
    },
  };

  return {
    name: "IaaSAntimalware",
    publisher: "Microsoft.Azure.Security",
    type: "IaaSAntimalware",
    typeHandlerVersion: "1.3",
    autoUpgradeMinorVersion: true,
    settings,
  };
}

/**
 * 4. Microsoft.Powershell.DSC
 * PowerShell Desired State Configuration
 *
 * @param config - DSC configuration
 * @returns Extension JSON object
 */
export interface DSCConfig {
  modulesUrl: string;
  configurationFunction: string;
  properties?: Record<string, any>;
  wmfVersion?: string;
  privacy?: {
    dataCollection?: "enable" | "disable";
  };
}

export function dscExtension(config: DSCConfig): WindowsExtension {
  const settings: Record<string, any> = {
    modulesUrl: config.modulesUrl,
    configurationFunction: config.configurationFunction,
  };

  if (config.wmfVersion) {
    settings.wmfVersion = config.wmfVersion;
  }

  if (config.privacy) {
    settings.privacy = config.privacy;
  }

  const protectedSettings = config.properties
    ? { properties: config.properties }
    : undefined;

  return {
    name: "DSC",
    publisher: "Microsoft.Powershell",
    type: "DSC",
    typeHandlerVersion: "2.77",
    autoUpgradeMinorVersion: true,
    settings,
    protectedSettings,
  };
}

/**
 * 5. Microsoft.Compute.JsonADDomainExtension
 * Active Directory domain join
 *
 * @param config - Domain join configuration
 * @returns Extension JSON object
 */
export interface DomainJoinConfig {
  domain: string;
  ouPath?: string;
  user: string;
  password: string;
  restart?: boolean;
  options?: number; // 0x00000001 = NETSETUP_JOIN_DOMAIN, 0x00000003 = with restart
}

export function domainJoinExtension(
  config: DomainJoinConfig,
): WindowsExtension {
  return {
    name: "JsonADDomainExtension",
    publisher: "Microsoft.Compute",
    type: "JsonADDomainExtension",
    typeHandlerVersion: "1.3",
    autoUpgradeMinorVersion: true,
    settings: {
      Name: config.domain,
      OUPath: config.ouPath ?? "",
      User: config.user,
      Restart: config.restart ?? true,
      Options: config.options ?? 3,
    },
    protectedSettings: {
      Password: config.password,
    },
  };
}

/**
 * 6. Microsoft.Azure.Diagnostics.IaaSDiagnostics
 * Diagnostic data collection and export
 *
 * @param config - Diagnostics configuration
 * @returns Extension JSON object
 */
export interface DiagnosticsConfig {
  storageAccount: string;
  storageAccountKey: string;
  storageAccountEndpoint?: string;
  xmlConfig?: string;
}

export function diagnosticsExtension(
  config: DiagnosticsConfig,
): WindowsExtension {
  return {
    name: "IaaSDiagnostics",
    publisher: "Microsoft.Azure.Diagnostics",
    type: "IaaSDiagnostics",
    typeHandlerVersion: "1.5",
    autoUpgradeMinorVersion: true,
    settings: {
      storageAccount: config.storageAccount,
      xmlCfg: config.xmlConfig,
    },
    protectedSettings: {
      storageAccountName: config.storageAccount,
      storageAccountKey: config.storageAccountKey,
      storageAccountEndPoint:
        config.storageAccountEndpoint ?? "https://core.windows.net",
    },
  };
}

/**
 * 7. Microsoft.HpcCompute.NvidiaGpuDriverWindows
 * NVIDIA GPU driver installation
 *
 * @returns Extension JSON object
 */
export function gpuDriverExtension(): WindowsExtension {
  return {
    name: "NvidiaGpuDriverWindows",
    publisher: "Microsoft.HpcCompute",
    type: "NvidiaGpuDriverWindows",
    typeHandlerVersion: "1.3",
    autoUpgradeMinorVersion: true,
  };
}

/**
 * 8. Microsoft.Azure.RecoveryServices.VMSnapshot
 * Azure Backup integration
 *
 * @param config - Backup configuration
 * @returns Extension JSON object
 */
export interface BackupConfig {
  locale?: string;
  taskId?: string;
  commandToExecute?: string;
  objectStr?: string;
  logsBlobUri?: string;
  statusBlobUri?: string;
}

export function backupExtension(config: BackupConfig = {}): WindowsExtension {
  return {
    name: "VMSnapshot",
    publisher: "Microsoft.Azure.RecoveryServices",
    type: "VMSnapshot",
    typeHandlerVersion: "1.10",
    autoUpgradeMinorVersion: true,
    settings: {
      locale: config.locale ?? "en-US",
      taskId: config.taskId,
      commandToExecute: config.commandToExecute,
      objectStr: config.objectStr,
      logsBlobUri: config.logsBlobUri,
      statusBlobUri: config.statusBlobUri,
    },
  };
}

/**
 * Export all Windows extension functions
 */
export const windowsExtensions = {
  customScriptExtension,
  monitoringAgentExtension,
  antimalwareExtension,
  dscExtension,
  domainJoinExtension,
  diagnosticsExtension,
  gpuDriverExtension,
  backupExtension,
};
