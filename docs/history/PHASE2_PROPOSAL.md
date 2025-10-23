# Phase 2 Proposal: Advanced Networking

## Overview
Phase 2 will expand the VM plugin with comprehensive networking capabilities, building on Phase 1's core VM functionality. This phase focuses on virtual networks, subnets, network security, load balancing, and advanced networking features.

## Status
- **Current Version**: v1.1.0
- **Target Version**: v1.2.0
- **Phase**: 2 of 6
- **Status**: 📋 Proposed - Awaiting Approval
- **Estimated Effort**: 2-3 days
- **Dependencies**: Phase 1 (v1.1.0) ✅ Complete

## Goals

### Primary Goals
1. **Virtual Network Management**: Create and configure VNets with address spaces
2. **Subnet Configuration**: Multi-subnet support with service endpoints
3. **Network Security**: Network Security Groups (NSGs) with comprehensive rules
4. **Load Balancing**: Azure Load Balancer (basic & standard SKUs)
5. **Public IP Management**: Static and dynamic public IPs with DNS
6. **Advanced Networking**: Application Gateway, NAT Gateway, Bastion

### Success Criteria
- [ ] 30+ networking helpers implemented
- [ ] 8+ networking CLI commands
- [ ] Support for VNet peering
- [ ] NSG rule templates (common scenarios)
- [ ] Load balancer configuration
- [ ] All tests passing (target: 40+ tests)
- [ ] Documentation complete

## Proposed Features

### 1. Virtual Network (VNet) Features

#### VNet Database (src/networking/vnets.ts)
```typescript
interface VNetConfig {
  name: string;
  addressSpace: string[];        // ["10.0.0.0/16"]
  location: string;
  subnets: SubnetConfig[];
  dnsServers?: string[];
  ddosProtection?: boolean;
  tags?: Record<string, string>;
}
```

**Helpers**:
- `vnet-address-space`: Format address space CIDR
- `vnet-dns-servers`: Format DNS server list
- `vnet-subnet-count`: Count subnets in VNet
- `vnet-validate-cidr`: Validate CIDR notation
- `vnet-calculate-ips`: Calculate available IPs

#### Pre-configured VNet Templates
- **Small** (10.0.0.0/24): Dev/Test environments (254 IPs)
- **Medium** (10.0.0.0/20): Standard deployments (4,094 IPs)
- **Large** (10.0.0.0/16): Enterprise deployments (65,534 IPs)
- **Hub-Spoke**: Hub VNet with spoke VNets

### 2. Subnet Configuration

#### Subnet Database (src/networking/subnets.ts)
```typescript
interface SubnetConfig {
  name: string;
  addressPrefix: string;         // "10.0.1.0/24"
  serviceEndpoints?: string[];   // ["Microsoft.Storage", "Microsoft.Sql"]
  delegations?: string[];        // ["Microsoft.Web/serverFarms"]
  privateEndpointPolicy?: boolean;
  privateLinkServicePolicy?: boolean;
}
```

**Common Subnet Patterns**:
- `default`: General workloads (10.0.1.0/24)
- `web`: Web tier (10.0.2.0/24)
- `app`: Application tier (10.0.3.0/24)
- `data`: Database tier (10.0.4.0/24)
- `AzureBastionSubnet`: Bastion host (10.0.250.0/27)
- `GatewaySubnet`: VPN/ExpressRoute (10.0.255.0/27)

**Helpers**:
- `subnet-address-prefix`: Format subnet CIDR
- `subnet-service-endpoints`: List service endpoints
- `subnet-delegations`: Format delegations
- `subnet-calculate-ips`: Calculate available IPs
- `subnet-validate-name`: Validate subnet name

### 3. Network Security Groups (NSGs)

#### NSG Rule Templates (src/networking/nsg-rules.ts)
```typescript
interface NsgRule {
  name: string;
  priority: number;              // 100-4096
  direction: 'Inbound' | 'Outbound';
  access: 'Allow' | 'Deny';
  protocol: 'TCP' | 'UDP' | 'ICMP' | '*';
  sourcePortRange: string;
  destinationPortRange: string;
  sourceAddressPrefix: string;
  destinationAddressPrefix: string;
  description: string;
}
```

**Pre-configured Rule Sets**:

**Web Server Rules**:
- Allow HTTP (80) from Internet
- Allow HTTPS (443) from Internet
- Allow SSH (22) from specified CIDR
- Allow RDP (3389) from specified CIDR
- Deny all other inbound

