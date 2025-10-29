/**
 * Test suite for Azure VM Monitoring and Alert Rules module
 * 
 * Tests cover:
 * - MonitoringManager construction and configuration
 * - Monitoring presets (Production, Development, Performance, Cost-Optimized)
 * - Alert rule configurations and validation
 * - Auto-shutdown scheduling with timezone support
 * - Validation logic and error handling
 * - Cost estimation calculations
 * - ARM template resource generation
 */

import {
  MonitoringManager,
  MonitoringConfig,
  AlertRule,
  AutoShutdownConfig,
  MetricType,
  AlertSeverity,
  AlertOperator,
  TimeAggregation,
} from '../monitoring';

describe('MonitoringManager - Construction', () => {
  test('should create manager with basic configuration', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'high-cpu',
          description: 'Alert when CPU exceeds 85%',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 85,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    expect(manager).toBeDefined();
  });

  test('should create manager with Production preset', () => {
    const preset = MonitoringManager.PRESETS['Production'];
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Production');
    expect(preset.description).toContain('production');
    expect(preset.alertRules.length).toBeGreaterThan(0);
  });

  it('should create monitoring configuration from preset', () => {
    const presetConfig = MonitoringManager.PRESETS.Production;
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      alertRules: presetConfig.alertRules.map((rule, index) => ({
        ...rule,
        name: `production-alert-${index + 1}`
      })),
      autoShutdown: presetConfig.autoShutdown?.enabled ? {
        ...presetConfig.autoShutdown,
        notificationEmail: 'admin@example.com'
      } : undefined,
      enableDiagnostics: false,
      notificationEmails: ['admin@example.com'],
    };
    
    const manager = new MonitoringManager(config);
    
    expect(manager).toBeDefined();
    const validation = manager.validate();
    expect(validation.isValid).toBe(true);
  });
});

describe('MonitoringManager - Alert Rules', () => {
  test('should add alert rule dynamically', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    
    const newRule: AlertRule = {
      name: 'high-memory',
      description: 'Alert when memory is low',
      metricName: MetricType.Memory,
      operator: AlertOperator.LessThan,
      threshold: 1073741824, // 1GB in bytes
      timeAggregation: TimeAggregation.Average,
      windowSize: 'PT5M',
      evaluationFrequency: 'PT5M',
      severity: AlertSeverity.Warning,
      enabled: true,
    };

    manager.addAlertRule(newRule);
    
    const validation = manager.validate();
    expect(validation.isValid).toBe(true);
    // May have warnings (e.g., about missing action group), which is OK
  });

  test('should support all metric types', () => {
    const metrics = [
      MetricType.CPU,
      MetricType.Memory,
      MetricType.DiskRead,
      MetricType.DiskWrite,
      MetricType.NetworkIn,
      MetricType.NetworkOut,
    ];

    metrics.forEach((metric) => {
      const config: MonitoringConfig = {
        vmName: 'test-vm',
        enableDiagnostics: true,
        alertRules: [
          {
            name: `test-${metric}`,
            description: `Test alert for ${metric}`,
            metricName: metric,
            operator: AlertOperator.GreaterThan,
            threshold: 100,
            timeAggregation: TimeAggregation.Average,
            windowSize: 'PT5M',
            evaluationFrequency: 'PT5M',
            severity: AlertSeverity.Informational,
            enabled: true,
          },
        ],
        notificationEmails: ['test@example.com'],
      };

      const manager = new MonitoringManager(config);
      const validation = manager.validate();
      expect(validation.isValid).toBe(true);
    });
  });

  test('should support all alert severities', () => {
    const severities = [
      AlertSeverity.Critical,
      AlertSeverity.Error,
      AlertSeverity.Warning,
      AlertSeverity.Informational,
      AlertSeverity.Verbose,
    ];

    severities.forEach((severity) => {
      const config: MonitoringConfig = {
        vmName: 'test-vm',
        enableDiagnostics: true,
        alertRules: [
          {
            name: 'test-alert',
            description: 'Test alert',
            metricName: MetricType.CPU,
            operator: AlertOperator.GreaterThan,
            threshold: 90,
            timeAggregation: TimeAggregation.Average,
            windowSize: 'PT5M',
            evaluationFrequency: 'PT5M',
            severity,
            enabled: true,
          },
        ],
        notificationEmails: ['test@example.com'],
      };

      const manager = new MonitoringManager(config);
      const validation = manager.validate();
      expect(validation.isValid).toBe(true);
    });
  });

  test('should remove alert rule by name', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'rule-to-remove',
          description: 'This rule will be removed',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 90,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const removed = manager.removeAlertRule('rule-to-remove');
    
    expect(removed).toBe(true);
  });

  test('should enable/disable alert rule', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'toggle-rule',
          description: 'This rule will be toggled',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 90,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    
    const disabled = manager.setAlertRuleEnabled('toggle-rule', false);
    expect(disabled).toBe(true);
    
    const enabled = manager.setAlertRuleEnabled('toggle-rule', true);
    expect(enabled).toBe(true);
  });
});

