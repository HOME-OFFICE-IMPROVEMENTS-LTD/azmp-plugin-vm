const { ApprovalManager } = require('./dist/utils/approval-manager');

async function test() {
    console.log('Testing Approval Manager...\n');
    
    // Parse dry-run file
    console.log('1. Parsing dry-run file...');
    const dryRunResult = ApprovalManager.parseDryRunFile('/tmp/clean-dry-run.json');
    console.log(`   ✓ Hash: ${dryRunResult.hash}`);
    console.log(`   ✓ Operations: ${dryRunResult.operations.length}`);
    console.log(`   ✓ Vault: ${dryRunResult.vaultInfo.name}`);
    
    // Create approval
    console.log('\n2. Creating approval...');
    const manager = new ApprovalManager();
    const approval = manager.saveApproval(dryRunResult, 24);
    console.log(`   ✓ Approved at: ${approval.approvedAt}`);
    console.log(`   ✓ Expires at: ${approval.expiresAt}`);
    console.log(`   ✓ Approved by: ${approval.approvedBy}`);
    
    // Check approval exists
    console.log('\n3. Checking approval exists...');
    const hasApproval = manager.hasApproval(dryRunResult.hash);
    console.log(`   ✓ Has valid approval: ${hasApproval}`);
    
    // Find by vault
    console.log('\n4. Finding approval by vault...');
    const foundApproval = manager.findApprovalByVault(
        dryRunResult.vaultInfo.name,
        dryRunResult.vaultInfo.resourceGroup
    );
    console.log(`   ✓ Found approval: ${foundApproval !== null}`);
    if (foundApproval) {
        console.log(`   ✓ Hash matches: ${foundApproval.hash === dryRunResult.hash}`);
    }
    
    // List all approvals
    console.log('\n5. Listing all valid approvals...');
    const approvals = manager.listValidApprovals();
    console.log(`   ✓ Valid approvals: ${approvals.length}`);
    
    // Clean up
    console.log('\n6. Cleaning up test approval...');
    const deleted = manager.deleteApproval(dryRunResult.hash);
    console.log(`   ✓ Deleted: ${deleted}`);
    
    console.log('\n✅ All tests passed!');
}

test().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
