"use strict";
/**
 * Cost analysis utilities for the Azure VM plugin.
 * Provides static pricing data and calculation helpers that power
 * CLI commands, Handlebars helpers, and higher level recommendations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storagePricingData = exports.vmPricingData = exports.CostAnalyzer = void 0;
const DEFAULT_REGION = "eastus";
const DEFAULT_HOURS_PER_MONTH = 730;
const CURRENCY = "USD";
/**
 * Static Azure VM pricing data (representative sample for common VM sizes).
 * Values are approximate and designed to provide realistic calculations offline.
 * Source: Azure Retail Pricing (sampled September 2024).
 */
const VM_PRICING = {
    eastus: {
        Standard_B2s: {
            payg: 0.0464,
            reserved1Year: 0.0325,
            reserved3Year: 0.0264,
            spot: 0.013,
            windowsPremium: 0.02,
        },
        Standard_D2s_v3: {
            payg: 0.096,
            reserved1Year: 0.067,
            reserved3Year: 0.055,
            spot: 0.029,
            windowsPremium: 0.09,
        },
        Standard_D4s_v3: {
            payg: 0.192,
            reserved1Year: 0.134,
            reserved3Year: 0.11,
            spot: 0.064,
            windowsPremium: 0.18,
        },
        Standard_D8s_v3: {
            payg: 0.384,
            reserved1Year: 0.268,
            reserved3Year: 0.22,
            spot: 0.128,
            windowsPremium: 0.36,
        },
        Standard_E4s_v5: {
            payg: 0.226,
            reserved1Year: 0.158,
            reserved3Year: 0.129,
            spot: 0.071,
            windowsPremium: 0.2,
        },
        Standard_E8s_v5: {
            payg: 0.452,
            reserved1Year: 0.315,
            reserved3Year: 0.258,
            spot: 0.142,
            windowsPremium: 0.4,
        },
    },
    westus2: {
        Standard_B2s: {
            payg: 0.0496,
            reserved1Year: 0.0346,
            reserved3Year: 0.0281,
            spot: 0.014,
            windowsPremium: 0.02,
        },
        Standard_D2s_v3: {
            payg: 0.099,
            reserved1Year: 0.069,
            reserved3Year: 0.057,
            spot: 0.031,
            windowsPremium: 0.09,
        },
        Standard_D4s_v3: {
            payg: 0.198,
            reserved1Year: 0.138,
            reserved3Year: 0.113,
            spot: 0.067,
            windowsPremium: 0.18,
        },
        Standard_D8s_v3: {
            payg: 0.396,
            reserved1Year: 0.276,
            reserved3Year: 0.227,
            spot: 0.134,
            windowsPremium: 0.36,
        },
        Standard_E4s_v5: {
            payg: 0.234,
            reserved1Year: 0.164,
            reserved3Year: 0.134,
            spot: 0.075,
            windowsPremium: 0.2,
        },
        Standard_E8s_v5: {
            payg: 0.468,
            reserved1Year: 0.328,
            reserved3Year: 0.268,
            spot: 0.148,
            windowsPremium: 0.4,
        },
    },
    westeurope: {
        Standard_B2s: {
            payg: 0.052,
            reserved1Year: 0.037,
            reserved3Year: 0.0304,
            spot: 0.015,
            windowsPremium: 0.024,
        },
        Standard_D2s_v3: {
            payg: 0.104,
            reserved1Year: 0.072,
            reserved3Year: 0.059,
            spot: 0.032,
            windowsPremium: 0.094,
        },
        Standard_D4s_v3: {
            payg: 0.208,
            reserved1Year: 0.144,
            reserved3Year: 0.118,
            spot: 0.068,
            windowsPremium: 0.188,
        },
        Standard_D8s_v3: {
            payg: 0.416,
            reserved1Year: 0.288,
            reserved3Year: 0.236,
            spot: 0.136,
            windowsPremium: 0.376,
        },
        Standard_E4s_v5: {
            payg: 0.244,
            reserved1Year: 0.17,
            reserved3Year: 0.139,
            spot: 0.078,
            windowsPremium: 0.21,
        },
        Standard_E8s_v5: {
            payg: 0.488,
            reserved1Year: 0.34,
            reserved3Year: 0.278,
            spot: 0.156,
            windowsPremium: 0.42,
        },
    },
};
const STORAGE_PRICING = {
    Premium_LRS: { displayName: "Premium SSD (LRS)", costPerGb: 0.154 },
    StandardSSD_LRS: { displayName: "Standard SSD (LRS)", costPerGb: 0.1 },
    Standard_LRS: { displayName: "Standard HDD (LRS)", costPerGb: 0.045 },
    UltraSSD_LRS: { displayName: "Ultra SSD (LRS)", costPerGb: 0.25 },
};
/**
 * Utility helpers for cost calculations.
 */
