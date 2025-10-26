# AZMP VM Plugin - Cleanup Commands

This document describes the cleanup commands available through the AZMP VM Plugin CLI, focusing on safe resource deletion with multiple layers of safety mechanisms.

## Overview

The AZMP VM Plugin provides cleanup commands that integrate with PowerShell automation scripts while maintaining defense-in-depth safety through both CLI-level and script-level protections.

## Architecture

```
User Command
    ↓
AZMP CLI (TypeScript)
  - Parameter validation
  - Safety confirmation prompts
  - Execution orchestration
    ↓
PowerShell Script
  - Azure API interactions
  - Resource cleanup operations
  - Safety flag enforcement
```

## Commands

### `azmp vm cleanup vault`

Deletes an Azure Recovery Services Vault and all associated resources including backup items, ASR configurations, and private endpoints.

#### Usage

```bash
azmp vm cleanup vault [options]
```

#### Options

| Option | Description | Required |
|--------|-------------|----------|
| `-n, --vault-name <name>` | Name of the Recovery Services Vault | Yes |
| `-g, --resource-group <name>` | Resource group containing the vault | Yes |
| `-s, --subscription-name <name>` | Azure subscription name | No |
| `--subscription-id <id>` | Azure subscription ID | No |
| `--dry-run` | Preview operations without making changes | No |
| `--confirm` | Enable confirmation prompts for destructive operations | No |
| `--force` | Skip all safety confirmations (**DANGEROUS**) | No |
| `--skip-module-updates` | Skip PowerShell module update checks | No |

## Safety Workflow

The cleanup commands implement a three-stage safety workflow:

### Stage 1: Dry Run (Recommended First Step)

**Always start with a dry run** to preview what will be deleted:

```bash
azmp vm cleanup vault \
  --vault-name "my-vault" \
  --resource-group "my-rg" \
  --dry-run
```

**Output:**
- Shows complete list of operations that would be performed
- Lists all resources that would be deleted
- No actual changes are made
- Safe to run multiple times

### Stage 2: Confirmed Execution

After reviewing the dry run, use `--confirm` for interactive deletion:

```bash
azmp vm cleanup vault \
  --vault-name "my-vault" \
  --resource-group "my-rg" \
  --confirm
```

**Safety Checks:**
1. CLI displays destructive operation warning
2. User must type "yes" to proceed
3. PowerShell script receives `--force` flag after confirmation
4. All operations execute with proper error handling

### Stage 3: Force Execution (Use with Extreme Caution)

For automation or when confirmation is not possible:

```bash
azmp vm cleanup vault \
  --vault-name "my-vault" \
  --resource-group "my-rg" \
  --force
```

**⚠️ WARNING:** This skips **ALL** safety confirmations and proceeds directly to deletion. Only use in:
- Automated CI/CD pipelines with proper controls
- Emergency cleanup scenarios
- After thoroughly testing with `--dry-run`

## Examples

### Example 1: Safe Preview

```bash
# Preview deletion without making changes
azmp vm cleanup vault \
  --vault-name "azmp-test-vm-01-rsv" \
  --resource-group "azmp-test-rg" \
  --subscription-name "msalsouri" \
  --dry-run
```

**Result:**
```
🧹 Recovery Services Vault Cleanup
════════════════════════════════════════════════════════════
✓ PowerShell 7+ detected
✓ Cleanup script located

📋 Execution Plan:
   Vault: azmp-test-vm-01-rsv
   Resource Group: azmp-test-rg
   Subscription: msalsouri
   Mode: DRY RUN (preview only)

🔍 DRY RUN MODE: Previewing operations without making changes

[DRY RUN] Would disable soft delete for vault
[DRY RUN] Would restore soft-deleted backup items
[DRY RUN] Would clean up all backup items and containers
[DRY RUN] Would clean up ASR items
[DRY RUN] Would clean up private endpoints
[DRY RUN] Would delete vault

✅ Vault cleanup completed successfully
   (Dry run - no actual changes made)
```

### Example 2: Interactive Deletion with Confirmation

```bash
# Interactive deletion with user confirmation prompt
azmp vm cleanup vault \
  --vault-name "azmp-test-vm-01-rsv" \
  --resource-group "azmp-test-rg" \
  --confirm
```

**Result:**
```
🧹 Recovery Services Vault Cleanup
════════════════════════════════════════════════════════════
✓ PowerShell 7+ detected
✓ Cleanup script located

📋 Execution Plan:
   Vault: azmp-test-vm-01-rsv
   Resource Group: azmp-test-rg
   Mode: EXECUTION

⚠️  DESTRUCTIVE OPERATION WARNING
   This will permanently delete the Recovery Services Vault and ALL backup data!
   This action CANNOT be undone.
   Vault: azmp-test-vm-01-rsv
   Resource Group: azmp-test-rg

Type "yes" to proceed with deletion: yes
✓ User confirmation received

🚀 Executing PowerShell script...

[Detailed PowerShell output showing each step]

✅ Vault cleanup completed successfully
```

### Example 3: Automated Deletion (CI/CD Pipeline)

```bash
# Force deletion without prompts (for automation only)
azmp vm cleanup vault \
  --vault-name "${VAULT_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --subscription-id "${AZURE_SUBSCRIPTION_ID}" \
  --force \
  --skip-module-updates
```

### Example 4: Fast Execution with Module Skip

```bash
# Skip module updates for faster execution in environments with pre-configured modules
azmp vm cleanup vault \
  --vault-name "my-vault" \
  --resource-group "my-rg" \
  --confirm \
  --skip-module-updates
```

