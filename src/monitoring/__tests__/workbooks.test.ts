import { AdvancedWorkbookGenerator, advancedWorkbookTemplates } from '../index';

describe('AdvancedWorkbookGenerator', () => {
  it('generates VM performance workbook with expected sections', () => {
    const workbook = AdvancedWorkbookGenerator.generateVmPerformanceWorkbook();
    expect(workbook.version).toBe('Notebook/1.0');
    const itemNames = workbook.items.map((item: any) => item.name);
    expect(itemNames).toContain('Performance Trends');
    expect(itemNames).toContain('Scaling Patterns');
  });

  it('generates VMSS scaling workbook with autoscale sections', () => {
    const workbook = AdvancedWorkbookGenerator.generateVmssScalingWorkbook();
    const textSections = workbook.items
      .filter((item: any) => item.type === 1) // type 1 = text
      .map((item: any) => item.content?.json || '');
    expect(textSections.join(' ')).toContain('Autoscale Performance');
    expect(textSections.join(' ')).toContain('Predictive Analysis');
  });

  it('registers advanced workbook templates', () => {
    const templateIds = advancedWorkbookTemplates.map((template) => template.id);
    expect(templateIds).toEqual(
      expect.arrayContaining([
        'vm-performance-analytics',
        'vmss-scaling-analytics',
        'vm-cost-optimization'
      ])
    );
  });
});

