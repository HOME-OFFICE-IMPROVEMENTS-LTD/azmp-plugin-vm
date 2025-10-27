import Handlebars from "handlebars";
import {
  CostAnalyzer,
  CostRecommendationEngine,
  createBudgetDefinition,
  createCostAlertTemplate,
  registerCostHelpers,
} from "../index";

describe("Cost Optimization Module", () => {
  beforeAll(() => {
    registerCostHelpers();

    // Register the array helper for tests
    Handlebars.registerHelper("array", function (...args) {
      // Remove the last argument which is the Handlebars options object
      return args.slice(0, -1);
    });
  });

  describe("CostAnalyzer", () => {
    it("calculates PAYG cost for Standard_D2s_v3", () => {
      const result = CostAnalyzer.calculateVmCost({
        vmSize: "Standard_D2s_v3",
        region: "eastus",
        pricingModel: "payg",
        hours: 730,
      });

      expect(result.monthlyCost).toBeCloseTo(70.08, 2);
      expect(result.details.baseHourly).toBeCloseTo(0.096, 3);
    });

    it("compares VM sizes across a region", () => {
      const results = CostAnalyzer.compareVmSizes(
        ["Standard_D2s_v3", "Standard_D4s_v3"],
        "eastus",
        {
          pricingModel: "payg",
          hours: 730,
        },
      );

      expect(results).toHaveLength(2);
      expect(results[0].vmSize).toBe("Standard_D2s_v3");
      expect(results[1].monthlyCost).toBeGreaterThan(results[0].monthlyCost);
    });

    it("calculates reserved instance savings", () => {
      const savings = CostAnalyzer.calculateReservedInstanceSavings(
        "Standard_D2s_v3",
        "eastus",
        "1year",
      );
      expect(savings.savings).toBeGreaterThan(0);
      expect(savings.savingsPercent).toBeGreaterThan(0);
    });

    it("calculates spot instance savings", () => {
      const savings = CostAnalyzer.calculateSpotInstanceSavings(
        "Standard_D2s_v3",
        "eastus",
      );
      expect(savings.spotCost).toBeLessThan(savings.paygCost);
      expect(savings.savingsPercent).toBeGreaterThan(0);
    });

    it("calculates storage cost", () => {
      const cost = CostAnalyzer.calculateStorageCost("Premium_LRS", 128);
      expect(cost.monthlyCost).toBeCloseTo(19.71, 2);
      expect(cost.costPerGb).toBe(0.154);
    });

    it("throws for unsupported disk type", () => {
      expect(() =>
        CostAnalyzer.calculateStorageCost("Unknown_SKU", 128),
      ).toThrow("Unsupported disk type");
    });

    it("calculates hybrid benefit savings", () => {
      const savings = CostAnalyzer.calculateHybridBenefitSavings(
        "Standard_D2s_v3",
        "eastus",
      );
      expect(savings.savings).toBeGreaterThan(0);
      expect(savings.withoutHybridBenefit).toBeGreaterThan(
        savings.withHybridBenefit,
      );
    });

    it("generates cost forecast", () => {
      const forecast = CostAnalyzer.forecastCosts(500, 0.05, 3);
      expect(forecast).toHaveLength(3);
      expect(forecast[2].projectedCost).toBeGreaterThan(
        forecast[0].projectedCost,
      );
    });
  });

  describe("CostRecommendationEngine", () => {
    it("provides right-sizing recommendation", () => {
      const recommendation =
        CostRecommendationEngine.getRightSizingRecommendation({
          currentSize: "Standard_D8s_v3",
          region: "eastus",
          avgCpuPercent: 20,
          avgMemoryPercent: 25,
        });

      expect(recommendation).not.toBeNull();
      expect(recommendation?.recommendedSize).toBe("Standard_D4s_v3");
      expect(recommendation?.monthlySavings).toBeGreaterThan(0);
    });

    it("identifies idle resources", () => {
      const insight = CostRecommendationEngine.detectIdleResource({
        currentSize: "Standard_D2s_v3",
        avgCpuPercent: 5,
        avgMemoryPercent: 6,
      });

      expect(insight.isIdle).toBe(true);
      expect(insight.suggestedAction).toContain("Consider shutting down");
    });
  });

  describe("Budget helpers", () => {
    it("creates budget definition", () => {
      const budget = createBudgetDefinition({
        name: "vm-monthly-budget",
        amount: 1000,
        timeGrain: "Monthly",
        startDate: "2025-11-01",
        category: "Cost",
        notifications: [
          {
            threshold: 80,
            contactEmails: ["ops@example.com"],
          },
        ],
      });

      expect(budget.properties.amount).toBe(1000);
      expect(budget.properties.notifications.notification1.threshold).toBe(80);
    });

    it("creates cost alert template", () => {
      const alert = createCostAlertTemplate({
        budgetName: "vm-monthly-budget",
        threshold: 80,
        contactEmails: ["ops@example.com"],
      });

      expect(alert.properties.linkedBudget).toBe("vm-monthly-budget");
      expect(alert.properties.notification.contactEmails).toContain(
        "ops@example.com",
      );
    });
  });

  describe("Handlebars helpers", () => {
    it("renders cost:calculateVmCost helper output", () => {
      const template = Handlebars.compile(
        `{{cost:calculateVmCost vmSize="Standard_D2s_v3" region="eastus"}}`,
      );
      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.monthlyCost).toBeGreaterThan(0);
      expect(parsed.details.baseHourly).toBeCloseTo(0.096, 3);
    });

    it("renders cost:compareVmSizes helper", () => {
      const template = Handlebars.compile(
        `{{cost:compareVmSizes sizes=(array "Standard_D2s_v3" "Standard_D4s_v3") region="eastus"}}`,
      );
      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].vmSize).toBe("Standard_D2s_v3");
    });

    it("renders cost:budgetDefinition helper", () => {
      const template = Handlebars.compile(
        `{{cost:budgetDefinition name="vm-budget" amount=500 timeGrain="Monthly" startDate="2025-11-01" category="Cost"}}`,
      );
      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe("vm-budget");
      expect(parsed.properties.amount).toBe(500);
    });
  });
});
