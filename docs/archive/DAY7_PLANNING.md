# Day 7 Planning: Monitoring & Alerting Stack

**Planning Date:** October 25, 2025  
**Target Release:** v1.7.0  
**Priority:** High (Critical observability for v1.6.0 scaling features)

---

## 🎯 Executive Summary

Day 7 will implement comprehensive monitoring and alerting capabilities to provide deep visibility into Azure VM deployments. This release focuses on Azure Monitor integration, Application Insights telemetry, custom metrics, alert rules, log analytics, and dashboard templates—enabling proactive incident detection and performance optimization.

**Why This Matters:**
- v1.6.0 introduced VMSS, auto-scaling, and multi-region deployments
- These features generate complex telemetry requiring sophisticated monitoring
- Customers need real-time visibility into scaling operations, health, and performance
- Proactive alerting prevents downtime and optimizes costs

---

## 📋 Objectives

### Primary Goals

1. **Azure Monitor Integration**
   - Metric collection from VMs and VMSS
   - Platform metrics (CPU, memory, disk, network)
   - Guest-level metrics (process, services, custom)
   - Integration with v1.6.0 auto-scaling triggers

2. **Application Insights**
   - Application performance monitoring (APM)
   - Distributed tracing for multi-region deployments
   - Dependency tracking
   - User behavior analytics
   - Integration with load balancers (Standard LB, App Gateway)

3. **Custom Metrics & Logs**
   - Custom metric definitions
   - Log Analytics workspace integration
   - KQL (Kusto Query Language) query templates
   - Structured logging from VM extensions

4. **Alert Rules & Actions**
   - Metric alerts (static threshold, dynamic)
   - Log alerts (KQL-based)
   - Activity log alerts
   - Action groups (email, SMS, webhook, automation)
   - Smart groups for alert correlation

5. **Dashboard Templates**
   - VM health overview
   - VMSS scaling operations
   - Multi-region health map
   - Load balancer performance
   - Cost analysis
   - Security posture

---

## 🏗️ Architecture Overview

### Component Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Azure Portal │  │   Workbooks  │  │    Grafana   │      │
│  │  Dashboards  │  │  (Interactive)│  │  (External)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Alerting & Actions Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Metric Alerts │  │  Log Alerts  │  │Activity Alerts│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Action Groups │  │ Smart Groups │  │  Webhooks    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Data Collection & Analytics Layer              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Azure Monitor │  │App Insights  │  │Log Analytics │      │
│  │   Metrics    │  │  Telemetry   │  │  Workspace   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  VMs / VMSS  │  │ Load Balancer│  │Traffic Manager│      │
│  │   (Compute)  │  │  (Networking)│  │ (Multi-region)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │App Gateway   │  │  Front Door  │  │Auto-Scale    │      │
│  │    (WAF)     │  │   (Global)   │  │  (Actions)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Collection:** VMs, VMSS, load balancers emit metrics/logs → Azure Monitor
2. **Aggregation:** Metrics stored in time-series DB, logs in Log Analytics workspace
3. **Analysis:** KQL queries, custom metrics, Application Insights correlation
4. **Alerting:** Alert rules evaluate conditions → Action groups trigger notifications
5. **Visualization:** Dashboards, workbooks, Grafana display aggregated data

---

## 🛠️ Planned Features

### 1. Azure Monitor Helpers (6 helpers)

#### `monitor:metrics`
Configure metric collection for VMs and VMSS.

**Parameters:**
- `targetResourceId` - Resource to monitor
- `metricNamespace` - Namespace (e.g., `Microsoft.Compute/virtualMachines`)
- `metrics` - Array of metric names to collect
- `aggregation` - Aggregation type (Average, Min, Max, Total, Count)
- `frequency` - Collection frequency (PT1M, PT5M, PT15M, PT1H)

**Example:**
```handlebars
{{monitor:metrics
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  metricNamespace="Microsoft.Compute/virtualMachineScaleSets"
  metrics='["Percentage CPU","Available Memory Bytes","Network In Total","Network Out Total"]'
  aggregation="Average"
  frequency="PT1M"
}}
```

#### `monitor:diagnosticSettings`
Configure diagnostic settings for log/metric forwarding.

**Parameters:**
- `targetResourceId` - Resource to configure
- `workspaceId` - Log Analytics workspace ID
- `storageAccountId` - Optional storage account for archival
- `eventHubId` - Optional Event Hub for streaming
- `logs` - Array of log categories (e.g., `["Administrative","Security"]`)
- `metrics` - Array of metric categories (e.g., `["AllMetrics"]`)
- `retentionDays` - Retention period (0-365 days, 0 = indefinite)

