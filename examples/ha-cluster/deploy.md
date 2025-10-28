# High Availability Web Cluster Deployment

This example demonstrates deploying a high-availability web cluster using the Azure Marketplace VM template with HA capabilities.

## Deployment Command

```bash
# Deploy using Azure CLI
az deployment group create \
  --resource-group myResourceGroup \
  --template-file ../../src/templates/mainTemplate.json \
  --parameters @parameters.json

# Or using Azure PowerShell
New-AzResourceGroupDeployment `
  -ResourceGroupName "myResourceGroup" `
  -TemplateFile "../../src/templates/mainTemplate.json" `
  -TemplateParameterFile "parameters.json"
```

## Key Features

This configuration enables:

- **Proximity Placement Group**: Ensures low latency between VM instances
- **Load Balancer**: Distributes traffic across healthy instances
- **Virtual Machine Scale Set**: Provides scalability and redundancy
- **Auto-scaling**: Automatically adjusts capacity based on demand
- **Health Monitoring**: Monitors application health and removes unhealthy instances
- **Zone Distribution**: Spreads instances across availability zones
- **Rolling Updates**: Ensures zero-downtime deployments

## Configuration Highlights

- **Instance Count**: 3 VMs initially, scales 2-10 based on demand
- **VM Size**: Standard_D2s_v3 (2 vCPU, 8GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: Premium SSD
- **Networking**: Standard Load Balancer with health probes
- **Security**: Trusted Launch with Secure Boot and vTPM enabled

## Post-Deployment Setup

1. Configure your application on the VM instances
2. Ensure the health endpoint (/health) returns appropriate status
3. Monitor auto-scaling behavior through Azure Monitor
4. Review load balancer health probe status

## Monitoring

- Check VM Scale Set health in Azure portal
- Monitor load balancer backend health
- Review auto-scaling metrics and rules
- Verify proximity placement group effectiveness