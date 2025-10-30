"use strict";
/**
 * Linux VM Extensions Module
 *
 * Provides Handlebars helpers for Linux-specific VM extensions
 * Supporting 7 essential Linux extensions for Azure VMs
 *
 * @module extensions/linux
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.linuxExtensions = void 0;
exports.customScriptExtension = customScriptExtension;
exports.omsAgentExtension = omsAgentExtension;
exports.securityAgentExtension = securityAgentExtension;
exports.vmAccessExtension = vmAccessExtension;
exports.dependencyAgentExtension = dependencyAgentExtension;
exports.gpuDriverExtension = gpuDriverExtension;
exports.runCommandExtension = runCommandExtension;
function customScriptExtension(config) {
    const settings = {};
    const protectedSettings = {};
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
        protectedSettings: Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
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
function omsAgentExtension(workspaceId, workspaceKey) {
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
function securityAgentExtension() {
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
function vmAccessExtension(config) {
    const protectedSettings = {};
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
function dependencyAgentExtension() {
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
function gpuDriverExtension() {
    return {
        name: "NvidiaGpuDriverLinux",
        publisher: "Microsoft.HpcCompute",
        type: "NvidiaGpuDriverLinux",
        typeHandlerVersion: "1.6",
        autoUpgradeMinorVersion: true,
    };
}
function runCommandExtension(config) {
    const protectedSettings = {};
    if (config.commandToExecute) {
        protectedSettings.commandToExecute = config.commandToExecute;
    }
    else if (config.script) {
        protectedSettings.script = config.script;
    }
    if (config.parameters) {
        protectedSettings.parameters = config.parameters;
    }
    const settings = {};
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
        protectedSettings: Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
    };
}
/**
 * Export all Linux extension functions
 */
exports.linuxExtensions = {
    customScriptExtension,
    omsAgentExtension,
    securityAgentExtension,
    vmAccessExtension,
    dependencyAgentExtension,
    gpuDriverExtension,
    runCommandExtension,
};
