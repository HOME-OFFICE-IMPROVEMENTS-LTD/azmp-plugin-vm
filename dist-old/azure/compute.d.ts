/**
 * Azure Compute Helper
 *
 * Provides utilities for interacting with Azure Compute resources.
 * Wraps Azure Compute SDK for VM sizes, images, and related operations.
 *
 * @module azure/compute
 */
import { TokenCredential } from "@azure/identity";
/**
 * VM Size Information
 */
export interface VmSizeInfo {
    name: string;
    numberOfCores: number;
    memoryInMB: number;
    maxDataDiskCount: number;
    osDiskSizeInMB: number;
    resourceDiskSizeInMB: number;
}
/**
 * VM Image Information
 */
export interface VmImageInfo {
    publisher: string;
    offer: string;
    sku: string;
    version: string;
    location: string;
}
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
export declare class ComputeHelper {
    private client;
    private subscriptionId;
    /**
     * Create ComputeHelper instance
     *
     * @param {TokenCredential} credential - Azure credential
     * @param {string} subscriptionId - Azure subscription ID
     */
    constructor(credential: TokenCredential, subscriptionId: string);
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
    listVmSizes(location: string): Promise<VmSizeInfo[]>;
    /**
     * Get specific VM size details
     *
     * @param {string} location - Azure region
     * @param {string} sizeName - VM size name (e.g., 'Standard_D2s_v3')
     * @returns {Promise<VmSizeInfo | null>} VM size information or null if not found
     */
    getVmSize(location: string, sizeName: string): Promise<VmSizeInfo | null>;
    /**
     * List VM image publishers in a region
     *
     * @param {string} location - Azure region
     * @returns {Promise<string[]>} Array of publisher names
     */
    listVmImagePublishers(location: string): Promise<string[]>;
    /**
     * List VM image offers from a publisher
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name (e.g., 'Canonical')
     * @returns {Promise<string[]>} Array of offer names
     */
    listVmImageOffers(location: string, publisherName: string): Promise<string[]>;
    /**
     * List VM image SKUs for an offer
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name
     * @param {string} offer - Offer name
     * @returns {Promise<string[]>} Array of SKU names
     */
    listVmImageSkus(location: string, publisherName: string, offer: string): Promise<string[]>;
    /**
     * List VM image versions for a SKU
     *
     * @param {string} location - Azure region
     * @param {string} publisherName - Publisher name
     * @param {string} offer - Offer name
     * @param {string} skus - SKU name
     * @returns {Promise<string[]>} Array of version strings
     */
    listVmImageVersions(location: string, publisherName: string, offer: string, skus: string): Promise<string[]>;
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
    getVmImage(location: string, publisherName: string, offer: string, skus: string, version: string): Promise<VmImageInfo>;
    /**
     * List popular VM images (common publishers and offers)
     *
     * Returns a curated list of commonly used VM images.
     *
     * @param {string} location - Azure region
     * @returns {Promise<VmImageInfo[]>} Array of popular VM images
     */
    listPopularVmImages(location: string): Promise<VmImageInfo[]>;
}
