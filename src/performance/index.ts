/**
 * Performance optimization module exports.
 */

export {
  PerformanceAnalyzer,
  type PerformanceMetrics,
  type PerformanceAnalysis,
  type BurstAnalysis,
  type DiskPerformanceAnalysis
} from './analyzer';

export {
  AutoscaleEngine,
  type AutoscaleConfiguration,
  type AutoscaleProfile,
  type AutoscaleRule,
  type LoadPattern,
  type PredictiveScalingRecommendation,
  type ScalingSimulation
} from './autoscale';

export { registerPerformanceHelpers } from './helpers';