describe('MonitoringManager - Auto-Shutdown', () => {
  test('should handle auto-shutdown disabled', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(true);
  });

  test('should handle auto-shutdown enabled with notification', () => {
    const autoShutdown: AutoShutdownConfig = {
      enabled: true,
      shutdownTime: '19:00',
      timezone: 'America/New_York',
      notificationEmail: 'admin@example.com',
      notificationMinutesBefore: 30,
    };

    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      autoShutdown,
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('should support different timezones', () => {
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

    timezones.forEach((timezone) => {
      const autoShutdown: AutoShutdownConfig = {
        enabled: true,
        shutdownTime: '18:00',
        timezone,
        notificationEmail: 'admin@example.com',
        notificationMinutesBefore: 15,
      };

      const config: MonitoringConfig = {
        vmName: 'test-vm',
        enableDiagnostics: true,
        alertRules: [],
        autoShutdown,
        notificationEmails: ['admin@example.com'],
      };

      const manager = new MonitoringManager(config);
      const validation = manager.validate();
      
      expect(validation.isValid).toBe(true);
    });
  });

  test('should configure auto-shutdown dynamically', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    
    const autoShutdown: AutoShutdownConfig = {
      enabled: true,
      shutdownTime: '20:00',
      timezone: 'UTC',
      notificationEmail: 'admin@example.com',
      notificationMinutesBefore: 60,
    };

    manager.configureAutoShutdown(autoShutdown);
    
    const validation = manager.validate();
    expect(validation.isValid).toBe(true);
  });
});

describe('MonitoringManager - Validation', () => {
  test('should validate correct configuration', () => {
    const config: MonitoringConfig = {
      vmName: 'valid-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'valid-rule',
          description: 'Valid alert rule',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 80,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('should reject missing VM name', () => {
    const config: MonitoringConfig = {
      vmName: '',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: [],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('VM name is required');
  });

  test('should reject negative threshold', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'invalid-rule',
          description: 'Invalid threshold',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: -10,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some(e => e.includes('threshold must be non-negative'))).toBe(true);
  });

  test('should reject invalid time format for auto-shutdown', () => {
    const autoShutdown: AutoShutdownConfig = {
      enabled: true,
      shutdownTime: '25:00', // Invalid hour
      timezone: 'UTC',
      notificationEmail: 'admin@example.com',
      notificationMinutesBefore: 30,
    };

    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      autoShutdown,
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('time must be in HH:MM format'))).toBe(true);
  });

  test('should reject invalid ISO 8601 duration for windowSize', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'invalid-window',
          description: 'Invalid window size',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 80,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'INVALID',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('invalid windowSize format'))).toBe(true);
  });

  test('should warn when no alert rules configured', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.some(w => w.includes('No alert rules'))).toBe(true);
  });

  test('should reject invalid email format', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      notificationEmails: ['invalid-email'],
    };

    const manager = new MonitoringManager(config);
    const validation = manager.validate();
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid email'))).toBe(true);
  });
});

