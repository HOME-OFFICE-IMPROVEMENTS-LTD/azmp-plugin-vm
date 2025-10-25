import Handlebars from 'handlebars';
import {
  PerformanceAnalyzer,
  AutoscaleEngine,
  registerPerformanceHelpers
} from '../index';
import type { PerformanceMetrics } from '../analyzer';

describe('Performance Optimization Module', () => {
  const sampleMetrics: PerformanceMetrics = {
    cpu: {
      average: 45,
      peak: 88,
      p95: 70,
      burstCapable: true,
      burstCredits: 80
    },
    memory: {
      average: 60,
      peak: 72,
      p95: 68,
      available: 1024
    },
    disk: {
      readIops: 2500,
      writeIops: 1500,
      readThroughput: 80,
      writeThroughput: 45,
      latency: 8,
      queueDepth: 2
    },
    network: {
      inbound: 450,
      outbound: 320,
      connections: 1200,
      packetsPerSecond: 8500
    }
  };

  const loadMetrics = Array.from({ length: 24 }, (_, index) => ({
    timestamp: new Date(Date.UTC(2024, 0, 1, index)),
    cpuPercent: index >= 8 && index <= 18 ? 70 : 35,
    memoryPercent: index >= 8 && index <= 18 ? 75 : 55,
    requestCount: index >= 8 && index <= 18 ? 600 : 220
  }));

  const loadPattern = AutoscaleEngine.analyzeLoadPattern(loadMetrics);

  beforeAll(() => {
    registerPerformanceHelpers();
  });

  describe('PerformanceAnalyzer', () => {
    it('analyzes performance and returns recommendations', () => {
      const analysis = PerformanceAnalyzer.analyzePerformance('Standard_D4s_v3', sampleMetrics);
      expect(analysis.vmSize).toBe('Standard_D4s_v3');
      expect(analysis.overallScore).toBeGreaterThan(0);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.utilizationAnalysis.cpuUtilization).toBeDefined();
    });

    it('evaluates burst capability', () => {
      const burst = PerformanceAnalyzer.analyzeBurstCapability('Standard_B2s', sampleMetrics);
      expect(burst.supportsBurst).toBe(true);
      expect(burst.burstConfiguration.sustainabilityMinutes).toBeGreaterThan(0);
    });

    it('recommends disk tier adjustments', () => {
      const disk = PerformanceAnalyzer.analyzeDiskPerformance('Standard_SSD', sampleMetrics, 'Standard_D4s_v3');
      expect(disk.recommendations.recommendedTier).toBeDefined();
      expect(disk.iopsAnalysis.utilizationPercent).toBeGreaterThan(0);
    });

    it('compares VM performance across sizes', () => {
      const comparison = PerformanceAnalyzer.compareVmPerformance(
        ['Standard_B2s', 'Standard_D2s_v3', 'Standard_D4s_v3'],
        'balanced'
      );
      expect(comparison.length).toBeGreaterThan(0);
      expect(comparison[0]).toHaveProperty('suitabilityScore');
    });
  });

  describe('AutoscaleEngine', () => {
    it('detects load patterns from metrics', () => {
      expect(loadPattern.patternType).toBeDefined();
      expect(loadPattern.characteristics.averageLoad).toBeGreaterThan(0);
      expect(loadPattern.scalingRecommendations.recommendedMaxInstances).toBeGreaterThan(
        loadPattern.scalingRecommendations.recommendedMinInstances
      );
    });

    it('generates autoscale configuration', () => {
      const config = AutoscaleEngine.generateAutoscaleConfiguration(
        '/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/demo',
        loadPattern,
        { enablePredictive: true, notificationEmails: ['ops@example.com'] }
      );

      expect(config.enabled).toBe(true);
      expect(config.targetResourceUri).toContain('virtualMachineScaleSets');
      expect(config.profiles.length).toBeGreaterThan(0);
      if (config.notifications) {
        expect(config.notifications[0].email?.customEmails).toContain('ops@example.com');
      }
    });

    it('simulates autoscale behaviour', () => {
      const simulationMetrics = loadMetrics.map((metric, index) => ({
        timestamp: metric.timestamp,
        cpuPercent: metric.cpuPercent,
        instances: index < 12 ? 2 : 3
      }));

      const config = AutoscaleEngine.generateAutoscaleConfiguration(
        '/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/demo',
        loadPattern
      );

      const simulation = AutoscaleEngine.simulateScaling(simulationMetrics, config, 'Standard_D2s_v3');
      expect(simulation.summary.totalScaleEvents).toBeGreaterThanOrEqual(0);
      expect(simulation.summary.totalCost).toBeGreaterThan(0);
    });
  });

  describe('Performance Handlebars helpers', () => {
    it('renders perf:analyzeVm helper output', () => {
      const template = Handlebars.compile(`{{perf:analyzeVm "Standard_D4s_v3" metrics}}`);
      const result = template({ metrics: sampleMetrics });
      const parsed = JSON.parse(result);
      expect(parsed.vmSize).toBe('Standard_D4s_v3');
    });

    it('renders perf:autoscaleConfig helper output', () => {
      const template = Handlebars.compile(
        `{{perf:autoscaleConfig "/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/demo" pattern}}`
      );
      const result = template({ pattern: loadPattern });
      const parsed = JSON.parse(result);
      expect(parsed.enabled).toBe(true);
      expect(parsed.profiles.length).toBeGreaterThan(0);
    });

    it('renders perf:simulateScaling helper output', () => {
      const config = AutoscaleEngine.generateAutoscaleConfiguration(
        '/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/demo',
        loadPattern
      );
      const simulationMetrics = loadMetrics.slice(0, 6).map((metric) => ({
        timestamp: metric.timestamp,
        cpuPercent: metric.cpuPercent,
        instances: 2
      }));

      const template = Handlebars.compile(`{{perf:simulateScaling metrics config}}`);
      const result = template({ metrics: simulationMetrics, config });
      const parsed = JSON.parse(result);
      expect(parsed.summary).toHaveProperty('totalScaleEvents');
    });
  });
});

