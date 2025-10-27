import * as fs from 'fs';
import * as path from 'path';

/**
 * These tests are for the future wizard-based UI structure (v1.9.0+)
 * v1.8.0 uses a flat structure, so these tests are skipped until the wizard is implemented
 * See: docs/NPM_PUBLISH_DEFERRAL.md and POST_RELEASE_TASKS.md for implementation roadmap
 */
describe.skip('CreateUiDefinition Template - Wizard Structure (Future)', () => {
  let template: string;
  let uiDef: any;

  beforeAll(() => {
    const templatePath = path.join(__dirname, '../../templates/createUiDefinition.json.hbs');
    template = fs.readFileSync(templatePath, 'utf-8');
    // Parse as JSON (no Handlebars compilation needed for structure tests)
    uiDef = JSON.parse(template);
  });

  describe('Schema Structure', () => {
    test('should have correct schema, handler, and version', () => {
      expect(uiDef.$schema).toBe('https://schema.management.azure.com/schemas/0.1.2-preview/CreateUIDefinition.MultiVm.json#');
      expect(uiDef.handler).toBe('Microsoft.Azure.CreateUIDef');
      expect(uiDef.version).toBe('0.1.2-preview');
    });

    test('should configure wizard mode', () => {
      expect(uiDef.parameters.config.isWizard).toBe(true);
      expect(uiDef.parameters.config.basics).toBeDefined();
      expect(uiDef.parameters.config.basics.description).toContain('production-ready');
    });
  });

  describe('Wizard Steps', () => {
    test('should have 4 custom steps plus basics', () => {
      expect(uiDef.parameters.basics).toBeDefined();
      expect(uiDef.parameters.steps).toHaveLength(4);
    });

    test('should have all required steps defined', () => {
      const stepNames = uiDef.parameters.steps.map((s: any) => s.name);
      expect(stepNames).toContain('monitoring');
      expect(stepNames).toContain('costPerformance');
      expect(stepNames).toContain('highAvailability');
      expect(stepNames).toContain('disasterRecovery');
    });

    test('should have correct step labels', () => {
      const steps = uiDef.parameters.steps;
      const monitoringStep = steps.find((s: any) => s.name === 'monitoring');
      const costPerfStep = steps.find((s: any) => s.name === 'costPerformance');
      const haStep = steps.find((s: any) => s.name === 'highAvailability');
      const drStep = steps.find((s: any) => s.name === 'disasterRecovery');

      expect(monitoringStep.label).toBe('Monitoring & Observability');
      expect(costPerfStep.label).toBe('Cost & Performance');
      expect(haStep.label).toBe('High Availability');
      expect(drStep.label).toBe('Disaster Recovery');
    });
  });

  describe('Basics Parameters', () => {
    test('should have all required basics parameters', () => {
      const basicsParams = uiDef.parameters.basics;
      const paramNames = basicsParams.map((p: any) => p.name);
      
      expect(paramNames).toContain('vmName');
      expect(paramNames).toContain('vmSize');
      expect(paramNames).toContain('adminUsername');
      expect(paramNames).toContain('authenticationType');
    });

    test('should validate vmName with proper regex', () => {
      const vmNameParam = uiDef.parameters.basics.find((p: any) => p.name === 'vmName');
      expect(vmNameParam.constraints.required).toBe(true);
      expect(vmNameParam.constraints.regex).toBe('^[a-z0-9A-Z-]{3,64}$');
      expect(vmNameParam.constraints.validationMessage).toContain('3-64 characters');
    });

    test('should configure VM size selector', () => {
      const vmSizeParam = uiDef.parameters.basics.find((p: any) => p.name === 'vmSize');
      expect(vmSizeParam.type).toBe('Microsoft.Compute.SizeSelector');
      expect(vmSizeParam.recommendedSizes).toContain('Standard_D2s_v3');
      expect(vmSizeParam.osPlatform).toBe('Linux');
    });
  });

  describe('Monitoring Parameters', () => {
    test('should have enableMonitoring checkbox', () => {
      const monitoringStep = uiDef.parameters.steps.find((s: any) => s.name === 'monitoring');
      const monitoringSection = monitoringStep.elements.find((e: any) => e.name === 'monitoringSection');
      const enableParam = monitoringSection.elements.find((e: any) => e.name === 'enableMonitoring');
      
      expect(enableParam.type).toBe('Microsoft.Common.CheckBox');
      expect(enableParam.defaultValue).toBe(true);
    });

    test('should configure Log Analytics workspace name', () => {
      const template = uiDef.parameters.steps
        .find((s: any) => s.name === 'monitoring').elements
        .find((e: any) => e.name === 'monitoringSection').elements
        .find((e: any) => e.name === 'logAnalyticsWorkspaceName');
      
      expect(template.constraints.regex).toBe('^[a-zA-Z0-9-]{4,63}$');
      expect(template.constraints.validationMessage).toContain('4-63 characters');
    });

    test('should configure retention slider with correct range', () => {
      const retentionParam = uiDef.parameters.steps
        .find((s: any) => s.name === 'monitoring').elements
        .find((e: any) => e.name === 'monitoringSection').elements
        .find((e: any) => e.name === 'logAnalyticsRetentionDays');
      
      expect(retentionParam.type).toBe('Microsoft.Common.Slider');
      expect(retentionParam.min).toBe(30);
      expect(retentionParam.max).toBe(730);
      expect(retentionParam.defaultValue).toBe(30);
    });

    test('should configure metric alert thresholds', () => {
      const alertsSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'monitoring').elements
        .find((e: any) => e.name === 'alertsSection');
      
      const cpuThreshold = alertsSection.elements.find((e: any) => e.name === 'cpuAlertThreshold');
      const memoryThreshold = alertsSection.elements.find((e: any) => e.name === 'memoryAlertThreshold');
      const diskThreshold = alertsSection.elements.find((e: any) => e.name === 'diskAlertThreshold');
      
      expect(cpuThreshold.min).toBe(1);
      expect(cpuThreshold.max).toBe(100);
      expect(cpuThreshold.defaultValue).toBe(80);
      
      expect(memoryThreshold.defaultValue).toBe(80);
      expect(diskThreshold.defaultValue).toBe(85);
    });

    test('should configure workbook types dropdown', () => {
      const workbooksSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'monitoring').elements
        .find((e: any) => e.name === 'workbooksSection');
      
      const workbookTypes = workbooksSection.elements.find((e: any) => e.name === 'workbookTypes');
      expect(workbookTypes.multiselect).toBe(true);
      expect(workbookTypes.constraints.allowedValues).toHaveLength(4);
      
      const values = workbookTypes.constraints.allowedValues.map((v: any) => v.value);
      expect(values).toContain('performance');
      expect(values).toContain('security');
      expect(values).toContain('availability');
      expect(values).toContain('cost');
    });
  });

  describe('Cost & Performance Parameters', () => {
    test('should have cost optimization checkbox', () => {
      const costSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'costSection');
      
      const enableParam = costSection.elements.find((e: any) => e.name === 'enableCostOptimization');
      expect(enableParam.type).toBe('Microsoft.Common.CheckBox');
      expect(enableParam.defaultValue).toBe(true);
    });

    test('should validate budget limit', () => {
      const budgetParam = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'costSection').elements
        .find((e: any) => e.name === 'monthlyBudgetLimit');
      
      expect(budgetParam.constraints.regex).toBe('^[0-9]+$');
      expect(budgetParam.defaultValue).toBe('500');
    });

    test('should configure performance profile dropdown', () => {
      const perfSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'performanceSection');
      
      const profileParam = perfSection.elements.find((e: any) => e.name === 'performanceProfile');
      expect(profileParam.type).toBe('Microsoft.Common.DropDown');
      expect(profileParam.constraints.allowedValues).toHaveLength(3);
      
      const values = profileParam.constraints.allowedValues.map((v: any) => v.value);
      expect(values).toContain('LowCost');
      expect(values).toContain('Balanced');
      expect(values).toContain('HighPerformance');
    });

    test('should configure autoscale parameters', () => {
      const perfSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'performanceSection');
      
      const minInstances = perfSection.elements.find((e: any) => e.name === 'autoscaleMinInstances');
      const maxInstances = perfSection.elements.find((e: any) => e.name === 'autoscaleMaxInstances');
      const cpuThreshold = perfSection.elements.find((e: any) => e.name === 'autoscaleCpuThreshold');
      
      expect(minInstances.constraints.regex).toBe('^[1-9][0-9]?$|^100$');
      expect(maxInstances.constraints.regex).toBe('^[1-9][0-9]{0,2}$|^1000$');
      expect(cpuThreshold.min).toBe(1);
      expect(cpuThreshold.max).toBe(100);
      expect(cpuThreshold.defaultValue).toBe(75);
    });
  });

  describe('High Availability Parameters', () => {
    test('should have HA enable checkbox', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const enableParam = haSection.elements.find((e: any) => e.name === 'enableHighAvailability');
      expect(enableParam.type).toBe('Microsoft.Common.CheckBox');
      expect(enableParam.defaultValue).toBe(false);
    });

    test('should configure availability option dropdown', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const availOption = haSection.elements.find((e: any) => e.name === 'availabilityOption');
      expect(availOption.type).toBe('Microsoft.Common.DropDown');
      expect(availOption.constraints.allowedValues).toHaveLength(4);
      
      const values = availOption.constraints.allowedValues.map((v: any) => v.value);
      expect(values).toContain('None');
      expect(values).toContain('AvailabilityZones');
      expect(values).toContain('AvailabilitySet');
      expect(values).toContain('VMSS');
    });

    test('should configure availability zones multiselect', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const zonesParam = haSection.elements.find((e: any) => e.name === 'availabilityZones');
      expect(zonesParam.multiselect).toBe(true);
      expect(zonesParam.constraints.allowedValues).toHaveLength(3);
      expect(zonesParam.defaultValue).toEqual(['1', '2', '3']);
    });

    test('should configure availability set fault/update domains', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const faultDomains = haSection.elements.find((e: any) => e.name === 'availabilitySetFaultDomains');
      const updateDomains = haSection.elements.find((e: any) => e.name === 'availabilitySetUpdateDomains');
      
      expect(faultDomains.min).toBe(1);
      expect(faultDomains.max).toBe(3);
      expect(faultDomains.defaultValue).toBe(2);
      
      expect(updateDomains.min).toBe(1);
      expect(updateDomains.max).toBe(20);
      expect(updateDomains.defaultValue).toBe(5);
    });

    test('should validate VMSS instance count', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const vmssCount = haSection.elements.find((e: any) => e.name === 'vmssInstanceCount');
      expect(vmssCount.constraints.regex).toBe('^[1-9][0-9]{0,2}$|^1000$');
      expect(vmssCount.defaultValue).toBe('2');
    });
  });

  describe('Disaster Recovery Parameters', () => {
    test('should have DR enable checkbox', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const enableParam = drSection.elements.find((e: any) => e.name === 'enableDisasterRecovery');
      expect(enableParam.type).toBe('Microsoft.Common.CheckBox');
      expect(enableParam.defaultValue).toBe(false);
    });

    test('should configure backup policy dropdown', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const policyParam = drSection.elements.find((e: any) => e.name === 'backupPolicyType');
      expect(policyParam.type).toBe('Microsoft.Common.DropDown');
      
      const values = policyParam.constraints.allowedValues.map((v: any) => v.value);
      expect(values).toContain('Standard');
      expect(values).toContain('Enhanced');
    });

    test('should configure backup retention slider', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const retentionParam = drSection.elements.find((e: any) => e.name === 'backupRetentionDays');
      expect(retentionParam.type).toBe('Microsoft.Common.Slider');
      expect(retentionParam.min).toBe(7);
      expect(retentionParam.max).toBe(365);
      expect(retentionParam.defaultValue).toBe(30);
    });

    test('should configure backup frequency dropdown', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const frequencyParam = drSection.elements.find((e: any) => e.name === 'backupFrequency');
      const values = frequencyParam.constraints.allowedValues.map((v: any) => v.value);
      expect(values).toContain('Daily');
      expect(values).toContain('Weekly');
    });

    test('should validate backup time format', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const timeParam = drSection.elements.find((e: any) => e.name === 'backupTime');
      expect(timeParam.constraints.regex).toBe('^([01][0-9]|2[0-3]):[0-5][0-9]$');
      expect(timeParam.defaultValue).toBe('02:00');
      expect(timeParam.constraints.validationMessage).toContain('HH:MM');
    });

    test('should configure site recovery parameters', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const siteRecoveryParam = drSection.elements.find((e: any) => e.name === 'enableSiteRecovery');
      const recoveryRegionParam = drSection.elements.find((e: any) => e.name === 'recoveryRegion');
      
      expect(siteRecoveryParam.type).toBe('Microsoft.Common.CheckBox');
      expect(siteRecoveryParam.defaultValue).toBe(false);
      
      expect(recoveryRegionParam.defaultValue).toBe('eastus2');
      expect(recoveryRegionParam.constraints.regex).toBe('^[a-z0-9]+$');
    });
  });

  describe('Conditional Visibility', () => {
    test('should hide monitoring fields when monitoring disabled', () => {
      const monitoringStep = uiDef.parameters.steps.find((s: any) => s.name === 'monitoring');
      const monitoringSection = monitoringStep.elements.find((e: any) => e.name === 'monitoringSection');
      const workspaceName = monitoringSection.elements.find((e: any) => e.name === 'logAnalyticsWorkspaceName');
      
      expect(workspaceName.visible).toContain("steps('monitoring').monitoringSection.enableMonitoring");
    });

    test('should hide autoscale fields when autoscale disabled', () => {
      const perfSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'performanceSection');
      
      const minInstances = perfSection.elements.find((e: any) => e.name === 'autoscaleMinInstances');
      expect(minInstances.visible).toContain('enableAutoscale');
    });

    test('should hide availability zones when option not selected', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const zonesParam = haSection.elements.find((e: any) => e.name === 'availabilityZones');
      expect(zonesParam.visible).toContain("equals(steps('highAvailability').haSection.availabilityOption, 'AvailabilityZones')");
    });

    test('should hide backup fields when backup disabled', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const policyParam = drSection.elements.find((e: any) => e.name === 'backupPolicyType');
      expect(policyParam.visible).toContain('enableBackup');
    });
  });

  describe('Output Mappings', () => {
    test('should map all basics parameters to outputs', () => {
      const outputs = uiDef.parameters.outputs;
      
      expect(outputs.location).toBe('[location()]');
      expect(outputs.vmName).toBe("[basics('vmName')]");
      expect(outputs.vmSize).toBe("[basics('vmSize')]");
      expect(outputs.adminUsername).toBe("[basics('adminUsername')]");
      expect(outputs.authenticationType).toBe("[basics('authenticationType')]");
    });

    test('should map monitoring parameters to outputs', () => {
      const outputs = uiDef.parameters.outputs;
      
      expect(outputs.enableMonitoring).toBe("[steps('monitoring').monitoringSection.enableMonitoring]");
      expect(outputs.logAnalyticsWorkspaceName).toBe("[steps('monitoring').monitoringSection.logAnalyticsWorkspaceName]");
      expect(outputs.logAnalyticsRetentionDays).toBe("[steps('monitoring').monitoringSection.logAnalyticsRetentionDays]");
      expect(outputs.enableApplicationInsights).toBe("[steps('monitoring').monitoringSection.enableApplicationInsights]");
    });

    test('should map cost/performance parameters to outputs', () => {
      const outputs = uiDef.parameters.outputs;
      
      expect(outputs.enableCostOptimization).toBe("[steps('costPerformance').costSection.enableCostOptimization]");
      expect(outputs.monthlyBudgetLimit).toBe("[int(steps('costPerformance').costSection.monthlyBudgetLimit)]");
      expect(outputs.enablePerformanceOptimization).toBe("[steps('costPerformance').performanceSection.enablePerformanceOptimization]");
      expect(outputs.performanceProfile).toBe("[steps('costPerformance').performanceSection.performanceProfile]");
    });

    test('should map HA parameters to outputs', () => {
      const outputs = uiDef.parameters.outputs;
      
      expect(outputs.enableHighAvailability).toBe("[steps('highAvailability').haSection.enableHighAvailability]");
      expect(outputs.availabilityOption).toBe("[steps('highAvailability').haSection.availabilityOption]");
      expect(outputs.availabilityZones).toBe("[steps('highAvailability').haSection.availabilityZones]");
    });

    test('should map DR parameters to outputs', () => {
      const outputs = uiDef.parameters.outputs;
      
      expect(outputs.enableDisasterRecovery).toBe("[steps('disasterRecovery').drSection.enableDisasterRecovery]");
      expect(outputs.enableBackup).toBe("[steps('disasterRecovery').drSection.enableBackup]");
      expect(outputs.backupPolicyType).toBe("[steps('disasterRecovery').drSection.backupPolicyType]");
      expect(outputs.backupRetentionDays).toBe("[steps('disasterRecovery').drSection.backupRetentionDays]");
    });

    test('should handle email recipients array transformation', () => {
      const outputs = uiDef.parameters.outputs;
      expect(outputs.alertEmailRecipients).toContain('split');
      expect(outputs.alertEmailRecipients).toContain("steps('monitoring').alertsSection.alertEmailRecipients");
    });
  });

  describe('Validation Rules', () => {
    test('should require vmName with proper pattern', () => {
      const vmNameParam = uiDef.parameters.basics.find((p: any) => p.name === 'vmName');
      expect(vmNameParam.constraints.required).toBe(true);
      expect(vmNameParam.constraints.regex).toBeDefined();
    });

    test('should validate backup time as HH:MM format', () => {
      const drSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'disasterRecovery').elements
        .find((e: any) => e.name === 'drSection');
      
      const timeParam = drSection.elements.find((e: any) => e.name === 'backupTime');
      const regex = new RegExp(timeParam.constraints.regex);
      
      expect(regex.test('02:00')).toBe(true);
      expect(regex.test('23:59')).toBe(true);
      expect(regex.test('00:00')).toBe(true);
      expect(regex.test('24:00')).toBe(false);
      expect(regex.test('2:00')).toBe(false);
    });

    test('should validate instance counts with proper ranges', () => {
      const perfSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'performanceSection');
      
      const minInstances = perfSection.elements.find((e: any) => e.name === 'autoscaleMinInstances');
      const maxInstances = perfSection.elements.find((e: any) => e.name === 'autoscaleMaxInstances');
      
      const minRegex = new RegExp(minInstances.constraints.regex);
      const maxRegex = new RegExp(maxInstances.constraints.regex);
      
      // Min instances: 1-100
      expect(minRegex.test('1')).toBe(true);
      expect(minRegex.test('50')).toBe(true);
      expect(minRegex.test('100')).toBe(true);
      expect(minRegex.test('0')).toBe(false);
      expect(minRegex.test('101')).toBe(false);
      
      // Max instances: 1-1000
      expect(maxRegex.test('1')).toBe(true);
      expect(maxRegex.test('500')).toBe(true);
      expect(maxRegex.test('1000')).toBe(true);
      expect(maxRegex.test('1001')).toBe(false);
    });
  });

  describe('Tooltips & Descriptions', () => {
    test('should provide helpful tooltips for complex parameters', () => {
      const haSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'highAvailability').elements
        .find((e: any) => e.name === 'haSection');
      
      const availOption = haSection.elements.find((e: any) => e.name === 'availabilityOption');
      expect(availOption.toolTip).toBeDefined();
      expect(availOption.toolTip).toContain('HA deployment');
    });

    test('should provide descriptions for wizard steps', () => {
      const monitoringStep = uiDef.parameters.steps.find((s: any) => s.name === 'monitoring');
      expect(monitoringStep.label).toBeDefined();
      expect(monitoringStep.label).toBe('Monitoring & Observability');
    });

    test('should explain performance profiles in labels', () => {
      const perfSection = uiDef.parameters.steps
        .find((s: any) => s.name === 'costPerformance').elements
        .find((e: any) => e.name === 'performanceSection');
      
      const profileParam = perfSection.elements.find((e: any) => e.name === 'performanceProfile');
      const labels = profileParam.constraints.allowedValues.map((v: any) => v.label);
      
      expect(labels[0]).toContain('Standard_LRS');
      expect(labels[1]).toContain('StandardSSD_LRS');
      expect(labels[2]).toContain('Premium_LRS');
    });
  });
});