## Error Handling

### Missing Safety Flags

```bash
azmp vm cleanup vault \
  --vault-name "my-vault" \
  --resource-group "my-rg"
```

**Error:**
```
Vault cleanup failed:
Destructive operations require explicit confirmation.
Use --dry-run to preview operations, or --confirm to enable confirmation prompts, or --force to skip all safety checks.
```

### Missing Required Parameters

```bash
azmp vm cleanup vault --dry-run
```

**Error:**
```
Vault cleanup failed:
Vault name is required. Use --vault-name option.
```

### PowerShell Not Found

**Error:**
```
Vault cleanup failed:
PowerShell 7+ (pwsh) is required but not found.
Please install PowerShell 7+ from https://github.com/PowerShell/PowerShell
```

**Resolution:**
```bash
# Install PowerShell 7+ on Linux
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y powershell
```

## Defense-in-Depth Safety

The cleanup commands implement multiple layers of safety:

### Layer 1: CLI Parameter Validation
- Required parameters checked before execution
- Environment validation (PowerShell availability)
- Script file existence verification

### Layer 2: CLI Safety Confirmation
- Interactive confirmation prompts for `--confirm` mode
- User must type "yes" to proceed
- Clear warning messages about data loss

### Layer 3: PowerShell Script Safety
- Early exit if neither `-DryRun` nor `-Force` specified
- All destructive operations wrapped in safety conditionals
- Comprehensive logging of all operations
- Graceful error handling with helpful messages

### Layer 4: Azure RBAC
- User must have appropriate Azure permissions
- Azure authentication required before operations
- Subscription and resource group access validated

## Best Practices

### 1. Always Start with Dry Run
```bash
# ALWAYS run dry-run first
azmp vm cleanup vault --vault-name "X" --resource-group "Y" --dry-run
```

### 2. Review Dry Run Output Carefully
- Verify the list of resources to be deleted
- Ensure no production resources are affected
- Confirm backup data is expendable

### 3. Test in Non-Production First
```bash
# Test in dev environment first
azmp vm cleanup vault \
  --vault-name "dev-vault" \
  --resource-group "dev-rg" \
  --confirm
```

### 4. Use Confirm Mode for Manual Operations
```bash
# Use --confirm for manual deletions (never --force)
azmp vm cleanup vault --vault-name "X" --resource-group "Y" --confirm
```

### 5. Use Force Mode Only in Automation
```bash
# Only use --force in CI/CD with proper controls
if [ "$CI" = "true" ]; then
  azmp vm cleanup vault --vault-name "$VAULT" --resource-group "$RG" --force
fi
```

### 6. Skip Module Updates When Appropriate
```bash
# Skip module updates if environment is pre-configured
azmp vm cleanup vault \
  --vault-name "X" \
  --resource-group "Y" \
  --confirm \
  --skip-module-updates
```

## Troubleshooting

### Issue: "Destructive operations require explicit confirmation"

**Cause:** Neither `--dry-run`, `--confirm`, nor `--force` was specified

**Solution:** Add one of the safety flags:
- `--dry-run` for preview
- `--confirm` for interactive deletion
- `--force` for automated deletion

### Issue: PowerShell script fails with authentication errors

**Cause:** Not logged into Azure or insufficient permissions

**Solution:**
```bash
# Login to Azure first
az login

# Or use service principal
export AZURE_CLIENT_ID="..."
export AZURE_CLIENT_SECRET="..."
export AZURE_TENANT_ID="..."
```

### Issue: Module installation failures

**Cause:** PowerShell running without administrator privileges

**Solution:**
```bash
# Run with sudo on Linux
sudo pwsh -File ./Delete-RecoveryServicesVault.ps1 ...

# Or skip module updates
azmp vm cleanup vault ... --skip-module-updates
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Cleanup Test Vaults
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install PowerShell
        run: |
          sudo apt-get update
          sudo apt-get install -y powershell
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Cleanup Vault (with safety checks)
        run: |
          # Always dry-run first
          azmp vm cleanup vault \
            --vault-name "${{ vars.VAULT_NAME }}" \
            --resource-group "${{ vars.RESOURCE_GROUP }}" \
            --dry-run
          
          # Then execute with force (after dry-run validation)
          azmp vm cleanup vault \
            --vault-name "${{ vars.VAULT_NAME }}" \
            --resource-group "${{ vars.RESOURCE_GROUP }}" \
            --force
```

### Azure DevOps Pipeline Example

```yaml
trigger: none  # Manual trigger only

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: AzureCLI@2
  displayName: 'Cleanup Recovery Services Vault'
  inputs:
    azureSubscription: '$(AZURE_SUBSCRIPTION)'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      # Dry run first
      azmp vm cleanup vault \
        --vault-name "$(VAULT_NAME)" \
        --resource-group "$(RESOURCE_GROUP)" \
        --dry-run
      
      # Require manual approval before force deletion
      # (configured in pipeline settings)
      azmp vm cleanup vault \
        --vault-name "$(VAULT_NAME)" \
        --resource-group "$(RESOURCE_GROUP)" \
        --force
```

## See Also

- [PowerShell Script Documentation](../../scripts/cleanup/README.md)
- [AZMP Plugin Development Guide](../docs/DEVELOPMENT_LOG.md)
- [Safety Implementation Details](../../scripts/cleanup/Delete-RecoveryServicesVault.ps1)
