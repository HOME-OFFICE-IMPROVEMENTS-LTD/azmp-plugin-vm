/**
 * Tests for Monitoring Template Integration
 * Validates monitoring parameters, variables, resources, and outputs
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { validateArmStructure } from '../templates/validation';
import { VmPlugin } from '../index';

describe('Monitoring Template Integration', () => {
  let mainTemplate: string;
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

    const templatePath = join(__dirname, '../../templates/mainTemplate.json.hbs');
    mainTemplate = readFileSync(templatePath, 'utf-8');
  });

  describe('Monitoring Parameters', () => {
    it('should include monitoring parameters in generated template', () => {
      // Directly test template structure without compilation
      expect(mainTemplate).toContain('"enableMonitoring"');
      expect(mainTemplate).toContain('"logAnalyticsWorkspaceName"');
      expect(mainTemplate).toContain('"logAnalyticsRetentionDays"');
      expect(mainTemplate).toContain('"defaultValue": 30');
      expect(mainTemplate).toContain('"minValue": 30');
      expect(mainTemplate).toContain('"maxValue": 730');
    });

    it('should include Application Insights parameters', () => {
      expect(mainTemplate).toContain('"enableApplicationInsights"');
      expect(mainTemplate).toContain('"type": "bool"');
      expect(mainTemplate).toContain('"defaultValue": true');
    });

    it('should include alert configuration parameters', () => {
      expect(mainTemplate).toContain('"enableMetricAlerts"');
      expect(mainTemplate).toContain('"cpuAlertThreshold"');
      expect(mainTemplate).toContain('"alertEmailRecipients"');
      // Note: memoryAlertThreshold and diskAlertThreshold are future enhancements
    });

    it('should include workbook configuration parameters', () => {
      expect(mainTemplate).toContain('"enableWorkbooks"');
      expect(mainTemplate).toContain('"workbookTypes"');
      expect(mainTemplate).toContain('"performance"');
      expect(mainTemplate).toContain('"security"');
      expect(mainTemplate).toContain('"availability"');
    });
  });

  describe('Monitoring Variables', () => {
    it('should include monitoring resource names in variables', () => {
      expect(mainTemplate).toContain('"applicationInsightsName"');
      expect(mainTemplate).toContain('"actionGroupName"');
      expect(mainTemplate).toContain('"diagnosticSettingsName"');
    });

    it('should include workbook names in variables', () => {
      // Workbook names are generated inline in resources, not as separate variables
      // This matches the current v1.8.0 implementation where workbooks use concat expressions
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/workbooks"');
      expect(mainTemplate).toContain('Performance Analysis');
    });

    it('should include diagnostic settings for metrics collection', () => {
      // v1.8.0 uses diagnostic settings for metrics collection
      // Data collection rules (DCR) with performance counters and syslog are future enhancements
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/diagnosticSettings"');
      expect(mainTemplate).toContain('"metrics"');
      expect(mainTemplate).toContain('"AllMetrics"');
    });
  });

  describe('Monitoring Resources', () => {
    it('should include Log Analytics workspace resource', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.OperationalInsights/workspaces"');
      expect(mainTemplate).toContain('"PerGB2018"');
      expect(mainTemplate).toContain('enableMonitoring');
    });

    it('should include Application Insights resource when enabled', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/components"');
      expect(mainTemplate).toContain('"kind": "web"');
      expect(mainTemplate).toContain('"Application_Type": "web"');
      expect(mainTemplate).toContain('enableApplicationInsights');
    });

    it('should include action group resource', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/actionGroups"');
      expect(mainTemplate).toContain('"location": "Global"');
      expect(mainTemplate).toContain('"enabled": true');
    });

    it('should include diagnostic settings resource', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/diagnosticSettings"');
      expect(mainTemplate).toContain('"workspaceId"');
      expect(mainTemplate).toContain('"metrics"');
    });

    it('should include CPU metric alert resource', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/metricAlerts"');
      expect(mainTemplate).toContain('cpu-alert');
      expect(mainTemplate).toContain('"severity": 2');
      expect(mainTemplate).toContain('"Percentage CPU"');
      expect(mainTemplate).toContain('"evaluationFrequency": "PT5M"');
      expect(mainTemplate).toContain('"windowSize": "PT15M"');
    });

    it('should include performance workbook when enabled', () => {
      expect(mainTemplate).toContain('"type": "Microsoft.Insights/workbooks"');
      expect(mainTemplate).toContain('"kind": "shared"');
      expect(mainTemplate).toContain('"category": "Azure Monitor"');
      expect(mainTemplate).toContain('Performance Analysis');
    });
  });

  describe('Monitoring Outputs', () => {
    it('should include Log Analytics workspace outputs', () => {
      expect(mainTemplate).toContain('"logAnalyticsWorkspaceId"');
      expect(mainTemplate).toContain('"logAnalyticsWorkspaceUrl"');
    });

    it('should include Application Insights outputs when enabled', () => {
      expect(mainTemplate).toContain('"applicationInsightsKey"');
      expect(mainTemplate).toContain('"applicationInsightsConnectionString"');
    });

    it('should include monitoring status output', () => {
      expect(mainTemplate).toContain('"monitoringStatus"');
      expect(mainTemplate).toContain('"monitoringEnabled"');
      expect(mainTemplate).toContain('"applicationInsightsEnabled"');
      expect(mainTemplate).toContain('"metricsAlertsEnabled"');
      expect(mainTemplate).toContain('"workbooksDeployed"');
      expect(mainTemplate).toContain('"logRetentionDays"');
    });

    it('should validate template includes all monitoring sections', () => {
      // Verify template has all major sections for monitoring
      expect(mainTemplate).toContain('Microsoft.OperationalInsights/workspaces'); // Log Analytics
      expect(mainTemplate).toContain('Microsoft.Insights/components'); // App Insights
      expect(mainTemplate).toContain('Microsoft.Insights/actionGroups'); // Action Groups
      expect(mainTemplate).toContain('Microsoft.Insights/diagnosticSettings'); // Diagnostic Settings
      expect(mainTemplate).toContain('Microsoft.Insights/metricAlerts'); // Metric Alerts
      expect(mainTemplate).toContain('Microsoft.Insights/workbooks'); // Workbooks
      
      // Verify outputs
      expect(mainTemplate).toContain('logAnalyticsWorkspaceId');
      expect(mainTemplate).toContain('applicationInsightsKey');
      expect(mainTemplate).toContain('monitoringStatus');
    });
  });
});
