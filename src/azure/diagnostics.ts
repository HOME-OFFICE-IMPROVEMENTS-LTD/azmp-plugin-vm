/**
 * Azure VM Diagnostics Module
 * 
 * Provides diagnostics configuration for Azure Marketplace VM offers.
 * Implements P0-2: Diagnostics Extension Auto-Enable for certification.
 * 
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-2)
 */

import * as crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

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

// ============================================================================
// Constants
// ============================================================================

export const DIAGNOSTICS_DEFAULTS = {
  RETENTION_DAYS: 7,
  STORAGE_ACCOUNT_TYPE: 'Standard_LRS' as const,
  WINDOWS_EXTENSION_VERSION: '1.11',
  LINUX_EXTENSION_VERSION: '4.0',
  BOOT_DIAGNOSTICS_ENABLED: true,
  GUEST_DIAGNOSTICS_ENABLED: true,
};

export const WINDOWS_PERFORMANCE_COUNTERS = [
  '\\Processor(_Total)\\% Processor Time',
  '\\Memory\\Available MBytes',
  '\\Memory\\% Committed Bytes In Use',
  '\\PhysicalDisk(_Total)\\% Disk Time',
  '\\PhysicalDisk(_Total)\\Disk Transfers/sec',
  '\\PhysicalDisk(_Total)\\Disk Reads/sec',
  '\\PhysicalDisk(_Total)\\Disk Writes/sec',
  '\\Network Interface(*)\\Bytes Total/sec',
  '\\Process(_Total)\\Handle Count',
  '\\Process(_Total)\\Thread Count',
];

export const WINDOWS_EVENT_LOGS = [
  'System!*[System[(Level=1 or Level=2 or Level=3)]]',
  'Application!*[System[(Level=1 or Level=2 or Level=3)]]',
];

export const LINUX_SYSLOG_FACILITIES = [
  'kern.*',
  'daemon.*',
  'user.*',
  'auth.*',
  'authpriv.*',
];

export const LINUX_FILE_LOGS = [
  '/var/log/syslog',
  '/var/log/messages',
  '/var/log/auth.log',
];

// ============================================================================
// Diagnostics Manager Class
// ============================================================================

export class DiagnosticsManager {
  private config: DiagnosticsConfiguration;

  constructor(config: DiagnosticsConfiguration) {
    this.config = {
      enableBootDiagnostics: DIAGNOSTICS_DEFAULTS.BOOT_DIAGNOSTICS_ENABLED,
      enableGuestDiagnostics: DIAGNOSTICS_DEFAULTS.GUEST_DIAGNOSTICS_ENABLED,
      retentionDays: DIAGNOSTICS_DEFAULTS.RETENTION_DAYS,
      ...config,
    };

    // Auto-generate storage account name if not provided
    if (!this.config.storageAccountName) {
      this.config.storageAccountName = this.generateStorageAccountName(
        this.config.vmName
      );
    }
  }

  /**
   * Generate diagnostics storage account name (must be globally unique)
   */
  private generateStorageAccountName(vmName: string): string {
    // Storage account names: 3-24 chars, lowercase letters and numbers only
    const sanitized = vmName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = crypto.createHash('md5').update(vmName).digest('hex').substring(0, 8);
    const name = `diag${sanitized.substring(0, 10)}${hash}`;
    return name.substring(0, 24); // Ensure max length
  }

  /**
   * Get storage account configuration
   */
  getStorageConfig(): DiagnosticsStorageConfig {
    return {
      storageAccountName: this.config.storageAccountName!,
      storageAccountType: DIAGNOSTICS_DEFAULTS.STORAGE_ACCOUNT_TYPE,
      location: this.config.location,
      createNew: !this.config.storageAccountResourceGroup,
      existingResourceGroup: this.config.storageAccountResourceGroup,
    };
  }

  /**
   * Generate Windows diagnostics extension resource
   */
  getWindowsExtension(): DiagnosticsExtensionResource {
    const wadCfgXml = this.generateWindowsWadCfgXml();

    return {
      type: 'Microsoft.Compute/virtualMachines/extensions',
      apiVersion: '2023-03-01',
      name: `[concat(parameters('vmName'), '/IaaSDiagnostics')]`,
      location: `[parameters('location')]`,
      dependsOn: [
        `[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`,
        `[resourceId('Microsoft.Storage/storageAccounts', variables('diagnosticsStorageAccountName'))]`,
      ],
      properties: {
        publisher: 'Microsoft.Azure.Diagnostics',
        type: 'IaaSDiagnostics',
        typeHandlerVersion: DIAGNOSTICS_DEFAULTS.WINDOWS_EXTENSION_VERSION,
        autoUpgradeMinorVersion: true,
        settings: {
          xmlCfg: `[base64(variables('wadCfgXml'))]`,
          storageAccount: `[variables('diagnosticsStorageAccountName')]`,
        },
        protectedSettings: {
          storageAccountName: `[variables('diagnosticsStorageAccountName')]`,
          storageAccountKey: `[listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('diagnosticsStorageAccountName')), '2021-09-01').keys[0].value]`,
          storageAccountEndPoint: 'https://core.windows.net',
        },
      },
    };
  }

  /**
   * Generate Linux diagnostics extension resource
   */
  getLinuxExtension(): DiagnosticsExtensionResource {
    const ladCfg = this.generateLinuxLadCfg();

    return {
      type: 'Microsoft.Compute/virtualMachines/extensions',
      apiVersion: '2023-03-01',
      name: `[concat(parameters('vmName'), '/LinuxDiagnostic')]`,
      location: `[parameters('location')]`,
      dependsOn: [
        `[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`,
        `[resourceId('Microsoft.Storage/storageAccounts', variables('diagnosticsStorageAccountName'))]`,
      ],
      properties: {
        publisher: 'Microsoft.Azure.Diagnostics',
        type: 'LinuxDiagnostic',
        typeHandlerVersion: DIAGNOSTICS_DEFAULTS.LINUX_EXTENSION_VERSION,
        autoUpgradeMinorVersion: true,
        settings: {
          ladCfg,
          storageAccount: `[variables('diagnosticsStorageAccountName')]`,
        },
        protectedSettings: {
          storageAccountName: `[variables('diagnosticsStorageAccountName')]`,
          storageAccountSasToken: `[listAccountSas(variables('diagnosticsStorageAccountName'), '2021-09-01', variables('accountSasProperties')).accountSasToken]`,
          storageAccountEndPoint: 'https://core.windows.net',
        },
      },
    };
  }

  /**
   * Get diagnostics extension based on OS type
   */
  getExtension(): DiagnosticsExtensionResource {
    if (this.config.osType === 'Windows') {
      return this.getWindowsExtension();
    } else {
      return this.getLinuxExtension();
    }
  }

  /**
   * Generate Windows WAD configuration XML
   */
  private generateWindowsWadCfgXml(): string {
    const counters = WINDOWS_PERFORMANCE_COUNTERS.map(
      (counter) =>
        `<PerformanceCounterConfiguration counterSpecifier="${counter}" sampleRate="PT1M" />`
    ).join('\n          ');

    const eventLogs = WINDOWS_EVENT_LOGS.map((log) => {
      const [source, filter] = log.split('!');
      return `<WindowsEventLog scheduledTransferPeriod="PT1M">\n            <DataSource name="${source}">${filter}</DataSource>\n          </WindowsEventLog>`;
    }).join('\n          ');

    return `<?xml version="1.0" encoding="utf-8"?>
<DiagnosticsConfiguration xmlns="http://schemas.microsoft.com/ServiceHosting/2010/10/DiagnosticsConfiguration">
  <PublicConfig xmlns="http://schemas.microsoft.com/ServiceHosting/2010/10/DiagnosticsConfiguration">
    <WadCfg>
      <DiagnosticMonitorConfiguration overallQuotaInMB="5120">
        <DiagnosticInfrastructureLogs scheduledTransferPeriod="PT1M" scheduledTransferLogLevelFilter="Warning" />
        <PerformanceCounters scheduledTransferPeriod="PT1M">
          ${counters}
        </PerformanceCounters>
        <WindowsEventLogs scheduledTransferPeriod="PT1M">
          ${eventLogs}
        </WindowsEventLogs>
        <Directories scheduledTransferPeriod="PT1M">
          <IISLogs containerName="wad-iis-logfiles" />
          <FailedRequestLogs containerName="wad-failedrequestlogs" />
        </Directories>
        <Logs scheduledTransferPeriod="PT1M" scheduledTransferLogLevelFilter="Information" />
      </DiagnosticMonitorConfiguration>
    </WadCfg>
  </PublicConfig>
</DiagnosticsConfiguration>`;
  }

