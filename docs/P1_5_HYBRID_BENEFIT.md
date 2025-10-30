# P1-5: Azure Hybrid Benefit Support

## Overview

Azure Hybrid Benefit is a licensing benefit that allows you to significantly reduce the costs of running workloads in Azure by using your on-premises Windows Server and SQL Server licenses with Software Assurance. This implementation provides comprehensive support for configuring and managing Azure Hybrid Benefit across the VM plugin.

### Benefits

- **Cost Savings**: Up to 100% savings on software license costs
- **Windows Server**: Save $4.50 per core per month
- **SQL Server Enterprise**: Save $145.00 per core per month
- **SQL Server Standard**: Save $36.25 per core per month
- **Compute Costs**: Remain the same (only license costs are eliminated)

### Example Savings

| VM Size | Configuration | Monthly Savings | Annual Savings |
|---------|--------------|----------------|----------------|
| Standard_D4s_v3 (4 cores) | Windows Server | $18 | $216 |
| Standard_E8s_v3 (8 cores) | Windows + SQL Enterprise | $1,196 | $14,352 |
| Standard_E4s_v3 (4 cores) | Windows + SQL Standard | $163 | $1,956 |
| Standard_D32s_v3 (32 cores) | Windows Server | $144 | $1,728 |
| Standard_E64s_v3 (64 cores) | Windows + SQL Enterprise | $9,568 | $114,816 |

## License Types

### None (Pay-as-you-go)
Standard Azure pricing with no hybrid benefit applied.

### Windows_Server
Use existing Windows Server Standard or Datacenter licenses with Software Assurance.

**Requirements**:
- Minimum 8-core licenses per VM
- Licenses sold in 16-core packs
- Example: 32-core VM needs 2× 16-core license packs

### Windows_Client
Use Windows 10/11 Enterprise E3/E5 licenses for multi-tenant hosting rights.

**Requirements**:
- Windows 10/11 Enterprise E3/E5 per user
- Multi-session scenarios (Azure Virtual Desktop, Windows 365)

### AHUB (SQL Server)
Use existing SQL Server Enterprise or Standard licenses with Software Assurance.

**Requirements**:
- Minimum 4 cores per VM
- Licenses sold in 2-core packs
- Example: 8-core VM needs 4× 2-core license packs

## Supported VM Sizes

The following 18 VM sizes are supported with core count mappings:

### D-series v3 (General Purpose)
- Standard_D2s_v3: 2 cores
- Standard_D4s_v3: 4 cores
- Standard_D8s_v3: 8 cores
- Standard_D16s_v3: 16 cores
- Standard_D32s_v3: 32 cores
- Standard_D48s_v3: 48 cores
- Standard_D64s_v3: 64 cores

### E-series v3 (Memory Optimized)
- Standard_E2s_v3: 2 cores
- Standard_E4s_v3: 4 cores
- Standard_E8s_v3: 8 cores
- Standard_E16s_v3: 16 cores
- Standard_E32s_v3: 32 cores
- Standard_E48s_v3: 48 cores
- Standard_E64s_v3: 64 cores

### B-series (Burstable)
- Standard_B2s: 2 cores
- Standard_B4ms: 4 cores

### F-series v2 (Compute Optimized)
- Standard_F2s_v2: 2 cores
- Standard_F4s_v2: 4 cores
- Standard_F8s_v2: 8 cores

## CLI Usage

### Basic Configuration

Configure Windows Server hybrid benefit:

```bash
azmp vm configure-hybrid-benefit \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server
```

### SQL Server Configuration

Configure Windows with SQL Server Enterprise:

```bash
azmp vm configure-hybrid-benefit \
  --vm-name sqlvm \
  --vm-size Standard_E8s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --sql-server \
  --sql-edition Enterprise
```

### Cost Estimation Only

Get cost savings estimate without full configuration:

```bash
azmp vm configure-hybrid-benefit \
  --vm-size Standard_D8s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --estimate-only
```

### List Eligible VM Sizes

View all supported VM sizes with core counts:

```bash
azmp vm configure-hybrid-benefit --list-sizes
```

Output:
```
Eligible VM sizes for Azure Hybrid Benefit:

D-series v3 (General Purpose):
  Standard_D2s_v3: 2 cores
  Standard_D4s_v3: 4 cores
  Standard_D8s_v3: 8 cores
  ...
```

### Validate Configuration

Check configuration validity without generating output:

```bash
azmp vm configure-hybrid-benefit \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --validate
```

