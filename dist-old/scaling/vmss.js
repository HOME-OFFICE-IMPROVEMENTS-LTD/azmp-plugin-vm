"use strict";
/**
 * Scaling Module - Virtual Machine Scale Set Definition
 *
 * Provides the base VMSS resource definition helper that other scaling helpers
 * can build upon.
 *
 * @module scaling/vmss
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vmssHelpers = void 0;
exports.createVmssDefinition = createVmssDefinition;
/**
 * Create the core Virtual Machine Scale Set ARM template resource definition.
 *
 * @param options - VMSS configuration options
 * @returns ARM template resource for VMSS
 */
function createVmssDefinition(options) {
    if (!options?.name) {
        throw new Error("scale:vmss.definition requires a VMSS name");
    }
    if (!options?.vmSize) {
        throw new Error("scale:vmss.definition requires a vmSize");
    }
    const orchestrationMode = options.orchestrationMode ?? "Uniform";
    const upgradeMode = options.upgradeMode ?? "Manual";
    const resource = {
        type: "Microsoft.Compute/virtualMachineScaleSets",
        apiVersion: "2023-09-01",
        name: options.name,
        location: options.location || "[resourceGroup().location]",
        sku: {
            name: options.vmSize,
            tier: "Standard",
            capacity: options.instanceCount ?? 2,
        },
        properties: {
            virtualMachineProfile: {
                osProfile: {},
                storageProfile: {},
                networkProfile: {},
            },
        },
    };
    if (options.zones && options.zones.length > 0) {
        resource.zones = options.zones;
    }
    if (options.tags) {
        resource.tags = options.tags;
    }
    if (orchestrationMode === "Flexible") {
        const faultDomains = options.platformFaultDomainCount ?? 2;
        if (faultDomains < 1 || faultDomains > 5) {
            throw new Error("Flexible VMSS platformFaultDomainCount must be between 1 and 5");
        }
        resource.properties.orchestrationMode = "Flexible";
        resource.properties.platformFaultDomainCount = faultDomains;
        resource.properties.singlePlacementGroup =
            options.singlePlacementGroup ?? false;
    }
    else {
        const faultDomains = options.platformFaultDomainCount ?? 2;
        if (faultDomains < 1 || faultDomains > 3) {
            throw new Error("Uniform VMSS platformFaultDomainCount must be between 1 and 3");
        }
        resource.properties.orchestrationMode = "Uniform";
        resource.properties.overprovision = options.overprovision ?? true;
        resource.properties.singlePlacementGroup =
            options.singlePlacementGroup ?? true;
        resource.properties.platformFaultDomainCount = faultDomains;
        resource.properties.upgradePolicy = {
            mode: upgradeMode,
        };
        if (upgradeMode === "Rolling") {
            resource.properties.upgradePolicy.rollingUpgradePolicy = {
                maxBatchInstancePercent: 20,
                maxUnhealthyInstancePercent: 20,
                maxUnhealthyUpgradedInstancePercent: 20,
                pauseTimeBetweenBatches: "PT0S",
            };
        }
    }
    return resource;
}
/**
 * Exported helper map for registration.
 */
exports.vmssHelpers = {
    "scale:vmss.definition": createVmssDefinition,
};
