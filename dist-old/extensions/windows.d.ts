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
export declare function customScriptExtension(config: CustomScriptExtensionConfig): WindowsExtension;
/**
 * 2. Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent
 * Azure Monitor and Log Analytics integration
 *
 * @param workspaceId - Log Analytics workspace ID
 * @param workspaceKey - Log Analytics workspace key
 * @returns Extension JSON object
 */
export declare function monitoringAgentExtension(workspaceId: string, workspaceKey: string): WindowsExtension;
/**
 * 3. Microsoft.Azure.Security.IaaSAntimalware
 * Windows Defender Antimalware configuration
 *
 * @param config - Antimalware configuration
 * @returns Extension JSON object
 */
export interface AntimalwareConfig {
    realtimeProtection?: boolean;
    scheduledScanDay?: number;
    scheduledScanTime?: number;
    scheduledScanType?: "Quick" | "Full";
    exclusions?: {
        paths?: string[];
        extensions?: string[];
        processes?: string[];
    };
}
export declare function antimalwareExtension(config?: AntimalwareConfig): WindowsExtension;
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
export declare function dscExtension(config: DSCConfig): WindowsExtension;
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
    options?: number;
}
export declare function domainJoinExtension(config: DomainJoinConfig): WindowsExtension;
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
export declare function diagnosticsExtension(config: DiagnosticsConfig): WindowsExtension;
/**
 * 7. Microsoft.HpcCompute.NvidiaGpuDriverWindows
 * NVIDIA GPU driver installation
 *
 * @returns Extension JSON object
 */
export declare function gpuDriverExtension(): WindowsExtension;
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
export declare function backupExtension(config?: BackupConfig): WindowsExtension;
/**
 * Export all Windows extension functions
 */
export declare const windowsExtensions: {
    customScriptExtension: typeof customScriptExtension;
    monitoringAgentExtension: typeof monitoringAgentExtension;
    antimalwareExtension: typeof antimalwareExtension;
    dscExtension: typeof dscExtension;
    domainJoinExtension: typeof domainJoinExtension;
    diagnosticsExtension: typeof diagnosticsExtension;
    gpuDriverExtension: typeof gpuDriverExtension;
    backupExtension: typeof backupExtension;
};
