# Azure Virtual Machine Configuration Options - Comprehensive Research

This document contains comprehensive research on ALL configuration options available for Azure Virtual Machines, gathered from official Microsoft documentation and Azure Verified Modules.

## Table of Contents

1. [VM Size Families and Series](#vm-size-families-and-series)
2. [Operating System Options](#operating-system-options)
3. [Storage Configuration](#storage-configuration)
4. [Networking Configuration](#networking-configuration)
5. [Identity and Access](#identity-and-access)
6. [Security Features](#security-features)
7. [Extensions](#extensions)
8. [Availability and Reliability](#availability-and-reliability)
9. [Management and Monitoring](#management-and-monitoring)
10. [Advanced Features](#advanced-features)

---

## 1. VM Size Families and Series

### General Purpose
- **B-family** - Burstable workloads
- **D-family** - General purpose compute
  - Dv5 and Dsv5-series
  - Dv4 and Dsv4-series
  - Dv3 and Dsv3-series
  - Dv2 and Dsv2-series
  - DCv2-series (Confidential computing)

### Compute Optimized
- **F-family** - High CPU-to-memory ratio
  - Fasv7 and Fadsv7 series (AMD EPYC 9005)
  - Famsv7 and Famdsv7 series (AMD EPYC 9005 with SMT disabled)
  - Falsv7 and Faldsv7 series (AMD EPYC 9005)
  - Fasv6, Falsv6, and Famsv6-series
  - Fsv2-series
- **FX-family** - Ultra-high CPU-to-memory ratio
  - For EDA, large memory relational databases, in-memory analytics

### Memory Optimized
- **E-family** - High memory-to-core ratio
  - Easv7 and Eadsv7 series
  - Epsv6 and Epdsv6-series (Azure Cobalt 100 processor)
  - Easv6 and Eadsv6-series
  - Ev5 and Esv5-series
  - Edv5 and Edsv5-series
  - Easv5 and Eadsv5-series
  - Epsv5 and Epdsv5-series
- **Eb-family** - E-family with high remote storage performance
  - Ebdsv5 and Ebsv5-series
- **M-family** - Ultra memory-optimized (massive RAM capacities)

### Storage Optimized
- **L-family** - High disk throughput and IO
- **LSv2-series** - Local NVMe storage

### GPU Optimized
- **NC-family** - Compute-intensive, graphics-intensive, visualization
  - NCads_H100_v5-series
  - NCCads_H100_v5-series
  - NCv3-series
  - NCasT4_v3-series
  - NC_A100_v4-series
- **ND-family** - Large memory compute-intensive
  - ND_MI300X_v5-series
  - ND-H100-v5-series
  - NDm_A100_v4-series
  - ND_A100_v4-series
- **NG-family** - Virtual Desktop (VDI) and cloud gaming
  - NGads V620-series
- **NV-family** - Virtual desktop, video encoding, rendering
  - NV-series
  - NVv3-series
  - NVv4-series
  - NVadsA10_v5-series

### High Performance Compute
- **H-family** - High performance computing
- **HB-family** - Memory bandwidth optimized
- **HC-family** - Compute optimized HPC
- **HX-family** - Memory optimized HPC

### Confidential Computing
- **DC-family** - Data protection and regulatory compliance
  - Hardware-based encryption for sensitive data

---

## 2. Operating System Options

### Windows
- **Windows Server**
  - 2012 R2
  - 2016
  - 2019
  - 2022 (including Azure Edition)
  - Various editions: Standard, Datacenter
- **Windows Client**
  - Windows 10
  - Windows 11
  - Multi-session (for Azure Virtual Desktop)

### Linux
- **Ubuntu**
  - 18.04 LTS
  - 20.04 LTS (Focal)
  - 22.04 LTS (Jammy)
  - Various SKUs
- **Red Hat Enterprise Linux (RHEL)**
  - RHEL 7.x
  - RHEL 8.x
  - RHEL 9.x
  - BYOS (Bring Your Own Subscription)
- **SUSE Linux Enterprise Server (SLES)**
  - SLES 12 SP5
  - SLES 15
  - BYOS options
- **CentOS**
- **Debian**
- **Oracle Linux**
- **Other distributions** available through Azure Marketplace

### Image Sources
- **Marketplace Images** - Pre-configured images from Microsoft and partners
- **Custom Images** - User-created images
- **Shared Image Gallery** - Centralized image management
- **Azure Compute Gallery** - Versioned application packages

### License Types
- `Windows_Server` - Azure Hybrid Benefit for Windows Server
- `Windows_Client` - Multi-tenant hosting rights
- `RHEL_BYOS` - Bring your own Red Hat subscription
- `SLES_BYOS` - Bring your own SUSE subscription

---

## 3. Storage Configuration

### OS Disk Configuration
- **Create Options**
  - `FromImage` - Create from marketplace/custom image
  - `Attach` - Attach existing disk
  - `Empty` - Create empty disk
- **Caching Options**
  - `None` - No caching
  - `ReadOnly` - Read-only cache
  - `ReadWrite` - Read and write cache
- **Delete Options**
  - `Delete` - Delete disk with VM
  - `Detach` - Keep disk when VM is deleted
- **Disk Size** - Customizable GB size
- **Disk Name** - Custom naming

### Managed Disk Types
- **Standard HDD** (`Standard_LRS`)
  - Cost-effective for infrequent access
- **Standard SSD** (`StandardSSD_LRS`, `StandardSSD_ZRS`)
  - Consistent performance for web servers, dev/test
- **Premium SSD** (`Premium_LRS`, `Premium_ZRS`)
  - High-performance, low-latency for production
- **Premium SSD v2** (`PremiumV2_LRS`)
  - Highest performance, customizable IOPS and throughput
- **Ultra Disk** (`UltraSSD_LRS`)
  - Highest performance and sub-millisecond latency
  - Customizable IOPS (100-160,000+) and throughput (100-4,000+ MB/s)

### Data Disks
- **Multiple Data Disks** - Attach multiple disks (varies by VM size)
- **Per-Disk Configuration**
  - LUN (Logical Unit Number)
  - Caching (None, ReadOnly, ReadWrite)
  - Size
  - Storage Account Type
  - Create/Attach options
  - Delete options
- **Disk Encryption Set** - Customer-managed keys for encryption
- **Maximum Disks** - Varies by VM size (typically 4-64 disks)

### Ephemeral OS Disks
- **Placement Options**
  - `CacheDisk` - Store on cache disk
  - `ResourceDisk` - Store on temporary resource disk
  - `NvmeDisk` - Store on local NVMe
- **Benefits**
  - Lower latency
  - No cost for OS disk storage
  - Faster reimage/reset

### Storage Features
- **Disk Encryption**
  - Azure Disk Encryption (BitLocker/DM-Crypt)
  - Encryption at Host
  - Server-Side Encryption with Customer-Managed Keys
- **Disk Performance**
  - Configurable IOPS (Ultra Disk, Premium SSD v2)
  - Configurable throughput (MB/s)
- **Shared Disks** - Multiple VMs accessing same disk
- **Incremental Snapshots** - Cost-effective backups
- **Network Access Policies**
  - `AllowAll`
  - `AllowPrivate`
  - `DenyAll`

---

## 4. Networking Configuration

### Network Interface (NIC) Configuration
- **Multiple NICs** - Up to 8 NICs depending on VM size
- **NIC Features**
  - Accelerated Networking (SR-IOV)
  - IP Forwarding
  - DNS Server configuration
  - Network Security Group assignment
  - Diagnostic Settings

### IP Configuration
- **Private IP**
  - Static or Dynamic allocation
  - IPv4 and IPv6 support
  - Multiple IP configurations per NIC
- **Public IP**
  - Basic or Standard SKU
  - Static or Dynamic allocation
  - IPv4 and IPv6 support
  - DNS name label
  - Availability Zones support (1, 2, 3)
  - Regional or Global tier

### Network Security
- **Network Security Groups (NSG)**
  - Inbound and outbound rules
  - Port filtering
  - Protocol filtering
  - Source/destination IP filtering
- **Application Security Groups (ASG)**
  - Logical grouping of VMs
  - Simplified rule management

### Load Balancing
- **Azure Load Balancer**
  - Backend address pool configuration
  - Health probes
  - Load balancing rules
- **Application Gateway**
  - Layer 7 load balancing
  - WAF integration
  - Backend pool configuration
- **Traffic Manager** - DNS-based traffic routing

### Virtual Network Integration
- **Subnet Assignment** - Required for all VMs
- **Virtual Network Peering** - Connect VNets
- **VPN Gateway** - Hybrid connectivity
- **ExpressRoute** - Private connectivity
- **Virtual Network Service Endpoints**
- **Private Link/Private Endpoints**

### Advanced Networking
- **Virtual Network Taps** - Network traffic mirroring
- **Network Watcher** - Network monitoring and diagnostics
- **Accelerated Networking**
  - Single Root I/O Virtualization (SR-IOV)
  - Reduced latency and CPU utilization
  - Required for high-performance workloads

---

## 5. Identity and Access

### Managed Identities
- **System-Assigned Identity**
  - Automatically created and managed
  - Lifecycle tied to VM
- **User-Assigned Identity**
  - Independently created and managed
  - Can be shared across resources
  - Resource ID based assignment
- **API Version Requirements**
  - `2017-12-01` or later for basic support
  - `2018-06-01` or later for dictionary format
  - `2025-07-01-preview` or later for Operator Nexus VMs

### Azure AD Integration
- **Azure AD Join** (AADLoginForWindows / AADSSHLoginForLinux)
  - Domain-join VMs to Azure AD
  - Single sign-on with Azure AD credentials
  - Conditional Access policies
  - Multi-factor authentication
- **MDM Integration** - Intune enrollment (`mdmId: "0000000a-0000-0000-c000-000000000000"`)

### Access Control
- **Role-Based Access Control (RBAC)**
  - Built-in roles: Owner, Contributor, Reader, Virtual Machine Contributor, etc.
  - Custom role definitions
  - Conditional assignments
- **Local Admin Account**
  - Username and password (Windows)
  - Username and SSH key (Linux)
- **SSH Keys** (Linux)
  - Public key authentication
  - Multiple keys support
  - Key path configuration (`/home/<user>/.ssh/authorized_keys`)

---

## 6. Security Features

### Encryption
- **Encryption at Host**
  - Encrypts all disk data (OS, data, temp)
  - Hardware-based encryption
  - Cannot be used with Azure Disk Encryption
- **Azure Disk Encryption**
  - BitLocker (Windows) or DM-Crypt (Linux)
  - Key Vault integration
  - Key Encryption Key (KEK) support
  - Encryption algorithms: RSA-OAEP, RSA-OAEP-256, RSA1_5
  - Volume types: OS, Data, All
- **Customer-Managed Keys (CMK)**
  - Disk Encryption Sets
  - Key Vault integration
  - Key rotation

### Trusted Launch
- **Secure Boot** - Protect against rootkits and bootkits
- **vTPM (Virtual Trusted Platform Module)** - Hardware-based security
- **Boot Integrity Monitoring** - Detect boot-time attacks
- **Security Type** - `TrustedLaunch`

### Confidential Computing
- **Confidential VMs** - Hardware-based encryption for data in use
- **Security Type** - `ConfidentialVM`
- **DC-series VMs** - Intel SGX support
- **Regulatory Compliance** - GDPR, HIPAA, PCI-DSS

### Certificates
- **Key Vault Integration** - Store and manage certificates
- **Certificate Store** (Windows) - Specify certificate location
- **Certificate Deployment** - Automatic certificate installation
- **WinRM Integration** - HTTPS listeners with certificates

---

## 7. Extensions

### Windows Extensions

#### Anti-Malware (IaaSAntimalware)
- **Real-time Protection** - Enable/disable
- **Scheduled Scans**
  - Scan type: Quick or Full
  - Day and time configuration
- **Exclusions**
  - Files and paths
  - File extensions
  - Processes

#### Domain Join
- **Domain Name** - FQDN of domain
- **OU Path** - Organizational Unit path
- **User Credentials** - Domain join account
- **Join Options** - Bitwise options (3 = default)
- **Restart** - Auto-restart after join

#### Desired State Configuration (DSC)
- **WMF Version** - Windows Management Framework version
- **Configuration**
  - URL to DSC configuration
  - Script name
  - Function name
- **Configuration Arguments** - Parameters
- **Configuration Data** - Additional PSD1 data
- **Privacy Settings** - Data collection
- **Advanced Options**
  - Force pull and apply
  - Download mappings

#### Custom Script Extension
- **File Data** - Script files to download
  - Storage Account with SAS token
  - Public URLs
- **Command to Execute** - PowerShell command
- **Protected Settings** - Secure command execution

#### Azure Disk Encryption
- **Encryption Operation** - EnableEncryption
- **Key Vault URL and Resource ID**
- **Key Encryption Key (KEK)**
- **Volume Type** - OS, Data, or All
- **Resize OS Disk** - Optional

#### Network Watcher Agent
- **Network diagnostics and monitoring**
- **Traffic analytics**

### Linux Extensions

#### Azure AD SSH Login
- **SSH authentication via Azure AD**
- **Conditional Access support**

#### Custom Script Extension for Linux
- **Script download and execution**
- **File data with SAS tokens**
- **Command to execute**

#### Azure Disk Encryption for Linux
- **DM-Crypt encryption**
- **Key Vault integration**

### Cross-Platform Extensions

#### Azure Monitor Agent (AMA)
- **Data Collection Rules (DCR)** - Define data collection
- **DCR Associations** - Link VM to DCR
- **Metrics and Logs** - Send to Log Analytics
- **System and Application monitoring**

#### Dependency Agent
- **Service Map** - Application dependency visualization
- **VM Insights** - Performance monitoring
- **AMA Integration** - Works with Azure Monitor Agent

#### Guest Configuration
- **Policy compliance** - Check VM configuration
- **Configuration assignments** - Apply policies
- **Managed identity required**

#### Host Pool Registration (AVD)
- **Azure Virtual Desktop** - Register to host pool
- **Host pool token** - Registration token
- **Managed identity required**

#### Nvidia GPU Driver
- **Automated GPU driver installation**
- **For NC, ND, NV series VMs**

---

## 8. Availability and Reliability

### Availability Zones
- **Zone Redundancy** - Zones 1, 2, 3
- **Zone-Specific Deployment** - Single zone
- **Zone-Redundant Storage** - ZRS for managed disks
- **Zone-Redundant Public IP** - Zone-redundant PIPs

### Availability Sets
- **Fault Domains** - Physical rack separation (up to 3)
- **Update Domains** - Logical grouping for updates (up to 20)
- **Cannot combine with Availability Zones**

### Virtual Machine Scale Sets (VMSS)
- **Automatic Scaling** - Based on metrics
- **Manual Scaling** - Specify instance count
- **Update policies** - Automatic, Rolling, Manual
- **Overprovisioning** - Improved deployment success
- **Orchestration Modes** - Uniform or Flexible

### Proximity Placement Groups
- **Low Latency** - Co-locate VMs
- **Same datacenter** - Physical proximity
- **High-performance workloads** - HPC, gaming

### Capacity Reservation
- **Reserved Capacity** - Guarantee VM capacity
- **Capacity Reservation Groups** - Group reservations
- **On-demand billing** - Pay only when using

### Dedicated Hosts
- **Physical Server Isolation** - Dedicated hardware
- **Compliance Requirements** - Regulatory compliance
- **License Optimization** - Bring your own license

---

## 9. Management and Monitoring

### Patching and Updates

#### Windows
- **Patch Mode**
  - `AutomaticByOS` - Windows Update manages patches
  - `AutomaticByPlatform` - Azure manages patches
  - `Manual` - User manages patches
- **Automatic Updates** - Enable/disable
- **Hotpatching** - Patch without reboot (requires `AutomaticByPlatform`)

#### Linux
- **Patch Mode**
  - `ImageDefault` - Distribution-specific updates
  - `AutomaticByPlatform` - Azure manages patches

#### Cross-Platform
- **Patch Assessment Mode**
  - `AutomaticByPlatform` - Automatic assessment every 24 hours
  - `ImageDefault` - Image default behavior
- **Reboot Settings**
  - `Always` - Always reboot
  - `IfRequired` - Reboot if needed
  - `Never` - Never reboot
  - `Unknown` - Unknown state
- **Bypass Platform Safety Checks** - Skip safety validations

### Maintenance
- **Maintenance Configuration** - Schedule maintenance windows
- **Maintenance Control** - Control update timing
- **Guest Maintenance** - In-guest maintenance operations

### Backup
- **Azure Backup Integration**
  - Recovery Services Vault
  - Backup Policy configuration
  - DefaultPolicy or custom policies
- **Backup Vault** - Specify vault and resource group
- **Automated Protection** - Enable on deployment

### Auto-Shutdown
- **Daily Recurrence Time** - Shutdown schedule
- **Time Zone** - Schedule timezone
- **Notification Settings**
  - Email recipients
  - Webhook URL
  - Time before shutdown (minutes)
  - Locale for notifications
- **Status** - Enabled or Disabled

### Diagnostics
- **Boot Diagnostics**
  - Managed storage account (default)
  - Custom storage account
  - Screenshot and serial log
- **Guest-Level Diagnostics**
  - Performance counters
  - Event logs (Windows)
  - Syslog (Linux)
  - Crash dumps

### Automanage
- **Best Practices Profiles**
  - Azure Best Practices Production
  - Azure Best Practices DevTest
- **Custom Configuration Profiles**
- **Automatic management** - Backup, monitoring, updates

### Monitoring
- **Azure Monitor Integration**
  - Metrics collection
  - Log Analytics workspace
  - Custom metrics
- **Diagnostic Settings**
  - Log categories
  - Metric categories
  - Event Hub integration
  - Storage Account integration
- **Insights**
  - VM Insights
  - Network Insights
  - Storage Insights

---

## 10. Advanced Features

### VM Agent
- **Provision VM Agent** - Enable/disable
- **Extension Management** - Required for extensions
- **Guest Agent** - Linux or Windows agent

### Custom Data and User Data
- **Custom Data** - Bootstrap scripts (base64 encoded automatically)
- **User Data** - Additional user-provided data (base64 encoded by user)
- **Cloud-init** - Linux initialization
- **Unattend.xml** - Windows unattended setup

### Spot VMs
- **Priority** - Spot, Low, or Regular
- **Eviction Policy** - Deallocate or Delete
- **Max Price** - Maximum price willing to pay
- **Cost Savings** - Up to 90% discount

### Hibernation
- **Hibernate Enabled** - Save VM state to disk
- **Fast Resume** - Restore from hibernation
- **Cost Savings** - No compute charges when hibernated

### Gallery Applications
- **Package Reference ID** - Gallery application version
- **Configuration Reference** - Custom configuration blob
- **Enable Automatic Upgrade** - Auto-update applications
- **Installation Order** - Specify package order
- **Treat Failure as Deployment Failure** - Fail deployment on error

### Guest Configuration
- **Policy Compliance** - Audit or Apply configurations
- **Configuration Assignments** - Guest configuration policies
- **Managed Identity Required**

### WinRM (Windows Remote Management)
- **Listeners** - HTTP and HTTPS
- **Certificate URL** - Key Vault certificate
- **Remote PowerShell** - Enable remote management

### Additional Unattend Content (Windows)
- **AutoLogon** - Automatic logon configuration
- **FirstLogonCommands** - Commands on first logon
- **XML Content** - Unattend.xml additions

### Plan Information (Marketplace)
- **Plan Name** - Marketplace plan name
- **Product** - Marketplace product
- **Publisher** - Publisher ID
- **Promotion Code** - Optional promotion code

### Resource Locks
- **Lock Type**
  - `CanNotDelete` - Prevent deletion
  - `ReadOnly` - Prevent modifications
- **Lock Name** - Custom lock name
- **Lock Notes** - Lock description

### Tags
- **Resource Tagging** - Key-value pairs for organization
- **Cost Management** - Tag-based cost allocation
- **Governance** - Policy-based tagging

### Time Zone
- **Windows** - TimeZoneInfo.id values
- **Custom Time Zone** - Override default

---

## Implementation Priority for Plugin

Based on this research, here's a recommended implementation order for the VM plugin:

### Phase 1: Core VM Properties (MUST HAVE)
1. VM sizes with all families (B, D, F, E, M, L, NC, ND, NV, H, HB, HC, HX)
2. OS image selection (Windows Server, Linux distributions)
3. OS Disk configuration (type, size, caching, encryption)
4. Data Disks configuration
5. Basic networking (VNet, subnet, public IP)

### Phase 2: Security & Identity (SHOULD HAVE)
1. Managed Identities (system-assigned, user-assigned)
2. Azure AD integration
3. Encryption options (encryption at host, Azure Disk Encryption, CMK)
4. Trusted Launch (secure boot, vTPM)
5. SSH keys and authentication

### Phase 3: High Availability (SHOULD HAVE)
1. Availability Zones
2. Availability Sets
3. VMSS integration
4. Proximity Placement Groups

### Phase 4: Management & Monitoring (COULD HAVE)
1. Azure Monitor Agent and DCR
2. Backup configuration
3. Patch management settings
4. Auto-shutdown schedules
5. Boot diagnostics

### Phase 5: Extensions (COULD HAVE)
1. Custom Script Extension
2. Domain Join (Windows)
3. Anti-Malware (Windows)
4. Dependency Agent
5. Network Watcher Agent
6. Azure AD Login

### Phase 6: Advanced Features (NICE TO HAVE)
1. Spot VMs
2. Hibernation
3. Gallery Applications
4. Guest Configuration
5. Dedicated Hosts
6. Capacity Reservations

---

## References

- Azure Virtual Machines Documentation: https://learn.microsoft.com/en-us/azure/virtual-machines/
- Azure VM Sizes: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview
- Azure Verified Module for VM: https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/compute/virtual-machine
- ARM Template Reference: https://learn.microsoft.com/en-us/azure/templates/microsoft.compute/virtualmachines
- Managed Identities: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/
- Azure Disk Encryption: https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-overview
- VM Extensions: https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/overview
