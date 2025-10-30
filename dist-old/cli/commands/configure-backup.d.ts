/**
 * CLI command for configuring Azure Backup for virtual machines
 *
 * Usage examples:
 *   # Enable backup with Production policy
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --policy production
 *
 *   # Create new vault and enable backup
 *   azmp vm configure-backup --vault-name myVault --create-vault --location eastus --vm-name myVM --resource-group myRG
 *
 *   # List available backup policies
 *   azmp vm configure-backup --list-policies
 *
 *   # Validate backup configuration
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --validate
 *
 *   # Export ARM template
 *   azmp vm configure-backup --vault-name myVault --vm-name myVM --resource-group myRG --output backup-template.json
 */
import { Command } from 'commander';
/**
 * Configure backup command
 */
declare const configureBackupCommand: Command;
export default configureBackupCommand;
