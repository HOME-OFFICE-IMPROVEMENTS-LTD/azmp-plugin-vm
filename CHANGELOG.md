# Changelog

All notable changes to the Azure Marketplace Generator VM Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-10-25

### Added - Day 6: Enterprise Scaling Stack

#### Overview
Day 6 delivers comprehensive enterprise scaling capabilities with 14 new helpers across 4 modules, enabling VM Scale Sets (VMSS), auto-scaling, multi-region deployments, and advanced load balancing.

#### Virtual Machine Scale Sets (4 helpers, scale: namespace)

**VMSS Orchestration:**
- **scale:vmssUniform** - Uniform orchestration mode VMSS configuration
  - Identical VM instances with centralized management
  - Automatic load balancer integration
  - Built-in auto-scaling support
  - Best for stateless workloads (web servers, APIs)
  - API version: 2023-09-01
  - Supports: automatic OS upgrades, rolling updates, health monitoring
  - SLA: 99.95% with 2+ instances

- **scale:vmssFlexible** - Flexible orchestration mode VMSS configuration
  - Heterogeneous VM management (mixed sizes/images)
  - Zone-aware distribution
  - Fault domain spreading (1-3 domains)
  - Best for stateful workloads (databases, microservices)
  - API version: 2023-09-01
  - Supports: VM profiles, proximity placement groups, manual scaling
  - SLA: 99.95-99.99% with zones

- **scale:vmssOrchestration** - Orchestration mode comparison and selection
  - Uniform vs Flexible feature matrix
  - Workload type recommendations
  - SLA comparison
  - Migration considerations
  - Decision tree for mode selection

- **scale:vmssScaleInPolicy** - Scale-in policy configuration
  - Default: Balanced across zones and fault domains
  - NewestVM: Remove newest instances first
  - OldestVM: Remove oldest instances first
  - Custom priorities with VM protection rules
  - Force deletion options for non-responsive instances

#### Auto-Scaling (4 helpers, scale: namespace)

**Auto-Scale Configuration:**
- **scale:autoScaleMetric** - Metric-based auto-scaling rules
  - Built-in metrics: Percentage CPU, Memory, Network In/Out, Disk Operations
  - Custom metrics from Application Insights or Azure Monitor
  - Threshold-based triggers with time windows (1-60 minutes)
  - Scale actions: ChangeCount, PercentChangeCount, ExactCount
  - Cooldown periods (1-60 minutes) to prevent flapping
  - Statistic types: Average, Min, Max, Sum
  - API version: 2022-10-01

- **scale:autoScaleSchedule** - Schedule-based auto-scaling profiles
  - Recurrence patterns: Daily, Weekly
  - Time zone support (100+ time zones)
  - Multiple schedules for different time windows
  - Capacity configuration: min, max, default instance counts
  - Business hours vs off-hours profiles
  - Holiday/special event scheduling

- **scale:autoScalePredictive** - Predictive auto-scaling configuration
  - Forecast-based scaling using historical data
  - Scale modes: ForecastOnly, ForecastAndScale
  - Look-ahead time: 5 minutes to 2 hours
  - Machine learning-based predictions
  - Proactive scaling before demand spikes
  - Azure Monitor integration for forecasts
  - Preview feature (may require feature flag)

- **scale:autoScaleNotification** - Auto-scale notifications and webhooks
  - Email notifications for scale operations
  - Webhook integration for custom automation
  - Notification types: scale up, scale down, failure
  - Multiple recipients and webhook URLs
  - JSON payload with scale event details
  - Integration with Azure Logic Apps, Azure Functions

#### Multi-Region (3 helpers, scale: namespace)

**Multi-Region Deployment:**
- **scale:multiRegionTrafficManager** - Azure Traffic Manager configuration
  - Routing methods: Performance, Priority, Weighted, Geographic, MultiValue, Subnet
  - DNS-based traffic distribution
  - Health monitoring: HTTP, HTTPS, TCP probes
  - Automatic failover with configurable thresholds
  - Global DNS TTL configuration
  - Endpoint management: Azure, External, Nested profiles
  - Global load balancing with lowest latency routing

- **scale:multiRegionFrontDoor** - Azure Front Door configuration
  - HTTP/S acceleration with global edge locations
  - Backend pool configuration with multiple regions
  - Health probes: HTTP/HTTPS with custom paths
  - Load balancing: Latency-based, Priority-based, Weighted
  - Session affinity support
  - Routing rules with URL path matching
  - SSL offloading and WAF integration
  - API version: 2021-06-01

- **scale:multiRegionPaired** - Azure paired regions configuration
  - 50+ region pairs for disaster recovery
  - Automatic region pair lookup
  - Bidirectional replication support
  - Priority-based deployment (primary vs secondary)
  - Paired region advantages: sequential updates, priority recovery
  - Same geography compliance requirements
  - Example pairs: East US ↔ West US, North Europe ↔ West Europe

#### Load Balancing (3 helpers, scale: namespace)

