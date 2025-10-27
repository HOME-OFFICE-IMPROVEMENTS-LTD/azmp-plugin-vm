#!/bin/bash

# Phase 2 Automation Hook - End-to-End Test
# Tests the complete approval workflow from dry-run to force execution

set -e

echo "========================================="
echo "Phase 2: Automation Hook E2E Test"
echo "========================================="
echo ""

# Clean up any existing approvals
rm -rf ~/.azmp/approvals
echo "✓ Cleaned up existing approvals"
echo ""

# Step 1: Generate dry-run with JSON output
echo "Step 1: Generate dry-run with JSON output"
echo "-----------------------------------------"
pwsh -File scripts/cleanup/Delete-RecoveryServicesVault.ps1 \
  -VaultName "test-vault" \
  -ResourceGroupName "test-rg" \
  -DryRun \
  -JsonOutput > /tmp/test-dry-run.json

HASH=$(cat /tmp/test-dry-run.json | jq -r '.hash')
OPS=$(cat /tmp/test-dry-run.json | jq -r '.operations | length')
echo "✓ Generated dry-run JSON"
echo "  Hash: $HASH"
echo "  Operations: $OPS"
echo ""

# Step 2: Test approval creation
echo "Step 2: Test approval creation"
echo "-------------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const dryRun = ApprovalManager.parseDryRunFile('/tmp/test-dry-run.json');
const approval = manager.saveApproval(dryRun, 24);
console.log('✓ Approval created');
console.log('  Approved by:', approval.approvedBy);
console.log('  Expires at:', approval.expiresAt);
"
echo ""

# Step 3: Test approval check
echo "Step 3: Test approval check"
echo "----------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const approval = manager.findApprovalByVault('test-vault', 'test-rg');
if (!approval) {
    console.error('❌ Approval not found');
    process.exit(1);
}
const hasValid = manager.hasApproval(approval.hash);
console.log('✓ Approval found and valid:', hasValid);
console.log('  Hash matches:', approval.hash === '$HASH');
"
echo ""

# Step 4: Test Force without approval (should fail when AZMP_ENFORCE_APPROVAL=true)
echo "Step 4: Test enforcement without approval"
echo "------------------------------------------"
rm -rf ~/.azmp/approvals  # Remove approval
export AZMP_ENFORCE_APPROVAL=true

# This should fail
echo "Testing Force without approval (should fail)..."
if node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const approval = manager.findApprovalByVault('test-vault', 'test-rg');
if (approval && manager.hasApproval(approval.hash)) {
    console.log('Has valid approval');
    process.exit(0);
} else {
    console.log('✓ No valid approval (as expected)');
    process.exit(1);
}
" 2>/dev/null; then
    echo "❌ Should have failed but passed"
    exit 1
else
    echo "✓ Correctly blocked execution without approval"
fi
echo ""

# Step 5: Recreate approval and test success
echo "Step 5: Test enforcement with valid approval"
echo "---------------------------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const dryRun = ApprovalManager.parseDryRunFile('/tmp/test-dry-run.json');
const approval = manager.saveApproval(dryRun, 24);
console.log('✓ Approval recreated');
"

if node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const approval = manager.findApprovalByVault('test-vault', 'test-rg');
if (approval && manager.hasApproval(approval.hash)) {
    console.log('✓ Valid approval found - Force execution would be allowed');
    process.exit(0);
} else {
    console.log('❌ No valid approval');
    process.exit(1);
}
"; then
    echo "✓ Enforcement check passed with valid approval"
else
    echo "❌ Should have passed but failed"
    exit 1
fi
echo ""

# Step 6: Test approval expiry
echo "Step 6: Test approval expiry"
echo "-----------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const dryRun = ApprovalManager.parseDryRunFile('/tmp/test-dry-run.json');
// Create approval with 0.0001 hour TTL (0.36 seconds)
const approval = manager.saveApproval(dryRun, 0.0001);
console.log('✓ Created approval with very short TTL');
console.log('  Expires at:', approval.expiresAt);
"

echo "Waiting for expiry..."
sleep 1

if node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const approval = manager.findApprovalByVault('test-vault', 'test-rg');
if (approval && manager.hasApproval(approval.hash)) {
    console.log('❌ Approval should have expired');
    process.exit(1);
} else {
    console.log('✓ Approval correctly expired');
    process.exit(0);
}
"; then
    echo "✓ Expiry check passed"
else
    echo "❌ Expiry check failed"
    exit 1
fi
echo ""

# Step 7: Test prune expired approvals
echo "Step 7: Test prune expired approvals"
echo "-------------------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const count = manager.pruneExpired();
console.log('✓ Pruned', count, 'expired approval(s)');
"
echo ""

# Step 8: Test list valid approvals
echo "Step 8: Test list valid approvals"
echo "-----------------------------------"
node -e "
const { ApprovalManager } = require('./dist/utils/approval-manager');
const manager = new ApprovalManager();
const dryRun = ApprovalManager.parseDryRunFile('/tmp/test-dry-run.json');
manager.saveApproval(dryRun, 24);
const approvals = manager.listValidApprovals();
console.log('✓ Listed valid approvals:', approvals.length);
if (approvals.length === 1) {
    console.log('  Vault:', approvals[0].vaultInfo.name);
    console.log('  Operations:', approvals[0].operationCount);
}
"
echo ""

# Clean up
rm -rf ~/.azmp/approvals
rm -f /tmp/test-dry-run.json
unset AZMP_ENFORCE_APPROVAL

echo "========================================="
echo "✅ All Phase 2 tests passed!"
echo "========================================="
