/**
 * Performance Analyzer for Azure Virtual Machines
 * 
 * Provides comprehensive performance analysis including:
 * - CPU and memory burst analysis
 * - Disk performance tiering recommendations
 * - Network performance analysis
 * - Performance baseline establishment
 * - Resource utilization optimization
 */

// Performance metrics data structure
export interface PerformanceMetrics {
  cpu: {
    average: number;
    peak: number;
    p95: number;
    burstCapable: boolean;
    burstCredits?: number;
  };
  memory: {
    average: number;
    peak: number;
    p95: number;
    available: number;
  };
  disk: {
    readIops: number;
    writeIops: number;
    readThroughput: number; // MB/s
    writeThroughput: number; // MB/s
    latency: number; // ms
    queueDepth: number;
  };
  network: {
    inbound: number; // Mbps
    outbound: number; // Mbps
    connections: number;
    packetsPerSecond: number;
  };
}

// VM size performance characteristics
export interface VmSizeSpecs {
  vmSize: string;
  vCpus: number;
  memoryGb: number;
  maxDataDisks: number;
  maxIops: number;
  maxThroughput: number; // MB/s
  networkBandwidth: number; // Mbps
  burstSupported: boolean;
  burstIops?: number;
  burstThroughput?: number;
  premiumStorageSupported: boolean;
}

// Performance analysis result
export interface PerformanceAnalysis {
  vmSize: string;
  analysisDate: Date;
  overallScore: number; // 0-100
  recommendations: PerformanceRecommendation[];
  metrics: PerformanceMetrics;
  utilizationAnalysis: {
    cpuUtilization: 'optimal' | 'underutilized' | 'overutilized';
    memoryUtilization: 'optimal' | 'underutilized' | 'overutilized';
    diskUtilization: 'optimal' | 'underutilized' | 'overutilized';
    networkUtilization: 'optimal' | 'underutilized' | 'overutilized';
  };
  bottlenecks: PerformanceBottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
}

// Performance recommendation
export interface PerformanceRecommendation {
  type: 'rightsizing' | 'disk-tier' | 'autoscale' | 'burst-config' | 'network-optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: string;
  estimatedCostImpact: 'increase' | 'decrease' | 'neutral';
  implementationComplexity: 'low' | 'medium' | 'high';
  actionItems: string[];
}

// Performance bottleneck identification
export interface PerformanceBottleneck {
  resource: 'cpu' | 'memory' | 'disk' | 'network';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  impact: string;
  suggestedActions: string[];
}

// Optimization opportunity
export interface OptimizationOpportunity {
  category: 'performance' | 'cost' | 'reliability';
  title: string;
  description: string;
  potentialBenefit: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'long-term';
}

// Burst analysis result
export interface BurstAnalysis {
  vmSize: string;
  supportsBurst: boolean;
  burstConfiguration: {
    basePerformance: number;
    burstPerformance: number;
    creditBalance: number;
    creditConsumptionRate: number;
    sustainabilityMinutes: number;
  };
  recommendations: {
    enableBurst: boolean;
    migrateToBurstCapable: boolean;
    targetVmSize?: string;
    reasoning: string;
  };
  workloadSuitability: 'excellent' | 'good' | 'fair' | 'poor';
}

// Disk performance analysis
export interface DiskPerformanceAnalysis {
  currentTier: 'Standard_HDD' | 'Standard_SSD' | 'Premium_SSD' | 'Ultra_SSD';
  recommendations: {
    recommendedTier: string;
    reasoning: string;
    performanceGain: string;
    costImpact: string;
  };
  iopsAnalysis: {
    current: number;
    available: number;
    recommended: number;
    utilizationPercent: number;
  };
  throughputAnalysis: {
    current: number; // MB/s
    available: number;
    recommended: number;
    utilizationPercent: number;
  };
}

/**
 * Performance Analyzer class providing comprehensive VM performance analysis
 */
export class PerformanceAnalyzer {
  
