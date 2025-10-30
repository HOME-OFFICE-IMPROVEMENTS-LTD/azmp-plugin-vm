/**
 * Azure VM Diagnostics Module
 *
 * Provides diagnostics configuration for Azure Marketplace VM offers.
 * Implements P0-2: Diagnostics Extension Auto-Enable for certification.
 *
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-2)
 */
export interface DiagnosticsConfiguration {
    enabled: boolean;
    osType: 'Windows' | 'Linux';
    vmName: string;
    location: string;
    storageAccountName?: string;
    storageAccountResourceGroup?: string;
    enableBootDiagnostics?: boolean;
    enableGuestDiagnostics?: boolean;
    retentionDays?: number;
}
export interface DiagnosticsStorageConfig {
    storageAccountName: string;
    storageAccountType: 'Standard_LRS' | 'Standard_GRS' | 'Standard_RAGRS';
    location: string;
    createNew: boolean;
    existingResourceGroup?: string;
}
export interface WindowsDiagnosticsConfig {
    wadCfgXml: string;
    storageAccountName: string;
    storageAccountKey: string;
    metricsEnabled: boolean;
    logsEnabled: boolean;
    performanceCounters: string[];
    windowsEventLog: string[];
}
export interface LinuxDiagnosticsConfig {
    ladCfg: Record<string, any>;
    storageAccountName: string;
    storageAccountSasToken: string;
    metricsEnabled: boolean;
    syslogEnabled: boolean;
    fileLogs: string[];
}
export interface DiagnosticsExtensionResource {
    type: string;
    apiVersion: string;
    name: string;
    location: string;
    dependsOn: string[];
    properties: {
        publisher: string;
        type: string;
        typeHandlerVersion: string;
        autoUpgradeMinorVersion: boolean;
        settings: Record<string, any>;
        protectedSettings: Record<string, any>;
    };
}
export declare const DIAGNOSTICS_DEFAULTS: {
    RETENTION_DAYS: number;
    STORAGE_ACCOUNT_TYPE: "Standard_LRS";
    WINDOWS_EXTENSION_VERSION: string;
    LINUX_EXTENSION_VERSION: string;
    BOOT_DIAGNOSTICS_ENABLED: boolean;
    GUEST_DIAGNOSTICS_ENABLED: boolean;
};
export declare const WINDOWS_PERFORMANCE_COUNTERS: string[];
export declare const WINDOWS_EVENT_LOGS: string[];
export declare const LINUX_SYSLOG_FACILITIES: string[];
export declare const LINUX_FILE_LOGS: string[];
export declare class DiagnosticsManager {
    private config;
    constructor(config: DiagnosticsConfiguration);
    /**
     * Generate diagnostics storage account name (must be globally unique)
     */
    private generateStorageAccountName;
    /**
     * Get storage account configuration
     */
    getStorageConfig(): DiagnosticsStorageConfig;
    /**
     * Generate Windows diagnostics extension resource
     */
    getWindowsExtension(): DiagnosticsExtensionResource;
    /**
     * Generate Linux diagnostics extension resource
     */
    getLinuxExtension(): DiagnosticsExtensionResource;
    /**
     * Get diagnostics extension based on OS type
     */
    getExtension(): DiagnosticsExtensionResource;
    /**
     * Generate Windows WAD configuration XML
     */
    private generateWindowsWadCfgXml;
    /**
     * Generate Linux LAD configuration
     */
    private generateLinuxLadCfg;
    /**
     * Generate ARM template variables for diagnostics
     */
    getTemplateVariables(): Record<string, any>;
    /**
     * Generate ARM template parameters for diagnostics
     */
    getTemplateParameters(): Record<string, any>;
    /**
     * Generate storage account ARM resource
     */
    getStorageAccountResource(): Record<string, any>;
    /**
     * Get boot diagnostics configuration for VM resource
     */
    getBootDiagnosticsConfig(): Record<string, any>;
    /**
     * Validate diagnostics configuration
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Create diagnostics configuration for Windows VM
 */
export declare function createWindowsDiagnostics(vmName: string, location: string, options?: Partial<DiagnosticsConfiguration>): DiagnosticsManager;
/**
 * Create diagnostics configuration for Linux VM
 */
export declare function createLinuxDiagnostics(vmName: string, location: string, options?: Partial<DiagnosticsConfiguration>): DiagnosticsManager;
/**
 * Check if diagnostics are marketplace-compliant
 */
export declare function isMarketplaceCompliant(config: DiagnosticsConfiguration): boolean;
/**
 * Generate diagnostics ARM template snippet
 */
export declare function generateDiagnosticsTemplate(config: DiagnosticsConfiguration): {
    parameters: Record<string, any>;
    variables: Record<string, any>;
    resources: any[];
};
