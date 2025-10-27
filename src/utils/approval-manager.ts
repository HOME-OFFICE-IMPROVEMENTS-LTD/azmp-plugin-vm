import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

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

export class ApprovalManager {
  private approvalsDir: string;
  private defaultTTLHours: number = 24; // Default 24-hour approval window

  constructor(customDir?: string) {
    const baseDir = customDir || path.join(os.homedir(), ".azmp");
    this.approvalsDir = path.join(baseDir, "approvals");
    this.ensureApprovalsDir();
  }

  private ensureApprovalsDir(): void {
    if (!fs.existsSync(this.approvalsDir)) {
      fs.mkdirSync(this.approvalsDir, { recursive: true });
    }
  }

  private getApprovalFilePath(hash: string): string {
    return path.join(this.approvalsDir, `${hash}.json`);
  }

  /**
   * Save an approval for a dry-run result
   */
  saveApproval(dryRunResult: DryRunResult, ttlHours?: number): Approval {
    const ttl = ttlHours || this.defaultTTLHours;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 60 * 60 * 1000);

    const approval: Approval = {
      hash: dryRunResult.hash,
      vaultInfo: dryRunResult.vaultInfo,
      approvedAt: now.toISOString(),
      approvedBy: process.env.USER || process.env.USERNAME || "unknown",
      expiresAt: expiresAt.toISOString(),
      operationCount: dryRunResult.operations.length,
    };

    const filePath = this.getApprovalFilePath(approval.hash);
    fs.writeFileSync(filePath, JSON.stringify(approval, null, 2));

    return approval;
  }

  /**
   * Check if an approval exists and is valid (not expired)
   */
  hasApproval(hash: string): boolean {
    const approval = this.getApproval(hash);
    if (!approval) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(approval.expiresAt);
    return now < expiresAt;
  }

  /**
   * Get an approval by hash (returns null if not found)
   */
  getApproval(hash: string): Approval | null {
    const filePath = this.getApprovalFilePath(hash);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Approval;
    } catch (error) {
      console.error(`Failed to read approval file: ${error}`);
      return null;
    }
  }

  /**
   * Find approval by vault info (useful for checking if a vault has any approval)
   */
  findApprovalByVault(
    vaultName: string,
    resourceGroup: string,
  ): Approval | null {
    const files = fs.readdirSync(this.approvalsDir);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(this.approvalsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const approval = JSON.parse(content) as Approval;

        if (
          approval.vaultInfo.name === vaultName &&
          approval.vaultInfo.resourceGroup === resourceGroup
        ) {
          return approval;
        }
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    return null;
  }

  /**
   * Delete an approval
   */
  deleteApproval(hash: string): boolean {
    const filePath = this.getApprovalFilePath(hash);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    fs.unlinkSync(filePath);
    return true;
  }

  /**
   * Remove all expired approvals
   */
  pruneExpired(): number {
    const files = fs.readdirSync(this.approvalsDir);
    let prunedCount = 0;
    const now = new Date();

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(this.approvalsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const approval = JSON.parse(content) as Approval;

        const expiresAt = new Date(approval.expiresAt);
        if (now >= expiresAt) {
          fs.unlinkSync(filePath);
          prunedCount++;
        }
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    return prunedCount;
  }

  /**
   * List all valid (non-expired) approvals
   */
  listValidApprovals(): Approval[] {
    const files = fs.readdirSync(this.approvalsDir);
    const approvals: Approval[] = [];
    const now = new Date();

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(this.approvalsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const approval = JSON.parse(content) as Approval;

        const expiresAt = new Date(approval.expiresAt);
        if (now < expiresAt) {
          approvals.push(approval);
        }
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    return approvals;
  }

  /**
   * Parse a dry-run JSON file
   */
  static parseDryRunFile(filePath: string): DryRunResult {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dry-run file not found: ${filePath}`);
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const result = JSON.parse(content) as DryRunResult;

      // Validate required fields
      if (!result.hash || !result.vaultInfo || !result.operations) {
        throw new Error("Invalid dry-run file format: missing required fields");
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to parse dry-run file: ${error}`);
    }
  }

  /**
   * Compute hash for a dry-run result (for verification)
   */
  static computeHash(dryRunResult: DryRunResult): string {
    const vaultJson = JSON.stringify(dryRunResult.vaultInfo);
    const operationsJson = JSON.stringify(dryRunResult.operations);
    const hashInput = `${vaultJson}${operationsJson}`;

    return crypto.createHash("sha256").update(hashInput).digest("hex");
  }
}
