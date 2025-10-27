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
export type EncryptionType =
  | "AzureDiskEncryption"
  | "ServerSideEncryption"
  | "EncryptionAtHost";

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
  passphrase?: string; // Linux only
  sequenceVersion?: string;
}

export function azureDiskEncryption(
  platform: "Windows" | "Linux",
  config: ADEConfig,
) {
  const extensionType =
    platform === "Windows"
      ? "AzureDiskEncryption"
      : "AzureDiskEncryptionForLinux";
  const publisher =
    platform === "Windows"
      ? "Microsoft.Azure.Security"
      : "Microsoft.Azure.Security";
  const version = platform === "Windows" ? "2.2" : "1.1";

  const settings: Record<string, any> = {
    EncryptionOperation: config.encryptionOperation || "EnableEncryption",
    KeyVaultURL: config.keyVaultUrl,
    KeyVaultResourceId: config.keyVaultResourceId,
    VolumeType: config.volumeType || "All",
    SequenceVersion: config.sequenceVersion || "1.0",
  };

  if (config.keyEncryptionKeyUrl) {
    settings.KeyEncryptionKeyURL = config.keyEncryptionKeyUrl;
    settings.KekVaultResourceId = config.keyVaultResourceId;
  }

  const protectedSettings: Record<string, any> = {};

  if (platform === "Linux" && config.passphrase) {
    protectedSettings.Passphrase = config.passphrase;
  }

  return {
    type: "extension",
    extensionType,
    publisher,
    version,
    settings,
    protectedSettings:
      Object.keys(protectedSettings).length > 0 ? protectedSettings : undefined,
    platform,
  };
}

/**
 * 2. Server-Side Encryption (SSE)
 * Platform-managed or customer-managed key encryption
 *
 * @param diskEncryptionSet - Disk encryption set configuration
 * @returns SSE configuration object
 */
export interface SSEConfig {
  diskEncryptionSet?: DiskEncryptionSetConfig;
  encryptionType?:
    | "EncryptionAtRestWithPlatformKey"
    | "EncryptionAtRestWithCustomerKey"
    | "EncryptionAtRestWithPlatformAndCustomerKeys";
}

export function serverSideEncryption(config: SSEConfig = {}) {
  return {
    type: "diskEncryption",
    encryptionType: config.encryptionType || "EncryptionAtRestWithPlatformKey",
    diskEncryptionSet: config.diskEncryptionSet
      ? {
          id: config.diskEncryptionSet.id,
        }
      : undefined,
    managed: !config.diskEncryptionSet,
  };
}

/**
 * 3. Encryption at Host
 * VM host-level encryption for both OS and data disks
 *
 * @returns Encryption at host configuration
 */
export function encryptionAtHost() {
  return {
    type: "hostEncryption",
    securityProfile: {
      encryptionAtHost: true,
    },
    description: "Enables encryption at the VM host level for all disk types",
  };
}

/**
 * Create customer-managed encryption key configuration
 *
 * @param keyVaultId - Key Vault resource ID
 * @param keyUrl - Key URL in Key Vault
 * @returns Customer-managed key configuration
 */
export function customerManagedKey(
  keyVaultId: string,
  keyUrl: string,
): DiskEncryptionSetConfig {
  return {
    id: `${keyVaultId}/diskEncryptionSets/des-${Date.now()}`,
    keyUrl,
    keyVaultId,
  };
}

/**
 * Create platform-managed encryption configuration
 *
 * @returns Platform-managed encryption configuration
 */
export function platformManagedEncryption() {
  return serverSideEncryption({
    encryptionType: "EncryptionAtRestWithPlatformKey",
  });
}

/**
 * Create double encryption configuration (platform + customer keys)
 *
 * @param diskEncryptionSet - Disk encryption set
 * @returns Double encryption configuration
 */
export function doubleEncryption(diskEncryptionSet: DiskEncryptionSetConfig) {
  return serverSideEncryption({
    encryptionType: "EncryptionAtRestWithPlatformAndCustomerKeys",
    diskEncryptionSet,
  });
}

/**
 * Get encryption recommendations based on compliance requirements
 *
 * @param compliance - Compliance framework
 * @returns Recommended encryption configuration
 */
export function getEncryptionRecommendations(
  compliance: "SOC2" | "HIPAA" | "ISO27001" | "FedRAMP" | "PCI-DSS" | "GDPR",
) {
  const recommendations: Record<string, any> = {
    SOC2: {
      primary: "ServerSideEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: ["encryptionAtHost"],
    },
    HIPAA: {
      primary: "AzureDiskEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: ["encryptionAtHost", "doubleEncryption"],
    },
    ISO27001: {
      primary: "ServerSideEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: ["encryptionAtHost"],
    },
    FedRAMP: {
      primary: "AzureDiskEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: [
        "encryptionAtHost",
        "doubleEncryption",
        "keyRotation",
      ],
    },
    "PCI-DSS": {
      primary: "AzureDiskEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: ["encryptionAtHost", "accessControls"],
    },
    GDPR: {
      primary: "ServerSideEncryption",
      keyManagement: "CustomerManaged",
      additionalFeatures: ["encryptionAtHost", "dataResidency"],
    },
  };

  return recommendations[compliance];
}

/**
 * Validate encryption configuration
 *
 * @param config - Encryption configuration
 * @returns Validation result with errors if any
 */
export function validateEncryptionConfig(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.type === "extension") {
    if (!config.settings?.KeyVaultURL) {
      errors.push("KeyVaultURL is required for Azure Disk Encryption");
    }
    if (!config.settings?.KeyVaultResourceId) {
      errors.push("KeyVaultResourceId is required for Azure Disk Encryption");
    }
  }

  if (
    config.type === "diskEncryption" &&
    config.encryptionType?.includes("CustomerKey")
  ) {
    if (!config.diskEncryptionSet) {
      errors.push("Disk encryption set is required for customer-managed keys");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export all encryption functions
 */
export const encryption = {
  azureDiskEncryption,
  serverSideEncryption,
  encryptionAtHost,
  customerManagedKey,
  platformManagedEncryption,
  doubleEncryption,
  getEncryptionRecommendations,
  validateEncryptionConfig,
};
