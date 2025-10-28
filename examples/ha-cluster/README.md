# High Availability Cluster Example

This example demonstrates how to deploy a highly available VM cluster using azmp-plugin-vm v1.11.0 with comprehensive HA capabilities.

## Features

- **Proximity Placement Groups**: Ensures low latency between cluster nodes
- **Load Balancer**: Distributes traffic across healthy instances with health probes
- **Virtual Machine Scale Set**: Provides auto-scaling and zone distribution
- **Health Extensions**: Application-level health monitoring with automatic repairs
- **Multi-zone Deployment**: Distributes instances across availability zones
- **Automatic Repairs**: Replaces unhealthy instances automatically

## Quick Start

```bash
# Generate HA cluster configuration
azmp vm create \
  --template ha-cluster \
  --vm-name "web-cluster" \
  --admin-username "azureuser" \
  --vm-size "Standard_D2s_v3" \
  --location "East US" \
  --ha-enabled \
  --instance-count 3 \
  --auto-scaling \
  --health-monitoring

# Deploy to Azure
az deployment group create \
  --resource-group myResourceGroup \
  --template-file mainTemplate.json \
  --parameters @parameters.json
```

## Configuration Options

### High Availability Configuration

```javascript
{
  "haConfig": {
    // Proximity Placement Group for low latency
    "proximityPlacementGroup": {
      "enabled": true,
      "name": "web-cluster-ppg",
      "type": "Standard"
    },
    
    // Load Balancer with health probes
    "loadBalancer": {
      "enabled": true,
      "sku": "Standard",
      "createPublicIP": true,
      "healthProbes": [
        {
          "name": "web-health-probe",
          "protocol": "Http",
          "port": 80,
          "requestPath": "/health",
          "intervalInSeconds": 15,
          "numberOfProbes": 2
        }
      ],
      "loadBalancingRules": [
        {
          "name": "web-rule",
          "protocol": "Tcp",
          "frontendPort": 80,
          "backendPort": 80,
          "probeName": "web-health-probe"
        }
      ]
    },
    
    // VMSS with auto-scaling
    "vmss": {
      "enabled": true,
      "instanceCount": 3,
      "orchestrationMode": "Uniform",
      "upgradePolicy": {
        "mode": "Rolling",
        "maxBatchInstancePercent": 20,
        "maxUnhealthyInstancePercent": 20
      },
      "zoneBalance": true,
      "zones": ["1", "2", "3"],
      "autoScaling": {
        "enabled": true,
        "minInstances": 2,
        "maxInstances": 10,
        "scaleOutRule": {
          "cpuThreshold": 70,
          "timeWindow": "PT5M"
        },
        "scaleInRule": {
          "cpuThreshold": 25,
          "timeWindow": "PT5M"
        }
      }
    },
    
    // Health Monitoring and Automatic Repairs
    "healthMonitoring": {
      "enabled": true,
      "applicationHealthExtension": {
        "enabled": true,
        "protocol": "http",
        "port": 80,
        "requestPath": "/health",
        "gracePeriod": "PT30M"
      },
      "automaticRepairPolicy": {
        "enabled": true,
        "gracePeriod": "PT30M",
        "maxInstanceRepairs": 3
      },
      "healthReporting": {
        "enabled": true,
        "logAnalyticsWorkspaceId": "your-workspace-id",
        "applicationInsightsInstrumentationKey": "your-app-insights-key"
      }
    }
  }
}
```

## Deployment Architecture

The HA cluster creates the following Azure resources:

1. **Proximity Placement Group**: Groups resources for optimal latency
2. **Virtual Network**: Isolated network with subnet for VMSS
3. **Load Balancer**: Standard SKU with public IP and health probes
4. **Virtual Machine Scale Set**: Multi-zone VMSS with health extensions
5. **Auto-scaling**: CPU-based scaling rules with customizable thresholds
6. **Health Monitoring**: Application health extensions and Log Analytics integration
7. **Storage Account**: For diagnostics and health monitoring logs

## Health Endpoint Implementation

Your application should implement a health endpoint for proper health monitoring:

### Node.js Example

