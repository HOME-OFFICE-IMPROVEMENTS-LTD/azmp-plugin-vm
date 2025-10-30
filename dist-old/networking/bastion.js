"use strict";
/**
 * Azure Bastion Configuration
 * Source: https://learn.microsoft.com/en-us/azure/bastion/bastion-overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASTION_FEATURES = exports.BASTION_TEMPLATES = void 0;
exports.getBastionTemplate = getBastionTemplate;
exports.getAllBastionTemplates = getAllBastionTemplates;
exports.getBastionFeature = getBastionFeature;
exports.getAllBastionFeatures = getAllBastionFeatures;
exports.validateScaleUnits = validateScaleUnits;
exports.isFeatureAvailable = isFeatureAvailable;
exports.getRecommendedScaleUnits = getRecommendedScaleUnits;
/**
 * Bastion templates for common scenarios
 */
exports.BASTION_TEMPLATES = {
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
};
/**
 * Bastion feature descriptions
 */
exports.BASTION_FEATURES = {
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
};
/**
 * Get Bastion template by key
 */
function getBastionTemplate(key) {
    return exports.BASTION_TEMPLATES[key];
}
/**
 * Get all Bastion templates
 */
function getAllBastionTemplates() {
    return Object.entries(exports.BASTION_TEMPLATES).map(([key, template]) => ({
        key: key,
        template,
    }));
}
/**
 * Get Bastion feature by key
 */
function getBastionFeature(key) {
    return exports.BASTION_FEATURES[key];
}
/**
 * Get all Bastion features
 */
function getAllBastionFeatures() {
    return Object.entries(exports.BASTION_FEATURES).map(([key, feature]) => ({
        key: key,
        feature,
    }));
}
/**
 * Validate scale units
 */
function validateScaleUnits(scaleUnits) {
    if (scaleUnits < 2 || scaleUnits > 50) {
        return { valid: false, error: "Scale units must be between 2 and 50" };
    }
    return { valid: true };
}
/**
 * Check if feature is available for SKU
 */
function isFeatureAvailable(feature, sku) {
    const featureInfo = exports.BASTION_FEATURES[feature];
    const skuHierarchy = ["Basic", "Standard", "Premium"];
    const requiredIndex = skuHierarchy.indexOf(featureInfo.requiredSku);
    const currentIndex = skuHierarchy.indexOf(sku);
    return currentIndex >= requiredIndex;
}
/**
 * Get recommended scale units for concurrent sessions
 */
function getRecommendedScaleUnits(concurrentSessions) {
    // Each scale unit supports ~20 concurrent sessions
    const units = Math.ceil(concurrentSessions / 20);
    return Math.max(2, Math.min(50, units));
}