**Example:**
```handlebars
{{monitor:diagnosticSettings
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
  workspaceId="[parameters('logAnalyticsWorkspaceId')]"
  logs='["Administrative","Security","ServiceHealth"]'
  metrics='["AllMetrics"]'
  retentionDays=30
}}
```

#### `monitor:logAnalyticsWorkspace`
Create Log Analytics workspace for centralized logging.

**Parameters:**
- `name` - Workspace name
- `location` - Azure region
- `sku` - Pricing tier (Free, PerGB2018, PerNode)
- `retentionInDays` - Data retention (30-730 days)
- `dailyQuotaGb` - Daily ingestion limit
- `publicNetworkAccessForIngestion` - Enable/disable public access
- `publicNetworkAccessForQuery` - Enable/disable public query access

**Example:**
```handlebars
{{monitor:logAnalyticsWorkspace
  name="vmss-logs-workspace"
  location="East US"
  sku="PerGB2018"
  retentionInDays=90
  dailyQuotaGb=10
  publicNetworkAccessForIngestion="Enabled"
  publicNetworkAccessForQuery="Enabled"
}}
```

#### `monitor:applicationInsights`
Configure Application Insights for application telemetry.

**Parameters:**
- `name` - Application Insights instance name
- `location` - Azure region
- `applicationType` - Type (web, other)
- `workspaceId` - Log Analytics workspace ID (required for workspace-based)
- `samplingPercentage` - Sampling rate (0-100%)
- `retentionInDays` - Data retention (30-730 days)
- `disableIpMasking` - Enable IP address collection

**Example:**
```handlebars
{{monitor:applicationInsights
  name="web-app-insights"
  location="East US"
  applicationType="web"
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'vmss-logs-workspace')]"
  samplingPercentage=100
  retentionInDays=90
  disableIpMasking=false
}}
```

#### `monitor:dataCollectionRule`
Define data collection rules for Azure Monitor Agent (AMA).

**Parameters:**
- `name` - Data collection rule name
- `location` - Azure region
- `dataSources` - Array of data sources (performanceCounters, windowsEventLogs, syslog)
- `destinations` - Array of destinations (Log Analytics workspaces)
- `dataFlows` - Array of data flows (source → destination mappings)

**Example:**
```handlebars
{{monitor:dataCollectionRule
  name="vm-performance-dcr"
  location="East US"
  dataSources='[{"performanceCounters":[{"counterSpecifiers":["\\Processor(_Total)\\% Processor Time","\\Memory\\Available MBytes"],"samplingFrequencyInSeconds":60}]}]'
  destinations='[{"logAnalytics":[{"workspaceResourceId":"[parameters(\'workspaceId\')]","name":"centralWorkspace"}]}]'
  dataFlows='[{"streams":["Microsoft-Perf"],"destinations":["centralWorkspace"]}]'
}}
```

#### `monitor:customMetric`
Define custom metric for application-specific monitoring.

**Parameters:**
- `name` - Custom metric name
- `namespace` - Custom namespace (e.g., `MyApp/Performance`)
- `displayName` - Human-readable name
- `description` - Metric description
- `unit` - Unit (Count, Bytes, Seconds, Percent, etc.)
- `aggregation` - Aggregation type (Average, Sum, Min, Max)
- `dimensions` - Array of dimension names

**Example:**
```handlebars
{{monitor:customMetric
  name="OrderProcessingTime"
  namespace="ECommerce/Orders"
  displayName="Order Processing Time"
  description="Time to process customer order in milliseconds"
  unit="Milliseconds"
  aggregation="Average"
  dimensions='["Region","PaymentMethod","OrderType"]'
}}
```

---

### 2. Alert Rule Helpers (6 helpers)

#### `alert:metricAlert`
Create metric alert rule with threshold-based evaluation.

**Parameters:**
- `name` - Alert rule name
- `targetResourceId` - Resource to monitor
- `metricName` - Metric to evaluate
- `operator` - Comparison operator (GreaterThan, LessThan, GreaterOrEqual, LessThanOrEqual)
- `threshold` - Threshold value
- `aggregation` - Aggregation type (Average, Min, Max, Total, Count)
- `windowSize` - Evaluation window (PT1M, PT5M, PT15M, PT1H, PT6H, PT12H, PT24H)
- `frequency` - Evaluation frequency (PT1M, PT5M, PT15M, PT30M, PT1H)
- `severity` - Severity level (0-4: Critical, Error, Warning, Informational, Verbose)
- `actionGroupId` - Action group to notify

