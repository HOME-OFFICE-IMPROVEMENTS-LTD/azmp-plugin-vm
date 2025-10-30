/**
 * CLI command for configuring Azure data disks for virtual machines
 *
 * Usage examples:
 *   # Use Database preset (4x 1TB Premium SSD)
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database
 *
 *   # Custom configuration (3x 512GB Standard SSD)
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D4s_v3 --disk-count 3 --disk-size 512 --disk-type StandardSSD --caching ReadWrite
 *
 *   # Show available presets
 *   azmp vm configure-data-disks --show-presets
 *
 *   # Validate configuration only
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database --validate
 *
 *   # Export ARM template
 *   azmp vm configure-data-disks --vm-name myVM --resource-group myRG --vm-size Standard_D8s_v3 --preset database --output data-disks-template.json
 */
import { Command } from 'commander';
declare const _default: Command;
export default _default;