**Advanced Load Balancing:**
- **scale:loadBalancingStandard** - Standard Load Balancer configuration
  - Zone-redundant frontend IPs
  - Cross-zone load balancing
  - Outbound rules for SNAT
  - HA ports for all ports load balancing
  - Health probe: TCP, HTTP, HTTPS
  - Load distribution: 5-tuple hash (default), source IP affinity
  - Session persistence: None, Client IP, Client IP and protocol
  - SKU: Standard (required for zones)

- **scale:loadBalancingAppGateway** - Application Gateway v2 configuration
  - Layer 7 load balancing (HTTP/HTTPS)
  - Auto-scaling: min 2, max 125 instances
  - WAF v2 integration (OWASP CRS 3.2)
  - URL path-based routing
  - Multi-site hosting
  - SSL termination and end-to-end SSL
  - Connection draining
  - Health probes with custom intervals
  - Backend pools with VMSS integration

- **scale:loadBalancingCrossRegion** - Cross-region load balancer
  - Global load balancing across multiple regions
  - Instant global failover
  - Premium tier required
  - Geo-redundant IP anycast
  - Health-based routing
  - Low latency cross-region routing
  - Supports only Standard Load Balancers as backends

#### Integration Tests (13 new tests)

**VMSS Integration (3 tests):**
- VMSS Uniform mode template validation
- VMSS Flexible mode template validation
- VMSS with VMs reference validation

**Auto-Scaling Integration (3 tests):**
- Metric-based auto-scaling rules
- Schedule-based auto-scaling profiles
- Predictive auto-scaling configuration

**Multi-Region Integration (3 tests):**
- Traffic Manager multi-region deployment
- Azure Front Door multi-region deployment
- Paired regions deployment

**Load Balancing Integration (2 tests):**
- Standard Load Balancer with VMSS
- Application Gateway with VMSS backend

**Complete Workflow Integration (2 tests):**
- Complete VMSS deployment with auto-scaling and load balancing
- Complete multi-region deployment with all scaling features

#### Handlebars Helpers (14 new helpers, 177 total)

**Scaling Helpers (scale: namespace):**
- `scale:vmssUniform` - Uniform VMSS configuration
- `scale:vmssFlexible` - Flexible VMSS configuration
- `scale:vmssOrchestration` - Orchestration mode comparison
- `scale:vmssScaleInPolicy` - Scale-in policy configuration
- `scale:autoScaleMetric` - Metric-based auto-scaling
- `scale:autoScaleSchedule` - Schedule-based auto-scaling
- `scale:autoScalePredictive` - Predictive auto-scaling
- `scale:autoScaleNotification` - Auto-scale notifications
- `scale:multiRegionTrafficManager` - Traffic Manager config
- `scale:multiRegionFrontDoor` - Front Door config
- `scale:multiRegionPaired` - Paired regions config
- `scale:loadBalancingStandard` - Standard LB config
- `scale:loadBalancingAppGateway` - Application Gateway config
- `scale:loadBalancingCrossRegion` - Cross-region LB config

#### CLI Commands (44 total, unchanged from v1.5.0)

All existing CLI commands remain functional:
- **Core VM:** 2 commands (list-sizes, list-images)
- **High Availability:** 4 commands (zones, zone-check, sla, ha-config)
- **Recovery:** 6 commands (backup-size, region-pairs, rto, backup-presets, snapshot-policies, snapshot-schedule)
- **Networking:** 7 groups (vnet, subnet, nsg, lb, appgw, bastion, peering)
- **Extensions:** 4 commands (list, list-windows, list-linux, list-crossplatform)
- **Security:** 4 commands (list, list-encryption, list-trusted-launch, list-compliance)
- **Identity:** 4 commands (list, list-managed-identity, list-aad-features, list-rbac-roles)

**Note:** Scaling helpers are available for template generation but not yet exposed via CLI commands. CLI integration planned for future release.

#### Tests (13 new tests, 279 total)

**Test Count by Category:**
- Core VM: 24 tests
- Networking: 77 tests
- Extensions: 43 tests
- Identity: 54 tests
- Availability: 39 tests
- Recovery: 24 tests
- Scaling: 5 tests
- **Integration: 13 tests** ← NEW
- **Total:** 279 tests (exceeds 277 target)

**All Tests Passing:** ✅ 279/279 (100% success rate)

#### Documentation (3 new docs, 800+ lines)

**New Documentation:**
- `docs/SCALING.md` - Comprehensive scaling documentation (800+ lines)
  - Helper reference with examples
  - Orchestration mode comparison
  - Auto-scaling strategies (metric/schedule/predictive)
  - Multi-region deployment patterns
  - Load balancing configurations
  - Best practices and troubleshooting
  - Integration examples
  
- `docs/DAY6_SUMMARY.md` - Day 6 achievement summary (350+ lines)
  - Objectives achieved
  - Technical achievements
  - Code quality metrics
  - Lessons learned
  - Performance characteristics

- `docs/CLI_TESTING_RESULTS.md` - CLI testing documentation (950+ lines)
  - All 44 CLI commands tested
  - Detailed validation results
  - Helper count verification (177 helpers)
  - Edge cases and error handling
  - Performance testing
  - Certification: production-ready