**Example:**
```handlebars
{{alert:metricAlert
  name="high-cpu-alert"
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  metricName="Percentage CPU"
  operator="GreaterThan"
  threshold=80
  aggregation="Average"
  windowSize="PT5M"
  frequency="PT1M"
  severity=2
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'ops-team')]"
}}
```

#### `alert:dynamicMetricAlert`
Create dynamic metric alert using machine learning baselines.

**Parameters:**
- `name` - Alert rule name
- `targetResourceId` - Resource to monitor
- `metricName` - Metric to evaluate
- `operator` - Comparison operator (GreaterThan, LessThan, GreaterOrLessThan)
- `alertSensitivity` - Sensitivity (Low, Medium, High)
- `numberOfEvaluationPeriods` - Number of periods to evaluate (1-6)
- `minFailingPeriodsToAlert` - Minimum periods failing to trigger alert
- `windowSize` - Evaluation window
- `frequency` - Evaluation frequency
- `severity` - Severity level (0-4)
- `actionGroupId` - Action group to notify

**Example:**
```handlebars
{{alert:dynamicMetricAlert
  name="anomalous-cpu-alert"
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachines', 'web-vm')]"
  metricName="Percentage CPU"
  operator="GreaterThan"
  alertSensitivity="Medium"
  numberOfEvaluationPeriods=4
  minFailingPeriodsToAlert=3
  windowSize="PT5M"
  frequency="PT1M"
  severity=1
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'ops-team')]"
}}
```

#### `alert:logAlert`
Create log alert based on KQL query results.

**Parameters:**
- `name` - Alert rule name
- `workspaceId` - Log Analytics workspace ID
- `query` - KQL query string
- `threshold` - Result count threshold
- `operator` - Comparison operator (GreaterThan, Equal, LessThan)
- `timeAggregation` - Aggregation type (Count, Average, Min, Max, Total)
- `windowSize` - Evaluation window
- `frequency` - Evaluation frequency
- `severity` - Severity level (0-4)
- `actionGroupId` - Action group to notify

**Example:**
```handlebars
{{alert:logAlert
  name="failed-login-attempts"
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'security-logs')]"
  query="SecurityEvent | where EventID == 4625 | summarize count() by Computer, bin(TimeGenerated, 5m)"
  threshold=5
  operator="GreaterThan"
  timeAggregation="Count"
  windowSize="PT5M"
  frequency="PT5M"
  severity=1
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'security-team')]"
}}
```

#### `alert:activityLogAlert`
Create alert for Azure activity log events (resource changes, service health).

**Parameters:**
- `name` - Alert rule name
- `scopes` - Array of resource IDs to monitor
- `category` - Category (Administrative, ServiceHealth, ResourceHealth, Alert, Autoscale, Security)
- `operationName` - Operation to monitor (e.g., `Microsoft.Compute/virtualMachines/delete`)
- `level` - Event level (Critical, Error, Warning, Informational)
- `status` - Event status (Started, Succeeded, Failed)
- `resourceType` - Resource type filter
- `actionGroupId` - Action group to notify

**Example:**
```handlebars
{{alert:activityLogAlert
  name="vm-deletion-alert"
  scopes='["[subscription().id]"]'
  category="Administrative"
  operationName="Microsoft.Compute/virtualMachines/delete"
  level="Informational"
  status="Succeeded"
  resourceType="Microsoft.Compute/virtualMachines"
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'admin-team')]"
}}
```

#### `alert:actionGroup`
Create action group for alert notifications and automations.

**Parameters:**
- `name` - Action group name
- `shortName` - Short name (max 12 characters)
- `emailReceivers` - Array of email addresses
- `smsReceivers` - Array of SMS recipients (phone numbers)
- `webhookReceivers` - Array of webhook URLs
- `azureFunctionReceivers` - Array of Azure Function URLs
- `logicAppReceivers` - Array of Logic App callback URLs
- `automationRunbookReceivers` - Array of Automation runbook configurations

**Example:**
```handlebars
{{alert:actionGroup
  name="ops-team"
  shortName="OpsTeam"
  emailReceivers='[{"name":"On-Call Engineer","emailAddress":"oncall@company.com"}]'
  smsReceivers='[{"name":"On-Call Mobile","countryCode":"1","phoneNumber":"5551234567"}]'
  webhookReceivers='[{"name":"PagerDuty","serviceUri":"https://events.pagerduty.com/integration/abc123/enqueue"}]'
}}
```

#### `alert:smartGroup`
Configure smart group for alert correlation and noise reduction.

