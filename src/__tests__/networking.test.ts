/**
 * Networking Integration Test
 * Tests the networking helper integration
 */

import { VmPlugin } from "../index";

describe("VmPlugin Networking Integration", () => {
  let plugin: VmPlugin;

  beforeEach(() => {
    plugin = new VmPlugin();
  });

  describe("Networking Helpers", () => {
    let helpers: Record<string, (...args: any[]) => any>;

    beforeEach(() => {
      helpers = plugin.getHandlebarsHelpers();
    });

    // ========================================
    // VNet Helpers Tests
    // ========================================

    it("should provide net:vnet.template helper", () => {
      expect(helpers["net:vnet.template"]).toBeDefined();
      expect(typeof helpers["net:vnet.template"]).toBe("function");
    });

    it("should return VNet template configuration", () => {
      const result = helpers["net:vnet.template"]("small");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("addressSpace");
      expect(parsed).toHaveProperty("description");
      expect(parsed.addressSpace).toContain("10.0.0.0/24");
    });

    it("should provide net:vnet.name helper", () => {
      expect(helpers["net:vnet.name"]).toBeDefined();
      const result = helpers["net:vnet.name"]("small");
      expect(result).toBe("vnet-small");
    });

    it("should provide net:vnet.usableIPs helper", () => {
      expect(helpers["net:vnet.usableIPs"]).toBeDefined();
      const result = helpers["net:vnet.usableIPs"]("10.0.0.0/24");
      expect(result).toBe(251); // 256 - 5 reserved IPs
    });

    it("should provide net:vnet.validateCIDR helper", () => {
      expect(helpers["net:vnet.validateCIDR"]).toBeDefined();
      expect(helpers["net:vnet.validateCIDR"]("10.0.0.0/24")).toBe(true);
      expect(helpers["net:vnet.validateCIDR"]("invalid")).toBe(false);
    });

    // ========================================
    // Subnet Helpers Tests
    // ========================================

    it("should provide net:subnet.pattern helper", () => {
      expect(helpers["net:subnet.pattern"]).toBeDefined();
      const result = helpers["net:subnet.pattern"]("web");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("addressPrefix");
      expect(parsed.name).toBe("web");
    });

    it("should provide net:subnet.name helper", () => {
      expect(helpers["net:subnet.name"]).toBeDefined();
      const result = helpers["net:subnet.name"]("web");
      expect(result).toBe("web");
    });

    // ========================================
    // NSG Helpers Tests
    // ========================================

    it("should provide net:nsg.rule helper", () => {
      expect(helpers["net:nsg.rule"]).toBeDefined();
      const result = helpers["net:nsg.rule"]("allow-http");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("priority");
      expect(parsed).toHaveProperty("destinationPortRange");
      expect(parsed.destinationPortRange).toBe("80");
    });

    it("should provide net:nsg.template helper", () => {
      expect(helpers["net:nsg.template"]).toBeDefined();
      const result = helpers["net:nsg.template"]("web-server");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("rules");
      expect(Array.isArray(parsed.rules)).toBe(true);
    });

    // ========================================
    // Load Balancer Helpers Tests
    // ========================================

    it("should provide net:lb.template helper", () => {
      expect(helpers["net:lb.template"]).toBeDefined();
      const result = helpers["net:lb.template"]("public-web");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("sku");
      expect(parsed).toHaveProperty("isPublic");
    });

    it("should provide net:lb.isPublic helper", () => {
      expect(helpers["net:lb.isPublic"]).toBeDefined();
      expect(helpers["net:lb.isPublic"]("public-web")).toBe(true);
      expect(helpers["net:lb.isPublic"]("internal-app")).toBe(false);
    });

    // ========================================
    // Application Gateway Helpers Tests
    // ========================================

    it("should provide net:appgw.template helper", () => {
      expect(helpers["net:appgw.template"]).toBeDefined();
      const result = helpers["net:appgw.template"]("basic-web");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("sku");
      expect(parsed).toHaveProperty("tier");
    });

    it("should provide net:appgw.wafEnabled helper", () => {
      expect(helpers["net:appgw.wafEnabled"]).toBeDefined();
      expect(helpers["net:appgw.wafEnabled"]("waf-enabled")).toBe(true);
      expect(helpers["net:appgw.wafEnabled"]("basic-web")).toBe(false);
    });

    // ========================================
    // Bastion Helpers Tests
    // ========================================

    it("should provide net:bastion.template helper", () => {
      expect(helpers["net:bastion.template"]).toBeDefined();
      const result = helpers["net:bastion.template"]("standard");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("sku");
      expect(parsed).toHaveProperty("scaleUnits");
    });

    it("should provide net:bastion.featureEnabled helper", () => {
      expect(helpers["net:bastion.featureEnabled"]).toBeDefined();
      expect(
        helpers["net:bastion.featureEnabled"]("premium", "tunneling"),
      ).toBe(true);
      expect(helpers["net:bastion.featureEnabled"]("basic", "tunneling")).toBe(
        false,
      );
    });

    // ========================================
    // Peering Helpers Tests
    // ========================================

    it("should provide net:peering.template helper", () => {
      expect(helpers["net:peering.template"]).toBeDefined();
      const result = helpers["net:peering.template"]("hub-vnet");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("topology");
    });

    it("should provide net:peering.meshCount helper", () => {
      expect(helpers["net:peering.meshCount"]).toBeDefined();
      expect(helpers["net:peering.meshCount"](4)).toBe(6); // n(n-1)/2 = 4*3/2 = 6
    });

    // ========================================
    // Common Networking Helpers Tests
    // ========================================

    it("should provide net:common.vnetName helper", () => {
      expect(helpers["net:common.vnetName"]).toBeDefined();
      expect(helpers["net:common.vnetName"]("myapp")).toBe("vnet-myapp");
    });

    it("should provide net:common.subnetName helper", () => {
      expect(helpers["net:common.subnetName"]).toBeDefined();
      expect(helpers["net:common.subnetName"]("myapp", "web")).toBe(
        "subnet-myapp-web",
      );
    });

    it("should provide net:common.nsgName helper", () => {
      expect(helpers["net:common.nsgName"]).toBeDefined();
      expect(helpers["net:common.nsgName"]("myapp")).toBe("nsg-myapp");
    });

    it("should provide net:common.peeringName helper", () => {
      expect(helpers["net:common.peeringName"]).toBeDefined();
      expect(helpers["net:common.peeringName"]("hub", "spoke1")).toBe(
        "peer-hub-to-spoke1",
      );
    });
  });

  describe("Helper Count", () => {
    it("should have significantly more helpers than basic VM plugin", () => {
      const helpers = plugin.getHandlebarsHelpers();
      const helperNames = Object.keys(helpers);

      // Should have VM helpers (3) + Networking helpers (57) = 60 total
      expect(helperNames.length).toBeGreaterThanOrEqual(60);

      // Check for namespace prefixes
      const networkingHelpers = helperNames.filter((name) =>
        name.startsWith("net:"),
      );
      expect(networkingHelpers.length).toBeGreaterThan(50);

      const vmHelpers = helperNames.filter((name) => name.startsWith("vm-"));
      expect(vmHelpers.length).toBe(3);
    });

    it("should have helpers for all networking domains", () => {
      const helpers = plugin.getHandlebarsHelpers();
      const helperNames = Object.keys(helpers);

      // Check for all networking domains
      expect(helperNames.some((name) => name.startsWith("net:vnet."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:subnet."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:nsg."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:lb."))).toBe(true);
      expect(helperNames.some((name) => name.startsWith("net:appgw."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:bastion."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:peering."))).toBe(
        true,
      );
      expect(helperNames.some((name) => name.startsWith("net:common."))).toBe(
        true,
      );
    });
  });
});
