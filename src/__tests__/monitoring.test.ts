/**
 * Tests for Monitoring Module
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Handlebars from 'handlebars';
import { registerMonitoringHelpers } from '../modules/monitoring';
import { VmPlugin } from '../index';

describe('Monitoring Module', () => {
  let plugin: VmPlugin;

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
  });

  describe('monitor:metrics', () => {
    test('should create basic metric collection configuration', () => {
      const template = Handlebars.compile(`
        {{{monitor:metrics
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
          metricNamespace="Microsoft.Compute/virtualMachineScaleSets"
          metrics='["Percentage CPU","Available Memory Bytes"]'
          aggregation="Average"
          frequency="PT1M"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.type).toBe('Microsoft.Insights/metricAlerts');
      expect(parsed.properties.enabled).toBe(true);
      expect(parsed.properties.evaluationFrequency).toBe('PT1M');
      expect(parsed.properties.criteria.allOf).toHaveLength(2);
      expect(parsed.properties.criteria.allOf[0].metricName).toBe('Percentage CPU');
    });

    test('should handle single metric string', () => {
      const template = Handlebars.compile(`
        {{{monitor:metrics
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
          metrics="Percentage CPU"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.criteria.allOf).toHaveLength(1);
      expect(parsed.properties.criteria.allOf[0].metricName).toBe('Percentage CPU');
    });

    test('should use default values when optional parameters omitted', () => {
      const template = Handlebars.compile(`
        {{{monitor:metrics
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm')]"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.evaluationFrequency).toBe('PT1M');
      expect(parsed.properties.windowSize).toBe('PT1M');
    });
  });

  describe('monitor:diagnosticSettings', () => {
    test('should create diagnostic settings with Log Analytics workspace', () => {
      const template = Handlebars.compile(`
        {{{monitor:diagnosticSettings
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
          workspaceId="[parameters('logAnalyticsWorkspaceId')]"
          logs='["Administrative","Security","ServiceHealth"]'
          metrics='["AllMetrics"]'
          retentionDays=30
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.type).toBe('Microsoft.Insights/diagnosticSettings');
      expect(parsed.properties.workspaceId).toBe('[parameters(\'logAnalyticsWorkspaceId\')]');
      expect(parsed.properties.logs).toHaveLength(3);
      expect(parsed.properties.metrics).toHaveLength(1);
      expect(parsed.properties.logs[0].retentionPolicy.days).toBe(30);
    });

    test('should support storage account destination', () => {
      const template = Handlebars.compile(`
        {{{monitor:diagnosticSettings
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm')]"
          storageAccountId="[parameters('storageAccountId')]"
          logs='["Administrative"]'
          metrics='["AllMetrics"]'
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.storageAccountId).toBe('[parameters(\'storageAccountId\')]');
      expect(parsed.properties.workspaceId).toBeUndefined();
    });

    test('should support Event Hub destination', () => {
      const template = Handlebars.compile(`
        {{{monitor:diagnosticSettings
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm')]"
          eventHubAuthorizationRuleId="[parameters('eventHubRuleId')]"
          eventHubName="vm-logs"
          logs='["Administrative"]'
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.eventHubAuthorizationRuleId).toBe('[parameters(\'eventHubRuleId\')]');
      expect(parsed.properties.eventHubName).toBe('vm-logs');
    });
  });

  describe('monitor:logAnalyticsWorkspace', () => {
    test('should create Log Analytics workspace with basic configuration', () => {
      const template = Handlebars.compile(`
        {{{monitor:logAnalyticsWorkspace
          name="vmss-logs-workspace"
          location="East US"
          sku="PerGB2018"
          retentionInDays=90
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.type).toBe('Microsoft.OperationalInsights/workspaces');
      expect(parsed.name).toBe('vmss-logs-workspace');
      expect(parsed.location).toBe('East US');
      expect(parsed.properties.sku.name).toBe('PerGB2018');
      expect(parsed.properties.retentionInDays).toBe(90);
    });

    test('should include daily quota when specified', () => {
      const template = Handlebars.compile(`
        {{{monitor:logAnalyticsWorkspace
          name="logs-workspace"
          dailyQuotaGb=10
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.workspaceCapping.dailyQuotaGb).toBe(10);
    });

    test('should configure public network access settings', () => {
      const template = Handlebars.compile(`
        {{{monitor:logAnalyticsWorkspace
          name="secure-workspace"
          publicNetworkAccessForIngestion="Disabled"
          publicNetworkAccessForQuery="Disabled"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.publicNetworkAccessForIngestion).toBe('Disabled');
      expect(parsed.properties.publicNetworkAccessForQuery).toBe('Disabled');
    });
  });

  describe('monitor:applicationInsights', () => {
    test('should create workspace-based Application Insights', () => {
      const template = Handlebars.compile(`
        {{{monitor:applicationInsights
          name="web-app-insights"
          location="East US"
          applicationType="web"
          workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-workspace')]"
          samplingPercentage=100
          retentionInDays=90
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.type).toBe('Microsoft.Insights/components');
      expect(parsed.name).toBe('web-app-insights');
      expect(parsed.kind).toBe('web');
      expect(parsed.properties.Application_Type).toBe('web');
      expect(parsed.properties.WorkspaceResourceId).toBe('[resourceId(\'Microsoft.OperationalInsights/workspaces\', \'logs-workspace\')]');
      expect(parsed.properties.SamplingPercentage).toBe(100);
      expect(parsed.properties.RetentionInDays).toBe(90);
    });

    test('should create classic Application Insights without workspace', () => {
      const template = Handlebars.compile(`
        {{{monitor:applicationInsights
          name="classic-app-insights"
          applicationType="web"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.WorkspaceResourceId).toBeUndefined();
      expect(parsed.properties.Application_Type).toBe('web');
    });

    test('should configure IP masking and authentication', () => {
      const template = Handlebars.compile(`
        {{{monitor:applicationInsights
          name="app-insights"
          disableIpMasking=true
          disableLocalAuth=true
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.DisableIpMasking).toBe(true);
      expect(parsed.properties.DisableLocalAuth).toBe(true);
    });
  });

  describe('monitor:dataCollectionRule', () => {
    test('should create data collection rule with performance counters', () => {
      const template = Handlebars.compile(`
        {{{monitor:dataCollectionRule
          name="vm-performance-dcr"
          location="East US"
          dataSources='[{"performanceCounters":[{"counterSpecifiers":["\\\\Processor(_Total)\\\\% Processor Time"],"samplingFrequencyInSeconds":60}]}]'
          destinations='[{"logAnalytics":[{"workspaceResourceId":"[parameters(\\'workspaceId\\')]","name":"centralWorkspace"}]}]'
          dataFlows='[{"streams":["Microsoft-Perf"],"destinations":["centralWorkspace"]}]'
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.type).toBe('Microsoft.Insights/dataCollectionRules');
      expect(parsed.name).toBe('vm-performance-dcr');
      expect(parsed.properties.dataSources).toBeDefined();
      expect(parsed.properties.destinations).toBeDefined();
      expect(parsed.properties.dataFlows).toBeDefined();
    });

    test('should use default configuration when data sources not specified', () => {
      const template = Handlebars.compile(`
        {{{monitor:dataCollectionRule
          name="default-dcr"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.dataSources.performanceCounters).toBeDefined();
      expect(parsed.properties.destinations.logAnalytics).toBeDefined();
      expect(parsed.properties.dataFlows).toHaveLength(1);
    });

    test('should include description and tags', () => {
      const template = Handlebars.compile(`
        {{{monitor:dataCollectionRule
          name="production-dcr"
          description="Production VM performance monitoring"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.properties.description).toBe('Production VM performance monitoring');
    });
  });

  describe('monitor:customMetric', () => {
    test('should define custom metric with dimensions', () => {
      const template = Handlebars.compile(`
        {{{monitor:customMetric
          name="OrderProcessingTime"
          namespace="ECommerce/Orders"
          displayName="Order Processing Time"
          description="Time to process customer order in milliseconds"
          unit="Milliseconds"
          aggregation="Average"
          dimensions='["Region","PaymentMethod","OrderType"]'
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.metricDefinition.name).toBe('OrderProcessingTime');
      expect(parsed.metricDefinition.namespace).toBe('ECommerce/Orders');
      expect(parsed.metricDefinition.unit).toBe('Milliseconds');
      expect(parsed.metricDefinition.dimensions).toHaveLength(3);
      expect(parsed.usage.emitInstrumentation).toContain('OrderProcessingTime');
    });

    test('should generate instrumentation examples', () => {
      const template = Handlebars.compile(`
        {{{monitor:customMetric
          name="RequestCount"
          namespace="MyApp/Api"
          dimensions='["Endpoint","Method"]'
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.usage.example.dotNet).toContain('RequestCount');
      expect(parsed.usage.example.python).toContain('RequestCount');
      expect(parsed.usage.example.node).toContain('RequestCount');
    });

    test('should handle metric without dimensions', () => {
      const template = Handlebars.compile(`
        {{{monitor:customMetric
          name="TotalUsers"
          unit="Count"
        }}}
      `);

      const result = template({});
      const parsed = JSON.parse(result);

      expect(parsed.metricDefinition.dimensions).toHaveLength(0);
      expect(parsed.metricDefinition.name).toBe('TotalUsers');
    });
  });

  describe('Error Handling', () => {
    test('monitor:metrics should throw error when targetResourceId missing', () => {
      const template = Handlebars.compile(`
        {{{monitor:metrics}}}
      `);

      expect(() => template({})).toThrow('monitor:metrics requires targetResourceId parameter');
    });

    test('monitor:diagnosticSettings should throw error when no destination specified', () => {
      const template = Handlebars.compile(`
        {{{monitor:diagnosticSettings
          targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm')]"
        }}}
      `);

      expect(() => template({})).toThrow('monitor:diagnosticSettings requires at least one destination');
    });

    test('monitor:logAnalyticsWorkspace should throw error when name missing', () => {
      const template = Handlebars.compile(`
        {{{monitor:logAnalyticsWorkspace}}}
      `);

      expect(() => template({})).toThrow('monitor:logAnalyticsWorkspace requires name parameter');
    });

    test('monitor:applicationInsights should throw error when name missing', () => {
      const template = Handlebars.compile(`
        {{{monitor:applicationInsights}}}
      `);

      expect(() => template({})).toThrow('monitor:applicationInsights requires name parameter');
    });

    test('monitor:dataCollectionRule should throw error when name missing', () => {
      const template = Handlebars.compile(`
        {{{monitor:dataCollectionRule}}}
      `);

      expect(() => template({})).toThrow('monitor:dataCollectionRule requires name parameter');
    });

    test('monitor:customMetric should throw error when name missing', () => {
      const template = Handlebars.compile(`
        {{{monitor:customMetric}}}
      `);

      expect(() => template({})).toThrow('monitor:customMetric requires name parameter');
    });
  });
});