**Parameters:**
- `name` - Smart group name
- `groupingConfiguration` - Grouping rules (by resource, alert rule, severity)
- `suppressionDuration` - Suppression window (PT1H, PT6H, PT12H, PT24H)
- `correlationInterval` - Correlation window (PT1M, PT5M, PT15M, PT30M, PT1H)

**Example:**
```handlebars
{{alert:smartGroup
  name="vmss-scaling-alerts"
  groupingConfiguration='{"groupBy":["resourceId","alertRuleName"],"lookBackDuration":"PT1H"}'
  suppressionDuration="PT1H"
  correlationInterval="PT5M"
}}
```

---

### 3. Dashboard Helpers (5 helpers)

#### `dashboard:vmHealth`
Generate VM health dashboard template.

**Parameters:**
- `name` - Dashboard name
- `vmResourceIds` - Array of VM resource IDs
- `refreshInterval` - Auto-refresh interval (PT1M, PT5M, PT15M, PT30M, PT1H)
- `timeRange` - Time range (PT1H, PT6H, PT12H, PT24H, P7D, P30D)

**Widgets:**
- CPU utilization (time series chart)
- Memory utilization (time series chart)
- Disk IOPS (time series chart)
- Network throughput (time series chart)
- VM availability (status indicator)
- Recent alerts (list)

**Example:**
```handlebars
{{dashboard:vmHealth
  name="Production VMs Health"
  vmResourceIds='["[resourceId(\'Microsoft.Compute/virtualMachines\', \'web-vm-01\')]","[resourceId(\'Microsoft.Compute/virtualMachines\', \'web-vm-02\')]"]'
  refreshInterval="PT5M"
  timeRange="PT24H"
}}
```

#### `dashboard:vmssScaling`
Generate VMSS scaling operations dashboard.

**Parameters:**
- `name` - Dashboard name
- `vmssResourceId` - VMSS resource ID
- `refreshInterval` - Auto-refresh interval
- `timeRange` - Time range

**Widgets:**
- Instance count (time series chart)
- Auto-scale actions (event timeline)
- CPU/memory across instances (heatmap)
- Scale-in/scale-out events (counter)
- Per-instance health (status grid)
- Auto-scale rule evaluations (log query)

**Example:**
```handlebars
{{dashboard:vmssScaling
  name="VMSS Scaling Operations"
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  refreshInterval="PT1M"
  timeRange="PT6H"
}}
```

#### `dashboard:multiRegionHealth`
Generate multi-region health map dashboard.

**Parameters:**
- `name` - Dashboard name
- `trafficManagerResourceId` - Traffic Manager or Front Door resource ID
- `regionalVmssResourceIds` - Array of VMSS resource IDs by region
- `refreshInterval` - Auto-refresh interval
- `timeRange` - Time range

**Widgets:**
- Regional health map (geographic view)
- Failover events (timeline)
- Regional traffic distribution (pie chart)
- Endpoint health (status indicators)
- Cross-region latency (line chart)
- Regional request counts (bar chart)

**Example:**
```handlebars
{{dashboard:multiRegionHealth
  name="Global Application Health"
  trafficManagerResourceId="[resourceId('Microsoft.Network/trafficManagerProfiles', 'global-tm')]"
  regionalVmssResourceIds='{"eastus":"[resourceId(\'Microsoft.Compute/virtualMachineScaleSets\', \'east-vmss\')]","westeurope":"[resourceId(\'Microsoft.Compute/virtualMachineScaleSets\', \'west-vmss\')]"}'
  refreshInterval="PT5M"
  timeRange="PT24H"
}}
```

#### `dashboard:loadBalancerPerformance`
Generate load balancer performance dashboard.

**Parameters:**
- `name` - Dashboard name
- `loadBalancerResourceId` - Load balancer resource ID
- `refreshInterval` - Auto-refresh interval
- `timeRange` - Time range

**Widgets:**
- Throughput (bytes/sec time series)
- Packet rate (packets/sec time series)
- Connection count (active connections time series)
- Backend health (status indicators)
- SNAT port utilization (gauge)
- Health probe status (status grid)

**Example:**
```handlebars
{{dashboard:loadBalancerPerformance
  name="Load Balancer Performance"
  loadBalancerResourceId="[resourceId('Microsoft.Network/loadBalancers', 'web-lb')]"
  refreshInterval="PT1M"
  timeRange="PT1H"
}}
```

#### `dashboard:costAnalysis`
Generate cost analysis dashboard.

**Parameters:**
- `name` - Dashboard name
- `scope` - Scope (subscription, resource group)
- `refreshInterval` - Auto-refresh interval
- `timeRange` - Time range

