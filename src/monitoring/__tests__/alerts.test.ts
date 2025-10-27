import Handlebars from "handlebars";
import {
  MonitoringAlertEngine,
  registerEnhancedMonitoringHelpers,
} from "../index";

describe("MonitoringAlertEngine", () => {
  beforeAll(() => {
    registerEnhancedMonitoringHelpers();
  });

  it("creates CPU metric alert definitions", () => {
    const alert = MonitoringAlertEngine.createCpuAlert({
      resourceId:
        "/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1",
      threshold: 85,
      severity: 2,
    });

    expect(alert.condition.type).toBe("metric");
    if (alert.condition.type === "metric") {
      expect(alert.condition.metricName).toBe("Percentage CPU");
      expect(alert.condition.threshold).toBe(85);
    }

    const resource = MonitoringAlertEngine.toMetricAlertResource(alert);
    expect(resource.type).toBe("Microsoft.Insights/metricAlerts");
    expect(resource.properties.severity).toBe(2);
  });

  it("creates cost anomaly log alert definitions", () => {
    const alert = MonitoringAlertEngine.createCostAnomalyAlert({
      scopeId: "/subscriptions/demo",
      thresholdPercent: 25,
      severity: 1,
      evaluationFrequency: "PT1H",
      windowSize: "P1D",
    });

    expect(alert.condition.type).toBe("log");
    const resource = MonitoringAlertEngine.toScheduledQueryResource(
      alert,
      "/subscriptions/demo/resourceGroups/rg/providers/Microsoft.OperationalInsights/workspaces/ws",
    );

    expect(resource.type).toBe("Microsoft.Insights/scheduledQueryRules");
    expect(resource.properties.schedule.timeWindowInMinutes).toBe(1440);
  });

  it("registers Handlebars helpers for alerts", () => {
    const template = Handlebars.compile(
      `{{monitor:cpuAlert resourceId="/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1" threshold=90}}`,
    );

    const result = template({});
    const parsed = JSON.parse(result);

    expect(parsed.name).toBe("cpu-high-alert");
    expect(parsed.condition.metricName).toBe("Percentage CPU");

    // Test ARM resource generation directly
    const { MonitoringAlertEngine } = require("../alerts");
    const definition = MonitoringAlertEngine.createCpuAlert({
      resourceId:
        "/subscriptions/demo/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1",
      threshold: 90,
    });
    const armResource = MonitoringAlertEngine.toMetricAlertResource(definition);

    expect(armResource.type).toBe("Microsoft.Insights/metricAlerts");
  });
});
