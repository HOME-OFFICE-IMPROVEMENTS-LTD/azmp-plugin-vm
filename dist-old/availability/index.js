"use strict";
/**
 * Availability Module
 *
 * Azure Virtual Machine Availability and High Availability configurations.
 * Includes Availability Sets, Availability Zones, and Virtual Machine Scale Sets.
 *
 * @module availability
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vmssBestPractices = exports.validateVMSSConfig = exports.vmssSLA = exports.rollingUpgradePolicy = exports.vmssHealthExtension = exports.cpuAutoscaleRules = exports.vmssAutoscale = exports.vmssUniform = exports.vmssFlexible = exports.getZoneSupportedRegions = exports.availabilityZonesBestPractices = exports.validateZoneConfig = exports.recommendZoneDistribution = exports.availabilityZoneSLA = exports.zoneRedundantIP = exports.zoneRedundantDisk = exports.zonalVM = exports.supportsAvailabilityZones = exports.getAvailableZones = exports.proximityPlacementGroup = exports.availabilitySetBestPractices = exports.validateAvailabilitySet = exports.availabilitySetSLA = exports.recommendedUpdateDomains = exports.recommendedFaultDomains = exports.availabilitySetRef = exports.availabilitySet = void 0;
exports.registerAvailabilityHelpers = registerAvailabilityHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
// Import all availability modules
const availabilitysets_1 = require("./availabilitysets");
Object.defineProperty(exports, "availabilitySet", { enumerable: true, get: function () { return availabilitysets_1.availabilitySet; } });
Object.defineProperty(exports, "availabilitySetRef", { enumerable: true, get: function () { return availabilitysets_1.availabilitySetRef; } });
Object.defineProperty(exports, "recommendedFaultDomains", { enumerable: true, get: function () { return availabilitysets_1.recommendedFaultDomains; } });
Object.defineProperty(exports, "recommendedUpdateDomains", { enumerable: true, get: function () { return availabilitysets_1.recommendedUpdateDomains; } });
Object.defineProperty(exports, "availabilitySetSLA", { enumerable: true, get: function () { return availabilitysets_1.availabilitySetSLA; } });
Object.defineProperty(exports, "validateAvailabilitySet", { enumerable: true, get: function () { return availabilitysets_1.validateAvailabilitySet; } });
Object.defineProperty(exports, "availabilitySetBestPractices", { enumerable: true, get: function () { return availabilitysets_1.availabilitySetBestPractices; } });
Object.defineProperty(exports, "proximityPlacementGroup", { enumerable: true, get: function () { return availabilitysets_1.proximityPlacementGroup; } });
const availabilityzones_1 = require("./availabilityzones");
Object.defineProperty(exports, "getAvailableZones", { enumerable: true, get: function () { return availabilityzones_1.getAvailableZones; } });
Object.defineProperty(exports, "supportsAvailabilityZones", { enumerable: true, get: function () { return availabilityzones_1.supportsAvailabilityZones; } });
Object.defineProperty(exports, "zonalVM", { enumerable: true, get: function () { return availabilityzones_1.zonalVM; } });
Object.defineProperty(exports, "zoneRedundantDisk", { enumerable: true, get: function () { return availabilityzones_1.zoneRedundantDisk; } });
Object.defineProperty(exports, "zoneRedundantIP", { enumerable: true, get: function () { return availabilityzones_1.zoneRedundantIP; } });
Object.defineProperty(exports, "availabilityZoneSLA", { enumerable: true, get: function () { return availabilityzones_1.availabilityZoneSLA; } });
Object.defineProperty(exports, "recommendZoneDistribution", { enumerable: true, get: function () { return availabilityzones_1.recommendZoneDistribution; } });
Object.defineProperty(exports, "validateZoneConfig", { enumerable: true, get: function () { return availabilityzones_1.validateZoneConfig; } });
Object.defineProperty(exports, "availabilityZonesBestPractices", { enumerable: true, get: function () { return availabilityzones_1.availabilityZonesBestPractices; } });
Object.defineProperty(exports, "getZoneSupportedRegions", { enumerable: true, get: function () { return availabilityzones_1.getZoneSupportedRegions; } });
const vmss_1 = require("./vmss");
Object.defineProperty(exports, "vmssFlexible", { enumerable: true, get: function () { return vmss_1.vmssFlexible; } });
Object.defineProperty(exports, "vmssUniform", { enumerable: true, get: function () { return vmss_1.vmssUniform; } });
Object.defineProperty(exports, "vmssAutoscale", { enumerable: true, get: function () { return vmss_1.vmssAutoscale; } });
Object.defineProperty(exports, "cpuAutoscaleRules", { enumerable: true, get: function () { return vmss_1.cpuAutoscaleRules; } });
Object.defineProperty(exports, "vmssHealthExtension", { enumerable: true, get: function () { return vmss_1.vmssHealthExtension; } });
Object.defineProperty(exports, "rollingUpgradePolicy", { enumerable: true, get: function () { return vmss_1.rollingUpgradePolicy; } });
Object.defineProperty(exports, "vmssSLA", { enumerable: true, get: function () { return vmss_1.vmssSLA; } });
Object.defineProperty(exports, "validateVMSSConfig", { enumerable: true, get: function () { return vmss_1.validateVMSSConfig; } });
Object.defineProperty(exports, "vmssBestPractices", { enumerable: true, get: function () { return vmss_1.vmssBestPractices; } });
/**
 * Register all availability helpers with Handlebars
 */
