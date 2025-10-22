# @hoiltd/azmp-plugin-vm

Virtual Machine plugin for Azure Marketplace Generator.

## Installation

```bash
npm install @hoiltd/azmp-plugin-vm
```

## Usage

Add to your `azmp-config.json`:

```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",
      "enabled": true,
      "options": {
        "defaultVmSize": "Standard_D2s_v3",
        "includeDiagnostics": true,
        "includePublicIp": true
      }
    }
  ]
}
```

## CLI Commands

```bash
# Create a VM marketplace offer
azmp create vm --name myvm --location eastus

# List available VM sizes
azmp vm list-sizes --location eastus

# Validate VM configuration
azmp validate vm --config myvm-config.json
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultVmSize` | string | `Standard_D2s_v3` | Default VM size |
| `includeDiagnostics` | boolean | `true` | Include boot diagnostics |
| `includePublicIp` | boolean | `true` | Create public IP address |
| `includeNsg` | boolean | `true` | Create Network Security Group |

## Handlebars Helpers

### `vmSize`
Formats VM size with description.

```handlebars
{{vmSize "Standard_D2s_v3"}}
```

### `vmImage`
Gets VM image reference.

```handlebars
{{vmImage "Ubuntu" "22.04-LTS"}}
```

## Templates

Generates the following ARM templates:
- `mainTemplate.json` - Main VM deployment
- `createUiDefinition.json` - Portal UI
- `viewDefinition.json` - Managed app view
- Nested templates:
  - `virtualMachine.json`
  - `networkInterface.json`
  - `networkSecurityGroup.json`
  - `publicIpAddress.json`
  - `virtualNetwork.json`

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm.git
cd azmp-plugin-vm

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run watch
```

### Testing with Generator Locally

In your `azmp-config.json`:

```json
{
  "plugins": [
    {
      "package": "../azmp-plugin-vm",
      "enabled": true
    }
  ]
}
```

## Requirements

- Azure Marketplace Generator >= 3.1.0
- Node.js >= 18.0.0

## License

MIT

## Author

HOME OFFICE IMPROVEMENTS LTD

## Repository

https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm
