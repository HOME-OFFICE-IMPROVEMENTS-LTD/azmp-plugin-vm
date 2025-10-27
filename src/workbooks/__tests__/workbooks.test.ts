import { WorkbookTemplateManager } from "../templates";
import { registerWorkbookHelpers } from "../helpers";
import Handlebars from "handlebars";
import { WorkbookTemplate, WorkbookGenerationOptions } from "../index";

describe("Workbooks Module", () => {
  beforeAll(() => {
    registerWorkbookHelpers();
  });

  describe("WorkbookTemplateManager", () => {
    describe("getAllTemplates", () => {
      it("should return all 23 templates", () => {
        const templates = WorkbookTemplateManager.getAllTemplates();
        expect(templates).toHaveLength(23);
      });

      it("should return templates with required properties", () => {
        const templates = WorkbookTemplateManager.getAllTemplates();
        templates.forEach((template: WorkbookTemplate) => {
          expect(template).toHaveProperty("id");
          expect(template).toHaveProperty("name");
          expect(template).toHaveProperty("description");
          expect(template).toHaveProperty("category");
          expect(template).toHaveProperty("tags");
          expect(template).toHaveProperty("definition");
          expect(typeof template.id).toBe("string");
          expect(typeof template.name).toBe("string");
          expect(typeof template.description).toBe("string");
          expect(typeof template.category).toBe("string");
          expect(Array.isArray(template.tags)).toBe(true);
          expect(typeof template.definition).toBe("object");
        });
      });
    });

    describe("getTemplatesByCategory", () => {
      it("should return 8 vm-monitoring templates", () => {
        const templates =
          WorkbookTemplateManager.getTemplatesByCategory("vm-monitoring");
        expect(templates).toHaveLength(8);
        templates.forEach((template: WorkbookTemplate) => {
          expect(template.category).toBe("vm-monitoring");
        });
      });

      it("should return 6 application templates", () => {
        const templates =
          WorkbookTemplateManager.getTemplatesByCategory("application");
        expect(templates).toHaveLength(6);
        templates.forEach((template: WorkbookTemplate) => {
          expect(template.category).toBe("application");
        });
      });

      it("should return 6 infrastructure templates", () => {
        const templates =
          WorkbookTemplateManager.getTemplatesByCategory("infrastructure");
        expect(templates).toHaveLength(6);
        templates.forEach((template: WorkbookTemplate) => {
          expect(template.category).toBe("infrastructure");
        });
      });
    });

    describe("getTemplate", () => {
      it("should return specific template by id", () => {
        const template = WorkbookTemplateManager.getTemplate(
          "vm-performance-dashboard",
        );
        expect(template).toBeTruthy();
        expect(template?.id).toBe("vm-performance-dashboard");
        expect(template?.category).toBe("vm-monitoring");
      });

      it("should return null for unknown template id", () => {
        const template =
          WorkbookTemplateManager.getTemplate("unknown-template");
        expect(template).toBeNull();
      });
    });

    describe("searchTemplatesByTags", () => {
      it("should find templates by monitoring tag", () => {
        const templates = WorkbookTemplateManager.searchTemplatesByTags([
          "monitoring",
        ]);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((template: WorkbookTemplate) => {
          expect(template.tags).toContain("monitoring");
        });
      });

      it("should find templates by performance tag", () => {
        const templates = WorkbookTemplateManager.searchTemplatesByTags([
          "performance",
        ]);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((template: WorkbookTemplate) => {
          expect(template.tags).toContain("performance");
        });
      });

      it("should return empty array for non-existent tags", () => {
        const templates = WorkbookTemplateManager.searchTemplatesByTags([
          "non-existent-tag",
        ]);
        expect(templates).toHaveLength(0);
      });
    });

    describe("generateWorkbook", () => {
      it("should generate workbook from template", () => {
        const options: WorkbookGenerationOptions = {
          templateId: "vm-performance-dashboard",
        };
        const result = WorkbookTemplateManager.generateWorkbook(options);
        expect(result).toBeTruthy();
        expect(result.version).toBe("Notebook/1.0");
        expect(result.items).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
      });

      it("should fail for unknown template", () => {
        const options: WorkbookGenerationOptions = {
          templateId: "unknown-template",
        };
        expect(() => {
          WorkbookTemplateManager.generateWorkbook(options);
        }).toThrow("Template not found: unknown-template");
      });

      it("should apply custom parameters", () => {
        const options: WorkbookGenerationOptions = {
          templateId: "vm-performance-dashboard",
          subscriptionId: "test-subscription",
          resourceGroupName: "test-rg",
          vmName: "test-vm",
        };
        const result = WorkbookTemplateManager.generateWorkbook(options);
        expect(result).toBeTruthy();

        // Verify metadata is applied
        expect(result.metadata).toBeDefined();
        expect(result.metadata.templateId).toBe("vm-performance-dashboard");
      });
    });

    describe("validateTemplate", () => {
      it("should validate correct template structure", () => {
        const validTemplate: WorkbookTemplate = {
          id: "test-template",
          name: "Test Template",
          description: "Test description",
          category: "vm-monitoring",
          tags: ["test"],
          version: "1.0.0",
          definition: {
            version: "Notebook/1.0",
            items: [
              {
                type: 1,
                content: {
                  json: "Test content",
                },
              },
            ],
          },
        };

        const result = WorkbookTemplateManager.validateTemplate(validTemplate);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject template with missing properties", () => {
        const invalidTemplate = {
          id: "test",
          name: "Test",
          // Missing required properties
        } as WorkbookTemplate;

        const result =
          WorkbookTemplateManager.validateTemplate(invalidTemplate);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe("getTemplateStats", () => {
      it("should return correct template statistics", () => {
        const stats = WorkbookTemplateManager.getTemplateStats();
        expect(stats.total).toBe(23);
        expect(stats.byCategory["vm-monitoring"]).toBe(8);
        expect(stats.byCategory["application"]).toBe(6);
        expect(stats.byCategory["infrastructure"]).toBe(6);
        expect(stats.byCategory["advanced-monitoring"]).toBe(1);
        expect(stats.byCategory["scaling-analytics"]).toBe(1);
        expect(stats.byCategory["cost-optimization"]).toBe(1);
      });

      it("should include tag statistics", () => {
        const stats = WorkbookTemplateManager.getTemplateStats();
        expect(stats.byTags).toBeDefined();
        expect(typeof stats.byTags).toBe("object");
        expect(Object.keys(stats.byTags).length).toBeGreaterThan(0);
      });
    });
  });

  describe("Handlebars Helpers", () => {
    describe("workbook:definition helper", () => {
      it("should generate complete workbook definition", () => {
        const template = Handlebars.compile(
          '{{workbook:definition "vm-performance-dashboard"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("should handle unknown template gracefully", () => {
        const template = Handlebars.compile(
          '{{workbook:definition "unknown-template"}}',
        );
        const result = template({});
        expect(result).toContain("not found");
      });
    });

    describe("workbook:template helper", () => {
      it("should return template metadata", () => {
        const template = Handlebars.compile(
          '{{workbook:template "vm-performance-dashboard"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    describe("workbook:kqlQuery helper", () => {
      it("should generate KQL query item", () => {
        const template = Handlebars.compile(
          '{{workbook:kqlQuery "Perf | where CounterName == \\"% Processor Time\\"" title="CPU Usage" size="0"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result).toContain("% Processor Time");
      });

      it("should handle minimal parameters", () => {
        const template = Handlebars.compile(
          '{{workbook:kqlQuery "Heartbeat"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(result).toContain("Heartbeat");
      });
    });

    describe("workbook:metricsChart helper", () => {
      it("should generate metrics chart item", () => {
        const template = Handlebars.compile(
          '{{workbook:metricsChart "CPU Metrics" "microsoft.compute/virtualmachines" "Percentage CPU" "Average"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    describe("workbook:parameter helper", () => {
      it("should generate text parameter", () => {
        const template = Handlebars.compile(
          '{{workbook:parameter "vmName" "text" "Virtual Machine Name" "myvm"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("should generate dropdown parameter", () => {
        const template = Handlebars.compile(
          '{{workbook:parameter "environment" "dropdown" "Environment" "" "[\\"prod\\", \\"staging\\", \\"dev\\"]"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    describe("workbook:grid helper", () => {
      it("should generate grid item", () => {
        const template = Handlebars.compile(
          '{{workbook:grid "VM List" "Virtual Machines" "Heartbeat | summarize by Computer"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    describe("workbook:link helper", () => {
      it("should generate URL link", () => {
        const template = Handlebars.compile(
          '{{workbook:link "External Link" "url" "https://docs.microsoft.com"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    describe("workbook:export helper", () => {
      it("should generate export configuration", () => {
        const template = Handlebars.compile(
          '{{workbook:export "excel" "VM Data Export"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("should handle multiple formats", () => {
        const template = Handlebars.compile(
          '{{workbook:export "excel,csv,json" "Multi-format Export"}}',
        );
        const result = template({});
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });
  });

  describe("Template Content Validation", () => {
    it("should have valid workbook structure for all templates", () => {
      const templates = WorkbookTemplateManager.getAllTemplates();

      templates.forEach((template: WorkbookTemplate) => {
        expect(template.definition.version).toBe("Notebook/1.0");
        expect(Array.isArray(template.definition.items)).toBe(true);
        expect(template.definition.items.length).toBeGreaterThan(0);

        // Validate each item has required properties
        template.definition.items.forEach((item: any) => {
          expect(item).toHaveProperty("type");
          expect(item).toHaveProperty("content");
          expect(typeof item.type).toBe("number");
        });
      });
    });

    it("should have unique template IDs", () => {
      const templates = WorkbookTemplateManager.getAllTemplates();
      const ids = templates.map((t: WorkbookTemplate) => t.id);
      const uniqueIds = [...new Set(ids)];

      expect(uniqueIds.length).toBe(ids.length);
    });

    it("should have valid categories", () => {
      const templates = WorkbookTemplateManager.getAllTemplates();
      const validCategories = [
        "vm-monitoring",
        "application",
        "infrastructure",
        "advanced-monitoring",
        "scaling-analytics",
        "cost-optimization",
      ];

      templates.forEach((template: WorkbookTemplate) => {
        expect(validCategories).toContain(template.category);
      });
    });

    it("should have meaningful names and descriptions", () => {
      const templates = WorkbookTemplateManager.getAllTemplates();

      templates.forEach((template: WorkbookTemplate) => {
        expect(template.name.length).toBeGreaterThan(5);
        expect(template.description.length).toBeGreaterThan(10);
        expect(template.tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle template generation with all parameter types", () => {
      const options: WorkbookGenerationOptions = {
        templateId: "vm-performance-dashboard",
        subscriptionId: "test-sub-123",
        resourceGroupName: "test-rg-456",
        vmName: "test-vm-789",
        location: "eastus",
        customParameters: {
          environment: "production",
          threshold: "80",
        },
      };

      const result = WorkbookTemplateManager.generateWorkbook(options);
      expect(result).toBeTruthy();

      // Verify metadata is applied
      expect(result.metadata).toBeDefined();
      expect(result.metadata.templateId).toBe("vm-performance-dashboard");
    });

    it("should validate generated workbooks", () => {
      const templates = WorkbookTemplateManager.getAllTemplates();

      // Test first 5 templates to avoid excessive test time
      templates.slice(0, 5).forEach((template: WorkbookTemplate) => {
        const options: WorkbookGenerationOptions = {
          templateId: template.id,
        };
        const result = WorkbookTemplateManager.generateWorkbook(options);
        expect(result).toBeTruthy();

        // Basic structure validation
        expect(result.version).toBe("Notebook/1.0");
        expect(Array.isArray(result.items)).toBe(true);
      });
    });

    it("should handle Handlebars template compilation gracefully", () => {
      // Test with valid template
      expect(() => {
        const options: WorkbookGenerationOptions = {
          templateId: "vm-performance-dashboard",
        };
        const result = WorkbookTemplateManager.generateWorkbook(options);
        expect(result).toBeTruthy();
      }).not.toThrow();
    });

    it("should handle missing Handlebars helpers gracefully", () => {
      // Test template compilation
      const unregisteredTemplate = Handlebars.compile(
        '{{nonexistent:helper "test"}}',
      );

      expect(() => {
        const result = unregisteredTemplate({});
      }).toThrow("Missing helper");
    });
  });
});
