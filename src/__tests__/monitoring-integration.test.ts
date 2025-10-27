/**
 * Integration Tests for Monitoring, Alert, and Dashboard Modules
 *
 * Tests complete monitoring scenarios combining multiple helpers
 */

import { VmPlugin } from "../index";
import * as Handlebars from "handlebars";
import { PluginContext } from "../types";

describe("Monitoring Integration Tests", () => {
  let plugin: VmPlugin;

  beforeEach(() => {
    plugin = new VmPlugin();
    const mockContext: PluginContext = {
      logger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    } as unknown as PluginContext;
    plugin.initialize(mockContext);
  });

  describe("Complete Monitoring Stack", () => {
    it("should generate complete monitoring infrastructure with workspace, diagnostics, metrics, and alerts", () => {
      const workspaceHelper =
        Handlebars.helpers["monitor:logAnalyticsWorkspace"];
      const diagnosticsHelper =
        Handlebars.helpers["monitor:diagnosticSettings"];
      const metricsHelper = Handlebars.helpers["monitor:metrics"];
      const alertHelper = Handlebars.helpers["alert:metricAlert"];
      const actionGroupHelper = Handlebars.helpers["alert:actionGroup"];

      // 1. Create Log Analytics Workspace
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (workspaceHelper as any).call(null, {
        hash: {
          name: "law-monitoring",
          location: "eastus",
          sku: "PerGB2018",
          retentionInDays: 90,
        },
      });
      expect(workspace).toBeDefined();
      const workspaceJson = JSON.parse(workspace);
      expect(workspaceJson.type).toBe(
        "Microsoft.OperationalInsights/workspaces",
      );
      expect(workspaceJson.properties.retentionInDays).toBe(90);

      // 2. Create Action Group for notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actionGroup = (actionGroupHelper as any).call(null, {
        name: "ag-ops-team",
        shortName: "OpsTeam",
        emailReceivers: JSON.stringify([
          { name: "ops", emailAddress: "ops@example.com" },
        ]),
      });
      expect(actionGroup).toBeDefined();
      const actionGroupJson = JSON.parse(actionGroup);
      expect(actionGroupJson.type).toBe("microsoft.insights/actionGroups");
      expect(actionGroupJson.properties.groupShortName).toBe("OpsTeam");

      // 3. Enable Diagnostic Settings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diagnostics = (diagnosticsHelper as any).call(null, {
        hash: {
          name: "diag-vm-001",
          targetResourceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-001",
          workspaceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-monitoring",
          logs: JSON.stringify([{ category: "Administrative", enabled: true }]),
          metrics: JSON.stringify([{ category: "AllMetrics", enabled: true }]),
        },
      });
      expect(diagnostics).toBeDefined();
      const diagnosticsJson = JSON.parse(diagnostics);
      expect(diagnosticsJson.type).toBe(
        "Microsoft.Insights/diagnosticSettings",
      );
      expect(diagnosticsJson.properties.workspaceId).toContain(
        "law-monitoring",
      );

      // 4. Query Metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metrics = (metricsHelper as any).call(null, {
        hash: {
          targetResourceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-001",
          metrics: JSON.stringify(["Percentage CPU", "Available Memory Bytes"]),
          aggregation: "Average",
          frequency: "PT5M",
        },
      });
      expect(metrics).toBeDefined();
      const metricsJson = JSON.parse(metrics);
      expect(metricsJson.properties.scopes[0]).toContain("vm-001");
      expect(metricsJson.properties.criteria.allOf[0].metricName).toBe(
        "Percentage CPU",
      );

      // 5. Create Metric Alert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (alertHelper as any).call(null, {
        name: "alert-cpu-high",
        description: "High CPU usage detected",
        severity: 2,
        scopes: JSON.stringify([
          "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-001",
        ]),
        evaluationFrequency: "PT5M",
        windowSize: "PT15M",
        criteria: JSON.stringify([
          {
            metricName: "Percentage CPU",
            operator: "GreaterThan",
            threshold: 80,
            timeAggregation: "Average",
          },
        ]),
        actionGroupIds: JSON.stringify([
          "/subscriptions/sub-id/resourceGroups/rg/providers/microsoft.insights/actionGroups/ag-ops-team",
        ]),
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.type).toBe("Microsoft.Insights/metricAlerts");
      expect(alertJson.properties.severity).toBe(2);
      expect(alertJson.properties.criteria.allOf[0].threshold).toBe(80);

      // Verify complete stack integration
      expect(workspaceJson.name).toBe("law-monitoring");
      expect(actionGroupJson.name).toBe("ag-ops-team");
      expect(diagnosticsJson.name).toBe("diag-vm-001");
      expect(alertJson.name).toBe("alert-cpu-high");
    });
  });

  describe("VMSS Monitoring Stack", () => {
    it("should generate VMSS monitoring with autoscale metrics, alerts, and dashboard", () => {
      const metricsHelper = Handlebars.helpers["monitor:metrics"];
      const alertHelper = Handlebars.helpers["alert:dynamicMetricAlert"];
      const dashboardHelper = Handlebars.helpers["dashboard:vmssScaling"];

      const vmssResourceId =
        "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-web";

      // 1. Query VMSS Metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metrics = (metricsHelper as any).call(null, {
        hash: {
          targetResourceId: vmssResourceId,
          metrics: JSON.stringify([
            "Percentage CPU",
            "Network In Total",
            "Network Out Total",
          ]),
          aggregation: "Average",
          frequency: "PT1M",
        },
      });
      expect(metrics).toBeDefined();
      const metricsJson = JSON.parse(metrics);
      expect(metricsJson.properties.criteria.allOf[0].metricName).toBe(
        "Percentage CPU",
      );

      // 2. Create Dynamic Alert for anomaly detection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (alertHelper as any).call(null, {
        name: "alert-vmss-cpu-anomaly",
        description: "Detect CPU usage anomalies",
        severity: 3,
        scopes: JSON.stringify([vmssResourceId]),
        evaluationFrequency: "PT5M",
        windowSize: "PT15M",
        criteria: JSON.stringify([
          {
            metricName: "Percentage CPU",
            operator: "GreaterThan",
            alertSensitivity: "Medium",
            failingPeriods: {
              numberOfEvaluationPeriods: 4,
              minFailingPeriodsToAlert: 3,
            },
          },
        ]),
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.type).toBe("Microsoft.Insights/metricAlerts");
      expect(alertJson.properties.criteria["odata.type"]).toBe(
        "Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria",
      );

      // 3. Create VMSS Scaling Dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dashboard = (dashboardHelper as any).call(null, {
        name: "dashboard-vmss-web",
        location: "eastus",
        vmssResourceId: vmssResourceId,
        showInstanceCount: true,
        showCpuMetrics: true,
        showMemoryMetrics: true,
        showRequestMetrics: true,
      });
      expect(dashboard).toBeDefined();
      const dashboardJson = JSON.parse(dashboard);
      expect(dashboardJson.type).toBe("Microsoft.Portal/dashboards");
      expect(dashboardJson.properties.lenses[0].parts.length).toBeGreaterThan(
        0,
      );

      // Verify dashboard includes instance count tile
      const instanceCountTile = dashboardJson.properties.lenses[0].parts.find(
        (part: {
          metadata: {
            settings: { content: { options: { chart: { title: string } } } };
          };
        }) =>
          part.metadata?.settings?.content?.options?.chart?.title?.includes(
            "Instance Count",
          ),
      );
      expect(instanceCountTile).toBeDefined();
    });
  });

  describe("Multi-Region Health Monitoring", () => {
    it("should generate multi-region monitoring with health checks and regional dashboards", () => {
      const workspaceHelper =
        Handlebars.helpers["monitor:logAnalyticsWorkspace"];
      const appInsightsHelper =
        Handlebars.helpers["monitor:applicationInsights"];
      const dashboardHelper = Handlebars.helpers["dashboard:multiRegionHealth"];
      const activityLogAlertHelper =
        Handlebars.helpers["alert:activityLogAlert"];

      // 1. Create Log Analytics Workspace (shared)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (workspaceHelper as any).call(null, {
        hash: {
          name: "law-global-monitoring",
          location: "eastus",
          sku: "PerGB2018",
        },
      });
      expect(workspace).toBeDefined();

      // 2. Create Application Insights per region
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appInsightsEastUS = (appInsightsHelper as any).call(null, {
        hash: {
          name: "ai-eastus",
          location: "eastus",
          applicationType: "web",
          workspaceResourceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-global-monitoring",
        },
      });
      expect(appInsightsEastUS).toBeDefined();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appInsightsWestUS = (appInsightsHelper as any).call(null, {
        hash: {
          name: "ai-westus",
          location: "westus",
          applicationType: "web",
          workspaceResourceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-global-monitoring",
        },
      });
      expect(appInsightsWestUS).toBeDefined();

      // 3. Create Multi-Region Dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dashboard = (dashboardHelper as any).call(null, {
        name: "dashboard-multi-region",
        location: "eastus",
        regions: [
          {
            name: "East US",
            vmResourceIds: [
              "/subscriptions/sub-id/resourceGroups/rg-eastus/providers/Microsoft.Compute/virtualMachines/vm-east-001",
            ],
            loadBalancerResourceId:
              "/subscriptions/sub-id/resourceGroups/rg-eastus/providers/Microsoft.Network/loadBalancers/lb-east",
          },
          {
            name: "West US",
            vmResourceIds: [
              "/subscriptions/sub-id/resourceGroups/rg-westus/providers/Microsoft.Compute/virtualMachines/vm-west-001",
            ],
            loadBalancerResourceId:
              "/subscriptions/sub-id/resourceGroups/rg-westus/providers/Microsoft.Network/loadBalancers/lb-west",
          },
        ],
        showAvailability: true,
        showLatency: true,
        showThroughput: true,
      });
      expect(dashboard).toBeDefined();
      const dashboardJson = JSON.parse(dashboard);
      expect(dashboardJson.type).toBe("Microsoft.Portal/dashboards");
      expect(
        dashboardJson.properties.lenses[0].parts.length,
      ).toBeGreaterThanOrEqual(2);

      // 4. Create Activity Log Alert for region failures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (activityLogAlertHelper as any).call(null, {
        name: "alert-region-health",
        description: "Alert on regional service health issues",
        scopes: JSON.stringify(["/subscriptions/sub-id"]),
        condition: JSON.stringify([
          { field: "category", equals: "ServiceHealth" },
          { field: "properties.incidentType", equals: "Incident" },
        ]),
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.type).toBe("Microsoft.Insights/activityLogAlerts");
      expect(alertJson.properties.condition.allOf[0].field).toBe("category");
      expect(alertJson.properties.condition.allOf[0].equals).toBe(
        "ServiceHealth",
      );
    });
  });

  describe("Load Balancer Monitoring", () => {
    it("should generate load balancer monitoring with health probes, throughput metrics, and alerts", () => {
      const diagnosticsHelper =
        Handlebars.helpers["monitor:diagnosticSettings"];
      const metricsHelper = Handlebars.helpers["monitor:metrics"];
      const alertHelper = Handlebars.helpers["alert:metricAlert"];
      const dashboardHelper =
        Handlebars.helpers["dashboard:loadBalancerPerformance"];

      const lbResourceId =
        "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/loadBalancers/lb-prod";

      // 1. Enable Load Balancer Diagnostics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diagnostics = (diagnosticsHelper as any).call(null, {
        hash: {
          name: "diag-lb-prod",
          targetResourceId: lbResourceId,
          workspaceId:
            "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-monitoring",
          metrics: JSON.stringify([{ category: "AllMetrics", enabled: true }]),
          logs: JSON.stringify([
            { category: "LoadBalancerProbeHealthStatus", enabled: true },
          ]),
        },
      });
      expect(diagnostics).toBeDefined();

      // 2. Query Load Balancer Metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metrics = (metricsHelper as any).call(null, {
        hash: {
          targetResourceId: lbResourceId,
          metrics: JSON.stringify([
            "VipAvailability",
            "DipAvailability",
            "ByteCount",
            "PacketCount",
            "SYNCount",
          ]),
          aggregation: "Average",
          frequency: "PT1M",
        },
      });
      expect(metrics).toBeDefined();
      const metricsJson = JSON.parse(metrics);
      expect(metricsJson.properties.criteria.allOf[0].metricName).toBe(
        "VipAvailability",
      );

      // 3. Create Health Probe Alert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (alertHelper as any).call(null, {
        name: "alert-lb-health-probe",
        description: "Load balancer health probe failure",
        severity: 1,
        scopes: JSON.stringify([lbResourceId]),
        evaluationFrequency: "PT1M",
        windowSize: "PT5M",
        criteria: JSON.stringify([
          {
            metricName: "DipAvailability",
            operator: "LessThan",
            threshold: 90,
            timeAggregation: "Average",
          },
        ]),
      });
      expect(alert).toBeDefined();

      // 4. Create Load Balancer Performance Dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dashboard = (dashboardHelper as any).call(null, {
        name: "dashboard-lb-prod",
        location: "eastus",
        loadBalancerResourceId: lbResourceId,
        showHealthProbe: true,
        showThroughput: true,
        showConnections: true,
        showSnatPorts: true,
      });
      expect(dashboard).toBeDefined();
      const dashboardJson = JSON.parse(dashboard);
      expect(dashboardJson.type).toBe("Microsoft.Portal/dashboards");

      // Verify dashboard includes health probe and SNAT port tiles
      const healthProbeTiles = dashboardJson.properties.lenses[0].parts.filter(
        (part: {
          metadata: {
            settings: { content: { options: { chart: { title: string } } } };
          };
        }) =>
          part.metadata?.settings?.content?.options?.chart?.title?.includes(
            "Health Probe",
          ) ||
          part.metadata?.settings?.content?.options?.chart?.title?.includes(
            "SNAT Port",
          ),
      );
      expect(healthProbeTiles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Log Analytics Integration", () => {
    it("should generate Log Analytics workspace with data collection rules and log alerts", () => {
      const workspaceHelper =
        Handlebars.helpers["monitor:logAnalyticsWorkspace"];
      const dataCollectionHelper =
        Handlebars.helpers["monitor:dataCollectionRule"];
      const logAlertHelper = Handlebars.helpers["alert:logAlert"];

      // 1. Create Log Analytics Workspace
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (workspaceHelper as any).call(null, {
        hash: {
          name: "law-security",
          location: "eastus",
          sku: "PerGB2018",
          retentionInDays: 180,
          dailyQuotaGb: 10,
        },
      });
      expect(workspace).toBeDefined();
      const workspaceJson = JSON.parse(workspace);
      expect(workspaceJson.properties.retentionInDays).toBe(180);
      expect(workspaceJson.properties.workspaceCapping.dailyQuotaGb).toBe(10);

      // 2. Create Data Collection Rule
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataCollection = (dataCollectionHelper as any).call(null, {
        hash: {
          name: "dcr-vm-performance",
          location: "eastus",
          dataSources: JSON.stringify({
            performanceCounters: [
              {
                name: "perfCounters",
                streams: ["Microsoft-Perf"],
                samplingFrequencyInSeconds: 60,
                counterSpecifiers: [
                  "\\Processor(_Total)\\% Processor Time",
                  "\\Memory\\Available MBytes",
                  "\\LogicalDisk(_Total)\\Disk Reads/sec",
                  "\\LogicalDisk(_Total)\\Disk Writes/sec",
                ],
              },
            ],
          }),
          destinations: JSON.stringify({
            logAnalytics: [
              {
                workspaceResourceId:
                  "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-security",
                name: "destination-law",
              },
            ],
          }),
          dataFlows: JSON.stringify([
            {
              streams: ["Microsoft-Perf"],
              destinations: ["destination-law"],
            },
          ]),
        },
      });
      expect(dataCollection).toBeDefined();
      const dataCollectionJson = JSON.parse(dataCollection);
      expect(dataCollectionJson.type).toBe(
        "Microsoft.Insights/dataCollectionRules",
      );
      expect(
        dataCollectionJson.properties.dataSources.performanceCounters[0]
          .samplingFrequencyInSeconds,
      ).toBe(60);

      // 3. Create Log Alert for security events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (logAlertHelper as any).call(null, {
        name: "alert-security-events",
        description: "High number of failed login attempts",
        scopes: JSON.stringify([
          "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/law-security",
        ]),
        evaluationFrequency: "PT5M",
        windowSize: "PT15M",
        severity: 2,
        query:
          "SecurityEvent | where EventID == 4625 | summarize FailedLogins = count() by Computer",
        threshold: 10,
        operator: "GreaterThan",
        resultType: "ResultCount",
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.type).toBe("Microsoft.Insights/scheduledQueryRules");
      expect(alertJson.properties.criteria.allOf[0].query).toContain(
        "SecurityEvent",
      );
      expect(alertJson.properties.criteria.allOf[0].threshold).toBe(10);
    });
  });

  describe("Application Insights Integration", () => {
    it("should generate Application Insights with custom metrics and availability tests", () => {
      const appInsightsHelper =
        Handlebars.helpers["monitor:applicationInsights"];
      const customMetricHelper = Handlebars.helpers["monitor:customMetric"];
      const alertHelper = Handlebars.helpers["alert:metricAlert"];

      // 1. Create Application Insights
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appInsights = (appInsightsHelper as any).call(null, {
        hash: {
          name: "ai-webapp",
          location: "eastus",
          applicationType: "web",
          samplingPercentage: 100,
          retentionInDays: 90,
          disableIpMasking: false,
        },
      });
      expect(appInsights).toBeDefined();
      const appInsightsJson = JSON.parse(appInsights);
      expect(appInsightsJson.type).toBe("Microsoft.Insights/components");
      expect(appInsightsJson.properties.RetentionInDays).toBe(90);

      // 2. Define Custom Metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customMetric = (customMetricHelper as any).call(null, {
        hash: {
          name: "OrdersProcessed",
          namespace: "CustomApp/Orders",
          description: "Number of orders processed per minute",
          unit: "Count",
          aggregation: "Total",
        },
      });
      expect(customMetric).toBeDefined();
      const customMetricJson = JSON.parse(customMetric);
      expect(customMetricJson.metricDefinition.name).toBe("OrdersProcessed");
      expect(customMetricJson.metricDefinition.unit).toBe("Count");
      expect(customMetricJson.metricDefinition.namespace).toBe(
        "CustomApp/Orders",
      );

      // 3. Create Alert on Custom Metric
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (alertHelper as any).call(null, {
        name: "alert-orders-low",
        description: "Low order processing rate",
        severity: 3,
        scopes: JSON.stringify([
          "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Insights/components/ai-webapp",
        ]),
        evaluationFrequency: "PT5M",
        windowSize: "PT15M",
        criteria: JSON.stringify([
          {
            metricName: "OrdersProcessed",
            metricNamespace: "CustomApp/Orders",
            operator: "LessThan",
            threshold: 10,
            timeAggregation: "Total",
          },
        ]),
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.properties.criteria.allOf[0].metricName).toBe(
        "OrdersProcessed",
      );
    });
  });

  describe("Cost Monitoring", () => {
    it("should generate cost analysis dashboard with budget alerts", () => {
      const dashboardHelper = Handlebars.helpers["dashboard:costAnalysis"];
      const actionGroupHelper = Handlebars.helpers["alert:actionGroup"];

      // 1. Create Cost Analysis Dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dashboard = (dashboardHelper as any).call(null, {
        name: "dashboard-cost-analysis",
        location: "eastus",
        subscriptionId: "sub-id-123",
        resourceGroups: JSON.stringify(["rg-prod", "rg-staging"]),
        showCostTrends: true,
        showCostByService: true,
        showCostByRegion: true,
        showBudgetStatus: true,
        timeRange: "P30D",
      });
      expect(dashboard).toBeDefined();
      const dashboardJson = JSON.parse(dashboard);
      expect(dashboardJson.type).toBe("Microsoft.Portal/dashboards");

      // Verify dashboard includes cost tiles
      const costTiles = dashboardJson.properties.lenses[0].parts.filter(
        (part: { metadata: { type: string } }) =>
          part.metadata?.type?.includes("CostManagement") ||
          part.metadata?.type?.includes("Budget"),
      );
      expect(costTiles.length).toBeGreaterThanOrEqual(3);

      // 2. Create Action Group for budget alerts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actionGroup = (actionGroupHelper as any).call(null, {
        name: "ag-finance-team",
        shortName: "FinTeam",
        emailReceivers: JSON.stringify([
          { name: "finance", emailAddress: "finance@example.com" },
          { name: "cfo", emailAddress: "cfo@example.com" },
        ]),
      });
      expect(actionGroup).toBeDefined();
      const actionGroupJson = JSON.parse(actionGroup);
      expect(actionGroupJson.properties.emailReceivers.length).toBe(2);
    });
  });

  describe("Security Monitoring Workbook", () => {
    it("should generate security posture workbook with Defender for Cloud integration", () => {
      const workbookHelper = Handlebars.helpers["workbook:securityPosture"];
      const workspaceHelper =
        Handlebars.helpers["monitor:logAnalyticsWorkspace"];
      const logAlertHelper = Handlebars.helpers["alert:logAlert"];

      // 1. Create Log Analytics Workspace for security
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (workspaceHelper as any).call(null, {
        hash: {
          name: "law-security-hub",
          location: "eastus",
          sku: "PerGB2018",
        },
      });
      expect(workspace).toBeDefined();

      // 2. Create Security Posture Workbook
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workbook = (workbookHelper as any).call(null, {
        name: "workbook-security-posture",
        location: "eastus",
        resourceGroup: "rg-security",
        subscriptionId: "sub-id-123",
        workspaceResourceId:
          "/subscriptions/sub-id-123/resourceGroups/rg-security/providers/Microsoft.OperationalInsights/workspaces/law-security-hub",
        showSecurityRecommendations: true,
        showSecurityAlerts: true,
        showComplianceStatus: true,
        showVulnerabilities: true,
      });
      expect(workbook).toBeDefined();
      const workbookJson = JSON.parse(workbook);
      expect(workbookJson.type).toBe("Microsoft.Insights/workbooks");
      expect(workbookJson.kind).toBe("shared");

      // Verify workbook includes security queries
      const serializedData = JSON.parse(workbookJson.properties.serializedData);
      const securityItems = serializedData.items.filter(
        (item: { content: { query: string } }) =>
          item.content?.query?.includes("securityresources") ||
          item.content?.query?.includes("SecurityBaseline"),
      );
      expect(securityItems.length).toBeGreaterThanOrEqual(4);

      // 3. Create Log Alert for critical security findings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alert = (logAlertHelper as any).call(null, {
        name: "alert-critical-security",
        description: "Critical security recommendations detected",
        scopes: JSON.stringify(["/subscriptions/sub-id-123"]),
        evaluationFrequency: "PT15M",
        windowSize: "PT1H",
        severity: 0,
        query:
          'securityresources | where type == "microsoft.security/assessments" | where properties.status.code != "Healthy" and properties.metadata.severity == "High" | summarize count()',
        threshold: 1,
        operator: "GreaterThanOrEqual",
        resultType: "ResultCount",
      });
      expect(alert).toBeDefined();
      const alertJson = JSON.parse(alert);
      expect(alertJson.properties.severity).toBe(0); // Critical
      expect(alertJson.properties.criteria.allOf[0].query).toContain(
        "securityresources",
      );
    });
  });
});