### Output Formats

#### Text Output (Default)
```bash
azmp vm configure-hybrid-benefit \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --output text
```

#### JSON Output
```bash
azmp vm configure-hybrid-benefit \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --output json
```

Output:
```json
{
  "vmName": "myvm",
  "vmSize": "Standard_D4s_v3",
  "osType": "Windows",
  "licenseType": "Windows_Server",
  "licenseRequirements": [
    {
      "licenseName": "Windows Server",
      "coresRequired": 8,
      "packSize": 16,
      "numberOfPacks": 1,
      "description": "Windows Server requires minimum 8-core licenses (sold in 16-core packs)"
    }
  ],
  "costSavings": {
    "monthlySavings": 18,
    "annualSavings": 216,
    "currency": "USD"
  }
}
```

#### ARM Template Output
```bash
azmp vm configure-hybrid-benefit \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --output arm
```

## API Usage

### Import the Module

```typescript
import {
  HybridBenefitManager,
  LicenseType,
  HybridBenefitConfig,
  ValidationResult,
  CostSavings,
  LicenseRequirement
} from '@hoiltd/azmp-plugin-vm/azure/hybrid-benefit';
```

### Create and Validate Configuration

```typescript
const config: HybridBenefitConfig = {
  vmName: 'myvm',
  vmSize: 'Standard_D4s_v3',
  osType: 'Windows',
  licenseType: LicenseType.WindowsServer
};

const manager = new HybridBenefitManager(config);

// Validate configuration
const validation: ValidationResult = manager.validate();
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Calculate Cost Savings

```typescript
const savings: CostSavings = manager.calculateSavings();
console.log(`Monthly savings: $${savings.monthlySavings}`);
console.log(`Annual savings: $${savings.annualSavings}`);
```

### Get License Requirements

```typescript
const requirements: LicenseRequirement[] = manager.getLicenseRequirements();
requirements.forEach(req => {
  console.log(`${req.licenseName}: ${req.coresRequired} cores required`);
  console.log(`Pack size: ${req.packSize}, Number of packs: ${req.numberOfPacks}`);
  console.log(`Description: ${req.description}`);
});
```

### Generate ARM Template Fragment

```typescript
const armTemplate = manager.toARMTemplate();
console.log(JSON.stringify(armTemplate, null, 2));
```

### Static Methods

Check VM eligibility:

```typescript
const isEligible = HybridBenefitManager.isEligibleVmSize('Standard_D4s_v3');
console.log(`Is eligible: ${isEligible}`);
```

Get all eligible VM sizes:

```typescript
const sizes = HybridBenefitManager.getEligibleVmSizes();
console.log('Eligible VM sizes:', sizes);
```

Estimate savings without creating a manager instance:

```typescript
const savings = HybridBenefitManager.estimateSavings(
  'Standard_E8s_v3',
  'Windows',
  true,
  'Enterprise'
);
console.log(`Monthly savings: $${savings.monthlySavings}`);
console.log(`Annual savings: $${savings.annualSavings}`);
```

### SQL Server Configuration

```typescript
const sqlConfig: HybridBenefitConfig = {
  vmName: 'sqlvm',
  vmSize: 'Standard_E8s_v3',
  osType: 'Windows',
  licenseType: LicenseType.SqlServerEnterprise,
  hasSqlServer: true,
  sqlEdition: 'Enterprise'
};

const sqlManager = new HybridBenefitManager(sqlConfig);
const sqlSavings = sqlManager.calculateSavings();
// For 8-core VM with Windows + SQL Enterprise:
// Monthly: $1,196 ($36 Windows + $1,160 SQL)
// Annual: $14,352
```

## ARM Template Integration

The ARM template automatically includes hybrid benefit support when the `licenseType` configuration is provided.

### Parameter Definition

```json
{
  "licenseType": {
    "type": "string",
    "defaultValue": "None",
    "allowedValues": [
      "None",
      "Windows_Server",
      "Windows_Client",
      "AHUB"
    ],
    "metadata": {
      "description": "Azure Hybrid Benefit license type for Windows Server or SQL Server"
    }
  }
}
```

### VM Resource Configuration

The license type is applied to the VM resource:

```json
{
  "type": "Microsoft.Compute/virtualMachines",
  "apiVersion": "2023-03-01",
  "name": "[parameters('vmName')]",
  "properties": {
    "licenseType": "[if(not(equals(parameters('licenseType'), 'None')), parameters('licenseType'), json('null'))]"
  }
}
```

**Note**: The conditional logic excludes the `licenseType` property when set to 'None', as Azure doesn't accept 'None' as a valid license type value.

### Using in Templates

When generating templates with the CLI:

```bash
azmp vm generate \
  --vm-name myvm \
  --vm-size Standard_D4s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --output-dir ./templates
