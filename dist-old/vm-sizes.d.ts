/**
 * Comprehensive Azure VM Size Families and Series
 * Source: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview
 */
export interface VmSize {
    name: string;
    family: string;
    series: string;
    vcpus: string;
    memory: string;
    description: string;
    workloads: string[];
    generation: string;
}
export declare const VM_SIZE_FAMILIES: {
    readonly "general-purpose": "General Purpose";
    readonly "compute-optimized": "Compute Optimized";
    readonly "memory-optimized": "Memory Optimized";
    readonly "storage-optimized": "Storage Optimized";
    readonly "gpu-accelerated": "GPU Accelerated";
    readonly hpc: "High Performance Compute";
    readonly confidential: "Confidential Computing";
};
export type VmSizeFamily = keyof typeof VM_SIZE_FAMILIES;
export declare const VM_SIZES: Record<string, VmSize>;
export declare function getVmSizesByFamily(family: VmSizeFamily): VmSize[];
export declare function getVmSize(name: string): VmSize | undefined;
export declare function getAllVmSizeFamilies(): Array<{
    key: VmSizeFamily;
    name: string;
}>;
export declare function searchVmSizes(query: string): VmSize[];
