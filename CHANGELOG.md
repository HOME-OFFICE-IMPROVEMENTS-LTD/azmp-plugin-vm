# Changelog

All notable changes to the Azure Marketplace Generator VM Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-10-22

### Added - Phase 2: Advanced Networking Features

#### Networking Modules (7 new modules)
- **Virtual Networks (VNets)** - Complete VNet configuration and management
  - 5 VNet templates (hub, spoke, isolated, shared, workload)
  - CIDR validation and IP address calculations
  - 9 service endpoints for Azure services
  - 10 subnet delegations for specialized services
  - Address space management utilities

- **Subnets** - Comprehensive subnet pattern library
  - 12 pre-configured subnet patterns (web, app, data, AKS, etc.)
  - Subnet overlap detection
  - Reserved subnet name validation
  - Service endpoint configurations

- **Network Security Groups (NSG)** - Enterprise security templates
  - 24 predefined security rules (RDP, SSH, HTTP, HTTPS, SQL, etc.)
  - 8 NSG templates for different tiers (web, app, data, DMZ)
  - 14 service tags for Azure services
  - Priority management and validation
  - Multi-tier security architectures

- **Load Balancers** - High availability and traffic distribution
  - 5 load balancer templates (public, internal, HA web, HA app, cross-region)
  - 10 health probe configurations (HTTP, HTTPS, TCP)
  - 7 load balancing rules with session persistence
  - 2 inbound NAT rule templates
  - Backend pool management

- **Application Gateway** - Web application delivery and protection
  - 4 Application Gateway templates (basic, WAF-enabled, multi-site, high-security)
  - Web Application Firewall (WAF) integration (Detection/Prevention modes)
  - SSL policy configurations (5 predefined policies)
  - Path-based routing with URL path maps
  - Multi-site hosting capabilities
  - HTTP/2 support
  - Backend pool, HTTP settings, and listener configurations

- **Azure Bastion** - Secure VM access without public IPs
  - 5 Bastion templates (basic, standard, premium, developer, production)
  - 3 SKU tiers (Basic, Standard, Premium)
  - 5 advanced features (tunneling, IP connect, shareable link, file copy, scale units)
  - Scale units configuration (2-50 units, ~20 sessions per unit)
  - Feature availability by SKU tier

- **VNet Peering** - Network connectivity and hub-and-spoke topologies
  - 5 VNet peering templates (hub, spoke, mesh, point-to-point, transit)
  - 3 hub-and-spoke topologies (single-hub, dual-hub, regional-hub)
  - 4 common peering scenarios (dev-prod isolation, multi-tier app, shared services, cross-region)
  - Gateway transit configuration
  - Mesh and hub-spoke connection calculations
  - Virtual network access and forwarded traffic settings

#### Handlebars Helpers (82 new helpers, 104 total)

**VNet & Subnet Helpers (23 helpers):**
- `vnet-template` - Get VNet configuration template
- `vnet-address-space` - Get VNet address space
- `vnet-service-endpoints` - Get service endpoints
- `vnet-delegation` - Get subnet delegation
- `subnet-pattern` - Get subnet configuration pattern
- `subnet-calculate-ips` - Calculate usable IPs
- `subnet-validate-cidr` - Validate CIDR notation
- `subnet-overlaps` - Check subnet overlap
- `subnet-name` - Generate subnet name
- And 14 more helpers...

**NSG Helpers (14 helpers):**
- `nsg-rule` - Get security rule configuration
- `nsg-template` - Get NSG template
- `nsg-validate-priority` - Validate rule priority
- `nsg-service-tag` - Get service tag
- `nsg-create-rule` - Create custom rule
- `nsg-name` - Generate NSG name
- And 8 more helpers...

**Load Balancer Helpers (17 helpers):**
- `lb-template` - Get load balancer template
- `lb-health-probe` - Get health probe configuration
- `lb-rule` - Get load balancing rule
- `lb-nat-rule` - Get NAT rule template
- `lb-validate-probe-interval` - Validate probe settings
- `lb-name` - Generate load balancer name
- And 11 more helpers...

**Application Gateway Helpers (10 helpers):**
- `appgw-template` - Get Application Gateway template
- `appgw-http-settings` - Get HTTP settings
- `appgw-listener` - Get listener configuration
- `appgw-url-path-map` - Get URL path map for routing
- `appgw-validate-capacity` - Validate capacity
- And 5 more helpers...

**Bastion Helpers (9 helpers):**
- `bastion-template` - Get Bastion template
- `bastion-feature` - Get feature configuration
- `bastion-feature-available` - Check feature availability
- `bastion-recommended-scale` - Calculate scale units
- And 5 more helpers...

