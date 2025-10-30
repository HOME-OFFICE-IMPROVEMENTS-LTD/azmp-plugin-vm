/**
 * Performance Analyzer for Azure Virtual Machines
 *
 * Provides comprehensive performance analysis including:
 * - CPU and memory burst analysis
 * - Disk performance tiering recommendations
 * - Network performance analysis
 * - Performance baseline establishment
 * - Resource utilization optimization
 */
export interface PerformanceMetrics {
    cpu: {
        average: number;
        peak: number;
        p95: number;
        burstCapable: boolean;
        burstCredits?: number;
    };
    memory: {
        average: number;
        peak: number;
        p95: number;
        available: number;
    };
    disk: {
        readIops: number;
        writeIops: number;
        readThroughput: number;
        writeThroughput: number;
        latency: number;
        queueDepth: number;
    };
    network: {
        inbound: number;
        outbound: number;
        connections: number;
        packetsPerSecond: number;
    };
}
export interface VmSizeSpecs {
    vmSize: string;
    vCpus: number;
    memoryGb: number;
    maxDataDisks: number;
    maxIops: number;
    maxThroughput: number;
    networkBandwidth: number;
    burstSupported: boolean;
    burstIops?: number;
    burstThroughput?: number;
    premiumStorageSupported: boolean;
}
export interface PerformanceAnalysis {
    vmSize: string;
    analysisDate: Date;
    overallScore: number;
    recommendations: PerformanceRecommendation[];
    metrics: PerformanceMetrics;
    utilizationAnalysis: {
        cpuUtilization: "optimal" | "underutilized" | "overutilized";
        memoryUtilization: "optimal" | "underutilized" | "overutilized";
        diskUtilization: "optimal" | "underutilized" | "overutilized";
        networkUtilization: "optimal" | "underutilized" | "overutilized";
    };
    bottlenecks: PerformanceBottleneck[];
    optimizationOpportunities: OptimizationOpportunity[];
}
export interface PerformanceRecommendation {
    type: "rightsizing" | "disk-tier" | "autoscale" | "burst-config" | "network-optimization";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    expectedImprovement: string;
    estimatedCostImpact: "increase" | "decrease" | "neutral";
    implementationComplexity: "low" | "medium" | "high";
    actionItems: string[];
}
export interface PerformanceBottleneck {
    resource: "cpu" | "memory" | "disk" | "network";
    severity: "critical" | "warning" | "info";
    description: string;
    impact: string;
    suggestedActions: string[];
}
export interface OptimizationOpportunity {
    category: "performance" | "cost" | "reliability";
    title: string;
    description: string;
    potentialBenefit: string;
    effort: "low" | "medium" | "high";
    timeframe: "immediate" | "short-term" | "long-term";
}
export interface BurstAnalysis {
    vmSize: string;
    supportsBurst: boolean;
    burstConfiguration: {
        basePerformance: number;
        burstPerformance: number;
        creditBalance: number;
        creditConsumptionRate: number;
        sustainabilityMinutes: number;
    };
    recommendations: {
        enableBurst: boolean;
        migrateToBurstCapable: boolean;
        targetVmSize?: string;
        reasoning: string;
    };
    workloadSuitability: "excellent" | "good" | "fair" | "poor";
}
export interface DiskPerformanceAnalysis {
    currentTier: "Standard_HDD" | "Standard_SSD" | "Premium_SSD" | "Ultra_SSD";
    recommendations: {
        recommendedTier: string;
        reasoning: string;
        performanceGain: string;
        costImpact: string;
    };
    iopsAnalysis: {
        current: number;
        available: number;
        recommended: number;
        utilizationPercent: number;
    };
    throughputAnalysis: {
        current: number;
        available: number;
        recommended: number;
        utilizationPercent: number;
    };
}
/**
 * Performance Analyzer class providing comprehensive VM performance analysis
 */
export declare class PerformanceAnalyzer {
    private static readonly VM_SPECS;
    /**
     * Analyze VM performance and provide comprehensive recommendations
     */
    static analyzePerformance(vmSize: string, metrics: PerformanceMetrics): PerformanceAnalysis;
    /**
     * Perform CPU and memory burst analysis
     */
    static analyzeBurstCapability(vmSize: string, metrics: PerformanceMetrics): BurstAnalysis;
    /**
     * Analyze disk performance and recommend optimal disk tier
     */
    static analyzeDiskPerformance(currentTier: string, metrics: PerformanceMetrics, vmSize: string): DiskPerformanceAnalysis;
    /**
     * Get performance baseline for a VM size
     */
    static getPerformanceBaseline(vmSize: string): VmSizeSpecs;
    /**
     * Compare performance across multiple VM sizes
     */
    static compareVmPerformance(vmSizes: string[], workloadProfile: "cpu-intensive" | "memory-intensive" | "io-intensive" | "balanced"): Array<{
        vmSize: string;
        specs: VmSizeSpecs;
        suitabilityScore: number;
        pros: string[];
        cons: string[];
    }>;
    private static calculatePerformanceScore;
    private static analyzeResourceUtilization;
    private static identifyBottlenecks;
    private static generateRecommendations;
    private static findOptimizationOpportunities;
    private static shouldMigrateToBurstCapable;
    private static recommendBurstCapableSize;
    private static calculateBurstCredits;
    private static calculateCreditConsumption;
    private static shouldEnableBurst;
    private static getBurstRecommendationReasoning;
    private static assessBurstWorkloadSuitability;
    private static recommendDiskTier;
    private static getDiskTierReasoning;
    private static calculateDiskPerformanceGain;
    private static calculateDiskCostImpact;
    private static getRecommendedIops;
    private static getRecommendedThroughput;
    private static calculateWorkloadSuitability;
    private static getVmSizeProsAndCons;
}
