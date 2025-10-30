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
export declare const BASTION_TEMPLATES: {
    /**
     * Basic bastion for simple scenarios
     */
    readonly basic: {
        readonly name: "Basic Azure Bastion";
        readonly description: "Basic Bastion for simple RDP/SSH access";
        readonly sku: "Basic";
        readonly enableTunneling: false;
        readonly enableIpConnect: false;
        readonly enableShareableLink: false;
        readonly enableFileCopy: false;
        readonly scaleUnits: 2;
    };
    /**
     * Standard bastion with enhanced features
     */
    readonly standard: {
        readonly name: "Standard Azure Bastion";
        readonly description: "Standard Bastion with enhanced features";
        readonly sku: "Standard";
        readonly enableTunneling: true;
        readonly enableIpConnect: true;
        readonly enableShareableLink: false;
        readonly enableFileCopy: true;
        readonly scaleUnits: 2;
    };
    /**
     * Premium bastion with all features
     */
    readonly premium: {
        readonly name: "Premium Azure Bastion";
        readonly description: "Premium Bastion with all features enabled";
        readonly sku: "Premium";
        readonly enableTunneling: true;
        readonly enableIpConnect: true;
        readonly enableShareableLink: true;
        readonly enableFileCopy: true;
        readonly scaleUnits: 4;
    };
    /**
     * Developer bastion for dev environments
     */
    readonly developer: {
        readonly name: "Developer Azure Bastion";
        readonly description: "Cost-optimized Bastion for development";
        readonly sku: "Basic";
        readonly enableTunneling: false;
        readonly enableIpConnect: false;
        readonly enableShareableLink: false;
        readonly enableFileCopy: false;
        readonly scaleUnits: 2;
    };
    /**
     * Production bastion with best practices
     */
    readonly production: {
        readonly name: "Production Azure Bastion";
        readonly description: "Production-ready Bastion with recommended settings";
        readonly sku: "Standard";
        readonly enableTunneling: true;
        readonly enableIpConnect: true;
        readonly enableShareableLink: false;
        readonly enableFileCopy: true;
        readonly scaleUnits: 3;
    };
};
export type BastionTemplateKey = keyof typeof BASTION_TEMPLATES;
/**
 * Bastion feature descriptions
 */
export declare const BASTION_FEATURES: {
    readonly tunneling: {
        readonly name: "Native Client Support";
        readonly description: "Connect via native RDP/SSH clients using Azure CLI";
        readonly requiredSku: "Standard";
    };
    readonly ipConnect: {
        readonly name: "IP-based Connection";
        readonly description: "Connect to VMs using private IP addresses";
        readonly requiredSku: "Standard";
    };
    readonly shareableLink: {
        readonly name: "Shareable Link";
        readonly description: "Create shareable links for VM access";
        readonly requiredSku: "Premium";
    };
    readonly fileCopy: {
        readonly name: "File Copy";
        readonly description: "Upload/download files during RDP sessions";
        readonly requiredSku: "Standard";
    };
    readonly scaleUnits: {
        readonly name: "Scale Units";
        readonly description: "Control concurrent session capacity (2-50 units)";
        readonly requiredSku: "Standard";
    };
};
export type BastionFeatureKey = keyof typeof BASTION_FEATURES;
/**
 * Get Bastion template by key
 */
export declare function getBastionTemplate(key: BastionTemplateKey): (typeof BASTION_TEMPLATES)[BastionTemplateKey] | undefined;
/**
 * Get all Bastion templates
 */
export declare function getAllBastionTemplates(): Array<{
    key: BastionTemplateKey;
    template: (typeof BASTION_TEMPLATES)[BastionTemplateKey];
}>;
/**
 * Get Bastion feature by key
 */
export declare function getBastionFeature(key: BastionFeatureKey): (typeof BASTION_FEATURES)[BastionFeatureKey] | undefined;
/**
 * Get all Bastion features
 */
export declare function getAllBastionFeatures(): Array<{
    key: BastionFeatureKey;
    feature: (typeof BASTION_FEATURES)[BastionFeatureKey];
}>;
/**
 * Validate scale units
 */
export declare function validateScaleUnits(scaleUnits: number): {
    valid: boolean;
    error?: string;
};
/**
 * Check if feature is available for SKU
 */
export declare function isFeatureAvailable(feature: BastionFeatureKey, sku: BastionSku): boolean;
/**
 * Get recommended scale units for concurrent sessions
 */
export declare function getRecommendedScaleUnits(concurrentSessions: number): number;