  /**
   * Generate Linux LAD configuration
   */
  private generateLinuxLadCfg(): Record<string, any> {
    return {
      diagnosticMonitorConfiguration: {
        eventVolume: 'Medium',
        metrics: {
          metricAggregation: [
            {
              scheduledTransferPeriod: 'PT1M',
            },
            {
              scheduledTransferPeriod: 'PT1H',
            },
          ],
          resourceId: `[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]`,
        },
        performanceCounters: {
          performanceCounterConfiguration: [
            {
              annotation: [
                {
                  displayName: 'CPU utilization',
                  locale: 'en-us',
                },
              ],
              class: 'processor',
              condition: 'IsAggregate=TRUE',
              counter: 'PercentIdleTime',
              counterSpecifier: '/builtin/processor/percentidletime',
              type: 'builtin',
              unit: 'Percent',
            },
            {
              annotation: [
                {
                  displayName: 'Memory available',
                  locale: 'en-us',
                },
              ],
              class: 'memory',
              counter: 'AvailableMemory',
              counterSpecifier: '/builtin/memory/availablememory',
              type: 'builtin',
              unit: 'Bytes',
            },
            {
              annotation: [
                {
                  displayName: 'Disk read bytes',
                  locale: 'en-us',
                },
              ],
              class: 'disk',
              condition: 'IsAggregate=TRUE',
              counter: 'ReadBytesPerSecond',
              counterSpecifier: '/builtin/disk/readbytespersecond',
              type: 'builtin',
              unit: 'BytesPerSecond',
            },
            {
              annotation: [
                {
                  displayName: 'Disk write bytes',
                  locale: 'en-us',
                },
              ],
              class: 'disk',
              condition: 'IsAggregate=TRUE',
              counter: 'WriteBytesPerSecond',
              counterSpecifier: '/builtin/disk/writebytespersecond',
              type: 'builtin',
              unit: 'BytesPerSecond',
            },
            {
              annotation: [
                {
                  displayName: 'Network in',
                  locale: 'en-us',
                },
              ],
              class: 'network',
              counter: 'BytesReceived',
              counterSpecifier: '/builtin/network/bytesreceived',
              type: 'builtin',
              unit: 'Bytes',
            },
            {
              annotation: [
                {
                  displayName: 'Network out',
                  locale: 'en-us',
                },
              ],
              class: 'network',
              counter: 'BytesTransmitted',
              counterSpecifier: '/builtin/network/bytestransmitted',
              type: 'builtin',
              unit: 'Bytes',
            },
          ],
        },
        syslogEvents: {
          syslogEventConfiguration: LINUX_SYSLOG_FACILITIES.reduce(
            (acc, facility) => {
              const [name] = facility.split('.');
              acc[name] = 'LOG_INFO';
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      },
    };
  }

  /**
   * Generate ARM template variables for diagnostics
   */
  getTemplateVariables(): Record<string, any> {
    const vars: Record<string, any> = {
      diagnosticsStorageAccountName: this.config.storageAccountName,
      diagnosticsStorageAccountType: DIAGNOSTICS_DEFAULTS.STORAGE_ACCOUNT_TYPE,
    };

    if (this.config.osType === 'Windows') {
      vars.wadCfgXml = this.generateWindowsWadCfgXml();
    } else {
      vars.ladCfg = this.generateLinuxLadCfg();
      vars.accountSasProperties = {
        signedServices: 'bt',
        signedPermission: 'acuw',
        signedExpiry: `[dateTimeAdd(parameters('utcValue'), 'P1Y')]`,
        signedResourceTypes: 'co',
      };
    }

    return vars;
  }

  /**
   * Generate ARM template parameters for diagnostics
   */
  getTemplateParameters(): Record<string, any> {
    return {
      diagnosticsEnabled: {
        type: 'bool',
        defaultValue: this.config.enabled,
        metadata: {
          description: 'Enable VM diagnostics (boot and guest-level)',
        },
      },
      diagnosticsStorageAccountName: {
        type: 'string',
        defaultValue: this.config.storageAccountName || '',
        metadata: {
          description:
            'Storage account name for diagnostics (auto-generated if empty)',
        },
      },
      diagnosticsRetentionDays: {
        type: 'int',
        defaultValue: this.config.retentionDays,
        minValue: 1,
        maxValue: 365,
        metadata: {
          description: 'Diagnostics logs retention period (days)',
        },
      },
      utcValue: {
        type: 'string',
        defaultValue: '[utcNow()]',
        metadata: {
          description: 'UTC timestamp for SAS token generation',
        },
      },
    };
  }

  /**
   * Generate storage account ARM resource
   */
  getStorageAccountResource(): Record<string, any> {
    return {
      type: 'Microsoft.Storage/storageAccounts',
      apiVersion: '2021-09-01',
      name: `[variables('diagnosticsStorageAccountName')]`,
      location: `[parameters('location')]`,
      sku: {
        name: `[variables('diagnosticsStorageAccountType')]`,
      },
      kind: 'StorageV2',
      properties: {
        supportsHttpsTrafficOnly: true,
        encryption: {
          services: {
            blob: {
              enabled: true,
            },
            file: {
              enabled: true,
            },
          },
          keySource: 'Microsoft.Storage',
        },
        accessTier: 'Hot',
      },
    };
  }

  /**
   * Get boot diagnostics configuration for VM resource
   */
  getBootDiagnosticsConfig(): Record<string, any> {
    if (!this.config.enableBootDiagnostics) {
      return {
        enabled: false,
      };
    }

    return {
      enabled: true,
      storageUri: `[reference(resourceId('Microsoft.Storage/storageAccounts', variables('diagnosticsStorageAccountName')), '2021-09-01').primaryEndpoints.blob]`,
    };
  }

  /**
   * Validate diagnostics configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.vmName || this.config.vmName.trim().length === 0) {
      errors.push('VM name is required');
    }

    if (!this.config.location || this.config.location.trim().length === 0) {
      errors.push('Location is required');
    }

    if (
      this.config.retentionDays &&
      (this.config.retentionDays < 1 || this.config.retentionDays > 365)
    ) {
      errors.push('Retention days must be between 1 and 365');
    }

    if (this.config.storageAccountName) {
      const name = this.config.storageAccountName;
      if (name.length < 3 || name.length > 24) {
        errors.push(
          'Storage account name must be between 3 and 24 characters'
        );
      }
      if (!/^[a-z0-9]+$/.test(name)) {
        errors.push(
          'Storage account name must contain only lowercase letters and numbers'
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create diagnostics configuration for Windows VM
 */
export function createWindowsDiagnostics(
  vmName: string,
  location: string,
  options?: Partial<DiagnosticsConfiguration>
): DiagnosticsManager {
  return new DiagnosticsManager({
    enabled: true,
    osType: 'Windows',
    vmName,
    location,
    ...options,
  });
}

/**
 * Create diagnostics configuration for Linux VM
 */
export function createLinuxDiagnostics(
  vmName: string,
  location: string,
  options?: Partial<DiagnosticsConfiguration>
): DiagnosticsManager {
  return new DiagnosticsManager({
    enabled: true,
    osType: 'Linux',
    vmName,
    location,
    ...options,
  });
}

/**
 * Check if diagnostics are marketplace-compliant
 */
export function isMarketplaceCompliant(
  config: DiagnosticsConfiguration
): boolean {
  // Marketplace requires both boot and guest diagnostics
  return (
    config.enabled &&
    config.enableBootDiagnostics !== false &&
    config.enableGuestDiagnostics !== false
  );
}

/**
 * Generate diagnostics ARM template snippet
 */
export function generateDiagnosticsTemplate(
  config: DiagnosticsConfiguration
): {
  parameters: Record<string, any>;
  variables: Record<string, any>;
  resources: any[];
} {
  const manager = new DiagnosticsManager(config);
  const validation = manager.validate();

  if (!validation.valid) {
    throw new Error(
      `Invalid diagnostics configuration: ${validation.errors.join(', ')}`
    );
  }

  const resources: any[] = [];

  // Add storage account
  resources.push(manager.getStorageAccountResource());

  // Add diagnostics extension
  if (config.enableGuestDiagnostics !== false) {
    resources.push(manager.getExtension());
  }

  return {
    parameters: manager.getTemplateParameters(),
    variables: manager.getTemplateVariables(),
    resources,
  };
}
