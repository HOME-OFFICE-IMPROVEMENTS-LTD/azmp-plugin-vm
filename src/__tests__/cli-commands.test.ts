/**
 * CLI Commands Test Suite
 *
 * Tests CLI command registration for VM and networking operations
 */

import { VmPlugin } from "../index";
import { Command } from "commander";
import { PluginContext } from "../types";

describe("VmPlugin CLI Commands", () => {
  let plugin: VmPlugin;
  let program: Command;
  let mockContext: PluginContext;

  beforeEach(() => {
    plugin = new VmPlugin();
    program = new Command();

    // Mock context with logger
    mockContext = {
      generatorVersion: "1.0.0",
      templatesDir: "/test/templates",
      outputDir: "/test/output",
      config: {},
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    };

    // Initialize plugin with mock context
    plugin.initialize(mockContext);

    // Register commands
    plugin.registerCommands(program);
  });

  describe("Command Registration", () => {
    it("should register vm command", () => {
      const vmCommand = program.commands.find((cmd) => cmd.name() === "vm");
      expect(vmCommand).toBeDefined();
      expect(vmCommand?.description()).toBe("Virtual Machine commands");
    });

    it("should register vnet command (top-level)", () => {
      const vnetCommand = program.commands.find((cmd) => cmd.name() === "vnet");
      expect(vnetCommand).toBeDefined();
      expect(vnetCommand?.description()).toBe("Virtual Network operations");
    });

    it("should register subnet command (top-level)", () => {
      const subnetCommand = program.commands.find(
        (cmd) => cmd.name() === "subnet",
      );
      expect(subnetCommand).toBeDefined();
      expect(subnetCommand?.description()).toBe("Subnet operations");
    });

    it("should register nsg command (top-level)", () => {
      const nsgCommand = program.commands.find((cmd) => cmd.name() === "nsg");
      expect(nsgCommand).toBeDefined();
      expect(nsgCommand?.description()).toBe(
        "Network Security Group operations",
      );
    });

    it("should register lb command (top-level)", () => {
      const lbCommand = program.commands.find((cmd) => cmd.name() === "lb");
      expect(lbCommand).toBeDefined();
      expect(lbCommand?.description()).toBe("Load Balancer operations");
    });

    it("should register appgw command (top-level)", () => {
      const appgwCommand = program.commands.find(
        (cmd) => cmd.name() === "appgw",
      );
      expect(appgwCommand).toBeDefined();
      expect(appgwCommand?.description()).toBe(
        "Application Gateway operations",
      );
    });

    it("should register bastion command (top-level)", () => {
      const bastionCommand = program.commands.find(
        (cmd) => cmd.name() === "bastion",
      );
      expect(bastionCommand).toBeDefined();
      expect(bastionCommand?.description()).toBe("Azure Bastion operations");
    });

    it("should register peering command (top-level)", () => {
      const peeringCommand = program.commands.find(
        (cmd) => cmd.name() === "peering",
      );
      expect(peeringCommand).toBeDefined();
      expect(peeringCommand?.description()).toBe("VNet Peering operations");
    });
  });

  describe("VM Commands", () => {
    it("should register vm list-sizes subcommand", () => {
      const vmCommand = program.commands.find((cmd) => cmd.name() === "vm");
      const listSizesCommand = vmCommand?.commands.find(
        (cmd) => cmd.name() === "list-sizes",
      );

      expect(listSizesCommand).toBeDefined();
      expect(listSizesCommand?.description()).toBe(
        "List available VM sizes for a location (requires Azure credentials)",
      );
    });

    it("should register vm list-images subcommand", () => {
      const vmCommand = program.commands.find((cmd) => cmd.name() === "vm");
      const listImagesCommand = vmCommand?.commands.find(
        (cmd) => cmd.name() === "list-images",
      );

      expect(listImagesCommand).toBeDefined();
      expect(listImagesCommand?.description()).toBe(
        "List popular VM images for a location (requires Azure credentials)",
      );
    });

    it("should register vm validate-credentials subcommand", () => {
      const vmCommand = program.commands.find((cmd) => cmd.name() === "vm");
      const validateCommand = vmCommand?.commands.find(
        (cmd) => cmd.name() === "validate-credentials",
      );

      expect(validateCommand).toBeDefined();
      expect(validateCommand?.description()).toBe(
        "Validate Azure credentials and subscription access",
      );
    });
  });

  describe("Networking Commands - VNet", () => {
    it("should register vnet command at top level", () => {
      const vnetCommand = program.commands.find((cmd) => cmd.name() === "vnet");

      expect(vnetCommand).toBeDefined();
      expect(vnetCommand?.description()).toBe("Virtual Network operations");
    });

    it("should register vnet list-templates command", () => {
      const vnetCommand = program.commands.find((cmd) => cmd.name() === "vnet");
      const listTemplatesCommand = vnetCommand?.commands.find(
        (cmd) => cmd.name() === "list-templates",
      );

      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe(
        "List available VNet template types",
      );
    });

    it("should register vnet create-template command", () => {
      const vnetCommand = program.commands.find((cmd) => cmd.name() === "vnet");
      const createTemplateCommand = vnetCommand?.commands.find(
        (cmd) => cmd.name() === "create-template",
      );

      expect(createTemplateCommand).toBeDefined();
      expect(createTemplateCommand?.description()).toBe(
        "Generate VNet ARM template configuration",
      );
    });
  });

  describe("Networking Commands - Subnet", () => {
    it("should register subnet command at top level", () => {
      const subnetCommand = program.commands.find(
        (cmd) => cmd.name() === "subnet",
      );

      expect(subnetCommand).toBeDefined();
      expect(subnetCommand?.description()).toBe("Subnet operations");
    });

    it("should register subnet list-templates command", () => {
      const subnetCommand = program.commands.find(
        (cmd) => cmd.name() === "subnet",
      );
      const listTemplatesCommand = subnetCommand?.commands.find(
        (cmd) => cmd.name() === "list-templates",
      );

      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe(
        "List available subnet template types",
      );
    });
  });

  describe("Networking Commands - NSG", () => {
    it("should register nsg command at top level", () => {
      const nsgCommand = program.commands.find((cmd) => cmd.name() === "nsg");

      expect(nsgCommand).toBeDefined();
      expect(nsgCommand?.description()).toBe(
        "Network Security Group operations",
      );
    });

    it("should register nsg list-templates command", () => {
      const nsgCommand = program.commands.find((cmd) => cmd.name() === "nsg");
      const listTemplatesCommand = nsgCommand?.commands.find(
        (cmd) => cmd.name() === "list-templates",
      );

      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe(
        "List available NSG rule templates",
      );
    });

    it("should register nsg create-rule command", () => {
      const nsgCommand = program.commands.find((cmd) => cmd.name() === "nsg");
      const createRuleCommand = nsgCommand?.commands.find(
        (cmd) => cmd.name() === "create-rule",
      );

      expect(createRuleCommand).toBeDefined();
      expect(createRuleCommand?.description()).toBe(
        "Generate NSG rule configuration",
      );
    });
  });

  describe("Networking Commands - Load Balancer", () => {
    it("should register lb command at top level", () => {
      const lbCommand = program.commands.find((cmd) => cmd.name() === "lb");

      expect(lbCommand).toBeDefined();
      expect(lbCommand?.description()).toBe("Load Balancer operations");
    });

    it("should register lb list-templates command", () => {
      const lbCommand = program.commands.find((cmd) => cmd.name() === "lb");
      const listTemplatesCommand = lbCommand?.commands.find(
        (cmd) => cmd.name() === "list-templates",
      );

      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe(
        "List available load balancer template types",
      );
    });
  });

  describe("Networking Commands - Application Gateway", () => {
    it("should register appgw command at top level", () => {
      const appgwCommand = program.commands.find(
        (cmd) => cmd.name() === "appgw",
      );

      expect(appgwCommand).toBeDefined();
      expect(appgwCommand?.description()).toBe(
        "Application Gateway operations",
      );
    });

    it("should register appgw list-templates command", () => {
      const appgwCommand = program.commands.find(
        (cmd) => cmd.name() === "appgw",
      );
      const listTemplatesCommand = appgwCommand?.commands.find(
        (cmd) => cmd.name() === "list-templates",
      );

      expect(listTemplatesCommand).toBeDefined();
      expect(listTemplatesCommand?.description()).toBe(
        "List available Application Gateway template types",
      );
    });
  });

  describe("Networking Commands - Bastion", () => {
    it("should register bastion command at top level", () => {
      const bastionCommand = program.commands.find(
        (cmd) => cmd.name() === "bastion",
      );

      expect(bastionCommand).toBeDefined();
      expect(bastionCommand?.description()).toBe("Azure Bastion operations");
    });

    it("should register bastion list-skus command", () => {
      const bastionCommand = program.commands.find(
        (cmd) => cmd.name() === "bastion",
      );
      const listSkusCommand = bastionCommand?.commands.find(
        (cmd) => cmd.name() === "list-skus",
      );

      expect(listSkusCommand).toBeDefined();
      expect(listSkusCommand?.description()).toBe(
        "List available Bastion SKUs",
      );
    });
  });

  describe("Networking Commands - Peering", () => {
    it("should register peering command at top level", () => {
      const peeringCommand = program.commands.find(
        (cmd) => cmd.name() === "peering",
      );

      expect(peeringCommand).toBeDefined();
      expect(peeringCommand?.description()).toBe("VNet Peering operations");
    });

    it("should register peering list-topologies command", () => {
      const peeringCommand = program.commands.find(
        (cmd) => cmd.name() === "peering",
      );
      const listTopologiesCommand = peeringCommand?.commands.find(
        (cmd) => cmd.name() === "list-topologies",
      );

      expect(listTopologiesCommand).toBeDefined();
      expect(listTopologiesCommand?.description()).toBe(
        "List available peering topology templates",
      );
    });
  });

  describe("Monitoring Commands", () => {
    it("should register mon command", () => {
      const monitorCommand = program.commands.find(
        (cmd) => cmd.name() === "mon",
      );
      expect(monitorCommand).toBeDefined();
      expect(monitorCommand?.description()).toBe(
        "Azure Monitor and observability commands",
      );
    });

    it("should register mon workspace subcommand", () => {
      const monitorCommand = program.commands.find(
        (cmd) => cmd.name() === "mon",
      );
      const workspaceCommand = monitorCommand?.commands.find(
        (cmd) => cmd.name() === "workspace",
      );

      expect(workspaceCommand).toBeDefined();
      expect(workspaceCommand?.description()).toBe(
        "Generate Log Analytics workspace configuration",
      );
    });

    it("should register mon diagnostics subcommand", () => {
      const monitorCommand = program.commands.find(
        (cmd) => cmd.name() === "mon",
      );
      const diagnosticsCommand = monitorCommand?.commands.find(
        (cmd) => cmd.name() === "diagnostics",
      );

      expect(diagnosticsCommand).toBeDefined();
      expect(diagnosticsCommand?.description()).toBe(
        "Generate diagnostic settings configuration",
      );
    });

    it("should register mon metrics subcommand", () => {
      const monitorCommand = program.commands.find(
        (cmd) => cmd.name() === "mon",
      );
      const metricsCommand = monitorCommand?.commands.find(
        (cmd) => cmd.name() === "metrics",
      );

      expect(metricsCommand).toBeDefined();
      expect(metricsCommand?.description()).toBe(
        "Generate metrics collection configuration",
      );
    });
  });

  describe("Alert Commands", () => {
    it("should register alert command", () => {
      const alertCommand = program.commands.find(
        (cmd) => cmd.name() === "alert",
      );
      expect(alertCommand).toBeDefined();
      expect(alertCommand?.description()).toBe("Azure Monitor alert commands");
    });

    it("should register alert metric subcommand", () => {
      const alertCommand = program.commands.find(
        (cmd) => cmd.name() === "alert",
      );
      const metricCommand = alertCommand?.commands.find(
        (cmd) => cmd.name() === "metric",
      );

      expect(metricCommand).toBeDefined();
      expect(metricCommand?.description()).toBe(
        "Generate metric alert configuration",
      );
    });

    it("should register alert log subcommand", () => {
      const alertCommand = program.commands.find(
        (cmd) => cmd.name() === "alert",
      );
      const logCommand = alertCommand?.commands.find(
        (cmd) => cmd.name() === "log",
      );

      expect(logCommand).toBeDefined();
      expect(logCommand?.description()).toBe(
        "Generate log query alert configuration",
      );
    });

    it("should register alert action-group subcommand", () => {
      const alertCommand = program.commands.find(
        (cmd) => cmd.name() === "alert",
      );
      const actionGroupCommand = alertCommand?.commands.find(
        (cmd) => cmd.name() === "action-group",
      );

      expect(actionGroupCommand).toBeDefined();
      expect(actionGroupCommand?.description()).toBe(
        "Generate action group configuration",
      );
    });
  });

  describe("Dashboard Commands", () => {
    it("should register dash command", () => {
      const dashboardCommand = program.commands.find(
        (cmd) => cmd.name() === "dash",
      );
      expect(dashboardCommand).toBeDefined();
      expect(dashboardCommand?.description()).toBe(
        "Azure Portal dashboard commands",
      );
    });

    it("should register dash vm-health subcommand", () => {
      const dashboardCommand = program.commands.find(
        (cmd) => cmd.name() === "dash",
      );
      const vmHealthCommand = dashboardCommand?.commands.find(
        (cmd) => cmd.name() === "vm-health",
      );

      expect(vmHealthCommand).toBeDefined();
      expect(vmHealthCommand?.description()).toBe(
        "Generate VM health monitoring dashboard",
      );
    });

    it("should register dash vmss-scaling subcommand", () => {
      const dashboardCommand = program.commands.find(
        (cmd) => cmd.name() === "dash",
      );
      const vmssScalingCommand = dashboardCommand?.commands.find(
        (cmd) => cmd.name() === "vmss-scaling",
      );

      expect(vmssScalingCommand).toBeDefined();
      expect(vmssScalingCommand?.description()).toBe(
        "Generate VMSS autoscaling dashboard",
      );
    });
  });

  describe("Command Count", () => {
    it("should have comprehensive command coverage", () => {
      const commandNames = program.commands.map((cmd) => cmd.name());

      // Original commands
      expect(commandNames).toContain("vm");
      expect(commandNames).toContain("vnet");
      expect(commandNames).toContain("subnet");
      expect(commandNames).toContain("nsg");
      expect(commandNames).toContain("lb");
      expect(commandNames).toContain("appgw");
      expect(commandNames).toContain("bastion");
      expect(commandNames).toContain("peering");

      // New monitoring commands
      expect(commandNames).toContain("mon");
      expect(commandNames).toContain("alert");
      expect(commandNames).toContain("dash");

      // Verify total count includes monitoring commands
      expect(program.commands.length).toBeGreaterThanOrEqual(11);
    });
  });
});
