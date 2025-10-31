/**
 * VHD Validation Module for Azure Marketplace Certification
 * 
 * This module provides comprehensive VHD validation to ensure compliance with
 * Azure Marketplace requirements. It validates VHD format, size, partitions,
 * alignment, and other critical attributes.
 * 
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-1)
 */

import * as fs from 'fs';
import * as path from 'path';
const VHDLib = require('vhd');

// ============================================================================
// VHD Library Adapter (CommonJS to Promise-based)
// ============================================================================

/**
 * Promise-based wrapper for vhd library's callback API
 * The vhd package uses CommonJS with callback-based APIs:
 * - new VHDLib.Image({ path, flags })
 * - image.open(callback)
 * - image.close(callback)
 */

interface VHDImage {
  footer?: any;
  header?: any;
  open(callback: (err: Error | null) => void): void;
  close(callback: (err: Error | null) => void): void;
}

/**
 * Open a VHD image file and return a promise
 */
const openImage = (file: string): Promise<VHDImage> => {
  return new Promise<VHDImage>((resolve, reject) => {
    try {
      const image = new VHDLib.Image({ path: file, flags: 'r' }) as VHDImage;
      image.open((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(image);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Close a VHD image file and return a promise
 */
const closeImage = (img: VHDImage): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    img.close((err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// ============================================================================
// Types and Interfaces
// ============================================================================

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

// ============================================================================
// Constants
// ============================================================================

export const VHD_CONSTRAINTS = {
  MIN_SIZE_GB: 30,           // Minimum VHD size (30 GB)
  MAX_SIZE_GB: 2040,         // Maximum VHD size (2040 GB, 2 TB - 8 GB)
  SECTOR_SIZE: 512,          // Standard sector size (512 bytes)
  ALIGNMENT_BOUNDARY: 1048576, // 1 MB alignment boundary
  MAX_PARTITIONS: 4,         // Maximum partitions for MBR
  COOKIE: 'conectix',        // VHD footer cookie
};

export const VALIDATION_CHECKS = {
  VHD_FORMAT: 'vhd-format',
  VHD_SIZE_MIN: 'vhd-size-min',
  VHD_SIZE_MAX: 'vhd-size-max',
  VHD_TYPE: 'vhd-type',
  VHD_ALIGNMENT: 'vhd-alignment',
  PARTITION_COUNT: 'partition-count',
  PARTITION_TYPE: 'partition-type',
  GENERALIZATION: 'generalization',
  SECURITY_CREDENTIALS: 'security-credentials',
} as const;

// ============================================================================
// VHD Validator Class
// ============================================================================

export class VHDValidator {
  private options: Required<VHDValidationOptions>;
  private checks: VHDCheck[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];
  private metadata: Partial<VHDMetadata> = {};

  constructor(options: VHDValidationOptions) {
    this.options = {
      osType: options.osType || 'Linux',
      checkGeneralization: options.checkGeneralization !== false,
      strictMode: options.strictMode !== false,
      ...options,
    };
  }

  /**
   * Main validation entry point
   * Performs comprehensive VHD validation
   */
  async validate(): Promise<VHDValidationResult> {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.metadata = {};

    try {
      // AC-1: Validate VHD file exists and is readable
      await this.checkFileAccess();

      // AC-2: Parse VHD header and footer
      await this.parseVHDStructure();

      // AC-3: Validate VHD format compliance
      await this.validateVHDFormat();

      // AC-4: Validate VHD size constraints
      await this.validateVHDSize();

      // AC-5: Validate VHD type (fixed vs dynamic)
      await this.validateVHDType();

      // AC-6: Validate sector alignment
      await this.validateAlignment();

      // AC-7: Validate partition structure
      await this.validatePartitions();

      // Additional checks
      if (this.options.checkGeneralization) {
        await this.validateGeneralization();
      }

      await this.checkSecurity();

    } catch (error) {
      this.errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      this.addCheck({
        name: 'validation-error',
        category: 'format',
        status: 'fail',
        message: 'Validation process encountered an error',
        details: error instanceof Error ? error.message : String(error),
      });
    }

    return this.buildResult();
  }

  // --------------------------------------------------------------------------
  // Validation Check Methods
  // --------------------------------------------------------------------------

  /**
   * AC-1: Check file exists and is readable
   */
  private async checkFileAccess(): Promise<void> {
    try {
      await fs.promises.access(this.options.vhdPath, fs.constants.R_OK);
      const stats = await fs.promises.stat(this.options.vhdPath);

      if (!stats.isFile()) {
        throw new Error('VHD path is not a file');
      }

      this.metadata.fileSize = stats.size;
      this.metadata.fileSizeGB = stats.size / (1024 ** 3);

      this.addCheck({
        name: 'file-access',
        category: 'format',
        status: 'pass',
        message: 'VHD file exists and is readable',
        details: `File size: ${this.metadata.fileSizeGB.toFixed(2)} GB`,
      });
    } catch (error) {
      this.addCheck({
        name: 'file-access',
        category: 'format',
        status: 'fail',
        message: 'VHD file cannot be accessed',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * AC-2: Parse VHD header and footer using vhd library
   */
  private async parseVHDStructure(): Promise<void> {
    let image: VHDImage | null = null;
    try {
      // Open VHD image using our promise-based adapter
      image = await openImage(this.options.vhdPath);

      // Read footer (last 512 bytes of VHD)
      const footer = image.footer;
      if (!footer) {
        throw new Error('VHD footer not found or invalid');
      }

      this.metadata.footer = {
        cookie: footer.cookie?.toString() || '',
        features: footer.features || 0,
        version: this.formatVersion(footer.fileFormatVersion),
        dataOffset: BigInt(footer.dataOffset || 0),
        timestamp: footer.timestamp || 0,
        creatorApplication: footer.creatorApplication?.toString() || '',
        creatorVersion: this.formatVersion(footer.creatorVersion),
        creatorHostOS: footer.creatorHostOS?.toString() || '',
        originalSize: BigInt(footer.originalSize || 0),
        currentSize: BigInt(footer.currentSize || 0),
        diskGeometry: {
          cylinders: footer.diskGeometry?.cylinders || 0,
          heads: footer.diskGeometry?.heads || 0,
          sectorsPerTrack: footer.diskGeometry?.sectorsPerTrack || 0,
        },
        diskType: footer.diskType || 0,
        checksum: footer.checksum || 0,
        uniqueId: footer.uniqueId?.toString('hex') || '',
        savedState: footer.savedState || false,
      };

      this.metadata.virtualSize = Number(footer.currentSize || 0);
      this.metadata.virtualSizeGB = this.metadata.virtualSize / (1024 ** 3);
      this.metadata.diskType = this.getDiskType(footer.diskType || 2);

      // Read header for dynamic disks
      if (this.metadata.diskType === 'dynamic' && image.header) {
        const header = image.header;
        this.metadata.header = {
          cookie: header.cookie?.toString() || '',
          dataOffset: BigInt(header.dataOffset || 0),
          tableOffset: BigInt(header.tableOffset || 0),
          version: this.formatVersion(header.headerVersion),
          maxTableEntries: header.maxTableEntries || 0,
          blockSize: header.blockSize || 0,
          checksum: header.checksum || 0,
          parentUniqueId: header.parentUniqueId?.toString('hex') || '',
          parentTimestamp: header.parentTimestamp || 0,
          parentPath: header.parentUnicodeName?.toString() || '',
        };

        this.metadata.blockSize = header.blockSize;
      }

      // Close the image properly using our adapter
      await closeImage(image);
      image = null;

      this.addCheck({
        name: 'vhd-structure',
        category: 'format',
        status: 'pass',
        message: 'VHD structure parsed successfully',
        details: `Disk type: ${this.metadata.diskType}, Virtual size: ${this.metadata.virtualSizeGB?.toFixed(2)} GB`,
      });
    } catch (error) {
      // Ensure image is closed even on error
      if (image) {
        try {
          await closeImage(image);
        } catch (closeError) {
          // Ignore close errors in error path
        }
      }

      this.addCheck({
        name: 'vhd-structure',
        category: 'format',
        status: 'fail',
        message: 'Failed to parse VHD structure',
        details: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * AC-3: Validate VHD format compliance
   */
  private async validateVHDFormat(): Promise<void> {
    const footer = this.metadata.footer;

    if (!footer) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_FORMAT,
        category: 'format',
        status: 'fail',
        message: 'VHD footer not found',
      });
      return;
    }

    // Check VHD cookie (magic number)
    if (footer.cookie !== VHD_CONSTRAINTS.COOKIE) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_FORMAT,
        category: 'format',
        status: 'fail',
        message: `Invalid VHD cookie: expected '${VHD_CONSTRAINTS.COOKIE}', got '${footer.cookie}'`,
      });
      return;
    }

    // Check VHD version (should be 1.0)
    if (!footer.version.startsWith('1.')) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_FORMAT,
        category: 'format',
        status: 'warning',
        message: `VHD version ${footer.version} may not be compatible with Azure`,
        details: 'Azure expects VHD format version 1.0',
      });
      this.warnings.push(`VHD version ${footer.version} detected (expected 1.0)`);
    } else {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_FORMAT,
        category: 'format',
        status: 'pass',
        message: 'VHD format is valid',
        details: `Cookie: ${footer.cookie}, Version: ${footer.version}`,
      });
    }
  }

  /**
   * AC-4: Validate VHD size constraints (30 GB - 2040 GB)
   */
  private async validateVHDSize(): Promise<void> {
    const virtualSizeGB = this.metadata.virtualSizeGB || 0;

    // Check minimum size
    if (virtualSizeGB < VHD_CONSTRAINTS.MIN_SIZE_GB) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_SIZE_MIN,
        category: 'size',
        status: 'fail',
        message: `VHD size (${virtualSizeGB.toFixed(2)} GB) is below minimum (${VHD_CONSTRAINTS.MIN_SIZE_GB} GB)`,
        details: 'Azure requires VHDs to be at least 30 GB',
      });
      this.errors.push(`VHD too small: ${virtualSizeGB.toFixed(2)} GB (minimum: ${VHD_CONSTRAINTS.MIN_SIZE_GB} GB)`);
    } else {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_SIZE_MIN,
        category: 'size',
        status: 'pass',
        message: `VHD size (${virtualSizeGB.toFixed(2)} GB) meets minimum requirement`,
      });
    }

    // Check maximum size
    if (virtualSizeGB > VHD_CONSTRAINTS.MAX_SIZE_GB) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_SIZE_MAX,
        category: 'size',
        status: 'fail',
        message: `VHD size (${virtualSizeGB.toFixed(2)} GB) exceeds maximum (${VHD_CONSTRAINTS.MAX_SIZE_GB} GB)`,
        details: 'Azure supports VHDs up to 2040 GB (2 TB - 8 GB)',
      });
      this.errors.push(`VHD too large: ${virtualSizeGB.toFixed(2)} GB (maximum: ${VHD_CONSTRAINTS.MAX_SIZE_GB} GB)`);
    } else {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_SIZE_MAX,
        category: 'size',
        status: 'pass',
        message: `VHD size (${virtualSizeGB.toFixed(2)} GB) is within maximum limit`,
      });
    }
  }

  /**
   * AC-5: Validate VHD type (fixed vs dynamic)
   */
  private async validateVHDType(): Promise<void> {
    const diskType = this.metadata.diskType;

    if (diskType === 'fixed') {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_TYPE,
        category: 'format',
        status: 'pass',
        message: 'VHD is fixed-size (recommended for Azure)',
        details: 'Fixed-size VHDs provide better performance in Azure',
      });
    } else if (diskType === 'dynamic') {
      if (this.options.strictMode) {
        this.addCheck({
          name: VALIDATION_CHECKS.VHD_TYPE,
          category: 'format',
          status: 'warning',
          message: 'VHD is dynamically expanding',
          details: 'Fixed-size VHDs are recommended for production workloads in Azure',
        });
        this.warnings.push('Dynamic VHD detected; fixed-size VHDs are recommended for Azure');
      } else {
        this.addCheck({
          name: VALIDATION_CHECKS.VHD_TYPE,
          category: 'format',
          status: 'pass',
          message: 'VHD is dynamically expanding (acceptable)',
        });
      }
    } else if (diskType === 'differencing') {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_TYPE,
        category: 'format',
        status: 'fail',
        message: 'Differencing VHDs are not supported in Azure',
        details: 'Azure requires fixed or dynamic VHDs',
      });
      this.errors.push('Differencing VHD detected; Azure does not support differencing VHDs');
    } else {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_TYPE,
        category: 'format',
        status: 'fail',
        message: `Unknown VHD type: ${diskType}`,
      });
      this.errors.push(`Unknown VHD type: ${diskType}`);
    }
  }

  /**
   * AC-6: Validate sector alignment (1 MB boundary)
   */
  private async validateAlignment(): Promise<void> {
    const virtualSize = this.metadata.virtualSize || 0;

    if (virtualSize % VHD_CONSTRAINTS.ALIGNMENT_BOUNDARY === 0) {
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_ALIGNMENT,
        category: 'alignment',
        status: 'pass',
        message: 'VHD is aligned to 1 MB boundary',
        details: `Virtual size: ${virtualSize} bytes (${(virtualSize / VHD_CONSTRAINTS.ALIGNMENT_BOUNDARY).toFixed(0)} MB)`,
      });
    } else {
      const misalignment = virtualSize % VHD_CONSTRAINTS.ALIGNMENT_BOUNDARY;
      this.addCheck({
        name: VALIDATION_CHECKS.VHD_ALIGNMENT,
        category: 'alignment',
        status: 'fail',
        message: 'VHD is not aligned to 1 MB boundary',
        details: `Misalignment: ${misalignment} bytes. Azure requires VHDs aligned to 1 MB (1048576 bytes)`,
      });
      this.errors.push(`VHD misaligned: ${misalignment} bytes off 1 MB boundary`);
    }
  }

  /**
   * AC-7: Validate partition structure
   * Note: Full partition validation requires reading disk sectors,
   * which is beyond the scope of basic VHD header/footer validation.
   * This provides a basic check and recommendations.
   */
  private async validatePartitions(): Promise<void> {
    // This is a placeholder for partition validation
    // Full implementation would require reading MBR/GPT from VHD data
    this.addCheck({
      name: VALIDATION_CHECKS.PARTITION_COUNT,
      category: 'partition',
      status: 'skipped',
      message: 'Partition validation requires full disk analysis',
      details: 'Use Azure VM Certification Test Tool for comprehensive partition validation',
    });

    this.addCheck({
      name: VALIDATION_CHECKS.PARTITION_TYPE,
      category: 'partition',
      status: 'skipped',
      message: 'Partition type validation requires full disk analysis',
      details: 'Ensure single root partition for OS disk. Data disks should be unpartitioned or single partition.',
    });

    this.warnings.push('Partition validation skipped; use Azure VM Certification Test Tool for full analysis');
  }

  /**
   * Validate generalization (sysprep for Windows, waagent for Linux)
   * Note: This requires analyzing the disk contents, which is not feasible
   * without mounting the VHD. This is a placeholder check.
   */
  private async validateGeneralization(): Promise<void> {
    this.addCheck({
      name: VALIDATION_CHECKS.GENERALIZATION,
      category: 'generalization',
      status: 'skipped',
      message: 'Generalization validation requires disk content analysis',
      details: this.options.osType === 'Windows'
        ? 'Ensure VM was generalized with sysprep /generalize /oobe /shutdown'
        : 'Ensure VM was deprovisioned with waagent -deprovision+user -force',
    });

    this.warnings.push(`Generalization check skipped; ensure ${this.options.osType} VM is properly generalized`);
  }

  /**
   * Check for security issues (hardcoded credentials, etc.)
   * Note: This requires analyzing disk contents. This is a placeholder check.
   */
  private async checkSecurity(): Promise<void> {
    this.addCheck({
      name: VALIDATION_CHECKS.SECURITY_CREDENTIALS,
      category: 'security',
      status: 'skipped',
      message: 'Security validation requires disk content analysis',
      details: 'Ensure no hardcoded credentials, SSH keys, or sensitive data in VHD',
    });

    this.warnings.push('Security check skipped; ensure no hardcoded credentials in VHD');
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private addCheck(check: VHDCheck): void {
    this.checks.push(check);
  }

  private formatVersion(version: number | undefined): string {
    if (!version) return '0.0';
    const major = (version >> 16) & 0xFFFF;
    const minor = version & 0xFFFF;
    return `${major}.${minor}`;
  }

  private getDiskType(diskType: number): 'fixed' | 'dynamic' | 'differencing' {
    switch (diskType) {
      case 2:
        return 'fixed';
      case 3:
        return 'dynamic';
      case 4:
        return 'differencing';
      default:
        return 'dynamic';
    }
  }

  private buildResult(): VHDValidationResult {
    const passedChecks = this.checks.filter(c => c.status === 'pass').length;
    const failedChecks = this.checks.filter(c => c.status === 'fail').length;
    const warningChecks = this.checks.filter(c => c.status === 'warning').length;
    const skippedChecks = this.checks.filter(c => c.status === 'skipped').length;

    const valid = failedChecks === 0 && this.errors.length === 0;

    let summary = `VHD Validation ${valid ? 'PASSED' : 'FAILED'}: `;
    summary += `${passedChecks} passed, ${failedChecks} failed, ${warningChecks} warnings, ${skippedChecks} skipped`;

    if (!valid) {
      summary += `\n\nErrors:\n${this.errors.map(e => `  - ${e}`).join('\n')}`;
    }

    if (this.warnings.length > 0) {
      summary += `\n\nWarnings:\n${this.warnings.map(w => `  - ${w}`).join('\n')}`;
    }

    return {
      valid,
      vhdPath: this.options.vhdPath,
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings,
      metadata: this.metadata as VHDMetadata,
      summary,
    };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Validate a VHD file with default options
 */
export async function validateVHD(
  vhdPath: string,
  options?: Partial<VHDValidationOptions>
): Promise<VHDValidationResult> {
  const validator = new VHDValidator({
    vhdPath,
    ...options,
  });

  return validator.validate();
}

/**
 * Validate VHD and return simple pass/fail
 */
export async function isValidVHD(vhdPath: string): Promise<boolean> {
  const result = await validateVHD(vhdPath);
  return result.valid;
}

/**
 * Get VHD metadata without validation
 */
export async function getVHDMetadata(vhdPath: string): Promise<VHDMetadata | null> {
  try {
    const validator = new VHDValidator({ vhdPath });
    await validator['parseVHDStructure']();
    return validator['metadata'] as VHDMetadata;
  } catch {
    return null;
  }
}

/**
 * Format validation result as human-readable string
 */
export function formatValidationResult(result: VHDValidationResult): string {
  let output = '';

  output += '═'.repeat(80) + '\n';
  output += 'VHD VALIDATION REPORT\n';
  output += '═'.repeat(80) + '\n\n';

  output += `VHD File: ${result.vhdPath}\n`;
  output += `Status: ${result.valid ? '✓ VALID' : '✗ INVALID'}\n\n`;

  output += '─'.repeat(80) + '\n';
  output += 'METADATA\n';
  output += '─'.repeat(80) + '\n';
  output += `File Size: ${result.metadata.fileSizeGB.toFixed(2)} GB\n`;
  output += `Virtual Size: ${result.metadata.virtualSizeGB.toFixed(2)} GB\n`;
  output += `Disk Type: ${result.metadata.diskType}\n`;
  if (result.metadata.blockSize) {
    output += `Block Size: ${(result.metadata.blockSize / 1024).toFixed(0)} KB\n`;
  }
  output += '\n';

  output += '─'.repeat(80) + '\n';
  output += 'VALIDATION CHECKS\n';
  output += '─'.repeat(80) + '\n';

  for (const check of result.checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : check.status === 'warning' ? '⚠' : '○';
    output += `[${icon}] ${check.name}: ${check.message}\n`;
    if (check.details) {
      output += `    ${check.details}\n`;
    }
  }

  output += '\n';
  output += '─'.repeat(80) + '\n';
  output += 'SUMMARY\n';
  output += '─'.repeat(80) + '\n';
  output += result.summary + '\n';
  output += '═'.repeat(80) + '\n';

  return output;
}
