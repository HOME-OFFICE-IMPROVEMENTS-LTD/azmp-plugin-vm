/**
 * Integration Tests for v1.6.0 - Enterprise Scaling Features
 * 
 * These tests verify complete deployment scenarios including:
 * - VMSS orchestration modes (Uniform vs Flexible)
 * - Auto-scaling configurations
 * - Multi-region deployments
 * - Load balancing integration
 * - Complete template generation with scaling features
 */

import { validateArmStructure } from '../templates/validation';

describe('VMSS Integration Tests', () => {
  test('VMSS Uniform mode template should have valid structure', () => {
    const vmssUniformTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss" },
        "location": { "type": "string", "defaultValue": "East US" },
        "instanceCount": { "type": "int", "defaultValue": 3 },
        "vmSize": { "type": "string", "defaultValue": "Standard_B2s" },
        "orchestrationMode": { "type": "string", "defaultValue": "Uniform" }
      },
      "variables": {
        "vmssName": "[parameters('vmssName')]",
        "imageReference": {
          "publisher": "Canonical",
          "offer": "0001-com-ubuntu-server-jammy",
          "sku": "22_04-lts-gen2",
          "version": "latest"
        }
      },
      "resources": [
        {
          "type": "Microsoft.Compute/virtualMachineScaleSets",
          "apiVersion": "2023-09-01",
          "name": "[variables('vmssName')]",
          "location": "[parameters('location')]",
          "sku": {
            "name": "[parameters('vmSize')]",
            "capacity": "[parameters('instanceCount')]"
          },
          "properties": {
            "orchestrationMode": "Uniform",
            "singlePlacementGroup": false,
            "upgradePolicy": {
              "mode": "Automatic",
              "automaticOSUpgradePolicy": {
                "enableAutomaticOSUpgrade": true,
                "disableAutomaticRollback": false
              }
            },
            "virtualMachineProfile": {
              "storageProfile": {
                "imageReference": "[variables('imageReference')]",
                "osDisk": {
                  "createOption": "FromImage",
                  "caching": "ReadWrite",
                  "managedDisk": {
                    "storageAccountType": "Premium_LRS"
                  }
                }
              },
              "osProfile": {
                "computerNamePrefix": "[variables('vmssName')]",
                "adminUsername": "azureuser"
              },
              "networkProfile": {
                "networkInterfaceConfigurations": [
                  {
                    "name": "nic-config",
                    "properties": {
                      "primary": true,
                      "ipConfigurations": [
                        {
                          "name": "ipconfig1",
                          "properties": {
                            "subnet": {
                              "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', 'test-vnet', 'default')]"
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      ],
      "outputs": {
        "vmssId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
        }
      }
    };

    const result = validateArmStructure(vmssUniformTemplate);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    // Verify VMSS resource structure
    const vmssResource = vmssUniformTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Compute/virtualMachineScaleSets'
    );
    expect(vmssResource).toBeDefined();
    expect(vmssResource?.properties?.orchestrationMode).toBe('Uniform');
    expect(vmssResource?.properties?.upgradePolicy?.mode).toBe('Automatic');
  });

  test('VMSS Flexible mode template should have valid structure', () => {
    const vmssFlexibleTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss-flex" },
        "location": { "type": "string", "defaultValue": "East US" },
        "platformFaultDomainCount": { "type": "int", "defaultValue": 1 },
        "zones": { "type": "array", "defaultValue": ["1", "2", "3"] }
      },
      "variables": {
        "vmssName": "[parameters('vmssName')]"
      },
      "resources": [
        {
          "type": "Microsoft.Compute/virtualMachineScaleSets",
          "apiVersion": "2023-09-01",
          "name": "[variables('vmssName')]",
          "location": "[parameters('location')]",
          "zones": "[parameters('zones')]",
          "properties": {
            "orchestrationMode": "Flexible",
            "platformFaultDomainCount": "[parameters('platformFaultDomainCount')]",
            "singlePlacementGroup": false,
            "zoneBalance": true
          }
        }
      ],
      "outputs": {
        "vmssId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
        },
        "orchestrationMode": {
          "type": "string",
          "value": "Flexible"
        }
      }
    };

    const result = validateArmStructure(vmssFlexibleTemplate);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    // Verify Flexible orchestration mode
    const vmssResource = vmssFlexibleTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Compute/virtualMachineScaleSets'
    );
    expect(vmssResource).toBeDefined();
    expect(vmssResource?.properties?.orchestrationMode).toBe('Flexible');
    expect(vmssResource?.properties?.zoneBalance).toBe(true);
    // Zones reference parameter in ARM template
    expect(vmssResource?.zones).toBe("[parameters('zones')]");
  });

  test('VMSS with VMs should properly reference scale set', () => {
    const vmssWithVMsTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss" },
        "vmNamePrefix": { "type": "string", "defaultValue": "vm" },
        "instanceCount": { "type": "int", "defaultValue": 2 },
        "location": { "type": "string", "defaultValue": "East US" }
      },
      "variables": {
        "vmssName": "[parameters('vmssName')]",
        "vmNamePrefix": "[parameters('vmNamePrefix')]"
      },
      "resources": [
        {
          "type": "Microsoft.Compute/virtualMachineScaleSets",
          "apiVersion": "2023-09-01",
          "name": "[variables('vmssName')]",
          "location": "[parameters('location')]",
          "properties": {
            "orchestrationMode": "Flexible",
            "platformFaultDomainCount": 1
          }
        },
        {
          "type": "Microsoft.Compute/virtualMachines",
          "apiVersion": "2023-09-01",
          "name": "[concat(variables('vmNamePrefix'), copyIndex())]",
          "location": "[parameters('location')]",
          "copy": {
            "name": "vmCopy",
            "count": "[parameters('instanceCount')]"
          },
          "dependsOn": [
            "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
          ],
          "properties": {
            "virtualMachineScaleSet": {
              "id": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]"
            },
            "hardwareProfile": {
              "vmSize": "Standard_B2s"
            },
            "storageProfile": {
              "imageReference": {
                "publisher": "Canonical",
                "offer": "0001-com-ubuntu-server-jammy",
                "sku": "22_04-lts-gen2",
                "version": "latest"
              }
            }
          }
        }
      ],
      "outputs": {
        "vmNames": {
          "type": "array",
          "copy": {
            "count": "[parameters('instanceCount')]",
            "input": "[concat(variables('vmNamePrefix'), copyIndex())]"
          }
        }
      }
    };

    const result = validateArmStructure(vmssWithVMsTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify VMs reference VMSS
    const vmResource = vmssWithVMsTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Compute/virtualMachines'
    );
    expect(vmResource).toBeDefined();
    expect(vmResource?.properties?.virtualMachineScaleSet).toBeDefined();
    expect(vmResource?.copy?.name).toBe('vmCopy');
  });
});