  // VM size specifications database
  private static readonly VM_SPECS: Record<string, VmSizeSpecs> = {
    'Standard_B1s': {
      vmSize: 'Standard_B1s',
      vCpus: 1,
      memoryGb: 1,
      maxDataDisks: 2,
      maxIops: 320,
      maxThroughput: 22,
      networkBandwidth: 640,
      burstSupported: true,
      burstIops: 3200,
      burstThroughput: 48,
      premiumStorageSupported: true
    },
    'Standard_B2s': {
      vmSize: 'Standard_B2s',
      vCpus: 2,
      memoryGb: 4,
      maxDataDisks: 4,
      maxIops: 1280,
      maxThroughput: 22,
      networkBandwidth: 1280,
      burstSupported: true,
      burstIops: 3200,
      burstThroughput: 48,
      premiumStorageSupported: true
    },
    'Standard_D2s_v3': {
      vmSize: 'Standard_D2s_v3',
      vCpus: 2,
      memoryGb: 8,
      maxDataDisks: 4,
      maxIops: 3200,
      maxThroughput: 48,
      networkBandwidth: 1000,
      burstSupported: false,
      premiumStorageSupported: true
    },
    'Standard_D4s_v3': {
      vmSize: 'Standard_D4s_v3',
      vCpus: 4,
      memoryGb: 16,
      maxDataDisks: 8,
      maxIops: 6400,
      maxThroughput: 96,
      networkBandwidth: 2000,
      burstSupported: false,
      premiumStorageSupported: true
    },
    'Standard_D8s_v3': {
      vmSize: 'Standard_D8s_v3',
      vCpus: 8,
      memoryGb: 32,
      maxDataDisks: 16,
      maxIops: 12800,
      maxThroughput: 192,
      networkBandwidth: 4000,
      burstSupported: false,
      premiumStorageSupported: true
    },
    'Standard_F2s_v2': {
      vmSize: 'Standard_F2s_v2',
      vCpus: 2,
      memoryGb: 4,
      maxDataDisks: 4,
      maxIops: 3200,
      maxThroughput: 48,
      networkBandwidth: 875,
      burstSupported: false,
      premiumStorageSupported: true
    },
    'Standard_E2s_v3': {
      vmSize: 'Standard_E2s_v3',
      vCpus: 2,
      memoryGb: 16,
      maxDataDisks: 4,
      maxIops: 3200,
      maxThroughput: 48,
      networkBandwidth: 1000,
      burstSupported: false,
      premiumStorageSupported: true
    }
  };