function registerAvailabilityHelpers() {
    // Availability Sets
    handlebars_1.default.registerHelper("availability:set", function (options) {
        const config = {
            name: options.hash.name,
            platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
            platformUpdateDomainCount: options.hash.updateDomains ?? options.hash.platformUpdateDomainCount,
            proximityPlacementGroupId: options.hash.proximityPlacementGroupId,
            sku: options.hash.sku || "Aligned",
            tags: options.hash.tags,
        };
        return JSON.stringify((0, availabilitysets_1.availabilitySet)(config), null, 2);
    });
    handlebars_1.default.registerHelper("availability:setRef", function (name) {
        return JSON.stringify((0, availabilitysets_1.availabilitySetRef)(name));
    });
    handlebars_1.default.registerHelper("availability:recommendedFaultDomains", function (vmCount) {
        return (0, availabilitysets_1.recommendedFaultDomains)(vmCount);
    });
    handlebars_1.default.registerHelper("availability:recommendedUpdateDomains", function (vmCount) {
        return (0, availabilitysets_1.recommendedUpdateDomains)(vmCount);
    });
    handlebars_1.default.registerHelper("availability:setSLA", function (vmCount) {
        return (0, availabilitysets_1.availabilitySetSLA)(vmCount);
    });
    handlebars_1.default.registerHelper("availability:proximityPlacementGroup", function (name, location) {
        return JSON.stringify((0, availabilitysets_1.proximityPlacementGroup)(name, location), null, 2);
    });
    // Availability Zones
    handlebars_1.default.registerHelper("availability:zones", function (location) {
        return JSON.stringify((0, availabilityzones_1.getAvailableZones)(location));
    });
    handlebars_1.default.registerHelper("availability:supportsZones", function (location) {
        return (0, availabilityzones_1.supportsAvailabilityZones)(location);
    });
    handlebars_1.default.registerHelper("availability:zonalVM", function (options) {
        const config = {
            name: options.hash.name,
            location: options.hash.location,
            zone: options.hash.zone,
            vmSize: options.hash.vmSize,
        };
        return JSON.stringify((0, availabilityzones_1.zonalVM)(config), null, 2);
    });
    handlebars_1.default.registerHelper("availability:zoneRedundantDisk", function (diskName, zones) {
        const zoneArray = zones;
        return JSON.stringify((0, availabilityzones_1.zoneRedundantDisk)(diskName, zoneArray), null, 2);
    });
    handlebars_1.default.registerHelper("availability:zoneRedundantIP", function (ipName, zones) {
        const zoneArray = zones;
        return JSON.stringify((0, availabilityzones_1.zoneRedundantIP)(ipName, zoneArray), null, 2);
    });
    handlebars_1.default.registerHelper("availability:zoneSLA", function (vmCount, zoneCount) {
        return (0, availabilityzones_1.availabilityZoneSLA)(vmCount, zoneCount);
    });
    handlebars_1.default.registerHelper("availability:recommendZoneDistribution", function (vmCount) {
        return JSON.stringify((0, availabilityzones_1.recommendZoneDistribution)(vmCount));
    });
    handlebars_1.default.registerHelper("availability:zoneSupportedRegions", function () {
        return JSON.stringify((0, availabilityzones_1.getZoneSupportedRegions)());
    });
    // VMSS (Virtual Machine Scale Sets)
    handlebars_1.default.registerHelper("availability:vmssFlexible", function (options) {
        const config = {
            name: options.hash.name,
            location: options.hash.location,
            orchestrationMode: "Flexible",
            platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
            zones: options.hash.zones,
            vmSize: options.hash.vmSize,
            instanceCount: options.hash.instanceCount ?? options.hash.instances,
            singlePlacementGroup: options.hash.singlePlacementGroup,
            tags: options.hash.tags,
        };
        return JSON.stringify((0, vmss_1.vmssFlexible)(config), null, 2);
    });
    handlebars_1.default.registerHelper("availability:vmssUniform", function (options) {
        const config = {
            name: options.hash.name,
            location: options.hash.location,
            orchestrationMode: "Uniform",
            platformFaultDomainCount: options.hash.faultDomains ?? options.hash.platformFaultDomainCount,
            zones: options.hash.zones,
            vmSize: options.hash.vmSize,
            instanceCount: options.hash.instanceCount ?? options.hash.instances,
            upgradeMode: options.hash.upgradeMode,
            overprovision: options.hash.overprovision,
            singlePlacementGroup: options.hash.singlePlacementGroup,
            tags: options.hash.tags,
        };
        return JSON.stringify((0, vmss_1.vmssUniform)(config), null, 2);
    });
    handlebars_1.default.registerHelper("availability:vmssAutoscale", function (vmssName, options) {
        const profile = {
            name: options.hash.profileName || "defaultProfile",
            capacity: {
                minimum: options.hash.minInstances ?? 2,
                maximum: options.hash.maxInstances ?? 10,
                default: options.hash.defaultInstances ?? 3,
            },
            rules: options.hash.rules || [],
        };
        return JSON.stringify((0, vmss_1.vmssAutoscale)(vmssName, profile), null, 2);
    });
    handlebars_1.default.registerHelper("availability:cpuAutoscaleRules", function (vmssResourceId, options) {
        const scaleOutThreshold = options.hash.scaleOutThreshold ?? 75;
        const scaleInThreshold = options.hash.scaleInThreshold ?? 25;
        return JSON.stringify((0, vmss_1.cpuAutoscaleRules)(vmssResourceId, scaleOutThreshold, scaleInThreshold), null, 2);
    });
    handlebars_1.default.registerHelper("availability:vmssHealthExtension", function (options) {
        const config = {
            protocol: options.hash.protocol || "Http",
            port: options.hash.port || 80,
            requestPath: options.hash.requestPath,
            intervalInSeconds: options.hash.intervalInSeconds,
            numberOfProbes: options.hash.numberOfProbes,
        };
        return JSON.stringify((0, vmss_1.vmssHealthExtension)(config), null, 2);
    });
    handlebars_1.default.registerHelper("availability:rollingUpgradePolicy", function (options) {
        const maxBatchPercent = options.hash.maxBatchPercent ?? 20;
        const maxUnhealthyPercent = options.hash.maxUnhealthyPercent ?? 20;
        const pauseTime = options.hash.pauseTime ?? "PT0S";
        return JSON.stringify((0, vmss_1.rollingUpgradePolicy)(maxBatchPercent, maxUnhealthyPercent, pauseTime), null, 2);
    });
    handlebars_1.default.registerHelper("availability:vmssSLA", function (zoneCount, instanceCount) {
        return (0, vmss_1.vmssSLA)(zoneCount, instanceCount);
    });
    // Best Practices
    handlebars_1.default.registerHelper("availability:bestPractices", function (type) {
        switch (type) {
            case "sets":
            case "availabilitysets":
                return new handlebars_1.default.SafeString((0, availabilitysets_1.availabilitySetBestPractices)());
            case "zones":
            case "availabilityzones":
                return new handlebars_1.default.SafeString((0, availabilityzones_1.availabilityZonesBestPractices)());
            case "vmss":
            case "scaleset":
            case "scalesets":
                return new handlebars_1.default.SafeString((0, vmss_1.vmssBestPractices)());
            default:
                return new handlebars_1.default.SafeString(`
# Azure VM Availability Options

## Availability Sets
${(0, availabilitysets_1.availabilitySetBestPractices)()}

## Availability Zones
${(0, availabilityzones_1.availabilityZonesBestPractices)()}

## Virtual Machine Scale Sets
${(0, vmss_1.vmssBestPractices)()}
        `.trim());
        }
    });
}
