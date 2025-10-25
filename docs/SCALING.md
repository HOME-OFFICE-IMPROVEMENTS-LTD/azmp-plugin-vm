# Enterprise Scaling & High Availability Guide

**Version:** 1.6.0  
**Module:** Day 6 - Scaling & High Availability

This guide covers the comprehensive scaling capabilities introduced in v1.6.0, including Virtual Machine Scale Sets (VMSS), auto-scaling, multi-region deployments, and advanced load balancing.

## Table of Contents

- [Overview](#overview)
- [VMSS (Virtual Machine Scale Sets)](#vmss-virtual-machine-scale-sets)
- [Auto-Scaling](#auto-scaling)
- [Multi-Region Deployments](#multi-region-deployments)
- [Load Balancing](#load-balancing)
- [Complete Integration Examples](#complete-integration-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The azmp-plugin-vm v1.6.0 introduces enterprise-grade scaling capabilities through 14 new Handlebars helpers organized under the `scale:` namespace:

| Category | Helpers | Purpose |
|----------|---------|---------|
| **VMSS** | 1 helper | Virtual Machine Scale Sets with Flexible/Uniform orchestration |
| **Auto-scaling** | 5 helpers | Metric-based and schedule-based scaling policies |
| **Multi-Region** | 4 helpers | Traffic Manager integration for global load balancing |
| **Load Balancing** | 4 helpers | Standard Load Balancer and Application Gateway v2 |

### Key Features

✅ **VMSS Orchestration:** Uniform and Flexible modes with rolling upgrades  
✅ **Auto-Scaling:** CPU-based, memory-based, and custom metric scaling  
✅ **Multi-Region:** Active-active and active-passive topologies  
✅ **Load Balancing:** Layer 4 (Standard LB) and Layer 7 (App Gateway)  
✅ **Health Monitoring:** Integrated health probes and automatic failover  
✅ **Security:** Managed Identity, NSG integration, TLS termination  

---

## VMSS (Virtual Machine Scale Sets)

### `scale:vmss.definition`

Creates a complete VMSS ARM resource with orchestration mode, upgrade policies, and health monitoring.

#### Syntax

```handlebars
{{scale:vmss.definition
  name="<vmss-name>"
  orchestrationMode="<Flexible|Uniform>"
  upgradeMode="<Automatic|Rolling|Manual>"
  instanceCount=<number>
  vmSize="<vm-size>"
  osType="<Linux|Windows>"
  imagePublisher="<publisher>"
  imageOffer="<offer>"
  imageSku="<sku>"
  adminUsername="<username>"
  authenticationType="<password|sshPublicKey>"
  enableAutoOsUpgrade=<true|false>
  healthProbeId="<probe-resource-id>"
  maxBatchInstancePercent=<number>
  maxUnhealthyInstancePercent=<number>
  maxUnhealthyUpgradedInstancePercent=<number>
  pauseTimeBetweenBatches="<ISO-8601-duration>"}}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | VMSS name |
| `orchestrationMode` | string | No | `"Flexible"` | `"Uniform"` or `"Flexible"` |
| `upgradeMode` | string | No | `"Rolling"` | `"Automatic"`, `"Rolling"`, or `"Manual"` |
| `instanceCount` | number | No | `2` | Initial instance count |
| `vmSize` | string | No | `"Standard_D2s_v3"` | Azure VM size |
| `osType` | string | No | `"Linux"` | `"Linux"` or `"Windows"` |
| `imagePublisher` | string | No | `"Canonical"` | OS image publisher |
| `imageOffer` | string | No | `"0001-com-ubuntu-server-jammy"` | OS image offer |
| `imageSku` | string | No | `"22_04-lts-gen2"` | OS image SKU |
| `adminUsername` | string | No | `"azureuser"` | Admin username |
| `authenticationType` | string | No | `"password"` | `"password"` or `"sshPublicKey"` |
| `enableAutoOsUpgrade` | boolean | No | `true` | Automatic OS upgrades |
| `healthProbeId` | string | No | - | Health probe resource ID |
| `maxBatchInstancePercent` | number | No | `20` | Max % of instances upgraded per batch |
| `maxUnhealthyInstancePercent` | number | No | `20` | Max % of unhealthy instances |
| `maxUnhealthyUpgradedInstancePercent` | number | No | `20` | Max % of unhealthy upgraded instances |
| `pauseTimeBetweenBatches` | string | No | `"PT5S"` | Pause duration (ISO 8601) |

#### Orchestration Modes

**Flexible Mode:**
- Provides VM-like control with scale set benefits
- Supports mixing standalone VMs with scale set VMs
- Best for: Migrating from VMs, mixed workloads, advanced networking

**Uniform Mode:**
- All instances are identical
- Classic scale set behavior
- Best for: Stateless workloads, maximum scalability

#### Upgrade Policies

**Automatic:**
- Azure automatically upgrades instances
- Best for: Dev/test environments

**Rolling:**
- Gradual rollout with health checks
- Configurable batch size and pause duration
- Best for: Production workloads requiring zero downtime

**Manual:**
- Full control over upgrade timing
- Best for: Critical workloads, manual testing required

#### Example: Flexible VMSS with Rolling Upgrades

```handlebars
{
  "type": "Microsoft.Compute/virtualMachineScaleSets",
  "apiVersion": "2023-09-01",
  "name": "[parameters('vmssName')]",
  "location": "[parameters('location')]",
  "sku": {
    "name": "[parameters('vmSize')]",
    "tier": "Standard",
    "capacity": "[parameters('instanceCount')]"
  },
  "properties": {{scale:vmss.definition
    name="[parameters('vmssName')]"
    orchestrationMode="Flexible"
    upgradeMode="Rolling"
    instanceCount="[parameters('instanceCount')]"
    vmSize="[parameters('vmSize')]"
    osType="Linux"
    imagePublisher="Canonical"
    imageOffer="0001-com-ubuntu-server-jammy"
    imageSku="22_04-lts-gen2"
    adminUsername="[parameters('adminUsername')]"
    authenticationType="password"
    enableAutoOsUpgrade=true
    healthProbeId="[resourceId('Microsoft.Network/loadBalancers/probes', parameters('lbName'), 'httpProbe')]"
    maxBatchInstancePercent=20
    maxUnhealthyInstancePercent=20
    maxUnhealthyUpgradedInstancePercent=20
    pauseTimeBetweenBatches="PT5S"}}
}
```

---

## Auto-Scaling

Auto-scaling automatically adjusts instance count based on metrics or schedules.

### 1. `scale:autoscale.policy`

Creates a comprehensive auto-scale policy with custom rules.

#### Syntax

```handlebars
{{scale:autoscale.policy
  vmssResourceId="<vmss-resource-id>"
  minCapacity=<number>
  maxCapacity=<number>
  defaultCapacity=<number>
  rules=(array <rule1> <rule2> ...)}}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vmssResourceId` | string | Yes | VMSS resource ID |
| `minCapacity` | number | Yes | Minimum instance count |
| `maxCapacity` | number | Yes | Maximum instance count |
| `defaultCapacity` | number | Yes | Default instance count |
| `rules` | array | Yes | Array of scale rules |

### 2. `scale:autoscale.metricRule`

Creates a metric-based scaling rule.

#### Syntax

```handlebars
{{scale:autoscale.metricRule
  metricName="<metric-name>"
  operator="<operator>"
  threshold=<number>
  scaleAction="<Increase|Decrease>"
  cooldown="<ISO-8601-duration>"}}
```

#### Common Metrics

| Metric | Description | Typical Threshold |
|--------|-------------|-------------------|
| `Percentage CPU` | CPU utilization percentage | 70-80% (scale out) |
| `Available Memory Bytes` | Available memory | < 1GB (scale out) |
| `Network In Total` | Network ingress | > 100MB/s (scale out) |
| `Network Out Total` | Network egress | > 100MB/s (scale out) |
| `Disk Read Bytes` | Disk read throughput | > 50MB/s (scale out) |
| `Disk Write Bytes` | Disk write throughput | > 50MB/s (scale out) |

#### Example: CPU-Based Scaling Rules

```handlebars
{{scale:autoscale.policy
  vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
  minCapacity=2
  maxCapacity=10
  defaultCapacity=3
  rules=(array
    (scale:autoscale.metricRule
      metricName="Percentage CPU"
      operator="GreaterThan"
      threshold=75
      scaleAction="Increase"
      cooldown="PT5M")
    (scale:autoscale.metricRule
      metricName="Percentage CPU"
      operator="LessThan"
      threshold=25
      scaleAction="Decrease"
      cooldown="PT5M"))}}
```

### 3. `scale:autoscale.cpu`

Pre-built CPU-based scaling policy (recommended for most workloads).

#### Syntax

```handlebars
{{scale:autoscale.cpu
  vmssResourceId="<vmss-resource-id>"
  minCapacity=<number>
  maxCapacity=<number>
  defaultCapacity=<number>
  scaleOutThreshold=<number>
  scaleInThreshold=<number>}}
```

#### Example: Simple CPU Auto-Scaling

```handlebars
{
  "type": "Microsoft.Insights/autoscalesettings",
  "apiVersion": "2022-10-01",
  "name": "[concat(parameters('vmssName'), '-autoscale')]",
  "location": "[parameters('location')]",
  "dependsOn": [
    "[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
  ],
  "properties": {{scale:autoscale.cpu
    vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
    minCapacity=2
    maxCapacity=10
    defaultCapacity=3
    scaleOutThreshold=75
    scaleInThreshold=25}}
}
```

### 4. `scale:autoscale.scheduleProfile`

Creates schedule-based scaling profiles.

#### Syntax

```handlebars
{{scale:autoscale.scheduleProfile
  startTime="<ISO-8601-datetime>"
  endTime="<ISO-8601-datetime>"
  recurrence=(object
    frequency="<Week|Day|Month>"
    schedule=(object days=(array "<day1>" "<day2>" ...)))
  minCapacity=<number>
  maxCapacity=<number>
  defaultCapacity=<number>}}
```

#### Example: Business Hours Scaling

```handlebars
{{scale:autoscale.scheduleProfile
  startTime="2024-01-01T08:00:00"
  endTime="2024-12-31T18:00:00"
  recurrence=(object
    frequency="Week"
    schedule=(object days=(array "Monday" "Tuesday" "Wednesday" "Thursday" "Friday")))
  minCapacity=5
  maxCapacity=20
  defaultCapacity=10}}
```

### 5. `scale:autoscale.businessHours`

Pre-built business hours schedule (Monday-Friday, 8am-6pm).

#### Syntax

```handlebars
{{scale:autoscale.businessHours
  minCapacity=<number>
  maxCapacity=<number>
  defaultCapacity=<number>
  timezone="<timezone>"}}
```

#### Common Timezones

- `"Pacific Standard Time"` (US West Coast)
- `"Eastern Standard Time"` (US East Coast)
- `"UTC"` (Coordinated Universal Time)
- `"GMT Standard Time"` (London)
- `"Central Europe Standard Time"` (Berlin, Paris)
- `"Tokyo Standard Time"` (Japan)

---

## Multi-Region Deployments

Deploy globally distributed applications with Traffic Manager.

### 1. `scale:multiregion.profile`

Creates a Traffic Manager profile for global load balancing.

#### Syntax

```handlebars
{{scale:multiregion.profile
  profileName="<profile-name>"
  dnsName="<dns-prefix>"
  routingMethod="<routing-method>"
  monitorProtocol="<HTTP|HTTPS>"
  monitorPort=<number>
  monitorPath="<path>"}}
```

#### Routing Methods

| Method | Use Case | How It Works |
|--------|----------|--------------|
| **Performance** | Global applications | Routes to closest endpoint (latency-based) |
| **Priority** | Active-passive failover | Routes to highest priority healthy endpoint |
| **Weighted** | A/B testing, gradual rollout | Distributes traffic by weight percentage |
| **Geographic** | Data residency, localization | Routes based on user geographic location |
| **MultiValue** | Simple DNS-based LB | Returns multiple healthy endpoints |
| **Subnet** | Hybrid scenarios | Routes based on client IP subnet |

#### Example: Performance-Based Routing

```handlebars
{
  "type": "Microsoft.Network/trafficManagerProfiles",
  "apiVersion": "2022-04-01",
  "name": "[parameters('trafficManagerName')]",
  "location": "global",
  "properties": {{scale:multiregion.profile
    profileName="[parameters('trafficManagerName')]"
    dnsName="[parameters('dnsName')]"
    routingMethod="Performance"
    monitorProtocol="HTTPS"
    monitorPort=443
    monitorPath="/health"}}
}
```

### 2. `scale:multiregion.endpoint`

Creates a Traffic Manager endpoint configuration.

#### Syntax

```handlebars
{{scale:multiregion.endpoint
  endpointName="<endpoint-name>"
  type="<azureEndpoints|externalEndpoints|nestedEndpoints>"
  targetResourceId="<resource-id>"
  priority=<number>
  weight=<number>
  endpointLocation="<region>"}}
```

#### Endpoint Types

- **azureEndpoints:** Azure resources (Public IPs, App Services, etc.)
- **externalEndpoints:** Non-Azure endpoints (on-premises, other clouds)
- **nestedEndpoints:** Other Traffic Manager profiles (hierarchical routing)

#### Example: Multiple Region Endpoints

```handlebars
{
  "type": "endpoints",
  "apiVersion": "2022-04-01",
  "name": "eastus-endpoint",
  "dependsOn": [
    "[resourceId('Microsoft.Network/trafficManagerProfiles', parameters('trafficManagerName'))]"
  ],
  "properties": {{scale:multiregion.endpoint
    endpointName="eastus-endpoint"
    type="azureEndpoints"
    targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'eastus-pip')]"
    priority=1
    weight=100
    endpointLocation="East US"}}
}
```

### 3. `scale:multiregion.deploymentPlan`

Creates a multi-region deployment plan document.

#### Syntax

```handlebars
{{scale:multiregion.deploymentPlan
  primaryRegion="<region>"
  secondaryRegions=(array "<region1>" "<region2>" ...)
  replicationStrategy="<active-active|active-passive|multi-master>"
  dataSync="<sync|async>"}}
```

#### Replication Strategies

**Active-Active:**
- All regions handle traffic simultaneously
- Best for: Global applications with high availability requirements
- Complexity: High (data synchronization challenges)

**Active-Passive:**
- Primary region handles traffic, secondary is standby
- Best for: Disaster recovery, cost optimization
- Complexity: Medium (simpler than active-active)

**Multi-Master:**
- All regions accept writes
- Best for: Collaborative applications, distributed data
- Complexity: Very High (conflict resolution required)

### 4. `scale:multiregion.failover`

Creates a failover plan document.

#### Syntax

```handlebars
{{scale:multiregion.failover
  primaryRegion="<region>"
  failoverRegion="<region>"
  rto=<minutes>
  rpo=<minutes>
  automaticFailover=<true|false>}}
```

#### RTO/RPO Guidelines

| Application Type | RTO Target | RPO Target | Recommendation |
|-----------------|------------|------------|----------------|
| **Mission Critical** | < 5 min | < 1 min | Active-active, sync replication |
| **Business Critical** | < 15 min | < 5 min | Active-passive, async replication |
| **Standard** | < 60 min | < 15 min | Manual failover, backup-based |
| **Non-Critical** | < 4 hours | < 1 hour | Snapshot-based recovery |

---

## Load Balancing

### Standard Load Balancer

Layer 4 (TCP/UDP) load balancing for high-throughput scenarios.

#### `scale:lb.definition`

Creates a complete Standard Load Balancer configuration.

#### Syntax

```handlebars
{{scale:lb.definition
  name="<lb-name>"
  sku="<Basic|Standard>"
  tier="<Regional|Global>"
  frontendIpName="<frontend-name>"
  publicIpResourceId="<public-ip-id>"
  backendPoolName="<backend-pool-name>"
  probeName="<probe-name>"
  probeProtocol="<Http|Https|Tcp>"
  probePort=<number>
  probePath="<path>"
  ruleName="<rule-name>"
  ruleProtocol="<Tcp|Udp|All>"
  ruleFrontendPort=<number>
  ruleBackendPort=<number>
  enableFloatingIp=<true|false>
  idleTimeoutInMinutes=<number>}}
```

#### SKU Comparison

| Feature | Basic | Standard |
|---------|-------|----------|
| **Availability Zones** | ❌ | ✅ |
| **SLA** | None | 99.99% |
| **VMSS Support** | Limited | Full |
| **Health Probes** | Basic | Advanced |
| **Security** | No NSG | NSG required |
| **Cost** | Free | Billed |

#### Example: Standard Load Balancer

```handlebars
{
  "type": "Microsoft.Network/loadBalancers",
  "apiVersion": "2023-05-01",
  "name": "[parameters('lbName')]",
  "location": "[parameters('location')]",
  "sku": {
    "name": "Standard",
    "tier": "Regional"
  },
  "properties": {{scale:lb.definition
    name="[parameters('lbName')]"
    sku="Standard"
    tier="Regional"
    frontendIpName="webFrontend"
    publicIpResourceId="[resourceId('Microsoft.Network/publicIPAddresses', parameters('publicIpName'))]"
    backendPoolName="webBackend"
    probeName="httpProbe"
    probeProtocol="Http"
    probePort=80
    probePath="/health"
    ruleName="httpRule"
    ruleProtocol="Tcp"
    ruleFrontendPort=80
    ruleBackendPort=80
    enableFloatingIp=false
    idleTimeoutInMinutes=4}}
}
```

### Application Gateway v2

Layer 7 (HTTP/HTTPS) load balancing with WAF, SSL termination, and URL-based routing.

#### `scale:appgw.definition`

Creates an Application Gateway v2 configuration.

#### Syntax

```handlebars
{{scale:appgw.definition
  name="<appgw-name>"
  tier="<Standard_v2|WAF_v2>"
  capacity=<number>
  autoScaleMinCapacity=<number>
  autoScaleMaxCapacity=<number>
  enableWaf=<true|false>
  frontendPort=<number>
  backendPort=<number>
  protocol="<Http|Https>"
  backendAddresses=(array "<ip1>" "<ip2>" ...)
  cookieBasedAffinity="<Enabled|Disabled>"
  requestTimeout=<seconds>}}
```

#### Tier Comparison

| Feature | Standard_v2 | WAF_v2 |
|---------|-------------|--------|
| **Auto-scaling** | ✅ | ✅ |
| **Availability Zones** | ✅ | ✅ |
| **WAF Protection** | ❌ | ✅ OWASP 3.2 |
| **SSL Termination** | ✅ | ✅ |
| **URL Routing** | ✅ | ✅ |
| **WebSockets** | ✅ | ✅ |
| **Cost** | Lower | Higher |

#### Example: Application Gateway with Auto-Scaling

```handlebars
{
  "type": "Microsoft.Network/applicationGateways",
  "apiVersion": "2023-05-01",
  "name": "[parameters('appGwName')]",
  "location": "[parameters('location')]",
  "properties": {{scale:appgw.definition
    name="[parameters('appGwName')]"
    tier="WAF_v2"
    capacity=2
    autoScaleMinCapacity=2
    autoScaleMaxCapacity=10
    enableWaf=true
    frontendPort=443
    backendPort=80
    protocol="Https"
    backendAddresses=(array "10.0.1.4" "10.0.1.5" "10.0.1.6")
    cookieBasedAffinity="Disabled"
    requestTimeout=30}}
}
```

---

## Complete Integration Examples

### Example 1: Auto-Scaling VMSS with Load Balancer

Complete stack with VMSS, auto-scaling, and Standard Load Balancer.

```handlebars
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vmssName": { "type": "string" },
    "lbName": { "type": "string" },
    "instanceCount": { "type": "int", "defaultValue": 3 },
    "minCapacity": { "type": "int", "defaultValue": 2 },
    "maxCapacity": { "type": "int", "defaultValue": 10 }
  },
  "resources": [
    {
      "type": "Microsoft.Network/loadBalancers",
      "apiVersion": "2023-05-01",
      "name": "[parameters('lbName')]",
      "location": "[resourceGroup().location]",
      "sku": { "name": "Standard", "tier": "Regional" },
      "properties": {{scale:lb.definition
        name="[parameters('lbName')]"
        sku="Standard"
        tier="Regional"
        frontendIpName="webFrontend"
        publicIpResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'web-pip')]"
        backendPoolName="webBackend"
        probeName="httpProbe"
        probeProtocol="Http"
        probePort=80
        probePath="/health"
        ruleName="httpRule"
        ruleProtocol="Tcp"
        ruleFrontendPort=80
        ruleBackendPort=80
        enableFloatingIp=false
        idleTimeoutInMinutes=4}}
    },
    {
      "type": "Microsoft.Compute/virtualMachineScaleSets",
      "apiVersion": "2023-09-01",
      "name": "[parameters('vmssName')]",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Network/loadBalancers', parameters('lbName'))]"
      ],
      "sku": {
        "name": "Standard_D2s_v3",
        "tier": "Standard",
        "capacity": "[parameters('instanceCount')]"
      },
      "properties": {{scale:vmss.definition
        name="[parameters('vmssName')]"
        orchestrationMode="Flexible"
        upgradeMode="Rolling"
        instanceCount="[parameters('instanceCount')]"
        vmSize="Standard_D2s_v3"
        osType="Linux"
        imagePublisher="Canonical"
        imageOffer="0001-com-ubuntu-server-jammy"
        imageSku="22_04-lts-gen2"
        adminUsername="azureuser"
        authenticationType="password"
        enableAutoOsUpgrade=true
        healthProbeId="[resourceId('Microsoft.Network/loadBalancers/probes', parameters('lbName'), 'httpProbe')]"
        maxBatchInstancePercent=20
        maxUnhealthyInstancePercent=20
        maxUnhealthyUpgradedInstancePercent=20
        pauseTimeBetweenBatches="PT5S"}}
    },
    {
      "type": "Microsoft.Insights/autoscalesettings",
      "apiVersion": "2022-10-01",
      "name": "[concat(parameters('vmssName'), '-autoscale')]",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
      ],
      "properties": {{scale:autoscale.cpu
        vmssResourceId="[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]"
        minCapacity="[parameters('minCapacity')]"
        maxCapacity="[parameters('maxCapacity')]"
        defaultCapacity="[parameters('instanceCount')]"
        scaleOutThreshold=75
        scaleInThreshold=25}}
    }
  ]
}
```

### Example 2: Multi-Region Deployment with Traffic Manager

Global deployment across three regions with Traffic Manager.

```handlebars
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "trafficManagerName": { "type": "string" },
    "dnsName": { "type": "string" }
  },
  "resources": [
    {
      "type": "Microsoft.Network/trafficManagerProfiles",
      "apiVersion": "2022-04-01",
      "name": "[parameters('trafficManagerName')]",
      "location": "global",
      "properties": {{scale:multiregion.profile
        profileName="[parameters('trafficManagerName')]"
        dnsName="[parameters('dnsName')]"
        routingMethod="Performance"
        monitorProtocol="HTTPS"
        monitorPort=443
        monitorPath="/health"}},
      "resources": [
        {
          "type": "endpoints",
          "apiVersion": "2022-04-01",
          "name": "eastus-endpoint",
          "dependsOn": [
            "[resourceId('Microsoft.Network/trafficManagerProfiles', parameters('trafficManagerName'))]"
          ],
          "properties": {{scale:multiregion.endpoint
            endpointName="eastus-endpoint"
            type="azureEndpoints"
            targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'eastus-pip')]"
            priority=1
            weight=100
            endpointLocation="East US"}}
        },
        {
          "type": "endpoints",
          "apiVersion": "2022-04-01",
          "name": "westus-endpoint",
          "dependsOn": [
            "[resourceId('Microsoft.Network/trafficManagerProfiles', parameters('trafficManagerName'))]"
          ],
          "properties": {{scale:multiregion.endpoint
            endpointName="westus-endpoint"
            type="azureEndpoints"
            targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'westus-pip')]"
            priority=2
            weight=100
            endpointLocation="West US"}}
        },
        {
          "type": "endpoints",
          "apiVersion": "2022-04-01",
          "name": "northeurope-endpoint",
          "dependsOn": [
            "[resourceId('Microsoft.Network/trafficManagerProfiles', parameters('trafficManagerName'))]"
          ],
          "properties": {{scale:multiregion.endpoint
            endpointName="northeurope-endpoint"
            type="azureEndpoints"
            targetResourceId="[resourceId('Microsoft.Network/publicIPAddresses', 'northeurope-pip')]"
            priority=3
            weight=100
            endpointLocation="North Europe"}}
        }
      ]
    }
  ]
}
```

---

## Best Practices

### VMSS Best Practices

1. **Choose the Right Orchestration Mode:**
   - **Flexible:** Use for new deployments requiring VM-like control
   - **Uniform:** Use for maximum scale and simplicity

2. **Configure Rolling Upgrades:**
   - Set `maxBatchInstancePercent` to 20% for safer rollouts
   - Use health probes to validate instance health before proceeding
   - Set appropriate `pauseTimeBetweenBatches` (minimum 5 minutes)

3. **Enable Automatic OS Upgrades:**
   - Reduces operational overhead
   - Requires health probes for validation
   - Test in non-production first

4. **Use Health Probes:**
   - Always configure health probes for production workloads
   - HTTP/HTTPS probes preferred over TCP
   - Set appropriate probe intervals (15-30 seconds)

### Auto-Scaling Best Practices

1. **Set Appropriate Capacity Limits:**
   - `minCapacity`: At least 2 for high availability
   - `maxCapacity`: Budget + performance requirements
   - `defaultCapacity`: Expected baseline load

2. **Configure Cooldown Periods:**
   - **Scale Out:** 5-10 minutes (prevents rapid scaling)
   - **Scale In:** 15-20 minutes (allows metrics to stabilize)

3. **Use Multiple Metrics:**
   - CPU + Memory for better decision-making
   - Custom metrics for application-specific signals
   - Combine metric and schedule-based scaling

4. **Test Scaling Policies:**
   - Simulate load to verify thresholds
   - Monitor scaling events in Azure Monitor
   - Adjust thresholds based on actual behavior

### Multi-Region Best Practices

1. **Select the Right Routing Method:**
   - **Performance:** Global applications (latency-sensitive)
   - **Priority:** Active-passive failover scenarios
   - **Weighted:** A/B testing, gradual rollouts
   - **Geographic:** Data residency requirements

2. **Configure Health Monitoring:**
   - Use HTTPS probes for secure endpoints
   - Set appropriate probe paths (/health, /status)
   - Monitor probe success rates

3. **Plan for Data Synchronization:**
   - **Active-Active:** Use Azure Cosmos DB for global distribution
   - **Active-Passive:** Use Azure Site Recovery or geo-replication
   - **Multi-Master:** Design for conflict resolution

4. **Document Failover Procedures:**
   - Define RTO/RPO targets
   - Create runbooks for manual failover
   - Test failover regularly

### Load Balancing Best Practices

1. **Standard Load Balancer:**
   - Always use Standard SKU for production
   - Configure NSGs (required with Standard SKU)
   - Use health probes on backend applications
   - Enable zone redundancy for high availability

2. **Application Gateway:**
   - Use WAF_v2 tier for internet-facing applications
   - Enable auto-scaling for variable load
   - Configure SSL termination at the gateway
   - Use URL-based routing for microservices

3. **Health Probes:**
   - Return 200 OK only when application is healthy
   - Include dependency checks (database, cache, etc.)
   - Keep probe endpoints lightweight
   - Log probe failures for troubleshooting

---

## Troubleshooting

### VMSS Issues

**Problem:** Instances not upgrading during rolling upgrade

**Solution:**
- Verify health probe is returning 200 OK
- Check `maxUnhealthyInstancePercent` threshold
- Increase `pauseTimeBetweenBatches` duration
- Review upgrade logs in Azure Monitor

**Problem:** New instances failing health checks

**Solution:**
- Verify application startup time < health probe timeout
- Check NSG rules allow probe traffic
- Review application logs for errors
- Test health endpoint manually

### Auto-Scaling Issues

**Problem:** Scale set not scaling out under load

**Solution:**
- Verify metric thresholds are correctly configured
- Check auto-scale settings are enabled
- Review cooldown period (may be too long)
- Ensure capacity limits allow scaling

**Problem:** Frequent scaling oscillations

**Solution:**
- Increase cooldown periods
- Widen threshold gap (scale out vs scale in)
- Add schedule-based profiles for predictable patterns
- Review metric aggregation type

### Multi-Region Issues

**Problem:** Traffic Manager not routing correctly

**Solution:**
- Verify health probes are passing
- Check endpoint status in Azure Portal
- Review DNS propagation (can take 5-10 minutes)
- Test from multiple geographic locations

**Problem:** High latency to specific regions

**Solution:**
- Verify endpoint locations match resource locations
- Check network path with traceroute
- Review Application Gateway backend health
- Consider adding endpoints in more regions

### Load Balancer Issues

**Problem:** Backend instances marked unhealthy

**Solution:**
- Verify health probe configuration
- Check NSG rules allow probe traffic (168.63.129.16)
- Test health endpoint directly from instance
- Review application logs

**Problem:** Uneven traffic distribution

**Solution:**
- Review session affinity settings
- Check backend pool health status
- Verify all instances have equal capacity
- Monitor metrics for each backend instance

---

## Additional Resources

- [Azure VMSS Documentation](https://docs.microsoft.com/azure/virtual-machine-scale-sets/)
- [Azure Auto-Scale Documentation](https://docs.microsoft.com/azure/azure-monitor/autoscale/)
- [Azure Traffic Manager Documentation](https://docs.microsoft.com/azure/traffic-manager/)
- [Azure Load Balancer Documentation](https://docs.microsoft.com/azure/load-balancer/)
- [Azure Application Gateway Documentation](https://docs.microsoft.com/azure/application-gateway/)

---

**Version:** 1.6.0  
**Last Updated:** Day 6 - Enterprise Scaling Release  
**Module:** Scaling & High Availability
