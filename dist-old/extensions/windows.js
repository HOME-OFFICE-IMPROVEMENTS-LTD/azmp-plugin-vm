"use strict";
/**
 * Windows VM Extensions Module
 *
 * Provides Handlebars helpers for Windows-specific VM extensions
 * Supporting 8 essential Windows extensions for Azure VMs
 *
 * @module extensions/windows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowsExtensions = void 0;
exports.customScriptExtension = customScriptExtension;
exports.monitoringAgentExtension = monitoringAgentExtension;
exports.antimalwareExtension = antimalwareExtension;
exports.dscExtension = dscExtension;
exports.domainJoinExtension = domainJoinExtension;
exports.diagnosticsExtension = diagnosticsExtension;
exports.gpuDriverExtension = gpuDriverExtension;
exports.backupExtension = backupExtension;
/**
 * 1. Microsoft.Compute.CustomScriptExtension
 * Execute PowerShell scripts for VM configuration and deployment
 *
 * @param config - Script configuration
 * @returns Extension JSON object
 */
function customScriptExtension(config) {
    const settings = {};
    const protectedSettings = {};
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
        protectedSettings: Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
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
function monitoringAgentExtension(workspaceId, workspaceKey) {
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
function antimalwareExtension(config = {}) {
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
function dscExtension(config) {
    const settings = {
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
function domainJoinExtension(config) {
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
function diagnosticsExtension(config) {
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
            storageAccountEndPoint: config.storageAccountEndpoint ?? "https://core.windows.net",
        },
    };
}
/**
 * 7. Microsoft.HpcCompute.NvidiaGpuDriverWindows
 * NVIDIA GPU driver installation
 *
 * @returns Extension JSON object
 */
function gpuDriverExtension() {
    return {
        name: "NvidiaGpuDriverWindows",
        publisher: "Microsoft.HpcCompute",
        type: "NvidiaGpuDriverWindows",
        typeHandlerVersion: "1.3",
        autoUpgradeMinorVersion: true,
    };
}
function backupExtension(config = {}) {
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
exports.windowsExtensions = {
    customScriptExtension,
    monitoringAgentExtension,
    antimalwareExtension,
    dscExtension,
    domainJoinExtension,
    diagnosticsExtension,
    gpuDriverExtension,
    backupExtension,
};
