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
      expect(plugin.metadata.version).toBe('1.2.0'); // Phase 2
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

  // ========================================
  // Phase 2: VNet & Subnet Tests
  // ========================================

  describe('Phase 2: VNet Helpers', () => {
    it('should provide vnet-calculate-ips helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('vnet-calculate-ips');

      const result = helpers['vnet-calculate-ips']('10.0.0.0/24');
      expect(result).toBe(251); // /24 = 256 - 5 (Azure reserves 5 IPs: network, gateway, 2 DNS, broadcast)
    });

    it('should calculate IPs for various CIDR blocks (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['vnet-calculate-ips']('10.0.0.0/16')).toBe(65531); // /16 - 5
      expect(helpers['vnet-calculate-ips']('10.0.0.0/27')).toBe(27);    // /27 - 5
      expect(helpers['vnet-calculate-ips']('10.0.0.0/28')).toBe(11);    // /28 - 5
    });

    it('should provide vnet-validate-cidr helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('vnet-validate-cidr');

      expect(helpers['vnet-validate-cidr']('10.0.0.0/24')).toBe(true);
      expect(helpers['vnet-validate-cidr']('192.168.1.0/16')).toBe(true);
      expect(helpers['vnet-validate-cidr']('invalid-cidr')).toBe(false);
    });

    it('should provide vnet-ip-in-cidr helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('vnet-ip-in-cidr');

      expect(helpers['vnet-ip-in-cidr']('10.0.0.5', '10.0.0.0/24')).toBe(true);
      expect(helpers['vnet-ip-in-cidr']('10.0.1.5', '10.0.0.0/24')).toBe(false);
    });

    it('should provide vnet-template helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('vnet-template');

      const result = helpers['vnet-template']('small');
      expect(result).toContain('vnet-small');
      expect(result).toContain('10.0.0.0/24');
    });

    it('should provide vnet-template-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['vnet-template-name']('small')).toBe('vnet-small');
      expect(helpers['vnet-template-name']('medium')).toBe('vnet-medium');
      expect(helpers['vnet-template-name']('large')).toBe('vnet-large');
    });

    it('should provide vnet-subnet-count helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['vnet-subnet-count']('small')).toBeGreaterThan(0);
      expect(helpers['vnet-subnet-count']('medium')).toBeGreaterThan(0);
    });

    it('should provide vnet-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['vnet-name']('MyApp')).toBe('vnet-myapp');
      expect(helpers['vnet-name']('Test_Service')).toBe('vnet-test-service');
    });
  });

  describe('Phase 2: Subnet Helpers', () => {
    it('should provide subnet-pattern helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('subnet-pattern');

      const result = helpers['subnet-pattern']('web');
      expect(result).toContain('web');
      expect(result).toContain('10.0.1.0/24');
    });

    it('should provide subnet-pattern-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-pattern-name']('web')).toBe('web');
      expect(helpers['subnet-pattern-name']('app')).toBe('app');
      expect(helpers['subnet-pattern-name']('data')).toBe('data');
    });

    it('should provide subnet-validate-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-validate-name']('my-subnet')).toBe(true);
      expect(helpers['subnet-validate-name']('subnet_123')).toBe(true);
      expect(helpers['subnet-validate-name']('.invalid')).toBe(false);
    });

    it('should provide subnet-is-reserved helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-is-reserved']('AzureBastionSubnet')).toBe(true);
      expect(helpers['subnet-is-reserved']('GatewaySubnet')).toBe(true);
      expect(helpers['subnet-is-reserved']('my-subnet')).toBe(false);
    });

    it('should provide subnet-reserved-min-prefix helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-reserved-min-prefix']('AzureBastionSubnet')).toBe(27);
      expect(helpers['subnet-reserved-min-prefix']('GatewaySubnet')).toBe(27);
      expect(helpers['subnet-reserved-min-prefix']('AzureFirewallSubnet')).toBe(26);
    });

    it('should provide subnet-overlaps helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-overlaps']('10.0.0.0/24', '10.0.1.0/24')).toBe(false);
      expect(helpers['subnet-overlaps']('10.0.0.0/24', '10.0.0.0/25')).toBe(true);
    });

    it('should provide subnet-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['subnet-name']('vnet-myapp', 'web')).toBe('vnet-myapp-subnet-web');
      expect(helpers['subnet-name']('vnet-test', 'app')).toBe('vnet-test-subnet-app');
    });

    it('should provide subnet-address-prefix helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      const result = helpers['subnet-address-prefix']('10.0.0.0/24');
      expect(result).toContain('10.0.0.0/24');
      expect(result).toContain('251'); // Azure reserves 5 IPs
    });
  });

  describe('Phase 2: NSG Helpers', () => {
    it('should provide nsg-rule helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers).toHaveProperty('nsg-rule');

      const result = helpers['nsg-rule']('allow-http');
      expect(result).toContain('Allow-HTTP');
      expect(result).toContain('80');
    });

    it('should provide nsg-rule-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-rule-name']('allow-http')).toBe('Allow-HTTP');
      expect(helpers['nsg-rule-name']('allow-https')).toBe('Allow-HTTPS');
      expect(helpers['nsg-rule-name']('allow-ssh')).toBe('Allow-SSH');
    });

    it('should provide nsg-rule-priority helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-rule-priority']('allow-http')).toBe(100);
      expect(helpers['nsg-rule-priority']('allow-https')).toBe(110);
      expect(helpers['nsg-rule-priority']('allow-ssh')).toBe(200);
    });

    it('should provide nsg-rule-direction helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-rule-direction']('allow-http')).toBe('Inbound');
      expect(helpers['nsg-rule-direction']('allow-smtp')).toBe('Outbound');
    });

    it('should provide nsg-rule-port helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-rule-port']('allow-http')).toBe('80');
      expect(helpers['nsg-rule-port']('allow-https')).toBe('443');
      expect(helpers['nsg-rule-port']('allow-ssh')).toBe('22');
    });

    it('should provide nsg-rule-protocol helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-rule-protocol']('allow-http')).toBe('Tcp');
      expect(helpers['nsg-rule-protocol']('allow-dns')).toBe('*');
    });

    it('should validate NSG priority (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-validate-priority'](100)).toBe(true);
      expect(helpers['nsg-validate-priority'](4096)).toBe(true);
      expect(helpers['nsg-validate-priority'](50)).toBe(false);
      expect(helpers['nsg-validate-priority'](5000)).toBe(false);
    });

    it('should validate port range (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-validate-port']('*')).toBe(true);
      expect(helpers['nsg-validate-port']('80')).toBe(true);
      expect(helpers['nsg-validate-port']('80-443')).toBe(true);
      expect(helpers['nsg-validate-port']('invalid')).toBe(false);
    });

    it('should provide nsg-template helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      const result = helpers['nsg-template']('web-server');
      expect(result).toContain('Web Server');
      expect(result).toContain('allow-http');
      expect(result).toContain('allow-https');
    });

    it('should provide nsg-template-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-template-name']('web-server')).toBe('Web Server');
      expect(helpers['nsg-template-name']('database-server')).toBe('Database Server');
    });

    it('should provide nsg-template-rule-count helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-template-rule-count']('web-server')).toBe(2); // HTTP + HTTPS
      expect(helpers['nsg-template-rule-count']('database-server')).toBe(3); // SQL + MySQL + PostgreSQL
    });

    it('should provide nsg-service-tag helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      const result = helpers['nsg-service-tag']('Internet');
      expect(result).toContain('Internet');
      expect(result).toContain('public internet');
    });

    it('should provide nsg-name helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      expect(helpers['nsg-name']('myapp')).toBe('nsg-myapp');
      expect(helpers['nsg-name']('test-web')).toBe('nsg-test-web');
    });

    it('should provide nsg-rule-summary helper (Phase 2)', () => {
      const helpers = plugin.getHandlebarsHelpers();
      const result = helpers['nsg-rule-summary']('allow-http');
      expect(result).toContain('Inbound');
      expect(result).toContain('Allow');
      expect(result).toContain('Tcp');
      expect(result).toContain('80');
      expect(result).toContain('100'); // Priority
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
