/**
 * Cost Optimization module exports.
 * Aggregates analyzers, recommendation engine, budgets, templates, and helpers.
 */

export {
  CostAnalyzer,
  vmPricingData,
  storagePricingData,
  type VmCostOptions,
  type VmCostBreakdown,
  type VmCostComparison,
  type ReservedInstanceSavings,
  type SpotInstanceSavings,
  type StorageCostResult,
  type HybridBenefitSavings,
  type CostForecastPoint,
  type VmPricingModel,
} from "./analyzer";

export {
  CostRecommendationEngine,
  type RightSizingParams,
  type RightSizingRecommendation,
  type IdleResourceInsight,
  type ReservedInstanceOpportunity,
  type SpotInstanceOpportunity,
} from "./recommendations";

export {
  createBudgetDefinition,
  createCostAlertTemplate,
  type BudgetDefinitionOptions,
  type BudgetNotificationOptions,
  type BudgetDefinition,
  type CostAlertTemplateOptions,
  type CostAlertTemplate,
} from "./budgets";

export { registerCostHelpers } from "./helpers";

export interface CostOptimizationTemplate {
  id: string;
  name: string;
  category: "compute" | "storage" | "network" | "licensing";
  description: string;
  tags: string[];
  metrics: string[];
  recommendedActions: string[];
}

const COST_OPTIMIZATION_TEMPLATES: CostOptimizationTemplate[] = [
  {
    id: "compute-rightsizing",
    name: "Compute Right-Sizing Assessment",
    category: "compute",
    description:
      "Analyzes VM utilization over the last 30 days to recommend optimal SKU sizes.",
    tags: ["vm", "optimization", "rightsizing"],
    metrics: ["Average CPU", "Average Memory", "Peak Disk IOPS"],
    recommendedActions: [
      "Downsize underutilized VMs",
      "Enable scaling rules for variable workloads",
      "Consolidate low-utilization workloads",
    ],
  },
  {
    id: "reserved-instance-planning",
    name: "Reserved Instance Planning",
    category: "compute",
    description:
      "Evaluates steady-state workloads to determine Reserved Instance savings across 1 and 3 year terms.",
    tags: ["reserved-instances", "cost"],
    metrics: [
      "Monthly spend trend",
      "Instance runtime hours",
      "Break-even analysis",
    ],
    recommendedActions: [
      "Purchase 1-year Reserved Instances for predictable workloads",
      "Mix 1-year and 3-year commitments to balance flexibility",
      "Use scope recommendations to maximize coverage",
    ],
  },
  {
    id: "spot-workload-evaluation",
    name: "Spot Workload Evaluation",
    category: "compute",
    description:
      "Identifies stateless or interruptible workloads that can leverage Spot instances.",
    tags: ["spot", "scale-sets", "kubernetes"],
    metrics: ["Preemption rate", "Runtime profiles", "Savings potential"],
    recommendedActions: [
      "Run batch jobs on Spot instances with eviction handling",
      "Design workloads to checkpoint progress frequently",
      "Use multi-region deployment to reduce eviction risk",
    ],
  },
  {
    id: "storage-tier-optimization",
    name: "Storage Tier Optimization",
    category: "storage",
    description:
      "Compares disk performance requirements with cost-optimized SKUs.",
    tags: ["storage", "disks"],
    metrics: ["Disk IOPS", "Throughput", "Capacity utilization"],
    recommendedActions: [
      "Downgrade premium disks when IO latency is low",
      "Move infrequently accessed data to Standard HDD",
      "Identify disks with zero read/write activity",
    ],
  },
  {
    id: "network-egress-optimization",
    name: "Network Egress Optimization",
    category: "network",
    description:
      "Highlights high-cost data transfer patterns across regions and services.",
    tags: ["networking", "bandwidth"],
    metrics: [
      "Inter-region egress",
      "Zone-to-zone traffic",
      "Content delivery usage",
    ],
    recommendedActions: [
      "Enable caching for frequently accessed content",
      "Co-locate services in the same region to reduce egress",
      "Use Azure Front Door or CDN to optimize external traffic",
    ],
  },
  {
    id: "licensing-optimization",
    name: "Licensing Optimization",
    category: "licensing",
    description:
      "Surface Azure Hybrid Benefit opportunities for Windows Server and SQL workloads.",
    tags: ["windows", "sql", "hybrid-benefit"],
    metrics: ["Windows VM count", "SQL cores", "Software Assurance coverage"],
    recommendedActions: [
      "Apply Azure Hybrid Benefit for eligible Windows Server VMs",
      "Review SQL core usage for license recycling",
      "Track Software Assurance expiration dates",
    ],
  },
];

export function listCostOptimizationTemplates(): CostOptimizationTemplate[] {
  return COST_OPTIMIZATION_TEMPLATES;
}

export function getCostOptimizationTemplate(
  id: string,
): CostOptimizationTemplate | null {
  return (
    COST_OPTIMIZATION_TEMPLATES.find((template) => template.id === id) ?? null
  );
}
