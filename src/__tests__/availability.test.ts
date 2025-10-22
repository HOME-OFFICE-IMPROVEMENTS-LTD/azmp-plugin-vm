/**
 * Tests for Availability Module
 */

import {
  availabilitySet,
  availabilitySetRef,
  recommendedFaultDomains,
  recommendedUpdateDomains,
  availabilitySetSLA,
  validateAvailabilitySet,
  proximityPlacementGroup,
  getAvailableZones,
  supportsAvailabilityZones,
  zonalVM,
  zoneRedundantDisk,
  zoneRedundantIP,
  availabilityZoneSLA,
  recommendZoneDistribution,
  validateZoneConfig,
  getZoneSupportedRegions,
  vmssFlexible,
  vmssUniform,
  vmssSLA,
  validateVMSSConfig
} from '../availability';

describe('Availability Sets', () => {
  describe('availabilitySet', () => {
    it('should create availability set with default values', () => {
      const result = availabilitySet({
        name: 'test-avset'
      });

      expect(result.type).toBe('Microsoft.Compute/availabilitySets');
      expect(result.name).toBe('test-avset');
      expect(result.properties.platformFaultDomainCount).toBe(2);
      expect(result.properties.platformUpdateDomainCount).toBe(5);
    });

    it('should create availability set with custom domains', () => {
      const result = availabilitySet({
        name: 'test-avset',
        platformFaultDomainCount: 3,
        platformUpdateDomainCount: 10
      });

      expect(result.properties.platformFaultDomainCount).toBe(3);
      expect(result.properties.platformUpdateDomainCount).toBe(10);
    });

    it('should use Aligned SKU by default', () => {
      const result = availabilitySet({
        name: 'test-avset'
      });

      expect(result.sku.name).toBe('Aligned');
    });
  });

  describe('availabilitySetRef', () => {
    it('should create resource reference', () => {
      const result = availabilitySetRef('my-avset');
      expect(result.id).toContain('Microsoft.Compute/availabilitySets');
      expect(result.id).toContain('my-avset');
    });
  });

  describe('recommendedFaultDomains', () => {
    it('should recommend 1 fault domain for 1 VM', () => {
      expect(recommendedFaultDomains(1)).toBe(1);
    });

    it('should recommend 2 fault domains for 2-3 VMs', () => {
      expect(recommendedFaultDomains(2)).toBe(2);
      expect(recommendedFaultDomains(3)).toBe(2);
    });

    it('should recommend 3 fault domains for 4+ VMs', () => {
      expect(recommendedFaultDomains(4)).toBe(3);
      expect(recommendedFaultDomains(10)).toBe(3);
    });
  });

  describe('recommendedUpdateDomains', () => {
    it('should scale update domains with VM count', () => {
      expect(recommendedUpdateDomains(2)).toBeGreaterThan(0);
      expect(recommendedUpdateDomains(10)).toBeGreaterThan(0);
      expect(recommendedUpdateDomains(30)).toBeLessThanOrEqual(20); // capped at 20
    });
  });

  describe('availabilitySetSLA', () => {
    it('should return 99.9% for single VM', () => {
      expect(availabilitySetSLA(1)).toBe(99.9);
    });

    it('should return 99.95% for 2+ VMs', () => {
      expect(availabilitySetSLA(2)).toBe(99.95);
      expect(availabilitySetSLA(10)).toBe(99.95);
    });
  });

  describe('validateAvailabilitySet', () => {
    it('should validate correct configuration', () => {
      const result = validateAvailabilitySet({
        name: 'test-avset',
        platformFaultDomainCount: 2,
        platformUpdateDomainCount: 5
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid fault domain count', () => {
      const result = validateAvailabilitySet({
        name: 'test-avset',
        platformFaultDomainCount: 4
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid update domain count', () => {
      const result = validateAvailabilitySet({
        name: 'test-avset',
        platformUpdateDomainCount: 25
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('proximityPlacementGroup', () => {
    it('should create proximity placement group', () => {
      const result = proximityPlacementGroup('test-ppg');

      expect(result.type).toBe('Microsoft.Compute/proximityPlacementGroups');
      expect(result.name).toBe('test-ppg');
    });
  });
});

describe('Availability Zones', () => {
  describe('getAvailableZones', () => {
    it('should return zones for supported region', () => {
      const zones = getAvailableZones('eastus');
      expect(zones).toEqual(['1', '2', '3']);
    });

    it('should return empty array for unsupported region', () => {
      const zones = getAvailableZones('unsupported');
      expect(zones).toEqual([]);
    });
  });

  describe('supportsAvailabilityZones', () => {
    it('should return true for supported regions', () => {
      expect(supportsAvailabilityZones('eastus')).toBe(true);
      expect(supportsAvailabilityZones('westeurope')).toBe(true);
    });

    it('should return false for unsupported regions', () => {
      expect(supportsAvailabilityZones('unsupported')).toBe(false);
    });
  });

  describe('zonalVM', () => {
    it('should create VM with zone specification', () => {
      const result = zonalVM({
        name: 'test-vm',
        zone: '1',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.type).toBe('Microsoft.Compute/virtualMachines');
      expect(result.zones).toEqual(['1']);
      expect(result.properties.hardwareProfile.vmSize).toBe('Standard_D2s_v3');
    });
  });

  describe('zoneRedundantDisk', () => {
    it('should create zone-redundant disk', () => {
      const result = zoneRedundantDisk('test-disk');

      expect(result.type).toBe('Microsoft.Compute/disks');
      expect(result.sku.name).toBe('Premium_ZRS');
    });
  });

  describe('zoneRedundantIP', () => {
    it('should create zone-redundant public IP', () => {
      const result = zoneRedundantIP('test-ip');

      expect(result.type).toBe('Microsoft.Network/publicIPAddresses');
      expect(result.sku.name).toBe('Standard');
      expect(result.zones).toEqual(['1', '2', '3']);
    });
  });

  describe('availabilityZoneSLA', () => {
    it('should return 99.9% for single VM or zone', () => {
      expect(availabilityZoneSLA(1, 1)).toBe(99.9);
    });

    it('should return 99.99% for multi-zone deployment', () => {
      expect(availabilityZoneSLA(2, 2)).toBe(99.99);
      expect(availabilityZoneSLA(3, 3)).toBe(99.99);
    });
  });

  describe('recommendZoneDistribution', () => {
    it('should distribute VMs across zones', () => {
      const dist1 = recommendZoneDistribution(1);
      expect(dist1.zones).toEqual(['1']);
      expect(dist1.vmPerZone).toEqual([1]);

      const dist3 = recommendZoneDistribution(3);
      expect(dist3.zones).toEqual(['1', '2', '3']);
      expect(dist3.vmPerZone).toEqual([1, 1, 1]);

      const dist10 = recommendZoneDistribution(10);
      const totalVMs = dist10.vmPerZone.reduce((sum, count) => sum + count, 0);
      expect(totalVMs).toBe(10);
    });
  });

  describe('validateZoneConfig', () => {
    it('should validate correct zone configuration', () => {
      const result = validateZoneConfig(
        { zones: ['1', '2', '3'] },
        'eastus'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid zone numbers', () => {
      const result = validateZoneConfig(
        { zones: ['4' as any] },
        'eastus'
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn for single zone deployment', () => {
      const result = validateZoneConfig(
        { singleZone: '1' },
        'eastus'
      );

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getZoneSupportedRegions', () => {
    it('should return list of supported regions', () => {
      const regions = getZoneSupportedRegions();
      expect(regions.length).toBeGreaterThan(20);
      expect(regions).toContain('eastus');
      expect(regions).toContain('westeurope');
    });
  });
});

describe('Virtual Machine Scale Sets', () => {
  describe('vmssFlexible', () => {
    it('should create flexible VMSS', () => {
      const result = vmssFlexible({
        name: 'test-vmss',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.type).toBe('Microsoft.Compute/virtualMachineScaleSets');
      expect(result.properties.orchestrationMode).toBe('Flexible');
      expect(result.sku.name).toBe('Standard_D2s_v3');
    });

    it('should use default instance count', () => {
      const result = vmssFlexible({
        name: 'test-vmss',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.sku.capacity).toBe(3);
    });

    it('should support zones', () => {
      const result = vmssFlexible({
        name: 'test-vmss',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3',
        zones: ['1', '2', '3']
      });

      expect(result.zones).toEqual(['1', '2', '3']);
    });
  });

  describe('vmssUniform', () => {
    it('should create uniform VMSS', () => {
      const result = vmssUniform({
        name: 'test-vmss',
        orchestrationMode: 'Uniform',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.type).toBe('Microsoft.Compute/virtualMachineScaleSets');
      expect(result.properties.orchestrationMode).toBe('Uniform');
      expect(result.properties.overprovision).toBe(true);
    });

    it('should use manual upgrade mode by default', () => {
      const result = vmssUniform({
        name: 'test-vmss',
        orchestrationMode: 'Uniform',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.properties.upgradePolicy.mode).toBe('Manual');
    });
  });

  describe('vmssSLA', () => {
    it('should return 99.9% for single instance', () => {
      expect(vmssSLA(0, 1)).toBe(99.9);
    });

    it('should return 99.95% for regional deployment', () => {
      expect(vmssSLA(0, 2)).toBe(99.95);
    });

    it('should return 99.99% for multi-zone deployment', () => {
      expect(vmssSLA(2, 2)).toBe(99.99);
    });
  });

  describe('validateVMSSConfig', () => {
    it('should validate correct VMSS configuration', () => {
      const result = validateVMSSConfig({
        name: 'test-vmss',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3',
        instanceCount: 3
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty name', () => {
      const result = validateVMSSConfig({
        name: '',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn for single instance', () => {
      const result = validateVMSSConfig({
        name: 'test-vmss',
        orchestrationMode: 'Flexible',
        vmSize: 'Standard_D2s_v3',
        instanceCount: 1
      });

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
