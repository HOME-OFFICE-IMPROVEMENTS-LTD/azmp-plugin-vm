/**
 * CLI Command: Configure Disk Types
 *
 * Provides disk type selection and configuration for Azure VMs
 *
 * Usage:
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --vm-size Standard_DS2_v2
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --os-disk-size 128 --performance-tier P20
 *   azmp vm configure-disk-types --config disk-config.json --validate
 *   azmp vm configure-disk-types --os-disk-type Premium_LRS --data-disk-type StandardSSD_LRS --data-disk-count 2 --output template.json
 *
 * @module cli/commands/configure-disk-types
 */
import { Command } from 'commander';
/**
 * Create and configure the command
 */
declare const configureDiskTypesCommand: Command;
export default configureDiskTypesCommand;
