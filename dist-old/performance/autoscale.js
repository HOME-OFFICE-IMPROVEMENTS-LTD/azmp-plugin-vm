"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoscaleEngine = void 0;
/**
 * Autoscale Engine class providing intelligent VMSS scaling recommendations
 */
class AutoscaleEngine {
    /**
     * Generate autoscale configuration for a VMSS based on workload patterns
     */
    static generateAutoscaleConfiguration(vmssResourceUri, loadPattern, options = {}) {
        const profiles = this.generateAutoscaleProfiles(loadPattern, options);
        const notifications = options.notificationEmails
            ? this.createNotifications(options.notificationEmails)
            : undefined;
        return {
            name: `autoscale-${this.extractVmssName(vmssResourceUri)}`,
            targetResourceUri: vmssResourceUri,
            enabled: true,
            profiles,
            notifications,
            predictiveAutoscalePolicy: options.enablePredictive
                ? {
                    scaleMode: "Enabled",
                    scaleLookAheadTime: "PT10M",
                }
                : undefined,
        };
    }
    /**
     * Analyze load patterns from historical metrics
     */
    static analyzeLoadPattern(metrics) {
        if (metrics.length === 0) {
            throw new Error("No metrics provided for load pattern analysis");
        }
        // Calculate load characteristics
        const loads = metrics.map((m) => m.cpuPercent);
        const averageLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const peakLoad = Math.max(...loads);
        const baselineLoad = this.calculatePercentile(loads, 10);
        const variability = this.calculateCoefficientOfVariation(loads);
        // Determine pattern type
        const patternType = this.determinePatternType(loads, variability);
        // Analyze periodicity
        const periodicityAnalysis = this.analyzePeriodicPatterns(metrics);
        // Generate scaling recommendations
        const scalingRecommendations = this.generateScalingRecommendations(averageLoad, peakLoad, baselineLoad, variability, patternType);
        return {
            patternType,
            confidence: this.calculatePatternConfidence(loads, patternType),
            characteristics: {
                averageLoad,
                peakLoad,
                baselineLoad,
                variability,
            },
            periodicityAnalysis,
            scalingRecommendations,
        };
    }
    /**
     * Generate predictive scaling recommendations
     */
    static generatePredictiveScalingRecommendation(loadPattern, currentConfig) {
        const shouldEnable = this.shouldEnablePredictiveScaling(loadPattern);
        const confidence = this.calculatePredictiveConfidence(loadPattern);
        if (shouldEnable && confidence > 70) {
            return {
                recommendedAction: "enable",
                confidence,
                reasoning: "Load pattern shows predictable trends suitable for predictive scaling",
                benefits: [
                    "Faster response to load increases",
                    "Reduced cold start times",
                    "Better user experience during peak periods",
                    "Optimized resource utilization",
                ],
                risks: [
                    "Potential over-provisioning during forecast errors",
                    "Increased cost during low-confidence periods",
                ],
                configuration: {
                    scaleMode: "Enabled",
                    lookAheadTime: "PT10M",
                    minimumBufferTime: "PT5M",
                },
                expectedImprovements: {
                    responsiveness: "30-50% faster scale-out response",
                    costOptimization: "10-20% reduction in scale events",
                    availabilityImpact: "Improved availability during traffic spikes",
                },
            };
        }
        else if (currentConfig?.predictiveAutoscalePolicy?.scaleMode === "Enabled") {
            return {
                recommendedAction: "optimize",
                confidence,
                reasoning: "Current predictive scaling can be optimized for better performance",
                benefits: [
                    "Fine-tuned scaling parameters",
                    "Reduced false positives",
                    "Better cost efficiency",
                ],
                risks: [
                    "Temporary adjustment period",
                    "Need for monitoring and validation",
                ],
                configuration: {
                    scaleMode: "Enabled",
                    lookAheadTime: this.optimizeLookAheadTime(loadPattern),
                    minimumBufferTime: "PT5M",
                },
                expectedImprovements: {
                    responsiveness: "10-20% improvement in accuracy",
                    costOptimization: "5-15% cost reduction",
                    availabilityImpact: "Maintained or improved availability",
                },
            };
        }
        else {
            return {
                recommendedAction: "disable",
                confidence,
                reasoning: "Load pattern is too unpredictable for effective predictive scaling",
                benefits: [
                    "Simplified configuration",
                    "No prediction overhead",
                    "Traditional reactive scaling",
                ],
                risks: [
                    "Slower response to load changes",
                    "Potential user experience impact during spikes",
                ],
                configuration: {
                    scaleMode: "ForecastOnly",
                    lookAheadTime: "PT5M",
                    minimumBufferTime: "PT5M",
                },
                expectedImprovements: {
                    responsiveness: "Standard reactive performance",
                    costOptimization: "Predictable scaling costs",
                    availabilityImpact: "Standard availability patterns",
                },
            };
        }
    }
    /**
     * Simulate scaling events based on historical data
     */
    static simulateScaling(metrics, autoscaleConfig, vmSize = "Standard_D2s_v3") {
        const events = [];
        let currentInstances = autoscaleConfig.profiles[0]?.capacity.default || 2;
        let totalCost = 0;
        // VM pricing for simulation (simplified)
        const vmHourlyCost = this.getVmHourlyCost(vmSize);
        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            const scalingDecision = this.evaluateScalingDecision(metric, currentInstances, autoscaleConfig.profiles[0]);
            if (scalingDecision.shouldScale) {
                events.push({
                    timestamp: metric.timestamp,
                    action: scalingDecision.direction === "out" ? "scale-out" : "scale-in",
                    fromInstances: currentInstances,
                    toInstances: scalingDecision.targetInstances,
                    trigger: scalingDecision.trigger,
                    cost: vmHourlyCost * scalingDecision.targetInstances,
                });
                currentInstances = scalingDecision.targetInstances;
            }
            // Add hourly cost
            totalCost += vmHourlyCost * currentInstances;
        }
        const averageInstances = events.length > 0
            ? events.reduce((sum, e) => sum + e.toInstances, 0) / events.length
            : currentInstances;
        return {
            scenario: `Scaling simulation for ${metrics.length} hours`,
            timeRange: {
                start: metrics[0]?.timestamp || new Date(),
                end: metrics[metrics.length - 1]?.timestamp || new Date(),
            },
            events,
            summary: {
                totalScaleEvents: events.length,
                averageInstances,
                maxInstances: Math.max(...events.map((e) => e.toInstances), currentInstances),
                totalCost,
                performanceScore: this.calculatePerformanceScore(metrics, events),
                efficiencyScore: this.calculateEfficiencyScore(averageInstances, totalCost, vmHourlyCost),
            },
        };
    }
    /**
     * Generate optimized autoscale rules based on workload characteristics
     */
    static generateOptimizedRules(loadPattern, costOptimized = false) {
        const rules = [];
        // Scale-out rule based on CPU
        rules.push({
            name: "Scale out on high CPU",
            metricName: "Percentage CPU",
            timeGrain: "PT1M",
            statistic: "Average",
            timeWindow: costOptimized ? "PT10M" : "PT5M",
            operator: "GreaterThan",
            threshold: this.calculateScaleOutThreshold(loadPattern, costOptimized),
            direction: "Increase",
            type: costOptimized ? "ChangeCount" : "PercentChangeCount",
            value: costOptimized ? 1 : 20,
            cooldown: costOptimized ? "PT10M" : "PT5M",
        });
        // Scale-in rule based on CPU
        rules.push({
            name: "Scale in on low CPU",
            metricName: "Percentage CPU",
            timeGrain: "PT1M",
            statistic: "Average",
            timeWindow: "PT15M", // Longer window for scale-in to avoid flapping
            operator: "LessThan",
            threshold: this.calculateScaleInThreshold(loadPattern, costOptimized),
            direction: "Decrease",
            type: "ChangeCount",
            value: 1,
            cooldown: "PT15M", // Longer cooldown for scale-in
        });
        // Add memory-based rules for memory-intensive workloads
        if (loadPattern.characteristics.averageLoad > 60) {
            rules.push({
                name: "Scale out on high memory",
                metricName: "Available Memory Bytes",
                timeGrain: "PT1M",
                statistic: "Average",
                timeWindow: "PT5M",
                operator: "LessThan",
                threshold: 1073741824, // 1GB
                direction: "Increase",
                type: "ChangeCount",
                value: 1,
                cooldown: "PT5M",
            });
        }
        return rules;
    }
    // Private helper methods
    static generateAutoscaleProfiles(loadPattern, options) {
        const profiles = [];
        // Default profile
        const defaultProfile = {
            name: "Default",
            capacity: {
                minimum: loadPattern.scalingRecommendations.recommendedMinInstances,
                maximum: loadPattern.scalingRecommendations.recommendedMaxInstances,
                default: Math.ceil(loadPattern.characteristics.averageLoad / 50) || 2,
            },
            rules: this.generateOptimizedRules(loadPattern, options.costOptimized),
        };
        profiles.push(defaultProfile);
        // Add time-based profiles if periodic patterns are detected
        if (loadPattern.periodicityAnalysis?.hasDailyPattern) {
            profiles.push(this.createPeakHoursProfile(loadPattern));
        }
        if (loadPattern.periodicityAnalysis?.hasWeeklyPattern) {
            profiles.push(this.createWeekendProfile(loadPattern));
        }
        return profiles;
    }
    static createNotifications(emails) {
        return [
            {
                operation: "Scale",
                email: {
                    sendToSubscriptionAdministrator: false,
                    sendToSubscriptionCoAdministrators: false,
                    customEmails: emails,
                },
            },
        ];
    }
    static extractVmssName(resourceUri) {
        const parts = resourceUri.split("/");
        return parts[parts.length - 1] || "vmss";
    }
    static calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    static calculateCoefficientOfVariation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return stdDev / mean;
    }
    static determinePatternType(loads, variability) {
        if (variability < 0.2)
            return "steady";
        if (variability > 1.0)
            return "spiky";
        // Simple periodicity check
        const hasPattern = this.hasPeriodicPattern(loads);
        return hasPattern ? "periodic" : "unpredictable";
    }
    static hasPeriodicPattern(loads) {
        // Simplified pattern detection
        if (loads.length < 24)
            return false;
        const hourlyAverages = this.groupByHour(loads);
        const variance = this.calculateCoefficientOfVariation(hourlyAverages);
        return variance > 0.3; // Some variation indicates pattern
    }
    static groupByHour(loads) {
        const hours = new Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
        loads.forEach((load, index) => {
            const hour = index % 24;
            hours[hour].sum += load;
            hours[hour].count++;
        });
        return hours.map((h) => (h.count > 0 ? h.sum / h.count : 0));
    }
    static analyzePeriodicPatterns(metrics) {
        if (metrics.length < 168) {
            // Less than a week of hourly data
            return undefined;
        }
        const hourlyPattern = this.analyzeHourlyPattern(metrics);
        const dailyPattern = this.analyzeDailyPattern(metrics);
        return {
            hasDailyPattern: hourlyPattern.hasPattern,
            hasWeeklyPattern: dailyPattern.hasPattern,
            peakHours: hourlyPattern.peakHours,
            peakDays: dailyPattern.peakDays,
        };
    }
    static analyzeHourlyPattern(metrics) {
        const hourlyLoads = new Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
        metrics.forEach((metric) => {
            const hour = metric.timestamp.getHours();
            hourlyLoads[hour].sum += metric.cpuPercent;
            hourlyLoads[hour].count++;
        });
        const hourlyAverages = hourlyLoads.map((h, index) => ({
            hour: index,
            average: h.count > 0 ? h.sum / h.count : 0,
        }));
        const overallAverage = hourlyAverages.reduce((sum, h) => sum + h.average, 0) / 24;
        const peakHours = hourlyAverages
            .filter((h) => h.average > overallAverage * 1.2)
            .map((h) => h.hour);
        return {
            hasPattern: peakHours.length > 0,
            peakHours,
        };
    }
    static analyzeDailyPattern(metrics) {
        const dailyLoads = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
        metrics.forEach((metric) => {
            const day = metric.timestamp.getDay();
            dailyLoads[day].sum += metric.cpuPercent;
            dailyLoads[day].count++;
        });
        const dailyAverages = dailyLoads.map((d, index) => ({
            day: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ][index],
            average: d.count > 0 ? d.sum / d.count : 0,
        }));
        const overallAverage = dailyAverages.reduce((sum, d) => sum + d.average, 0) / 7;
        const peakDays = dailyAverages
            .filter((d) => d.average > overallAverage * 1.15)
            .map((d) => d.day);
        return {
            hasPattern: peakDays.length > 0,
            peakDays,
        };
    }
    static generateScalingRecommendations(averageLoad, peakLoad, baselineLoad, variability, patternType) {
        const minInstances = Math.max(1, Math.ceil(baselineLoad / 60));
        let maxInstances = Math.ceil(peakLoad / 70);
        // Adjust based on pattern type
        if (patternType === "spiky") {
            maxInstances = Math.ceil(maxInstances * 1.5); // More headroom for spiky workloads
        }
        const aggressiveScaling = variability > 0.5 || patternType === "spiky";
        const predictiveScaling = patternType === "periodic" && variability < 0.8;
        return {
            recommendedMinInstances: minInstances,
            recommendedMaxInstances: Math.max(minInstances + 1, maxInstances),
            aggressiveScaling,
            predictiveScaling,
        };
    }
    static calculatePatternConfidence(loads, patternType) {
        const variability = this.calculateCoefficientOfVariation(loads);
        switch (patternType) {
            case "steady":
                return variability < 0.2 ? 90 : 70;
            case "periodic":
                return variability < 0.6 ? 85 : 60;
            case "spiky":
                return variability > 1.0 ? 80 : 60;
            default:
                return 50;
        }
    }
    static shouldEnablePredictiveScaling(loadPattern) {
        return (loadPattern.patternType === "periodic" &&
            loadPattern.periodicityAnalysis?.hasDailyPattern === true &&
            loadPattern.confidence > 70);
    }
    static calculatePredictiveConfidence(loadPattern) {
        let confidence = loadPattern.confidence;
        if (loadPattern.periodicityAnalysis?.hasDailyPattern)
            confidence += 10;
        if (loadPattern.periodicityAnalysis?.hasWeeklyPattern)
            confidence += 5;
        if (loadPattern.patternType === "periodic")
            confidence += 15;
        if (loadPattern.characteristics.variability < 0.4)
            confidence += 10;
        return Math.min(100, confidence);
    }
    static optimizeLookAheadTime(loadPattern) {
        if (loadPattern.characteristics.variability > 0.6)
            return "PT15M";
        if (loadPattern.patternType === "spiky")
            return "PT5M";
        return "PT10M";
    }
    static getVmHourlyCost(vmSize) {
        // Simplified VM pricing (actual prices would come from Azure Pricing API)
        const pricing = {
            Standard_B1s: 0.0104,
            Standard_B2s: 0.0416,
            Standard_D2s_v3: 0.096,
            Standard_D4s_v3: 0.192,
            Standard_D8s_v3: 0.384,
        };
        return pricing[vmSize] || 0.096;
    }
    static evaluateScalingDecision(metric, currentInstances, profile) {
        // Simplified scaling logic
        if (metric.cpuPercent > 75 && currentInstances < profile.capacity.maximum) {
            return {
                shouldScale: true,
                direction: "out",
                targetInstances: Math.min(currentInstances + 1, profile.capacity.maximum),
                trigger: `CPU > 75% (${metric.cpuPercent.toFixed(1)}%)`,
            };
        }
        if (metric.cpuPercent < 25 && currentInstances > profile.capacity.minimum) {
            return {
                shouldScale: true,
                direction: "in",
                targetInstances: Math.max(currentInstances - 1, profile.capacity.minimum),
                trigger: `CPU < 25% (${metric.cpuPercent.toFixed(1)}%)`,
            };
        }
        return {
            shouldScale: false,
            targetInstances: currentInstances,
            trigger: "No scaling required",
        };
    }
    static calculatePerformanceScore(metrics, events) {
        // Simplified performance scoring
        const avgCpu = metrics.reduce((sum, m) => sum + m.cpuPercent, 0) / metrics.length;
        const responsiveness = events.length > 0 ? 80 : 60; // More events = more responsive
        if (avgCpu > 80)
            return Math.max(50, responsiveness - 20);
        if (avgCpu < 30)
            return Math.max(60, responsiveness - 10);
        return responsiveness;
    }
    static calculateEfficiencyScore(averageInstances, totalCost, vmHourlyCost) {
        // Simplified efficiency calculation
        const optimalInstances = 2; // Baseline
        const efficiency = optimalInstances / averageInstances;
        return Math.min(100, efficiency * 100);
    }
    static calculateScaleOutThreshold(loadPattern, costOptimized) {
        if (costOptimized)
            return 80; // Higher threshold for cost optimization
        if (loadPattern.patternType === "spiky")
            return 65; // Lower threshold for spiky workloads
        return 75; // Default threshold
    }
    static calculateScaleInThreshold(loadPattern, costOptimized) {
        if (costOptimized)
            return 20; // Lower threshold for aggressive scale-in
        if (loadPattern.patternType === "steady")
            return 30; // Higher threshold for steady workloads
        return 25; // Default threshold
    }
    static createPeakHoursProfile(loadPattern) {
        const peakHours = loadPattern.periodicityAnalysis?.peakHours || [
            9, 10, 11, 14, 15, 16,
        ];
        return {
            name: "Peak Hours",
            capacity: {
                minimum: loadPattern.scalingRecommendations.recommendedMinInstances + 1,
                maximum: loadPattern.scalingRecommendations.recommendedMaxInstances,
                default: Math.ceil(loadPattern.characteristics.peakLoad / 60),
            },
            rules: this.generateOptimizedRules(loadPattern, false),
            recurrence: {
                frequency: "Week",
                schedule: {
                    timeZone: "UTC",
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    hours: peakHours,
                    minutes: [0],
                },
            },
        };
    }
    static createWeekendProfile(loadPattern) {
        return {
            name: "Weekend",
            capacity: {
                minimum: Math.max(1, loadPattern.scalingRecommendations.recommendedMinInstances - 1),
                maximum: Math.ceil(loadPattern.scalingRecommendations.recommendedMaxInstances * 0.7),
                default: Math.max(1, Math.ceil(loadPattern.characteristics.baselineLoad / 70)),
            },
            rules: this.generateOptimizedRules(loadPattern, true), // Cost-optimized for weekends
            recurrence: {
                frequency: "Week",
                schedule: {
                    timeZone: "UTC",
                    days: ["Saturday", "Sunday"],
                    hours: [0],
                    minutes: [0],
                },
            },
        };
    }
}
exports.AutoscaleEngine = AutoscaleEngine;
