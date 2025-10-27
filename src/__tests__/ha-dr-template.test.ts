import { describe, test, expect, beforeAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";

describe("High Availability & Disaster Recovery Template Integration", () => {
  let templateContent: string;

  beforeAll(() => {
    const templatePath = path.join(
      __dirname,
      "../../templates/mainTemplate.json.hbs",
    );
    templateContent = fs.readFileSync(templatePath, "utf-8");
  });

  describe("High Availability Parameters", () => {
    test("should define enableHighAvailability parameter", () => {
      expect(templateContent).toContain('"enableHighAvailability"');
      expect(templateContent).toContain("Enable high availability features");
      expect(templateContent).toContain('"type": "bool"');
    });

    test("should define availabilityOption parameter with allowed values", () => {
      expect(templateContent).toContain('"availabilityOption"');
      expect(templateContent).toContain('"allowedValues"');
      expect(templateContent).toContain('"AvailabilityZones"');
      expect(templateContent).toContain('"AvailabilitySet"');
      expect(templateContent).toContain('"VMSS"');
    });

    test("should define availabilityZones parameter", () => {
      expect(templateContent).toContain('"availabilityZones"');
      expect(templateContent).toContain('"type": "array"');
      expect(templateContent).toContain(
        "Availability zones for zone-redundant deployment",
      );
    });

    test("should define availability set configuration parameters", () => {
      expect(templateContent).toContain('"availabilitySetFaultDomains"');
      expect(templateContent).toContain('"availabilitySetUpdateDomains"');
      expect(templateContent).toContain('"minValue": 1');
      expect(templateContent).toContain('"maxValue": 20');
    });

    test("should define VMSS parameters", () => {
      // v1.8.0 supports VMSS as availabilityOption but detailed VMSS configuration
      // (instance count, orchestration mode, upgrade mode) are future enhancements
      expect(templateContent).toContain('"availabilityOption"');
      expect(templateContent).toContain('"VMSS"');
      expect(templateContent).toContain("useVMSS");
    });
  });

  describe("Disaster Recovery Parameters", () => {
    test("should define enableDisasterRecovery parameter", () => {
      expect(templateContent).toContain('"enableDisasterRecovery"');
      expect(templateContent).toContain("Enable disaster recovery features");
    });

    test("should define backup configuration parameters", () => {
      expect(templateContent).toContain('"enableBackup"');
      expect(templateContent).toContain('"backupPolicyType"');
      expect(templateContent).toContain('"backupRetentionDays"');
      expect(templateContent).toContain('"backupFrequency"');
      expect(templateContent).toContain('"backupTime"');
    });

    test("should define site recovery parameters", () => {
      expect(templateContent).toContain('"enableSiteRecovery"');
      expect(templateContent).toContain('"recoveryRegion"');
      expect(templateContent).toContain(
        "Target region for disaster recovery replication",
      );
    });
  });

  describe("High Availability Variables", () => {
    test("should include highAvailabilityConfig variable", () => {
      expect(templateContent).toContain('"highAvailabilityConfig"');
      expect(templateContent).toContain('"availabilitySetName"');
      expect(templateContent).toContain('"vmssName"');
      expect(templateContent).toContain('"useZones"');
      expect(templateContent).toContain('"useVMSS"');
    });

    test("should include disasterRecoveryConfig variable", () => {
      expect(templateContent).toContain('"disasterRecoveryConfig"');
      expect(templateContent).toContain('"recoveryVaultName"');
      expect(templateContent).toContain('"backupPolicyName"');
      expect(templateContent).toContain('"backupContainerName"');
      expect(templateContent).toContain('"recoveryPointRetention"');
    });
  });

  describe("High Availability Resources", () => {
    test("should include availability set resource with conditional deployment", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.Compute/availabilitySets"',
      );
      expect(templateContent).toContain("platformFaultDomainCount");
      expect(templateContent).toContain(
        '"condition": "[and(parameters(\'enableHighAvailability\')',
      );
    });

    test("should include VM resource referencing availability configuration", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.Compute/virtualMachines"',
      );
      expect(templateContent).toContain('"hardwareProfile"');
      expect(templateContent).toContain('"networkProfile"');
    });
  });

  describe("Disaster Recovery Resources", () => {
    test("should include Recovery Services vault", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.RecoveryServices/vaults"',
      );
      expect(templateContent).toContain(
        '"condition": "[and(parameters(\'enableDisasterRecovery\')',
      );
      expect(templateContent).toContain('"sku"');
    });

    test("should include backup policy resource", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.RecoveryServices/vaults/backupPolicies"',
      );
      expect(templateContent).toContain(
        '"backupManagementType": "AzureIaasVM"',
      );
      expect(templateContent).toContain('"schedulePolicy"');
    });

    test("should include protected items configuration", () => {
      expect(templateContent).toContain(
        '"type": "Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems"',
      );
      expect(templateContent).toContain(
        '"protectedItemType": "Microsoft.Compute/virtualMachines"',
      );
      expect(templateContent).toContain('"policyId"');
    });
  });

  describe("Resilience Outputs", () => {
    test("should include highAvailabilityStatus output", () => {
      expect(templateContent).toContain('"highAvailabilityStatus"');
      expect(templateContent).toContain('"availabilityOption"');
      expect(templateContent).toContain('"availabilitySetConfigured"');
      expect(templateContent).toContain('"vmssConfigured"');
    });

    test("should include disasterRecoveryStatus output", () => {
      expect(templateContent).toContain('"disasterRecoveryStatus"');
      expect(templateContent).toContain('"disasterRecoveryEnabled"');
      expect(templateContent).toContain('"backupEnabled"');
      expect(templateContent).toContain('"siteRecoveryEnabled"');
      expect(templateContent).toContain('"recoveryRegion"');
    });

    test("should include resilienceScore output", () => {
      expect(templateContent).toContain('"resilienceScore"');
      expect(templateContent).toContain('"highAvailabilityConfigured"');
      expect(templateContent).toContain('"backupConfigured"');
      expect(templateContent).toContain('"multiZoneDeployment"');
      expect(templateContent).toContain('"resilienceTier"');
    });
  });
});
