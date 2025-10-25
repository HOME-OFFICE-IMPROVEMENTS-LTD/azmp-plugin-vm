/**
 * Recommendation engine for Cost Optimization features.
 * Builds on top of CostAnalyzer utilities to provide actionable guidance.
 */

import { CostAnalyzer, VmCostBreakdown } from './analyzer';

export interface RightSizingParams {
  currentSize: string;
  region?: string;
  avgCpuPercent: number;
  avgMemoryPercent: number;
  avgDiskPercent?: number;
  osType?: 'linux' | 'windows';
  hoursPerMonth?: number;
}

export interface RightSizingRecommendation {
  recommendedSize: string;
  currentMonthlyCost: number;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  confidence: 'high' | 'medium' | 'low';
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

const REGION_FALLBACK = 'eastus';
const UTILIZATION_THRESHOLD = {
  idle: 10,
  low: 30,
  moderate: 55
};

const RIGHT_SIZE_MAP: Record<string, string | null> = {
  Standard_E8s_v5: 'Standard_E4s_v5',
  Standard_E4s_v5: 'Standard_D4s_v3',
  Standard_D8s_v3: 'Standard_D4s_v3',
  Standard_D4s_v3: 'Standard_D2s_v3',
  Standard_D2s_v3: 'Standard_B2s',
  Standard_B2s: null
};

/**
 * Engine that produces optimization recommendations.
 */
export class CostRecommendationEngine {
  /**
   * Evaluate utilization metrics and recommend a smaller VM size if appropriate.
   */
  static getRightSizingRecommendation(params: RightSizingParams): RightSizingRecommendation | null {
    const region = params.region || REGION_FALLBACK;
    const osType = params.osType || 'linux';
    const candidateSize = CostRecommendationEngine.resolveCandidateSize(params.currentSize, params.avgCpuPercent, params.avgMemoryPercent);

    if (!candidateSize) {
      return null;
    }

    const currentCost = CostAnalyzer.calculateVmCost({
      vmSize: params.currentSize,
      region,
      osType,
      hours: params.hoursPerMonth
    });

    const recommendedCost = CostAnalyzer.calculateVmCost({
      vmSize: candidateSize,
      region,
      osType,
      hours: params.hoursPerMonth
    });

    const monthlySavings = Number((currentCost.monthlyCost - recommendedCost.monthlyCost).toFixed(2));
    if (monthlySavings <= 0) {
      return null;
    }

    const confidence = CostRecommendationEngine.determineConfidence(params.avgCpuPercent, params.avgMemoryPercent, params.avgDiskPercent);
    const rationale = CostRecommendationEngine.buildRationale(candidateSize, params);

    return {
      recommendedSize: candidateSize,
      currentMonthlyCost: currentCost.monthlyCost,
      recommendedMonthlyCost: recommendedCost.monthlyCost,
      monthlySavings,
      annualSavings: Number((monthlySavings * 12).toFixed(2)),
      confidence,
      rationale
    };
  }

  /**
   * Identify idle resources based on utilization metrics.
   */
  static detectIdleResource(params: RightSizingParams): IdleResourceInsight {
    const cpu = params.avgCpuPercent;
    const memory = params.avgMemoryPercent;
    const disk = params.avgDiskPercent ?? cpu;
    const utilizationScore = Number(((cpu + memory + disk) / 3).toFixed(2));

    if (utilizationScore <= UTILIZATION_THRESHOLD.idle) {
      return {
        isIdle: true,
        utilizationScore,
        message: 'Resource appears idle with utilization below 10%.',
        suggestedAction: 'Consider shutting down during off-hours or deallocating unused VMs.'
      };
    }

    return {
      isIdle: false,
      utilizationScore,
      message: 'Resource is actively used.',
      suggestedAction: 'Review utilization trends before making changes.'
    };
  }

  /**
   * Determine if Reserved Instances should be evaluated.
   */
  static evaluateReservedInstanceOpportunity(currentCost: VmCostBreakdown, reservedCost: VmCostBreakdown): ReservedInstanceOpportunity {
    const savings = Number((currentCost.monthlyCost - reservedCost.monthlyCost).toFixed(2));
    const savingsPercent = Number(((savings / currentCost.monthlyCost) * 100).toFixed(2));

    if (savingsPercent >= 15) {
      return {
        isWorthConsidering: true,
        estimatedSavingsPercent: savingsPercent,
        message: `Reserved Instance could save approximately ${savingsPercent}% per month.`
      };
    }

    return {
      isWorthConsidering: false,
      estimatedSavingsPercent: savingsPercent,
      message: 'Reserved Instance savings are modest (<15%). Monitor usage before committing.'
    };
  }

  /**
   * Assess whether a workload is a good candidate for Spot instances.
   */
  static evaluateSpotInstanceOpportunity(paygCost: VmCostBreakdown, spotCost: VmCostBreakdown): SpotInstanceOpportunity {
    const savings = Number((paygCost.monthlyCost - spotCost.monthlyCost).toFixed(2));
    const savingsPercent = Number(((savings / paygCost.monthlyCost) * 100).toFixed(2));

    if (savingsPercent >= 50) {
      return {
        isCandidate: true,
        savingsPercent,
        message: `Spot instances could reduce monthly cost by ~${savingsPercent}%. Ensure workload tolerates evictions.`
      };
    }

    return {
      isCandidate: false,
      savingsPercent,
      message: 'Spot instances provide limited savings (<50%). Evaluate workload resiliency before using Spot.'
    };
  }

  private static resolveCandidateSize(currentSize: string, cpu: number, memory: number): string | null {
    const nextSmaller = RIGHT_SIZE_MAP[currentSize];
    if (!nextSmaller) {
      return null;
    }

    if (cpu <= UTILIZATION_THRESHOLD.low && memory <= UTILIZATION_THRESHOLD.low) {
      return nextSmaller;
    }

    if (cpu <= UTILIZATION_THRESHOLD.moderate && memory <= UTILIZATION_THRESHOLD.moderate) {
      // Only recommend a downgrade when there is at least one smaller tier remaining.
      const secondCandidate = RIGHT_SIZE_MAP[nextSmaller];
      return secondCandidate ?? nextSmaller;
    }

    return null;
  }

  private static determineConfidence(cpu: number, memory: number, disk?: number): 'high' | 'medium' | 'low' {
    const diskValue = disk ?? cpu;
    const maxUtilization = Math.max(cpu, memory, diskValue);

    if (maxUtilization <= UTILIZATION_THRESHOLD.low) {
      return 'high';
    }

    if (maxUtilization <= UTILIZATION_THRESHOLD.moderate) {
      return 'medium';
    }

    return 'low';
  }

  private static buildRationale(candidateSize: string, params: RightSizingParams): string {
    const utilizationSummary = `Average utilization - CPU: ${params.avgCpuPercent}%, Memory: ${params.avgMemoryPercent}%`;
    const diskPart = params.avgDiskPercent !== undefined ? `, Disk: ${params.avgDiskPercent}%` : '';

    return `Recommend ${candidateSize} based on ${utilizationSummary}${diskPart}.`;
  }
}