```

The generated ARM template will include the hybrid benefit configuration automatically.

## UI Configuration

The Azure portal UI blade provides an intuitive interface for configuring hybrid benefit:

### License Configuration Section

1. **License Type Dropdown** (Windows VMs only):
   - None (Pay-as-you-go)
   - Windows Server
   - Windows Client

2. **Information Box**: Displays selected license details

### SQL Server License Section

1. **Enable SQL Server Checkbox**: Apply SQL Server Azure Hybrid Benefit
2. **SQL Edition Dropdown** (when enabled):
   - Enterprise
   - Standard
3. **Information Box**: Displays SQL Server license details

### Estimated Savings Section

Displays estimated cost savings information when hybrid benefit is enabled.

### Output Mapping

The UI blade maps user selections to the `licenseType` ARM parameter:

```typescript
// Logic priority:
// 1. If SQL Server enabled → 'AHUB'
// 2. Else use selected license type
// 3. Default to 'None' for Linux VMs

"licenseType": "[if(equals(basics('osType'), 'Windows'), 
  if(steps('hybridBenefitConfig').sqlServerSection.enableSqlServer, 
    'AHUB', 
    steps('hybridBenefitConfig').licenseSection.licenseType), 
  'None')]"
```

## Integration with Other Features

### Storage Configuration (P1-1)
Hybrid benefit works seamlessly with data disk configurations. Cost savings apply to license costs only; storage costs remain the same.

### Networking (P1-2)
Network configuration is independent of hybrid benefit. Network costs are not affected by license choices.

### High Availability & Disaster Recovery (P1-3)
- **Backup**: Hybrid benefit applies to backed-up VMs
- **Site Recovery**: License settings are preserved during failover
- **Snapshots**: License configuration is maintained in snapshots

### Monitoring & Alerts (P1-4)
Monitoring costs are independent of hybrid benefit. Cost savings estimates can be included in monitoring alerts if needed.

## Best Practices

### 1. License Assessment
- Audit existing Windows Server and SQL Server licenses
- Verify Software Assurance coverage
- Calculate required cores for planned VM sizes

### 2. VM Size Selection
- Choose from the 18 supported VM sizes
- Align VM cores with license pack sizes (16 cores for Windows, 2 cores for SQL)
- Consider core minimums (8 cores Windows, 4 cores SQL)

### 3. Cost Optimization
- Use hybrid benefit for production workloads (maximum savings)
- Consider pay-as-you-go for dev/test environments (more flexibility)
- Review savings reports regularly

### 4. Compliance
- Maintain Software Assurance records
- Track license assignments per VM
- Document hybrid benefit usage for audits

### 5. Migration Strategy
- Start with largest VMs for maximum immediate savings
- Enable hybrid benefit during VM creation when possible
- Update existing VMs through ARM template updates

## Cost Calculation Details

### Windows Server

**Cost per core**: $4.50/month

| VM Size | Cores | Monthly Savings | Annual Savings |
|---------|-------|----------------|----------------|
| Standard_D2s_v3 | 2 | $9 | $108 |
| Standard_D4s_v3 | 4 | $18 | $216 |
| Standard_D8s_v3 | 8 | $36 | $432 |
| Standard_D16s_v3 | 16 | $72 | $864 |
| Standard_D32s_v3 | 32 | $144 | $1,728 |
| Standard_D64s_v3 | 64 | $288 | $3,456 |

### SQL Server Enterprise

**Cost per core**: $145.00/month (minimum 4 cores)

| VM Size | Cores | Windows Savings | SQL Savings | Total Monthly | Total Annual |
|---------|-------|----------------|-------------|---------------|--------------|
| Standard_E4s_v3 | 4 | $18 | $580 | $598 | $7,176 |
| Standard_E8s_v3 | 8 | $36 | $1,160 | $1,196 | $14,352 |
| Standard_E16s_v3 | 16 | $72 | $2,320 | $2,392 | $28,704 |
| Standard_E32s_v3 | 32 | $144 | $4,640 | $4,784 | $57,408 |
| Standard_E64s_v3 | 64 | $288 | $9,280 | $9,568 | $114,816 |

### SQL Server Standard

**Cost per core**: $36.25/month (minimum 4 cores)

| VM Size | Cores | Windows Savings | SQL Savings | Total Monthly | Total Annual |
|---------|-------|----------------|-------------|---------------|--------------|
| Standard_E4s_v3 | 4 | $18 | $145 | $163 | $1,956 |
| Standard_E8s_v3 | 8 | $36 | $290 | $326 | $3,912 |
| Standard_E16s_v3 | 16 | $72 | $580 | $652 | $7,824 |
| Standard_E32s_v3 | 32 | $144 | $1,160 | $1,304 | $15,648 |
| Standard_E64s_v3 | 64 | $288 | $2,320 | $2,608 | $31,296 |

## Troubleshooting

### Issue: "VM size not eligible for hybrid benefit"

**Cause**: Selected VM size is not in the supported list of 18 VM sizes.

**Solution**: Choose from supported D-series v3, E-series v3, B-series, or F-series v2 VMs.

```bash
# List eligible sizes
azmp vm configure-hybrid-benefit --list-sizes
```

### Issue: "License type not compatible with OS type"

**Cause**: Attempting to apply Windows license to Linux VM.

**Solution**: Hybrid benefit only applies to Windows VMs. Set `licenseType` to 'None' for Linux.

### Issue: "SQL Server edition required when SQL Server is enabled"

**Cause**: `hasSqlServer` is true but `sqlEdition` is not specified.

**Solution**: Provide SQL edition when enabling SQL Server:

```bash
azmp vm configure-hybrid-benefit \
  --vm-name sqlvm \
  --vm-size Standard_E8s_v3 \
  --os-type Windows \
  --license-type Windows_Server \
  --sql-server \
  --sql-edition Enterprise
