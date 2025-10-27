import { describe, test, expect, beforeAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";

describe("Cost & Performance Template Integration", () => {
  let templateContent: string;

  beforeAll(() => {
    const templatePath = path.join(
      __dirname,
      "../../templates/mainTemplate.json.hbs",
    );
    templateContent = fs.readFileSync(templatePath, "utf-8");
  });

  describe("Cost Optimization Parameters", () => {
    test("should include enableCostOptimization parameter", () => {
      expect(templateContent).toContain('"enableCostOptimization"');
      expect(templateContent).toContain('"type": "bool"');
      expect(templateContent).toContain(
        "Enable cost optimization features including right-sizing recommendations and budget alerts",
      );
    });

    test("should include monthlyBudgetLimit parameter with range", () => {
      expect(templateContent).toContain('"monthlyBudgetLimit"');
      expect(templateContent).toContain('"type": "int"');
      expect(templateContent).toContain('"defaultValue": 500');
      expect(templateContent).toContain('"minValue": 0');
      expect(templateContent).toContain("Monthly budget limit in USD");
    });

    test("should include budgetAlertThreshold parameter", () => {
      expect(templateContent).toContain('"budgetAlertThreshold"');
      expect(templateContent).toContain('"defaultValue": 80');
      expect(templateContent).toContain('"minValue": 1');
      expect(templateContent).toContain('"maxValue": 100');
    });

    test("should include enableRightSizing parameter", () => {
      expect(templateContent).toContain('"enableRightSizing"');
      expect(templateContent).toContain(
        "Enable automatic right-sizing recommendations",
      );
    });
  });

  describe("Performance Optimization Parameters", () => {
    test("should include enablePerformanceOptimization parameter", () => {
      expect(templateContent).toContain('"enablePerformanceOptimization"');
      expect(templateContent).toContain(
        "Enable performance optimization features",
      );
    });

    test("should include enableAutoscale parameter", () => {
      expect(templateContent).toContain('"enableAutoscale"');
      expect(templateContent).toContain("Enable autoscaling for the VM");
    });

    test("should include autoscale instance range parameters", () => {
      expect(templateContent).toContain('"autoscaleMinInstances"');
      expect(templateContent).toContain('"autoscaleMaxInstances"');
      expect(templateContent).toContain('"defaultValue": 1');
      expect(templateContent).toContain('"defaultValue": 10');
    });

    test("should include autoscaleCpuThreshold parameter", () => {
      expect(templateContent).toContain('"autoscaleCpuThreshold"');
      expect(templateContent).toContain('"defaultValue": 75');
      expect(templateContent).toContain(
        "CPU percentage threshold to trigger scale-out",
      );
    });

    test("should include performanceProfile parameter with allowed values", () => {
      expect(templateContent).toContain('"performanceProfile"');
      expect(templateContent).toContain('"allowedValues"');
      expect(templateContent).toContain('"LowCost"');
      expect(templateContent).toContain('"Balanced"');
      expect(templateContent).toContain('"HighPerformance"');
    });
  });

  describe("Cost Optimization Variables", () => {
    test("should define costOptimizationConfig with budget configuration", () => {
      expect(templateContent).toContain('"costOptimizationConfig"');
      expect(templateContent).toContain('"budgetName"');
      expect(templateContent).toContain("budget");
      expect(templateContent).toContain('"estimatedMonthlyCost"');
    });

    test("should include cost allocation tags", () => {
      expect(templateContent).toContain('"costAllocationTags"');
      expect(templateContent).toContain('"CostCenter"');
      expect(templateContent).toContain('"Environment"');
      expect(templateContent).toContain('"ManagedBy"');
    });
  });

  describe("Performance Optimization Variables", () => {
    test("should define performanceOptimizationConfig with autoscale settings", () => {
      expect(templateContent).toContain('"performanceOptimizationConfig"');
      expect(templateContent).toContain('"autoscaleSettingsName"');
      expect(templateContent).toContain("autoscale");
    });

    test("should include performance baselines", () => {
      expect(templateContent).toContain('"performanceBaseline"');
      expect(templateContent).toContain('"cpuBaseline"');
      expect(templateContent).toContain('"memoryBaseline"');
      expect(templateContent).toContain('"diskIOPSBaseline"');
      expect(templateContent).toContain('"networkThroughputBaseline"');
    });

    test("should define performance profile configurations", () => {
      expect(templateContent).toContain('"performanceProfile"');
      expect(templateContent).toContain('"LowCost"');
      expect(templateContent).toContain('"Balanced"');
      expect(templateContent).toContain('"HighPerformance"');
      expect(templateContent).toContain('"diskType"');
      expect(templateContent).toContain('"acceleratedNetworking"');
    });
  });

  describe("Cost & Performance Resources", () => {
    test("should include budget resource with conditional deployment", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.Consumption/budgets"',
      );
      expect(templateContent).toContain(
        '"condition": "[and(parameters(\'enableCostOptimization\')',
      );
      expect(templateContent).toContain('"category": "Cost"');
      expect(templateContent).toContain(
        '"amount": "[parameters(\'monthlyBudgetLimit\')]"',
      );
    });

    test("should include budget notifications with thresholds", () => {
      expect(templateContent).toContain('"notifications"');
      expect(templateContent).toContain('"Actual_GreaterThan_80_Percent"');
      expect(templateContent).toContain('"Forecasted_GreaterThan_90_Percent"');
      expect(templateContent).toContain(
        '"threshold": "[parameters(\'budgetAlertThreshold\')]"',
      );
    });

    test("should include autoscale settings resource", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.Insights/autoscaleSettings"',
      );
      expect(templateContent).toContain(
        '"condition": "[and(parameters(\'enablePerformanceOptimization\')',
      );
      expect(templateContent).toContain('"enabled": true');
    });

    test("should include autoscale profiles with capacity", () => {
      expect(templateContent).toContain('"profiles"');
      expect(templateContent).toContain('"capacity"');
      expect(templateContent).toContain(
        '"minimum": "[string(parameters(\'autoscaleMinInstances\'))]"',
      );
      expect(templateContent).toContain(
        '"maximum": "[string(parameters(\'autoscaleMaxInstances\'))]"',
      );
    });

    test("should include autoscale rules for scale-out and scale-in", () => {
      expect(templateContent).toContain('"rules"');
      expect(templateContent).toContain('"scaleAction"');
      expect(templateContent).toContain('"direction": "Increase"');
      expect(templateContent).toContain('"direction": "Decrease"');
      expect(templateContent).toContain('"metricName": "Percentage CPU"');
    });
  });

  describe("Cost & Performance Outputs", () => {
    test("should include costAnalysis output", () => {
      expect(templateContent).toContain('"costAnalysis"');
      expect(templateContent).toContain('"estimatedMonthlyCost"');
      expect(templateContent).toContain('"budgetLimit"');
      expect(templateContent).toContain('"rightSizingEnabled"');
      expect(templateContent).toContain(
        "Cost analysis and optimization configuration",
      );
    });

    test("should include performanceMetrics output", () => {
      expect(templateContent).toContain('"performanceMetrics"');
      expect(templateContent).toContain('"performanceProfile"');
      expect(templateContent).toContain('"autoscaleEnabled"');
      expect(templateContent).toContain('"performanceBaseline"');
      expect(templateContent).toContain('"diskType"');
    });

    test("should include optimizationStatus output", () => {
      expect(templateContent).toContain('"optimizationStatus"');
      expect(templateContent).toContain('"costOptimizationEnabled"');
      expect(templateContent).toContain('"performanceOptimizationEnabled"');
      expect(templateContent).toContain('"autoscaleEnabled"');
      expect(templateContent).toContain('"budgetAlertsConfigured"');
    });
  });
});
