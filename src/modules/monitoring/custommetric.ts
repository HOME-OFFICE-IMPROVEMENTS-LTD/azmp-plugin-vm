/**
 * Custom Metrics Helpers
 * Defines custom metrics for application-specific monitoring
 */

import Handlebars from 'handlebars';

export interface CustomMetricOptions {
  name: string;
  namespace?: string;
  displayName?: string;
  description?: string;
  unit?: 'Count' | 'Bytes' | 'Seconds' | 'Percent' | 'CountPerSecond' | 'BytesPerSecond' | 'Milliseconds';
  aggregation?: 'Average' | 'Sum' | 'Min' | 'Max' | 'Total';
  dimensions?: string | string[];
}

/**
 * Define custom metric for application-specific monitoring
 * @example
 * {{monitor:customMetric
 *   name="OrderProcessingTime"
 *   namespace="ECommerce/Orders"
 *   displayName="Order Processing Time"
 *   description="Time to process customer order in milliseconds"
 *   unit="Milliseconds"
 *   aggregation="Average"
 *   dimensions='["Region","PaymentMethod","OrderType"]'
 * }}
 */
export function monitorCustomMetric(this: any, options: any): string {
  const hash = options.hash as CustomMetricOptions;
  
  if (!hash.name) {
    throw new Error('monitor:customMetric requires name parameter');
  }

  const namespace = hash.namespace || 'Custom/Metrics';
  const displayName = hash.displayName || hash.name;
  const description = hash.description || `Custom metric: ${hash.name}`;
  const unit = hash.unit || 'Count';
  const aggregation = hash.aggregation || 'Average';

  // Parse dimensions array
  let dimensionsArray: string[] = [];
  if (hash.dimensions) {
    if (typeof hash.dimensions === 'string') {
      try {
        dimensionsArray = JSON.parse(hash.dimensions);
      } catch {
        dimensionsArray = [hash.dimensions];
      }
    } else if (Array.isArray(hash.dimensions)) {
      dimensionsArray = hash.dimensions;
    }
  }

  // Custom metrics are defined at the application level
  // This generates a reference structure for documentation
  const result = {
    metricDefinition: {
      name: hash.name,
      namespace: namespace,
      displayName: displayName,
      description: description,
      unit: unit,
      aggregationType: aggregation,
      dimensions: dimensionsArray.map(dim => ({
        name: dim,
        displayName: dim,
        toBeExportedForShoebox: true
      })),
      fillGapWithZero: false,
      category: 'Custom',
      resourceIdDimensionNameOverride: 'ResourceId'
    },
    usage: {
      emitInstrumentation: `Use Application Insights SDK to emit custom metric "${hash.name}" with namespace "${namespace}"`,
      example: {
        dotNet: `telemetryClient.GetMetric("${hash.name}", ${dimensionsArray.map(d => `"${d}"`).join(', ')}).TrackValue(value);`,
        python: `telemetry_client.track_metric("${hash.name}", value, properties={${dimensionsArray.map(d => `"${d}": dimension_value`).join(', ')}})`,
        node: `appInsights.defaultClient.trackMetric({name: "${hash.name}", value: value, ${dimensionsArray.length > 0 ? `properties: {${dimensionsArray.map(d => `"${d}": dimensionValue`).join(', ')}}` : ''}})`
      }
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerCustomMetricHelpers(): void {
  Handlebars.registerHelper('monitor:customMetric', monitorCustomMetric);
}
