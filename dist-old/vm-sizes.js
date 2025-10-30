"use strict";
/**
 * Comprehensive Azure VM Size Families and Series
 * Source: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM_SIZES = exports.VM_SIZE_FAMILIES = void 0;
exports.getVmSizesByFamily = getVmSizesByFamily;
exports.getVmSize = getVmSize;
exports.getAllVmSizeFamilies = getAllVmSizeFamilies;
exports.searchVmSizes = searchVmSizes;
exports.VM_SIZE_FAMILIES = {
    "general-purpose": "General Purpose",
    "compute-optimized": "Compute Optimized",
    "memory-optimized": "Memory Optimized",
    "storage-optimized": "Storage Optimized",
    "gpu-accelerated": "GPU Accelerated",
    hpc: "High Performance Compute",
    confidential: "Confidential Computing",
};
exports.VM_SIZES = {
    // General Purpose - B-series (Burstable)
    Standard_B1s: {
        name: "Standard_B1s",
        family: "general-purpose",
        series: "B-series",
        vcpus: "1",
        memory: "1 GiB",
        description: "Burstable, cost-effective for low-traffic workloads",
        workloads: ["Dev/Test", "Small databases", "Low-traffic web servers"],
        generation: "v1",
    },
    Standard_B2s: {
        name: "Standard_B2s",
        family: "general-purpose",
        series: "B-series",
        vcpus: "2",
        memory: "4 GiB",
        description: "Burstable, balanced compute and memory",
        workloads: ["Dev/Test", "Small databases", "Build servers"],
        generation: "v1",
    },
    Standard_B4ms: {
        name: "Standard_B4ms",
        family: "general-purpose",
        series: "B-series",
        vcpus: "4",
        memory: "16 GiB",
        description: "Burstable, higher memory for moderate workloads",
        workloads: ["Medium databases", "Web servers", "Application servers"],
        generation: "v1",
    },
    // General Purpose - D-series v5
    Standard_D2s_v5: {
        name: "Standard_D2s_v5",
        family: "general-purpose",
        series: "Dsv5-series",
        vcpus: "2",
        memory: "8 GiB",
        description: "Intel Ice Lake processors, premium storage",
        workloads: ["General-purpose computing", "Web servers", "Small databases"],
        generation: "v5",
    },
    Standard_D4s_v5: {
        name: "Standard_D4s_v5",
        family: "general-purpose",
        series: "Dsv5-series",
        vcpus: "4",
        memory: "16 GiB",
        description: "Intel Ice Lake processors, premium storage",
        workloads: ["Application servers", "Medium databases", "Caching"],
        generation: "v5",
    },
    Standard_D8s_v5: {
        name: "Standard_D8s_v5",
        family: "general-purpose",
        series: "Dsv5-series",
        vcpus: "8",
        memory: "32 GiB",
        description: "Intel Ice Lake processors, premium storage",
        workloads: ["Enterprise applications", "Large databases", "Analytics"],
        generation: "v5",
    },
    Standard_D16s_v5: {
        name: "Standard_D16s_v5",
        family: "general-purpose",
        series: "Dsv5-series",
        vcpus: "16",
        memory: "64 GiB",
        description: "Intel Ice Lake processors, premium storage",
        workloads: ["Large applications", "In-memory databases", "Analytics"],
        generation: "v5",
    },
    // General Purpose - D-series v3
    Standard_D2s_v3: {
        name: "Standard_D2s_v3",
        family: "general-purpose",
        series: "Dsv3-series",
        vcpus: "2",
        memory: "8 GiB",
        description: "Broadwell/Skylake processors, premium storage",
        workloads: ["General-purpose computing", "Web servers", "Dev/Test"],
        generation: "v3",
    },
    Standard_D4s_v3: {
        name: "Standard_D4s_v3",
        family: "general-purpose",
        series: "Dsv3-series",
        vcpus: "4",
        memory: "16 GiB",
        description: "Broadwell/Skylake processors, premium storage",
        workloads: ["Application servers", "Medium databases"],
        generation: "v3",
    },
    // Compute Optimized - F-series v2
    Standard_F2s_v2: {
        name: "Standard_F2s_v2",
        family: "compute-optimized",
        series: "Fsv2-series",
        vcpus: "2",
        memory: "4 GiB",
        description: "High CPU-to-memory ratio, Intel Skylake processors",
        workloads: ["Batch processing", "Web servers", "Analytics"],
        generation: "v2",
    },
    Standard_F4s_v2: {
        name: "Standard_F4s_v2",
        family: "compute-optimized",
        series: "Fsv2-series",
        vcpus: "4",
        memory: "8 GiB",
        description: "High CPU-to-memory ratio, compute-intensive workloads",
        workloads: ["Batch processing", "Gaming servers", "Machine learning"],
        generation: "v2",
    },
    Standard_F8s_v2: {
        name: "Standard_F8s_v2",
        family: "compute-optimized",
        series: "Fsv2-series",
        vcpus: "8",
        memory: "16 GiB",
        description: "High CPU-to-memory ratio, heavy compute workloads",
        workloads: ["Scientific modeling", "Gaming servers", "Rendering"],
        generation: "v2",
    },
    Standard_F16s_v2: {
        name: "Standard_F16s_v2",
        family: "compute-optimized",
        series: "Fsv2-series",
        vcpus: "16",
        memory: "32 GiB",
        description: "High CPU-to-memory ratio, parallel processing",
        workloads: ["HPC", "Video encoding", "Complex simulations"],
        generation: "v2",
    },
    // Memory Optimized - E-series v5
    Standard_E2s_v5: {
        name: "Standard_E2s_v5",
        family: "memory-optimized",
        series: "Esv5-series",
        vcpus: "2",
        memory: "16 GiB",
        description: "High memory-to-CPU ratio, Intel Ice Lake",
        workloads: ["Relational databases", "In-memory caches", "Analytics"],
        generation: "v5",
    },
    Standard_E4s_v5: {
        name: "Standard_E4s_v5",
        family: "memory-optimized",
        series: "Esv5-series",
        vcpus: "4",
        memory: "32 GiB",
        description: "High memory-to-CPU ratio, memory-intensive workloads",
        workloads: ["Large databases", "SAP HANA", "Big data analytics"],
        generation: "v5",
    },
    Standard_E8s_v5: {
        name: "Standard_E8s_v5",
        family: "memory-optimized",
        series: "Esv5-series",
        vcpus: "8",
        memory: "64 GiB",
        description: "High memory-to-CPU ratio, enterprise databases",
        workloads: ["SQL Server", "SAP HANA", "In-memory databases"],
        generation: "v5",
    },
    Standard_E16s_v5: {
        name: "Standard_E16s_v5",
        family: "memory-optimized",
        series: "Esv5-series",
        vcpus: "16",
        memory: "128 GiB",
        description: "High memory-to-CPU ratio, large databases",
        workloads: ["Large SQL Server", "SAP HANA", "Data warehousing"],
        generation: "v5",
    },
    Standard_E32s_v5: {
        name: "Standard_E32s_v5",
        family: "memory-optimized",
        series: "Esv5-series",
        vcpus: "32",
        memory: "256 GiB",
        description: "High memory-to-CPU ratio, very large databases",
        workloads: ["Enterprise databases", "In-memory analytics", "SAP HANA"],
        generation: "v5",
    },
    // Memory Optimized - E-series v3
    Standard_E2s_v3: {
        name: "Standard_E2s_v3",
        family: "memory-optimized",
        series: "Esv3-series",
        vcpus: "2",
        memory: "16 GiB",
        description: "High memory-to-CPU ratio, Broadwell/Skylake",
        workloads: ["Relational databases", "In-memory caches"],
        generation: "v3",
    },
    Standard_E4s_v3: {
        name: "Standard_E4s_v3",
        family: "memory-optimized",
        series: "Esv3-series",
        vcpus: "4",
        memory: "32 GiB",
        description: "High memory-to-CPU ratio, memory-intensive apps",
        workloads: ["Medium databases", "Analytics", "Caching"],
        generation: "v3",
    },
    // Storage Optimized - L-series v2
    Standard_L8s_v2: {
        name: "Standard_L8s_v2",
        family: "storage-optimized",
        series: "Lsv2-series",
        vcpus: "8",
        memory: "64 GiB",
        description: "High disk throughput and IO, local NVMe storage",
        workloads: ["NoSQL databases", "Data warehousing", "Log processing"],
        generation: "v2",
    },
    Standard_L16s_v2: {
        name: "Standard_L16s_v2",
        family: "storage-optimized",
        series: "Lsv2-series",
        vcpus: "16",
        memory: "128 GiB",
        description: "High disk throughput and IO, large local NVMe",
        workloads: ["Cassandra", "MongoDB", "Big data analytics"],
        generation: "v2",
    },
    Standard_L32s_v2: {
        name: "Standard_L32s_v2",
        family: "storage-optimized",
        series: "Lsv2-series",
        vcpus: "32",
        memory: "256 GiB",
        description: "Very high disk throughput, massive local NVMe",
        workloads: ["Large NoSQL", "Data lakes", "Real-time analytics"],
        generation: "v2",
    },
    // GPU Optimized - NC-series (NVIDIA Tesla)
    Standard_NC6s_v3: {
        name: "Standard_NC6s_v3",
        family: "gpu-accelerated",
        series: "NCv3-series",
        vcpus: "6",
        memory: "112 GiB",
        description: "NVIDIA Tesla V100, AI and deep learning",
        workloads: ["Deep learning", "AI training", "HPC"],
        generation: "v3",
    },
    Standard_NC12s_v3: {
        name: "Standard_NC12s_v3",
        family: "gpu-accelerated",
        series: "NCv3-series",
        vcpus: "12",
        memory: "224 GiB",
        description: "NVIDIA Tesla V100, AI and deep learning",
        workloads: ["Deep learning", "AI training", "Scientific computing"],
        generation: "v3",
    },
    Standard_NC24s_v3: {
        name: "Standard_NC24s_v3",
        family: "gpu-accelerated",
        series: "NCv3-series",
        vcpus: "24",
        memory: "448 GiB",
        description: "NVIDIA Tesla V100, large-scale AI training",
        workloads: ["Large AI models", "Deep learning", "HPC"],
        generation: "v3",
    },
    // GPU Optimized - NV-series (NVIDIA Tesla for visualization)
    Standard_NV6: {
        name: "Standard_NV6",
        family: "gpu-accelerated",
        series: "NV-series",
        vcpus: "6",
        memory: "56 GiB",
        description: "NVIDIA Tesla M60, remote visualization and VDI",
        workloads: ["Virtual desktops", "CAD", "Video streaming"],
        generation: "v1",
    },
    Standard_NV12: {
        name: "Standard_NV12",
        family: "gpu-accelerated",
        series: "NV-series",
        vcpus: "12",
        memory: "112 GiB",
        description: "NVIDIA Tesla M60, graphics-intensive applications",
        workloads: ["3D rendering", "Video encoding", "VDI"],
        generation: "v1",
    },
    // HPC - H-series
    Standard_H8: {
        name: "Standard_H8",
        family: "hpc",
        series: "H-series",
        vcpus: "8",
        memory: "56 GiB",
        description: "High performance computing, InfiniBand",
        workloads: ["HPC", "Computational fluid dynamics", "Simulations"],
        generation: "v1",
    },
    Standard_H16: {
        name: "Standard_H16",
        family: "hpc",
        series: "H-series",
        vcpus: "16",
        memory: "112 GiB",
        description: "High performance computing, large simulations",
        workloads: ["HPC", "Molecular modeling", "Weather forecasting"],
        generation: "v1",
    },
    // Confidential Computing - DC-series
    Standard_DC2s_v2: {
        name: "Standard_DC2s_v2",
        family: "confidential",
        series: "DCsv2-series",
        vcpus: "2",
        memory: "8 GiB",
        description: "Intel SGX, hardware-based encryption for sensitive data",
        workloads: ["Confidential computing", "Secure enclaves", "PII processing"],
        generation: "v2",
    },
    Standard_DC4s_v2: {
        name: "Standard_DC4s_v2",
        family: "confidential",
        series: "DCsv2-series",
        vcpus: "4",
        memory: "16 GiB",
        description: "Intel SGX, protected data processing",
        workloads: ["Healthcare data", "Financial services", "Blockchain"],
        generation: "v2",
    },
};
function getVmSizesByFamily(family) {
    return Object.values(exports.VM_SIZES).filter((size) => size.family === family);
}
function getVmSize(name) {
    return exports.VM_SIZES[name];
}
function getAllVmSizeFamilies() {
    return Object.entries(exports.VM_SIZE_FAMILIES).map(([key, name]) => ({
        key: key,
        name,
    }));
}
function searchVmSizes(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(exports.VM_SIZES).filter((size) => size.name.toLowerCase().includes(lowerQuery) ||
        size.description.toLowerCase().includes(lowerQuery) ||
        size.workloads.some((w) => w.toLowerCase().includes(lowerQuery)));
}
