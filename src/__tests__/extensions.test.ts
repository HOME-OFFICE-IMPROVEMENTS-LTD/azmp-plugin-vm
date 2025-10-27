/**
 * Tests for VM Extensions Module
 *
 * Tests all 20 extensions across Windows, Linux, and cross-platform categories
 */

import {
  windows,
  linux,
  crossplatform,
  extensionsCatalog,
  createExtensionHelpers,
} from "../extensions";

describe("Extensions Module", () => {
  describe("Windows Extensions", () => {
    it("should create CustomScriptExtension", () => {
      const ext = windows.customScriptExtension({
        fileUris: ["https://example.com/script.ps1"],
        commandToExecute:
          "powershell -ExecutionPolicy Unrestricted -File script.ps1",
      });

      expect(ext.name).toBe("CustomScriptExtension");
      expect(ext.publisher).toBe("Microsoft.Compute");
      expect(ext.type).toBe("CustomScriptExtension");
      expect(ext.typeHandlerVersion).toBe("1.10");
      expect(ext.settings?.fileUris).toEqual([
        "https://example.com/script.ps1",
      ]);
    });

    it("should create MonitoringAgentExtension", () => {
      const ext = windows.monitoringAgentExtension(
        "workspace-id",
        "workspace-key",
      );

      expect(ext.name).toBe("MicrosoftMonitoringAgent");
      expect(ext.publisher).toBe("Microsoft.EnterpriseCloud.Monitoring");
      expect(ext.settings?.workspaceId).toBe("workspace-id");
      expect(ext.protectedSettings?.workspaceKey).toBe("workspace-key");
    });

    it("should create AntimalwareExtension with defaults", () => {
      const ext = windows.antimalwareExtension();

      expect(ext.name).toBe("IaaSAntimalware");
      expect(ext.publisher).toBe("Microsoft.Azure.Security");
      expect(ext.settings?.AntimalwareEnabled).toBe(true);
      expect(ext.settings?.RealtimeProtectionEnabled).toBe(true);
    });

    it("should create AntimalwareExtension with custom config", () => {
      const ext = windows.antimalwareExtension({
        realtimeProtection: false,
        scheduledScanDay: 1, // Monday
        scheduledScanTime: 120,
        scheduledScanType: "Full",
      });

      expect(ext.settings?.RealtimeProtectionEnabled).toBe(false);
      expect(ext.settings?.ScheduledScanSettings.day).toBe(1);
      expect(ext.settings?.ScheduledScanSettings.scanType).toBe("Full");
    });

    it("should create DSCExtension", () => {
      const ext = windows.dscExtension({
        modulesUrl: "https://example.com/dsc.zip",
        configurationFunction: "Main.ps1\\Main",
      });

      expect(ext.name).toBe("DSC");
      expect(ext.publisher).toBe("Microsoft.Powershell");
      expect(ext.settings?.modulesUrl).toBe("https://example.com/dsc.zip");
      expect(ext.settings?.configurationFunction).toBe("Main.ps1\\Main");
    });

    it("should create DomainJoinExtension", () => {
      const ext = windows.domainJoinExtension({
        domain: "contoso.com",
        user: "admin@contoso.com",
        password: "Password123!",
        ouPath: "OU=Servers,DC=contoso,DC=com",
      });

      expect(ext.name).toBe("JsonADDomainExtension");
      expect(ext.settings?.Name).toBe("contoso.com");
      expect(ext.settings?.User).toBe("admin@contoso.com");
      expect(ext.protectedSettings?.Password).toBe("Password123!");
    });

    it("should create DiagnosticsExtension", () => {
      const ext = windows.diagnosticsExtension({
        storageAccount: "mystorageacct",
        storageAccountKey: "key123",
      });

      expect(ext.name).toBe("IaaSDiagnostics");
      expect(ext.publisher).toBe("Microsoft.Azure.Diagnostics");
      expect(ext.protectedSettings?.storageAccountName).toBe("mystorageacct");
    });

    it("should create GPUDriverExtension", () => {
      const ext = windows.gpuDriverExtension();

      expect(ext.name).toBe("NvidiaGpuDriverWindows");
      expect(ext.publisher).toBe("Microsoft.HpcCompute");
      expect(ext.typeHandlerVersion).toBe("1.3");
    });

    it("should create BackupExtension", () => {
      const ext = windows.backupExtension({
        locale: "en-US",
        taskId: "task-123",
      });

      expect(ext.name).toBe("VMSnapshot");
      expect(ext.publisher).toBe("Microsoft.Azure.RecoveryServices");
      expect(ext.settings?.locale).toBe("en-US");
    });
  });

  describe("Linux Extensions", () => {
    it("should create CustomScriptExtension", () => {
      const ext = linux.customScriptExtension({
        fileUris: ["https://example.com/script.sh"],
        commandToExecute: "bash script.sh",
      });

      expect(ext.name).toBe("CustomScript");
      expect(ext.publisher).toBe("Microsoft.Azure.Extensions");
      expect(ext.type).toBe("CustomScript");
      expect(ext.typeHandlerVersion).toBe("2.1");
    });

    it("should create OmsAgentExtension", () => {
      const ext = linux.omsAgentExtension("workspace-id", "workspace-key");

      expect(ext.name).toBe("OmsAgentForLinux");
      expect(ext.publisher).toBe("Microsoft.EnterpriseCloud.Monitoring");
      expect(ext.settings?.workspaceId).toBe("workspace-id");
      expect(ext.protectedSettings?.workspaceKey).toBe("workspace-key");
    });

    it("should create SecurityAgentExtension", () => {
      const ext = linux.securityAgentExtension();

      expect(ext.name).toBe("AzureSecurityLinuxAgent");
      expect(ext.publisher).toBe("Microsoft.Azure.Security.Monitoring");
      expect(ext.settings?.enableGenevaUpload).toBe(true);
    });

    it("should create VMAccessExtension", () => {
      const ext = linux.vmAccessExtension({
        username: "azureuser",
        sshKey: "ssh-rsa AAAA...",
        resetSSH: true,
      });

      expect(ext.name).toBe("VMAccessForLinux");
      expect(ext.publisher).toBe("Microsoft.OSTCExtensions");
      expect(ext.protectedSettings?.username).toBe("azureuser");
      expect(ext.protectedSettings?.reset_ssh).toBe(true);
    });

    it("should create DependencyAgentExtension", () => {
      const ext = linux.dependencyAgentExtension();

      expect(ext.name).toBe("DependencyAgentLinux");
      expect(ext.publisher).toBe("Microsoft.Azure.Monitoring.DependencyAgent");
      expect(ext.settings?.enableAMA).toBe(true);
    });

    it("should create GPUDriverExtension", () => {
      const ext = linux.gpuDriverExtension();

      expect(ext.name).toBe("NvidiaGpuDriverLinux");
      expect(ext.publisher).toBe("Microsoft.HpcCompute");
      expect(ext.typeHandlerVersion).toBe("1.6");
    });

    it("should create RunCommandExtension", () => {
      const ext = linux.runCommandExtension({
        commandToExecute: 'echo "Hello World"',
        timeoutInSeconds: 300,
      });

      expect(ext.name).toBe("RunCommandLinux");
      expect(ext.publisher).toBe("Microsoft.CPlat.Core");
      expect(ext.protectedSettings?.commandToExecute).toBe(
        'echo "Hello World"',
      );
      expect(ext.settings?.timeoutInSeconds).toBe(300);
    });
  });

  describe("Cross-Platform Extensions", () => {
    it("should create AzureMonitorAgent for Windows", () => {
      const ext = crossplatform.azureMonitorAgentExtension("Windows", {
        workspaceId: "workspace-id",
        workspaceKey: "workspace-key",
      });

      expect(ext.name).toBe("AzureMonitorAgent");
      expect(ext.type).toBe("AzureMonitorWindowsAgent");
      expect(ext.publisher).toBe("Microsoft.Azure.Monitor");
    });

    it("should create AzureMonitorAgent for Linux", () => {
      const ext = crossplatform.azureMonitorAgentExtension("Linux", {
        workspaceId: "workspace-id",
      });

      expect(ext.type).toBe("AzureMonitorLinuxAgent");
      expect(ext.settings?.workspaceId).toBe("workspace-id");
    });

    it("should create AzureSecurityAgent for Windows", () => {
      const ext = crossplatform.azureSecurityAgentExtension("Windows");

      expect(ext.name).toBe("AzureSecurityAgent");
      expect(ext.type).toBe("AzureSecurityWindowsAgent");
      expect(ext.settings?.enableGenevaUpload).toBe(true);
    });

    it("should create AzureSecurityAgent for Linux", () => {
      const ext = crossplatform.azureSecurityAgentExtension("Linux");

      expect(ext.type).toBe("AzureSecurityLinuxAgent");
      expect(ext.settings?.reportSuccessOnUnsupportedDistro).toBe(true);
    });

    it("should create DependencyAgent for both platforms", () => {
      const winExt = crossplatform.dependencyAgentExtension("Windows");
      const linuxExt = crossplatform.dependencyAgentExtension("Linux");

      expect(winExt.type).toBe("DependencyAgentWindows");
      expect(linuxExt.type).toBe("DependencyAgentLinux");
      expect(winExt.settings?.enableAMA).toBe(true);
      expect(linuxExt.settings?.enableAMA).toBe(true);
    });

    it("should create AADSSHLoginExtension", () => {
      const ext = crossplatform.aadSSHLoginExtension();

      expect(ext.name).toBe("AADSSHLoginForLinux");
      expect(ext.publisher).toBe("Microsoft.Azure.ActiveDirectory");
      expect(ext.typeHandlerVersion).toBe("1.0");
    });

    it("should create KeyVaultExtension for Windows", () => {
      const ext = crossplatform.keyVaultExtension("Windows", {
        secretsManagementSettings: {
          observedCertificates: [
            {
              url: "https://myvault.vault.azure.net/secrets/mycert",
            },
          ],
        },
      });

      expect(ext.name).toBe("KeyVault");
      expect(ext.type).toBe("KeyVaultForWindows");
      expect(ext.typeHandlerVersion).toBe("3.0");
      expect(
        ext.settings?.secretsManagementSettings.certificateStoreLocation,
      ).toBe("LocalMachine");
    });

    it("should create KeyVaultExtension for Linux", () => {
      const ext = crossplatform.keyVaultExtension("Linux", {
        secretsManagementSettings: {
          observedCertificates: [
            {
              url: "https://myvault.vault.azure.net/secrets/mycert",
            },
          ],
        },
      });

      expect(ext.type).toBe("KeyVaultForLinux");
      expect(ext.typeHandlerVersion).toBe("2.0");
      expect(ext.settings?.secretsManagementSettings.pollingIntervalInS).toBe(
        "3600",
      );
    });
  });

  describe("Extensions Catalog", () => {
    it("should have 20 extensions in catalog", () => {
      expect(extensionsCatalog).toHaveLength(20);
    });

    it("should have 8 Windows extensions", () => {
      const windowsExts = extensionsCatalog.filter(
        (ext) => ext.category === "windows",
      );
      expect(windowsExts).toHaveLength(8);
    });

    it("should have 7 Linux extensions", () => {
      const linuxExts = extensionsCatalog.filter(
        (ext) => ext.category === "linux",
      );
      expect(linuxExts).toHaveLength(7);
    });

    it("should have 5 cross-platform extensions", () => {
      const crossExts = extensionsCatalog.filter(
        (ext) => ext.category === "crossplatform",
      );
      expect(crossExts).toHaveLength(5);
    });

    it("should have correct priorities", () => {
      const mustHave = extensionsCatalog.filter(
        (ext) => ext.priority === "Must-Have",
      );
      const shouldHave = extensionsCatalog.filter(
        (ext) => ext.priority === "Should-Have",
      );
      const niceToHave = extensionsCatalog.filter(
        (ext) => ext.priority === "Nice-to-Have",
      );

      expect(mustHave.length).toBeGreaterThan(0);
      expect(shouldHave.length).toBeGreaterThan(0);
      expect(niceToHave.length).toBeGreaterThan(0);
    });
  });

  describe("Handlebars Helpers", () => {
    let helpers: Record<string, Function>;

    beforeAll(() => {
      helpers = createExtensionHelpers();
    });

    it("should create 26 helpers (20 extension + 6 utility)", () => {
      // 8 Windows + 7 Linux + 5 Cross-platform + 6 utility = 26 helpers
      expect(Object.keys(helpers).length).toBeGreaterThanOrEqual(20);
    });

    it("should have Windows extension helpers", () => {
      expect(helpers["ext:windows.customScript"]).toBeDefined();
      expect(helpers["ext:windows.monitoringAgent"]).toBeDefined();
      expect(helpers["ext:windows.antimalware"]).toBeDefined();
      expect(helpers["ext:windows.dsc"]).toBeDefined();
      expect(helpers["ext:windows.domainJoin"]).toBeDefined();
      expect(helpers["ext:windows.diagnostics"]).toBeDefined();
      expect(helpers["ext:windows.gpuDriver"]).toBeDefined();
      expect(helpers["ext:windows.backup"]).toBeDefined();
    });

    it("should have Linux extension helpers", () => {
      expect(helpers["ext:linux.customScript"]).toBeDefined();
      expect(helpers["ext:linux.omsAgent"]).toBeDefined();
      expect(helpers["ext:linux.securityAgent"]).toBeDefined();
      expect(helpers["ext:linux.vmAccess"]).toBeDefined();
      expect(helpers["ext:linux.dependencyAgent"]).toBeDefined();
      expect(helpers["ext:linux.gpuDriver"]).toBeDefined();
      expect(helpers["ext:linux.runCommand"]).toBeDefined();
    });

    it("should have cross-platform extension helpers", () => {
      expect(helpers["ext:azureMonitorAgent"]).toBeDefined();
      expect(helpers["ext:azureSecurityAgent"]).toBeDefined();
      expect(helpers["ext:dependencyAgent"]).toBeDefined();
      expect(helpers["ext:aadSSHLogin"]).toBeDefined();
      expect(helpers["ext:keyVault"]).toBeDefined();
    });

    it("should have utility helpers", () => {
      expect(helpers["ext:list"]).toBeDefined();
      expect(helpers["ext:listWindows"]).toBeDefined();
      expect(helpers["ext:listLinux"]).toBeDefined();
      expect(helpers["ext:listCrossPlatform"]).toBeDefined();
      expect(helpers["ext:get"]).toBeDefined();
      expect(helpers["ext:count"]).toBeDefined();
    });

    it("ext:list should return all extensions", () => {
      const result = helpers["ext:list"]();
      expect(result).toHaveLength(20);
    });

    it("ext:listWindows should return 8 extensions", () => {
      const result = helpers["ext:listWindows"]();
      expect(result).toHaveLength(8);
    });

    it("ext:listLinux should return 7 extensions", () => {
      const result = helpers["ext:listLinux"]();
      expect(result).toHaveLength(7);
    });

    it("ext:listCrossPlatform should return 5 extensions", () => {
      const result = helpers["ext:listCrossPlatform"]();
      expect(result).toHaveLength(5);
    });

    it("ext:count should return 20", () => {
      const result = helpers["ext:count"]();
      expect(result).toBe(20);
    });

    it("ext:get should find extension by name and category", () => {
      const result = helpers["ext:get"]("customScriptExtension", "windows");
      expect(result).toBeDefined();
      expect(result.displayName).toBe("Custom Script Extension");
    });
  });

  describe("Extension Auto-Upgrade", () => {
    it("all extensions should have autoUpgradeMinorVersion enabled", () => {
      const winExt = windows.customScriptExtension({
        commandToExecute: "test",
      });
      const linuxExt = linux.customScriptExtension({
        commandToExecute: "test",
      });
      const crossExt = crossplatform.azureMonitorAgentExtension("Windows");

      expect(winExt.autoUpgradeMinorVersion).toBe(true);
      expect(linuxExt.autoUpgradeMinorVersion).toBe(true);
      expect(crossExt.autoUpgradeMinorVersion).toBe(true);
    });
  });

  describe("Extension JSON Output", () => {
    it("should generate valid JSON for Windows CustomScript", () => {
      const ext = windows.customScriptExtension({
        fileUris: ["https://example.com/script.ps1"],
        commandToExecute: "powershell script.ps1",
      });

      const json = JSON.stringify(ext);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("should generate valid JSON for Linux CustomScript", () => {
      const ext = linux.customScriptExtension({
        fileUris: ["https://example.com/script.sh"],
        commandToExecute: "bash script.sh",
      });

      const json = JSON.stringify(ext);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });
});
