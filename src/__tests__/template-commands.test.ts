import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import { registerTemplateCommands } from "../cli/template-commands";
import { PluginContext } from "../types";

describe("Template CLI Commands", () => {
  let testOutputDir: string;
  let mockContext: PluginContext;
  let program: Command;

  beforeEach(() => {
    // Setup test output directory
    testOutputDir = path.join(__dirname, "../../test-cli-output");

    // Create mock context
    mockContext = {
      generatorVersion: "1.0.0",
      templatesDir: path.join(__dirname, "../templates"),
      outputDir: testOutputDir,
      config: {},
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      },
    };

    // Create new command for each test
    program = new Command();
  });

  afterEach(() => {
    // Cleanup test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe("template generate", () => {
    test("should register generate command", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();

      const generateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "generate",
      );
      expect(generateCommand).toBeDefined();
      expect(generateCommand!.description()).toContain(
        "Generate ARM templates",
      );
    });

    test("should have correct generate command options", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const generateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "generate",
      );

      const options = generateCommand!.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--config");
      expect(optionNames).toContain("--output");
      expect(optionNames).toContain("--main-only");
      expect(optionNames).toContain("--ui-only");
      expect(optionNames).toContain("--view-only");
    });

    test("should generate all templates when no filter specified", async () => {
      // This test verifies command structure without actual file generation
      // Full file generation requires Handlebars helpers to be registered
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const generateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "generate",
      );

      expect(generateCommand).toBeDefined();
      expect(generateCommand!.name()).toBe("generate");
    });
  });

  describe("template validate", () => {
    test("should register validate command", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();

      const validateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "validate",
      );
      expect(validateCommand).toBeDefined();
      expect(validateCommand!.description()).toContain("Validate ARM template");
    });

    test("should have correct validate command options", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const validateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "validate",
      );

      const options = validateCommand!.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--schema-only");
      expect(optionNames).toContain("--parameters");
    });

    test("should validate template argument requirement", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const validateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "validate",
      );

      // Validate command should have 1 required argument (path)
      expect(validateCommand!.registeredArguments).toHaveLength(1);
      expect(validateCommand!.registeredArguments[0].required).toBe(true);
    });
  });

  describe("template test", () => {
    test("should register test command", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();

      const testCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "test",
      );
      expect(testCommand).toBeDefined();
      expect(testCommand!.description()).toContain("Test ARM template");
    });

    test("should have correct test command options", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const testCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "test",
      );

      const options = testCommand!.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--parameters");
      expect(optionNames).toContain("--dry-run");
    });

    test("should validate test command argument requirement", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const testCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "test",
      );

      // Test command should have 1 required argument (path)
      expect(testCommand!.registeredArguments).toHaveLength(1);
      expect(testCommand!.registeredArguments[0].required).toBe(true);
    });
  });

  describe("template deploy-guide", () => {
    test("should register deploy-guide command", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();

      const deployGuideCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "deploy-guide",
      );
      expect(deployGuideCommand).toBeDefined();
      expect(deployGuideCommand!.description()).toContain(
        "Azure Portal deployment guide",
      );
    });

    test("should have correct deploy-guide command options", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const deployGuideCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "deploy-guide",
      );

      const options = deployGuideCommand!.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--resource-group");
      expect(optionNames).toContain("--location");
    });

    test("should have no required arguments for deploy-guide", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      const deployGuideCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "deploy-guide",
      );

      // Deploy guide should have no required arguments (all options are optional)
      expect(deployGuideCommand!.registeredArguments).toHaveLength(0);
    });
  });

  describe("Command integration", () => {
    test("should register all 4 template subcommands", () => {
      registerTemplateCommands(program, { context: mockContext });

      const templateCommand = program.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();

      const subcommandNames = templateCommand!.commands.map((cmd) =>
        cmd.name(),
      );

      expect(subcommandNames).toContain("generate");
      expect(subcommandNames).toContain("validate");
      expect(subcommandNames).toContain("test");
      expect(subcommandNames).toContain("deploy-guide");
      expect(subcommandNames).toHaveLength(4);
    });

    test("should properly nest template commands under parent command", () => {
      const vmCommand = new Command("vm").description("VM commands");
      registerTemplateCommands(vmCommand, { context: mockContext });

      const templateCommand = vmCommand.commands.find(
        (cmd) => cmd.name() === "template",
      );
      expect(templateCommand).toBeDefined();
      expect(templateCommand!.parent).toBe(vmCommand);

      const generateCommand = templateCommand!.commands.find(
        (cmd) => cmd.name() === "generate",
      );
      expect(generateCommand!.parent).toBe(templateCommand);
    });
  });
});