class CostAnalyzer {
    /**
     * Calculate VM cost based on pricing model, hours, and OS type.
     */
    static calculateVmCost(options) {
        const region = options.region || DEFAULT_REGION;
        const pricingModel = options.pricingModel || "payg";
        const hours = options.hours ?? DEFAULT_HOURS_PER_MONTH;
        const osType = options.osType || "linux";
        const pricing = CostAnalyzer.getVmPricing(options.vmSize, region);
        const baseHourly = CostAnalyzer.getHourlyRate(pricing, pricingModel);
        const windowsPremiumHourly = osType === "windows" ? (pricing.windowsPremium ?? 0) : 0;
        const appliedHybridBenefit = osType === "windows" && options.applyHybridBenefit === true;
        const effectiveWindowsPremium = appliedHybridBenefit
            ? 0
            : windowsPremiumHourly;
        const effectiveHourly = baseHourly + effectiveWindowsPremium;
        const monthlyCost = Number((effectiveHourly * hours).toFixed(2));
        return {
            hourlyCost: Number(effectiveHourly.toFixed(4)),
            monthlyCost,
            currency: CURRENCY,
            pricingModel,
            hours,
            details: {
                baseHourly: Number(baseHourly.toFixed(4)),
                windowsPremiumHourly: windowsPremiumHourly || undefined,
                appliedHybridBenefit,
                effectiveHourly: Number(effectiveHourly.toFixed(4)),
            },
        };
    }
    /**
     * Compare VM costs for a set of sizes.
     */
    static compareVmSizes(sizes, region, options = {}) {
        return sizes.map((size) => {
            const result = CostAnalyzer.calculateVmCost({
                vmSize: size,
                region,
                pricingModel: options.pricingModel,
                hours: options.hours,
                osType: options.osType,
                applyHybridBenefit: options.applyHybridBenefit,
            });
            return {
                vmSize: size,
                pricingModel: result.pricingModel,
                hourlyCost: result.hourlyCost,
                monthlyCost: result.monthlyCost,
                currency: result.currency,
            };
        });
    }
    /**
     * Calculate savings for Reserved Instances compared to PAYG.
     */
    static calculateReservedInstanceSavings(vmSize, region, term, options = {}) {
        const hours = options.hours ?? DEFAULT_HOURS_PER_MONTH;
        const payg = CostAnalyzer.calculateVmCost({
            vmSize,
            region,
            pricingModel: "payg",
            osType: options.osType,
        });
        const pricing = CostAnalyzer.getVmPricing(vmSize, region);
        const reservedRate = term === "1year" ? pricing.reserved1Year : pricing.reserved3Year;
        const windowsPremium = options.osType === "windows" ? (pricing.windowsPremium ?? 0) : 0;
        const reservedHourly = reservedRate + windowsPremium;
        const reservedCost = Number((reservedHourly * hours).toFixed(2));
        const savings = Number((payg.monthlyCost - reservedCost).toFixed(2));
        const savingsPercent = Number(((savings / payg.monthlyCost) * 100).toFixed(2));
        return {
            vmSize,
            region,
            term,
            paygCost: payg.monthlyCost,
            reservedCost,
            savings,
            savingsPercent: Number.isFinite(savingsPercent) ? savingsPercent : 0,
            currency: CURRENCY,
        };
    }
    /**
     * Estimate savings for Spot instances compared to PAYG.
     */
    static calculateSpotInstanceSavings(vmSize, region, options = {}) {
        const hours = options.hours ?? DEFAULT_HOURS_PER_MONTH;
        const pricing = CostAnalyzer.getVmPricing(vmSize, region);
        if (pricing.spot <= 0) {
            throw new Error(`Spot pricing not available for ${vmSize} in ${region}`);
        }
        const payg = CostAnalyzer.calculateVmCost({
            vmSize,
            region,
            pricingModel: "payg",
            osType: options.osType,
        });
        const windowsPremium = options.osType === "windows" ? (pricing.windowsPremium ?? 0) : 0;
        const spotHourly = pricing.spot + windowsPremium;
        const spotCost = Number((spotHourly * hours).toFixed(2));
        const savings = Number((payg.monthlyCost - spotCost).toFixed(2));
        const savingsPercent = Number(((savings / payg.monthlyCost) * 100).toFixed(2));
        return {
            vmSize,
            region,
            paygCost: payg.monthlyCost,
            spotCost,
            savings,
            savingsPercent: Number.isFinite(savingsPercent) ? savingsPercent : 0,
            currency: CURRENCY,
        };
    }
    /**
     * Calculate storage cost for a disk type/size.
     */
    static calculateStorageCost(diskType, sizeGb) {
        if (sizeGb <= 0) {
            throw new Error("Disk size must be greater than 0 GB");
        }
        const pricing = STORAGE_PRICING[diskType];
        if (!pricing) {
            throw new Error(`Unsupported disk type: ${diskType}`);
        }
        const monthlyCost = Number((pricing.costPerGb * sizeGb).toFixed(2));
        return {
            diskType,
            sizeGb,
            monthlyCost,
            costPerGb: pricing.costPerGb,
            currency: CURRENCY,
        };
    }
    /**
     * Estimate Azure Hybrid Benefit savings for Windows workloads.
     */
    static calculateHybridBenefitSavings(vmSize, region, hours = DEFAULT_HOURS_PER_MONTH) {
        const pricing = CostAnalyzer.getVmPricing(vmSize, region);
        const windowsPremium = pricing.windowsPremium ?? 0;
        if (windowsPremium === 0) {
            throw new Error(`Hybrid Benefit savings not applicable for ${vmSize} (no Windows premium)`);
        }
        const linuxCost = CostAnalyzer.calculateVmCost({
            vmSize,
            region,
            pricingModel: "payg",
            osType: "linux",
            hours,
        });
        const windowsWithoutAhb = linuxCost.monthlyCost + Number((windowsPremium * hours).toFixed(2));
        const windowsWithAhb = linuxCost.monthlyCost;
        const savings = Number((windowsWithoutAhb - windowsWithAhb).toFixed(2));
        const savingsPercent = Number(((savings / windowsWithoutAhb) * 100).toFixed(2));
        return {
            vmSize,
            region,
            withoutHybridBenefit: Number(windowsWithoutAhb.toFixed(2)),
            withHybridBenefit: windowsWithAhb,
            savings,
            savingsPercent: Number.isFinite(savingsPercent) ? savingsPercent : 0,
            currency: CURRENCY,
        };
    }
    /**
     * Produce a simple cost forecast using a compound growth rate.
     */
    static forecastCosts(currentMonthlyCost, growthRate, months) {
        if (currentMonthlyCost < 0) {
            throw new Error("Current monthly cost must be positive");
        }
        if (months <= 0) {
            throw new Error("Months must be greater than 0");
        }
        const normalizedGrowth = growthRate / 1; // keep explicit to emphasise expectation of decimal (e.g. 0.05)
        const forecast = [];
        let cost = currentMonthlyCost;
        for (let i = 1; i <= months; i++) {
            cost = Number((cost * (1 + normalizedGrowth)).toFixed(2));
            forecast.push({ month: i, projectedCost: cost });
        }
        return forecast;
    }
    static getVmPricing(vmSize, region) {
        const regionalPricing = VM_PRICING[region] || VM_PRICING[DEFAULT_REGION];
        if (!regionalPricing) {
            throw new Error(`Pricing data unavailable for region: ${region}`);
        }
        const pricing = regionalPricing[vmSize];
        if (!pricing) {
            throw new Error(`Pricing data unavailable for VM size ${vmSize} in region ${region}`);
        }
        return pricing;
    }
    static getHourlyRate(pricing, model) {
        switch (model) {
            case "payg":
                return pricing.payg;
            case "reserved1year":
                return pricing.reserved1Year;
            case "reserved3year":
                return pricing.reserved3Year;
            case "spot":
                return pricing.spot;
            default:
                return pricing.payg;
        }
    }
}
exports.CostAnalyzer = CostAnalyzer;
exports.vmPricingData = VM_PRICING;
exports.storagePricingData = STORAGE_PRICING;
