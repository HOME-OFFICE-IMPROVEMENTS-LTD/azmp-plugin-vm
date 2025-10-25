import * as Handlebars from 'handlebars';

export interface CostAnalysisDashboardOptions {
  name: string;
  location: string;
  subscriptionId: string;
  resourceGroups?: string[];
  showCostTrends?: boolean;
  showCostByService?: boolean;
  showCostByRegion?: boolean;
  showBudgetStatus?: boolean;
  timeRange?: string; // P7D, P30D, P90D
  tags?: Record<string, string>;
}

/**
 * Generate cost analysis dashboard
 */
export function dashboardCostAnalysis(this: unknown, options: CostAnalysisDashboardOptions): string {
  if (!options.name) throw new Error('name is required for dashboard:costAnalysis');
  if (!options.location) throw new Error('location is required for dashboard:costAnalysis');
  if (!options.subscriptionId) throw new Error('subscriptionId is required for dashboard:costAnalysis');

  const showCostTrends = options.showCostTrends !== false;
  const showCostByService = options.showCostByService !== false;
  const showCostByRegion = options.showCostByRegion !== false;
  const showBudgetStatus = options.showBudgetStatus !== false;
  const timeRange = options.timeRange || 'P30D';

  const parts: unknown[] = [];
  let yPosition = 0;

  // Cost scope filter (subscription or resource groups)
  const scope = options.resourceGroups && options.resourceGroups.length > 0
    ? `/subscriptions/${options.subscriptionId}/resourceGroups/${options.resourceGroups[0]}`
    : `/subscriptions/${options.subscriptionId}`;

  if (showCostTrends) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: 'Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart',
        settings: {
          content: {
            configurationId: `cost-trends-${options.name}`,
            scope,
            chartType: 'Line',
            granularity: 'Daily',
            grouping: [],
            timePeriod: { type: 'relative', duration: timeRange },
            title: 'Cost Trends Over Time'
          }
        }
      }
    });
    yPosition += 4;
  }

  if (showCostByService) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: 'Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart',
        settings: {
          content: {
            configurationId: `cost-by-service-${options.name}`,
            scope,
            chartType: 'StackedColumn',
            granularity: 'None',
            grouping: [{ type: 'Dimension', name: 'ServiceName' }],
            timePeriod: { type: 'relative', duration: timeRange },
            title: 'Cost by Service'
          }
        }
      }
    });
  }

  if (showCostByRegion) {
    parts.push({
      position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: 'Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart',
        settings: {
          content: {
            configurationId: `cost-by-region-${options.name}`,
            scope,
            chartType: 'Pie',
            granularity: 'None',
            grouping: [{ type: 'Dimension', name: 'ResourceLocation' }],
            timePeriod: { type: 'relative', duration: timeRange },
            title: 'Cost by Region'
          }
        }
      }
    });
    yPosition += 4;
  }

  if (showBudgetStatus) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 3 },
      metadata: {
        type: 'Extension/Microsoft_Azure_CostManagement/PartType/BudgetsPart',
        settings: {
          content: {
            scope,
            title: 'Budget Status'
          }
        }
      }
    });
    yPosition += 3;
  }

  // Additional resource group breakdown if specified
  if (options.resourceGroups && options.resourceGroups.length > 1) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: 'Extension/Microsoft_Azure_CostManagement/PartType/CostAnalysisPinnedPart',
        settings: {
          content: {
            configurationId: `cost-by-rg-${options.name}`,
            scope: `/subscriptions/${options.subscriptionId}`,
            chartType: 'StackedColumn',
            granularity: 'Daily',
            grouping: [{ type: 'Dimension', name: 'ResourceGroupName' }],
            filter: {
              dimensions: {
                name: 'ResourceGroupName',
                operator: 'In',
                values: options.resourceGroups
              }
            },
            timePeriod: { type: 'relative', duration: timeRange },
            title: 'Cost by Resource Group'
          }
        }
      }
    });
  }

  const dashboard = {
    type: 'Microsoft.Portal/dashboards',
    apiVersion: '2020-09-01-preview',
    name: options.name,
    location: options.location,
    tags: options.tags || {},
    properties: {
      lenses: [{ order: 0, parts }],
      metadata: {
        model: {
          timeRange: { value: { relative: { duration: timeRange } }, type: 'MsPortalFx.Composition.Configuration.ValueTypes.TimeRange' },
          filterLocale: { value: 'en-us' }
        }
      }
    }
  };

  return JSON.stringify(dashboard, null, 2);
}

export function registerCostAnalysisDashboardHelpers(): void {
  Handlebars.registerHelper('dashboard:costAnalysis', function (this: unknown, options: unknown) {
    const opts = (options as { hash?: CostAnalysisDashboardOptions })?.hash || options;
    return new Handlebars.SafeString(dashboardCostAnalysis.call(this, opts as CostAnalysisDashboardOptions));
  });
}
