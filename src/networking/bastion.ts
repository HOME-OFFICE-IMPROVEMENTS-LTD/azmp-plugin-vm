/**
 * Azure Bastion Configuration
 * Source: https://learn.microsoft.com/en-us/azure/bastion/bastion-overview
 */

/**
 * Bastion SKU
 */
export type BastionSku = "Basic" | "Standard" | "Premium";

/**
 * Bastion Template Configuration
 */
export interface BastionTemplate {
  readonly name: string;
  readonly description: string;
  readonly sku: BastionSku;
  readonly enableTunneling: boolean;
  readonly enableIpConnect: boolean;
  readonly enableShareableLink: boolean;
  readonly enableFileCopy: boolean;
  readonly scaleUnits: number;
}

/**
 * Bastion templates for common scenarios
 */
export const BASTION_TEMPLATES = {
  /**
   * Basic bastion for simple scenarios
   */
  basic: {
    name: "Basic Azure Bastion",
    description: "Basic Bastion for simple RDP/SSH access",
    sku: "Basic",
    enableTunneling: false,
    enableIpConnect: false,
    enableShareableLink: false,
    enableFileCopy: false,
    scaleUnits: 2,
  },

  /**
   * Standard bastion with enhanced features
   */
  standard: {
    name: "Standard Azure Bastion",
    description: "Standard Bastion with enhanced features",
    sku: "Standard",
    enableTunneling: true,
    enableIpConnect: true,
    enableShareableLink: false,
    enableFileCopy: true,
    scaleUnits: 2,
  },

  /**
   * Premium bastion with all features
   */
  premium: {
    name: "Premium Azure Bastion",
    description: "Premium Bastion with all features enabled",
    sku: "Premium",
    enableTunneling: true,
    enableIpConnect: true,
    enableShareableLink: true,
    enableFileCopy: true,
    scaleUnits: 4,
  },

  /**
   * Developer bastion for dev environments
   */
  developer: {
    name: "Developer Azure Bastion",
    description: "Cost-optimized Bastion for development",
    sku: "Basic",
    enableTunneling: false,
    enableIpConnect: false,
    enableShareableLink: false,
    enableFileCopy: false,
    scaleUnits: 2,
  },

  /**
   * Production bastion with best practices
   */
  production: {
    name: "Production Azure Bastion",
    description: "Production-ready Bastion with recommended settings",
    sku: "Standard",
    enableTunneling: true,
    enableIpConnect: true,
    enableShareableLink: false,
    enableFileCopy: true,
    scaleUnits: 3,
  },
} as const;

export type BastionTemplateKey = keyof typeof BASTION_TEMPLATES;

/**
 * Bastion feature descriptions
 */
export const BASTION_FEATURES = {
  tunneling: {
    name: "Native Client Support",
    description: "Connect via native RDP/SSH clients using Azure CLI",
    requiredSku: "Standard",
  },
  ipConnect: {
    name: "IP-based Connection",
    description: "Connect to VMs using private IP addresses",
    requiredSku: "Standard",
  },
  shareableLink: {
    name: "Shareable Link",
    description: "Create shareable links for VM access",
    requiredSku: "Premium",
  },
  fileCopy: {
    name: "File Copy",
    description: "Upload/download files during RDP sessions",
    requiredSku: "Standard",
  },
  scaleUnits: {
    name: "Scale Units",
    description: "Control concurrent session capacity (2-50 units)",
    requiredSku: "Standard",
  },
} as const;

export type BastionFeatureKey = keyof typeof BASTION_FEATURES;

/**
 * Get Bastion template by key
 */
export function getBastionTemplate(
  key: BastionTemplateKey,
): (typeof BASTION_TEMPLATES)[BastionTemplateKey] | undefined {
  return BASTION_TEMPLATES[key];
}

/**
 * Get all Bastion templates
 */
export function getAllBastionTemplates(): Array<{
  key: BastionTemplateKey;
  template: (typeof BASTION_TEMPLATES)[BastionTemplateKey];
}> {
  return Object.entries(BASTION_TEMPLATES).map(([key, template]) => ({
    key: key as BastionTemplateKey,
    template,
  }));
}

/**
 * Get Bastion feature by key
 */
export function getBastionFeature(
  key: BastionFeatureKey,
): (typeof BASTION_FEATURES)[BastionFeatureKey] | undefined {
  return BASTION_FEATURES[key];
}

/**
 * Get all Bastion features
 */
export function getAllBastionFeatures(): Array<{
  key: BastionFeatureKey;
  feature: (typeof BASTION_FEATURES)[BastionFeatureKey];
}> {
  return Object.entries(BASTION_FEATURES).map(([key, feature]) => ({
    key: key as BastionFeatureKey,
    feature,
  }));
}

/**
 * Validate scale units
 */
export function validateScaleUnits(scaleUnits: number): {
  valid: boolean;
  error?: string;
} {
  if (scaleUnits < 2 || scaleUnits > 50) {
    return { valid: false, error: "Scale units must be between 2 and 50" };
  }
  return { valid: true };
}

/**
 * Check if feature is available for SKU
 */
export function isFeatureAvailable(
  feature: BastionFeatureKey,
  sku: BastionSku,
): boolean {
  const featureInfo = BASTION_FEATURES[feature];
  const skuHierarchy: BastionSku[] = ["Basic", "Standard", "Premium"];
  const requiredIndex = skuHierarchy.indexOf(
    featureInfo.requiredSku as BastionSku,
  );
  const currentIndex = skuHierarchy.indexOf(sku);
  return currentIndex >= requiredIndex;
}

/**
 * Get recommended scale units for concurrent sessions
 */
export function getRecommendedScaleUnits(concurrentSessions: number): number {
  // Each scale unit supports ~20 concurrent sessions
  const units = Math.ceil(concurrentSessions / 20);
  return Math.max(2, Math.min(50, units));
}
