/**
 * Scaling Module
 *
 * Provides Handlebars helpers for advanced scaling scenarios including
 * Virtual Machine Scale Sets and auto-scaling policies.
 *
 * @module scaling
 */

import Handlebars from 'handlebars';
import { vmssHelpers } from './vmss';
import { autoscaleHelpers } from './autoscale';
import { multiregionHelpers } from './multiregion';

type HelperFunction = (...args: any[]) => unknown;

/**
 * Combined scaling helpers map
 */
export const scalingHelpers = {
  ...vmssHelpers,
  ...autoscaleHelpers,
  ...multiregionHelpers
};

/**
 * Register scaling helpers with Handlebars under the `scale:` namespace.
 */
export function registerScalingHelpers(): void {
  Object.entries(scalingHelpers).forEach(([name, helper]) => {
    Handlebars.registerHelper(name, function (...args: unknown[]) {
      const result = (helper as HelperFunction)(...args);
      // Return JSON for objects to keep consistent helper behavior.
      if (typeof result === 'object' && result !== null) {
        return JSON.stringify(result, null, 2);
      }
      return result;
    });
  });
}

export {
  vmssHelpers,
  createVmssDefinition,
  type VmssDefinitionOptions,
  type VmssOrchestrationMode,
  type VmssUpgradeMode
} from './vmss';

export {
  autoscaleHelpers,
  createAutoScalePolicy,
  createMetricScaleRule,
  createScheduleProfile,
  createCpuScalingPolicy,
  createBusinessHoursSchedule,
  type AutoScalePolicyOptions,
  type MetricScaleRule,
  type ScheduleScaleRule,
  type AutoScaleProfile,
  type MetricName,
  type ScaleDirection,
  type TimeAggregationType,
  type ComparisonOperator
} from './autoscale';

export {
  multiregionHelpers,
  createTrafficManagerProfile,
  createTrafficManagerEndpointConfig,
  createMultiRegionDeploymentPlan,
  createFailoverPlan,
  type TrafficManagerProfileOptions,
  type TrafficManagerEndpointOptions,
  type TrafficRoutingMethod,
  type TrafficManagerMonitorProtocol,
  type MultiRegionDeploymentPlan,
  type RegionDeployment,
  type FailoverPlanOptions,
  type FailoverStep
} from './multiregion';
