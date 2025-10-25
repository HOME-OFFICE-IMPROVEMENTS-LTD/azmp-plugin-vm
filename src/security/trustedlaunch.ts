/**
 * Security Trusted Launch Module
 * 
 * Provides helpers for Azure Trusted Launch features
 * Supports Secure Boot, vTPM, and Boot Integrity Monitoring
 * 
 * @module security/trustedlaunch
 */

/**
 * Trusted Launch security type
 */
export type SecurityType = 'TrustedLaunch' | 'ConfidentialVM' | 'Standard';

/**
 * Trusted Launch configuration
 */
export interface TrustedLaunchConfig {
  securityType: SecurityType;
  uefiSettings?: {
    secureBootEnabled: boolean;
    vTpmEnabled: boolean;
  };
  bootIntegrityMonitoring?: boolean;
  guestAttestation?: boolean;
}

/**
 * 1. Secure Boot
 * Ensures only signed bootloaders and OS kernels can run
 * 
 * @param enabled - Enable Secure Boot
 * @returns Secure Boot configuration
 */
export function secureBoot(enabled: boolean = true) {
  return {
    feature: 'SecureBoot',
    enabled,
    description: 'Protects against boot kits and rootkits by validating boot signatures',
    requirements: [
      'Generation 2 VM',
      'Supported VM size (most Dv4, Ev4, Dsv4, Esv4 and newer)',
      'Marketplace image with Trusted Launch support'
    ],
    benefits: [
      'Boot integrity protection',
      'Malware prevention at boot',
      'Compliance with security standards'
    ]
  };
}

/**
 * 2. Virtual Trusted Platform Module (vTPM)
 * Virtualized TPM 2.0 device for attestation and key protection
 * 
 * @param enabled - Enable vTPM
 * @returns vTPM configuration
 */
export function vTpm(enabled: boolean = true) {
  return {
    feature: 'vTPM',
    enabled,
    description: 'Enables measured boot and attestation capabilities',
    requirements: [
      'Generation 2 VM',
      'Secure Boot recommended',
      'Trusted Launch enabled VM'
    ],
    capabilities: [
      'Measured boot',
      'Key storage and protection',
      'Remote attestation',
      'BitLocker encryption key protection'
    ],
    benefits: [
      'Hardware-backed security',
      'Boot chain measurement',
      'Attestation-based access control'
    ]
  };
}

/**
 * 3. Boot Integrity Monitoring
 * Azure Security Center integration for boot chain monitoring
 * 
 * @param enabled - Enable boot integrity monitoring
 * @returns Boot integrity monitoring configuration
 */
export function bootIntegrityMonitoring(enabled: boolean = true) {
  return {
    feature: 'BootIntegrityMonitoring',
    enabled,
    description: 'Monitors boot chain integrity and alerts on anomalies',
    requirements: [
      'vTPM enabled',
      'Azure Security Center (Defender for Cloud)',
      'Guest Attestation extension'
    ],
    capabilities: [
      'Boot chain measurement collection',
      'Baseline comparison',
      'Alert generation on anomalies',
      'Integration with Security Center'
    ],
    alerts: [
      'Unexpected boot chain modification',
      'Unsigned component detected',
      'Boot configuration tampered'
    ]
  };
}

/**
 * 4. Guest Attestation Extension
 * Enables runtime attestation and verification
 * 
 * @param platform - Target platform
 * @returns Guest attestation extension configuration
 */
export function guestAttestationExtension(platform: 'Windows' | 'Linux') {
  const type = platform === 'Windows' 
    ? 'GuestAttestation' 
    : 'GuestAttestation';
  
  return {
    name: 'GuestAttestation',
    publisher: 'Microsoft.Azure.Security.LinuxAttestation',
    type: type,
    typeHandlerVersion: '1.0',
    autoUpgradeMinorVersion: true,
    enableAutomaticUpgrade: true,
    settings: {
      AttestationConfig: {
        MaaSettings: {
          maaEndpoint: '',
          maaTenantName: 'GuestAttestation'
        },
        AscSettings: {
          ascReportingEndpoint: '',
          ascReportingFrequency: ''
        },
        useCustomToken: 'false',
        disableAlerts: 'false'
      }
    },
    platform
  };
}

/**
 * 5. Measured Boot
 * Records measurements of boot chain components
 * 
 * @returns Measured boot configuration
 */
export function measuredBoot() {
  return {
    feature: 'MeasuredBoot',
    enabled: true,
    description: 'Measures and records boot chain components in vTPM PCRs',
    measurements: [
      'UEFI firmware',
      'Bootloader',
      'OS kernel',
      'Initial RAM disk',
      'Early boot components'
    ],
    pcrBanks: [
      'PCR 0: UEFI firmware and platform configuration',
      'PCR 1: UEFI firmware and platform configuration data',
      'PCR 2: Option ROM code',
      'PCR 3: Option ROM data',
      'PCR 4: Boot loader',
      'PCR 5: Boot loader configuration',
      'PCR 6: Resume from S4/S5',
      'PCR 7: Secure Boot policy',
      'PCR 8-15: OS-defined measurements'
    ],
    benefits: [
      'Tamper detection',
      'Boot chain verification',
      'Attestation data for remote verification'
    ]
  };
}

