/**
 * Tests for Scaling Module
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Handlebars from 'handlebars';
import {
  registerScalingHelpers,
  createVmssDefinition,
  createAutoScalePolicy,
  createMetricScaleRule,
  createScheduleProfile,
  createCpuScalingPolicy,
  createBusinessHoursSchedule,
  type VmssDefinitionOptions,
  type AutoScalePolicyOptions,
  type MetricScaleRule
} from '../scaling';
import { VmPlugin } from '../index';

describe('Scaling Module', () => {
  let plugin: VmPlugin;
  let helpers: Record<string, (...args: any[]) => any>;

  beforeEach(async () => {
    plugin = new VmPlugin();
    
    // Initialize the plugin to register helpers
    await plugin.initialize({
      generatorVersion: '3.1.0',
      templatesDir: './templates',
      outputDir: './output',
      config: {},
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      }
    });
    
    helpers = plugin.getHandlebarsHelpers();
    
    // Don't re-register helpers - they're already registered by initialize()
    // Re-registering would overwrite the JSON-serializing wrappers
  });

  describe('createVmssDefinition', () => {
    it('creates a uniform VMSS definition with defaults', () => {
      const config: VmssDefinitionOptions = {
        name: 'app-vmss',
        vmSize: 'Standard_D2s_v3'
      };

      const vmss = createVmssDefinition(config) as any;

      expect(vmss.type).toBe('Microsoft.Compute/virtualMachineScaleSets');
      expect(vmss.name).toBe('app-vmss');
      expect(vmss.sku.capacity).toBe(2);
      expect(vmss.properties.orchestrationMode).toBe('Uniform');
      expect(vmss.properties.upgradePolicy.mode).toBe('Manual');
    });

    it('creates a flexible VMSS definition with validation', () => {
      const vmss = createVmssDefinition({
        name: 'flexible-vmss',
        vmSize: 'Standard_D4s_v5',
        orchestrationMode: 'Flexible',
        platformFaultDomainCount: 3,
        singlePlacementGroup: true,
        zones: ['1', '2']
      }) as any;

      expect(vmss.properties.orchestrationMode).toBe('Flexible');
      expect(vmss.properties.platformFaultDomainCount).toBe(3);
      expect(vmss.zones).toEqual(['1', '2']);
    });

    it('throws when required values are missing', () => {
      expect(() => createVmssDefinition({ name: '', vmSize: '' } as any)).toThrow(
        /requires a VMSS name/
      );
    });
  });

  describe('scale:vmss.definition helper', () => {
    it('renders VMSS definition through Handlebars helper', () => {
      // Test the helper directly since Handlebars parameter passing is complex
      const helpers = require('../scaling').vmssHelpers;
      const result = helpers['scale:vmss.definition']({ name: 'web-vmss', vmSize: 'Standard_B2s' });
      
      expect(typeof result).toBe('object');
      expect(result.name).toBe('web-vmss');
      expect(result.sku.name).toBe('Standard_B2s');
      expect(result.properties.orchestrationMode).toBe('Uniform');
    });

    it('works when registered as Handlebars helper with object parameter', () => {
      // Test with object-style parameter which is more realistic for templates
      // Note: Handlebars requires bracket syntax for helper names with periods
      const template = Handlebars.compile(`{{{[scale:vmss.definition] this}}}`);
      const result = template({ name: 'template-vmss', vmSize: 'Standard_D2s_v3' });
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      
      if (result.trim()) {
        const parsed = JSON.parse(result);
        expect(parsed.name).toBe('template-vmss');
        expect(parsed.sku.name).toBe('Standard_D2s_v3');
      }
    });
  });

  describe('Auto-scaling Policy', () => {
    it('creates a basic auto-scaling policy', () => {
      const policyOptions: AutoScalePolicyOptions = {
        name: 'webApp-autoscale',
        targetResourceUri: '[resourceId("Microsoft.Compute/virtualMachineScaleSets", "webApp-vmss")]',
        profiles: [{
          name: 'Default Profile',
          capacity: {
            minimum: 2,
            maximum: 10,
            default: 3
          },
          rules: [{
            metricName: 'Percentage CPU',
            timeGrain: 'PT1M',
            statistic: 'Average',
            timeWindow: 'PT5M',
            timeAggregation: 'Average',
            operator: 'GreaterThan',
            threshold: 75,
            direction: 'Increase',
            cooldown: 'PT5M',
            type: 'ChangeCount',
            value: 1
          }]
        }]
      };

      const policy = createAutoScalePolicy(policyOptions) as any;

      expect(policy.type).toBe('Microsoft.Insights/autoscalesettings');
      expect(policy.name).toBe('webApp-autoscale');
      expect(policy.properties.enabled).toBe(true);
      expect(policy.properties.profiles).toHaveLength(1);
      expect(policy.properties.profiles[0].rules).toHaveLength(1);
    });

    it('creates a CPU-based scaling policy with defaults', () => {
      const policy = createCpuScalingPolicy({
        name: 'cpu-autoscale',
        targetResourceUri: '[resourceId("Microsoft.Compute/virtualMachineScaleSets", "app-vmss")]'
      }) as any;

      expect(policy.type).toBe('Microsoft.Insights/autoscalesettings');
      expect(policy.properties.profiles).toHaveLength(1);
      expect(policy.properties.profiles[0].rules).toHaveLength(2); // Scale out + scale in
      expect(policy.properties.profiles[0].capacity.minimum).toBe('2');
      expect(policy.properties.profiles[0].capacity.maximum).toBe('10');
    });

    it('throws when required values are missing', () => {
      expect(() => createAutoScalePolicy({} as any)).toThrow('Auto-scale policy requires a name');
      expect(() => createAutoScalePolicy({ name: 'test' } as any)).toThrow('Auto-scale policy requires a targetResourceUri');
      expect(() => createAutoScalePolicy({ 
        name: 'test', 
        targetResourceUri: 'test', 
        profiles: [] 
      } as any)).toThrow('Auto-scale policy requires at least one profile');
    });
  });

  describe('Metric Scale Rules', () => {
    it('creates a CPU metric scale rule', () => {
      const rule: MetricScaleRule = {
        metricName: 'Percentage CPU',
        timeGrain: 'PT1M',
        statistic: 'Average',
        timeWindow: 'PT10M',
        timeAggregation: 'Average',
        operator: 'GreaterThan',
        threshold: 80,
        direction: 'Increase',
        cooldown: 'PT10M',
        type: 'ChangeCount',
        value: 2
      };

      const result = createMetricScaleRule(rule) as any;

      expect(result.metricTrigger.metricName).toBe('Percentage CPU');
      expect(result.metricTrigger.threshold).toBe(80);
      expect(result.scaleAction.direction).toBe('Increase');
      expect(result.scaleAction.value).toBe('2');
    });

    it('creates a memory metric scale rule', () => {
      const rule: MetricScaleRule = {
        metricName: 'Available Memory Bytes',
        timeGrain: 'PT1M',
        statistic: 'Average',
        timeWindow: 'PT5M',
        timeAggregation: 'Average',
        operator: 'LessThan',
        threshold: 1073741824, // 1GB in bytes
        direction: 'Increase',
        cooldown: 'PT5M'
      };

      const result = createMetricScaleRule(rule) as any;

      expect(result.metricTrigger.metricName).toBe('Available Memory Bytes');
      expect(result.metricTrigger.threshold).toBe(1073741824);
      expect(result.scaleAction.direction).toBe('Increase');
    });

    it('throws when required values are missing', () => {
      expect(() => createMetricScaleRule({} as any)).toThrow('Metric scale rule requires a metricName');
      expect(() => createMetricScaleRule({ metricName: 'Percentage CPU' } as any)).toThrow('Metric scale rule requires a numeric threshold');
    });
  });

  describe('Schedule Profiles', () => {
    it('creates a business hours schedule profile', () => {
      const schedules = createBusinessHoursSchedule({
        name: 'Business Schedule',
        businessHoursCapacity: { min: 5, max: 20, default: 8 },
        offHoursCapacity: { min: 2, max: 5, default: 2 },
        timeZone: 'Eastern Standard Time',
        businessDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        businessHours: { start: 8, end: 18 }
      });

      expect(schedules).toHaveLength(2);
      expect(schedules[0].name).toBe('Business Hours Profile');
      expect(schedules[0].capacity.minimum).toBe(5);
      expect(schedules[1].name).toBe('Off Hours Profile');
      expect(schedules[1].capacity.minimum).toBe(2);
    });

    it('creates a fixed date schedule profile', () => {
      const profile = createScheduleProfile({
        name: 'Black Friday Profile',
        capacity: {
          minimum: 10,
          maximum: 50,
          default: 15
        },
        fixedDate: {
          timeZone: 'UTC',
          start: '2025-11-29T00:00:00.000Z',
          end: '2025-11-30T23:59:59.000Z'
        }
      }) as any;

      expect(profile.name).toBe('Black Friday Profile');
      expect(profile.capacity.minimum).toBe('10');
      expect(profile.fixedDate.start).toBe('2025-11-29T00:00:00.000Z');
    });

    it('throws when required values are missing', () => {
      expect(() => createScheduleProfile({} as any)).toThrow('Schedule profile requires a name');
      expect(() => createScheduleProfile({ name: 'test' } as any)).toThrow('Schedule profile requires capacity with minimum value');
    });
  });

  describe('scale:autoscale.* helpers', () => {
    it('renders auto-scaling policy through Handlebars helper', () => {
      // Test the helper directly
      const result = helpers['scale:autoscale.policy']({
        name: 'test-autoscale',
        targetResourceUri: '[resourceId("Microsoft.Compute/virtualMachineScaleSets", "test-vmss")]',
        profiles: [{
          name: 'Default',
          capacity: { minimum: 1, maximum: 5, default: 2 },
          rules: []
        }]
      });

      expect(typeof result).toBe('object');
      expect((result as any).type).toBe('Microsoft.Insights/autoscalesettings');
    });

    it('renders CPU scaling policy through Handlebars helper', () => {
      const result = helpers['scale:autoscale.cpu']({
        name: 'cpu-policy',
        targetResourceUri: '[resourceId("Microsoft.Compute/virtualMachineScaleSets", "app-vmss")]',
        scaleOutThreshold: 80,
        scaleInThreshold: 30
      });

      expect(typeof result).toBe('object');
      expect((result as any).properties.profiles[0].rules).toHaveLength(2);
    });

    it('works with Handlebars template compilation', () => {
      // Test with bracket syntax for helper names with periods
      const template = Handlebars.compile(`{{{[scale:autoscale.cpu] this}}}`);
      const result = template({
        name: 'template-autoscale',
        targetResourceUri: '[resourceId("Microsoft.Compute/virtualMachineScaleSets", "web-vmss")]'
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      if (result.trim()) {
        const parsed = JSON.parse(result);
        expect(parsed.type).toBe('Microsoft.Insights/autoscalesettings');
        expect(parsed.name).toBe('template-autoscale');
      }
    });
  });
});
