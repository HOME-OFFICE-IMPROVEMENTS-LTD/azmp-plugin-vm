"use strict";
/**
 * Azure Compute Helper
 *
 * Provides utilities for interacting with Azure Compute resources.
 * Wraps Azure Compute SDK for VM sizes, images, and related operations.
 *
 * @module azure/compute
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeHelper = void 0;
const arm_compute_1 = require("@azure/arm-compute");
/**
 * Azure Compute Helper Class
 *
 * Manages interactions with Azure Compute Management API.
 *
 * @example
 * ```typescript
 * const credential = new DefaultAzureCredential();
 * const compute = new ComputeHelper(credential, 'subscription-id');
 * const sizes = await compute.listVmSizes('eastus');
 * ```
 */
class ComputeHelper {
    client;
    subscriptionId;
    /**
     * Create ComputeHelper instance
     *
     * @param {TokenCredential} credential - Azure credential
     * @param {string} subscriptionId - Azure subscription ID
     */
    constructor(credential, subscriptionId) {
        this.client = new arm_compute_1.ComputeManagementClient(credential, subscriptionId);
        this.subscriptionId = subscriptionId;
    }
    /**
     * List VM sizes available in a region
     *
     * @param {string} location - Azure region (e.g., 'eastus')
     * @returns {Promise<VmSizeInfo[]>} Array of VM size information
     *
     * @example
     * ```typescript
     * const sizes = await compute.listVmSizes('eastus');
     * sizes.forEach(size => {
     *   console.log(`${size.name}: ${size.numberOfCores} cores, ${size.memoryInMB}MB RAM`);
     * });
     * ```
     */
    async listVmSizes(location) {
        try {
            const sizes = [];
            // List all VM sizes for the location
            for await (const size of this.client.virtualMachineSizes.list(location)) {
                sizes.push({
                    name: size.name || "Unknown",
                    numberOfCores: size.numberOfCores || 0,
                    memoryInMB: size.memoryInMB || 0,
                    maxDataDiskCount: size.maxDataDiskCount || 0,
                    osDiskSizeInMB: size.osDiskSizeInMB || 0,
                    resourceDiskSizeInMB: size.resourceDiskSizeInMB || 0,
                });
            }
            return sizes;
        }
        catch (error) {
            console.error(`Failed to list VM sizes for location ${location}:`, error);
            throw new Error(`Failed to list VM sizes: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get specific VM size details
     *
     * @param {string} location - Azure region
     * @param {string} sizeName - VM size name (e.g., 'Standard_D2s_v3')
     * @returns {Promise<VmSizeInfo | null>} VM size information or null if not found
     */
    async getVmSize(location, sizeName) {
        try {
            const sizes = await this.listVmSizes(location);
            return sizes.find((s) => s.name === sizeName) || null;
        }
        catch (error) {
            console.error(`Failed to get VM size ${sizeName}:`, error);
            return null;
        }
    }
    /**
     * List VM image publishers in a region
     *
     * @param {string} location - Azure region
     * @returns {Promise<string[]>} Array of publisher names
     */
    async listVmImagePublishers(location) {
        try {
            const publishers = await this.client.virtualMachineImages.listPublishers(location);
            return publishers
                .map((p) => p.name || "Unknown")
                .filter((name) => name !== "Unknown");
        }
        catch (error) {
            console.error(`Failed to list VM image publishers for location ${location}:`, error);
            throw new Error(`Failed to list publishers: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * List VM image offers from a publisher
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name (e.g., 'Canonical')
     * @returns {Promise<string[]>} Array of offer names
     */
    async listVmImageOffers(location, publisherName) {
        try {
            const offers = await this.client.virtualMachineImages.listOffers(location, publisherName);
            return offers
                .map((o) => o.name || "Unknown")
                .filter((name) => name !== "Unknown");
        }
        catch (error) {
            console.error(`Failed to list VM image offers for publisher ${publisherName}:`, error);
            throw new Error(`Failed to list offers: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * List VM image SKUs for an offer
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name
     * @param {string} offer - Offer name
     * @returns {Promise<string[]>} Array of SKU names
     */
    async listVmImageSkus(location, publisherName, offer) {
        try {
            const skus = await this.client.virtualMachineImages.listSkus(location, publisherName, offer);
            return skus
                .map((s) => s.name || "Unknown")
                .filter((name) => name !== "Unknown");
        }
        catch (error) {
            console.error(`Failed to list VM image SKUs for ${publisherName}/${offer}:`, error);
            throw new Error(`Failed to list SKUs: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * List VM image versions for a SKU
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name
     * @param {string} offer - Offer name
     * @param {string} skus - SKU name
     * @returns {Promise<string[]>} Array of version strings
     */
    async listVmImageVersions(location, publisherName, offer, skus) {
        try {
            const versions = await this.client.virtualMachineImages.list(location, publisherName, offer, skus);
            return versions
                .map((v) => v.name || "Unknown")
                .filter((name) => name !== "Unknown");
        }
        catch (error) {
            console.error(`Failed to list VM image versions for ${publisherName}/${offer}/${skus}:`, error);
            throw new Error(`Failed to list versions: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get VM image details
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name
     * @param {string} offer - Offer name
     * @param {string} skus - SKU name
     * @param {string} version - Version string
     * @returns {Promise<VmImageInfo>} VM image information
     */
    async getVmImage(location, publisherName, offer, skus, version) {
        try {
            const image = await this.client.virtualMachineImages.get(location, publisherName, offer, skus, version);
            return {
                publisher: publisherName,
                offer: offer,
                sku: skus,
                version: version,
                location: image.location || location,
            };
        }
        catch (error) {
            console.error(`Failed to get VM image ${publisherName}/${offer}/${skus}/${version}:`, error);
            throw new Error(`Failed to get image: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * List popular VM images (common publishers and offers)
     *
     * Returns a curated list of commonly used VM images.
     *
     * @param {string} location - Azure region
     * @returns {Promise<VmImageInfo[]>} Array of popular VM images
     */
    async listPopularVmImages(location) {
        const popularImages = [
            {
                publisher: "Canonical",
                offer: "0001-com-ubuntu-server-jammy",
                sku: "22_04-lts-gen2",
            },
            {
                publisher: "Canonical",
                offer: "0001-com-ubuntu-server-focal",
                sku: "20_04-lts-gen2",
            },
            { publisher: "RedHat", offer: "RHEL", sku: "9-lvm-gen2" },
            { publisher: "RedHat", offer: "RHEL", sku: "8-lvm-gen2" },
            {
                publisher: "MicrosoftWindowsServer",
                offer: "WindowsServer",
                sku: "2022-datacenter-azure-edition",
            },
            {
                publisher: "MicrosoftWindowsServer",
                offer: "WindowsServer",
                sku: "2019-datacenter-gensecond",
            },
            { publisher: "Debian", offer: "debian-11", sku: "11-gen2" },
            { publisher: "SUSE", offer: "sles-15-sp5", sku: "gen2" },
        ];
        const images = [];
        for (const img of popularImages) {
            try {
                const versions = await this.listVmImageVersions(location, img.publisher, img.offer, img.sku);
                if (versions.length > 0) {
                    images.push({
                        publisher: img.publisher,
                        offer: img.offer,
                        sku: img.sku,
                        version: versions[versions.length - 1], // Latest version
                        location,
                    });
                }
            }
            catch (error) {
                // Skip images that fail (might not be available in the region)
                console.warn(`Skipping ${img.publisher}/${img.offer}/${img.sku} - not available in ${location}`);
            }
        }
        return images;
    }
}
exports.ComputeHelper = ComputeHelper;
