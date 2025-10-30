/**
 * Recommendation engine for Cost Optimization features.
 * Builds on top of CostAnalyzer utilities to provide actionable guidance.
 */
import { VmCostBreakdown } from "./analyzer";
export interface RightSizingParams {
    currentSize: string;
    region?: string;
    avgCpuPercent: number;
    avgMemoryPercent: number;
    avgDiskPercent?: number;
    osType?: "linux" | "windows";
    hoursPerMonth?: number;
}
export interface RightSizingRecommendation {
    recommendedSize: string;
    currentMonthlyCost: number;
    recommendedMonthlyCost: number;
    monthlySavings: number;
    annualSavings: number;
    confidence: "high" | "medium" | "low";
    rationale: string;
}
export interface IdleResourceInsight {
    isIdle: boolean;
    utilizationScore: number;
    message: string;
    suggestedAction: string;
}
export interface ReservedInstanceOpportunity {
    isWorthConsidering: boolean;
    estimatedSavingsPercent: number;
    message: string;
}
export interface SpotInstanceOpportunity {
    isCandidate: boolean;
    savingsPercent: number;
    message: string;
}
/**
 * Engine that produces optimization recommendations.
 */
export declare class CostRecommendationEngine {
    /**
     * Evaluate utilization metrics and recommend a smaller VM size if appropriate.
     */
    static getRightSizingRecommendation(params: RightSizingParams): RightSizingRecommendation | null;
    /**
     * Identify idle resources based on utilization metrics.
     */
    static detectIdleResource(params: RightSizingParams): IdleResourceInsight;
    /**
     * Determine if Reserved Instances should be evaluated.
     */
    static evaluateReservedInstanceOpportunity(currentCost: VmCostBreakdown, reservedCost: VmCostBreakdown): ReservedInstanceOpportunity;
    /**
     * Assess whether a workload is a good candidate for Spot instances.
     */
    static evaluateSpotInstanceOpportunity(paygCost: VmCostBreakdown, spotCost: VmCostBreakdown): SpotInstanceOpportunity;
    private static resolveCandidateSize;
    private static determineConfidence;
    private static buildRationale;
}
