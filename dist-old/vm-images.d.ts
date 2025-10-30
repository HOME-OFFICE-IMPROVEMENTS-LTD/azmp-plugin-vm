/**
 * Azure VM Image References
 * Source: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/cli-ps-findimage
 */
export interface VmImageReference {
    publisher: string;
    offer: string;
    sku: string;
    version: string;
    os: "Windows" | "Linux";
    description: string;
}
export declare const VM_IMAGES: Record<string, VmImageReference>;
export declare function getVmImage(key: string): VmImageReference | undefined;
export declare function getAllVmImages(): Array<{
    key: string;
    image: VmImageReference;
}>;
export declare function getVmImagesByOS(os: "Windows" | "Linux"): Array<{
    key: string;
    image: VmImageReference;
}>;
export declare function searchVmImages(query: string): Array<{
    key: string;
    image: VmImageReference;
}>;
