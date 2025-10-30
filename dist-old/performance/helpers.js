"use strict";
/**
 * Handlebars helpers for performance optimization features.
 * Provides helpers under the `perf:` namespace.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPerformanceHelpers = registerPerformanceHelpers;
const handlebars_1 = __importDefault(require("handlebars"));
const analyzer_1 = require("./analyzer");
const autoscale_1 = require("./autoscale");
const safeStringify = (value) => {
    return new handlebars_1.default.SafeString(JSON.stringify(value, null, 2));
};
const parseJsonArgument = (label, input) => {
    if (typeof input === "string") {
        try {
            return JSON.parse(input);
        }
        catch (error) {
            throw new Error(`Invalid JSON provided for ${label}`);
        }
    }
    if (typeof input === "object" && input !== null) {
        return input;
    }
    throw new Error(`Argument ${label} must be a JSON string or object`);
};
function registerPerformanceHelpers() {
    // Helper 1: perf:analyzeVm
    handlebars_1.default.registerHelper("perf:analyzeVm", function (vmSize, metricsInput) {
        try {
            const metrics = parseJsonArgument("metrics", metricsInput);
            const analysis = analyzer_1.PerformanceAnalyzer.analyzePerformance(vmSize, metrics);
            return safeStringify(analysis);
        }
        catch (error) {
            return `Error analyzing performance: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 2: perf:burstAnalysis
    handlebars_1.default.registerHelper("perf:burstAnalysis", function (vmSize, metricsInput) {
        try {
            const metrics = parseJsonArgument("metrics", metricsInput);
            const result = analyzer_1.PerformanceAnalyzer.analyzeBurstCapability(vmSize, metrics);
            return safeStringify(result);
        }
        catch (error) {
            return `Error analyzing burst capability: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 3: perf:diskOptimization
    handlebars_1.default.registerHelper("perf:diskOptimization", function (currentTier, vmSize, metricsInput) {
        try {
            const metrics = parseJsonArgument("metrics", metricsInput);
            const result = analyzer_1.PerformanceAnalyzer.analyzeDiskPerformance(currentTier, metrics, vmSize);
            return safeStringify(result);
        }
        catch (error) {
            return `Error analyzing disk performance: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 4: perf:baseline
    handlebars_1.default.registerHelper("perf:baseline", function (vmSize) {
        try {
            const baseline = analyzer_1.PerformanceAnalyzer.getPerformanceBaseline(vmSize);
            return safeStringify(baseline);
        }
        catch (error) {
            return `Error retrieving baseline: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 5: perf:compareVmPerformance
    handlebars_1.default.registerHelper("perf:compareVmPerformance", function (vmSizes, workloadProfile) {
        try {
            const list = Array.isArray(vmSizes)
                ? vmSizes.map((size) => String(size)).filter(Boolean)
                : typeof vmSizes === "string"
                    ? vmSizes
                        .split(",")
                        .map((size) => size.trim())
                        .filter(Boolean)
                    : [];
            if (list.length === 0) {
                throw new Error("At least one VM size is required");
            }
            const profile = workloadProfile;
            const result = analyzer_1.PerformanceAnalyzer.compareVmPerformance(list, profile);
            return safeStringify(result);
        }
        catch (error) {
            return `Error comparing VM performance: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 6: perf:loadPattern
    handlebars_1.default.registerHelper("perf:loadPattern", function (metricsInput) {
        try {
            const metrics = parseJsonArgument("metrics", metricsInput).map((entry) => ({
                ...entry,
                timestamp: entry.timestamp instanceof Date
                    ? entry.timestamp
                    : new Date(entry.timestamp),
            }));
            const pattern = autoscale_1.AutoscaleEngine.analyzeLoadPattern(metrics);
            return safeStringify(pattern);
        }
        catch (error) {
            return `Error analyzing load pattern: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 7: perf:autoscaleConfig
    handlebars_1.default.registerHelper("perf:autoscaleConfig", function (resourceUri, loadPatternInput, options) {
        try {
            const loadPattern = parseJsonArgument("loadPattern", loadPatternInput);
            const config = autoscale_1.AutoscaleEngine.generateAutoscaleConfiguration(resourceUri, loadPattern, {
                enablePredictive: options?.hash?.enablePredictive,
                costOptimized: options?.hash?.costOptimized,
                performanceOptimized: options?.hash?.performanceOptimized,
                notificationEmails: options?.hash?.notificationEmails,
            });
            return safeStringify(config);
        }
        catch (error) {
            return `Error generating autoscale configuration: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 8: perf:predictiveScaling
    handlebars_1.default.registerHelper("perf:predictiveScaling", function (loadPatternInput, configInput) {
        try {
            const loadPattern = parseJsonArgument("loadPattern", loadPatternInput);
            const configuration = configInput
                ? parseJsonArgument("configuration", configInput)
                : undefined;
            const recommendation = autoscale_1.AutoscaleEngine.generatePredictiveScalingRecommendation(loadPattern, configuration);
            return safeStringify(recommendation);
        }
        catch (error) {
            return `Error generating predictive scaling recommendation: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 9: perf:simulateScaling
    handlebars_1.default.registerHelper("perf:simulateScaling", function (metricsInput, configInput, options) {
        try {
            const metrics = parseJsonArgument("metrics", metricsInput).map((entry) => ({
                ...entry,
                timestamp: entry.timestamp instanceof Date
                    ? entry.timestamp
                    : new Date(entry.timestamp),
            }));
            const configuration = parseJsonArgument("configuration", configInput);
            const vmSize = options?.hash?.vmSize ?? "Standard_D2s_v3";
            const simulation = autoscale_1.AutoscaleEngine.simulateScaling(metrics, configuration, vmSize);
            return safeStringify(simulation);
        }
        catch (error) {
            return `Error simulating scaling: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
    // Helper 10: perf:optimizedRules
    handlebars_1.default.registerHelper("perf:optimizedRules", function (loadPatternInput, options) {
        try {
            const loadPattern = parseJsonArgument("loadPattern", loadPatternInput);
            const costOptimized = Boolean(options?.hash?.costOptimized);
            const rules = autoscale_1.AutoscaleEngine.generateOptimizedRules(loadPattern, costOptimized);
            return safeStringify(rules);
        }
        catch (error) {
            return `Error generating autoscale rules: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    });
}
