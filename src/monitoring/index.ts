/**
 * Enhanced monitoring exports.
 */

export {
  AdvancedWorkbookGenerator,
  advancedWorkbookTemplates,
  type AdvancedWorkbookTemplate,
  type WorkbookDefinition
} from './workbooks';

export {
  MonitoringAlertEngine,
  type AlertRuleDefinition,
  type CpuAlertOptions,
  type MemoryAlertOptions,
  type CostAnomalyAlertOptions,
  type ScalingHealthAlertOptions
} from './alerts';

export { registerEnhancedMonitoringHelpers } from './helpers';