**Updated Documentation:**
- `README.md` - Updated with scaling features section (170+ lines)
  - 6 new usage examples (VMSS Uniform, VMSS Flexible, auto-scaling, multi-region, load balancing)
  - Feature list updated with "Enterprise Scaling" section
  - Statistics updated: 177 helpers, 44 CLI commands, 279 tests
  - Footer updated to v1.6.0

### Code Statistics

**Lines Added:** ~1,800 lines
- **Scaling Module:** 634 lines (src/scaling/index.ts)
- **Integration Tests:** 950 lines (src/__tests__/integration.test.ts)
- **Documentation:** ~1,000 lines across 3 new docs
- **README Updates:** 170+ lines

**Total Plugin Size:**
- Source Code: ~15,000 lines
- Test Code: ~6,500 lines
- Documentation: ~8,000 lines
- **Total:** ~29,500 lines

### Changed

- Updated `src/index.ts` - Integrated 14 scaling helpers with scale: namespace
- Updated `package.json` - Version bumped from 1.5.0 to 1.6.0
- Updated `README.md` - Added Enterprise Scaling section with examples
- Updated `src/__tests__/index.test.ts` - Updated version expectations to 1.6.0

### Template Enhancements

**mainTemplate.json.hbs:**
- VMSS resource type support
- Auto-scale settings integration
- Multi-region deployment patterns
- Advanced load balancer configurations

**createUiDefinition.json.hbs:**
- Scaling configuration step (new)
- VMSS orchestration mode selector
- Auto-scaling policy configuration
- Multi-region deployment options
- Load balancing strategy selector

### Performance Characteristics

**VMSS Performance:**
- Uniform mode: Up to 1,000 instances per scale set
- Flexible mode: Up to 1,000 VMs per scale set
- Scale-up time: ~30-60 seconds per instance
- Scale-down time: ~15-30 seconds per instance

**Auto-Scaling:**
- Metric evaluation: Every 1 minute (configurable)
- Scale action execution: 30-90 seconds
- Cooldown periods: Configurable (1-60 minutes)
- Predictive forecasts: 5 minutes to 2 hours ahead

**Multi-Region:**
- Traffic Manager DNS TTL: 30-300 seconds (configurable)
- Front Door propagation: ~10 minutes globally
- Failover time: 30-60 seconds (Traffic Manager), <30 seconds (Front Door)

**Load Balancing:**
- Standard LB throughput: Up to 1 Tbps
- Application Gateway throughput: Up to 10 Gbps with autoscale
- Health probe interval: 5-60 seconds (configurable)
- Connection draining: 0-600 seconds

### Breaking Changes

None. All changes are backward compatible with v1.5.0.

### Upgrade Notes

Direct upgrade from v1.5.0 is supported. No migration required.

**New Capabilities:**
1. Use `scale:vmssUniform` or `scale:vmssFlexible` for VMSS deployments
2. Configure auto-scaling with `scale:autoScaleMetric` or `scale:autoScaleSchedule`
3. Deploy multi-region with `scale:multiRegionTrafficManager` or `scale:multiRegionFrontDoor`
4. Advanced load balancing with `scale:loadBalancingAppGateway`

**Existing Features:**
All v1.5.0 helpers and CLI commands continue to work unchanged.

### SLA & Reliability

**VMSS SLA:**
- Uniform mode (2+ instances): 99.95%
- Flexible mode (2+ zones): 99.99%
- Single instance (Premium SSD): 99.9%

**Multi-Region SLA:**
- Traffic Manager: 99.99%
- Front Door: 99.99%
- Paired regions: Enhanced disaster recovery

**Load Balancer SLA:**
- Standard LB: 99.99%
- Application Gateway v2: 99.95%
- Cross-region LB: 99.99%

### Best Practices

**VMSS Orchestration:**
- Use Uniform for stateless workloads (web servers)
- Use Flexible for stateful workloads (databases)
- Enable zone distribution for maximum availability
- Configure scale-in policies to protect critical instances

**Auto-Scaling:**
- Start with metric-based scaling for dynamic workloads
- Add schedule-based profiles for predictable patterns
- Use predictive scaling for proactive capacity planning
- Set appropriate cooldown periods to prevent flapping
- Monitor auto-scale activities with Azure Monitor

**Multi-Region:**
- Choose Traffic Manager for DNS-based routing
- Choose Front Door for HTTP acceleration and WAF
- Use paired regions for disaster recovery
- Implement health monitoring for automatic failover
- Test failover procedures regularly

**Load Balancing:**
- Use Standard LB for general TCP/UDP workloads
- Use Application Gateway for HTTP/HTTPS workloads
- Enable zone-redundancy for maximum availability
- Configure health probes appropriate to application
- Monitor backend pool health continuously

### Security Notes

- VMSS instances support all v1.5.0 security features
- Application Gateway integrates with WAF for web protection
- Cross-region load balancers support private endpoints
- Auto-scale notifications can integrate with security operations
- Multi-region deployments support Azure Private Link

### Compliance Support

Day 6 scaling features maintain support for all 6 compliance frameworks from v1.3.0:
- SOC 2, PCI-DSS, HIPAA, ISO 27001, NIST 800-53, FedRAMP

Additional compliance considerations:
- Data residency with paired regions (same geography)
- Geo-redundant deployments with Traffic Manager
- Audit logs for all scaling operations
- Compliance-aware load balancing rules

### Known Limitations

1. **Predictive Auto-Scaling:** Preview feature, requires feature flag in some regions
2. **Cross-Region LB:** Premium tier required, limited region availability
3. **VMSS Limits:** 1,000 instances per scale set (request quota increase for more)
4. **Front Door:** WAF rules limited to 100 custom rules per policy

### Future Enhancements

Planned for future releases:
- CLI commands for scaling operations (e.g., `azmp scale vmss`, `azmp scale auto-scale`)
- Azure Container Instances integration
- Kubernetes (AKS) scaling patterns
- Cost optimization recommendations
- Real-time scaling analytics dashboard

---

## [1.4.0] - 2024-12-19

### Added - Phase 4: High Availability and Disaster Recovery

#### High Availability (25 helpers, 5 CLI commands)

**Availability Sets:**
- **availabilitySet** - Generate availability set configuration
  - Fault domain and update domain configuration (2-3 fault domains, 2-20 update domains)
  - Platform update and fault protection
  - Proximity placement group support
  - 99.95% SLA guarantee
- **availabilitySetRef** - Reference existing availability set
- **recommendedFaultDomains** - Get optimal fault domain count based on VM count
- **recommendedUpdateDomains** - Get optimal update domain count based on VM count
- **availabilitySetSLA** - Return 99.95% SLA for availability sets
- **validateAvailabilitySet** - Validate availability set configuration
- **proximityPlacementGroup** - Create proximity placement groups for low network latency

**Availability Zones:**
- **getAvailableZones** - Get list of availability zones for a region (26+ supported regions)
- **supportsAvailabilityZones** - Check if region supports availability zones
- **zonalVM** - Create VM in specific availability zone
- **zoneRedundantDisk** - Create zone-redundant managed disk
- **zoneRedundantIP** - Create zone-redundant public IP address
- **availabilityZoneSLA** - Return 99.99% SLA for zonal deployments
- **recommendZoneDistribution** - Recommend optimal zone distribution for VM count
- **validateZoneConfig** - Validate zone configuration
- **getZoneSupportedRegions** - List all regions supporting availability zones

**Virtual Machine Scale Sets (VMSS):**
- **vmssFlexible** - Create VMSS with Flexible orchestration mode
  - Zone distribution support
  - Fault domain spreading
  - Best for mixed workloads
  - 99.95-99.99% SLA
- **vmssUniform** - Create VMSS with Uniform orchestration mode
  - Autoscale support
  - Identical VM instances
  - Best for stateless workloads
- **vmssAutoscale** - Configure autoscaling rules
  - Metric-based scaling (CPU, memory, custom metrics)
  - Schedule-based scaling
  - Min/max instance configuration
- **vmssSLA** - Return SLA based on orchestration mode and zones
- **validateVMSSConfig** - Validate VMSS configuration

**CLI Commands (5 commands):**
- `availability list-zones` - List availability zones for a region
- `availability check-zone-support` - Check if region supports zones
- `availability calculate-sla` - Calculate SLA for HA configuration
- `availability recommend-config` - Recommend HA setup based on workload

#### Disaster Recovery (19 helpers, 7 CLI commands)

**Azure Backup:**
- **recoveryServicesVault** - Create Recovery Services vault for backup and site recovery
  - Standard or GRS redundancy
  - Soft delete and security features
- **backupPolicy** - Create VM backup policy
  - Daily/weekly backup schedules
  - Retention policies (7 days to 10 years)
  - Azure/local timezone support
- **enableVMBackup** - Enable Azure Backup for VMs
- **BackupPresets** - Predefined backup policies
  - Development: Daily backups, 7 days retention
  - Production: Daily backups, 30 days retention
  - Long-term: Daily backups, 365 days retention with monthly/yearly copies
- **estimateBackupStorage** - Calculate backup storage requirements
  - Initial full backup size
  - Daily incremental backups
  - Compression ratio consideration
- **validateBackupPolicy** - Validate backup policy configuration

**Azure Site Recovery:**
- **replicationPolicy** - Create ASR replication policy
  - Recovery point retention (1-72 hours)
  - App-consistent snapshot frequency
  - Crash-consistent snapshot frequency
- **RegionPairs** - Azure region pairs for disaster recovery
  - 50+ paired regions worldwide
  - Bidirectional failover support
- **getRecommendedTargetRegion** - Get recommended DR target region
- **estimateRTO** - Calculate Recovery Time Objective
  - Base failover time: 10 minutes
  - Per-VM overhead
  - Data transfer time
- **estimateRPO** - Calculate Recovery Point Objective
- **failoverConfig** - Configure failover settings

**Snapshots:**
- **diskSnapshot** - Create VM disk snapshots
  - Incremental or full snapshots
  - Network access policies
