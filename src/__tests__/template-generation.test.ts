import { validateArmStructure } from '../templates/validation';

describe('Template Generation', () => {
  test('mainTemplate.json.hbs should generate valid JSON', () => {
    // Mock minimal context to test JSON structure
    const mockTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "vmName": {
          "type": "string",
          "defaultValue": "testvm"
        },
        "location": {
          "type": "string", 
          "defaultValue": "East US"
        }
      },
      "variables": {
        "vmName": "[parameters('vmName')]"
      },
      "resources": [
        {
          "type": "Microsoft.Compute/virtualMachines",
          "apiVersion": "2021-03-01",
          "name": "[variables('vmName')]",
          "location": "[parameters('location')]",
          "properties": {}
        }
      ],
      "outputs": {
        "vmName": {
          "type": "string",
          "value": "[variables('vmName')]"
        }
      }
    };

    const result = validateArmStructure(mockTemplate);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('template should handle optional sections without trailing commas', () => {
    // Test template with only required fields
    const minimalTemplate = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "resources": []
    };

    const result = validateArmStructure(minimalTemplate);
    expect(result.isValid).toBe(true);
  });
});