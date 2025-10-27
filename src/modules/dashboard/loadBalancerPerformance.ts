import * as Handlebars from "handlebars";

export interface LoadBalancerPerformanceDashboardOptions {
  name: string;
  location: string;
  loadBalancerResourceId: string;
  showHealthProbe?: boolean;
  showThroughput?: boolean;
  showConnections?: boolean;
  showSnatPorts?: boolean;
  timeRange?: string;
  tags?: Record<string, string>;
}

/**
 * Generate load balancer performance dashboard
 */
export function dashboardLoadBalancerPerformance(
  this: unknown,
  options: LoadBalancerPerformanceDashboardOptions,
): string {
  if (!options.name)
    throw new Error("name is required for dashboard:loadBalancerPerformance");
  if (!options.location)
    throw new Error(
      "location is required for dashboard:loadBalancerPerformance",
    );
  if (!options.loadBalancerResourceId)
    throw new Error(
      "loadBalancerResourceId is required for dashboard:loadBalancerPerformance",
    );

  const showHealthProbe = options.showHealthProbe !== false;
  const showThroughput = options.showThroughput !== false;
  const showConnections = options.showConnections !== false;
  const showSnatPorts = options.showSnatPorts !== false;
  const timeRange = options.timeRange || "PT1H";

  const parts: unknown[] = [];
  let yPosition = 0;

  if (showHealthProbe) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "VipAvailability",
                    aggregationType: 4,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: {
                      displayName: "Data Path Availability",
                    },
                  },
                ],
                title: "Health Probe Status",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });

    parts.push({
      position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "DipAvailability",
                    aggregationType: 4,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: { displayName: "Health Probe Status" },
                  },
                ],
                title: "Backend Instance Health",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
    yPosition += 4;
  }

  if (showThroughput) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "ByteCount",
                    aggregationType: 1,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: { displayName: "Byte Count" },
                  },
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "PacketCount",
                    aggregationType: 1,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: { displayName: "Packet Count" },
                  },
                ],
                title: "Data Throughput",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
    yPosition += 4;
  }

  if (showConnections) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "SYNCount",
                    aggregationType: 1,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: { displayName: "SYN Count" },
                  },
                ],
                title: "New Connections (SYN Count)",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });

    parts.push({
      position: { x: 6, y: yPosition, colSpan: 6, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "AllocatedSnatPorts",
                    aggregationType: 4,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: {
                      displayName: "Allocated SNAT Ports",
                    },
                  },
                ],
                title: "Active Connections",
                titleKind: 1,
                visualization: { chartType: 2 },
                timespan: { relative: { duration: timeRange } },
              },
            },
          },
        },
      },
    });
    yPosition += 4;
  }

  if (showSnatPorts) {
    parts.push({
      position: { x: 0, y: yPosition, colSpan: 12, rowSpan: 4 },
      metadata: {
        type: "Extension/HubsExtension/PartType/MonitorChartPart",
        settings: {
          content: {
            options: {
              chart: {
                metrics: [
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "UsedSnatPorts",
                    aggregationType: 4,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: { displayName: "Used SNAT Ports" },
                  },
                  {
                    resourceMetadata: { id: options.loadBalancerResourceId },
                    name: "AllocatedSnatPorts",
                    aggregationType: 4,
                    namespace: "Microsoft.Network/loadBalancers",
                    metricVisualization: {
                      displayName: "Allocated SNAT Ports",
                    },
                  },
                ],
                title: "SNAT Port Usage",
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
        },
      },
    },
  };

  return JSON.stringify(dashboard, null, 2);
}

export function registerLoadBalancerPerformanceDashboardHelpers(): void {
  Handlebars.registerHelper(
    "dashboard:loadBalancerPerformance",
    function (this: unknown, options: unknown) {
      const opts =
        (options as { hash?: LoadBalancerPerformanceDashboardOptions })?.hash ||
        options;
      return new Handlebars.SafeString(
        dashboardLoadBalancerPerformance.call(
          this,
          opts as LoadBalancerPerformanceDashboardOptions,
        ),
      );
    },
  );
}
