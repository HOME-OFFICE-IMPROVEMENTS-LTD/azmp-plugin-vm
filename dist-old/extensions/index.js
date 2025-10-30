"use strict";
/**
 * VM Extensions Module - Main Index
 *
 * Provides Handlebars helpers for Azure VM Extensions
 * Supports 20 extensions across Windows, Linux, and Cross-Platform
 *
 * @module extensions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = exports.crossplatform = exports.linux = exports.windows = exports.extensionsCatalog = void 0;
exports.createExtensionHelpers = createExtensionHelpers;
const windows = __importStar(require("./windows"));
exports.windows = windows;
const linux = __importStar(require("./linux"));
exports.linux = linux;
const crossplatform = __importStar(require("./crossplatform"));
exports.crossplatform = crossplatform;
const health = __importStar(require("./health"));
exports.health = health;
/**
 * All available extensions catalog
 */
exports.extensionsCatalog = [
    // Windows Extensions (8)
    {
        name: "customScriptExtension",
        displayName: "Custom Script Extension",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Compute",
        type: "CustomScriptExtension",
        version: "1.10",
        description: "Execute PowerShell scripts for configuration and deployment",
        priority: "Must-Have",
    },
    {
        name: "monitoringAgentExtension",
        displayName: "Microsoft Monitoring Agent",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.EnterpriseCloud.Monitoring",
        type: "MicrosoftMonitoringAgent",
        version: "1.0",
        description: "Azure Monitor and Log Analytics integration",
        priority: "Must-Have",
    },
    {
        name: "antimalwareExtension",
        displayName: "IaaS Antimalware",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Azure.Security",
        type: "IaaSAntimalware",
        version: "1.3",
        description: "Windows Defender Antimalware protection",
        priority: "Must-Have",
    },
    {
        name: "dscExtension",
        displayName: "PowerShell DSC",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Powershell",
        type: "DSC",
        version: "2.77",
        description: "Desired State Configuration management",
        priority: "Should-Have",
    },
    {
        name: "domainJoinExtension",
        displayName: "AD Domain Join",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Compute",
        type: "JsonADDomainExtension",
        version: "1.3",
        description: "Active Directory domain join capability",
        priority: "Should-Have",
    },
    {
        name: "diagnosticsExtension",
        displayName: "Diagnostics Extension",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Azure.Diagnostics",
        type: "IaaSDiagnostics",
        version: "1.5",
        description: "Diagnostic data collection and export",
        priority: "Nice-to-Have",
    },
    {
        name: "gpuDriverExtension",
        displayName: "NVIDIA GPU Driver",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.HpcCompute",
        type: "NvidiaGpuDriverWindows",
        version: "1.3",
        description: "NVIDIA GPU driver installation",
        priority: "Nice-to-Have",
    },
    {
        name: "backupExtension",
        displayName: "VM Snapshot",
        category: "windows",
        platform: "Windows",
        publisher: "Microsoft.Azure.RecoveryServices",
        type: "VMSnapshot",
        version: "1.10",
        description: "Azure Backup integration",
        priority: "Should-Have",
    },
    // Linux Extensions (7)
    {
        name: "customScriptExtension",
        displayName: "Custom Script Extension",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.Azure.Extensions",
        type: "CustomScript",
        version: "2.1",
        description: "Execute bash scripts for configuration and deployment",
        priority: "Must-Have",
    },
    {
        name: "omsAgentExtension",
        displayName: "OMS Agent for Linux",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.EnterpriseCloud.Monitoring",
        type: "OmsAgentForLinux",
        version: "1.14",
        description: "Azure Monitor and Log Analytics for Linux",
        priority: "Must-Have",
    },
    {
        name: "securityAgentExtension",
        displayName: "Azure Security Agent",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.Azure.Security.Monitoring",
        type: "AzureSecurityLinuxAgent",
        version: "2.14",
        description: "Security baseline monitoring and compliance",
        priority: "Must-Have",
    },
    {
        name: "vmAccessExtension",
        displayName: "VM Access Extension",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.OSTCExtensions",
        type: "VMAccessForLinux",
        version: "1.5",
        description: "SSH key management and user administration",
        priority: "Should-Have",
    },
    {
        name: "dependencyAgentExtension",
        displayName: "Dependency Agent",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.Azure.Monitoring.DependencyAgent",
        type: "DependencyAgentLinux",
        version: "9.10",
        description: "Application dependency mapping",
        priority: "Nice-to-Have",
    },
    {
        name: "gpuDriverExtension",
        displayName: "NVIDIA GPU Driver",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.HpcCompute",
        type: "NvidiaGpuDriverLinux",
        version: "1.6",
        description: "NVIDIA GPU driver for Linux",
        priority: "Nice-to-Have",
    },
    {
        name: "runCommandExtension",
        displayName: "Run Command",
        category: "linux",
        platform: "Linux",
        publisher: "Microsoft.CPlat.Core",
        type: "RunCommandLinux",
        version: "1.0",
        description: "Remote command execution",
        priority: "Nice-to-Have",
    },
    // Cross-Platform Extensions (5)
    {
        name: "azureMonitorAgentExtension",
        displayName: "Azure Monitor Agent",
        category: "crossplatform",
        platform: "Both",
        publisher: "Microsoft.Azure.Monitor",
        type: "AzureMonitorAgent",
        version: "1.22",
        description: "Unified monitoring agent for Windows and Linux",
        priority: "Must-Have",
    },
    {
        name: "azureSecurityAgentExtension",
        displayName: "Azure Security Agent",
        category: "crossplatform",
        platform: "Both",
        publisher: "Microsoft.Azure.Security.Monitoring",
        type: "AzureSecurityAgent",
        version: "2.14",
        description: "Security Center integration for both platforms",
        priority: "Must-Have",
    },
    {
        name: "dependencyAgentExtension",
        displayName: "Dependency Agent",
        category: "crossplatform",
        platform: "Both",
        publisher: "Microsoft.Azure.Monitoring.DependencyAgent",
        type: "DependencyAgent",
        version: "9.10",
        description: "Application performance monitoring",
        priority: "Should-Have",
    },
    {
        name: "aadSSHLoginExtension",
        displayName: "AAD SSH Login",
        category: "crossplatform",
        platform: "Linux",
        publisher: "Microsoft.Azure.ActiveDirectory",
        type: "AADSSHLoginForLinux",
        version: "1.0",
        description: "Azure AD authentication for SSH",
        priority: "Should-Have",
    },
    {
        name: "keyVaultExtension",
        displayName: "Key Vault Extension",
        category: "crossplatform",
        platform: "Both",
        publisher: "Microsoft.Azure.KeyVault",
        type: "KeyVault",
        version: "2.0/3.0",
        description: "Certificate and secret management",
        priority: "Should-Have",
    },
];
/**
 * Create Handlebars helpers for VM extensions
 * All helpers use the 'ext:' namespace
 */