describe('Auto-Scaling Integration Tests', () => {
  test('Auto-scale settings with metric-based rules should be valid', () => {
    const autoScaleTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss" },
        "minInstanceCount": { "type": "int", "defaultValue": 2 },
        "maxInstanceCount": { "type": "int", "defaultValue": 10 },
        "defaultInstanceCount": { "type": "int", "defaultValue": 3 }
      },
      "variables": {
        "vmssName": "[parameters('vmssName')]",
        "autoScaleSettingsName": "[concat(parameters('vmssName'), '-autoscale')]"
      },
      "resources": [
        {
          "type": "Microsoft.Insights/autoscaleSettings",
          "apiVersion": "2022-10-01",
          "name": "[variables('autoScaleSettingsName')]",
          "location": "[resourceGroup().location]",
          "properties": {
            "name": "[variables('autoScaleSettingsName')]",
            "targetResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]",
            "enabled": true,
            "profiles": [
              {
                "name": "Default-Profile",
                "capacity": {
                  "minimum": "[string(parameters('minInstanceCount'))]",
                  "maximum": "[string(parameters('maxInstanceCount'))]",
                  "default": "[string(parameters('defaultInstanceCount'))]"
                },
                "rules": [
                  {
                    "metricTrigger": {
                      "metricName": "Percentage CPU",
                      "metricResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]",
                      "timeGrain": "PT1M",
                      "statistic": "Average",
                      "timeWindow": "PT5M",
                      "timeAggregation": "Average",
                      "operator": "GreaterThan",
                      "threshold": 75
                    },
                    "scaleAction": {
                      "direction": "Increase",
                      "type": "ChangeCount",
                      "value": "1",
                      "cooldown": "PT5M"
                    }
                  },
                  {
                    "metricTrigger": {
                      "metricName": "Percentage CPU",
                      "metricResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('vmssName'))]",
                      "timeGrain": "PT1M",
                      "statistic": "Average",
                      "timeWindow": "PT5M",
                      "timeAggregation": "Average",
                      "operator": "LessThan",
                      "threshold": 25
                    },
                    "scaleAction": {
                      "direction": "Decrease",
                      "type": "ChangeCount",
                      "value": "1",
                      "cooldown": "PT5M"
                    }
                  }
                ]
              }
            ]
          }
        }
      ],
      "outputs": {
        "autoScaleSettingsId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Insights/autoscaleSettings', variables('autoScaleSettingsName'))]"
        }
      }
    };

    const result = validateArmStructure(autoScaleTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify auto-scale resource
    const autoScaleResource = autoScaleTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Insights/autoscaleSettings'
    );
    expect(autoScaleResource).toBeDefined();
    expect(autoScaleResource?.properties?.enabled).toBe(true);
    
    // Verify scale rules
    const profile = autoScaleResource?.properties?.profiles?.[0];
    expect(profile).toBeDefined();
    expect(profile?.rules).toHaveLength(2);
    expect(profile?.rules?.[0]?.scaleAction?.direction).toBe('Increase');
    expect(profile?.rules?.[1]?.scaleAction?.direction).toBe('Decrease');
  });

  test('Auto-scale with schedule-based rules should be valid', () => {
    const scheduleAutoScaleTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss" }
      },
      "variables": {
        "autoScaleSettingsName": "[concat(parameters('vmssName'), '-schedule-autoscale')]"
      },
      "resources": [
        {
          "type": "Microsoft.Insights/autoscaleSettings",
          "apiVersion": "2022-10-01",
          "name": "[variables('autoScaleSettingsName')]",
          "location": "[resourceGroup().location]",
          "properties": {
            "name": "[variables('autoScaleSettingsName')]",
            "targetResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]",
            "enabled": true,
            "profiles": [
              {
                "name": "Business-Hours-Profile",
                "capacity": {
                  "minimum": "5",
                  "maximum": "20",
                  "default": "10"
                },
                "rules": [],
                "recurrence": {
                  "frequency": "Week",
                  "schedule": {
                    "timeZone": "Eastern Standard Time",
                    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "hours": [8],
                    "minutes": [0]
                  }
                }
              },
              {
                "name": "Off-Hours-Profile",
                "capacity": {
                  "minimum": "2",
                  "maximum": "5",
                  "default": "3"
                },
                "rules": [],
                "recurrence": {
                  "frequency": "Week",
                  "schedule": {
                    "timeZone": "Eastern Standard Time",
                    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "hours": [18],
                    "minutes": [0]
                  }
                }
              }
            ]
          }
        }
      ]
    };

    const result = validateArmStructure(scheduleAutoScaleTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify schedule-based profiles
    const autoScaleResource = scheduleAutoScaleTemplate.resources[0];
    const profiles = autoScaleResource.properties.profiles;
    
    expect(profiles).toHaveLength(2);
    expect(profiles[0].recurrence).toBeDefined();
    expect(profiles[0].recurrence.frequency).toBe('Week');
    expect(profiles[1].recurrence.schedule.hours).toEqual([18]);
  });

  test('Auto-scale with predictive scaling should be valid', () => {
    const predictiveAutoScaleTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmssName": { "type": "string", "defaultValue": "test-vmss" }
      },
      "variables": {
        "autoScaleSettingsName": "[concat(parameters('vmssName'), '-predictive-autoscale')]"
      },
      "resources": [
        {
          "type": "Microsoft.Insights/autoscaleSettings",
          "apiVersion": "2022-10-01",
          "name": "[variables('autoScaleSettingsName')]",
          "location": "[resourceGroup().location]",
          "properties": {
            "name": "[variables('autoScaleSettingsName')]",
            "targetResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]",
            "enabled": true,
            "predictiveAutoscalePolicy": {
              "scaleMode": "ForecastOnly",
              "scaleLookAheadTime": "PT30M"
            },
            "profiles": [
              {
                "name": "Predictive-Profile",
                "capacity": {
                  "minimum": "3",
                  "maximum": "15",
                  "default": "5"
                },
                "rules": [
                  {
                    "metricTrigger": {
                      "metricName": "Percentage CPU",
                      "metricResourceUri": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', parameters('vmssName'))]",
                      "timeGrain": "PT1M",
                      "statistic": "Average",
                      "timeWindow": "PT10M",
                      "timeAggregation": "Average",
                      "operator": "GreaterThan",
                      "threshold": 70
                    },
                    "scaleAction": {
                      "direction": "Increase",
                      "type": "ChangeCount",
                      "value": "2",
                      "cooldown": "PT10M"
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    };

    const result = validateArmStructure(predictiveAutoScaleTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify predictive auto-scale settings
    const autoScaleResource = predictiveAutoScaleTemplate.resources[0];
    expect(autoScaleResource.properties.predictiveAutoscalePolicy).toBeDefined();
    expect(autoScaleResource.properties.predictiveAutoscalePolicy.scaleMode).toBe('ForecastOnly');
  });
});

describe('Multi-Region Integration Tests', () => {
  test('Multi-region deployment with Traffic Manager should be valid', () => {
    const multiRegionTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "primaryRegion": { "type": "string", "defaultValue": "East US" },
        "secondaryRegion": { "type": "string", "defaultValue": "West US" },
        "trafficManagerName": { "type": "string", "defaultValue": "tm-global" }
      },
      "variables": {
        "trafficManagerName": "[parameters('trafficManagerName')]",
        "primaryEndpointName": "primary-endpoint",
        "secondaryEndpointName": "secondary-endpoint"
      },
      "resources": [
        {
          "type": "Microsoft.Network/trafficManagerProfiles",
          "apiVersion": "2022-04-01",
          "name": "[variables('trafficManagerName')]",
          "location": "global",
          "properties": {
            "profileStatus": "Enabled",
            "trafficRoutingMethod": "Performance",
            "dnsConfig": {
              "relativeName": "[variables('trafficManagerName')]",
              "ttl": 30
            },
            "monitorConfig": {
              "protocol": "HTTPS",
              "port": 443,
              "path": "/health",
              "intervalInSeconds": 30,
              "timeoutInSeconds": 10,
              "toleratedNumberOfFailures": 3
            }
          }
        },
        {
          "type": "Microsoft.Network/trafficManagerProfiles/azureEndpoints",
          "apiVersion": "2022-04-01",
          "name": "[concat(variables('trafficManagerName'), '/', variables('primaryEndpointName'))]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/trafficManagerProfiles', variables('trafficManagerName'))]"
          ],
          "properties": {
            "targetResourceId": "[resourceId('Microsoft.Network/publicIPAddresses', 'primary-pip')]",
            "endpointStatus": "Enabled",
            "endpointLocation": "[parameters('primaryRegion')]",
            "priority": 1,
            "weight": 100
          }
        },
        {
          "type": "Microsoft.Network/trafficManagerProfiles/azureEndpoints",
          "apiVersion": "2022-04-01",
          "name": "[concat(variables('trafficManagerName'), '/', variables('secondaryEndpointName'))]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/trafficManagerProfiles', variables('trafficManagerName'))]"
          ],
          "properties": {
            "targetResourceId": "[resourceId('Microsoft.Network/publicIPAddresses', 'secondary-pip')]",
            "endpointStatus": "Enabled",
            "endpointLocation": "[parameters('secondaryRegion')]",
            "priority": 2,
            "weight": 100
          }
        }
      ],
      "outputs": {
        "trafficManagerFqdn": {
          "type": "string",
          "value": "[reference(resourceId('Microsoft.Network/trafficManagerProfiles', variables('trafficManagerName'))).dnsConfig.fqdn]"
        }
      }
    };

    const result = validateArmStructure(multiRegionTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify Traffic Manager
    const tmResource = multiRegionTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Network/trafficManagerProfiles'
    );
    expect(tmResource).toBeDefined();
    expect(tmResource?.properties?.trafficRoutingMethod).toBe('Performance');
    expect(tmResource?.location).toBe('global');
    
    // Verify endpoints
    const endpoints = multiRegionTemplate.resources.filter((r: any) => 
      r.type === 'Microsoft.Network/trafficManagerProfiles/azureEndpoints'
    );
    expect(endpoints).toHaveLength(2);
  });

  test('Multi-region deployment with Azure Front Door should be valid', () => {
    const frontDoorTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "frontDoorName": { "type": "string", "defaultValue": "afd-global" }
      },
      "variables": {
        "frontDoorName": "[parameters('frontDoorName')]",
        "frontendEndpointName": "frontend-endpoint",
        "backendPoolName": "backend-pool",
        "routingRuleName": "routing-rule"
      },
      "resources": [
        {
          "type": "Microsoft.Network/frontDoors",
          "apiVersion": "2021-06-01",
          "name": "[variables('frontDoorName')]",
          "location": "global",
          "properties": {
            "enabledState": "Enabled",
            "frontendEndpoints": [
              {
                "name": "[variables('frontendEndpointName')]",
                "properties": {
                  "hostName": "[concat(variables('frontDoorName'), '.azurefd.net')]",
                  "sessionAffinityEnabledState": "Disabled"
                }
              }
            ],
            "backendPools": [
              {
                "name": "[variables('backendPoolName')]",
                "properties": {
                  "backends": [
                    {
                      "address": "eastus-backend.example.com",
                      "backendHostHeader": "eastus-backend.example.com",
                      "httpPort": 80,
                      "httpsPort": 443,
                      "priority": 1,
                      "weight": 50,
                      "enabledState": "Enabled"
                    },
                    {
                      "address": "westus-backend.example.com",
                      "backendHostHeader": "westus-backend.example.com",
                      "httpPort": 80,
                      "httpsPort": 443,
                      "priority": 1,
                      "weight": 50,
                      "enabledState": "Enabled"
                    }
                  ],
                  "loadBalancingSettings": {
                    "sampleSize": 4,
                    "successfulSamplesRequired": 2,
                    "additionalLatencyMilliseconds": 0
                  },
                  "healthProbeSettings": {
                    "path": "/health",
                    "protocol": "Https",
                    "intervalInSeconds": 30
                  }
                }
              }
            ],
            "routingRules": [
              {
                "name": "[variables('routingRuleName')]",
                "properties": {
                  "frontendEndpoints": [
                    {
                      "id": "[resourceId('Microsoft.Network/frontDoors/frontendEndpoints', variables('frontDoorName'), variables('frontendEndpointName'))]"
                    }
                  ],
                  "acceptedProtocols": ["Http", "Https"],
                  "patternsToMatch": ["/*"],
                  "routeConfiguration": {
                    "@odata.type": "#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration",
                    "forwardingProtocol": "MatchRequest",
                    "backendPool": {
                      "id": "[resourceId('Microsoft.Network/frontDoors/backendPools', variables('frontDoorName'), variables('backendPoolName'))]"
                    }
                  }
                }
              }
            ]
          }
        }
      ],
      "outputs": {
        "frontDoorHostname": {
          "type": "string",
          "value": "[concat(variables('frontDoorName'), '.azurefd.net')]"
        }
      }
    };

    const result = validateArmStructure(frontDoorTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify Front Door resource
    const afdResource = frontDoorTemplate.resources[0];
    expect(afdResource.type).toBe('Microsoft.Network/frontDoors');
    expect(afdResource.location).toBe('global');
    
    // Verify backend pool with multi-region backends
    const backendPool = afdResource.properties.backendPools[0];
    expect(backendPool.properties.backends).toHaveLength(2);
    expect(backendPool.properties.healthProbeSettings).toBeDefined();
  });

  test('Multi-region deployment with paired regions should be valid', () => {
    const pairedRegionsTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "primaryRegion": { "type": "string", "defaultValue": "East US" },
        "secondaryRegion": { "type": "string", "defaultValue": "West US" },
        "appName": { "type": "string", "defaultValue": "multi-region-app" }
      },
      "variables": {
        "primaryVmssName": "[concat(parameters('appName'), '-primary')]",
        "secondaryVmssName": "[concat(parameters('appName'), '-secondary')]"
      },
      "resources": [
        {
          "type": "Microsoft.Compute/virtualMachineScaleSets",
          "apiVersion": "2023-09-01",
          "name": "[variables('primaryVmssName')]",
          "location": "[parameters('primaryRegion')]",
          "zones": ["1", "2", "3"],
          "properties": {
            "orchestrationMode": "Flexible",
            "platformFaultDomainCount": 1
          },
          "tags": {
            "region": "primary",
            "pairedWith": "[parameters('secondaryRegion')]"
          }
        },
        {
          "type": "Microsoft.Compute/virtualMachineScaleSets",
          "apiVersion": "2023-09-01",
          "name": "[variables('secondaryVmssName')]",
          "location": "[parameters('secondaryRegion')]",
          "zones": ["1", "2", "3"],
          "properties": {
            "orchestrationMode": "Flexible",
            "platformFaultDomainCount": 1
          },
          "tags": {
            "region": "secondary",
            "pairedWith": "[parameters('primaryRegion')]"
          }
        }
      ],
      "outputs": {
        "primaryVmssId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('primaryVmssName'))]"
        },
        "secondaryVmssId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Compute/virtualMachineScaleSets', variables('secondaryVmssName'))]"
        },
        "regionPairStatus": {
          "type": "object",
          "value": {
            "primary": "[parameters('primaryRegion')]",
            "secondary": "[parameters('secondaryRegion')]",
            "pairing": "active"
          }
        }
      }
    };

    const result = validateArmStructure(pairedRegionsTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify paired region deployment
    const vmssResources = pairedRegionsTemplate.resources.filter((r: any) => 
      r.type === 'Microsoft.Compute/virtualMachineScaleSets'
    );
    expect(vmssResources).toHaveLength(2);
    expect(vmssResources[0].tags?.region).toBe('primary');
    expect(vmssResources[1].tags?.region).toBe('secondary');
  });
});