**Widgets:**
- Total cost (cumulative time series)
- Cost by resource type (pie chart)
- Cost by region (bar chart)
- Daily cost trend (line chart)
- Budget vs actual (gauge)
- Cost anomalies (alerts list)

**Example:**
```handlebars
{{dashboard:costAnalysis
  name="VM Infrastructure Costs"
  scope="[resourceGroup().id]"
  refreshInterval="PT1H"
  timeRange="P30D"
}}
```

---

### 4. Workbook Helpers (3 helpers)

#### `workbook:vmDiagnostics`
Create interactive VM diagnostics workbook.

**Parameters:**
- `name` - Workbook name
- `vmResourceIds` - Array of VM resource IDs
- `workspaceId` - Log Analytics workspace ID

**Sections:**
- VM selection dropdown
- Performance metrics (CPU, memory, disk, network)
- Process monitoring
- Log query builder
- Alert history
- Troubleshooting guide

**Example:**
```handlebars
{{workbook:vmDiagnostics
  name="VM Diagnostics Workbook"
  vmResourceIds='["[resourceId(\'Microsoft.Compute/virtualMachines\', \'web-vm\')]"]'
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'vmss-logs-workspace')]"
}}
```

#### `workbook:securityPosture`
Create security posture workbook.

**Parameters:**
- `name` - Workbook name
- `scope` - Scope (subscription, resource group)
- `workspaceId` - Log Analytics workspace ID

**Sections:**
- Security score
- Vulnerability assessment
- Failed login attempts
- Network security group violations
- Compliance status
- Security recommendations

**Example:**
```handlebars
{{workbook:securityPosture
  name="Security Posture Workbook"
  scope="[resourceGroup().id]"
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'security-logs')]"
}}
```

#### `workbook:performanceAnalysis`
Create performance analysis workbook with ML-powered insights.

**Parameters:**
- `name` - Workbook name
- `vmssResourceId` - VMSS resource ID
- `workspaceId` - Log Analytics workspace ID
- `applicationInsightsId` - Application Insights ID

**Sections:**
- Performance overview
- Anomaly detection
- Resource correlation analysis
- Capacity planning recommendations
- Performance tuning suggestions
- Comparative analysis (baseline vs current)

**Example:**
```handlebars
{{workbook:performanceAnalysis
  name="Performance Analysis Workbook"
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  workspaceId="[resourceId('Microsoft.OperationalInsights/workspaces', 'vmss-logs-workspace')]"
  applicationInsightsId="[resourceId('Microsoft.Insights/components', 'web-app-insights')]"
}}
```

---

## 📊 Integration with v1.6.0 Features

### VMSS Monitoring

**Scenario:** Monitor 100-instance VMSS with auto-scaling

```handlebars
{{!-- VMSS from v1.6.0 --}}
{{scale:vmssUniform
  name="web-vmss"
  vmSize="Standard_B2s"
  instanceCount=10
}}

{{!-- Metric collection --}}
{{monitor:metrics
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  metrics='["Percentage CPU","Available Memory Bytes","Data Disk IOPS","Network In Total"]'
  frequency="PT1M"
}}

{{!-- High CPU alert --}}
{{alert:metricAlert
  name="vmss-high-cpu"
  targetResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
  metricName="Percentage CPU"
  threshold=80
  severity=2
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'ops-team')]"
}}

{{!-- Scaling dashboard --}}
{{dashboard:vmssScaling
  name="Web VMSS Scaling"
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', 'web-vmss')]"
}}
```

### Auto-Scaling Monitoring

**Scenario:** Monitor auto-scale actions and optimize thresholds

```handlebars
{{!-- Auto-scaling from v1.6.0 --}}
{{scale:autoScaleMetric
  vmssName="web-vmss"
  metricName="Percentage CPU"
  threshold=75
  scaleAction="Increase"
}}

{{!-- Auto-scale activity log alert --}}
{{alert:activityLogAlert
  name="autoscale-action-alert"
  category="Autoscale"
  operationName="Microsoft.Insights/AutoscaleSettings/ScaleUpAction"
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'ops-team')]"
}}

{{!-- Log query for auto-scale analysis --}}
{{alert:logAlert
  name="excessive-scaling"
  query="AzureActivity | where Category == 'Autoscale' | summarize count() by bin(TimeGenerated, 1h) | where count_ > 10"
  threshold=1
  severity=2
}}
```

### Multi-Region Monitoring

**Scenario:** Monitor Traffic Manager failover and regional health