- **restorePointCollection** - Create restore point collections
  - VM-wide restore points
  - Manual or scheduled creation
  - Consistency modes (application/crash/file system)
- **SnapshotRetentionPolicies** - Predefined retention policies
  - Hourly: 24 snapshots (1 day retention)
  - Daily: 7 snapshots (1 week retention)
  - Weekly: 4 snapshots (1 month retention)
  - Monthly: 12 snapshots (1 year retention)

**CLI Commands (7 commands):**
- `recovery estimate-backup` - Estimate backup storage requirements
- `recovery list-region-pairs` - List Azure region pairs for DR
- `recovery estimate-rto` - Estimate Recovery Time Objective
- `recovery list-backup-presets` - Show backup policy templates
- `recovery list-snapshot-policies` - Show snapshot retention policies
- `recovery recommend-snapshot-schedule` - Recommend snapshot schedule

#### Test Coverage
- **63 new tests added** (39 availability + 24 recovery = 63 tests)
- **224 total tests** (161 Phase 3 + 63 Phase 4 = 224 tests)
- **100% test pass rate**
- Comprehensive coverage of all HA/DR modules

### Changed
- Updated plugin version to 1.4.0
- Enhanced feature summary: 164+ Handlebars helpers (120 Phase 3 + 44 Phase 4)
- Enhanced CLI: 44 commands (32 Phase 3 + 12 Phase 4)

### Technical Details
- **Total Phase 4 code:** 3,267 lines across 8 files
- **Availability module:** 1,443 lines, 25 helpers
- **Recovery module:** 1,824 lines, 19 helpers
- **TypeScript:** Full type safety with strict mode
- **Testing:** Jest with 100% module coverage
- **Integration:** Seamless integration with Phase 3 features

## [1.3.0] - 2024-10-22

### Added - Phase 3: Extensions, Security, and Identity Features

#### VM Extensions (20 extensions across 3 platforms)

**Windows Extensions (8 extensions):**
- **CustomScript Extension** - Run PowerShell scripts during or after VM deployment
  - Script execution from Azure Storage or GitHub
  - Protected settings for sensitive data
  - Windows Server 2012+ support
- **DSC Extension** - Desired State Configuration for infrastructure as code
  - Automated configuration management
  - Idempotent state enforcement
  - Integration with Azure Automation
- **IIS Extension** - Automated IIS web server installation and configuration
  - Web server role setup
  - Feature installation
  - IIS configuration
- **Antimalware Extension** - Microsoft Antimalware protection
  - Real-time protection
  - Scheduled scanning
  - Exclusion rules management
- **Domain Join Extension** - Join VMs to Active Directory domains
  - Domain credentials management
  - Organizational Unit specification
  - Join options configuration
- **Key Vault Extension** - Automatic certificate management from Key Vault
  - Certificate deployment
  - Automatic renewal
  - Multiple certificate support
- **BGInfo Extension** - Display system information on desktop
  - System information display
  - Custom background configuration
  - Auto-refresh settings
- **Chef Client Extension** - Chef configuration management integration
  - Chef server integration
  - Node configuration
  - Cookbook execution

**Linux Extensions (7 extensions):**
- **CustomScript Extension** - Run bash scripts during or after VM deployment
  - Script execution from Azure Storage or GitHub
  - Environment variable support
  - Multi-distro support (Ubuntu, RHEL, CentOS, SLES)
- **cloud-init Extension** - Cloud initialization and configuration
  - Package installation
  - User/group management
  - File writing and command execution
- **Docker Extension** - Docker engine and container deployment
  - Docker engine installation
  - Container deployment from registry
  - Docker Compose support
- **AAD SSH Login Extension** - Azure AD authentication for SSH access
  - Passwordless SSH with Azure AD
  - MFA support
  - RBAC integration
- **Network Watcher Extension** - Network diagnostics and monitoring
  - Packet capture
  - Connection troubleshooting
  - Network topology visualization
- **Diagnostics Extension** - System metrics and log collection
  - Performance metrics collection
  - Log aggregation
  - Azure Monitor integration
- **Backup Extension** - Azure Backup integration
  - Automated backup scheduling
  - Snapshot management
  - Recovery point management

**Cross-Platform Extensions (5 extensions):**
- **Azure Monitor Agent** - Unified monitoring and logging
  - Metrics collection for both platforms
  - Log Analytics integration
  - Data Collection Rules (DCR) support
- **Dependency Agent** - Application dependency mapping
  - Service dependency discovery
  - Network connection tracking
  - Azure Monitor VM Insights integration
- **Guest Configuration Extension** - Policy compliance and configuration
  - Configuration auditing
  - Policy compliance reporting
  - Custom configuration packages
- **Application Health Extension** - Application-level health monitoring
  - HTTP/TCP health probes
  - Custom health signals
  - Load balancer integration
- **Disk Encryption Extension** - Azure Disk Encryption (ADE)
  - OS and data disk encryption
  - Key Vault integration
  - BitLocker (Windows) / dm-crypt (Linux)

#### Security Features (8 security capabilities)

