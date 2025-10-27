/**
 * Handlebars helpers for the cost optimization module.
 * Helpers are exposed under the `cost:` namespace.
 */

import Handlebars from "handlebars";
import { CostAnalyzer, type VmPricingModel } from "./analyzer";
import { CostRecommendationEngine } from "./recommendations";
import { createBudgetDefinition, createCostAlertTemplate } from "./budgets";

const safeStringify = (value: unknown): Handlebars.SafeString => {
  return new Handlebars.SafeString(JSON.stringify(value, null, 2));
};

function resolveOptions(args: any[]): { vmSize?: string; options: any } {
  const last = args[args.length - 1];
  if (typeof last === "object" && last && last.hash) {
    const vmSize = typeof args[0] === "string" ? args[0] : last.hash?.vmSize;
    return { vmSize, options: last };
  }

  return { vmSize: undefined, options: last };
}

export function registerCostHelpers(): void {
  // Helper 1: cost:calculateVmCost
  Handlebars.registerHelper("cost:calculateVmCost", function (...args: any[]) {
    try {
      const { vmSize, options } = resolveOptions(args);
      const hash = options?.hash || {};
      const size = vmSize || hash.vmSize;
      if (!size) {
        throw new Error("vmSize is required for cost:calculateVmCost");
      }

      const result = CostAnalyzer.calculateVmCost({
        vmSize: size,
        region: hash.region,
        hours: hash.hours,
        pricingModel: hash.pricingModel as VmPricingModel | undefined,
        osType: hash.osType,
        applyHybridBenefit: hash.applyHybridBenefit,
      });

      return safeStringify(result);
    } catch (error) {
      return `Error calculating VM cost: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 2: cost:compareVmSizes
  Handlebars.registerHelper("cost:compareVmSizes", function (options: any) {
    try {
      const hash = options?.hash || {};
      const sizes: string[] = hash.sizes || [];
      if (!Array.isArray(sizes) || sizes.length === 0) {
        throw new Error("sizes array is required for cost:compareVmSizes");
      }

      const region = hash.region;
      if (!region) {
        throw new Error("region is required for cost:compareVmSizes");
      }

      const result = CostAnalyzer.compareVmSizes(sizes, region, {
        pricingModel: hash.pricingModel as VmPricingModel | undefined,
        hours: hash.hours,
        osType: hash.osType,
        applyHybridBenefit: hash.applyHybridBenefit,
      });

      return safeStringify(result);
    } catch (error) {
      return `Error comparing VM sizes: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 3: cost:reservedInstanceSavings
  Handlebars.registerHelper(
    "cost:reservedInstanceSavings",
    function (...args: any[]) {
      try {
        const { vmSize, options } = resolveOptions(args);
        const hash = options?.hash || {};
        const size = vmSize || hash.vmSize;
        if (!size) {
          throw new Error(
            "vmSize is required for cost:reservedInstanceSavings",
          );
        }

        const region = hash.region;
        if (!region) {
          throw new Error(
            "region is required for cost:reservedInstanceSavings",
          );
        }

        const term = (hash.term || "1year") as "1year" | "3year";
        const result = CostAnalyzer.calculateReservedInstanceSavings(
          size,
          region,
          term,
          {
            osType: hash.osType,
            hours: hash.hours,
          },
        );

        return safeStringify(result);
      } catch (error) {
        return `Error calculating Reserved Instance savings: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 4: cost:rightSizeRecommendation
  Handlebars.registerHelper(
    "cost:rightSizeRecommendation",
    function (...args: any[]) {
      try {
        const { vmSize, options } = resolveOptions(args);
        const hash = options?.hash || {};
        const size = vmSize || hash.currentSize;
        if (!size) {
          throw new Error(
            "currentSize (vmSize) is required for cost:rightSizeRecommendation",
          );
        }

        const recommendation =
          CostRecommendationEngine.getRightSizingRecommendation({
            currentSize: size,
            region: hash.region,
            avgCpuPercent: Number(hash.avgCpuPercent ?? hash.cpu),
            avgMemoryPercent: Number(hash.avgMemoryPercent ?? hash.memory),
            avgDiskPercent:
              hash.avgDiskPercent !== undefined
                ? Number(hash.avgDiskPercent)
                : undefined,
            osType: hash.osType,
            hoursPerMonth: hash.hours,
          });

        if (!recommendation) {
          return "No right-sizing recommendation available for the provided metrics.";
        }

        return safeStringify(recommendation);
      } catch (error) {
        return `Error generating right-sizing recommendation: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 5: cost:budgetDefinition
  Handlebars.registerHelper("cost:budgetDefinition", function (options: any) {
    try {
      const hash = options?.hash || {};
      const result = createBudgetDefinition({
        name: hash.name,
        amount: Number(hash.amount),
        timeGrain: hash.timeGrain,
        startDate: hash.startDate,
        endDate: hash.endDate,
        category: hash.category,
        notifications: hash.notifications,
        resourceGroups: hash.resourceGroups,
        tags: hash.tags,
      });

      return safeStringify(result);
    } catch (error) {
      return `Error generating budget definition: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 6: cost:storageCost
  Handlebars.registerHelper("cost:storageCost", function (...args: any[]) {
    try {
      if (args.length === 0) {
        throw new Error("diskType is required for cost:storageCost");
      }

      const diskType = args[0];
      if (!diskType) {
        throw new Error("diskType is required for cost:storageCost");
      }
      const { hash } = args[args.length - 1] || {};
      const sizeArg =
        args.length > 1 && typeof args[1] !== "object" ? args[1] : undefined;
      const sizeGb =
        sizeArg !== undefined
          ? Number(sizeArg)
          : Number(hash?.sizeGb ?? hash?.size);

      if (!sizeGb || Number.isNaN(sizeGb)) {
        throw new Error("sizeGb must be provided for cost:storageCost");
      }

      const result = CostAnalyzer.calculateStorageCost(diskType, sizeGb);
      return safeStringify(result);
    } catch (error) {
      return `Error calculating storage cost: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 7: cost:spotInstanceSavings
  Handlebars.registerHelper(
    "cost:spotInstanceSavings",
    function (...args: any[]) {
      try {
        const { vmSize, options } = resolveOptions(args);
        const hash = options?.hash || {};
        const size = vmSize || hash.vmSize;
        if (!size) {
          throw new Error("vmSize is required for cost:spotInstanceSavings");
        }

        const region = hash.region;
        if (!region) {
          throw new Error("region is required for cost:spotInstanceSavings");
        }

        const result = CostAnalyzer.calculateSpotInstanceSavings(size, region, {
          hours: hash.hours,
          osType: hash.osType,
        });

        return safeStringify(result);
      } catch (error) {
        return `Error calculating Spot instance savings: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 8: cost:hybridBenefitSavings
  Handlebars.registerHelper(
    "cost:hybridBenefitSavings",
    function (...args: any[]) {
      try {
        const { vmSize, options } = resolveOptions(args);
        const hash = options?.hash || {};
        const size = vmSize || hash.vmSize;
        if (!size) {
          throw new Error("vmSize is required for cost:hybridBenefitSavings");
        }

        const region = hash.region;
        if (!region) {
          throw new Error("region is required for cost:hybridBenefitSavings");
        }

        const hours = hash.hours !== undefined ? Number(hash.hours) : undefined;
        const result = CostAnalyzer.calculateHybridBenefitSavings(
          size,
          region,
          hours,
        );
        return safeStringify(result);
      } catch (error) {
        return `Error calculating Hybrid Benefit savings: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  );

  // Helper 9: cost:forecast
  Handlebars.registerHelper("cost:forecast", function (options: any) {
    try {
      const hash = options?.hash || {};
      const currentMonthlyCost = Number(
        hash.currentMonthlyCost ?? hash.currentCost,
      );
      const growthRate = Number(hash.growthRate ?? 0);
      const months = Number(hash.months ?? 12);

      const result = CostAnalyzer.forecastCosts(
        currentMonthlyCost,
        growthRate,
        months,
      );
      return safeStringify(result);
    } catch (error) {
      return `Error generating cost forecast: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Helper 10: cost:alertTemplate
  Handlebars.registerHelper("cost:alertTemplate", function (options: any) {
    try {
      const hash = options?.hash || {};
      const result = createCostAlertTemplate({
        budgetName: hash.budgetName,
        threshold: Number(hash.threshold),
        contactEmails: hash.contactEmails,
        contactRoles: hash.contactRoles,
        actionGroups: hash.actionGroups,
        subject: hash.subject,
        message: hash.message,
      });

      return safeStringify(result);
    } catch (error) {
      return `Error generating cost alert template: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });
}