  /**
   * Analyze VM performance and provide comprehensive recommendations
   */
  static analyzePerformance(vmSize: string, metrics: PerformanceMetrics): PerformanceAnalysis {
    const specs = this.VM_SPECS[vmSize];
    if (!specs) {
      throw new Error(`VM size ${vmSize} not supported for performance analysis`);
    }

    // Calculate overall performance score
    const overallScore = this.calculatePerformanceScore(specs, metrics);
    
    // Analyze resource utilization
    const utilizationAnalysis = this.analyzeResourceUtilization(specs, metrics);
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(specs, metrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(specs, metrics, utilizationAnalysis, bottlenecks);
    
    // Find optimization opportunities
    const optimizationOpportunities = this.findOptimizationOpportunities(specs, metrics);

    return {
      vmSize,
      analysisDate: new Date(),
      overallScore,
      recommendations,
      metrics,
      utilizationAnalysis,
      bottlenecks,
      optimizationOpportunities
    };
  }

  /**
   * Perform CPU and memory burst analysis
   */
  static analyzeBurstCapability(vmSize: string, metrics: PerformanceMetrics): BurstAnalysis {
    const specs = this.VM_SPECS[vmSize];
    if (!specs) {
      throw new Error(`VM size ${vmSize} not supported for burst analysis`);
    }

    if (!specs.burstSupported) {
      return {
        vmSize,
        supportsBurst: false,
        burstConfiguration: {
          basePerformance: specs.maxIops,
          burstPerformance: specs.maxIops,
          creditBalance: 0,
          creditConsumptionRate: 0,
          sustainabilityMinutes: 0
        },
        recommendations: {
          enableBurst: false,
          migrateToBurstCapable: this.shouldMigrateToBurstCapable(metrics),
          targetVmSize: this.recommendBurstCapableSize(specs),
          reasoning: 'Current VM size does not support burst capability'
        },
        workloadSuitability: this.assessBurstWorkloadSuitability(metrics)
      };
    }

    // Calculate burst metrics for burst-capable VMs
    const creditBalance = this.calculateBurstCredits(metrics);
    const consumptionRate = this.calculateCreditConsumption(metrics, specs);
    const sustainabilityMinutes = creditBalance / consumptionRate;

    return {
      vmSize,
      supportsBurst: true,
      burstConfiguration: {
        basePerformance: specs.maxIops,
        burstPerformance: specs.burstIops || specs.maxIops,
        creditBalance,
        creditConsumptionRate: consumptionRate,
        sustainabilityMinutes
      },
      recommendations: {
        enableBurst: this.shouldEnableBurst(metrics, specs),
        migrateToBurstCapable: false,
        reasoning: this.getBurstRecommendationReasoning(metrics, specs, sustainabilityMinutes)
      },
      workloadSuitability: this.assessBurstWorkloadSuitability(metrics)
    };
  }

  /**
   * Analyze disk performance and recommend optimal disk tier
   */
  static analyzeDiskPerformance(currentTier: string, metrics: PerformanceMetrics, vmSize: string): DiskPerformanceAnalysis {
    const specs = this.VM_SPECS[vmSize];
    if (!specs) {
      throw new Error(`VM size ${vmSize} not supported for disk analysis`);
    }

    const currentIops = metrics.disk.readIops + metrics.disk.writeIops;
    const currentThroughput = metrics.disk.readThroughput + metrics.disk.writeThroughput;
    
    // Recommend optimal disk tier based on performance requirements
    const recommendedTier = this.recommendDiskTier(currentIops, currentThroughput, metrics.disk.latency);
    
    return {
      currentTier: currentTier as any,
      recommendations: {
        recommendedTier,
        reasoning: this.getDiskTierReasoning(currentTier, recommendedTier, currentIops, currentThroughput),
        performanceGain: this.calculateDiskPerformanceGain(currentTier, recommendedTier),
        costImpact: this.calculateDiskCostImpact(currentTier, recommendedTier)
      },
      iopsAnalysis: {
        current: currentIops,
        available: specs.maxIops,
        recommended: this.getRecommendedIops(currentIops, recommendedTier),
        utilizationPercent: (currentIops / specs.maxIops) * 100
      },
      throughputAnalysis: {
        current: currentThroughput,
        available: specs.maxThroughput,
        recommended: this.getRecommendedThroughput(currentThroughput, recommendedTier),
        utilizationPercent: (currentThroughput / specs.maxThroughput) * 100
      }
    };
  }

  /**
   * Get performance baseline for a VM size
   */
  static getPerformanceBaseline(vmSize: string): VmSizeSpecs {
    const specs = this.VM_SPECS[vmSize];
    if (!specs) {
      throw new Error(`VM size ${vmSize} not supported`);
    }
    return { ...specs };
  }

  /**
   * Compare performance across multiple VM sizes
   */
  static compareVmPerformance(vmSizes: string[], workloadProfile: 'cpu-intensive' | 'memory-intensive' | 'io-intensive' | 'balanced'): Array<{
    vmSize: string;
    specs: VmSizeSpecs;
    suitabilityScore: number;
    pros: string[];
    cons: string[];
  }> {
    const results = vmSizes.map(vmSize => {
      const specs = this.VM_SPECS[vmSize];
      if (!specs) return null;

      const suitabilityScore = this.calculateWorkloadSuitability(specs, workloadProfile);
      const { pros, cons } = this.getVmSizeProsAndCons(specs, workloadProfile);

      return {
        vmSize,
        specs,
        suitabilityScore,
        pros,
        cons
      };
    }).filter(Boolean) as Array<{
      vmSize: string;
      specs: VmSizeSpecs;
      suitabilityScore: number;
      pros: string[];
      cons: string[];
    }>;

    // Sort by suitability score
    return results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  // Private helper methods

  private static calculatePerformanceScore(specs: VmSizeSpecs, metrics: PerformanceMetrics): number {
    let score = 100;

    // CPU utilization scoring
    if (metrics.cpu.average > 85) score -= 20;
    else if (metrics.cpu.average < 10) score -= 10;

    // Memory utilization scoring
    const memoryUsed = specs.memoryGb * 1024 - metrics.memory.available;
    const memoryUtilization = (memoryUsed / (specs.memoryGb * 1024)) * 100;
    if (memoryUtilization > 90) score -= 20;
    else if (memoryUtilization < 10) score -= 10;

    // Disk performance scoring
    const iopsUtilization = ((metrics.disk.readIops + metrics.disk.writeIops) / specs.maxIops) * 100;
    if (iopsUtilization > 90) score -= 15;
    if (metrics.disk.latency > 20) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private static analyzeResourceUtilization(specs: VmSizeSpecs, metrics: PerformanceMetrics) {
    const cpuUtil = metrics.cpu.average;
    const memoryUsed = specs.memoryGb * 1024 - metrics.memory.available;
    const memoryUtil = (memoryUsed / (specs.memoryGb * 1024)) * 100;
    const diskUtil = ((metrics.disk.readIops + metrics.disk.writeIops) / specs.maxIops) * 100;
    const networkUtil = ((metrics.network.inbound + metrics.network.outbound) / specs.networkBandwidth) * 100;

    return {
      cpuUtilization: cpuUtil > 80 ? 'overutilized' : cpuUtil < 20 ? 'underutilized' : 'optimal',
      memoryUtilization: memoryUtil > 85 ? 'overutilized' : memoryUtil < 15 ? 'underutilized' : 'optimal',
      diskUtilization: diskUtil > 85 ? 'overutilized' : diskUtil < 15 ? 'underutilized' : 'optimal',
      networkUtilization: networkUtil > 80 ? 'overutilized' : networkUtil < 10 ? 'underutilized' : 'optimal'
    } as const;
  }

  private static identifyBottlenecks(specs: VmSizeSpecs, metrics: PerformanceMetrics): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // CPU bottleneck
    if (metrics.cpu.average > 85) {
      bottlenecks.push({
        resource: 'cpu',
        severity: 'critical',
        description: `High CPU utilization (${metrics.cpu.average.toFixed(1)}%)`,
        impact: 'Application performance degradation and response time increases',
        suggestedActions: ['Scale up to larger VM size', 'Optimize application code', 'Enable CPU burst if available']
      });
    }

    // Memory bottleneck
    const memoryUsed = specs.memoryGb * 1024 - metrics.memory.available;
    const memoryUtil = (memoryUsed / (specs.memoryGb * 1024)) * 100;
    if (memoryUtil > 90) {
      bottlenecks.push({
        resource: 'memory',
        severity: 'critical',
        description: `High memory utilization (${memoryUtil.toFixed(1)}%)`,
        impact: 'Risk of memory pressure and potential swapping',
        suggestedActions: ['Scale up to VM with more memory', 'Optimize memory usage', 'Add memory monitoring']
      });
    }

    // Disk bottleneck
    const iopsUtil = ((metrics.disk.readIops + metrics.disk.writeIops) / specs.maxIops) * 100;
    if (iopsUtil > 85 || metrics.disk.latency > 20) {
      bottlenecks.push({
        resource: 'disk',
        severity: metrics.disk.latency > 50 ? 'critical' : 'warning',
        description: `High disk utilization (${iopsUtil.toFixed(1)}%) or latency (${metrics.disk.latency}ms)`,
        impact: 'Slow I/O operations affecting application performance',
        suggestedActions: ['Upgrade to Premium SSD', 'Enable disk bursting', 'Optimize disk access patterns']
      });
    }

    return bottlenecks;
  }

  private static generateRecommendations(
    specs: VmSizeSpecs, 
    metrics: PerformanceMetrics, 
    utilization: any, 
    bottlenecks: PerformanceBottleneck[]
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Right-sizing recommendations
    if (utilization.cpuUtilization === 'overutilized' || utilization.memoryUtilization === 'overutilized') {
      recommendations.push({
        type: 'rightsizing',
        priority: 'high',
        title: 'Scale up VM size',
        description: 'Current VM size is insufficient for workload demands',
        expectedImprovement: 'Improved performance and reduced bottlenecks',
        estimatedCostImpact: 'increase',
        implementationComplexity: 'medium',
        actionItems: [
          'Identify larger VM size with appropriate CPU/memory',
          'Plan maintenance window for VM resize',
          'Monitor performance after scaling'
        ]
      });
    }

    // Disk tier recommendations
    if (bottlenecks.some(b => b.resource === 'disk')) {
      recommendations.push({
        type: 'disk-tier',
        priority: 'high',
        title: 'Upgrade disk tier',
        description: 'Current disk performance is limiting application performance',
        expectedImprovement: 'Faster I/O operations and reduced latency',
        estimatedCostImpact: 'increase',
        implementationComplexity: 'low',
        actionItems: [
          'Upgrade to Premium SSD',
          'Enable disk bursting if available',
          'Monitor disk performance metrics'
        ]
      });
    }

    return recommendations;
  }

  private static findOptimizationOpportunities(specs: VmSizeSpecs, metrics: PerformanceMetrics): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Under-utilization opportunities
    if (metrics.cpu.average < 20 && metrics.memory.available > specs.memoryGb * 1024 * 0.7) {
      opportunities.push({
        category: 'cost',
        title: 'Right-size down for cost savings',
        description: 'VM appears to be over-provisioned for current workload',
        potentialBenefit: 'Reduce VM costs by 20-40%',
        effort: 'medium',
        timeframe: 'short-term'
      });
    }

    // Burst opportunity
    if (specs.burstSupported && metrics.cpu.peak > metrics.cpu.average * 2) {
      opportunities.push({
        category: 'performance',
        title: 'Optimize for burst workloads',
        description: 'Workload shows burst patterns suitable for burst-capable VMs',
        potentialBenefit: 'Better performance during peak periods',
        effort: 'low',
        timeframe: 'immediate'
      });
    }

    return opportunities;
  }

  // Burst analysis helper methods
  private static shouldMigrateToBurstCapable(metrics: PerformanceMetrics): boolean {
    return metrics.cpu.peak > metrics.cpu.average * 1.5;
  }

  private static recommendBurstCapableSize(specs: VmSizeSpecs): string {
    // Simple mapping to burst-capable equivalents
    const burstMapping: Record<string, string> = {
      'Standard_D2s_v3': 'Standard_B2s',
      'Standard_D4s_v3': 'Standard_B4ms',
      'Standard_F2s_v2': 'Standard_B2s'
    };
    return burstMapping[specs.vmSize] || 'Standard_B2s';
  }

  private static calculateBurstCredits(metrics: PerformanceMetrics): number {
    // Simplified burst credit calculation
    const baselineUsage = 20; // 20% baseline for B-series
    const averageUsage = metrics.cpu.average;
    
    if (averageUsage <= baselineUsage) {
      return 100; // Full credits when under baseline
    }
    
    return Math.max(0, 100 - ((averageUsage - baselineUsage) * 2));
  }

  private static calculateCreditConsumption(metrics: PerformanceMetrics, specs: VmSizeSpecs): number {
    const baselineUsage = 20;
    const currentUsage = metrics.cpu.average;
    
    return Math.max(0, currentUsage - baselineUsage) * 0.5;
  }

  private static shouldEnableBurst(metrics: PerformanceMetrics, specs: VmSizeSpecs): boolean {
    return metrics.cpu.peak > 40 && metrics.cpu.average < 30;
  }

  private static getBurstRecommendationReasoning(metrics: PerformanceMetrics, specs: VmSizeSpecs, sustainability: number): string {
    if (sustainability > 60) {
      return 'Excellent burst capability with sustainable credit balance';
    } else if (sustainability > 30) {
      return 'Good burst capability for moderate peak workloads';
    } else {
      return 'Limited burst sustainability - consider consistent performance VM';
    }
  }

  private static assessBurstWorkloadSuitability(metrics: PerformanceMetrics): 'excellent' | 'good' | 'fair' | 'poor' {
    const peakToAverage = metrics.cpu.peak / metrics.cpu.average;
    
    if (peakToAverage > 3 && metrics.cpu.average < 25) return 'excellent';
    if (peakToAverage > 2 && metrics.cpu.average < 40) return 'good';
    if (peakToAverage > 1.5) return 'fair';
    return 'poor';
  }

  // Disk analysis helper methods
  private static recommendDiskTier(iops: number, throughput: number, latency: number): string {
    if (latency > 20 || iops > 20000 || throughput > 750) {
      return 'Ultra_SSD';
    } else if (iops > 5000 || throughput > 200) {
      return 'Premium_SSD';
    } else if (iops > 500 || throughput > 60) {
      return 'Standard_SSD';
    } else {
      return 'Standard_HDD';
    }
  }

  private static getDiskTierReasoning(current: string, recommended: string, iops: number, throughput: number): string {
    if (current === recommended) {
      return 'Current disk tier is optimal for workload requirements';
    }
    return `Upgrade recommended due to high IOPS (${iops}) or throughput (${throughput} MB/s) requirements`;
  }

  private static calculateDiskPerformanceGain(currentTier: string, recommendedTier: string): string {
    const tierPerformance: Record<string, number> = {
      'Standard_HDD': 1,
      'Standard_SSD': 3,
      'Premium_SSD': 10,
      'Ultra_SSD': 20
    };
    
    const currentPerf = tierPerformance[currentTier] || 1;
    const recommendedPerf = tierPerformance[recommendedTier] || 1;
    const gain = ((recommendedPerf - currentPerf) / currentPerf) * 100;
    
    return `${gain.toFixed(0)}% performance improvement`;
  }

  private static calculateDiskCostImpact(currentTier: string, recommendedTier: string): string {
    const tierCost: Record<string, number> = {
      'Standard_HDD': 1,
      'Standard_SSD': 2,
      'Premium_SSD': 4,
      'Ultra_SSD': 8
    };
    
    const currentCost = tierCost[currentTier] || 1;
    const recommendedCost = tierCost[recommendedTier] || 1;
    const impact = ((recommendedCost - currentCost) / currentCost) * 100;
    
    if (impact > 10) return `${impact.toFixed(0)}% cost increase`;
    if (impact < -10) return `${Math.abs(impact).toFixed(0)}% cost decrease`;
    return 'Minimal cost impact';
  }

  private static getRecommendedIops(currentIops: number, tier: string): number {
    const tierMaxIops: Record<string, number> = {
      'Standard_HDD': 500,
      'Standard_SSD': 6000,
      'Premium_SSD': 20000,
      'Ultra_SSD': 160000
    };
    return Math.min(currentIops * 1.5, tierMaxIops[tier] || currentIops);
  }

  private static getRecommendedThroughput(currentThroughput: number, tier: string): number {
    const tierMaxThroughput: Record<string, number> = {
      'Standard_HDD': 60,
      'Standard_SSD': 750,
      'Premium_SSD': 900,
      'Ultra_SSD': 2000
    };
    return Math.min(currentThroughput * 1.5, tierMaxThroughput[tier] || currentThroughput);
  }

  private static calculateWorkloadSuitability(specs: VmSizeSpecs, workloadProfile: string): number {
    let score = 50;

    switch (workloadProfile) {
      case 'cpu-intensive':
        score += specs.vCpus * 10;
        score += specs.burstSupported ? 5 : 0;
        break;
      case 'memory-intensive':
        score += (specs.memoryGb / specs.vCpus) * 5;
        break;
      case 'io-intensive':
        score += (specs.maxIops / 1000) * 2;
        score += specs.premiumStorageSupported ? 10 : 0;
        break;
      case 'balanced':
        score += specs.vCpus * 5;
        score += (specs.memoryGb / specs.vCpus) * 2;
        score += (specs.maxIops / 1000);
        break;
    }

    return Math.min(100, score);
  }

  private static getVmSizeProsAndCons(specs: VmSizeSpecs, workloadProfile: string): { pros: string[]; cons: string[] } {
    const pros: string[] = [];
    const cons: string[] = [];

    // General pros
    if (specs.burstSupported) pros.push('Burst capability for peak workloads');
    if (specs.premiumStorageSupported) pros.push('Premium storage support');
    if (specs.vCpus >= 4) pros.push('Good multi-core performance');
    if (specs.memoryGb / specs.vCpus >= 4) pros.push('High memory-to-core ratio');

    // General cons
    if (!specs.burstSupported && specs.vCpus <= 2) cons.push('Limited baseline performance');
    if (!specs.premiumStorageSupported) cons.push('No premium storage support');
    if (specs.maxIops < 3200) cons.push('Limited IOPS capacity');

    return { pros, cons };
  }
}