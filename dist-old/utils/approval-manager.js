"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
class ApprovalManager {
    approvalsDir;
    defaultTTLHours = 24; // Default 24-hour approval window
    constructor(customDir) {
        const baseDir = customDir || path.join(os.homedir(), ".azmp");
        this.approvalsDir = path.join(baseDir, "approvals");
        this.ensureApprovalsDir();
    }
    ensureApprovalsDir() {
        if (!fs.existsSync(this.approvalsDir)) {
            fs.mkdirSync(this.approvalsDir, { recursive: true });
        }
    }
    getApprovalFilePath(hash) {
        return path.join(this.approvalsDir, `${hash}.json`);
    }
    /**
     * Save an approval for a dry-run result
     */
    saveApproval(dryRunResult, ttlHours) {
        const ttl = ttlHours || this.defaultTTLHours;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttl * 60 * 60 * 1000);
        const approval = {
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
    hasApproval(hash) {
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
    getApproval(hash) {
        const filePath = this.getApprovalFilePath(hash);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(content);
        }
        catch (error) {
            console.error(`Failed to read approval file: ${error}`);
            return null;
        }
    }
    /**
     * Find approval by vault info (useful for checking if a vault has any approval)
     */
    findApprovalByVault(vaultName, resourceGroup) {
        const files = fs.readdirSync(this.approvalsDir);
        for (const file of files) {
            if (!file.endsWith(".json"))
                continue;
            try {
                const filePath = path.join(this.approvalsDir, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const approval = JSON.parse(content);
                if (approval.vaultInfo.name === vaultName &&
                    approval.vaultInfo.resourceGroup === resourceGroup) {
                    return approval;
                }
            }
            catch (error) {
                // Skip invalid files
                continue;
            }
        }
        return null;
    }
    /**
     * Delete an approval
     */
    deleteApproval(hash) {
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
    pruneExpired() {
        const files = fs.readdirSync(this.approvalsDir);
        let prunedCount = 0;
        const now = new Date();
        for (const file of files) {
            if (!file.endsWith(".json"))
                continue;
            try {
                const filePath = path.join(this.approvalsDir, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const approval = JSON.parse(content);
                const expiresAt = new Date(approval.expiresAt);
                if (now >= expiresAt) {
                    fs.unlinkSync(filePath);
                    prunedCount++;
                }
            }
            catch (error) {
                // Skip invalid files
                continue;
            }
        }
        return prunedCount;
    }
    /**
     * List all valid (non-expired) approvals
     */
    listValidApprovals() {
        const files = fs.readdirSync(this.approvalsDir);
        const approvals = [];
        const now = new Date();
        for (const file of files) {
            if (!file.endsWith(".json"))
                continue;
            try {
                const filePath = path.join(this.approvalsDir, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const approval = JSON.parse(content);
                const expiresAt = new Date(approval.expiresAt);
                if (now < expiresAt) {
                    approvals.push(approval);
                }
            }
            catch (error) {
                // Skip invalid files
                continue;
            }
        }
        return approvals;
    }
    /**
     * Parse a dry-run JSON file
     */
    static parseDryRunFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Dry-run file not found: ${filePath}`);
        }
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const result = JSON.parse(content);
            // Validate required fields
            if (!result.hash || !result.vaultInfo || !result.operations) {
                throw new Error("Invalid dry-run file format: missing required fields");
            }
            return result;
        }
        catch (error) {
            throw new Error(`Failed to parse dry-run file: ${error}`);
        }
    }
    /**
     * Compute hash for a dry-run result (for verification)
     */
    static computeHash(dryRunResult) {
        const vaultJson = JSON.stringify(dryRunResult.vaultInfo);
        const operationsJson = JSON.stringify(dryRunResult.operations);
        const hashInput = `${vaultJson}${operationsJson}`;
        return crypto.createHash("sha256").update(hashInput).digest("hex");
    }
}
exports.ApprovalManager = ApprovalManager;
