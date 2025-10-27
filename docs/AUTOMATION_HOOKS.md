# Automation Hooks for CI/CD Integration

## Overview

Phase 2 of the Azure Marketplace Generator VM Plugin adds automation hooks that enable safe, approval-based execution of Recovery Services vault cleanup operations in CI/CD pipelines. This system ensures that destructive operations are never executed without explicit approval, providing a "preview before force" safety mechanism for enterprise environments.

## Key Features

- **JSON-Structured Output**: Machine-readable dry-run results with SHA256 hash validation
- **Approval System**: Time-based approval lifecycle with automatic expiry
- **Policy Enforcement**: `AZMP_ENFORCE_APPROVAL` environment variable for strict governance
- **Audit Trail**: Complete tracking of approvals with creator, timestamp, and expiry metadata
- **CI/CD Ready**: Designed for GitHub Actions, Azure DevOps, and other pipeline systems

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline Workflow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. DRY-RUN STAGE                                                │
│     ├─ Run: azmp vm cleanup vault --dry-run --json              │
│     ├─ Output: dry-run.json with SHA256 hash                    │
│     └─ Store as artifact                                         │
│                                                                   │
│  2. APPROVAL STAGE (Manual Gate)                                 │
│     ├─ Human reviews dry-run.json                               │
│     ├─ Manual approval in pipeline                               │
│     └─ Run: azmp vm cleanup approve dry-run.json                │
│                                                                   │
│  3. EXECUTION STAGE                                              │
│     ├─ Set: AZMP_ENFORCE_APPROVAL=true                          │
│     ├─ Approval validation (hash check)                          │
│     ├─ Run: azmp vm cleanup vault --force                        │
│     └─ Cleanup executes if approval valid                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## JSON Output Format

When you run the cleanup command with `--dry-run --json`, you get a structured output:

```json
{
  "vaultInfo": {
    "name": "my-recovery-vault",
    "resourceGroup": "my-rg",
    "subscriptionName": "My Subscription",
    "subscriptionId": "12345678-1234-1234-1234-123456789012"
  },
  "timestamp": "2025-10-27T12:34:56.789Z",
  "mode": "dry-run",
  "operations": [
    {
      "category": "Prerequisites",
      "action": "Check Azure connectivity and authentication",
      "details": "Verify Azure PowerShell session is valid"
    },
    {
      "category": "Vault Configuration",
      "action": "Disable soft delete",
      "details": "Set vault property to allow immediate deletion"
    },
    {
      "category": "Backup Items",
      "action": "Disable backup for VM: prod-web-01",
      "details": "Stop protection and delete backup data"
    }
    // ... 21 more operations
  ],
  "warnings": [
    "⚠️  WARNING: This will DELETE ALL BACKUP DATA",
    "⚠️  WARNING: This will DELETE ALL RECOVERY POINTS",
    "⚠️  WARNING: This operation is IRREVERSIBLE"
  ],
  "hash": "3ff9a07649e8cf9c7b1234567890abcdef1234567890abcdef1234567890abcd"
}
```

### Hash Calculation

The SHA256 hash is computed from:
- Vault identification (name, resource group, subscription)
- Complete list of operations with categories, actions, and details

This ensures that approvals are tied to specific operations and cannot be reused for different vaults or modified operations.

## CLI Commands

### 1. Generate Dry-Run with JSON Output

```bash
azmp vm cleanup vault \
  --vault-name my-recovery-vault \
  --resource-group my-rg \
  --dry-run \
  --json > dry-run.json
```

**Options:**
- `--dry-run`: Preview mode, no changes made
- `--json`: Output structured JSON (suppresses interactive output)
- `--vault-name`: Name of the Recovery Services Vault
- `--resource-group`: Resource group containing the vault
- `--subscription-name` or `--subscription-id`: Target subscription

**Output:** Creates `dry-run.json` with operation plan and SHA256 hash

### 2. Approve a Dry-Run Result

```bash
azmp vm cleanup approve dry-run.json
```