```handlebars
{{!-- Traffic Manager from v1.6.0 --}}
{{scale:multiRegionTrafficManager
  name="global-tm"
  routingMethod="Performance"
  primaryRegion="East US"
  secondaryRegion="West Europe"
}}

{{!-- Endpoint health alert --}}
{{alert:metricAlert
  name="tm-endpoint-down"
  targetResourceId="[resourceId('Microsoft.Network/trafficManagerProfiles', 'global-tm')]"
  metricName="Endpoint Status by Endpoint"
  threshold=1
  operator="LessThan"
  severity=0
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'critical-alerts')]"
}}

{{!-- Multi-region health dashboard --}}
{{dashboard:multiRegionHealth
  name="Global Health Map"
  trafficManagerResourceId="[resourceId('Microsoft.Network/trafficManagerProfiles', 'global-tm')]"
}}
```

### Load Balancer Monitoring

**Scenario:** Monitor Application Gateway performance and backend health

```handlebars
{{!-- Application Gateway from v1.6.0 --}}
{{scale:loadBalancingAppGateway
  name="app-gateway"
  tier="WAF_v2"
  minCapacity=2
  maxCapacity=10
}}

{{!-- Backend health alert --}}
{{alert:metricAlert
  name="appgw-backend-unhealthy"
  targetResourceId="[resourceId('Microsoft.Network/applicationGateways', 'app-gateway')]"
  metricName="UnhealthyHostCount"
  threshold=1
  operator="GreaterThan"
  severity=1
  actionGroupId="[resourceId('Microsoft.Insights/actionGroups', 'ops-team')]"
}}

{{!-- Performance dashboard --}}
{{dashboard:loadBalancerPerformance
  name="App Gateway Performance"
  loadBalancerResourceId="[resourceId('Microsoft.Network/applicationGateways', 'app-gateway')]"
}}
```

---

## 🧪 Testing Strategy

### Unit Tests (Target: 40 tests)

**Test Coverage:**
- Monitor module (15 tests)
  - `monitor:metrics` - 3 tests (basic, custom metrics, multiple targets)
  - `monitor:diagnosticSettings` - 3 tests (logs only, metrics only, both)
  - `monitor:logAnalyticsWorkspace` - 2 tests (basic, advanced config)
  - `monitor:applicationInsights` - 3 tests (workspace-based, classic, sampling)
  - `monitor:dataCollectionRule` - 2 tests (performance counters, event logs)
  - `monitor:customMetric` - 2 tests (simple, with dimensions)

- Alert module (15 tests)
  - `alert:metricAlert` - 3 tests (threshold, multiple conditions, severity levels)
  - `alert:dynamicMetricAlert` - 3 tests (sensitivity levels, operator types)
  - `alert:logAlert` - 3 tests (KQL queries, thresholds, aggregations)
  - `alert:activityLogAlert` - 2 tests (administrative, service health)
  - `alert:actionGroup` - 2 tests (email/SMS, webhooks)
  - `alert:smartGroup` - 2 tests (grouping, suppression)

- Dashboard module (10 tests)
  - `dashboard:vmHealth` - 2 tests (single VM, multiple VMs)
  - `dashboard:vmssScaling` - 2 tests (uniform, flexible)
  - `dashboard:multiRegionHealth` - 2 tests (Traffic Manager, Front Door)
  - `dashboard:loadBalancerPerformance` - 2 tests (Standard LB, App Gateway)
  - `dashboard:costAnalysis` - 2 tests (subscription, resource group)

### Integration Tests (Target: 8 tests)

1. **Complete Monitoring Stack** - Deploy VM with full monitoring (metrics, logs, alerts, dashboard)
2. **VMSS with Auto-Scaling Monitoring** - VMSS + auto-scaling + metric alerts + dashboard
3. **Multi-Region with Health Monitoring** - Traffic Manager + regional VMSS + endpoint alerts + health map
4. **Load Balancer with Performance Monitoring** - App Gateway + backend VMSS + performance dashboard
5. **Log Analytics Integration** - VMs → diagnostic settings → Log Analytics → log alerts
6. **Application Insights Integration** - Web app → App Insights → custom metrics → alerts
7. **Cost Monitoring Workflow** - Resource group → cost analysis dashboard → budget alerts
8. **Security Posture Workbook** - VMs → security logs → workbook → security alerts

### CLI Command Tests (Target: 8 commands)

**New Commands:**
1. `azmp monitor metrics <vm-name>` - Add metric collection
2. `azmp monitor diagnostics <vm-name>` - Configure diagnostic settings
3. `azmp monitor workspace <name>` - Create Log Analytics workspace
4. `azmp alert metric <name> --resource <id> --metric <metric> --threshold <value>` - Create metric alert
5. `azmp alert log <name> --query <kql> --threshold <value>` - Create log alert
6. `azmp alert action-group <name> --email <email> --sms <phone>` - Create action group
7. `azmp dashboard vm-health <vm-name>` - Generate VM health dashboard
8. `azmp dashboard vmss-scaling <vmss-name>` - Generate VMSS scaling dashboard

