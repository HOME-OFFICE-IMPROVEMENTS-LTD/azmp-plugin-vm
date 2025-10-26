import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

type WizardStep = {
  name: string;
  label: string;
  elements: Array<Record<string, any>>;
};

const loadCreateUiDefinition = (): { parameters: any; outputs: Record<string, any> } => {
  const uiPath = path.join(__dirname, '../../templates/createUiDefinition.json.hbs');
  const content = fs.readFileSync(uiPath, 'utf-8');
  return JSON.parse(content);
};

const findStep = (steps: WizardStep[], name: string): WizardStep | undefined =>
  steps.find((step) => step.name === name);

const stepHasElement = (step: WizardStep, elementName: string): boolean => {
  const search = (elements: any[]): boolean =>
    elements.some((element) => {
      if (element.name === elementName) {
        return true;
      }
      if (Array.isArray(element.elements)) {
        return search(element.elements);
      }
      return false;
    });

  return search(step.elements);
};

describe('createUiDefinition wizard', () => {
  let uiDefinition: ReturnType<typeof loadCreateUiDefinition>;
  let steps: WizardStep[];

  beforeAll(() => {
    uiDefinition = loadCreateUiDefinition();
    steps = uiDefinition.parameters.steps ?? [];
  });

  test('should configure wizard basics', () => {
    expect(uiDefinition.parameters.config.isWizard).toBe(true);
    expect(uiDefinition.parameters.config.basics.description).toContain('production-ready virtual machine');
    expect(uiDefinition.parameters.basics).toHaveLength(6);
  });

  test('should include monitoring step with workspace and alerts', () => {
    const monitoring = findStep(steps, 'monitoring');
    expect(monitoring).toBeDefined();
    expect(stepHasElement(monitoring!, 'enableMonitoring')).toBe(true);
    expect(stepHasElement(monitoring!, 'logAnalyticsWorkspaceName')).toBe(true);
    expect(stepHasElement(monitoring!, 'enableMetricAlerts')).toBe(true);
    expect(stepHasElement(monitoring!, 'workbookTypes')).toBe(true);
  });

  test('should include cost and performance step with budget and autoscale controls', () => {
    const costPerf = findStep(steps, 'costPerformance');
    expect(costPerf).toBeDefined();
    expect(stepHasElement(costPerf!, 'enableCostOptimization')).toBe(true);
    expect(stepHasElement(costPerf!, 'monthlyBudgetLimit')).toBe(true);
    expect(stepHasElement(costPerf!, 'enablePerformanceOptimization')).toBe(true);
    expect(stepHasElement(costPerf!, 'enableAutoscale')).toBe(true);
    expect(stepHasElement(costPerf!, 'autoscaleMaxInstances')).toBe(true);
  });

  test('should include high availability step with availability options', () => {
    const haStep = findStep(steps, 'highAvailability');
    expect(haStep).toBeDefined();
    expect(stepHasElement(haStep!, 'enableHighAvailability')).toBe(true);
    expect(stepHasElement(haStep!, 'availabilityOption')).toBe(true);
    expect(stepHasElement(haStep!, 'availabilityZones')).toBe(true);
    expect(stepHasElement(haStep!, 'vmssInstanceCount')).toBe(true);
  });

  test('should include disaster recovery step with backup and site recovery controls', () => {
    const drStep = findStep(steps, 'disasterRecovery');
    expect(drStep).toBeDefined();
    expect(stepHasElement(drStep!, 'enableDisasterRecovery')).toBe(true);
    expect(stepHasElement(drStep!, 'enableBackup')).toBe(true);
    expect(stepHasElement(drStep!, 'backupRetentionDays')).toBe(true);
    expect(stepHasElement(drStep!, 'enableSiteRecovery')).toBe(true);
    expect(stepHasElement(drStep!, 'recoveryRegion')).toBe(true);
  });

  test('should map monitoring values to outputs', () => {
    const outputs = uiDefinition.outputs;
    expect(outputs.enableMonitoring).toContain("steps('monitoring')");
    expect(outputs.enableWorkbooks).toContain("steps('monitoring')");
    expect(outputs.alertEmailRecipients).toContain("steps('monitoring').alertsSection.alertEmailRecipients");
  });

  test('should map cost and performance values to outputs', () => {
    const outputs = uiDefinition.outputs;
    expect(outputs.enableCostOptimization).toContain("steps('costPerformance').costSection.enableCostOptimization");
    expect(outputs.monthlyBudgetLimit).toContain("steps('costPerformance').costSection.monthlyBudgetLimit");
    expect(outputs.enablePerformanceOptimization).toContain("steps('costPerformance').performanceSection.enablePerformanceOptimization");
    expect(outputs.autoscaleMaxInstances).toContain("steps('costPerformance').performanceSection.autoscaleMaxInstances");
  });

  test('should map HA/DR values to outputs', () => {
    const outputs = uiDefinition.outputs;
    expect(outputs.enableHighAvailability).toContain("steps('highAvailability').haSection.enableHighAvailability");
    expect(outputs.availabilityOption).toContain("steps('highAvailability').haSection.availabilityOption");
    expect(outputs.enableDisasterRecovery).toContain("steps('disasterRecovery').drSection.enableDisasterRecovery");
    expect(outputs.recoveryRegion).toContain("steps('disasterRecovery').drSection.recoveryRegion");
  });
});