**Options:**
- `--ttl <hours>`: Time-to-live for approval in hours (default: 24)

**Example:**
```bash
# Approve for 48 hours
azmp vm cleanup approve dry-run.json --ttl 48
```

**What it does:**
- Parses the dry-run JSON file
- Extracts vault information and operation hash
- Creates approval entry in `~/.azmp/approvals/`
- Sets expiry timestamp based on TTL

**Output:**
```
✓ Approval created for vault: my-recovery-vault
  Resource Group: my-rg
  Operations: 24
  Hash: 3ff9a076...
  Approved by: user@example.com
  Expires at: 2025-10-29T12:34:56.789Z
```

### 3. Check Approval Status

```bash
azmp vm cleanup check \
  --vault-name my-recovery-vault \
  --resource-group my-rg
```

**Output (if approved):**
```
✓ Valid approval found for vault: my-recovery-vault
  Resource Group: my-rg
  Operations: 24
  Hash: 3ff9a076...
  Approved by: user@example.com
  Approved at: 2025-10-27T12:34:56.789Z
  Expires at: 2025-10-29T12:34:56.789Z
  Time remaining: 47 hours 59 minutes
```

**Output (if not approved):**
```
❌ No approval found for this vault

To approve a vault cleanup:
  1. Run: azmp vm cleanup vault --dry-run --json > dry-run.json
  2. Run: azmp vm cleanup approve dry-run.json
```

### 4. Execute with Approval Enforcement

```bash
AZMP_ENFORCE_APPROVAL=true azmp vm cleanup vault \
  --vault-name my-recovery-vault \
  --resource-group my-rg \
  --force
```

**What it does:**
- Checks for valid approval before execution
- Validates SHA256 hash matches current operation plan
- Verifies approval hasn't expired
- Proceeds with cleanup if all checks pass
- Blocks execution and shows error if approval missing/invalid

**Without `AZMP_ENFORCE_APPROVAL`:**
- Approval system is optional
- Force flag still requires manual confirmation (defense-in-depth)

**With `AZMP_ENFORCE_APPROVAL=true`:**
- Approval is mandatory for Force execution
- No manual confirmation prompt (approval serves as confirmation)
- Designed for CI/CD where interactive prompts are not possible

## Approval Storage

Approvals are stored as JSON files in `~/.azmp/approvals/`:

```
~/.azmp/approvals/
├── 3ff9a07649e8cf9c7b12345678.json
├── a1b2c3d4e5f6789012345678.json
└── ...
```

Each approval file contains:

```json
{
  "hash": "3ff9a07649e8cf9c7b1234567890abcdef1234567890abcdef1234567890abcd",
  "vaultInfo": {
    "name": "my-recovery-vault",
    "resourceGroup": "my-rg",
    "subscriptionName": "My Subscription",
    "subscriptionId": "12345678-1234-1234-1234-123456789012"
  },
  "approvedAt": "2025-10-27T12:34:56.789Z",
  "approvedBy": "user@example.com",
  "expiresAt": "2025-10-29T12:34:56.789Z",
  "operationCount": 24
}
```

## CI/CD Integration Examples

### GitHub Actions Workflow