---

## 📈 Success Metrics

### Quantitative Targets

- **20 New Helpers** (6 monitor + 6 alert + 5 dashboard + 3 workbook)
- **48 Unit Tests** (40 new + 8 integration)
- **8 CLI Commands** for monitoring operations
- **327 Total Tests** (279 current + 48 new)
- **197 Total Helpers** (177 current + 20 new)
- **52 Total CLI Commands** (44 current + 8 new)

### Qualitative Targets

- ✅ Complete visibility into VM/VMSS health and performance
- ✅ Proactive alerting for incidents and anomalies
- ✅ Centralized logging with Log Analytics
- ✅ Application performance monitoring with App Insights
- ✅ Interactive dashboards for real-time insights
- ✅ Cost visibility and optimization recommendations
- ✅ Security posture monitoring
- ✅ Integration with v1.6.0 scaling features

---

## 📅 Timeline Estimate

### Day 7 Development Schedule

**Phase 1: Foundation (3-4 hours)**
- Monitor module (6 helpers)
- Unit tests for monitor module (15 tests)

**Phase 2: Alerting (3-4 hours)**
- Alert module (6 helpers)
- Unit tests for alert module (15 tests)

**Phase 3: Visualization (3-4 hours)**
- Dashboard module (5 helpers)
- Workbook module (3 helpers)
- Unit tests for dashboard/workbook modules (10 tests)

**Phase 4: Integration (2-3 hours)**
- Integration tests (8 tests)
- v1.6.0 feature integration testing
- End-to-end workflow validation

**Phase 5: CLI & Documentation (2-3 hours)**
- CLI commands (8 commands)
- CLI tests
- Documentation (MONITORING.md, examples, README updates)

**Phase 6: Validation & Release (1-2 hours)**
- Full test suite execution (327 tests)
- Build verification
- CHANGELOG.md for v1.7.0
- Release notes
- npm publish

**Total Estimate:** 14-20 hours (1.5-2.5 days)

---

## 🔗 Dependencies

### Azure Resources Required

- Log Analytics Workspace (existing or new)
- Application Insights (optional)
- Storage Account (optional, for diagnostic logs archival)
- Event Hub (optional, for log streaming)

### External Integrations

- PagerDuty (optional, via webhooks)
- Slack (optional, via webhooks)
- Microsoft Teams (optional, via Office 365 connector)
- ServiceNow (optional, via webhooks)
- Grafana (optional, data source integration)

### v1.6.0 Integration Points

- VMSS monitoring (uniform/flexible modes)
- Auto-scaling activity monitoring
- Multi-region health monitoring (Traffic Manager, Front Door)
- Load balancer performance monitoring (Standard LB, App Gateway)

---

## 🎯 Priority Features

### Must-Have (P0)

1. ✅ Azure Monitor metrics collection (`monitor:metrics`)
2. ✅ Log Analytics workspace (`monitor:logAnalyticsWorkspace`)
3. ✅ Metric alerts (`alert:metricAlert`)
4. ✅ Action groups (`alert:actionGroup`)
5. ✅ VM health dashboard (`dashboard:vmHealth`)
6. ✅ VMSS scaling dashboard (`dashboard:vmssScaling`)

### Should-Have (P1)

7. ✅ Diagnostic settings (`monitor:diagnosticSettings`)
8. ✅ Application Insights (`monitor:applicationInsights`)
9. ✅ Log alerts (`alert:logAlert`)
10. ✅ Dynamic metric alerts (`alert:dynamicMetricAlert`)
11. ✅ Multi-region health dashboard (`dashboard:multiRegionHealth`)
12. ✅ Load balancer performance dashboard (`dashboard:loadBalancerPerformance`)

### Nice-to-Have (P2)

13. Custom metrics (`monitor:customMetric`)
14. Data collection rules (`monitor:dataCollectionRule`)
15. Activity log alerts (`alert:activityLogAlert`)
16. Smart groups (`alert:smartGroup`)
17. Cost analysis dashboard (`dashboard:costAnalysis`)
18. Workbooks (VM diagnostics, security posture, performance analysis)

---

## 📚 Documentation Plan

### New Documentation Files

1. **MONITORING.md** (1,000+ lines)
   - Monitoring architecture overview
   - Helper reference with examples
   - Azure Monitor integration guide
   - Application Insights setup
   - Alert rule configuration
   - Dashboard templates
   - Workbook examples
   - KQL query library
   - Best practices
   - Troubleshooting guide

