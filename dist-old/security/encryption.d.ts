/**
 * Security Encryption Module
 *
 * Provides helpers for Azure VM disk encryption
 * Supports 3 encryption types: ADE, SSE, and Encryption at Host
 *
 * @module security/encryption
 */
/**
 * Encryption type
 */
export type EncryptionType = "AzureDiskEncryption" | "ServerSideEncryption" | "EncryptionAtHost";
/**
 * Key encryption key type
 */
export type KeyEncryptionKeyType = "PlatformManaged" | "CustomerManaged";
/**
 * Disk encryption set configuration
 */
export interface DiskEncryptionSetConfig {
    id: string;
    keyUrl?: string;
    keyVaultId?: string;
}
/**
 * 1. Azure Disk Encryption (ADE)
 * Full disk encryption using BitLocker (Windows) or dm-crypt (Linux)
 *
 * @param platform - Target platform
 * @param config - Encryption configuration
 * @returns Encryption configuration object
 */
export interface ADEConfig {
    keyVaultResourceId: string;
    keyVaultUrl: string;
    keyEncryptionKeyUrl?: string;
    volumeType?: "OS" | "Data" | "All";
    encryptionOperation?: "EnableEncryption" | "EnableEncryptionFormatAll";
    passphrase?: string;
    sequenceVersion?: string;
}
export declare function azureDiskEncryption(platform: "Windows" | "Linux", config: ADEConfig): {
    type: string;
    extensionType: string;
    publisher: string;
    version: string;
    settings: Record<string, any>;
    protectedSettings: Record<string, any> | undefined;
    platform: "Windows" | "Linux";
};
/**
 * 2. Server-Side Encryption (SSE)
 * Platform-managed or customer-managed key encryption
 *
 * @param diskEncryptionSet - Disk encryption set configuration
 * @returns SSE configuration object
 */
export interface SSEConfig {
    diskEncryptionSet?: DiskEncryptionSetConfig;
    encryptionType?: "EncryptionAtRestWithPlatformKey" | "EncryptionAtRestWithCustomerKey" | "EncryptionAtRestWithPlatformAndCustomerKeys";
}
export declare function serverSideEncryption(config?: SSEConfig): {
    type: string;
    encryptionType: "EncryptionAtRestWithPlatformKey" | "EncryptionAtRestWithCustomerKey" | "EncryptionAtRestWithPlatformAndCustomerKeys";
    diskEncryptionSet: {
        id: string;
    } | undefined;
    managed: boolean;
};
/**
 * 3. Encryption at Host
 * VM host-level encryption for both OS and data disks
 *
 * @returns Encryption at host configuration
 */
export declare function encryptionAtHost(): {
    type: string;
    securityProfile: {
        encryptionAtHost: boolean;
    };
    description: string;
};
/**
 * Create customer-managed encryption key configuration
 *
 * @param keyVaultId - Key Vault resource ID
 * @param keyUrl - Key URL in Key Vault
 * @returns Customer-managed key configuration
 */
export declare function customerManagedKey(keyVaultId: string, keyUrl: string): DiskEncryptionSetConfig;
/**
 * Create platform-managed encryption configuration
 *
 * @returns Platform-managed encryption configuration
 */
export declare function platformManagedEncryption(): {
    type: string;
    encryptionType: "EncryptionAtRestWithPlatformKey" | "EncryptionAtRestWithCustomerKey" | "EncryptionAtRestWithPlatformAndCustomerKeys";
    diskEncryptionSet: {
        id: string;
    } | undefined;
    managed: boolean;
};
/**
 * Create double encryption configuration (platform + customer keys)
 *
 * @param diskEncryptionSet - Disk encryption set
 * @returns Double encryption configuration
 */
export declare function doubleEncryption(diskEncryptionSet: DiskEncryptionSetConfig): {
    type: string;
    encryptionType: "EncryptionAtRestWithPlatformKey" | "EncryptionAtRestWithCustomerKey" | "EncryptionAtRestWithPlatformAndCustomerKeys";
    diskEncryptionSet: {
        id: string;
    } | undefined;
    managed: boolean;
};
/**
 * Get encryption recommendations based on compliance requirements
 *
 * @param compliance - Compliance framework
 * @returns Recommended encryption configuration
 */
export declare function getEncryptionRecommendations(compliance: "SOC2" | "HIPAA" | "ISO27001" | "FedRAMP" | "PCI-DSS" | "GDPR"): any;
/**
 * Validate encryption configuration
 *
 * @param config - Encryption configuration
 * @returns Validation result with errors if any
 */
export declare function validateEncryptionConfig(config: any): {
    valid: boolean;
    errors: string[];
};
/**
 * Export all encryption functions
 */
export declare const encryption: {
    azureDiskEncryption: typeof azureDiskEncryption;
    serverSideEncryption: typeof serverSideEncryption;
    encryptionAtHost: typeof encryptionAtHost;
    customerManagedKey: typeof customerManagedKey;
    platformManagedEncryption: typeof platformManagedEncryption;
    doubleEncryption: typeof doubleEncryption;
    getEncryptionRecommendations: typeof getEncryptionRecommendations;
    validateEncryptionConfig: typeof validateEncryptionConfig;
};