**Database Server Rules**:
- Allow SQL Server (1433) from app subnet
- Allow PostgreSQL (5432) from app subnet
- Allow MySQL (3306) from app subnet
- Allow MongoDB (27017) from app subnet
- Deny all other inbound

**Application Server Rules**:
- Allow app ports from web subnet
- Allow app ports from internal subnets
- Allow monitoring ports from management subnet
- Deny all other inbound

**Bastion Rules**:
- Allow HTTPS (443) from Internet
- Allow SSH (22) to VMs
- Allow RDP (3389) to VMs

**Helpers**:
- `nsg-rule`: Format NSG rule JSON
- `nsg-rule-priority`: Generate safe priority number
- `nsg-allow-port`: Create allow rule for port
- `nsg-deny-port`: Create deny rule for port
- `nsg-allow-subnet`: Allow traffic from subnet
- `nsg-common-rules`: Get common rule set (web/db/app)

### 4. Load Balancer Features

#### Load Balancer Database (src/networking/load-balancers.ts)
```typescript
interface LoadBalancerConfig {
  name: string;
  sku: 'Basic' | 'Standard';
  type: 'Public' | 'Internal';
  frontendIPs: FrontendIPConfig[];
  backendPools: BackendPoolConfig[];
  healthProbes: HealthProbeConfig[];
  loadBalancingRules: LoadBalancingRuleConfig[];
  inboundNatRules?: InboundNatRuleConfig[];
}
```

**Load Balancer Types**:
- **Public Standard**: Internet-facing with zone redundancy
- **Public Basic**: Simple internet-facing
- **Internal Standard**: Private load balancing
- **Internal Basic**: Simple internal load balancing

**Helpers**:
- `lb-frontend-ip`: Format frontend IP configuration
- `lb-backend-pool`: Format backend pool
- `lb-health-probe`: Create health probe (HTTP/TCP)
- `lb-rule`: Create load balancing rule
- `lb-nat-rule`: Create inbound NAT rule
- `lb-sku`: Get SKU display name

### 5. Public IP Configuration

#### Public IP Database (src/networking/public-ips.ts)
```typescript
interface PublicIPConfig {
  name: string;
  sku: 'Basic' | 'Standard';
  allocationMethod: 'Static' | 'Dynamic';
  ipVersion: 'IPv4' | 'IPv6';
  domainNameLabel?: string;
  idleTimeoutInMinutes?: number;
  zones?: string[];              // ["1", "2", "3"]
}
```

**Helpers**:
- `pip-allocation-method`: Get allocation method
- `pip-sku`: Format SKU name
- `pip-fqdn`: Generate FQDN
- `pip-zones`: Format availability zones
- `pip-idle-timeout`: Validate timeout value

### 6. Application Gateway (Layer 7 Load Balancer)

#### Application Gateway Database (src/networking/app-gateways.ts)
```typescript
interface AppGatewayConfig {
  name: string;
  sku: 'Standard_Small' | 'Standard_Medium' | 'Standard_Large' | 'WAF_Medium' | 'WAF_Large';
  tier: 'Standard' | 'WAF';
  capacity: number;              // 1-10
  frontendPorts: number[];
  backendPools: BackendPoolConfig[];
  httpListeners: HttpListenerConfig[];
  requestRoutingRules: RoutingRuleConfig[];
  sslCertificates?: SslCertificateConfig[];
}
```

**Helpers**:
- `appgw-sku`: Format SKU configuration
- `appgw-backend-pool`: Create backend pool
- `appgw-http-listener`: Create HTTP listener
- `appgw-routing-rule`: Create routing rule
- `appgw-ssl-cert`: Reference SSL certificate

### 7. Azure Bastion

#### Bastion Configuration (src/networking/bastion.ts)
```typescript
interface BastionConfig {
  name: string;
  sku: 'Basic' | 'Standard';
  subnet: string;                // Must be named 'AzureBastionSubnet'
  publicIP: string;
  scaleUnits?: number;           // 2-50 (Standard only)
}
```

**Helpers**:
- `bastion-subnet-name`: Get required subnet name
- `bastion-sku`: Format SKU
- `bastion-scale-units`: Validate scale units

### 8. VNet Peering

#### VNet Peering Configuration (src/networking/vnet-peering.ts)
```typescript
interface VNetPeeringConfig {
  name: string;
  remoteVNetId: string;
  allowVirtualNetworkAccess: boolean;
  allowForwardedTraffic: boolean;
  allowGatewayTransit: boolean;
  useRemoteGateways: boolean;
}
```

