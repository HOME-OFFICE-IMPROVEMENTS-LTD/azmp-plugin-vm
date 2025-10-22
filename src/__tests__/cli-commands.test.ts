/**
 * CLI Commands Test Suite
 * 
 * Tests CLI command registration for VM and networking operations
 */

import { VmPlugin } from '../index';
import { Command } from 'commander';
import { PluginContext } from '../types';

describe('VmPlugin CLI Commands', () => {
  let plugin: VmPlugin;
  let program: Command;
  let mockContext: PluginContext;

  beforeEach(() => {
    plugin = new VmPlugin();
    program = new Command();
    
    // Mock context with logger
    mockContext = {
      generatorVersion: '1.0.0',
      templatesDir: '/test/templates',
      outputDir: '/test/output',
      config: {},
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      }
    };

    // Initialize plugin with mock context
    plugin.initialize(mockContext);
    
    // Register commands
    plugin.registerCommands(program);
  });

  describe('Command Registration', () => {
    it('should register vm command', () => {
      const vmCommand = program.commands.find(cmd => cmd.name() === 'vm');
      expect(vmCommand).toBeDefined();
      expect(vmCommand?.description()).toBe('Virtual Machine commands');
    });

    it('should register network command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      expect(networkCommand).toBeDefined();
      expect(networkCommand?.description()).toContain('Networking commands');
    });
  });

  describe('VM Commands', () => {
    it('should register vm list-sizes subcommand', () => {
      const vmCommand = program.commands.find(cmd => cmd.name() === 'vm');
      const listSizesCommand = vmCommand?.commands.find(cmd => cmd.name() === 'list-sizes');
      
      expect(listSizesCommand).toBeDefined();
      expect(listSizesCommand?.description()).toBe('List available VM sizes for a location');
    });

    it('should register vm list-images subcommand', () => {
      const vmCommand = program.commands.find(cmd => cmd.name() === 'vm');
      const listImagesCommand = vmCommand?.commands.find(cmd => cmd.name() === 'list-images');
      
      expect(listImagesCommand).toBeDefined();
      expect(listImagesCommand?.description()).toBe('List available VM images');
    });
  });

  describe('Networking Commands - VNet', () => {
    it('should register network vnet subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const vnetCommand = networkCommand?.commands.find(cmd => cmd.name() === 'vnet');
      
      expect(vnetCommand).toBeDefined();
      expect(vnetCommand?.description()).toBe('Virtual Network operations');
    });

    it('should register vnet list-templates command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const vnetCommand = networkCommand?.commands.find(cmd => cmd.name() === 'vnet');
      const listTemplatesCommand = vnetCommand?.commands.find(cmd => cmd.name() === 'list-templates');
      
      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe('List available VNet template types');
    });

    it('should register vnet create-template command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const vnetCommand = networkCommand?.commands.find(cmd => cmd.name() === 'vnet');
      const createTemplateCommand = vnetCommand?.commands.find(cmd => cmd.name() === 'create-template');
      
      expect(createTemplateCommand).toBeDefined();
      expect(createTemplateCommand?.description()).toBe('Generate VNet ARM template configuration');
    });
  });

  describe('Networking Commands - Subnet', () => {
    it('should register network subnet subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const subnetCommand = networkCommand?.commands.find(cmd => cmd.name() === 'subnet');
      
      expect(subnetCommand).toBeDefined();
      expect(subnetCommand?.description()).toBe('Subnet operations');
    });

    it('should register subnet list-templates command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const subnetCommand = networkCommand?.commands.find(cmd => cmd.name() === 'subnet');
      const listTemplatesCommand = subnetCommand?.commands.find(cmd => cmd.name() === 'list-templates');
      
      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe('List available subnet template types');
    });
  });

  describe('Networking Commands - NSG', () => {
    it('should register network nsg subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const nsgCommand = networkCommand?.commands.find(cmd => cmd.name() === 'nsg');
      
      expect(nsgCommand).toBeDefined();
      expect(nsgCommand?.description()).toBe('Network Security Group operations');
    });

    it('should register nsg list-templates command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const nsgCommand = networkCommand?.commands.find(cmd => cmd.name() === 'nsg');
      const listTemplatesCommand = nsgCommand?.commands.find(cmd => cmd.name() === 'list-templates');
      
      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe('List available NSG rule templates');
    });

    it('should register nsg create-rule command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const nsgCommand = networkCommand?.commands.find(cmd => cmd.name() === 'nsg');
      const createRuleCommand = nsgCommand?.commands.find(cmd => cmd.name() === 'create-rule');
      
      expect(createRuleCommand).toBeDefined();
      expect(createRuleCommand?.description()).toBe('Generate NSG rule configuration');
    });
  });

  describe('Networking Commands - Load Balancer', () => {
    it('should register network lb subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const lbCommand = networkCommand?.commands.find(cmd => cmd.name() === 'lb');
      
      expect(lbCommand).toBeDefined();
      expect(lbCommand?.description()).toBe('Load Balancer operations');
    });

    it('should register lb list-templates command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const lbCommand = networkCommand?.commands.find(cmd => cmd.name() === 'lb');
      const listTemplatesCommand = lbCommand?.commands.find(cmd => cmd.name() === 'list-templates');
      
      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe('List available load balancer template types');
    });
  });

  describe('Networking Commands - Application Gateway', () => {
    it('should register network appgw subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const appgwCommand = networkCommand?.commands.find(cmd => cmd.name() === 'appgw');
      
      expect(appgwCommand).toBeDefined();
      expect(appgwCommand?.description()).toBe('Application Gateway operations');
    });

    it('should register appgw list-templates command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const appgwCommand = networkCommand?.commands.find(cmd => cmd.name() === 'appgw');
      const listTemplatesCommand = appgwCommand?.commands.find(cmd => cmd.name() === 'list-templates');
      
      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe('List available Application Gateway template types');
    });
  });

  describe('Networking Commands - Bastion', () => {
    it('should register network bastion subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const bastionCommand = networkCommand?.commands.find(cmd => cmd.name() === 'bastion');
      
      expect(bastionCommand).toBeDefined();
      expect(bastionCommand?.description()).toBe('Azure Bastion operations');
    });

    it('should register bastion list-skus command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const bastionCommand = networkCommand?.commands.find(cmd => cmd.name() === 'bastion');
      const listSkusCommand = bastionCommand?.commands.find(cmd => cmd.name() === 'list-skus');
      
      expect(listSkusCommand).toBeDefined();
      expect(listSkusCommand?.description()).toBe('List available Bastion SKUs');
    });
  });

  describe('Networking Commands - Peering', () => {
    it('should register network peering subcommand', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const peeringCommand = networkCommand?.commands.find(cmd => cmd.name() === 'peering');
      
      expect(peeringCommand).toBeDefined();
      expect(peeringCommand?.description()).toBe('VNet Peering operations');
    });

    it('should register peering list-topologies command', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      const peeringCommand = networkCommand?.commands.find(cmd => cmd.name() === 'peering');
      const listTopologiesCommand = peeringCommand?.commands.find(cmd => cmd.name() === 'list-topologies');
      
      expect(listTopologiesCommand).toBeDefined();
      expect(listTopologiesCommand?.description()).toBe('List available peering topology templates');
    });
  });

  describe('Command Count', () => {
    it('should have comprehensive command coverage', () => {
      const networkCommand = program.commands.find(cmd => cmd.name() === 'network');
      
      // Should have all 7 networking subcommand groups
      expect(networkCommand?.commands.length).toBeGreaterThanOrEqual(7);
      
      const commandNames = networkCommand?.commands.map(cmd => cmd.name()) || [];
      expect(commandNames).toContain('vnet');
      expect(commandNames).toContain('subnet');
      expect(commandNames).toContain('nsg');
      expect(commandNames).toContain('lb');
      expect(commandNames).toContain('appgw');
      expect(commandNames).toContain('bastion');
      expect(commandNames).toContain('peering');
    });
  });
});