**Disk Encryption (3 types):**
- **Azure Disk Encryption (ADE)** - Full disk encryption with Key Vault
  - OS and data disk encryption
  - Key Vault key management
  - BitLocker (Windows) / dm-crypt (Linux)
  - Encryption key rotation
- **Server-Side Encryption (SSE)** - Encryption at rest with platform-managed or customer-managed keys
  - Automatic encryption for all managed disks
  - Platform-managed keys (PMK)
  - Customer-managed keys (CMK) with Key Vault
  - Automatic Encryption Sets (DES)
- **Encryption at Host** - Complete VM encryption including temp/cache disks
  - Encryption for all VM storage (OS, data, temp, cache)
  - No performance impact
  - Transparent to guest OS
  - DC size support validation

**Trusted Launch (5 features):**
- **Secure Boot** - Protects against rootkits and boot malware
  - UEFI boot chain validation
  - Signed bootloader verification
  - Boot integrity protection
- **vTPM (Virtual Trusted Platform Module)** - Hardware-based security functions
  - Cryptographic key storage
  - Attestation support
  - BitLocker integration
- **Boot Integrity Monitoring** - Detects boot chain tampering
  - PCR measurement logging
  - Azure Monitor integration
  - Alert on anomalies
- **Guest Attestation Extension** - Continuous attestation reporting
  - Boot state validation
  - Compliance reporting
  - Security posture monitoring
- **Microsoft Defender for Cloud Integration** - Security recommendations
  - Trusted Launch status monitoring
  - Security baseline compliance
  - Threat detection

**Security Templates (12 templates):**
- Basic security (single encryption method)
- Enhanced security (ADE + SSE-CMK)
- Maximum security (all encryption + Trusted Launch)
- Compliance templates (SOC2, PCI-DSS, HIPAA, ISO-27001, NIST, FedRAMP)
- Platform-specific templates (Windows/Linux)

**Compliance Frameworks (6 frameworks):**
- SOC 2 (Service Organization Control 2)
- PCI-DSS (Payment Card Industry Data Security Standard)
- HIPAA (Health Insurance Portability and Accountability Act)
- ISO 27001 (Information Security Management)
- NIST 800-53 (Security and Privacy Controls)
- FedRAMP (Federal Risk and Authorization Management Program)

#### Identity & Access Management (3 modules)

**Managed Identity Module:**
- **System-Assigned Identity** - Automatic identity tied to VM lifecycle
  - Azure AD identity creation
  - Automatic lifecycle management
  - Single VM association
- **User-Assigned Identity** - Standalone, shareable identity
  - Independent lifecycle
  - Multi-resource sharing
  - Centralized management
- **Hybrid Identity** - Combined system-assigned and user-assigned
  - Multiple user-assigned identities support
  - Flexibility for different scenarios
- **Identity Creation** - Programmatic identity resource creation
  - Name, location, tags configuration
  - Azure RBAC integration
- **Role Assignments** - RBAC role assignment to identities
  - 17+ built-in role catalog (Contributor, Reader, Key Vault, Storage, etc.)
  - Scope configuration (resource, resource group, subscription, management group)
  - Principal ID and role definition management
- **Recommendations** - Identity recommendations for 6 use cases
  - Key Vault access (user-assigned recommended)
  - Storage account access (system-assigned recommended)
  - SQL database access (user-assigned recommended)
  - Container registry access (system-assigned recommended)
  - Multi-service access (multiple user-assigned recommended)
  - Cross-resource access (user-assigned recommended)
- **Validation** - Configuration validation with errors and warnings

**Azure AD Integration Module:**
- **AAD SSH Login (Linux)** - Azure AD authentication for SSH
  - Passwordless SSH with Azure AD credentials
  - MFA support
  - RBAC integration for VM access
  - Supported distros: Ubuntu 18.04+, Debian 9+, CentOS 7+, RHEL 7+, SLES 12 SP2+
- **AAD RDP Login (Windows)** - Azure AD authentication for RDP
  - Passwordless RDP with Azure AD credentials
  - MFA support
  - Windows Server 2019+ support
- **Conditional Access** - Policy-based access control
  - Multi-factor authentication requirements
  - Device compliance requirements
  - Location-based access restrictions
  - Sign-in risk evaluation
- **Multi-Factor Authentication (MFA)** - Enhanced security with second factor
  - Phone verification (call/SMS)
  - Email verification
  - Microsoft Authenticator app
  - FIDO2 security keys
  - Windows Hello for Business
- **Passwordless Authentication** - Modern authentication methods
  - FIDO2 security keys
  - Windows Hello for Business
  - Microsoft Authenticator app
- **VM Access Roles** - Pre-configured Azure AD roles
  - Virtual Machine Administrator Login
  - Virtual Machine User Login
- **Complete Integration** - Platform-specific AAD integration
  - Linux: SSH login + RBAC
  - Windows: RDP login + RBAC
  - Feature selection and configuration
- **Validation** - AAD configuration validation

**Role-Based Access Control (RBAC) Module:**
- **Built-in Role Assignment** - Assign Azure built-in roles
  - 20+ built-in roles (Contributor, Reader, Owner, Key Vault, Storage, Network, Security, etc.)
  - 4 scope types (resource, resourceGroup, subscription, managementGroup)
  - Principal ID and role name configuration
- **Custom Role Creation** - Define custom RBAC roles
  - Actions (allowed operations)
  - NotActions (denied operations)
  - DataActions (data plane operations)
  - AssignableScopes (where role can be assigned)
  - Role name, description, metadata
- **Scope Management** - Generate scope strings
  - Resource scope: `/subscriptions/{sub}/resourceGroups/{rg}/providers/{provider}/{type}/{name}`
  - Resource group scope: `/subscriptions/{sub}/resourceGroups/{rg}`
  - Subscription scope: `/subscriptions/{sub}`
  - Management group scope: `/providers/Microsoft.Management/managementGroups/{mg}`
- **Role Assignment Template** - ARM template generation
  - Conditional deployment with new GUID
  - Role assignment resource configuration
  - Scope and principal configuration
- **Role Recommendation** - Recommend roles based on required actions
  - Owner (full access)
  - Contributor (manage but not grant access)
  - Reader (read-only access)
  - 4 specific roles (Key Vault, Storage Blob, Network Contributor, Security Admin)
- **Custom Role Templates** - 5 pre-built custom role templates
  - VM Start/Stop Operator
  - VM Backup Operator
  - VM Network Configurator
  - VM Monitor Reader
  - VM Extension Manager
- **Validation** - RBAC configuration validation
- **Best Practices** - Comprehensive RBAC guidance
  - Principles (least privilege, separation of duties, defense in depth)
  - Recommendations (custom roles, regular reviews, PIM, documentation)
  - Anti-patterns (Owner role abuse, wildcards, static assignments, service account sharing)
  - Tools (Azure AD PIM, Azure Policy, Access Reviews, Activity Logs)

#### Handlebars Helpers (85 new helpers, 189 total)

**Extension Helpers (26 helpers, ext: namespace):**
- `ext:windows` - Get Windows extension configuration
- `ext:linux` - Get Linux extension configuration
- `ext:crossplatform` - Get cross-platform extension configuration
- `ext:script` - Generate CustomScript extension configuration
- `ext:domain-join` - Generate domain join extension
- `ext:antimalware` - Generate antimalware extension
- `ext:docker` - Generate Docker extension
- `ext:monitor` - Generate Azure Monitor Agent
- `ext:list` - List extensions by platform
- `ext:template` - Get extension template
- `ext:count` - Count extensions by platform
- `ext:filter-by-feature` - Filter extensions by feature
- `ext:dependencies` - Get extension dependencies
- `ext:multi-extension` - Combine multiple extensions
- And 12 more helpers for specific extensions...

**Security Helpers (26 helpers, security: namespace):**
- `security:ade` - Azure Disk Encryption configuration
- `security:sse-pmk` - Server-Side Encryption with PMK
- `security:sse-cmk` - Server-Side Encryption with CMK
- `security:encryption-at-host` - Encryption at Host configuration
- `security:trusted-launch` - Complete Trusted Launch configuration
- `security:secure-boot` - Secure Boot configuration
- `security:vtpm` - vTPM configuration
- `security:boot-integrity` - Boot integrity monitoring
- `security:guest-attestation` - Guest attestation extension
- `security:defender` - Microsoft Defender integration
- `security:template` - Get security template
- `security:compliance` - Get compliance framework template
- `security:list` - List security features
- `security:count` - Count security features by category
- `security:validate` - Validate security configuration
- `security:recommend` - Recommend security features
- And 10 more helpers for encryption and Trusted Launch...

**Identity Helpers (33 helpers, identity: namespace):**
- **Managed Identity (7 helpers):**
  - `identity:managedidentity.systemAssigned` - System-assigned identity
  - `identity:managedidentity.userAssigned` - User-assigned identity
  - `identity:managedidentity.multiple` - Multiple identities
  - `identity:managedidentity.create` - Create managed identity
  - `identity:managedidentity.recommendations` - Get recommendations
  - `identity:managedidentity.validate` - Validate configuration
  - `identity:managedidentity.roleAssignment` - Create role assignment
- **Azure AD (8 helpers):**
  - `identity:azuread.sshLogin` - AAD SSH Login extension
  - `identity:azuread.windowsLogin` - AAD RDP Login extension
  - `identity:azuread.conditionalAccess` - Conditional Access policy
  - `identity:azuread.mfa` - MFA configuration
  - `identity:azuread.passwordless` - Passwordless authentication
  - `identity:azuread.vmAccessRole` - VM access role
  - `identity:azuread.create` - Complete AAD integration
  - `identity:azuread.validate` - Validate AAD configuration