**Helpers**:
- `vnet-peering-name`: Generate peering name
- `vnet-peering-config`: Format peering configuration
- `vnet-peering-remote-id`: Format remote VNet resource ID

## CLI Commands (8 new)

### VNet Commands (3)
1. **`azmp vm network list-vnets`**
   - List available VNet templates
   - Show address spaces and subnet counts

2. **`azmp vm network create-vnet`**
   - Create VNet configuration
   - Options: `--name`, `--address-space`, `--subnets`

3. **`azmp vm network validate-vnet`**
   - Validate VNet configuration
   - Check CIDR conflicts, subnet overlaps

### NSG Commands (2)
4. **`azmp vm network list-nsg-rules`**
   - List common NSG rule templates
   - Filter by scenario (web/db/app)

5. **`azmp vm network create-nsg`**
   - Generate NSG with rules
   - Options: `--scenario`, `--custom-rules`

### Load Balancer Commands (2)
6. **`azmp vm network create-lb`**
   - Create load balancer configuration
   - Options: `--sku`, `--type`, `--backend-pool`

7. **`azmp vm network validate-lb`**
   - Validate load balancer configuration
   - Check probe settings, rule conflicts

### Network Validation (1)
8. **`azmp vm network validate-all`**
   - Comprehensive network validation
   - Check VNet, subnets, NSG, load balancer
   - Validate address space conflicts
   - Check NSG rule priorities

## Implementation Plan

### Week 1: VNet & Subnets (Days 1-2)
- [ ] Create VNet database with templates
- [ ] Implement subnet configuration
- [ ] Add VNet/subnet helpers (10+ helpers)
- [ ] Add VNet CLI commands (3 commands)
- [ ] Write tests for VNet features (8-10 tests)

### Week 2: NSG & Security (Days 3-4)
- [ ] Create NSG rule database
- [ ] Implement common rule templates
- [ ] Add NSG helpers (8+ helpers)
- [ ] Add NSG CLI commands (2 commands)
- [ ] Write tests for NSG features (8-10 tests)

### Week 3: Load Balancing (Days 5-6)
- [ ] Create load balancer database
- [ ] Implement public IP configuration
- [ ] Add load balancer helpers (8+ helpers)
- [ ] Add load balancer CLI commands (2 commands)
- [ ] Write tests for LB features (8-10 tests)

### Week 4: Advanced & Integration (Days 7-8)
- [ ] Add Application Gateway support
- [ ] Add Bastion configuration
- [ ] Add VNet peering
- [ ] Add network validation command
- [ ] Enhance ARM templates with networking
- [ ] Write integration tests (8-10 tests)
- [ ] Update documentation

## ARM Template Enhancements

### New Template Sections
```json
{
  "resources": [
    {
      "type": "Microsoft.Network/virtualNetworks",
      "apiVersion": "2023-05-01",
      "name": "[parameters('vnetName')]",
      "properties": {
        "addressSpace": { ... },
        "subnets": [ ... ]
      }
    },
    {
      "type": "Microsoft.Network/networkSecurityGroups",
      "apiVersion": "2023-05-01",
      "name": "[parameters('nsgName')]",
      "properties": {
        "securityRules": [ ... ]
      }
    },
    {
      "type": "Microsoft.Network/loadBalancers",
      "apiVersion": "2023-05-01",
      "name": "[parameters('lbName')]",
      "properties": { ... }
    }
  ]
}
```

## Testing Strategy

### Unit Tests (30+ tests)
- VNet helper tests (10 tests)
- Subnet helper tests (8 tests)
- NSG helper tests (10 tests)
- Load balancer helper tests (8 tests)
- Public IP helper tests (4 tests)

### Integration Tests (10+ tests)
- VNet with multiple subnets
- NSG with common rule sets
- Load balancer with health probes
- Complete network stack (VNet + NSG + LB)
- VNet peering scenarios

### CLI Tests (8+ tests)
- Test all new CLI commands
- Validate command options
- Test error handling

## Documentation Updates

### New Documentation
1. **NETWORKING_GUIDE.md**: Comprehensive networking guide
2. **NSG_RULES_REFERENCE.md**: NSG rule templates and examples
3. **LOAD_BALANCER_GUIDE.md**: Load balancer configuration guide
4. **VNET_PATTERNS.md**: Common VNet patterns and best practices