```javascript
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  // Perform health checks
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: checkDatabase(),
      memory: checkMemory(),
      disk: checkDiskSpace()
    }
  };
  
  const isHealthy = Object.values(healthStatus.checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(healthStatus);
});

function checkDatabase() {
  // Database connectivity check
  return { status: 'ok', responseTime: '5ms' };
}

function checkMemory() {
  const used = process.memoryUsage();
  const isHealthy = used.heapUsed < 100 * 1024 * 1024; // 100MB threshold
  return { status: isHealthy ? 'ok' : 'error', heapUsed: used.heapUsed };
}

function checkDiskSpace() {
  // Disk space check implementation
  return { status: 'ok', available: '85%' };
}

app.listen(80, () => {
  console.log('Health endpoint available at /health');
});
```

### ASP.NET Core Example

```csharp
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Add health checks
builder.Services.AddHealthChecks()
    .AddCheck("database", () => HealthCheckResult.Healthy("Database is responsive"))
    .AddCheck("memory", () => {
        var allocatedBytes = GC.GetTotalMemory(false);
        var isHealthy = allocatedBytes < 100 * 1024 * 1024; // 100MB threshold
        return isHealthy ? HealthCheckResult.Healthy($"Memory usage: {allocatedBytes} bytes") 
                        : HealthCheckResult.Unhealthy($"High memory usage: {allocatedBytes} bytes");
    });

var app = builder.Build();

// Configure health check endpoint
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                data = e.Value.Data
            })
        });
        await context.Response.WriteAsync(result);
    }
});

app.Run();
```

## Monitoring and Troubleshooting

### View VMSS Health Status

```bash
# Check VMSS instances
az vmss list-instances \
  --resource-group myResourceGroup \
  --name web-cluster-vmss \
  --output table

# Check instance health
az vmss get-instance-view \
  --resource-group myResourceGroup \
  --name web-cluster-vmss \
  --instance-id 0
```

### Monitor Auto-scaling Events

```bash
# View auto-scale settings
az monitor autoscale show \
  --resource-group myResourceGroup \
  --name web-cluster-vmss-ha-autoscale

# Check scaling history
az monitor autoscale profile list \
  --resource-group myResourceGroup \
  --autoscale-name web-cluster-vmss-ha-autoscale
```

### Health Monitoring Logs

```kusto
// Query Application Insights for health check data
requests
| where name contains "health"
| where timestamp > ago(1h)
| summarize 
    HealthyCount = countif(resultCode == 200),
    UnhealthyCount = countif(resultCode != 200),
    AvgResponseTime = avg(duration)
    by bin(timestamp, 5m)
| order by timestamp desc
```

## Best Practices

1. **Health Endpoints**: Implement comprehensive health checks covering all critical dependencies
2. **Graceful Shutdown**: Handle shutdown signals properly to avoid premature health check failures
3. **Resource Sizing**: Use appropriate VM sizes that support the expected load
4. **Monitoring**: Set up alerts for health check failures and scaling events
5. **Update Strategy**: Use rolling upgrades to maintain availability during updates
6. **Security**: Implement proper network security groups and firewall rules
7. **Backup**: Configure backup policies for persistent data

## Cost Optimization

- Use Spot instances for non-critical workloads
- Configure appropriate auto-scaling thresholds
- Schedule scale-down during off-peak hours
- Use Azure Reserved Instances for baseline capacity

## Troubleshooting Common Issues

### Health Check Failures

1. Verify health endpoint is accessible from load balancer subnet
2. Check application startup time vs. grace period
3. Validate health check logic and dependencies
4. Review network security group rules

### Auto-scaling Issues

1. Check CPU/memory metrics in Azure Monitor
2. Verify auto-scale rule configuration
3. Review cool-down periods
4. Check subscription quotas

### Load Balancer Issues

1. Verify backend pool configuration
2. Check health probe settings
3. Review load balancing rules
4. Validate network connectivity

For additional support and examples, see the [Azure Documentation](https://docs.microsoft.com/azure) and [azmp-plugin-vm GitHub repository](https://github.com/your-org/azmp-plugin-vm).