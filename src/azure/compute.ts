/**
 * Azure Compute Helper
 *
 * Provides utilities for interacting with Azure Compute resources.
 * Wraps Azure Compute SDK for VM sizes, images, and related operations.
 *
 * @module azure/compute
 */

import {
  ComputeManagementClient,
  VirtualMachineSize,
  VirtualMachineImageResource,
} from "@azure/arm-compute";
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
export class ComputeHelper {
  private client: ComputeManagementClient;
  private subscriptionId: string;

  /**
   * Create ComputeHelper instance
   *
   * @param {TokenCredential} credential - Azure credential
   * @param {string} subscriptionId - Azure subscription ID
   */
  constructor(credential: TokenCredential, subscriptionId: string) {
    this.client = new ComputeManagementClient(credential, subscriptionId);
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
  public async listVmSizes(location: string): Promise<VmSizeInfo[]> {
    try {
      const sizes: VmSizeInfo[] = [];

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
    } catch (error) {
      console.error(`Failed to list VM sizes for location ${location}:`, error);
      throw new Error(
        `Failed to list VM sizes: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get specific VM size details
   *
   * @param {string} location - Azure region
   * @param {string} sizeName - VM size name (e.g., 'Standard_D2s_v3')
   * @returns {Promise<VmSizeInfo | null>} VM size information or null if not found
   */
  public async getVmSize(
    location: string,
    sizeName: string,
  ): Promise<VmSizeInfo | null> {
    try {
      const sizes = await this.listVmSizes(location);
      return sizes.find((s) => s.name === sizeName) || null;
    } catch (error) {
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
  public async listVmImagePublishers(location: string): Promise<string[]> {
    try {
      const publishers =
        await this.client.virtualMachineImages.listPublishers(location);
      return publishers
        .map((p) => p.name || "Unknown")
        .filter((name) => name !== "Unknown");
    } catch (error) {
      console.error(
        `Failed to list VM image publishers for location ${location}:`,
        error,
      );
      throw new Error(
        `Failed to list publishers: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * List VM image offers from a publisher
   *
   * @param {string} location - Azure region
   * @param {string} publisherName - Publisher name (e.g., 'Canonical')
   * @returns {Promise<string[]>} Array of offer names
   */
  public async listVmImageOffers(
    location: string,
    publisherName: string,
  ): Promise<string[]> {
    try {
      const offers = await this.client.virtualMachineImages.listOffers(
        location,
        publisherName,
      );
      return offers
        .map((o) => o.name || "Unknown")
        .filter((name) => name !== "Unknown");
    } catch (error) {
      console.error(
        `Failed to list VM image offers for publisher ${publisherName}:`,
        error,
      );
      throw new Error(
        `Failed to list offers: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
  public async listVmImageSkus(
    location: string,
    publisherName: string,
    offer: string,
  ): Promise<string[]> {
    try {
      const skus = await this.client.virtualMachineImages.listSkus(
        location,
        publisherName,
        offer,
      );
      return skus
        .map((s) => s.name || "Unknown")
        .filter((name) => name !== "Unknown");
    } catch (error) {
      console.error(
        `Failed to list VM image SKUs for ${publisherName}/${offer}:`,
        error,
      );
      throw new Error(
        `Failed to list SKUs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
  public async listVmImageVersions(
    location: string,
    publisherName: string,
    offer: string,
    skus: string,
  ): Promise<string[]> {
    try {
      const versions = await this.client.virtualMachineImages.list(
        location,
        publisherName,
        offer,
        skus,
      );
      return versions
        .map((v) => v.name || "Unknown")
        .filter((name) => name !== "Unknown");
    } catch (error) {
      console.error(
        `Failed to list VM image versions for ${publisherName}/${offer}/${skus}:`,
        error,
      );
      throw new Error(
        `Failed to list versions: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
  public async getVmImage(
    location: string,
    publisherName: string,
    offer: string,
    skus: string,
    version: string,
  ): Promise<VmImageInfo> {
    try {
      const image = await this.client.virtualMachineImages.get(
        location,
        publisherName,
        offer,
        skus,
        version,
      );

      return {
        publisher: publisherName,
        offer: offer,
        sku: skus,
        version: version,
        location: image.location || location,
      };
    } catch (error) {
      console.error(
        `Failed to get VM image ${publisherName}/${offer}/${skus}/${version}:`,
        error,
      );
      throw new Error(
        `Failed to get image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
  public async listPopularVmImages(location: string): Promise<VmImageInfo[]> {
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

    const images: VmImageInfo[] = [];

    for (const img of popularImages) {
      try {
        const versions = await this.listVmImageVersions(
          location,
          img.publisher,
          img.offer,
          img.sku,
        );
        if (versions.length > 0) {
          images.push({
            publisher: img.publisher,
            offer: img.offer,
            sku: img.sku,
            version: versions[versions.length - 1], // Latest version
            location,
          });
        }
      } catch (error) {
        // Skip images that fail (might not be available in the region)
        console.warn(
          `Skipping ${img.publisher}/${img.offer}/${img.sku} - not available in ${location}`,
        );
      }
    }

    return images;
  }
}