**VNet Peering Helpers (9 helpers):**
- `peering-template` - Get peering template
- `peering-hub-spoke` - Get hub-and-spoke topology
- `peering-scenario` - Get peering scenario
- `peering-mesh-count` - Calculate mesh connections
- And 5 more helpers...

#### CLI Commands (10 new commands, 16 total)

**VNet & Subnet Commands:**
- `vm network list-vnet-templates` - List VNet templates with filtering
- `vm network list-subnet-patterns` - List subnet patterns with search
- `vm network list-service-endpoints` - List available service endpoints

**NSG Commands:**
- `vm network list-nsg-rules` - List security rules with filtering
- `vm network list-nsg-templates` - List NSG templates

**Load Balancer Commands:**
- `vm network list-lb-templates` - List load balancer templates
- `vm network list-health-probes` - List health probe configurations

**Advanced Networking Commands:**
- `vm network list-appgw-templates` - List Application Gateway templates
- `vm network list-bastion-templates` - List Bastion templates
- `vm network list-peering-templates` - List VNet peering templates

#### Tests (77 new tests, 101 total)
- VNet & Subnet tests: 16 tests
- NSG tests: 14 tests
- Load Balancer tests: 19 tests
- Application Gateway tests: 10 tests
- Bastion tests: 9 tests
- VNet Peering tests: 9 tests
- All tests passing with 100% success rate

#### Documentation
- `PHASE2_PROPOSAL.md` - Complete Phase 2 proposal (501 lines)
- `PHASE2_DAYS1-2_SUMMARY.md` - VNet & Subnets milestone summary (306 lines)
- `PHASE2_DAYS3-4_SUMMARY.md` - NSG features milestone summary (311 lines)
- `PHASE2_DAYS5-6_SUMMARY.md` - Load Balancer milestone summary (593 lines)
- `PHASE2_DAYS7-8_SUMMARY.md` - Advanced features milestone summary (595 lines)

### Code Statistics
- **Total Lines Added:** 6,593 lines
- **Networking Code:** 4,586 lines across 7 modules
- **Test Code:** 537 new test lines
- **Documentation:** 2,306 documentation lines

### Changed
- Updated `src/index.ts` - Integrated all 82 networking helpers
- Updated `src/__tests__/index.test.ts` - Added comprehensive test coverage
- Version bumped from 1.1.0 to 1.2.0

### Breaking Changes
None. All changes are backward compatible with v1.1.0.

### Upgrade Notes
Direct upgrade from v1.1.0 is supported. No migration required.

---

## [1.1.0] - 2024-10-22

### Added - Phase 1: Core VM Functionality

#### VM Configuration
- **VM Sizes** - 40+ Azure VM size configurations
  - General Purpose (B, D series)
  - Compute Optimized (F series)
  - Memory Optimized (E series)
  - Storage Optimized (L series)
  - GPU (N series)
  - High Performance Compute (H series)

- **OS Images** - 20+ operating system images
  - Windows Server (2012 R2, 2016, 2019, 2022)
  - Linux distributions (Ubuntu, RHEL, CentOS, SLES, Debian)
  - Specialized images (SQL Server, Oracle)

- **Storage Configuration**
  - Multiple disk types (Standard HDD/SSD, Premium SSD, Ultra Disk)
  - OS disk configuration
  - Data disk management
  - Disk caching options

- **Basic Networking**
  - Network interface configuration
  - Public IP assignment
  - Private IP configuration
  - Basic NSG association

#### Handlebars Helpers (22 helpers)
- VM size helpers (list, get, filter by family)
- OS image helpers (list, get, filter by OS type)
- Storage helpers (disk configuration, caching)
- Basic networking helpers

#### CLI Commands (6 commands)
- `vm list-sizes` - List available VM sizes
- `vm list-images` - List available OS images
- `vm list-families` - List VM size families
- `vm get-size` - Get specific VM size details
- `vm get-image` - Get specific OS image details
- `vm filter-sizes` - Filter VM sizes by family

#### Tests (24 tests)
- VM size tests
- OS image tests
- Storage configuration tests
- Basic networking tests

#### Documentation
- README.md with usage examples
- API documentation for all helpers
- CLI command reference

### Initial Release Features
- TypeScript implementation
- Jest testing framework
- ESLint and Prettier configuration
- Git Flow branching model
- MIT License

---

## Release Links

- [v1.2.0](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/releases/tag/v1.2.0) - Advanced Networking Features
- [v1.1.0](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/releases/tag/v1.1.0) - Core VM Functionality

## Repository

https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm
