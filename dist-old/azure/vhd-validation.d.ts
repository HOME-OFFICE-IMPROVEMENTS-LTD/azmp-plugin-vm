/**
 * VHD Validation Module for Azure Marketplace Certification
 *
 * This module provides comprehensive VHD validation to ensure compliance with
 * Azure Marketplace requirements. It validates VHD format, size, partitions,
 * alignment, and other critical attributes.
 *
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-1)
 */
export interface VHDValidationOptions {
    vhdPath: string;
    osType?: 'Windows' | 'Linux';
    checkGeneralization?: boolean;
    strictMode?: boolean;
}
export interface VHDValidationResult {
    valid: boolean;
    vhdPath: string;
    checks: VHDCheck[];
    errors: string[];
    warnings: string[];
    metadata: VHDMetadata;
    summary: string;
}
export interface VHDCheck {
    name: string;
    category: 'format' | 'size' | 'partition' | 'alignment' | 'security' | 'generalization';
    status: 'pass' | 'fail' | 'warning' | 'skipped';
    message: string;
    details?: string;
}
export interface VHDMetadata {
    fileSize: number;
    fileSizeGB: number;
    virtualSize: number;
    virtualSizeGB: number;
    diskType: 'fixed' | 'dynamic' | 'differencing';
    blockSize?: number;
    footer: VHDFooter;
    header?: VHDHeader;
}
export interface VHDFooter {
    cookie: string;
    features: number;
    version: string;
    dataOffset: bigint;
    timestamp: number;
    creatorApplication: string;
    creatorVersion: string;
    creatorHostOS: string;
    originalSize: bigint;
    currentSize: bigint;
    diskGeometry: {
        cylinders: number;
        heads: number;
        sectorsPerTrack: number;
    };
    diskType: number;
    checksum: number;
    uniqueId: string;
    savedState: boolean;
}
export interface VHDHeader {
    cookie: string;
    dataOffset: bigint;
    tableOffset: bigint;
    version: string;
    maxTableEntries: number;
    blockSize: number;
    checksum: number;
    parentUniqueId: string;
    parentTimestamp: number;
    parentPath: string;
}
export declare const VHD_CONSTRAINTS: {
    MIN_SIZE_GB: number;
    MAX_SIZE_GB: number;
    SECTOR_SIZE: number;
    ALIGNMENT_BOUNDARY: number;
    MAX_PARTITIONS: number;
    COOKIE: string;
};
export declare const VALIDATION_CHECKS: {
    readonly VHD_FORMAT: "vhd-format";
    readonly VHD_SIZE_MIN: "vhd-size-min";
    readonly VHD_SIZE_MAX: "vhd-size-max";
    readonly VHD_TYPE: "vhd-type";
    readonly VHD_ALIGNMENT: "vhd-alignment";
    readonly PARTITION_COUNT: "partition-count";
    readonly PARTITION_TYPE: "partition-type";
    readonly GENERALIZATION: "generalization";
    readonly SECURITY_CREDENTIALS: "security-credentials";
};
export declare class VHDValidator {
    private options;
    private checks;
    private errors;
    private warnings;
    private metadata;
    constructor(options: VHDValidationOptions);
    /**
     * Main validation entry point
     * Performs comprehensive VHD validation
     */
    validate(): Promise<VHDValidationResult>;
    /**
     * AC-1: Check file exists and is readable
     */
    private checkFileAccess;
    /**
     * AC-2: Parse VHD header and footer using vhd library
     */
    private parseVHDStructure;
    /**
     * AC-3: Validate VHD format compliance
     */
    private validateVHDFormat;
    /**
     * AC-4: Validate VHD size constraints (30 GB - 2040 GB)
     */
    private validateVHDSize;
    /**
     * AC-5: Validate VHD type (fixed vs dynamic)
     */
    private validateVHDType;
    /**
     * AC-6: Validate sector alignment (1 MB boundary)
     */
    private validateAlignment;
    /**
     * AC-7: Validate partition structure
     * Note: Full partition validation requires reading disk sectors,
     * which is beyond the scope of basic VHD header/footer validation.
     * This provides a basic check and recommendations.
     */
    private validatePartitions;
    /**
     * Validate generalization (sysprep for Windows, waagent for Linux)
     * Note: This requires analyzing the disk contents, which is not feasible
     * without mounting the VHD. This is a placeholder check.
     */
    private validateGeneralization;
    /**
     * Check for security issues (hardcoded credentials, etc.)
     * Note: This requires analyzing disk contents. This is a placeholder check.
     */
    private checkSecurity;
    private addCheck;
    private formatVersion;
    private getDiskType;
    private buildResult;
}
/**
 * Validate a VHD file with default options
 */
export declare function validateVHD(vhdPath: string, options?: Partial<VHDValidationOptions>): Promise<VHDValidationResult>;
/**
 * Validate VHD and return simple pass/fail
 */
export declare function isValidVHD(vhdPath: string): Promise<boolean>;
/**
 * Get VHD metadata without validation
 */
export declare function getVHDMetadata(vhdPath: string): Promise<VHDMetadata | null>;
/**
 * Format validation result as human-readable string
 */
export declare function formatValidationResult(result: VHDValidationResult): string;