```yaml
name: Azure Vault Cleanup

on:
  workflow_dispatch:
    inputs:
      vault_name:
        description: 'Recovery Services Vault name'
        required: true
      resource_group:
        description: 'Resource group name'
        required: true
      approve_cleanup:
        description: 'Approve cleanup execution'
        type: boolean
        required: true
        default: false

jobs:
  dry-run:
    name: Generate Dry-Run
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup PowerShell
        uses: azure/powershell@v1
        with:
          azPSVersion: 'latest'
      
      - name: Install azmp CLI
        run: npm install -g @azure/marketplace-generator
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Generate Dry-Run JSON
        run: |
          azmp vm cleanup vault \
            --vault-name ${{ inputs.vault_name }} \
            --resource-group ${{ inputs.resource_group }} \
            --dry-run \
            --json > dry-run.json
      
      - name: Upload Dry-Run Result
        uses: actions/upload-artifact@v4
        with:
          name: dry-run-result
          path: dry-run.json
      
      - name: Display Operations
        run: |
          echo "## Planned Operations" >> $GITHUB_STEP_SUMMARY
          echo '```json' >> $GITHUB_STEP_SUMMARY
          cat dry-run.json | jq '.operations' >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY

  approve:
    name: Approve Cleanup
    runs-on: ubuntu-latest
    needs: dry-run
    if: inputs.approve_cleanup == true
    environment:
      name: production-vault-cleanup
    steps:
      - name: Download Dry-Run Result
        uses: actions/download-artifact@v4
        with:
          name: dry-run-result
      
      - name: Install azmp CLI
        run: npm install -g @azure/marketplace-generator
      
      - name: Create Approval
        run: |
          azmp vm cleanup approve dry-run.json --ttl 2
          echo "✓ Approval created (expires in 2 hours)"

  execute:
    name: Execute Cleanup
    runs-on: ubuntu-latest
    needs: approve
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PowerShell
        uses: azure/powershell@v1
        with:
          azPSVersion: 'latest'
      
      - name: Install azmp CLI
        run: npm install -g @azure/marketplace-generator
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Execute Vault Cleanup
        env:
          AZMP_ENFORCE_APPROVAL: true
        run: |
          azmp vm cleanup vault \
            --vault-name ${{ inputs.vault_name }} \
            --resource-group ${{ inputs.resource_group }} \
            --force
      
      - name: Report Success
        if: success()
        run: echo "✓ Vault cleanup completed successfully"
      
      - name: Report Failure
        if: failure()
        run: |
          echo "❌ Vault cleanup failed"
          exit 1
```

### Azure DevOps Pipeline

```yaml
trigger: none

parameters:
  - name: vaultName
    displayName: 'Recovery Services Vault Name'
    type: string
  
  - name: resourceGroup
    displayName: 'Resource Group Name'
    type: string
  
  - name: approveCleanup
    displayName: 'Approve Cleanup Execution'
    type: boolean
    default: false

stages:
  - stage: DryRun
    displayName: 'Generate Dry-Run'
    jobs:
      - job: GenerateDryRun
        displayName: 'Generate Dry-Run JSON'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
            displayName: 'Install Node.js'
          
          - task: AzurePowerShell@5
            inputs:
              azureSubscription: 'Azure-ServiceConnection'
              ScriptType: 'InlineScript'
              Inline: |
                npm install -g @azure/marketplace-generator
                azmp vm cleanup vault \
                  --vault-name $(vaultName) \
                  --resource-group $(resourceGroup) \
                  --dry-run \
                  --json > $(Build.ArtifactStagingDirectory)/dry-run.json
              azurePowerShellVersion: 'LatestVersion'
            displayName: 'Generate Dry-Run'
          
          - task: PublishPipelineArtifact@1
            inputs:
              targetPath: '$(Build.ArtifactStagingDirectory)/dry-run.json'
              artifactName: 'dry-run-result'
            displayName: 'Publish Dry-Run Result'
          
          - task: PowerShell@2
            inputs:
              targetType: 'inline'
              script: |
                $dryRun = Get-Content "$(Build.ArtifactStagingDirectory)/dry-run.json" | ConvertFrom-Json
                Write-Host "## Planned Operations"
                $dryRun.operations | ConvertTo-Json -Depth 10
            displayName: 'Display Operations'

  - stage: Approve
    displayName: 'Approve Cleanup'
    dependsOn: DryRun
    condition: and(succeeded(), eq('${{ parameters.approveCleanup }}', true))
    jobs:
      - job: ManualValidation
        displayName: 'Manual Approval Gate'
        pool: server
        steps:
          - task: ManualValidation@0
            inputs:
              notifyUsers: 'vault-admins@example.com'
              instructions: 'Review the dry-run result and approve vault cleanup'
              onTimeout: 'reject'
      
      - job: CreateApproval
        displayName: 'Create Approval'
        dependsOn: ManualValidation
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: DownloadPipelineArtifact@2
            inputs:
              artifactName: 'dry-run-result'
              targetPath: '$(Pipeline.Workspace)'
          
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          
          - script: |
              npm install -g @azure/marketplace-generator
              azmp vm cleanup approve $(Pipeline.Workspace)/dry-run.json --ttl 2
            displayName: 'Create Approval'

  - stage: Execute
    displayName: 'Execute Cleanup'
    dependsOn: Approve
    jobs:
      - job: ExecuteCleanup
        displayName: 'Execute Vault Cleanup'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          
          - task: AzurePowerShell@5
            inputs:
              azureSubscription: 'Azure-ServiceConnection'
              ScriptType: 'InlineScript'
              Inline: |
                npm install -g @azure/marketplace-generator
                $env:AZMP_ENFORCE_APPROVAL = "true"
                azmp vm cleanup vault \
                  --vault-name $(vaultName) \
                  --resource-group $(resourceGroup) \
                  --force
              azurePowerShellVersion: 'LatestVersion'
            displayName: 'Execute Cleanup with Approval'