function createExtensionHelpers() {
    const helpers = {};
    // Windows Extension Helpers (8 helpers)
    helpers["ext:windows.customScript"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.customScriptExtension(config), null, 2);
    };
    helpers["ext:windows.monitoringAgent"] = function (workspaceId, workspaceKey) {
        return JSON.stringify(windows.monitoringAgentExtension(workspaceId, workspaceKey), null, 2);
    };
    helpers["ext:windows.antimalware"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.antimalwareExtension(config), null, 2);
    };
    helpers["ext:windows.dsc"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.dscExtension(config), null, 2);
    };
    helpers["ext:windows.domainJoin"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.domainJoinExtension(config), null, 2);
    };
    helpers["ext:windows.diagnostics"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.diagnosticsExtension(config), null, 2);
    };
    helpers["ext:windows.gpuDriver"] = function () {
        return JSON.stringify(windows.gpuDriverExtension(), null, 2);
    };
    helpers["ext:windows.backup"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(windows.backupExtension(config), null, 2);
    };
    // Linux Extension Helpers (7 helpers)
    helpers["ext:linux.customScript"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(linux.customScriptExtension(config), null, 2);
    };
    helpers["ext:linux.omsAgent"] = function (workspaceId, workspaceKey) {
        return JSON.stringify(linux.omsAgentExtension(workspaceId, workspaceKey), null, 2);
    };
    helpers["ext:linux.securityAgent"] = function () {
        return JSON.stringify(linux.securityAgentExtension(), null, 2);
    };
    helpers["ext:linux.vmAccess"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(linux.vmAccessExtension(config), null, 2);
    };
    helpers["ext:linux.dependencyAgent"] = function () {
        return JSON.stringify(linux.dependencyAgentExtension(), null, 2);
    };
    helpers["ext:linux.gpuDriver"] = function () {
        return JSON.stringify(linux.gpuDriverExtension(), null, 2);
    };
    helpers["ext:linux.runCommand"] = function (options) {
        const config = options.hash || {};
        return JSON.stringify(linux.runCommandExtension(config), null, 2);
    };
    // Cross-Platform Extension Helpers (5 helpers)
    helpers["ext:azureMonitorAgent"] = function (platform, options) {
        const config = options.hash || {};
        return JSON.stringify(crossplatform.azureMonitorAgentExtension(platform, config), null, 2);
    };
    helpers["ext:azureSecurityAgent"] = function (platform) {
        return JSON.stringify(crossplatform.azureSecurityAgentExtension(platform), null, 2);
    };
    helpers["ext:dependencyAgent"] = function (platform, options) {
        const config = options.hash || {};
        return JSON.stringify(crossplatform.dependencyAgentExtension(platform, config), null, 2);
    };
    helpers["ext:aadSSHLogin"] = function () {
        return JSON.stringify(crossplatform.aadSSHLoginExtension(), null, 2);
    };
    helpers["ext:keyVault"] = function (platform, options) {
        const config = options.hash || {};
        return JSON.stringify(crossplatform.keyVaultExtension(platform, config), null, 2);
    };
    // Utility Helpers
    helpers["ext:list"] = function (category) {
        if (category) {
            return exports.extensionsCatalog.filter((ext) => ext.category === category);
        }
        return exports.extensionsCatalog;
    };
    helpers["ext:listWindows"] = function () {
        return exports.extensionsCatalog.filter((ext) => ext.category === "windows");
    };
    helpers["ext:listLinux"] = function () {
        return exports.extensionsCatalog.filter((ext) => ext.category === "linux");
    };
    helpers["ext:listCrossPlatform"] = function () {
        return exports.extensionsCatalog.filter((ext) => ext.category === "crossplatform");
    };
    helpers["ext:get"] = function (name, category) {
        return exports.extensionsCatalog.find((ext) => ext.name === name && ext.category === category);
    };
    helpers["ext:count"] = function () {
        return exports.extensionsCatalog.length;
    };
    return helpers;
}
