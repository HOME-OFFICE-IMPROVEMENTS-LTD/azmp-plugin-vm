import * as Handlebars from "handlebars";

export interface VmssScalingDashboardOptions {
  name: string;
  location: string;
  vmssResourceId: string;
  showInstanceCount?: boolean;
  showCpuMetrics?: boolean;
  showMemoryMetrics?: boolean;
  showRequestMetrics?: boolean;
  timeRange?: string;
  refreshInterval?: string;
  tags?: Record<string, string>;
}

/**
 * Generate VMSS scaling dashboard with autoscale metrics
 */
export function dashboardVmssScaling(
  this: unknown,
  options: VmssScalingDashboardOptions,
): string {
  if (!options.name)
    throw new Error("name is required for dashboard:vmssScaling");
  if (!options.location)
    throw new Error("location is required for dashboard:vmssScaling");
  if (!options.vmssResourceId)
    throw new Error("vmssResourceId is required for dashboard:vmssScaling");

  const showInstanceCount = options.showInstanceCount !== false;
  const showCpuMetrics = options.showCpuMetrics !== false;
  const showMemoryMetrics = options.showMemoryMetrics !== false;
  const showRequestMetrics = options.showRequestMetrics !== false;
  const timeRange = options.timeRange || "PT1H";
  const refreshInterval = options.refreshInterval || "PT5M";

  const parts: unknown[] = [];
  let position = 0;

  if (showInstanceCount) {
    parts.push({
      position: { x: 0, y: 0, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.vmssResourceId },
                    name: "Virtual Machine Count",
                    aggregationType: 4,
                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                    metricVisualization: { displayName: "Instance Count" },
                  },
                ],
                title: "VMSS Instance Count Over Time",
                titleKind: 1,
                visualization: {
                  chartType: 3,
                  legendVisualization: { isVisible: true },
                }, // Line chart
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
    position++;
  }

  if (showCpuMetrics) {
    parts.push({
      position: { x: 0, y: position * 4, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.vmssResourceId },
                    name: "Percentage CPU",
                    aggregationType: 4,
                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                    metricVisualization: { displayName: "CPU %" },
                  },
                ],
                title: "Average CPU Usage",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
  }

  if (showMemoryMetrics) {
    parts.push({
      position: { x: 6, y: position * 4, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.vmssResourceId },
                    name: "Available Memory Bytes",
                    aggregationType: 4,
                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                    metricVisualization: { displayName: "Available Memory" },
                  },
                ],
                title: "Available Memory",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
    position++;
  }

  if (showRequestMetrics) {
    parts.push({
      position: { x: 0, y: (position + 1) * 4, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.vmssResourceId },
                    name: "Inbound Flows",
                    aggregationType: 4,
                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                    metricVisualization: { displayName: "Inbound Connections" },
                  },
                  {
                    resourceMetadata: { id: options.vmssResourceId },
                    name: "Outbound Flows",
                    aggregationType: 4,
                    namespace: "Microsoft.Compute/virtualMachineScaleSets",
                    metricVisualization: {
                      displayName: "Outbound Connections",
                    },
                  },
                ],
                title: "Network Connections",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
  }

  const dashboard = {
    type: "Microsoft.Portal/dashboards",
    apiVersion: "2020-09-01-preview",
    name: options.name,
    location: options.location,
    tags: options.tags || {},
    properties: {
      lenses: [{ order: 0, parts }],
      metadata: {
        model: {
          timeRange: {
            value: { relative: { duration: timeRange } },
            type: "MsPortalFx.Composition.Configuration.ValueTypes.TimeRange",
          },
          filterLocale: { value: "en-us" },
          filters: {
            value: {
              MsPortalFx_TimeRange: {
                model: {
                  format: "utc",
                  granularity: "auto",
                  relative: refreshInterval,
                },
                displayCache: {},
                filteredPartIds: [],
              },
            },
          },
        },
      },
    },
  };

  return JSON.stringify(dashboard, null, 2);
}

export function registerVmssScalingDashboardHelpers(): void {
  Handlebars.registerHelper(
    "dashboard:vmssScaling",
    function (this: unknown, options: unknown) {
      const opts =
        (options as { hash?: VmssScalingDashboardOptions })?.hash || options;
      return new Handlebars.SafeString(
        dashboardVmssScaling.call(this, opts as VmssScalingDashboardOptions),
      );
    },
  );
}