### Updated Documentation
- **README.md**: Add Phase 2 features
- **PHASE2_SUMMARY.md**: Complete implementation details
- **GETTING_STARTED.md**: Add networking examples

## Success Metrics

### Quantitative
- **30+ helpers**: VNet, subnet, NSG, LB, public IP, advanced
- **8+ CLI commands**: Network configuration and validation
- **40+ tests passing**: Comprehensive test coverage
- **Zero breaking changes**: Backward compatible with v1.1.0

### Qualitative
- **Easy to use**: Simple helpers for common scenarios
- **Comprehensive**: Cover 80% of networking use cases
- **Well documented**: Clear examples and guides
- **Production ready**: Enterprise-grade features

## Risk Assessment

### Low Risk
- ✅ Building on proven Phase 1 foundation
- ✅ Incremental additions, no breaking changes
- ✅ Comprehensive testing strategy

### Medium Risk
- ⚠️ Complex networking concepts (load balancers, gateways)
- ⚠️ ARM template size may increase significantly
- **Mitigation**: Nested templates, clear documentation

### Dependencies
- ✅ Phase 1 (v1.1.0) complete
- ✅ Plugin system stable (azure-marketplace-generator v3.1.0)
- ✅ No external dependencies

## Benefits

### For Users
- 🎯 **Easy networking setup**: Pre-configured VNet templates
- 🔒 **Secure by default**: Common NSG rule templates
- ⚡ **Load balancing**: Built-in LB configuration
- 📊 **Validation**: Network validation before deployment

### For Developers
- 🛠️ **30+ helpers**: Rich networking helper ecosystem
- 📦 **Reusable components**: VNet, subnet, NSG templates
- ✅ **Type-safe**: Full TypeScript type safety
- 📚 **Well documented**: Comprehensive guides

### For Templates
- 🌐 **Complete network stack**: VNet + subnets + NSG + LB
- 🔄 **Hub-spoke patterns**: Enterprise networking patterns
- 🔗 **VNet peering**: Multi-VNet architectures
- 🛡️ **Security**: NSG rules for common scenarios

## Alternative Approaches Considered

### Option A: Basic Networking Only (NOT RECOMMENDED)
- Only VNet and subnets
- Skip NSG, load balancer, advanced features
- **Pros**: Faster implementation
- **Cons**: Incomplete solution, users need more

### Option B: Full Networking in One Phase (NOT RECOMMENDED)
- Include all networking features at once
- **Pros**: Complete networking solution
- **Cons**: Too large, high risk, longer development

### Option C: Phase 2 as Proposed (RECOMMENDED) ✅
- Comprehensive but focused on core networking
- VNet, subnets, NSG, load balancer, public IP
- Advanced features (App Gateway, Bastion) included
- **Pros**: Balanced scope, manageable, complete
- **Cons**: None significant

## Next Steps After Approval

1. **Create feature branch**: `feature/phase2-advanced-networking`
2. **Implement VNet features**: Database, helpers, commands (Days 1-2)
3. **Implement NSG features**: Rules, templates, helpers (Days 3-4)
4. **Implement Load Balancer**: Configuration, helpers (Days 5-6)
5. **Add advanced features**: App Gateway, Bastion, peering (Days 7-8)
6. **Testing**: Comprehensive unit and integration tests
7. **Documentation**: Complete guides and examples
8. **Create PR**: Review and merge to develop
9. **Release v1.2.0**: Tag and publish

## Questions for Discussion

1. **Scope**: Is the proposed scope appropriate? Should we add/remove features?
2. **Priorities**: Which networking features are most important?
3. **Templates**: Should we include Application Gateway in Phase 2 or defer to Phase 3?
4. **Timeline**: Is 2-3 days realistic? Should we extend?
5. **Testing**: Is 40+ tests sufficient coverage?

## Conclusion

Phase 2 - Advanced Networking builds naturally on Phase 1's foundation, adding comprehensive networking capabilities that are essential for production VM deployments. The scope is well-defined, risks are manageable, and the benefits are clear.

This phase will transform the VM plugin from a basic VM generator to a complete infrastructure-as-code solution for Azure VMs with enterprise-grade networking.

**Status**: 📋 Awaiting approval to proceed

---

**Prepared by**: Azure Marketplace Generator AI Assistant  
**Date**: October 22, 2025  
**Version**: 1.0  
**Review Status**: Pending
