import * as fs from 'fs';
import * as path from 'path';

describe('Template Validation System', () => {
  describe('ViewDefinition Template', () => {
    let viewDef: any;

    beforeAll(() => {
      const viewDefPath = path.join(__dirname, '../../templates/viewDefinition.json.hbs');
      const content = fs.readFileSync(viewDefPath, 'utf-8');
      viewDef = JSON.parse(content);
    });

    test('should have correct schema and content version', () => {
      expect(viewDef.$schema).toBe('https://schema.management.azure.com/schemas/viewdefinition/0.0.1-preview/ViewDefinition.json#');
      expect(viewDef.contentVersion).toBe('1.0.0.0');
    });

    test('should define all required view types', () => {
      const viewKinds = viewDef.views.map((v: any) => v.kind);
      expect(viewKinds).toContain('Overview');
      expect(viewKinds).toContain('Metrics');
      expect(viewKinds).toContain('CustomResources');
      expect(viewKinds).toContain('Properties');
    });

    test('should have monitoring view with Log Analytics and Application Insights', () => {
      const monitoringView = viewDef.views.find((v: any) => 
        v.properties.displayName === 'Monitoring'
      );
      expect(monitoringView).toBeDefined();
      expect(monitoringView.properties.commands).toBeDefined();
      expect(monitoringView.properties.commands.length).toBeGreaterThanOrEqual(2);
      
      const commandNames = monitoringView.properties.commands.map((c: any) => c.displayName);
      expect(commandNames).toContain('Open Log Analytics');
      expect(commandNames).toContain('View Application Insights');
    });

    test('should have cost management view with budget tracking', () => {
      const costView = viewDef.views.find((v: any) => 
        v.properties.displayName === 'Cost Management'
      );
      expect(costView).toBeDefined();
      expect(costView.properties.resources).toBeDefined();
      
      const resourceTypes = costView.properties.resources.map((r: any) => r.type);
      expect(resourceTypes).toContain('Microsoft.Consumption/budgets');
    });

    test('should have resilience view with HA and DR resources', () => {
      const resilienceView = viewDef.views.find((v: any) => 
        v.properties.displayName === 'Resilience'
      );
      expect(resilienceView).toBeDefined();
      expect(resilienceView.properties.resources).toBeDefined();
      
      const resourceTypes = resilienceView.properties.resources.map((r: any) => r.type);
      expect(resourceTypes).toContain('Microsoft.Compute/availabilitySets');
      expect(resourceTypes).toContain('Microsoft.RecoveryServices/vaults');
    });

    test('should have performance metrics view with charts', () => {
      const metricsView = viewDef.views.find((v: any) => 
        v.kind === 'Metrics'
      );
      expect(metricsView).toBeDefined();
      expect(metricsView.properties.charts).toBeDefined();
      expect(metricsView.properties.charts.length).toBeGreaterThanOrEqual(3);
      
      const chartNames = metricsView.properties.charts.map((c: any) => c.displayName);
      expect(chartNames).toContain('CPU Utilization');
      expect(chartNames).toContain('Disk Operations');
      expect(chartNames).toContain('Network Traffic');
    });

    test('should have outputs view with deployment information', () => {
      const outputsView = viewDef.views.find((v: any) => 
        v.properties.displayName === 'Outputs'
      );
      expect(outputsView).toBeDefined();
      expect(outputsView.properties.rows).toBeDefined();
      
      const outputNames = outputsView.properties.rows.map((r: any) => r.name);
      expect(outputNames).toContain('VM Resource ID');
      expect(outputNames).toContain('Public IP Address');
      expect(outputNames).toContain('SSH Command');
      expect(outputNames).toContain('Resilience Tier');
    });
  });

  describe('Output Validation', () => {
    let mainTemplate: string;

    beforeAll(() => {
      const mainTemplatePath = path.join(__dirname, '../../templates/mainTemplate.json.hbs');
      mainTemplate = fs.readFileSync(mainTemplatePath, 'utf-8');
    });

    test('should define all monitoring outputs', () => {
      expect(mainTemplate).toContain('"logAnalyticsWorkspaceId"');
      expect(mainTemplate).toContain('"applicationInsightsKey"');
      expect(mainTemplate).toContain('"monitoringStatus"');
    });

    test('should define cost optimization outputs', () => {
      expect(mainTemplate).toContain('"costAnalysis"');
      expect(mainTemplate).toContain('"estimatedMonthlyCost"');
    });

    test('should define performance optimization outputs', () => {
      expect(mainTemplate).toContain('"performanceMetrics"');
      expect(mainTemplate).toContain('"optimizationStatus"');
    });

    test('should define HA/DR outputs', () => {
      expect(mainTemplate).toContain('"highAvailabilityStatus"');
      expect(mainTemplate).toContain('"disasterRecoveryStatus"');
      expect(mainTemplate).toContain('"resilienceScore"');
    });

    test('should define basic infrastructure outputs', () => {
      expect(mainTemplate).toContain('"hostname"');
      expect(mainTemplate).toContain('"sshCommand"');
    });
  });
});
