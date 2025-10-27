import { VmPlugin } from "../index";
import * as Handlebars from "handlebars";
import { PluginContext } from "../types";

describe("Dashboard and Workbook Module", () => {
  let plugin: VmPlugin;

  beforeEach(() => {
    plugin = new VmPlugin();
    const mockContext: PluginContext = {
      logger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    } as unknown as PluginContext;
    plugin.initialize(mockContext);
  });

  describe("Helper Registration", () => {
    it("should register all 8 dashboard and workbook helpers", () => {
      const helpers = [
        "dashboard:vmHealth",
        "dashboard:vmssScaling",
        "dashboard:multiRegionHealth",
        "dashboard:loadBalancerPerformance",
        "dashboard:costAnalysis",
        "workbook:vmDiagnostics",
        "workbook:securityPosture",
        "workbook:performanceAnalysis",
      ];

      helpers.forEach((helperName) => {
        expect(Handlebars.helpers[helperName]).toBeDefined();
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw error when dashboard:vmHealth missing required name", () => {
      const helper = Handlebars.helpers["dashboard:vmHealth"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, {
          location: "eastus",
          vmResourceIds: ["id1"],
        });
      }).toThrow("name is required");
    });

    it("should throw error when dashboard:vmssScaling missing vmssResourceId", () => {
      const helper = Handlebars.helpers["dashboard:vmssScaling"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, { name: "test", location: "eastus" });
      }).toThrow("vmssResourceId is required");
    });

    it("should throw error when dashboard:multiRegionHealth missing regions", () => {
      const helper = Handlebars.helpers["dashboard:multiRegionHealth"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, { name: "test", location: "eastus" });
      }).toThrow("regions array is required");
    });

    it("should throw error when dashboard:loadBalancerPerformance missing loadBalancerResourceId", () => {
      const helper = Handlebars.helpers["dashboard:loadBalancerPerformance"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, { name: "test", location: "eastus" });
      }).toThrow("loadBalancerResourceId is required");
    });

    it("should throw error when dashboard:costAnalysis missing subscriptionId", () => {
      const helper = Handlebars.helpers["dashboard:costAnalysis"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, { name: "test", location: "eastus" });
      }).toThrow("subscriptionId is required");
    });

    it("should throw error when workbook:vmDiagnostics missing resourceGroup", () => {
      const helper = Handlebars.helpers["workbook:vmDiagnostics"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, {
          name: "test",
          location: "eastus",
          vmResourceIds: ["id1"],
        });
      }).toThrow("resourceGroup is required");
    });

    it("should throw error when workbook:securityPosture missing subscriptionId", () => {
      const helper = Handlebars.helpers["workbook:securityPosture"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, {
          name: "test",
          location: "eastus",
          resourceGroup: "rg",
        });
      }).toThrow("subscriptionId is required");
    });

    it("should throw error when workbook:performanceAnalysis missing workspaceResourceId", () => {
      const helper = Handlebars.helpers["workbook:performanceAnalysis"];
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (helper as any).call(null, {
          name: "test",
          location: "eastus",
          resourceGroup: "rg",
        });
      }).toThrow("workspaceResourceId is required");
    });
  });
});
