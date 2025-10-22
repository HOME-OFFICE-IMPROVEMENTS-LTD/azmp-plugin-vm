# Getting Started with Plugin Development

This guide walks you through the local development setup for testing your VM plugin with the Azure Marketplace Generator.

## 📁 Project Structure

```
~/Projects/
├── azure-marketplace-generator/     # Main generator (core)
└── azmp-plugin-vm/                  # VM plugin (this repo)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# In the plugin directory
cd ~/Projects/azmp-plugin-vm
npm install

# In the generator directory  
cd ~/Projects/azure-marketplace-generator
npm install
```

### 2. Build the Plugin

```bash
cd ~/Projects/azmp-plugin-vm
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 3. Configure Generator to Use Local Plugin

Create or update `~/Projects/azure-marketplace-generator/azmp-config.json`:

```json
{
  "plugins": [
    {
      "package": "../azmp-plugin-vm",
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

**Note:** The relative path `../azmp-plugin-vm` works because both projects are in `~/Projects/`.

### 4. Test the Plugin

```bash
cd ~/Projects/azure-marketplace-generator

# Check if plugin is loaded
npm start -- --help

# You should see the 'vm' command group!

# Test VM commands
npm start -- vm list-sizes --location eastus
npm start -- vm list-images --publisher Canonical

# Create a VM offer (when template is complete)
npm start -- create vm --name myvm --location eastus
```

## 🔄 Development Workflow

### Watch Mode for Active Development

Terminal 1 - Plugin (watch mode):
```bash
cd ~/Projects/azmp-plugin-vm
npm run watch
```

Terminal 2 - Generator (test commands):
```bash
cd ~/Projects/azure-marketplace-generator
npm start -- vm list-sizes
```

Changes to the plugin will be automatically compiled!

### Running Tests

```bash
# Plugin tests
cd ~/Projects/azmp-plugin-vm
npm test

# Generator tests (including plugin loading)
cd ~/Projects/azure-marketplace-generator
npm test
```

## 📝 VS Code Multi-Root Workspace

Open the workspace file to see both projects in one VS Code window:

```bash
code ~/Projects/azure-marketplace-generator/azmp-workspace.code-workspace
```

This gives you:
- Side-by-side project navigation
- Integrated terminals for both projects
- Search across both codebases
- Unified debugging

## 🧪 Testing Plugin Loading

### Verify Plugin is Loaded

```bash
cd ~/Projects/azure-marketplace-generator
npm start -- --help
```

You should see:
```
Commands:
  create [options]      Create Azure Marketplace package
  package [options]     Package existing templates
  validate [options]    Validate ARM templates
  vm                    Virtual Machine commands    <-- Your plugin!
```

### Test Handlebars Helpers

The helpers are automatically available in templates:

```handlebars
{{vm-size "Standard_D2s_v3"}}
{{vm-image "Canonical" "UbuntuServer" "22.04-LTS"}}
{{vm-resource-name "myvm" "nic"}}
```

## 🔍 Debugging

### Debug Plugin Initialization

Add debug logging to your plugin:

```typescript
async initialize(context: PluginContext): Promise<void> {
  context.logger.debug('VM Plugin initializing with options:', this.options);
  // Your code...
}
```

Run generator with verbose mode:

```bash
cd ~/Projects/azure-marketplace-generator
npm start -- create vm --name test --verbose
```

### Common Issues

**Issue:** "Plugin not found"
- **Solution:** Ensure plugin is built (`npm run build` in plugin dir)
- **Solution:** Check relative path in config is correct

**Issue:** "Module not found: commander"
- **Solution:** Install dependencies in plugin: `npm install`

**Issue:** "Helper not registered"
- **Solution:** Check helper names match pattern `^[a-zA-Z0-9_-]+$`
- **Solution:** Rebuild plugin after changes

## 📦 Publishing Workflow (Future)

When ready to publish to npm:

```bash
cd ~/Projects/azmp-plugin-vm

# Update version
npm version patch  # or minor, or major

# Build and test
npm run build
npm test

# Publish to npm (when ready)
npm publish --access public
```

Then users can install with:

```bash
npm install @hoiltd/azmp-plugin-vm
```

And use in config:

```json
{
  "plugins": [
    {
      "package": "@hoiltd/azmp-plugin-vm",  // npm package instead of path
      "enabled": true
    }
  ]
}
```

## 🎯 Next Steps

1. **Complete the VM template** - Add createUiDefinition.json.hbs
2. **Add more helpers** - VM image helpers, disk configuration
3. **Enhance CLI commands** - Add actual Azure SDK integration
4. **Write comprehensive tests** - Test template generation
5. **Add documentation** - JSDoc comments, usage examples

## 📚 Resources

- [Azure Marketplace Generator Docs](../azure-marketplace-generator/docs/)
- [Plugin Architecture](../azure-marketplace-generator/docs/PLUGIN_ARCHITECTURE.md)
- [ARM Template Reference](https://docs.microsoft.com/azure/templates/)
- [Handlebars Documentation](https://handlebarsjs.com/)

## 💡 Tips

- Use `npm run watch` in plugin for faster development
- Test with `../path` first, publish to npm later
- Keep plugin focused on one resource type
- Follow the IPlugin interface exactly
- Use the provided logger for consistent output
- Security: Path traversal protection is built-in!

---

Happy Plugin Development! 🚀