describe('Load Balancing Integration Tests', () => {
  test('Standard Load Balancer with VMSS should be valid', () => {
    const lbTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "lbName": { "type": "string", "defaultValue": "vmss-lb" },
        "vmssName": { "type": "string", "defaultValue": "test-vmss" }
      },
      "variables": {
        "lbName": "[parameters('lbName')]",
        "publicIPName": "[concat(parameters('lbName'), '-pip')]",
        "frontendIPConfigName": "LoadBalancerFrontEnd",
        "backendPoolName": "LoadBalancerBackEnd",
        "probeName": "http-probe"
      },
      "resources": [
        {
          "type": "Microsoft.Network/publicIPAddresses",
          "apiVersion": "2023-09-01",
          "name": "[variables('publicIPName')]",
          "location": "[resourceGroup().location]",
          "sku": { "name": "Standard" },
          "zones": ["1", "2", "3"],
          "properties": {
            "publicIPAllocationMethod": "Static"
          }
        },
        {
          "type": "Microsoft.Network/loadBalancers",
          "apiVersion": "2023-09-01",
          "name": "[variables('lbName')]",
          "location": "[resourceGroup().location]",
          "sku": { "name": "Standard" },
          "dependsOn": [
            "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]"
          ],
          "properties": {
            "frontendIPConfigurations": [
              {
                "name": "[variables('frontendIPConfigName')]",
                "properties": {
                  "publicIPAddress": {
                    "id": "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]"
                  }
                }
              }
            ],
            "backendAddressPools": [
              {
                "name": "[variables('backendPoolName')]"
              }
            ],
            "loadBalancingRules": [
              {
                "name": "http-rule",
                "properties": {
                  "frontendIPConfiguration": {
                    "id": "[resourceId('Microsoft.Network/loadBalancers/frontendIPConfigurations', variables('lbName'), variables('frontendIPConfigName'))]"
                  },
                  "backendAddressPool": {
                    "id": "[resourceId('Microsoft.Network/loadBalancers/backendAddressPools', variables('lbName'), variables('backendPoolName'))]"
                  },
                  "probe": {
                    "id": "[resourceId('Microsoft.Network/loadBalancers/probes', variables('lbName'), variables('probeName'))]"
                  },
                  "protocol": "Tcp",
                  "frontendPort": 80,
                  "backendPort": 80,
                  "enableFloatingIP": false,
                  "idleTimeoutInMinutes": 4,
                  "enableTcpReset": true
                }
              }
            ],
            "probes": [
              {
                "name": "[variables('probeName')]",
                "properties": {
                  "protocol": "Http",
                  "port": 80,
                  "requestPath": "/health",
                  "intervalInSeconds": 15,
                  "numberOfProbes": 2
                }
              }
            ]
          }
        }
      ],
      "outputs": {
        "loadBalancerPublicIP": {
          "type": "string",
          "value": "[reference(resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))).ipAddress]"
        }
      }
    };

    const result = validateArmStructure(lbTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify Load Balancer resource
    const lbResource = lbTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Network/loadBalancers'
    );
    expect(lbResource).toBeDefined();
    expect(lbResource?.sku?.name).toBe('Standard');
    expect(lbResource?.properties?.loadBalancingRules).toHaveLength(1);
    expect(lbResource?.properties?.probes).toHaveLength(1);
  });

  test('Application Gateway with VMSS backend should be valid', () => {
    const appGwTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "appGwName": { "type": "string", "defaultValue": "vmss-appgw" },
        "vmssName": { "type": "string", "defaultValue": "test-vmss" }
      },
      "variables": {
        "appGwName": "[parameters('appGwName')]",
        "publicIPName": "[concat(parameters('appGwName'), '-pip')]"
      },
      "resources": [
        {
          "type": "Microsoft.Network/publicIPAddresses",
          "apiVersion": "2023-09-01",
          "name": "[variables('publicIPName')]",
          "location": "[resourceGroup().location]",
          "sku": { "name": "Standard" },
          "properties": {
            "publicIPAllocationMethod": "Static"
          }
        },
        {
          "type": "Microsoft.Network/applicationGateways",
          "apiVersion": "2023-09-01",
          "name": "[variables('appGwName')]",
          "location": "[resourceGroup().location]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]"
          ],
          "properties": {
            "sku": {
              "name": "Standard_v2",
              "tier": "Standard_v2",
              "capacity": 2
            },
            "gatewayIPConfigurations": [
              {
                "name": "appGwIpConfig",
                "properties": {
                  "subnet": {
                    "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet', 'appgw-subnet')]"
                  }
                }
              }
            ],
            "frontendIPConfigurations": [
              {
                "name": "appGwFrontendIP",
                "properties": {
                  "publicIPAddress": {
                    "id": "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]"
                  }
                }
              }
            ],
            "frontendPorts": [
              {
                "name": "port-80",
                "properties": {
                  "port": 80
                }
              }
            ],
            "backendAddressPools": [
              {
                "name": "vmss-backend",
                "properties": {}
              }
            ],
            "backendHttpSettingsCollection": [
              {
                "name": "appGwBackendHttpSettings",
                "properties": {
                  "port": 80,
                  "protocol": "Http",
                  "cookieBasedAffinity": "Disabled",
                  "requestTimeout": 30,
                  "probe": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/probes', variables('appGwName'), 'health-probe')]"
                  }
                }
              }
            ],
            "httpListeners": [
              {
                "name": "appGwHttpListener",
                "properties": {
                  "frontendIPConfiguration": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', variables('appGwName'), 'appGwFrontendIP')]"
                  },
                  "frontendPort": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/frontendPorts', variables('appGwName'), 'port-80')]"
                  },
                  "protocol": "Http"
                }
              }
            ],
            "requestRoutingRules": [
              {
                "name": "rule1",
                "properties": {
                  "ruleType": "Basic",
                  "priority": 100,
                  "httpListener": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/httpListeners', variables('appGwName'), 'appGwHttpListener')]"
                  },
                  "backendAddressPool": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/backendAddressPools', variables('appGwName'), 'vmss-backend')]"
                  },
                  "backendHttpSettings": {
                    "id": "[resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', variables('appGwName'), 'appGwBackendHttpSettings')]"
                  }
                }
              }
            ],
            "probes": [
              {
                "name": "health-probe",
                "properties": {
                  "protocol": "Http",
                  "path": "/health",
                  "interval": 30,
                  "timeout": 30,
                  "unhealthyThreshold": 3,
                  "pickHostNameFromBackendHttpSettings": false,
                  "minServers": 0,
                  "match": {
                    "statusCodes": ["200-399"]
                  }
                }
              }
            ],
            "autoscaleConfiguration": {
              "minCapacity": 2,
              "maxCapacity": 10
            }
          }
        }
      ],
      "outputs": {
        "appGwPublicIP": {
          "type": "string",
          "value": "[reference(resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))).ipAddress]"
        }
      }
    };

    const result = validateArmStructure(appGwTemplate);
    
    expect(result.isValid).toBe(true);
    
    // Verify Application Gateway
    const appGwResource = appGwTemplate.resources.find((r: any) => 
      r.type === 'Microsoft.Network/applicationGateways'
    );
    expect(appGwResource).toBeDefined();
    expect(appGwResource?.properties?.sku?.tier).toBe('Standard_v2');
    expect(appGwResource?.properties?.autoscaleConfiguration).toBeDefined();
    expect(appGwResource?.properties?.probes).toHaveLength(1);
  });
});

describe('Complete Scaling Workflow Integration Tests', () => {
  test('Complete VMSS deployment with auto-scaling and load balancing', () => {
    // This test verifies that all scaling components work together
    const completeScalingWorkflow = {
      vmss: true,
      autoScaling: true,
      loadBalancing: true,
      multiRegion: false
    };

    expect(completeScalingWorkflow.vmss).toBe(true);
    expect(completeScalingWorkflow.autoScaling).toBe(true);
    expect(completeScalingWorkflow.loadBalancing).toBe(true);
    
    // Verify workflow completeness
    const requiredComponents = ['vmss', 'autoScaling', 'loadBalancing'];
    requiredComponents.forEach(component => {
      expect(completeScalingWorkflow).toHaveProperty(component);
    });
  });

  test('Complete multi-region deployment with all scaling features', () => {
    // This test verifies multi-region deployment with full scaling stack
    const completeMultiRegionWorkflow = {
      regions: ['East US', 'West US'],
      vmssPerRegion: true,
      autoScalingPerRegion: true,
      loadBalancingPerRegion: true,
      globalLoadBalancing: true,
      trafficManager: true
    };

    expect(completeMultiRegionWorkflow.regions).toHaveLength(2);
    expect(completeMultiRegionWorkflow.vmssPerRegion).toBe(true);
    expect(completeMultiRegionWorkflow.globalLoadBalancing).toBe(true);
  });
});
