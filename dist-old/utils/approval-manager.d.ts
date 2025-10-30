export interface VaultInfo {
    name: string;
    resourceGroup: string;
    subscription: string;
    subscriptionId: string;
}
export interface Operation {
    category: string;
    action: string;
    resource: string;
    count: number;
    details: string;
}
export interface DryRunResult {
    vaultInfo: VaultInfo;
    timestamp: string;
    mode: string;
    operations: Operation[];
    warnings: string[];
    hash: string;
}
export interface Approval {
    hash: string;
    vaultInfo: VaultInfo;
    approvedAt: string;
    approvedBy: string;
    expiresAt: string;
    operationCount: number;
}
export declare class ApprovalManager {
    private approvalsDir;
    private defaultTTLHours;
    constructor(customDir?: string);
    private ensureApprovalsDir;
    private getApprovalFilePath;
    /**
     * Save an approval for a dry-run result
     */
    saveApproval(dryRunResult: DryRunResult, ttlHours?: number): Approval;
    /**
     * Check if an approval exists and is valid (not expired)
     */
    hasApproval(hash: string): boolean;
    /**
     * Get an approval by hash (returns null if not found)
     */
    getApproval(hash: string): Approval | null;
    /**
     * Find approval by vault info (useful for checking if a vault has any approval)
     */
    findApprovalByVault(vaultName: string, resourceGroup: string): Approval | null;
    /**
     * Delete an approval
     */
    deleteApproval(hash: string): boolean;
    /**
     * Remove all expired approvals
     */
    pruneExpired(): number;
    /**
     * List all valid (non-expired) approvals
     */
    listValidApprovals(): Approval[];
    /**
     * Parse a dry-run JSON file
     */
    static parseDryRunFile(filePath: string): DryRunResult;
    /**
     * Compute hash for a dry-run result (for verification)
     */
    static computeHash(dryRunResult: DryRunResult): string;
}
