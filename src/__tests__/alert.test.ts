import Handlebars from 'handlebars';
import { VmPlugin } from '../index';

describe('Alert Module', () => {
  let plugin: VmPlugin;

  beforeAll(async () => {
    plugin = new VmPlugin({});
    await plugin.initialize({
      logger: { 
        info: jest.fn(), 
        warn: jest.fn(), 
        error: jest.fn(), 
        debug: jest.fn() 
      },
      workspaceRoot: '/tmp/test'
    } as never);
  });

  describe('Helper Registration', () => {
    test('alert helpers should be registered', () => {
      expect(Handlebars.helpers['alert:metricAlert']).toBeDefined();
      expect(Handlebars.helpers['alert:dynamicMetricAlert']).toBeDefined();
      expect(Handlebars.helpers['alert:logAlert']).toBeDefined();
      expect(Handlebars.helpers['alert:activityLogAlert']).toBeDefined();
      expect(Handlebars.helpers['alert:actionGroup']).toBeDefined();
      expect(Handlebars.helpers['alert:smartGroup']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('alert:metricAlert should throw error when name missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:metricAlert'] as any).call(null, { severity: 1, scopes: '[]', criteria: '[]' });
      }).toThrow('alert:metricAlert requires name parameter');
    });

    test('alert:dynamicMetricAlert should throw error when scopes missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:dynamicMetricAlert'] as any).call(null, { name: 'test', severity: 2, criteria: '[]' });
      }).toThrow('alert:dynamicMetricAlert requires scopes parameter');
    });

    test('alert:logAlert should throw error when query missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:logAlert'] as any).call(null, { name: 'test', severity: 1, scopes: '[]' });
      }).toThrow('alert:logAlert requires query parameter');
    });

    test('alert:activityLogAlert should throw error when condition missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:activityLogAlert'] as any).call(null, { name: 'test', scopes: '[]' });
      }).toThrow('alert:activityLogAlert requires condition parameter');
    });

    test('alert:actionGroup should throw error when shortName missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:actionGroup'] as any).call(null, { name: 'test' });
      }).toThrow('alert:actionGroup requires shortName parameter');
    });

    test('alert:smartGroup should throw error when scopes missing', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Handlebars.helpers['alert:smartGroup'] as any).call(null, { name: 'test' });
      }).toThrow('alert:smartGroup requires scopes parameter');
    });
  });
});
