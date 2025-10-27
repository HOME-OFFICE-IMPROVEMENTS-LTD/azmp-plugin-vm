/**
 * Tests for VM Plugin
 */

import { VmPlugin } from '../index';
import { PluginContext } from '../types';

describe('VmPlugin', () => {
  let plugin: VmPlugin;
  let mockContext: PluginContext;

  beforeEach(() => {
    mockContext = {
      generatorVersion: '3.1.0',
      templatesDir: './templates',
      outputDir: './output',
      config: {},
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      }
    };

    plugin = new VmPlugin();
  });

  describe('Metadata', () => {
    test('should have correct metadata', () => {
      expect(plugin.metadata.id).toBe('vm');
      expect(plugin.metadata.name).toBe('Virtual Machine Plugin');
      expect(plugin.metadata.version).toBe('1.8.2');
    });
  });

  describe('Initialization', () => {
    it('should initialize with context', async () => {
      await plugin.initialize(mockContext);
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Initializing VM Plugin')
      );
    });

    it('should apply default options', () => {
      const templates = plugin.getTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].type).toBe('vm');
    });

    it('should accept custom options', () => {
      const customPlugin = new VmPlugin({
        defaultVmSize: 'Standard_D4s_v3',
        includeDiagnostics: false
      });
      
      const templates = customPlugin.getTemplates();
      expect(templates[0].parameters?.vmSize.defaultValue).toBe('Standard_D4s_v3');
    });
  });

  describe('Templates', () => {
    it('should provide VM template definition', () => {
      const templates = plugin.getTemplates();
      
      expect(templates).toHaveLength(1);
      expect(templates[0]).toMatchObject({
        type: 'vm',
        name: 'Virtual Machine',
        version: '1.8.2'
      });
    });

    it('should include template files', () => {
      const templates = plugin.getTemplates();
      const vmTemplate = templates[0];
      
      expect(vmTemplate.files).toBeDefined();
      expect(vmTemplate.files?.mainTemplate).toBe('mainTemplate.json.hbs');
      expect(vmTemplate.files?.createUiDefinition).toBe('createUiDefinition.json.hbs');
    });

    it('should define VM parameters', () => {
      const templates = plugin.getTemplates();
      const vmTemplate = templates[0];
      
      expect(vmTemplate.parameters).toBeDefined();
      expect(vmTemplate.parameters?.vmSize).toBeDefined();
      expect(vmTemplate.parameters?.adminUsername).toBeDefined();
      expect(vmTemplate.parameters?.authenticationType).toBeDefined();
    });
  });

  describe('Handlebars Helpers', () => {
    let helpers: Record<string, (...args: any[]) => any>;

    beforeEach(() => {
      helpers = plugin.getHandlebarsHelpers();
    });

    it('should provide vm-size helper', () => {
      expect(helpers['vm-size']).toBeDefined();
      expect(typeof helpers['vm-size']).toBe('function');
    });

    it('should format VM size with description', () => {
      const result = helpers['vm-size']('Standard_D2s_v3');
      expect(result).toContain('2 vCPUs');
      expect(result).toContain('8 GB RAM');
    });

    it('should provide vm-image helper', () => {
      expect(helpers['vm-image']).toBeDefined();
      const result = helpers['vm-image']('Canonical', 'UbuntuServer', '22.04-LTS');
      const parsed = JSON.parse(result);
      
      expect(parsed.publisher).toBe('Canonical');
      expect(parsed.offer).toBe('UbuntuServer');
      expect(parsed.sku).toBe('22.04-LTS');
      expect(parsed.version).toBe('latest');
    });

    it('should provide vm-resource-name helper', () => {
      expect(helpers['vm-resource-name']).toBeDefined();
      const result = helpers['vm-resource-name']('MyVM', 'NIC');
      expect(result).toBe('myvm-nic');
    });

    it('should sanitize resource names', () => {
      const result = helpers['vm-resource-name']('My VM!', 'Public_IP');
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe('CLI Commands', () => {
    it('should register vm command group', () => {
      const mockSubCommand = {
        command: jest.fn().mockReturnThis(),
        description: jest.fn().mockReturnThis(),
        option: jest.fn().mockReturnThis(),
        requiredOption: jest.fn().mockReturnThis(),
        action: jest.fn().mockReturnThis()
      };

      const mockProgram = {
        command: jest.fn().mockReturnValue(mockSubCommand),
        description: jest.fn().mockReturnThis(),
        option: jest.fn().mockReturnThis(),
        requiredOption: jest.fn().mockReturnThis(),
        action: jest.fn().mockReturnThis()
      };

      plugin.registerCommands(mockProgram as any);
      
      expect(mockProgram.command).toHaveBeenCalledWith('vm');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await plugin.initialize(mockContext);
      await plugin.cleanup();
      
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cleaning up')
      );
    });
  });
});