/**
 * Create complete Trusted Launch configuration
 * 
 * @param level - Security level (standard, advanced, maximum)
 * @param platform - Target platform
 * @returns Complete Trusted Launch configuration
 */
export function createTrustedLaunchConfig(
  level: 'standard' | 'advanced' | 'maximum',
  platform: 'Windows' | 'Linux'
): TrustedLaunchConfig {
  const configs = {
    standard: {
      securityType: 'TrustedLaunch' as SecurityType,
      uefiSettings: {
        secureBootEnabled: true,
        vTpmEnabled: true
      },
      bootIntegrityMonitoring: false,
      guestAttestation: false
    },
    advanced: {
      securityType: 'TrustedLaunch' as SecurityType,
      uefiSettings: {
        secureBootEnabled: true,
        vTpmEnabled: true
      },
      bootIntegrityMonitoring: true,
      guestAttestation: false
    },
    maximum: {
      securityType: 'TrustedLaunch' as SecurityType,
      uefiSettings: {
        secureBootEnabled: true,
        vTpmEnabled: true
      },
      bootIntegrityMonitoring: true,
      guestAttestation: true
    }
  };

  return configs[level];
}

/**
 * Get Trusted Launch recommendations based on compliance
 * 
 * @param compliance - Compliance framework
 * @returns Recommended Trusted Launch features
 */
export function getTrustedLaunchRecommendations(
  compliance: 'SOC2' | 'HIPAA' | 'ISO27001' | 'FedRAMP' | 'PCI-DSS' | 'GDPR'
) {
  const recommendations: Record<string, any> = {
    SOC2: {
      level: 'advanced',
      features: ['secureBoot', 'vTpm', 'bootIntegrityMonitoring'],
      required: true
    },
    HIPAA: {
      level: 'maximum',
      features: ['secureBoot', 'vTpm', 'bootIntegrityMonitoring', 'guestAttestation'],
      required: true
    },
    ISO27001: {
      level: 'advanced',
      features: ['secureBoot', 'vTpm', 'bootIntegrityMonitoring'],
      required: true
    },
    FedRAMP: {
      level: 'maximum',
      features: ['secureBoot', 'vTpm', 'bootIntegrityMonitoring', 'guestAttestation', 'measuredBoot'],
      required: true
    },
    'PCI-DSS': {
      level: 'advanced',
      features: ['secureBoot', 'vTpm', 'bootIntegrityMonitoring'],
      required: true
    },
    GDPR: {
      level: 'standard',
      features: ['secureBoot', 'vTpm'],
      required: false
    }
  };

  return recommendations[compliance];
}

/**
 * Validate Trusted Launch configuration
 * 
 * @param config - Trusted Launch configuration
 * @param vmGeneration - VM generation (1 or 2)
 * @returns Validation result
 */
export function validateTrustedLaunchConfig(
  config: TrustedLaunchConfig,
  vmGeneration: 1 | 2
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // VM Generation validation
  if (config.securityType !== 'Standard' && vmGeneration !== 2) {
    errors.push('Trusted Launch requires Generation 2 VM');
  }

  // Secure Boot validation
  if (config.uefiSettings?.secureBootEnabled && !config.uefiSettings.vTpmEnabled) {
    warnings.push('Secure Boot is more effective when used with vTPM');
  }

  // Boot Integrity Monitoring validation
  if (config.bootIntegrityMonitoring && !config.uefiSettings?.vTpmEnabled) {
    errors.push('Boot Integrity Monitoring requires vTPM to be enabled');
  }

  // Guest Attestation validation
  if (config.guestAttestation && !config.uefiSettings?.vTpmEnabled) {
    errors.push('Guest Attestation requires vTPM to be enabled');
  }

  if (config.guestAttestation && !config.bootIntegrityMonitoring) {
    warnings.push('Guest Attestation is typically used with Boot Integrity Monitoring');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get compatible VM sizes for Trusted Launch
 * 
 * @returns List of compatible VM size families
 */
export function getCompatibleVmSizes(): string[] {
  return [
    // General Purpose
    'Standard_D2s_v5', 'Standard_D4s_v5', 'Standard_D8s_v5',
    'Standard_D2as_v5', 'Standard_D4as_v5', 'Standard_D8as_v5',
    
    // Memory Optimized
    'Standard_E2s_v5', 'Standard_E4s_v5', 'Standard_E8s_v5',
    'Standard_E2as_v5', 'Standard_E4as_v5', 'Standard_E8as_v5',
    
    // Compute Optimized
    'Standard_F2s_v2', 'Standard_F4s_v2', 'Standard_F8s_v2',
    
    // Storage Optimized
    'Standard_L8s_v3', 'Standard_L16s_v3',
    
    // GPU
    'Standard_NC4as_T4_v3', 'Standard_NC8as_T4_v3',
    'Standard_NV6ads_A10_v5', 'Standard_NV12ads_A10_v5'
  ];
}

/**
 * Export all Trusted Launch functions
 */
export const trustedlaunch = {
  secureBoot,
  vTpm,
  bootIntegrityMonitoring,
  guestAttestationExtension,
  measuredBoot,
  createTrustedLaunchConfig,
  getTrustedLaunchRecommendations,
  validateTrustedLaunchConfig,
  getCompatibleVmSizes
};
