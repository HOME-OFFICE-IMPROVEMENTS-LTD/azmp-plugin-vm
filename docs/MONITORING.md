# Azure Monitor & Observability Guide

**Version:** 1.7.0  
**Module:** Day 7 - Monitoring, Alerts & Dashboards

This guide covers the comprehensive monitoring and observability capabilities introduced in v1.7.0, including Azure Monitor integration, metric collection, log analytics, alerting, and dashboard visualization.

## Table of Contents

- [Overview](#overview)
- [Monitoring Helpers](#monitoring-helpers)
- [Alert Helpers](#alert-helpers)
- [Dashboard & Workbook Helpers](#dashboard--workbook-helpers)
- [CLI Commands](#cli-commands)
- [Complete Integration Examples](#complete-integration-examples)
- [KQL Query Library](#kql-query-library)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The azmp-plugin-vm v1.7.0 introduces enterprise-grade monitoring and observability through 20 new Handlebars helpers organized under three namespaces:

| Category | Helpers | Purpose |
|----------|---------|---------|
| **Monitoring** | 6 helpers | Log Analytics, metrics, diagnostics, Application Insights |
| **Alerts** | 6 helpers | Metric alerts, log alerts, action groups, activity log alerts |
| **Dashboards** | 8 helpers | Portal dashboards and workbooks for visualization |

### Key Features

✅ **Log Analytics:** Centralized logging with workspace management and data collection rules  
✅ **Metrics:** Platform and custom metrics with aggregation and filtering  
✅ **Diagnostics:** Resource diagnostic settings for logs and metrics export  
✅ **Application Insights:** APM with custom metrics and availability monitoring  
✅ **Alerting:** Metric-based, log-based, and activity log alerts with action groups  
✅ **Dashboards:** Pre-built dashboards for VM health, VMSS scaling, cost analysis  
✅ **Workbooks:** Interactive workbooks for security posture and diagnostics  
✅ **CLI Integration:** 8 commands for quick configuration generation  

---

## Monitoring Helpers

### `monitor:logAnalyticsWorkspace`

Creates a Log Analytics workspace for centralized log collection and analysis.

#### Syntax

```handlebars
{{monitor:logAnalyticsWorkspace
  name="logs-prod-eastus"
  location="eastus"
  sku="PerGB2018"
  retentionInDays=90
  tags='{"environment":"production","cost-center":"ops"}'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Workspace name (3-63 chars, alphanumeric and hyphens) |
| `location` | string | ✅ | - | Azure region (e.g., eastus, westus2) |
| `sku` | string | ❌ | `PerGB2018` | Pricing tier: `Free`, `PerGB2018`, `CapacityReservation` |
| `retentionInDays` | number | ❌ | `30` | Data retention (30-730 days) |
| `tags` | string | ❌ | - | JSON object of tags |

#### Output

Generates a complete ARM resource for Log Analytics workspace:

```json
{
  "type": "Microsoft.OperationalInsights/workspaces",
  "apiVersion": "2022-10-01",
  "name": "logs-prod-eastus",
  "location": "eastus",
  "properties": {
    "sku": {
      "name": "PerGB2018"
    },
    "retentionInDays": 90,
    "features": {
      "enableLogAccessUsingOnlyResourcePermissions": true
    },
    "publicNetworkAccessForIngestion": "Enabled",
    "publicNetworkAccessForQuery": "Enabled"
  }
}
```

#### CLI Command

```bash
# Generate workspace configuration
azmp mon workspace \
  --name "logs-prod-eastus" \
  --location "eastus" \
  --sku "PerGB2018" \
  --retention 90
```

#### Use Cases

- **Centralized Logging:** Collect logs from VMs, containers, and Azure services
- **Security Analytics:** SIEM integration with Microsoft Sentinel
- **Compliance:** Long-term log retention for regulatory requirements
- **Cost Analysis:** Analyze resource costs using log data

---

### `monitor:diagnosticSettings`

Configures diagnostic settings to export resource logs and metrics to Log Analytics workspace.

#### Syntax

```handlebars
{{monitor:diagnosticSettings
  name="vm-diagnostics"
  targetResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"
  workspaceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"
  logs='[{"category":"Administrative","enabled":true}]'
  metrics='[{"category":"AllMetrics","enabled":true}]'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Diagnostic setting name |
| `targetResourceId` | string | ✅ | - | Full resource ID to monitor |
| `workspaceId` | string | ✅ | - | Log Analytics workspace resource ID |
| `logs` | string | ❌ | `[]` | JSON array of log categories |
| `metrics` | string | ❌ | `[]` | JSON array of metric categories |
| `storageAccountId` | string | ❌ | - | Optional storage account for archiving |
| `eventHubName` | string | ❌ | - | Optional Event Hub for streaming |

#### Log Categories by Resource Type

**Virtual Machines:**
- No native log categories (use Log Analytics agent)

**Load Balancers:**
- `LoadBalancerAlertEvent` - Health probe and backend health events
- `LoadBalancerProbeHealthStatus` - Backend pool health status

**Application Gateways:**
- `ApplicationGatewayAccessLog` - Access requests
- `ApplicationGatewayPerformanceLog` - Performance metrics
- `ApplicationGatewayFirewallLog` - WAF events

**Network Security Groups:**
- `NetworkSecurityGroupEvent` - NSG rule evaluations
- `NetworkSecurityGroupRuleCounter` - Rule hit counts

#### Output

```json
{
  "type": "Microsoft.Insights/diagnosticSettings",
  "apiVersion": "2021-05-01-preview",
  "scope": "[parameters('targetResourceId')]",
  "name": "vm-diagnostics",
  "properties": {
    "workspaceId": "/subscriptions/.../workspaces/logs-prod",
    "logs": [
      {
        "category": "Administrative",
        "enabled": true
      }
    ],
    "metrics": [
      {
        "category": "AllMetrics",
        "enabled": true,
        "retentionPolicy": {
          "enabled": false,
          "days": 0
        }
      }
    ]
  }
}
```

#### CLI Command

```bash
# Generate diagnostic settings
azmp mon diagnostics \
  --name "vm-diagnostics" \
  --resource-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001" \
  --workspace-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod" \
  --logs '[{"category":"AllMetrics","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

---

### `monitor:metrics`

Defines metrics collection configuration for platform metrics.

#### Syntax

```handlebars
{{monitor:metrics
  targetResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"
  metrics='["Percentage CPU","Available Memory Bytes","Disk Read Bytes","Disk Write Bytes"]'
  aggregation="Average"
  frequency="PT1M"
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `targetResourceId` | string | ✅ | - | Resource to collect metrics from |
| `metrics` | string | ✅ | - | JSON array of metric names |
| `aggregation` | string | ❌ | `Average` | Aggregation type: `Average`, `Total`, `Minimum`, `Maximum`, `Count` |
| `frequency` | string | ❌ | `PT1M` | Collection frequency (ISO 8601 duration) |

#### Common VM Metrics

**CPU & Memory:**
- `Percentage CPU` - CPU utilization percentage
- `Available Memory Bytes` - Available memory in bytes
- `VmAvailabilityMetric` - VM availability status

**Disk I/O:**
- `Disk Read Bytes` - Bytes read from disk per second
- `Disk Write Bytes` - Bytes written to disk per second
- `Disk Read Operations/Sec` - Read IOPS
- `Disk Write Operations/Sec` - Write IOPS
- `OS Disk Bandwidth Consumed Percentage` - OS disk bandwidth usage
- `Data Disk Bandwidth Consumed Percentage` - Data disk bandwidth usage

**Network:**
- `Network In Total` - Bytes received across all network interfaces
- `Network Out Total` - Bytes sent across all network interfaces
- `Inbound Flows` - Current inbound flows
- `Outbound Flows` - Current outbound flows

**Premium Disk Metrics:**
- `OS Disk IOPS Consumed Percentage` - OS disk IOPS usage vs provisioned
- `Data Disk IOPS Consumed Percentage` - Data disk IOPS usage vs provisioned
- `OS Disk Target Bandwidth` - Provisioned OS disk bandwidth
- `Data Disk Target Bandwidth` - Provisioned data disk bandwidth

#### Output

```json
{
  "metricsConfiguration": {
    "resourceId": "/subscriptions/.../virtualMachines/vm-prod-001",
    "metrics": [
      {
        "name": "Percentage CPU",
        "aggregation": "Average",
        "frequency": "PT1M"
      },
      {
        "name": "Available Memory Bytes",
        "aggregation": "Average",
        "frequency": "PT1M"
      }
    ]
  }
}
```

#### CLI Command

```bash
# Generate metrics configuration
azmp mon metrics \
  --resource-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001" \
  --metrics '["Percentage CPU","Available Memory Bytes","Network In Total"]' \
  --aggregation "Average" \
  --frequency "PT1M"
```

---

### `monitor:applicationInsights`

Creates an Application Insights component for application performance monitoring (APM).

#### Syntax

```handlebars
{{monitor:applicationInsights
  name="appinsights-webapp-prod"
  location="eastus"
  applicationType="web"
  workspaceResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"
  retentionInDays=90
  samplingPercentage=100
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Application Insights component name |
| `location` | string | ✅ | - | Azure region |
| `applicationType` | string | ❌ | `web` | Application type: `web`, `other` |
| `workspaceResourceId` | string | ❌ | - | Link to Log Analytics workspace |
| `retentionInDays` | number | ❌ | `90` | Data retention (30-730 days) |
| `samplingPercentage` | number | ❌ | `100` | Sampling percentage (0-100) |
| `tags` | string | ❌ | - | JSON object of tags |

#### Application Types

- **`web`:** Web applications (ASP.NET, Node.js, Java, Python)
- **`other`:** Other application types (mobile apps, desktop apps, services)

#### Output

```json
{
  "type": "Microsoft.Insights/components",
  "apiVersion": "2020-02-02",
  "name": "appinsights-webapp-prod",
  "location": "eastus",
  "kind": "web",
  "properties": {
    "Application_Type": "web",
    "Flow_Type": "Bluefield",
    "Request_Source": "rest",
    "RetentionInDays": 90,
    "WorkspaceResourceId": "/subscriptions/.../workspaces/logs-prod",
    "IngestionMode": "LogAnalytics",
    "publicNetworkAccessForIngestion": "Enabled",
    "publicNetworkAccessForQuery": "Enabled",
    "SamplingPercentage": 100
  }
}
```

#### CLI Command

```bash
# Not available via CLI - use helper in templates
```

#### Use Cases

- **Web Applications:** Monitor ASP.NET, Node.js, Java, Python apps
- **Custom Metrics:** Track business KPIs (orders, signups, errors)
- **Availability Tests:** Multi-step availability monitoring
- **Dependency Tracking:** External service call monitoring
- **User Analytics:** Page views, user flows, session tracking

---

### `monitor:dataCollectionRule`

Creates a data collection rule (DCR) for Azure Monitor Agent.

#### Syntax

```handlebars
{{monitor:dataCollectionRule
  name="dcr-vm-perf-counters"
  location="eastus"
  dataSources='[{"performanceCounters":{"name":"perfCounters","streams":["Microsoft-Perf"],"samplingFrequencyInSeconds":60,"counterSpecifiers":["\\Processor(_Total)\\% Processor Time","\\Memory\\Available Bytes"]}}]'
  destinations='[{"logAnalytics":{"workspaceResourceId":"/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod","name":"logs-prod"}}]'
  dataFlows='[{"streams":["Microsoft-Perf"],"destinations":["logs-prod"]}]'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Data collection rule name |
| `location` | string | ✅ | - | Azure region |
| `dataSources` | string | ✅ | - | JSON array of data sources (performance counters, Windows events, Syslog) |
| `destinations` | string | ✅ | - | JSON array of destinations (Log Analytics workspaces) |
| `dataFlows` | string | ✅ | - | JSON array mapping data sources to destinations |
| `description` | string | ❌ | - | DCR description |

#### Common Performance Counters

**Windows:**
- `\Processor(_Total)\% Processor Time` - CPU usage
- `\Memory\Available Bytes` - Available memory
- `\Memory\% Committed Bytes In Use` - Memory usage percentage
- `\LogicalDisk(_Total)\% Free Space` - Disk free space
- `\LogicalDisk(_Total)\Disk Read Bytes/sec` - Disk read throughput
- `\LogicalDisk(_Total)\Disk Write Bytes/sec` - Disk write throughput
- `\Network Interface(*)\Bytes Total/sec` - Network throughput

**Linux:**
- `Processor(*)\\PercentProcessorTime` - CPU usage
- `Memory(*)\\AvailableMBytes` - Available memory
- `Memory(*)\\PercentUsedMemory` - Memory usage percentage
- `LogicalDisk(*)\\PercentFreeSpace` - Disk free space
- `LogicalDisk(*)\\BytesPerSecond` - Disk throughput
- `NetworkInterface(*)\\BytesTransmitted` - Network sent
- `NetworkInterface(*)\\BytesReceived` - Network received

#### Output

```json
{
  "type": "Microsoft.Insights/dataCollectionRules",
  "apiVersion": "2022-06-01",
  "name": "dcr-vm-perf-counters",
  "location": "eastus",
  "properties": {
    "dataSources": {
      "performanceCounters": [
        {
          "name": "perfCounters",
          "streams": ["Microsoft-Perf"],
          "samplingFrequencyInSeconds": 60,
          "counterSpecifiers": [
            "\\Processor(_Total)\\% Processor Time",
            "\\Memory\\Available Bytes"
          ]
        }
      ]
    },
    "destinations": {
      "logAnalytics": [
        {
          "workspaceResourceId": "/subscriptions/.../workspaces/logs-prod",
          "name": "logs-prod"
        }
      ]
    },
    "dataFlows": [
      {
        "streams": ["Microsoft-Perf"],
        "destinations": ["logs-prod"]
      }
    ]
  }
}
```

---

### `monitor:customMetric`

Defines custom application metrics for Application Insights.

#### Syntax

```handlebars
{{monitor:customMetric
  name="OrdersProcessed"
  namespace="ECommerce/Orders"
  displayName="Orders Processed"
  description="Number of customer orders processed per minute"
  unit="Count"
  aggregation="Total"
  dimensions='["Region","PaymentMethod","OrderType"]'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Metric name (alphanumeric, no spaces) |
| `namespace` | string | ❌ | `Custom/Metrics` | Metric namespace for organization |
| `displayName` | string | ❌ | `{name}` | Display name in Azure Portal |
| `description` | string | ❌ | - | Metric description |
| `unit` | string | ❌ | `Count` | Unit: `Count`, `Bytes`, `Seconds`, `Percent`, `Milliseconds` |
| `aggregation` | string | ❌ | `Average` | Aggregation: `Average`, `Sum`, `Min`, `Max`, `Total` |
| `dimensions` | string | ❌ | `[]` | JSON array of dimension names |

#### Output

```json
{
  "metricDefinition": {
    "name": "OrdersProcessed",
    "namespace": "ECommerce/Orders",
    "displayName": "Orders Processed",
    "description": "Number of customer orders processed per minute",
    "unit": "Count",
    "aggregationType": "Total",
    "dimensions": [
      {
        "name": "Region",
        "displayName": "Region",
        "toBeExportedForShoebox": true
      },
      {
        "name": "PaymentMethod",
        "displayName": "PaymentMethod",
        "toBeExportedForShoebox": true
      }
    ]
  },
  "usage": {
    "emitInstrumentation": "Use Application Insights SDK to emit custom metric...",
    "example": {
      "dotNet": "telemetryClient.GetMetric(\"OrdersProcessed\", \"Region\", \"PaymentMethod\").TrackValue(value);",
      "python": "telemetry_client.track_metric(\"OrdersProcessed\", value, properties={\"Region\": dimension_value})",
      "node": "appInsights.defaultClient.trackMetric({name: \"OrdersProcessed\", value: value})"
    }
  }
}
```

#### Use Cases

- **Business Metrics:** Orders, signups, checkouts, revenue
- **Application Metrics:** Cache hit rate, queue length, processing time
- **Infrastructure Metrics:** Custom health checks, synthetic transactions

---

## Alert Helpers

### `alert:metricAlert`

Creates a metric-based alert rule with static thresholds.

#### Syntax

```handlebars
{{alert:metricAlert
  name="alert-vm-high-cpu"
  description="Alert when VM CPU exceeds 80%"
  severity=2
  scopes='["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"]'
  evaluationFrequency="PT5M"
  windowSize="PT15M"
  criteria='[{"metricName":"Percentage CPU","metricNamespace":"Microsoft.Compute/virtualMachines","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]'
  actionGroupIds='["/subscriptions/{sub}/resourceGroups/{rg}/providers/microsoft.insights/actionGroups/ops-team"]'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Alert rule name |
| `description` | string | ❌ | - | Alert description |
| `severity` | number | ❌ | `2` | Severity: `0` (Critical) to `4` (Verbose) |
| `scopes` | string | ✅ | - | JSON array of resource IDs to monitor |
| `evaluationFrequency` | string | ❌ | `PT5M` | How often to evaluate (ISO 8601) |
| `windowSize` | string | ❌ | `PT15M` | Time window for evaluation |
| `criteria` | string | ✅ | - | JSON array of metric criteria |
| `actionGroupIds` | string | ❌ | - | JSON array of action group IDs |
| `autoMitigate` | boolean | ❌ | `true` | Auto-resolve when condition no longer met |

#### Severity Levels

| Level | Name | Description | Use Cases |
|-------|------|-------------|-----------|
| **0** | Critical | Service down, data loss | VM unavailable, disk full, service crashed |
| **1** | Error | Degraded performance | High CPU sustained, memory low, errors spiking |
| **2** | Warning | Potential issues | CPU above 70%, disk space low, latency increasing |
| **3** | Informational | Notable events | Scaling events, configuration changes |
| **4** | Verbose | Detailed logging | Debug information, detailed metrics |

#### Metric Criteria Structure

```json
{
  "metricName": "Percentage CPU",
  "metricNamespace": "Microsoft.Compute/virtualMachines",
  "operator": "GreaterThan",
  "threshold": 80,
  "timeAggregation": "Average"
}
```

**Operators:** `GreaterThan`, `LessThan`, `GreaterThanOrEqual`, `LessThanOrEqual`, `Equals`, `NotEquals`  
**Time Aggregations:** `Average`, `Minimum`, `Maximum`, `Total`, `Count`

#### Output

```json
{
  "type": "Microsoft.Insights/metricAlerts",
  "apiVersion": "2018-03-01",
  "name": "alert-vm-high-cpu",
  "location": "global",
  "properties": {
    "description": "Alert when VM CPU exceeds 80%",
    "severity": 2,
    "enabled": true,
    "scopes": [
      "/subscriptions/.../virtualMachines/vm-prod-001"
    ],
    "evaluationFrequency": "PT5M",
    "windowSize": "PT15M",
    "criteria": {
      "allOf": [
        {
          "criterionType": "StaticThresholdCriterion",
          "metricName": "Percentage CPU",
          "metricNamespace": "Microsoft.Compute/virtualMachines",
          "operator": "GreaterThan",
          "threshold": 80,
          "timeAggregation": "Average"
        }
      ],
      "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria"
    },
    "autoMitigate": true,
    "actions": [
      {
        "actionGroupId": "/subscriptions/.../actionGroups/ops-team"
      }
    ]
  }
}
```

#### CLI Command

```bash
# Generate metric alert
azmp alert metric \
  --name "alert-vm-high-cpu" \
  --description "Alert when VM CPU exceeds 80%" \
  --severity 2 \
  --scopes '["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"]' \
  --criteria '[{"metricName":"Percentage CPU","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]' \
  --frequency "PT5M" \
  --window "PT15M" \
  --action-groups '["/subscriptions/{sub}/resourceGroups/{rg}/providers/microsoft.insights/actionGroups/ops-team"]'
```

#### Common Alert Scenarios

**High CPU Usage:**
```handlebars
{{alert:metricAlert
  name="alert-high-cpu"
  severity=1
  scopes='["{vmResourceId}"]'
  criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","threshold":85,"timeAggregation":"Average"}]'
  windowSize="PT15M"
}}
```

**Low Available Memory:**
```handlebars
{{alert:metricAlert
  name="alert-low-memory"
  severity=1
  scopes='["{vmResourceId}"]'
  criteria='[{"metricName":"Available Memory Bytes","operator":"LessThan","threshold":536870912,"timeAggregation":"Average"}]'
}}
```

**High Disk I/O:**
```handlebars
{{alert:metricAlert
  name="alert-high-disk-io"
  severity=2
  scopes='["{vmResourceId}"]'
  criteria='[{"metricName":"OS Disk IOPS Consumed Percentage","operator":"GreaterThan","threshold":90,"timeAggregation":"Average"}]'
}}
```

---

### `alert:dynamicMetricAlert`

Creates a dynamic threshold alert using machine learning.

#### Syntax

```handlebars
{{alert:dynamicMetricAlert
  name="alert-vm-anomaly-cpu"
  description="Detect CPU anomalies using ML"
  severity=2
  scopes='["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"]'
  evaluationFrequency="PT5M"
  windowSize="PT15M"
  criteria='[{"metricName":"Percentage CPU","metricNamespace":"Microsoft.Compute/virtualMachines","operator":"GreaterThan","alertSensitivity":"Medium","failingPeriods":{"numberOfEvaluationPeriods":4,"minFailingPeriodsToAlert":3},"timeAggregation":"Average"}]'
}}
```

#### Parameters

Same as `metricAlert`, but criteria uses `alertSensitivity` instead of `threshold`.

#### Alert Sensitivity Levels

- **`Low`:** Less sensitive, fewer false positives, may miss anomalies
- **`Medium`:** Balanced sensitivity (recommended)
- **`High`:** Very sensitive, more false positives, catches subtle anomalies

#### Use Cases

- **Variable Workloads:** Applications with fluctuating traffic patterns
- **Seasonal Patterns:** Daily/weekly/monthly usage variations
- **Early Warning:** Detect deviations before they become problems

---

### `alert:logAlert`

Creates a log query alert using KQL (Kusto Query Language).

#### Syntax

```handlebars
{{alert:logAlert
  name="alert-vm-high-error-rate"
  description="Alert on high error rate in application logs"
  severity=1
  scopes='["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"]'
  evaluationFrequency="PT5M"
  windowSize="PT15M"
  query="Syslog | where Facility == 'auth' and SeverityLevel == 'err' | summarize Count = count() by Computer | where Count > 10"
  threshold=0
  operator="GreaterThan"
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Alert rule name |
| `description` | string | ❌ | - | Alert description |
| `severity` | number | ❌ | `2` | Severity (0-4) |
| `scopes` | string | ✅ | - | JSON array of workspace IDs |
| `evaluationFrequency` | string | ❌ | `PT5M` | Evaluation frequency |
| `windowSize` | string | ❌ | `PT15M` | Query time window |
| `query` | string | ✅ | - | KQL query |
| `threshold` | number | ❌ | `0` | Number of results threshold |
| `operator` | string | ❌ | `GreaterThan` | Comparison operator |
| `actionGroupIds` | string | ❌ | - | JSON array of action group IDs |

#### CLI Command

```bash
# Generate log alert
azmp alert log \
  --name "alert-vm-high-error-rate" \
  --description "Alert on high error rate" \
  --severity 1 \
  --scopes '["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"]' \
  --query "Syslog | where Facility == 'auth' and SeverityLevel == 'err' | summarize Count = count() | where Count > 10" \
  --threshold 0 \
  --frequency "PT5M" \
  --window "PT15M"
```

---

### `alert:activityLogAlert`

Creates alerts on Azure Activity Log events (management operations).

#### Syntax

```handlebars
{{alert:activityLogAlert
  name="alert-vm-deleted"
  description="Alert when VM is deleted"
  scopes='["/subscriptions/{sub}"]'
  condition='[{"field":"category","equals":"Administrative"},{"field":"operationName","equals":"Microsoft.Compute/virtualMachines/delete"},{"field":"status","equals":"Succeeded"}]'
  actionGroups='["/subscriptions/{sub}/resourceGroups/{rg}/providers/microsoft.insights/actionGroups/ops-team"]'
}}
```

#### Common Activity Log Categories

- **`Administrative`:** Resource management operations (create, delete, update)
- **`ServiceHealth`:** Azure service health events
- **`ResourceHealth`:** Resource health status changes
- **`Alert`:** Alert state changes
- **`Autoscale`:** Autoscale operations
- **`Security`:** Security Center alerts
- **`Recommendation`:** Azure Advisor recommendations

---

### `alert:actionGroup`

Creates an action group for alert notifications.

#### Syntax

```handlebars
{{alert:actionGroup
  name="ops-team"
  shortName="opstalert"
  emailReceivers='[{"name":"admin","emailAddress":"admin@company.com"},{"name":"oncall","emailAddress":"oncall@company.com"}]'
  smsReceivers='[{"name":"oncall-sms","countryCode":"1","phoneNumber":"5551234567"}]'
  webhookReceivers='[{"name":"teams","serviceUri":"https://company.webhook.office.com/..."}]'
}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Action group name |
| `shortName` | string | ✅ | - | Short name (max 12 chars) for SMS |
| `emailReceivers` | string | ❌ | - | JSON array of email receivers |
| `smsReceivers` | string | ❌ | - | JSON array of SMS receivers |
| `webhookReceivers` | string | ❌ | - | JSON array of webhook receivers |
| `azureFunctionReceivers` | string | ❌ | - | JSON array of Azure Function receivers |
| `logicAppReceivers` | string | ❌ | - | JSON array of Logic App receivers |

#### CLI Command

```bash
# Generate action group
azmp alert action-group \
  --name "ops-team" \
  --short-name "opstalert" \
  --email-receivers '[{"name":"admin","emailAddress":"admin@company.com"}]' \
  --sms-receivers '[{"name":"oncall","countryCode":"1","phoneNumber":"5551234567"}]'
```

---

### `alert:smartGroup`

Configures smart grouping of alerts using machine learning.

#### Syntax

```handlebars
{{alert:smartGroup
  name="smart-group-prod-vms"
  description="Intelligent grouping of production VM alerts"
  scopes='["/subscriptions/{sub}/resourceGroups/prod-vms"]'
  groupingStrategy="allOf"
}}
```

#### Use Cases

- **Reduce Alert Fatigue:** Group related alerts together
- **Incident Management:** Correlate alerts from related resources
- **Root Cause Analysis:** Identify common patterns in alert storms

---

## Dashboard & Workbook Helpers

### `dashboard:vmHealth`

Creates a VM health monitoring dashboard.

#### Syntax

```handlebars
{{dashboard:vmHealth
  name="dash-vm-health-prod"
  location="eastus"
  vmResourceIds='["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001","/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-002"]'
  showCpu=true
  showMemory=true
  showDisk=true
  showNetwork=true
}}
```

#### Dashboard Widgets

- **CPU Usage:** Line chart with 24h trend
- **Memory Usage:** Gauge showing current utilization
- **Disk I/O:** Stacked area chart for read/write
- **Network Traffic:** Line chart for in/out
- **VM Status:** Grid showing all VMs with health status

#### CLI Command

```bash
# Generate VM health dashboard
azmp dash vm-health \
  --name "dash-vm-health-prod" \
  --location "eastus" \
  --vm-ids '["/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/vm-prod-001"]' \
  --show-cpu \
  --show-memory \
  --show-disk
```

---

### `dashboard:vmssScaling`

Creates a VMSS autoscaling dashboard.

#### Syntax

```handlebars
{{dashboard:vmssScaling
  name="dash-vmss-scaling"
  location="eastus"
  vmssResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-prod"
  showInstanceCount=true
  showCpu=true
  showNetwork=true
  showScaleEvents=true
}}
```

#### CLI Command

```bash
# Generate VMSS scaling dashboard
azmp dash vmss-scaling \
  --name "dash-vmss-scaling" \
  --location "eastus" \
  --vmss-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-prod" \
  --show-instances \
  --show-cpu
```

---

### `dashboard:multiRegionHealth`

Creates a multi-region health monitoring dashboard.

#### Syntax

```handlebars
{{dashboard:multiRegionHealth
  name="dash-global-health"
  location="eastus"
  regions=[{"name":"East US","vmResourceIds":[...]},{"name":"West US","vmResourceIds":[...]}]
  showAvailability=true
  showLatency=true
  showThroughput=true
}}
```

---

### `dashboard:loadBalancerPerformance`

Creates a load balancer performance dashboard.

#### Syntax

```handlebars
{{dashboard:loadBalancerPerformance
  name="dash-lb-performance"
  location="eastus"
  loadBalancerResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Network/loadBalancers/lb-prod"
  showThroughput=true
  showHealthProbes=true
  showSnatPorts=true
}}
```

---

### `dashboard:costAnalysis`

Creates a cost analysis dashboard.

#### Syntax

```handlebars
{{dashboard:costAnalysis
  name="dash-cost-analysis"
  location="eastus"
  scope="/subscriptions/{sub}/resourceGroups/prod"
  showDailyCosts=true
  showCostByResource=true
  showBudgets=true
  timeRange="30d"
}}
```

---

### `workbook:vmDiagnostics`

Creates an interactive VM diagnostics workbook.

#### Syntax

```handlebars
{{workbook:vmDiagnostics
  name="workbook-vm-diagnostics"
  location="eastus"
  workspaceResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"
  vmResourceIds='[...]'
}}
```

---

### `workbook:securityPosture`

Creates a security posture workbook with Azure Defender integration.

#### Syntax

```handlebars
{{workbook:securityPosture
  name="workbook-security-posture"
  location="eastus"
  workspaceResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"
  scope="/subscriptions/{sub}"
  showRecommendations=true
  showAlerts=true
  showCompliance=true
}}
```

---

### `workbook:performanceAnalysis`

Creates a performance analysis workbook.

#### Syntax

```handlebars
{{workbook:performanceAnalysis
  name="workbook-perf-analysis"
  location="eastus"
  workspaceResourceId="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/logs-prod"
  vmResourceIds='[...]'
  timeRange="24h"
}}
```

---

## CLI Commands

### Quick Reference

```bash
# Monitoring
azmp mon workspace --name <name> --location <location> [--sku <sku>] [--retention <days>]
azmp mon diagnostics --name <name> --resource-id <id> --workspace-id <id> [--logs <json>] [--metrics <json>]
azmp mon metrics --resource-id <id> --metrics <json> [--aggregation <type>] [--frequency <duration>]

# Alerts
azmp alert metric --name <name> --scopes <json> --criteria <json> [--severity <0-4>] [--action-groups <json>]
azmp alert log --name <name> --scopes <json> --query <kql> [--threshold <n>] [--action-groups <json>]
azmp alert action-group --name <name> --short-name <short> [--email-receivers <json>] [--sms-receivers <json>]

# Dashboards
azmp dash vm-health --name <name> --location <location> --vm-ids <json> [--show-cpu] [--show-memory]
azmp dash vmss-scaling --name <name> --location <location> --vmss-id <id> [--show-instances] [--show-cpu]
```

---

## Complete Integration Examples

### Example 1: Complete Monitoring Stack for Production VM

```handlebars
{{!-- 1. Create Log Analytics Workspace --}}
{{monitor:logAnalyticsWorkspace
  name="logs-prod-eastus"
  location="eastus"
  sku="PerGB2018"
  retentionInDays=90
}}

{{!-- 2. Create Action Group for Notifications --}}
{{alert:actionGroup
  name="ops-team-prod"
  shortName="opsprod"
  emailReceivers='[{"name":"admin","emailAddress":"ops@company.com"}]'
  smsReceivers='[{"name":"oncall","countryCode":"1","phoneNumber":"5551234567"}]'
}}

{{!-- 3. Configure Diagnostic Settings --}}
{{monitor:diagnosticSettings
  name="vm-diagnostics"
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm-prod-001')]"
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-prod-eastus')]"
  logs='[]'
  metrics='[{"category":"AllMetrics","enabled":true}]'
}}

{{!-- 4. Configure Metrics Collection --}}
{{monitor:metrics
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'vm-prod-001')]"
  metrics='["Percentage CPU","Available Memory Bytes","Network In Total","Network Out Total","Disk Read Bytes","Disk Write Bytes"]'
  aggregation="Average"
  frequency="PT1M"
}}

{{!-- 5. Create CPU Alert --}}
{{alert:metricAlert
  name="alert-vm-high-cpu"
  description="Alert when VM CPU exceeds 80% for 15 minutes"
  severity=2
  scopes='["[resourceId('Microsoft.Compute/virtualMachines', 'vm-prod-001')]"]'
  evaluationFrequency="PT5M"
  windowSize="PT15M"
  criteria='[{"metricName":"Percentage CPU","metricNamespace":"Microsoft.Compute/virtualMachines","operator":"GreaterThan","threshold":80,"timeAggregation":"Average"}]'
  actionGroupIds='["[resourceId('microsoft.insights/actionGroups', 'ops-team-prod')]"]'
}}

{{!-- 6. Create Memory Alert --}}
{{alert:metricAlert
  name="alert-vm-low-memory"
  description="Alert when available memory is below 512MB"
  severity=1
  scopes='["[resourceId('Microsoft.Compute/virtualMachines', 'vm-prod-001')]"]'
  criteria='[{"metricName":"Available Memory Bytes","operator":"LessThan","threshold":536870912,"timeAggregation":"Average"}]'
  actionGroupIds='["[resourceId('microsoft.insights/actionGroups', 'ops-team-prod')]"]'
}}

{{!-- 7. Create VM Health Dashboard --}}
{{dashboard:vmHealth
  name="dash-vm-prod-health"
  location="eastus"
  vmResourceIds='["[resourceId('Microsoft.Compute/virtualMachines', 'vm-prod-001')]"]'
  showCpu=true
  showMemory=true
  showDisk=true
  showNetwork=true
}}
```

### Example 2: VMSS with Auto-Scaling Monitoring

```handlebars
{{!-- 1. Configure VMSS Metrics --}}
{{monitor:metrics
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'vmss-webapp')]"
  metrics='["Percentage CPU","Available Memory Bytes","Inbound Flows","Outbound Flows"]'
  aggregation="Average"
  frequency="PT1M"
}}

{{!-- 2. Create Dynamic CPU Alert for Anomaly Detection --}}
{{alert:dynamicMetricAlert
  name="alert-vmss-cpu-anomaly"
  description="Detect abnormal CPU patterns in VMSS"
  severity=2
  scopes='["[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'vmss-webapp')]"]'
  criteria='[{"metricName":"Percentage CPU","operator":"GreaterThan","alertSensitivity":"Medium","failingPeriods":{"numberOfEvaluationPeriods":4,"minFailingPeriodsToAlert":3},"timeAggregation":"Average"}]'
  actionGroupIds='["[resourceId('microsoft.insights/actionGroups', 'ops-team-prod')]"]'
}}

{{!-- 3. Create VMSS Scaling Dashboard --}}
{{dashboard:vmssScaling
  name="dash-vmss-scaling"
  location="eastus"
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'vmss-webapp')]"
  showInstanceCount=true
  showCpu=true
  showNetwork=true
  showScaleEvents=true
}}
```

### Example 3: Multi-Region Health Monitoring

```handlebars
{{!-- 1. Create Workspace --}}
{{monitor:logAnalyticsWorkspace
  name="logs-global"
  location="eastus"
  retentionInDays=90
}}

{{!-- 2. Application Insights for Each Region --}}
{{monitor:applicationInsights
  name="appinsights-eastus"
  location="eastus"
  workspaceResourceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-global')]"
}}

{{monitor:applicationInsights
  name="appinsights-westus"
  location="westus"
  workspaceResourceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'logs-global')]"
}}

{{!-- 3. Multi-Region Dashboard --}}
{{dashboard:multiRegionHealth
  name="dash-global-health"
  location="eastus"
  regions=[
    {
      "name":"East US",
      "vmResourceIds":["[resourceId('Microsoft.Compute/virtualMachines', 'vm-east-001')]"],
      "loadBalancerResourceId":"[resourceId('Microsoft.Network/loadBalancers', 'lb-east')]"
    },
    {
      "name":"West US",
      "vmResourceIds":["[resourceId('Microsoft.Compute/virtualMachines', 'vm-west-001')]"],
      "loadBalancerResourceId":"[resourceId('Microsoft.Network/loadBalancers', 'lb-west')]"
    }
  ]
  showAvailability=true
  showLatency=true
}}

{{!-- 4. Activity Log Alert for Service Health --}}
{{alert:activityLogAlert
  name="alert-service-health"
  description="Alert on Azure service health incidents"
  scopes='["/subscriptions/{subscriptionId}"]'
  condition='[{"field":"category","equals":"ServiceHealth"},{"field":"properties.incidentType","equals":"Incident"}]'
  actionGroups='["[resourceId('microsoft.insights/actionGroups', 'ops-team-prod')]"]'
}}
```

### Example 4: Application Insights with Custom Metrics

```handlebars
{{!-- 1. Create Application Insights --}}
{{monitor:applicationInsights
  name="appinsights-webapp"
  location="eastus"
  applicationType="web"
  retentionInDays=90
  samplingPercentage=100
}}

{{!-- 2. Define Custom Metrics --}}
{{monitor:customMetric
  name="OrdersProcessed"
  namespace="ECommerce/Orders"
  description="Number of orders processed per minute"
  unit="Count"
  aggregation="Total"
  dimensions='["Region","PaymentMethod"]'
}}

{{monitor:customMetric
  name="CheckoutDuration"
  namespace="ECommerce/Orders"
  description="Time taken to complete checkout"
  unit="Milliseconds"
  aggregation="Average"
  dimensions='["Region","PaymentMethod"]'
}}

{{!-- 3. Alert on Custom Metric --}}
{{alert:metricAlert
  name="alert-low-order-rate"
  description="Alert when order rate drops below threshold"
  severity=2
  scopes='["[resourceId('Microsoft.Insights/components', 'appinsights-webapp')]"]'
  criteria='[{"metricName":"OrdersProcessed","metricNamespace":"ECommerce/Orders","operator":"LessThan","threshold":10,"timeAggregation":"Total"}]'
  windowSize="PT5M"
}}
```

---

## KQL Query Library

### VM Performance Queries

**CPU Usage Over Time:**
```kql
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where Computer startswith "vm-prod"
| summarize AvgCPU = avg(CounterValue) by Computer, bin(TimeGenerated, 5m)
| render timechart
```

**Memory Usage:**
```kql
Perf
| where ObjectName == "Memory" and CounterName == "Available MBytes"
| where Computer startswith "vm-prod"
| summarize AvgMemoryMB = avg(CounterValue) by Computer, bin(TimeGenerated, 5m)
| render timechart
```

**Disk I/O:**
```kql
Perf
| where ObjectName == "LogicalDisk" and CounterName in ("Disk Read Bytes/sec", "Disk Write Bytes/sec")
| where Computer startswith "vm-prod"
| summarize AvgDiskIO = avg(CounterValue) by Computer, CounterName, bin(TimeGenerated, 5m)
| render timechart
```

### Security Queries

**Failed SSH Login Attempts:**
```kql
Syslog
| where Facility == "auth" and SeverityLevel == "err"
| where SyslogMessage contains "Failed password"
| summarize FailedAttempts = count() by Computer, SourceIP = extract(@"from ([0-9.]+)", 1, SyslogMessage)
| where FailedAttempts > 5
| order by FailedAttempts desc
```

**NSG Rule Hits:**
```kql
AzureDiagnostics
| where Category == "NetworkSecurityGroupRuleCounter"
| summarize Count = sum(matchedConnections_d) by ruleName_s, direction_s
| order by Count desc
```

### Application Insights Queries

**Request Duration:**
```kql
requests
| where timestamp > ago(1h)
| summarize
    AvgDuration = avg(duration),
    P95Duration = percentile(duration, 95),
    P99Duration = percentile(duration, 99),
    Count = count()
    by operation_Name
| order by AvgDuration desc
```

**Exceptions:**
```kql
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type, outerMessage
| order by Count desc
```

**Custom Metric Analysis:**
```kql
customMetrics
| where name == "OrdersProcessed"
| summarize TotalOrders = sum(value) by bin(timestamp, 1h), tostring(customDimensions.Region)
| render timechart
```

### Alert Queries

**Identify VMs with High CPU:**
```kql
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where CounterValue > 80
| summarize AvgCPU = avg(CounterValue), Count = count() by Computer
| where Count > 3  // High CPU for at least 3 samples
| order by AvgCPU desc
```

**VMs with Low Disk Space:**
```kql
Perf
| where ObjectName == "LogicalDisk" and CounterName == "% Free Space"
| where CounterValue < 10
| summarize MinFreeSpace = min(CounterValue) by Computer, InstanceName
| order by MinFreeSpace asc
```

---

## Best Practices

### Workspace Organization

1. **Separate Workspaces by Environment:**
   - Production: `logs-prod-{region}`
   - Staging: `logs-staging-{region}`
   - Development: `logs-dev-{region}`

2. **Regional Workspaces for Global Deployments:**
   - Create workspace in same region as resources for optimal performance
   - Use cross-workspace queries for global analysis

3. **Retention Policies:**
   - Production: 90-180 days for compliance
   - Non-production: 30 days to minimize costs
   - Archive to Storage Account for long-term retention

### Metric Collection

1. **Choose Appropriate Frequency:**
   - Real-time monitoring: `PT1M` (1 minute)
   - Standard monitoring: `PT5M` (5 minutes)
   - Cost-sensitive: `PT15M` (15 minutes)

2. **Select Essential Metrics:**
   - Don't collect all metrics - focus on what matters
   - Start with: CPU, Memory, Disk I/O, Network
   - Add custom metrics for business KPIs

3. **Use Aggregations Wisely:**
   - `Average`: CPU, memory, latency
   - `Total`: Request counts, bytes transferred
   - `Maximum`: Peak usage, burst detection
   - `Minimum`: Capacity planning

### Alert Configuration

1. **Set Appropriate Severities:**
   - **Sev 0 (Critical):** Page on-call team immediately
   - **Sev 1 (Error):** Urgent, investigate within 15 minutes
   - **Sev 2 (Warning):** Important, investigate within 1 hour
   - **Sev 3 (Info):** Informational, review during business hours

2. **Avoid Alert Fatigue:**
   - Use dynamic thresholds for variable workloads
   - Configure appropriate evaluation windows (15-30 minutes)
   - Enable auto-mitigation
   - Use action groups to route alerts correctly

3. **Alert Naming Convention:**
   - Format: `alert-{resource}-{metric}-{condition}`
   - Examples: `alert-vm-high-cpu`, `alert-lb-down`, `alert-disk-full`

4. **Test Alerts:**
   - Generate test alerts to verify action groups
   - Document expected alert frequency
   - Review and tune thresholds regularly

### Dashboard Design

1. **Purpose-Driven Dashboards:**
   - **Operations Dashboard:** Real-time health, alerts, incidents
   - **Performance Dashboard:** Trends, capacity planning
   - **Cost Dashboard:** Spend analysis, optimization opportunities
   - **Security Dashboard:** Threats, compliance, vulnerabilities

2. **Widget Best Practices:**
   - Limit to 10-15 widgets per dashboard
   - Use consistent time ranges
   - Include title and description for each widget
   - Color code for quick visual identification

3. **Sharing and Permissions:**
   - Share dashboards with appropriate teams
   - Pin frequently used dashboards
   - Export dashboards for documentation

### Cost Optimization

1. **Data Ingestion:**
   - Monitor Log Analytics data ingestion costs
   - Use sampling for high-volume telemetry
   - Filter unnecessary data at source
   - Archive old data to cheaper storage

2. **Metrics Collection:**
   - Increase collection frequency only where needed
   - Use platform metrics (free) before custom metrics
   - Limit number of metric dimensions

3. **Alerting:**
   - Consolidate similar alerts
   - Use log alerts sparingly (charged per query)
   - Configure appropriate evaluation frequencies

### Security

1. **Access Control:**
   - Use RBAC for workspace access
   - Limit write access to production workspaces
   - Audit access logs regularly

2. **Data Privacy:**
   - Mask sensitive data in logs
   - Use customer-managed keys for encryption
   - Configure network isolation for workspaces

3. **Compliance:**
   - Enable diagnostic settings for audit trail
   - Configure log retention per compliance requirements
   - Use private endpoints for sensitive workloads

---

## Troubleshooting

### Common Issues

#### Issue: Metrics Not Appearing in Azure Monitor

**Symptoms:**
- Metrics show "No data" in Azure Portal
- Alerts not triggering despite high resource usage

**Solutions:**
1. Verify diagnostic settings are configured correctly
2. Check that Azure Monitor Agent is installed and running:
   ```bash
   # Windows
   Get-Service AzureMonitorWindowsAgent
   
   # Linux
   systemctl status azuremonitoragent
   ```
3. Verify workspace ID and key are correct
4. Check firewall rules allow outbound HTTPS (443) to Azure Monitor endpoints
5. Review agent logs:
   - Windows: `C:\WindowsAzure\Logs\AzureMonitorAgent\`
   - Linux: `/var/opt/microsoft/azuremonitoragent/log/`

#### Issue: Log Analytics Queries Return No Results

**Symptoms:**
- KQL queries return empty results
- Expected logs not appearing in workspace

**Solutions:**
1. Check data collection rules (DCR) configuration
2. Verify VM is associated with DCR:
   ```kql
   Heartbeat
   | where Computer == "vm-name"
   | distinct TimeGenerated
   | order by TimeGenerated desc
   ```
3. Allow 5-10 minutes for data ingestion
4. Check agent status in VM extensions
5. Verify workspace has correct permissions

#### Issue: Alerts Not Firing

**Symptoms:**
- Condition is met but alert doesn't trigger
- Action group not receiving notifications

**Solutions:**
1. Verify alert rule is enabled
2. Check evaluation frequency and window size
3. Confirm action group is configured correctly
4. Test action group:
   - Go to Action Group → Test action group
   - Select notification type and send test
5. Review alert history in Azure Portal:
   - Monitor → Alerts → Alert rules → Select rule → History
6. Check email spam folders for notifications

#### Issue: High Log Analytics Costs

**Symptoms:**
- Unexpectedly high Azure bill
- Rapid data ingestion growth

**Solutions:**
1. Identify top data sources:
   ```kql
   Usage
   | where TimeGenerated > ago(30d)
   | where IsBillable == true
   | summarize IngestedGB = sum(Quantity) / 1000 by DataType
   | order by IngestedGB desc
   ```
2. Review and optimize log collection:
   - Reduce collection frequency
   - Filter out verbose/debug logs
   - Use sampling for high-volume sources
3. Consider capacity reservation pricing for predictable usage
4. Set daily cap on workspace (with caution):
   ```bash
   az monitor log-analytics workspace update \
     --resource-group <rg> \
     --workspace-name <workspace> \
     --quota 1
   ```

#### Issue: Dashboard Not Updating

**Symptoms:**
- Dashboard shows stale data
- Metrics not refreshing

**Solutions:**
1. Check auto-refresh settings (should be 5m - 1h)
2. Verify time range is appropriate
3. Confirm underlying data sources are healthy
4. Clear browser cache
5. Recreate dashboard widgets if persisted

### Performance Optimization

#### Slow KQL Queries

**Solutions:**
1. Use time filters early in query:
   ```kql
   Perf
   | where TimeGenerated > ago(1h)  // Filter first
   | where CounterName == "% Processor Time"
   ```
2. Limit result set:
   ```kql
   | take 1000  // Limit rows
   | project Computer, TimeGenerated, CounterValue  // Limit columns
   ```
3. Use summarize instead of multiple aggregations:
   ```kql
   // Better
   | summarize AvgCPU = avg(CounterValue), MaxCPU = max(CounterValue) by Computer
   
   // Worse
   | summarize AvgCPU = avg(CounterValue) by Computer
   | join (Perf | summarize MaxCPU = max(CounterValue) by Computer) on Computer
   ```
4. Pre-aggregate data for long time ranges
5. Use materialized views for frequently run queries

### Getting Help

**Azure Support:**
- Create support ticket in Azure Portal
- Include: Workspace ID, resource IDs, query text, error messages

**Documentation:**
- [Azure Monitor Documentation](https://docs.microsoft.com/azure/azure-monitor/)
- [KQL Reference](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
- [Monitoring Best Practices](https://docs.microsoft.com/azure/azure-monitor/best-practices)

**Community:**
- [Azure Monitor Forum](https://docs.microsoft.com/answers/topics/azure-monitor.html)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-monitor)

---

## Version History

### v1.7.0 (Day 7) - Monitoring & Observability

**New Features:**
- 6 monitoring helpers for Log Analytics, metrics, diagnostics
- 6 alert helpers for metric/log alerts and action groups
- 8 dashboard/workbook helpers for visualization
- 8 CLI commands (`mon`, `alert`, `dash`)
- 8 integration tests validating complete workflows
- Comprehensive KQL query library
- Best practices and troubleshooting guide

**Test Coverage:** 338/338 tests passing

---

## Next Steps

1. **Implement Monitoring:**
   - Create Log Analytics workspace
   - Configure diagnostic settings for all resources
   - Set up essential metric alerts (CPU, memory, disk)

2. **Configure Alerting:**
   - Create action groups for different teams
   - Set up metric alerts for resource thresholds
   - Configure log alerts for security events

3. **Build Dashboards:**
   - Create operational dashboard for daily monitoring
   - Build performance dashboard for capacity planning
   - Set up cost dashboard for budget tracking

4. **Optimize:**
   - Review alert accuracy and tune thresholds
   - Optimize KQL queries for performance
   - Reduce data ingestion costs

5. **Automate:**
   - Use CLI commands in CI/CD pipelines
   - Generate monitoring configurations from templates
   - Automate alert response with Azure Automation

---

**Ready to get started?** Use the CLI commands to quickly generate monitoring configurations, or integrate the Handlebars helpers into your ARM templates for complete infrastructure-as-code!
