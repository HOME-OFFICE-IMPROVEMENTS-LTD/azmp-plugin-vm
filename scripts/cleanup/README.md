# Cleanup Scripts

This directory contains utility scripts for managing Azure resources and cleanup operations.

## Delete-RecoveryServicesVault.ps1

A comprehensive PowerShell script for completely removing Azure Recovery Services Vaults and all their dependencies with built-in safety mechanisms.

### Features
- **Safety First**: DryRun mode and Force flag requirements
- Removes all backup items (VMs, SQL, SAP HANA, Azure Files)
- Handles soft-deleted items
- Cleans up ASR (Azure Site Recovery) configurations
- Removes private endpoints and security configurations
- Provides detailed cleanup reports
- Parameterized for reusability
- Module management with safety checks

### Safety Features
- **DryRun Mode**: Preview all operations without making changes
- **Force Flag**: Required for all destructive operations
- **Module Safety**: Controlled PowerShell module updates
- **Early Exit**: Fails safely when safety requirements not met
- **Comprehensive Logging**: Clear indication of what will be done

### Usage

#### Safe Preview (Recommended First Step)
```powershell
# Preview what would be deleted without making changes
pwsh -File ./Delete-RecoveryServicesVault.ps1 -VaultName "my-vault" -ResourceGroupName "my-rg" -DryRun
```

#### Production Deletion (Use with Caution)
```powershell
# Actual deletion - requires Force flag for safety
pwsh -File ./Delete-RecoveryServicesVault.ps1 -VaultName "my-vault" -ResourceGroupName "my-rg" -Force

# Skip module updates for faster execution
pwsh -File ./Delete-RecoveryServicesVault.ps1 -VaultName "my-vault" -ResourceGroupName "my-rg" -Force -SkipModuleUpdates
```

#### Default Parameters (Override as needed)
```powershell
# Uses built-in defaults - still requires Force for execution
pwsh -File ./Delete-RecoveryServicesVault.ps1 -Force
```

### Prerequisites
- PowerShell 7+
- Az.RecoveryServices module 5.3.0+ (auto-updated unless -SkipModuleUpdates)
- Az.Network module 4.15.0+ (auto-updated unless -SkipModuleUpdates)
- Azure authentication (script will prompt)

### Parameters

#### Required for Safety
- `DryRun`: Preview mode - shows what would be done without making changes
- `Force`: Required flag for all destructive operations

#### Vault Configuration
- `VaultName`: Name of the Recovery Services Vault to delete (default: "azmp-test-vm-01-rsv")
- `ResourceGroupName`: Resource group containing the vault (default: "azmp-test-rg")
- `SubscriptionName`: Azure subscription name (default: "msalsouri")
- `SubscriptionId`: Azure subscription ID (default: "84e4677e-2b09-4e55-89a7-06fec49fec19")
- `IsVaultSoftDeleteEnabled`: Whether soft delete is enabled on the vault (default: false)

#### Optional Optimizations
- `SkipModuleUpdates`: Skip checking/updating PowerShell modules for faster execution

### Safety Workflow

1. **Always start with DryRun**: `pwsh -File ./Delete-RecoveryServicesVault.ps1 -DryRun`
2. **Review the preview output carefully**
3. **Execute with Force flag only if certain**: `pwsh -File ./Delete-RecoveryServicesVault.ps1 -Force`

### What It Does

When `-Force` is specified, the script will:
1. Update required PowerShell modules (unless `-SkipModuleUpdates`)
2. Connect to Azure subscription
3. Set vault context
4. Disable soft delete if enabled
5. Stop protection and delete all backup items (VMs, SQL, SAP HANA, Files)
6. Remove ASR (Azure Site Recovery) replication items
7. Clean up protection container mappings and network mappings
8. Remove private endpoints and security configurations
9. Permanently delete soft-deleted backup items
10. Delete the Recovery Services Vault using REST API
11. Provide final cleanup validation report

### Error Handling

- **Missing Safety Flags**: Script exits with error if neither `-DryRun` nor `-Force` specified
- **Module Update Failures**: Graceful handling with user guidance
- **Authentication Issues**: Clear error messages and resolution steps
- **REST API Failures**: Fallback command suggestions for manual cleanup
- **Incomplete Cleanup**: Detailed report of remaining items blocking vault deletion

### Troubleshooting

- **"Destructive operations require -Force flag"**: Add `-Force` parameter for actual execution
- **Module installation failures**: Ensure PowerShell is run as administrator
- **Authentication failures**: Run `Connect-AzAccount` manually first
- **Vault deletion failures**: Check the cleanup report for remaining dependencies
- **Remaining items after cleanup**: Some items may require manual cleanup from Azure Portal

### Integration Notes

This script is designed to work with the AZMP CLI and follows the hybrid architecture pattern where:
- AZMP CLI provides parameter validation and safety workflows
- PowerShell script handles the actual Azure resource operations
- Both layers implement safety mechanisms for defense in depth

Example integration:
```bash
# CLI level safety
azmp cleanup vault --vault-name "my-vault" --resource-group "my-rg" --dry-run

# PowerShell level safety
pwsh -File Delete-RecoveryServicesVault.ps1 -VaultName "my-vault" -ResourceGroupName "my-rg" -DryRun
```

### ⚠️ Important Warnings

- **This script permanently deletes backup data and cannot be undone**
- **Always use `-DryRun` first to verify the scope of deletion**
- **Ensure you have proper backups if the vault contains production data**
- **The script requires appropriate Azure RBAC permissions**
- **Test in non-production environments first**