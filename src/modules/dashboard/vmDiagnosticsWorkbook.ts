import * as Handlebars from "handlebars";

export interface VmDiagnosticsWorkbookOptions {
  name: string;
  location: string;
  resourceGroup: string;
  vmResourceIds: string[];
  workspaceResourceId?: string;
  showBootDiagnostics?: boolean;
  showPerformanceCounters?: boolean;
  showEventLogs?: boolean;
  showNetworkDiagnostics?: boolean;
  tags?: Record<string, string>;
}

/**
 * Generate VM diagnostics workbook with detailed troubleshooting queries
 */
export function workbookVmDiagnostics(
  this: unknown,
  options: VmDiagnosticsWorkbookOptions,
): string {
  if (!options.name)
    throw new Error("name is required for workbook:vmDiagnostics");
  if (!options.location)
    throw new Error("location is required for workbook:vmDiagnostics");
  if (!options.resourceGroup)
    throw new Error("resourceGroup is required for workbook:vmDiagnostics");
  if (!options.vmResourceIds || options.vmResourceIds.length === 0) {
    throw new Error(
      "vmResourceIds array is required for workbook:vmDiagnostics",
    );
  }

  const showBootDiagnostics = options.showBootDiagnostics !== false;
  const showPerformanceCounters = options.showPerformanceCounters !== false;
  const showEventLogs = options.showEventLogs !== false;
  const showNetworkDiagnostics = options.showNetworkDiagnostics !== false;

  const items: unknown[] = [];

  // Overview section
  items.push({
    type: 1, // Text
    content: {
      json: "## VM Diagnostics Overview\n\nComprehensive diagnostics for virtual machines including boot logs, performance counters, event logs, and network diagnostics.",
    },
  });

  // VM selector
  items.push({
    type: 9, // Parameter
    content: {
      version: "KqlParameterItem/1.0",
      name: "SelectedVM",
      label: "Virtual Machine",
      type: 5, // Resource picker
      isRequired: true,
      value: options.vmResourceIds[0],
      typeSettings: {
        resourceTypeFilter: "Microsoft.Compute/virtualMachines",
        additionalResourceOptions: ["value::all"],
        showDefault: false,
      },
    },
  });

  if (showBootDiagnostics) {
    items.push({
      type: 1,
      content: { json: "### Boot Diagnostics" },
    });

    items.push({
      type: 3, // Query
      content: {
        version: "KqlItem/1.0",
        query: `AzureDiagnostics\n| where ResourceId =~ '{SelectedVM}'\n| where Category == 'BootDiagnostics'\n| project TimeGenerated, Level, Message\n| order by TimeGenerated desc\n| take 100`,
        size: 0,
        title: "Recent Boot Events",
        queryType: 0, // Log Analytics
        resourceType: "microsoft.operationalinsights/workspaces",
        visualization: "table",
      },
    });
  }

  if (showPerformanceCounters && options.workspaceResourceId) {
    items.push({
      type: 1,
      content: { json: "### Performance Counters" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `Perf\n| where Computer in ({SelectedVM:name})\n| where CounterName in ('% Processor Time', 'Available MBytes', 'Disk Reads/sec', 'Disk Writes/sec')\n| summarize avg(CounterValue) by CounterName, bin(TimeGenerated, 5m)\n| render timechart`,
        size: 0,
        title: "Performance Metrics",
        queryType: 0,
        resourceType: "microsoft.operationalinsights/workspaces",
        crossComponentResources: [options.workspaceResourceId],
        visualization: "timechart",
      },
    });
  }

  if (showEventLogs && options.workspaceResourceId) {
    items.push({
      type: 1,
      content: { json: "### Event Logs" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `Event\n| where Computer in ({SelectedVM:name})\n| where EventLevelName in ('Error', 'Warning')\n| summarize Count=count() by EventLevelName, Source, bin(TimeGenerated, 1h)\n| order by TimeGenerated desc`,
        size: 0,
        title: "Error and Warning Events",
        queryType: 0,
        resourceType: "microsoft.operationalinsights/workspaces",
        crossComponentResources: [options.workspaceResourceId],
        visualization: "table",
      },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `Event\n| where Computer in ({SelectedVM:name})\n| where EventLevelName == 'Error'\n| summarize ErrorCount=count() by bin(TimeGenerated, 1h)\n| render barchart`,
        size: 0,
        title: "Error Trend",
        queryType: 0,
        resourceType: "microsoft.operationalinsights/workspaces",
        crossComponentResources: [options.workspaceResourceId],
        visualization: "barchart",
      },
    });
  }

  if (showNetworkDiagnostics) {
    items.push({
      type: 1,
      content: { json: "### Network Diagnostics" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `AzureMetrics\n| where ResourceId =~ '{SelectedVM}'\n| where MetricName in ('Network In Total', 'Network Out Total')\n| summarize sum(Total) by MetricName, bin(TimeGenerated, 5m)\n| render timechart`,
        size: 0,
        title: "Network Traffic",
        queryType: 0,
        resourceType: "microsoft.compute/virtualmachines",
        visualization: "timechart",
      },
    });
  }

  const workbook = {
    type: "Microsoft.Insights/workbooks",
    apiVersion: "2022-04-01",
    name: options.name,
    location: options.location,
    tags: options.tags || {},
    kind: "shared",
    properties: {
      displayName: "VM Diagnostics Workbook",
      serializedData: JSON.stringify({
        version: "Notebook/1.0",
        items,
        styleSettings: {},
        $schema:
          "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json",
      }),
      category: "workbook",
      sourceId: `/subscriptions/{subscription-id}/resourceGroups/${options.resourceGroup}`,
    },
  };

  return JSON.stringify(workbook, null, 2);
}

export function registerVmDiagnosticsWorkbookHelpers(): void {
  Handlebars.registerHelper(
    "workbook:vmDiagnostics",
    function (this: unknown, options: unknown) {
      const opts =
        (options as { hash?: VmDiagnosticsWorkbookOptions })?.hash || options;
      return new Handlebars.SafeString(
        workbookVmDiagnostics.call(this, opts as VmDiagnosticsWorkbookOptions),
      );
    },
  );
}
