/**
 * Autoscale Recommendation Engine for Azure Virtual Machine Scale Sets
 *
 * Provides intelligent autoscaling recommendations including:
 * - VMSS autoscale rule generation
 * - Performance-based scaling triggers
 * - Predictive scaling recommendations
 * - Load pattern analysis
 * - Cost-aware scaling strategies
 */
export interface AutoscaleRule {
    name: string;
    metricName: string;
    metricResourceUri?: string;
    timeGrain: string;
    statistic: "Average" | "Maximum" | "Minimum" | "Total";
    timeWindow: string;
    operator: "GreaterThan" | "LessThan" | "GreaterThanOrEqual" | "LessThanOrEqual";
    threshold: number;
    direction: "Increase" | "Decrease";
    type: "ChangeCount" | "PercentChangeCount" | "ExactCount";
    value: number;
    cooldown: string;
}
export interface AutoscaleProfile {
    name: string;
    capacity: {
        minimum: number;
        maximum: number;
        default: number;
    };
    rules: AutoscaleRule[];
    fixedDate?: {
        timeZone: string;
        start: string;
        end: string;
    };
    recurrence?: {
        frequency: "Week" | "Month";
        schedule: {
            timeZone: string;
            days: string[];
            hours: number[];
            minutes: number[];
        };
    };
}
export interface AutoscaleConfiguration {
    name: string;
    targetResourceUri: string;
    enabled: boolean;
    profiles: AutoscaleProfile[];
    notifications?: AutoscaleNotification[];
    predictiveAutoscalePolicy?: {
        scaleMode: "Enabled" | "ForecastOnly" | "Disabled";
        scaleLookAheadTime?: string;
    };
}
export interface AutoscaleNotification {
    operation: "Scale";
    email?: {
        sendToSubscriptionAdministrator: boolean;
        sendToSubscriptionCoAdministrators: boolean;
        customEmails: string[];
    };
    webhooks?: Array<{
        serviceUri: string;
        properties?: Record<string, string>;
    }>;
}
export interface LoadPattern {
    patternType: "steady" | "periodic" | "spiky" | "unpredictable";
    confidence: number;
    characteristics: {
        averageLoad: number;
        peakLoad: number;
        baselineLoad: number;
        variability: number;
    };
    periodicityAnalysis?: {
        hasDailyPattern: boolean;
        hasWeeklyPattern: boolean;
        peakHours: number[];
        peakDays: string[];
    };
    scalingRecommendations: {
        recommendedMinInstances: number;
        recommendedMaxInstances: number;
        aggressiveScaling: boolean;
        predictiveScaling: boolean;
    };
}
export interface ScalingSimulation {
    scenario: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    events: Array<{
        timestamp: Date;
        action: "scale-out" | "scale-in";
        fromInstances: number;
        toInstances: number;
        trigger: string;
        cost: number;
    }>;
    summary: {
        totalScaleEvents: number;
        averageInstances: number;
        maxInstances: number;
        totalCost: number;
        performanceScore: number;
        efficiencyScore: number;
    };
}
export interface PredictiveScalingRecommendation {
    recommendedAction: "enable" | "optimize" | "disable";
    confidence: number;
    reasoning: string;
    benefits: string[];
    risks: string[];
    configuration: {
        scaleMode: "Enabled" | "ForecastOnly";
        lookAheadTime: string;
        minimumBufferTime: string;
    };
    expectedImprovements: {
        responsiveness: string;
        costOptimization: string;
        availabilityImpact: string;
    };
}
/**
 * Autoscale Engine class providing intelligent VMSS scaling recommendations
 */
export declare class AutoscaleEngine {
    /**
     * Generate autoscale configuration for a VMSS based on workload patterns
     */
    static generateAutoscaleConfiguration(vmssResourceUri: string, loadPattern: LoadPattern, options?: {
        enablePredictive?: boolean;
        costOptimized?: boolean;
        performanceOptimized?: boolean;
        notificationEmails?: string[];
    }): AutoscaleConfiguration;
    /**
     * Analyze load patterns from historical metrics
     */
    static analyzeLoadPattern(metrics: Array<{
        timestamp: Date;
        cpuPercent: number;
        memoryPercent: number;
        requestCount?: number;
        responseTime?: number;
    }>): LoadPattern;
    /**
     * Generate predictive scaling recommendations
     */
    static generatePredictiveScalingRecommendation(loadPattern: LoadPattern, currentConfig?: AutoscaleConfiguration): PredictiveScalingRecommendation;
    /**
     * Simulate scaling events based on historical data
     */
    static simulateScaling(metrics: Array<{
        timestamp: Date;
        cpuPercent: number;
        instances: number;
    }>, autoscaleConfig: AutoscaleConfiguration, vmSize?: string): ScalingSimulation;
    /**
     * Generate optimized autoscale rules based on workload characteristics
     */
    static generateOptimizedRules(loadPattern: LoadPattern, costOptimized?: boolean): AutoscaleRule[];
    private static generateAutoscaleProfiles;
    private static createNotifications;
    private static extractVmssName;
    private static calculatePercentile;
    private static calculateCoefficientOfVariation;
    private static determinePatternType;
    private static hasPeriodicPattern;
    private static groupByHour;
    private static analyzePeriodicPatterns;
    private static analyzeHourlyPattern;
    private static analyzeDailyPattern;
    private static generateScalingRecommendations;
    private static calculatePatternConfidence;
    private static shouldEnablePredictiveScaling;
    private static calculatePredictiveConfidence;
    private static optimizeLookAheadTime;
    private static getVmHourlyCost;
    private static evaluateScalingDecision;
    private static calculatePerformanceScore;
    private static calculateEfficiencyScore;
    private static calculateScaleOutThreshold;
    private static calculateScaleInThreshold;
    private static createPeakHoursProfile;
    private static createWeekendProfile;
}