- **RBAC (13 helpers):**
  - `identity:rbac.assignBuiltInRole` - Assign built-in role
  - `identity:rbac.createCustomRole` - Create custom role
  - `identity:rbac.scope` - Generate scope string
  - `identity:rbac.template` - Role assignment template
  - `identity:rbac.recommend` - Recommend role
  - `identity:rbac.vmStartStopOperator` - VM Start/Stop custom role
  - `identity:rbac.vmBackupOperator` - VM Backup custom role
  - `identity:rbac.vmNetworkConfigurator` - VM Network custom role
  - `identity:rbac.vmMonitorReader` - VM Monitor custom role
  - `identity:rbac.vmExtensionManager` - VM Extension custom role
  - `identity:rbac.validate` - Validate RBAC configuration
  - `identity:rbac.bestPractices` - Get RBAC best practices
  - `identity:rbac.builtInRole` - Get built-in role details
- **Utility (5 helpers):**
  - `identity:list` - List identity features
  - `identity:template` - Get identity template
  - `identity:count` - Count identity features
  - `identity:filterByFeature` - Filter by feature
  - `identity:compliance` - Get compliance template

#### CLI Commands (12 new commands, 32 total)

**Extension Commands (4 commands):**
- `vm ext` - List all available VM extensions
- `vm ext list-windows` - List Windows-specific extensions
- `vm ext list-linux` - List Linux-specific extensions
- `vm ext list-crossplatform` - List cross-platform extensions

**Security Commands (4 commands):**
- `vm security list` - List all security features
- `vm security list-encryption` - List encryption types
- `vm security list-trusted-launch` - List Trusted Launch features
- `vm security list-compliance` - List compliance frameworks

**Identity Commands (4 commands):**
- `vm identity list` - List all identity features
- `vm identity list-managed-identity` - List managed identity types
- `vm identity list-aad-features` - List Azure AD features
- `vm identity list-rbac-roles` - List RBAC roles

#### Tests (97 new tests, 161 total)

**Extension Tests (43 tests):**
- Windows extension tests (8 tests)
- Linux extension tests (7 tests)
- Cross-platform extension tests (5 tests)
- Extension templates tests (8 tests)
- Multi-extension configuration tests (6 tests)
- Extension dependencies tests (5 tests)
- Handlebars helper tests (4 tests)

**Identity Tests (54 tests):**
- **Managed Identity (13 tests):**
  - System/user/multiple identity creation tests
  - Identity recommendations tests (6 use cases)
  - Configuration validation tests
  - Role assignment tests
  - Built-in roles catalog tests
- **Azure AD (12 tests):**
  - SSH/RDP login extension tests
  - Conditional Access policy tests
  - MFA configuration tests
  - Passwordless authentication tests
  - VM access role tests
  - Complete integration tests
  - Configuration validation tests
- **RBAC (18 tests):**
  - Built-in role assignment tests
  - Custom role creation tests
  - Scope generation tests (4 types)
  - Role assignment template tests
  - Role recommendation tests
  - 5 custom role template tests
  - Configuration validation tests
  - Best practices tests
- **Identity Templates (4 tests):**
  - Template catalog tests
  - Specific template retrieval tests
  - Compliance template tests
- **Handlebars Helpers (7 tests):**

  - Helper creation tests
  - 33 helper verification tests (7 managed identity + 8 AAD + 13 RBAC + 5 utility)

**All Tests Passing:** ✅ 161/161 (100% success rate)

#### Documentation
- `PHASE3_PROPOSAL.md` - Complete Phase 3 proposal with implementation roadmap
- Extension module documentation in code comments
- Security module documentation in code comments
- Identity module documentation in code comments
- Handlebars helper JSDoc documentation
- CLI command help text

### Code Statistics
- **Total Lines Added:** ~3,900 lines
- **Extension Code:** ~1,280 lines (src/extensions/)
- **Security Code:** ~890 lines (src/security/)
- **Identity Code:** ~1,744 lines (src/identity/)
- **Test Code:** ~1,080 lines (97 new tests)

### Module Breakdown
- **Extensions**::** 20 extensions (8 Windows + 7 Linux + 5 cross-platform)
- **Security:** 3 encryption types + 5 Trusted Launch features + 12 templates + 6 compliance frameworks
- **Identity:** 3 modules (Managed Identity + Azure AD + RBAC) + 12 templates

### Changed
- Updated `src/index.ts` - Integrated 85 new helpers (26 extensions + 26 security + 33 identity)
- Updated `src/__tests__/index.test.ts` - Updated version test to 1.3.0
- Updated `package.json` - Version bumped from 1.2.0 to 1.3.0
- Enhanced description: "with Extensions, Security, and Identity features"

### Breaking Changes
None. All changes are backward compatible with v1.2.0.

### Upgrade Notes
Direct upgrade from v1.2.0 is supported. No migration required.

### Security Notes
- All encryption features integrate with Azure Key Vault
- Trusted Launch requires Gen 2 VMs
- Managed Identity enables secure, credential-free authentication
- Azure AD integration provides modern, passwordless authentication
- RBAC enables least-privilege access control

### Compliance Support
Phase 3 adds support for 6 compliance frameworks:
- SOC 2 (Service Organization Control 2)
- PCI-DSS (Payment Card Industry Data Security Standard)
- HIPAA (Health Insurance Portability and Accountability Act)
- ISO 27001 (Information Security Management)
- NIST 800-53 (Security and Privacy Controls)
- FedRAMP (Federal Risk and Authorization Management Program)

---

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
