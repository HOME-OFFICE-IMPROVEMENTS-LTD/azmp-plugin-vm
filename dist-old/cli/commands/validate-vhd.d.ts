/**
 * CLI Command: validate-vhd
 *
 * Validates VHD files for Azure Marketplace compliance
 *
 * Usage:
 *   azmp-plugin-vm validate-vhd --vhd-path <path-to-vhd>
 *   azmp-plugin-vm validate-vhd --vhd-path <path> --os-type Windows --strict
 *
 * Reference: docs/P0_BLOCKERS_BREAKDOWN.md (P0-1, AC-6)
 */
import { Command } from 'commander';
export declare function createValidateVHDCommand(): Command;
declare const _default: Command;
export default _default;