```

### Issue: "Insufficient cores for SQL Server license"

**Cause**: VM has fewer than 4 cores (SQL Server minimum).

**Solution**: Choose a VM size with at least 4 cores (Standard_D4s_v3 or larger).

### Issue: "License type property not applied to VM"

**Cause**: `licenseType` set to 'None', which is excluded by conditional logic.

**Solution**: This is expected behavior. Azure doesn't accept 'None' as a license type value. The property is intentionally omitted for pay-as-you-go VMs.

### Issue: "Cost savings not showing in UI"

**Cause**: Hybrid benefit not enabled or license type set to 'None'.

**Solution**: Select a valid license type (Windows_Server, Windows_Client) or enable SQL Server to see savings estimates.

## Testing

The hybrid benefit module includes comprehensive test coverage (41 tests):

```bash
# Run all hybrid benefit tests
npm test -- src/azure/__tests__/hybrid-benefit.test.ts

# Run specific test suite
npm test -- src/azure/__tests__/hybrid-benefit.test.ts -t "Cost Calculations"
```

### Test Coverage

- **Construction**: 4 tests (Windows Server, SQL Server, Linux, Windows Client)
- **Validation**: 10 tests (empty values, unknown sizes, OS/license mismatches, SQL requirements)
- **Core Count**: 3 tests (various VM sizes, unknown size fallback)
- **License Requirements**: 7 tests (Windows/SQL requirements, multi-license calculations)
- **Cost Calculations**: 7 tests (Windows savings, SQL Enterprise/Standard, zero savings scenarios)
- **ARM Template Generation**: 4 tests (all license types)
- **Summary**: 3 tests (text output validation)
- **Static Methods**: 3 tests (eligibility checks, size listing, savings estimates)

## References

- [Azure Hybrid Benefit Documentation](https://docs.microsoft.com/azure/virtual-machines/windows/hybrid-use-benefit-licensing)
- [Windows Server Licensing](https://www.microsoft.com/licensing/product-licensing/windows-server)
- [SQL Server Licensing](https://www.microsoft.com/licensing/product-licensing/sql-server)
- [Azure VM Pricing](https://azure.microsoft.com/pricing/details/virtual-machines/)
- [Software Assurance Benefits](https://www.microsoft.com/licensing/licensing-programs/software-assurance-default)

## Related Documentation

- [P1-1: Flexible Storage Template](./P1_1_FLEXIBLE_STORAGE.md)
- [P1-2: Networking Configuration](./P1_2_NETWORKING.md)
- [P1-3: High Availability & DR](./P1_3_HA_DR.md)
- [P1-4: Monitoring & Alerts](./P1_4_MONITORING.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Log](./DEVELOPMENT_LOG.md)
