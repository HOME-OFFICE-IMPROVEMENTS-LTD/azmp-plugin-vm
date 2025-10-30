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
export declare function customScriptExtension(config: CustomScriptConfig): LinuxExtension;
/**
 * 2. Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux
 * Azure Monitor and Log Analytics integration for Linux
 *
 * @param workspaceId - Log Analytics workspace ID
 * @param workspaceKey - Log Analytics workspace key
 * @returns Extension JSON object
 */
export declare function omsAgentExtension(workspaceId: string, workspaceKey: string): LinuxExtension;
/**
 * 3. Microsoft.Azure.Security.Monitoring.AzureSecurityLinuxAgent
 * Security baseline monitoring and compliance
 *
 * @returns Extension JSON object
 */
export declare function securityAgentExtension(): LinuxExtension;
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
export declare function vmAccessExtension(config: VMAccessConfig): LinuxExtension;
/**
 * 5. Microsoft.Azure.Monitor.DependencyAgent.DependencyAgentLinux
 * Application dependency mapping
 *
 * @returns Extension JSON object
 */
export declare function dependencyAgentExtension(): LinuxExtension;
/**
 * 6. Microsoft.HpcCompute.NvidiaGpuDriverLinux
 * NVIDIA GPU driver installation for Linux
 *
 * @returns Extension JSON object
 */
export declare function gpuDriverExtension(): LinuxExtension;
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
    parameters?: Array<{
        name: string;
        value: string;
    }>;
    timeoutInSeconds?: number;
    asyncExecution?: boolean;
}
export declare function runCommandExtension(config: RunCommandConfig): LinuxExtension;
/**
 * Export all Linux extension functions
 */
export declare const linuxExtensions: {
    customScriptExtension: typeof customScriptExtension;
    omsAgentExtension: typeof omsAgentExtension;
    securityAgentExtension: typeof securityAgentExtension;
    vmAccessExtension: typeof vmAccessExtension;
    dependencyAgentExtension: typeof dependencyAgentExtension;
    gpuDriverExtension: typeof gpuDriverExtension;
    runCommandExtension: typeof runCommandExtension;
};
