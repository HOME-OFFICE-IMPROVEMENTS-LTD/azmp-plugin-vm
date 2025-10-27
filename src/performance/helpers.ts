/**
 * Handlebars helpers for performance optimization features.
 * Provides helpers under the `perf:` namespace.
 */

import Handlebars from "handlebars";
import { PerformanceAnalyzer, type PerformanceMetrics } from "./analyzer";
import {
  AutoscaleEngine,
  type AutoscaleConfiguration,
  type LoadPattern,
} from "./autoscale";

const safeStringify = (value: unknown): Handlebars.SafeString => {
  return new Handlebars.SafeString(JSON.stringify(value, null, 2));
};

const parseJsonArgument = <T>(label: string, input: unknown): T => {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch (error) {
      throw new Error(`Invalid JSON provided for ${label}`);
    }
  }
  if (typeof input === "object" && input !== null) {
    return input as T;
  }
  throw new Error(`Argument ${label} must be a JSON string or object`);
};

export function registerPerformanceHelpers(): void {
  // Helper 1: perf:analyzeVm
  Handlebars.registerHelper(
    "perf:analyzeVm",
    function (vmSize: string, metricsInput: unknown) {
      try {
        const metrics = parseJsonArgument<PerformanceMetrics>(
          "metrics",
          metricsInput,
        );
        const analysis = PerformanceAnalyzer.analyzePerformance(
          vmSize,
          metrics,
        );
        return safeStringify(analysis);
      } catch (error) {
        return `Error analyzing performance: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 2: perf:burstAnalysis
  Handlebars.registerHelper(
    "perf:burstAnalysis",
    function (vmSize: string, metricsInput: unknown) {
      try {
        const metrics = parseJsonArgument<PerformanceMetrics>(
          "metrics",
          metricsInput,
        );
        const result = PerformanceAnalyzer.analyzeBurstCapability(
          vmSize,
          metrics,
        );
        return safeStringify(result);
      } catch (error) {
        return `Error analyzing burst capability: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 3: perf:diskOptimization
  Handlebars.registerHelper(
    "perf:diskOptimization",
    function (currentTier: string, vmSize: string, metricsInput: unknown) {
      try {
        const metrics = parseJsonArgument<PerformanceMetrics>(
          "metrics",
          metricsInput,
        );
        const result = PerformanceAnalyzer.analyzeDiskPerformance(
          currentTier,
          metrics,
          vmSize,
        );
        return safeStringify(result);
      } catch (error) {
        return `Error analyzing disk performance: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 4: perf:baseline
  Handlebars.registerHelper("perf:baseline", function (vmSize: string) {
    try {
      const baseline = PerformanceAnalyzer.getPerformanceBaseline(vmSize);
      return safeStringify(baseline);
    } catch (error) {
      return `Error retrieving baseline: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 5: perf:compareVmPerformance
  Handlebars.registerHelper(
    "perf:compareVmPerformance",
    function (vmSizes: string | unknown[], workloadProfile: string) {
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

        const profile = workloadProfile as
          | "cpu-intensive"
          | "memory-intensive"
          | "io-intensive"
          | "balanced";
        const result = PerformanceAnalyzer.compareVmPerformance(list, profile);
        return safeStringify(result);
      } catch (error) {
        return `Error comparing VM performance: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 6: perf:loadPattern
  Handlebars.registerHelper(
    "perf:loadPattern",
    function (metricsInput: unknown) {
      try {
        const metrics = parseJsonArgument<
          Array<{
            timestamp: string | Date;
            cpuPercent: number;
            memoryPercent: number;
          }>
        >("metrics", metricsInput).map((entry) => ({
          ...entry,
          timestamp:
            entry.timestamp instanceof Date
              ? entry.timestamp
              : new Date(entry.timestamp),
        }));

        const pattern = AutoscaleEngine.analyzeLoadPattern(metrics);
        return safeStringify(pattern);
      } catch (error) {
        return `Error analyzing load pattern: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 7: perf:autoscaleConfig
  Handlebars.registerHelper(
    "perf:autoscaleConfig",
    function (resourceUri: string, loadPatternInput: unknown, options: any) {
      try {
        const loadPattern = parseJsonArgument<LoadPattern>(
          "loadPattern",
          loadPatternInput,
        );
        const config = AutoscaleEngine.generateAutoscaleConfiguration(
          resourceUri,
          loadPattern,
          {
            enablePredictive: options?.hash?.enablePredictive,
            costOptimized: options?.hash?.costOptimized,
            performanceOptimized: options?.hash?.performanceOptimized,
            notificationEmails: options?.hash?.notificationEmails,
          },
        );
        return safeStringify(config);
      } catch (error) {
        return `Error generating autoscale configuration: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 8: perf:predictiveScaling
  Handlebars.registerHelper(
    "perf:predictiveScaling",
    function (loadPatternInput: unknown, configInput?: unknown) {
      try {
        const loadPattern = parseJsonArgument<LoadPattern>(
          "loadPattern",
          loadPatternInput,
        );
        const configuration = configInput
          ? parseJsonArgument<AutoscaleConfiguration>(
              "configuration",
              configInput,
            )
          : undefined;
        const recommendation =
          AutoscaleEngine.generatePredictiveScalingRecommendation(
            loadPattern,
            configuration,
          );
        return safeStringify(recommendation);
      } catch (error) {
        return `Error generating predictive scaling recommendation: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 9: perf:simulateScaling
  Handlebars.registerHelper(
    "perf:simulateScaling",
    function (metricsInput: unknown, configInput: unknown, options: any) {
      try {
        const metrics = parseJsonArgument<
          Array<{
            timestamp: string | Date;
            cpuPercent: number;
            instances: number;
          }>
        >("metrics", metricsInput).map((entry) => ({
          ...entry,
          timestamp:
            entry.timestamp instanceof Date
              ? entry.timestamp
              : new Date(entry.timestamp),
        }));

        const configuration = parseJsonArgument<AutoscaleConfiguration>(
          "configuration",
          configInput,
        );
        const vmSize = options?.hash?.vmSize ?? "Standard_D2s_v3";

        const simulation = AutoscaleEngine.simulateScaling(
          metrics,
          configuration,
          vmSize,
        );
        return safeStringify(simulation);
      } catch (error) {
        return `Error simulating scaling: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 10: perf:optimizedRules
  Handlebars.registerHelper(
    "perf:optimizedRules",
    function (loadPatternInput: unknown, options: any) {
      try {
        const loadPattern = parseJsonArgument<LoadPattern>(
          "loadPattern",
          loadPatternInput,
        );
        const costOptimized = Boolean(options?.hash?.costOptimized);
        const rules = AutoscaleEngine.generateOptimizedRules(
          loadPattern,
          costOptimized,
        );
        return safeStringify(rules);
      } catch (error) {
        return `Error generating autoscale rules: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );
}