```

## Security Features

### 1. SHA256 Hash Validation

The hash is computed from:
```typescript
const hashInput = JSON.stringify({
  vaultInfo: {
    name: vaultName,
    resourceGroup: resourceGroup,
    subscriptionName: subscriptionName,
    subscriptionId: subscriptionId
  },
  operations: operations  // Complete operation list
});
const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
```

This prevents:
- **Operation tampering**: Changing operations invalidates the hash
- **Vault substitution**: Approving for one vault, executing on another
- **Replay attacks**: Old approvals can't be reused for new operations

### 2. Time-Based Expiry

Approvals have a configurable TTL (default 24 hours):
- Prevents indefinite approval validity
- Reduces risk window for unauthorized execution
- Forces periodic review of cleanup operations
- Automatic cleanup of expired approvals

### 3. Policy Enforcement

`AZMP_ENFORCE_APPROVAL` environment variable:
- **Not set**: Approval system optional, manual confirmation required
- **Set to `true`**: Approval mandatory, no interactive confirmation
- Designed for enterprise governance requirements
- Enables automated but controlled execution

### 4. Audit Trail

Every approval tracks:
- **Creator**: User who approved (`approvedBy`)
- **Timestamp**: When approval was created (`approvedAt`)
- **Expiry**: When approval expires (`expiresAt`)
- **Operation count**: Number of operations (`operationCount`)
- **Hash**: Unique identifier for operation plan

## Troubleshooting

### Issue: "No approval found for this vault"

**Cause:** Approval doesn't exist or has expired

**Solution:**
```bash
# Check current approval status
azmp vm cleanup check --vault-name my-vault --resource-group my-rg

# Create new approval
azmp vm cleanup vault --dry-run --json > dry-run.json
azmp vm cleanup approve dry-run.json
```

### Issue: "Approval hash mismatch"

**Cause:** Operations changed since approval was created

**Solution:**
- Operations in the vault have changed
- Generate new dry-run and create new approval:
```bash
azmp vm cleanup vault --dry-run --json > dry-run.json
azmp vm cleanup approve dry-run.json
```

### Issue: "Approval expired"

**Cause:** Approval TTL exceeded

**Solution:**
```bash
# Create new approval with longer TTL
azmp vm cleanup approve dry-run.json --ttl 48
```

### Issue: "AZMP_ENFORCE_APPROVAL blocks execution"

**Cause:** Policy enforcement enabled but no valid approval

**Solution:**
```bash
# Option 1: Create approval
azmp vm cleanup vault --dry-run --json > dry-run.json
azmp vm cleanup approve dry-run.json