describe('MonitoringManager - Cost Estimation', () => {
  test('should estimate costs for basic monitoring', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'cpu-alert',
          description: 'CPU alert',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 90,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Critical,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const cost = manager.estimateMonthlyCost();
    
    expect(cost).toBeGreaterThanOrEqual(0);
    expect(typeof cost).toBe('number');
  });

  test('should estimate costs with diagnostics enabled', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      diagnosticsStorageAccount: 'diagstorage',
      alertRules: [],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const cost = manager.estimateMonthlyCost();
    
    // Should include diagnostics storage cost (~$0.10/month)
    expect(cost).toBeGreaterThan(0);
  });

  test('should charge for alerts beyond free tier', () => {
    // First 10 alert rules are free, each additional rule costs $0.10/month
    const alertRules: AlertRule[] = [];
    
    // Create 15 alert rules (5 should be charged)
    for (let i = 0; i < 15; i++) {
      alertRules.push({
        name: `alert-${i}`,
        description: `Alert ${i}`,
        metricName: MetricType.CPU,
        operator: AlertOperator.GreaterThan,
        threshold: 90,
        timeAggregation: TimeAggregation.Average,
        windowSize: 'PT5M',
        evaluationFrequency: 'PT5M',
        severity: AlertSeverity.Warning,
        enabled: true,
      });
    }

    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: false,
      alertRules,
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const cost = manager.estimateMonthlyCost();
    
    // 5 paid alert rules at $0.10 each = $0.50
    // Plus email notifications cost
    expect(cost).toBeGreaterThanOrEqual(0.50);
  });
});

describe('MonitoringManager - Presets', () => {
  test('Production preset should have comprehensive monitoring', () => {
    const preset = MonitoringManager.PRESETS['Production'];
    
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Production');
    expect(preset.alertRules.length).toBeGreaterThan(3);
  });

  test('Development preset should have auto-shutdown enabled', () => {
    const preset = MonitoringManager.PRESETS['Development'];
    
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Development');
    expect(preset.autoShutdown).toBeDefined();
    expect(preset.autoShutdown?.enabled).toBe(true);
  });

  test('Testing preset should have minimal metrics', () => {
    const preset = MonitoringManager.PRESETS['Testing'];
    
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Testing');
    expect(preset.alertRules.length).toBeLessThan(5);
  });

  test('Production preset should have aggressive thresholds', () => {
    const preset = MonitoringManager.PRESETS['Production'];
    
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Production');
    
    // Production preset should have 1-minute evaluation frequency
    const hasOneMinuteEval = preset.alertRules.some(rule => 
      rule.evaluationFrequency === 'PT1M'
    );
    expect(hasOneMinuteEval).toBe(true);
  });
});

describe('MonitoringManager - ARM Template Generation', () => {
  test('should generate ARM template resources', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'cpu-alert',
          description: 'CPU alert',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 90,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Critical,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const resources = manager.toARMTemplate();
    
    expect(Array.isArray(resources)).toBe(true);
    expect(resources.length).toBeGreaterThan(0);
    
    // Should include action group
    const actionGroup = resources.find((r: any) => r.type === 'microsoft.insights/actionGroups');
    expect(actionGroup).toBeDefined();
    
    // Should include metric alert
    const metricAlert = resources.find((r: any) => r.type === 'microsoft.insights/metricAlerts');
    expect(metricAlert).toBeDefined();
  });

  test('should include auto-shutdown in ARM template when enabled', () => {
    const autoShutdown: AutoShutdownConfig = {
      enabled: true,
      shutdownTime: '19:00',
      timezone: 'UTC',
      notificationEmail: 'admin@example.com',
      notificationMinutesBefore: 30,
    };

    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [],
      autoShutdown,
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const resources = manager.toARMTemplate();
    
    // Should include shutdown schedule
    const schedule = resources.find((r: any) => r.type === 'Microsoft.DevTestLab/schedules');
    expect(schedule).toBeDefined();
    expect(schedule?.properties?.taskType).toBe('ComputeVmShutdownTask');
  });
});

describe('MonitoringManager - Summary Output', () => {
  test('should generate configuration summary', () => {
    const config: MonitoringConfig = {
      vmName: 'test-vm',
      enableDiagnostics: true,
      alertRules: [
        {
          name: 'cpu-alert',
          description: 'CPU exceeds threshold',
          metricName: MetricType.CPU,
          operator: AlertOperator.GreaterThan,
          threshold: 85,
          timeAggregation: TimeAggregation.Average,
          windowSize: 'PT5M',
          evaluationFrequency: 'PT5M',
          severity: AlertSeverity.Warning,
          enabled: true,
        },
      ],
      notificationEmails: ['admin@example.com'],
    };

    const manager = new MonitoringManager(config);
    const summary = manager.getSummary();
    
    expect(typeof summary).toBe('string');
    expect(summary).toContain('test-vm');
    expect(summary).toContain('Alert Rules');
    expect(summary).toContain('Estimated Monthly Cost');
  });
});
