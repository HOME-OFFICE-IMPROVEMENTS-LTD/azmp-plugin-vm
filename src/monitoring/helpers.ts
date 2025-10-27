/**
 * Handlebars helpers for enhanced monitoring alerts and workbooks.
 */

import Handlebars from 'handlebars';
import {
  MonitoringAlertEngine,
  type AlertRuleDefinition,
  type CpuAlertOptions,
  type MemoryAlertOptions,
  type CostAnomalyAlertOptions,
  type ScalingHealthAlertOptions
} from './alerts';

const safeStringify = (value: unknown): Handlebars.SafeString => {
  return new Handlebars.SafeString(JSON.stringify(value, null, 2));
};

const parseOptions = <T>(hash: Record<string, any>, required: string[] = []): T => {
  required.forEach((key) => {
    if (!hash[key]) {
      throw new Error(`Missing required option "${key}"`);
    }
  });
  return hash as unknown as T;
};

const toMetricResource = (definition: AlertRuleDefinition): Handlebars.SafeString => {
  const resource = MonitoringAlertEngine.toMetricAlertResource(definition);
  return safeStringify(resource);
};

const toScheduledQueryResource = (definition: AlertRuleDefinition, workspaceId: string): Handlebars.SafeString => {
  const resource = MonitoringAlertEngine.toScheduledQueryResource(definition, workspaceId);
  return safeStringify(resource);
};

export function registerEnhancedMonitoringHelpers(): void {
  Handlebars.registerHelper('monitor:cpuAlert', function(options: any) {
    try {
      const alertOptions = parseOptions<CpuAlertOptions>(options.hash, ['resourceId']);
      const definition = MonitoringAlertEngine.createCpuAlert(alertOptions);
      return safeStringify(definition);
    } catch (error) {
      return `Error generating CPU alert: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  Handlebars.registerHelper('monitor:memoryAlert', function(options: any) {
    try {
      const alertOptions = parseOptions<MemoryAlertOptions>(options.hash, ['resourceId']);
      const definition = MonitoringAlertEngine.createMemoryAlert(alertOptions);
      return safeStringify(definition);
    } catch (error) {
      return `Error generating memory alert: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  Handlebars.registerHelper('monitor:costAlert', function(options: any) {
    try {
      const alertOptions = parseOptions<CostAnomalyAlertOptions>(options.hash, ['scopeId']);
      const definition = MonitoringAlertEngine.createCostAnomalyAlert(alertOptions);
      return safeStringify(definition);
    } catch (error) {
      return `Error generating cost alert: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  Handlebars.registerHelper('monitor:scalingAlert', function(options: any) {
    try {
      const alertOptions = parseOptions<ScalingHealthAlertOptions>(options.hash, ['resourceId']);
      const definition = MonitoringAlertEngine.createScalingHealthAlert(alertOptions);
      return safeStringify(definition);
    } catch (error) {
      return `Error generating scaling alert: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  Handlebars.registerHelper('monitor:metricResource', function(definitionJson: string) {
    try {
      const definition = typeof definitionJson === 'string' ? JSON.parse(definitionJson) as AlertRuleDefinition : definitionJson;
      return toMetricResource(definition);
    } catch (error) {
      return `Error generating metric alert resource: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  Handlebars.registerHelper('monitor:logResource', function(definitionJson: string, workspaceId: string) {
    try {
      if (!workspaceId) {
        throw new Error('workspaceId parameter is required');
      }
      const definition = typeof definitionJson === 'string' ? JSON.parse(definitionJson) as AlertRuleDefinition : definitionJson;
      return toScheduledQueryResource(definition, workspaceId);
    } catch (error) {
      return `Error generating scheduled query resource: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });
}