# Option 2: Disable enforcement (not recommended for CI/CD)
unset AZMP_ENFORCE_APPROVAL
azmp vm cleanup vault --force
```

### Issue: JSON output shows warning messages

**Cause:** PowerShell warning messages mixed with JSON

**Solution:** The `--json` flag automatically suppresses warnings in JSON mode. If you still see warnings:
- Update to latest version of azmp CLI
- Check PowerShell script version includes `-JsonOutput` parameter handling

## Best Practices

### 1. CI/CD Pipeline Design

- **Multi-stage pipelines**: Separate dry-run, approval, and execution stages
- **Manual gates**: Add manual approval steps between stages
- **Artifact storage**: Store dry-run JSON as pipeline artifact
- **Environment protection**: Use GitHub Environments or Azure DevOps Environments
- **Notifications**: Alert teams when approval is required

### 2. Approval Management

- **Short TTL**: Use 2-4 hour TTL for time-sensitive operations
- **Long TTL**: Use 48-72 hour TTL for planned maintenance
- **Review process**: Establish team review before approval creation
- **Documentation**: Link approval to change tickets or maintenance requests

### 3. Security Controls

- **Always enforce**: Use `AZMP_ENFORCE_APPROVAL=true` in production pipelines
- **Limited access**: Restrict who can create approvals
- **Audit logging**: Track approval creation and usage
- **Change management**: Integrate with existing change management process

### 4. Testing

- **Test in dev**: Test automation workflow in development environment first
- **Validate hash**: Verify hash matches between dry-run and execution
- **Check expiry**: Test with short TTL to verify expiry handling
- **Failed scenarios**: Test blocked execution without approval

## Migration from Manual Process

If you're currently running vault cleanup manually:

**Before (Manual):**
```bash
azmp vm cleanup vault --vault-name my-vault --resource-group my-rg --force
# Manual confirmation required
```

**After (Automated with Approval):**
```bash
# Step 1: Generate plan (automated in CI)
azmp vm cleanup vault --vault-name my-vault --resource-group my-rg --dry-run --json > plan.json

# Step 2: Review and approve (manual gate in CI)
azmp vm cleanup approve plan.json

# Step 3: Execute with enforcement (automated in CI)
AZMP_ENFORCE_APPROVAL=true azmp vm cleanup vault --vault-name my-vault --resource-group my-rg --force
```

Benefits:
- ✅ Preview before execution
- ✅ Audit trail of approvals
- ✅ Policy enforcement
- ✅ Integration with change management
- ✅ Automated but controlled

## API Reference

### ApprovalManager Class

```typescript
import { ApprovalManager, DryRunResult } from '@azure/marketplace-generator/utils/approval-manager';

// Parse dry-run file
const dryRun: DryRunResult = ApprovalManager.parseDryRunFile('dry-run.json');

// Create manager instance
const manager = new ApprovalManager();

// Save approval
const approval = manager.saveApproval(dryRun, 24); // 24 hour TTL

// Check if approval exists and is valid
const hasApproval = manager.hasApproval(hash);

// Get approval by hash
const approval = manager.getApproval(hash);

// Find approval by vault identity
const approval = manager.findApprovalByVault(vaultName, resourceGroup);

// List all valid approvals
const approvals = manager.listValidApprovals();

// Delete specific approval
manager.deleteApproval(hash);

// Prune expired approvals
const count = manager.pruneExpired();
```

## Support

For issues, feature requests, or questions:
- GitHub Issues: [azure-marketplace-generator/issues](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azure-marketplace-generator/issues)
- Documentation: [docs/](../docs/)
- Examples: [examples/](../examples/)

## Changelog

### Phase 2 - Initial Release

- Added JSON-structured dry-run output
- Implemented SHA256 hash-based approval system
- Added time-based approval expiry
- Created `approve` and `check` CLI commands
- Added `AZMP_ENFORCE_APPROVAL` policy enforcement
- Created CI/CD integration examples for GitHub Actions and Azure DevOps
- Comprehensive test suite with 8 E2E scenarios

## License

MIT License - see [LICENSE](../LICENSE) for details
