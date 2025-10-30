/**
 * Cost analysis utilities for the Azure VM plugin.
 * Provides static pricing data and calculation helpers that power
 * CLI commands, Handlebars helpers, and higher level recommendations.
 */
export type VmPricingModel = "payg" | "reserved1year" | "reserved3year" | "spot";
export interface VmCostOptions {
    vmSize: string;
    region?: string;
    hours?: number;
    pricingModel?: VmPricingModel;
    osType?: "linux" | "windows";
    applyHybridBenefit?: boolean;
}
export interface VmCostBreakdown {
    hourlyCost: number;
    monthlyCost: number;
    currency: string;
    pricingModel: VmPricingModel;
    hours: number;
    details: {
        baseHourly: number;
        windowsPremiumHourly?: number;
        appliedHybridBenefit: boolean;
        effectiveHourly: number;
    };
}
export interface VmCostComparison {
    vmSize: string;
    pricingModel: VmPricingModel;
    hourlyCost: number;
    monthlyCost: number;
    currency: string;
}
export interface ReservedInstanceSavings {
    vmSize: string;
    region: string;
    term: "1year" | "3year";
    paygCost: number;
    reservedCost: number;
    savings: number;
    savingsPercent: number;
    currency: string;
}
export interface SpotInstanceSavings {
    vmSize: string;
    region: string;
    paygCost: number;
    spotCost: number;
    savings: number;
    savingsPercent: number;
    currency: string;
}
export interface StorageCostResult {
    diskType: string;
    sizeGb: number;
    monthlyCost: number;
    costPerGb: number;
    currency: string;
}
export interface HybridBenefitSavings {
    vmSize: string;
    region: string;
    withoutHybridBenefit: number;
    withHybridBenefit: number;
    savings: number;
    savingsPercent: number;
    currency: string;
}
export interface CostForecastPoint {
    month: number;
    projectedCost: number;
}
interface VmPricingEntry {
    payg: number;
    reserved1Year: number;
    reserved3Year: number;
    spot: number;
    windowsPremium?: number;
}
interface StoragePricingEntry {
    displayName: string;
    costPerGb: number;
}
/**
 * Utility helpers for cost calculations.
 */
export declare class CostAnalyzer {
    /**
     * Calculate VM cost based on pricing model, hours, and OS type.
     */
    static calculateVmCost(options: VmCostOptions): VmCostBreakdown;
    /**
     * Compare VM costs for a set of sizes.
     */
    static compareVmSizes(sizes: string[], region: string, options?: Partial<Omit<VmCostOptions, "vmSize" | "region">>): VmCostComparison[];
    /**
     * Calculate savings for Reserved Instances compared to PAYG.
     */
    static calculateReservedInstanceSavings(vmSize: string, region: string, term: "1year" | "3year", options?: {
        osType?: "linux" | "windows";
        hours?: number;
    }): ReservedInstanceSavings;
    /**
     * Estimate savings for Spot instances compared to PAYG.
     */
    static calculateSpotInstanceSavings(vmSize: string, region: string, options?: {
        hours?: number;
        osType?: "linux" | "windows";
    }): SpotInstanceSavings;
    /**
     * Calculate storage cost for a disk type/size.
     */
    static calculateStorageCost(diskType: string, sizeGb: number): StorageCostResult;
    /**
     * Estimate Azure Hybrid Benefit savings for Windows workloads.
     */
    static calculateHybridBenefitSavings(vmSize: string, region: string, hours?: number): HybridBenefitSavings;
    /**
     * Produce a simple cost forecast using a compound growth rate.
     */
    static forecastCosts(currentMonthlyCost: number, growthRate: number, months: number): CostForecastPoint[];
    private static getVmPricing;
    private static getHourlyRate;
}
export declare const vmPricingData: Record<string, Record<string, VmPricingEntry>>;
export declare const storagePricingData: Record<string, StoragePricingEntry>;
export {};
