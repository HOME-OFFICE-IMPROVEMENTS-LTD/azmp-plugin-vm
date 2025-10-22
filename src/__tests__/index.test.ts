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
    it('should have correct metadata', () => {
      expect(plugin.metadata.id).toBe('vm');
      expect(plugin.metadata.name).toBe('Virtual Machine Plugin');
      expect(plugin.metadata.version).toBe('1.1.0');
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
        version: '1.0.0'
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

    it('should format VM size with full details (Phase 1)', () => {
      const result = helpers['vm-size']('Standard_D2s_v3');
      expect(result).toContain('Standard_D2s_v3');
      expect(result).toContain('2');
      expect(result).toContain('8 GiB');
    });

    it('should provide vm-size-family helper (Phase 1)', () => {
      expect(helpers['vm-size-family']).toBeDefined();
      const result = helpers['vm-size-family']('general-purpose');
      expect(result).toBe('General Purpose');
    });

    it('should provide vm-size-workloads helper (Phase 1)', () => {
      expect(helpers['vm-size-workloads']).toBeDefined();
      const result = helpers['vm-size-workloads']('Standard_D2s_v3');
      expect(result).toContain('General-purpose computing');
    });

    it('should provide vm-image helper with image key (Phase 1)', () => {
      expect(helpers['vm-image']).toBeDefined();
      const result = helpers['vm-image']('ubuntu-22.04');
      const parsed = JSON.parse(result);
      
      expect(parsed.publisher).toBe('Canonical');
      expect(parsed.offer).toContain('ubuntu');
      expect(parsed.version).toBe('latest');
    });

    it('should provide vm-image-publisher helper (Phase 1)', () => {
      expect(helpers['vm-image-publisher']).toBeDefined();
      const result = helpers['vm-image-publisher']('windows-2022');
      expect(result).toBe('MicrosoftWindowsServer');
    });

    it('should provide vm-image-os helper (Phase 1)', () => {
      expect(helpers['vm-image-os']).toBeDefined();
      const windowsOs = helpers['vm-image-os']('windows-2022');
      const linuxOs = helpers['vm-image-os']('ubuntu-22.04');
      expect(windowsOs).toBe('Windows');
      expect(linuxOs).toBe('Linux');
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

    it('should provide vm-storage-name helper (Phase 1)', () => {
      expect(helpers['vm-storage-name']).toBeDefined();
      const result = helpers['vm-storage-name']('My-Storage-Account-Name');
      expect(result).toMatch(/^[a-z0-9]+$/);
      expect(result.length).toBeLessThanOrEqual(24);
    });

    it('should provide vm-nic-name helper (Phase 1)', () => {
      expect(helpers['vm-nic-name']).toBeDefined();
      const result = helpers['vm-nic-name']('myvm');
      expect(result).toBe('myvm-nic');
    });

    it('should provide vm-pip-name helper (Phase 1)', () => {
      expect(helpers['vm-pip-name']).toBeDefined();
      const result = helpers['vm-pip-name']('myvm');
      expect(result).toBe('myvm-pip');
    });

    it('should provide vm-nsg-name helper (Phase 1)', () => {
      expect(helpers['vm-nsg-name']).toBeDefined();
      const result = helpers['vm-nsg-name']('myvm');
      expect(result).toBe('myvm-nsg');
    });

    it('should provide vm-storage-type helper (Phase 1)', () => {
      expect(helpers['vm-storage-type']).toBeDefined();
      const result = helpers['vm-storage-type']('Premium_LRS');
      expect(result).toContain('Premium');
      expect(result).toContain('SSD');
    });

    it('should provide vm-supports-premium helper (Phase 1)', () => {
      expect(helpers['vm-supports-premium']).toBeDefined();
      expect(helpers['vm-supports-premium']('Standard_D2s_v3')).toBe(true);
      expect(helpers['vm-supports-premium']('Standard_D2_v3')).toBe(false);
    });
  });

  describe('CLI Commands', () => {
    it('should register vm command group', () => {
      const mockProgram = {
        command: jest.fn().mockReturnThis(),
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