2. **DAY7_SUMMARY.md** (400+ lines)
   - Day 7 achievements
   - Technical implementation details
   - Code quality metrics
   - Lessons learned
   - Performance characteristics

3. **KQL_QUERY_LIBRARY.md** (500+ lines)
   - Common KQL queries
   - VM performance queries
   - VMSS scaling queries
   - Multi-region health queries
   - Load balancer queries
   - Security queries
   - Cost queries

### Updated Documentation

- **README.md** - Add "Monitoring & Alerting" section with examples
- **CHANGELOG.md** - v1.7.0 release notes
- **CLI_REFERENCE.md** - Add 8 new monitoring commands

---

## 🚨 Risks & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| KQL query complexity | High | Medium | Provide query templates, validation helpers |
| Dashboard JSON size | Medium | Low | Use reusable components, template fragments |
| Alert rule conflicts | Medium | Medium | Namespace alerts, use resource tagging |
| Log Analytics cost | High | Medium | Set daily quotas, retention policies, sampling |

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| v1.6.0 feature gaps | High | Low | Comprehensive integration tests |
| Metric namespace changes | Medium | Low | Use stable metric namespaces |
| Alert flooding | Medium | Medium | Smart groups, suppression, rate limiting |

---

## 🔮 Future Enhancements (Post-v1.7.0)

### v1.8.0 Candidates

- **Advanced Analytics** - Anomaly detection, ML-powered insights
- **Predictive Alerts** - Proactive alerting based on trends
- **Incident Management** - Integration with ITSM tools
- **SRE Dashboards** - SLI/SLO tracking, error budgets
- **Cost Optimization** - Rightsizing recommendations, reserved instance analysis
- **Compliance Monitoring** - Policy compliance dashboards, audit logs

### v1.9.0 Candidates

- **AIOps Integration** - Automated remediation, root cause analysis
- **Custom Workbook Library** - 20+ industry-specific workbooks
- **Grafana Plugins** - Native Grafana dashboard templates
- **Mobile Dashboards** - Responsive dashboard designs
- **Voice Alerts** - Phone call notifications for critical alerts

---

## ✅ Success Criteria

Day 7 is considered successful when:

1. ✅ All 20 monitoring/alerting helpers implemented and tested
2. ✅ 48 new tests written (40 unit + 8 integration)
3. ✅ 327 total tests passing (100% pass rate)
4. ✅ 8 CLI commands functional
5. ✅ MONITORING.md documentation complete (1,000+ lines)
6. ✅ Integration with v1.6.0 features validated
7. ✅ npm build passes
8. ✅ No breaking changes from v1.6.0
9. ✅ Performance benchmarks met (query <1s, dashboard load <3s)
10. ✅ Security review passed (no secrets in logs, RBAC enforced)

---

## 🎬 Next Steps

1. **Finalize v1.6.0 Release** ✅
   - ✅ Integration tests complete (279 tests passing)
   - ✅ CHANGELOG.md complete
   - ✅ Release notes complete (RELEASE_NOTES_v1.6.0.md)
   - ⏳ Tag v1.6.0 in git
   - ⏳ Publish to npm

2. **Begin Day 7 Implementation**
   - Create `/src/modules/monitoring/` directory
   - Implement monitor helpers (6 helpers)
   - Write unit tests (15 tests)
   - Implement alert helpers (6 helpers)
   - Write unit tests (15 tests)

3. **Iterate Through Phases**
   - Follow timeline schedule
   - Run tests after each module
   - Update documentation incrementally
   - Validate integration with v1.6.0 features

4. **Final Validation & Release**
   - Execute all 327 tests
   - Build and verify package
   - Create v1.7.0 CHANGELOG
   - Publish to npm

---

## 📞 Questions & Feedback

**Decision Points:**
1. Should we support classic Application Insights or workspace-based only? (Recommendation: workspace-based only)
2. Include Grafana dashboard templates or focus on Azure native? (Recommendation: Azure native first, Grafana in v1.8.0)
3. Support external ITSM integrations (ServiceNow, Jira) in v1.7.0? (Recommendation: defer to v1.8.0)
4. Include cost monitoring in v1.7.0 or separate cost optimization module? (Recommendation: basic cost dashboard in v1.7.0)

**Feedback Requested:**
- Priority order for P2 features
- Preferred dashboard visualization style
- KQL query complexity tolerance
- CLI command naming conventions for monitoring

---

**Status:** Ready for implementation pending v1.6.0 npm publish

**Last Updated:** October 25, 2025
