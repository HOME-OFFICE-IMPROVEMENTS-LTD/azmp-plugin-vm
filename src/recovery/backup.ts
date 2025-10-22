/**
 * Azure Backup Module
 * 
 * Provides helpers for Azure Backup configuration for Virtual Machines.
 * Includes Recovery Services Vault, backup policies, and VM backup enablement.
 * 
 * @module recovery/backup
 */

/**
 * Backup Policy Schedule Type
 */
export type BackupScheduleType = 'Daily' | 'Weekly';

/**
 * Backup Retention Range
 */
export type RetentionDurationType = 'Days' | 'Weeks' | 'Months' | 'Years';

/**
 * Recovery Services Vault Configuration
 */
export interface RecoveryServicesVaultConfig {
  name: string;
  location?: string;
  sku?: 'Standard' | 'RS0';
  tags?: Record<string, string>;
}

/**
 * Backup Policy Configuration
 */
export interface BackupPolicyConfig {
  name: string;
  vaultName: string;
  scheduleType: BackupScheduleType;
  scheduleTime: string; // HH:mm format
  timezone?: string;
  dailyRetentionDays?: number;
  weeklyRetentionWeeks?: number;
  monthlyRetentionMonths?: number;
  yearlyRetentionYears?: number;
  instantRpRetentionRangeInDays?: number; // 1-5 days for instant restore
}

/**
 * VM Backup Configuration
 */
export interface VMBackupConfig {
  vmName: string;
  vaultName: string;
  policyName: string;
  resourceGroup?: string;
}

/**
 * Generate Recovery Services Vault
 * 
 * @param config - Vault configuration
 * @returns Recovery Services Vault template
 * 
 * @example
 * ```handlebars
 * {{recovery:vault name="myVault" sku="Standard"}}
 * ```
 */
export function recoveryServicesVault(config: RecoveryServicesVaultConfig): any {
  return {
    type: 'Microsoft.RecoveryServices/vaults',
    apiVersion: '2023-06-01',
    name: config.name,
    location: config.location || '[resourceGroup().location]',
    sku: {
      name: config.sku || 'RS0', // RS0 is the standard SKU
      tier: 'Standard'
    },
    properties: {
      publicNetworkAccess: 'Enabled',
      restoreSettings: {
        crossRegionRestoreFlag: false
      },
      securitySettings: {
        immutabilitySettings: {
          state: 'Unlocked'
        }
      }
    },
    tags: config.tags || {}
  };
}

/**
 * Generate backup policy for VMs
 * 
 * @param config - Backup policy configuration
 * @returns Backup policy template
 * 
 * @example
 * ```handlebars
 * {{recovery:backupPolicy name="dailyBackup" vaultName="myVault" scheduleType="Daily" scheduleTime="02:00"}}
 * ```
 */
export function backupPolicy(config: BackupPolicyConfig): any {
  const policy: any = {
    type: 'Microsoft.RecoveryServices/vaults/backupPolicies',
    apiVersion: '2023-06-01',
    name: `${config.vaultName}/${config.name}`,
    properties: {
      backupManagementType: 'AzureIaasVM',
      instantRpRetentionRangeInDays: config.instantRpRetentionRangeInDays ?? 2,
      schedulePolicy: {
        schedulePolicyType: 'SimpleSchedulePolicy',
        scheduleRunFrequency: config.scheduleType,
        scheduleRunTimes: [
          `${new Date().toISOString().split('T')[0]}T${config.scheduleTime}:00.000Z`
        ],
        scheduleWeeklyFrequency: 0
      },
      retentionPolicy: {
        retentionPolicyType: 'LongTermRetentionPolicy',
        dailySchedule: config.dailyRetentionDays ? {
          retentionTimes: [
            `${new Date().toISOString().split('T')[0]}T${config.scheduleTime}:00.000Z`
          ],
          retentionDuration: {
            count: config.dailyRetentionDays,
            durationType: 'Days'
          }
        } : undefined,
        weeklySchedule: config.weeklyRetentionWeeks ? {
          daysOfTheWeek: ['Sunday'],
          retentionTimes: [
            `${new Date().toISOString().split('T')[0]}T${config.scheduleTime}:00.000Z`
          ],
          retentionDuration: {
            count: config.weeklyRetentionWeeks,
            durationType: 'Weeks'
          }
        } : undefined,
        monthlySchedule: config.monthlyRetentionMonths ? {
          retentionScheduleFormatType: 'Weekly',
          retentionScheduleWeekly: {
            daysOfTheWeek: ['Sunday'],
            weeksOfTheMonth: ['First']
          },
          retentionTimes: [
            `${new Date().toISOString().split('T')[0]}T${config.scheduleTime}:00.000Z`
          ],
          retentionDuration: {
            count: config.monthlyRetentionMonths,
            durationType: 'Months'
          }
        } : undefined,
        yearlySchedule: config.yearlyRetentionYears ? {
          retentionScheduleFormatType: 'Weekly',
          monthsOfYear: ['January'],
          retentionScheduleWeekly: {
            daysOfTheWeek: ['Sunday'],
            weeksOfTheMonth: ['First']
          },
          retentionTimes: [
            `${new Date().toISOString().split('T')[0]}T${config.scheduleTime}:00.000Z`
          ],
          retentionDuration: {
            count: config.yearlyRetentionYears,
            durationType: 'Years'
          }
        } : undefined
      },
      timeZone: config.timezone || 'UTC'
    }
  };

  // Remove undefined schedules
  Object.keys(policy.properties.retentionPolicy).forEach(key => {
    if (policy.properties.retentionPolicy[key] === undefined) {
      delete policy.properties.retentionPolicy[key];
    }
  });

  return policy;
}

/**
 * Enable backup for a VM
 * 
 * @param config - VM backup configuration
 * @returns Backup protected item template
 * 
 * @example
 * ```handlebars
 * {{recovery:enableVMBackup vmName="myVM" vaultName="myVault" policyName="dailyBackup"}}
 * ```
 */
export function enableVMBackup(config: VMBackupConfig): any {
  const resourceGroup = config.resourceGroup || '[resourceGroup().name]';
  const vmId = `[resourceId('${resourceGroup}', 'Microsoft.Compute/virtualMachines', '${config.vmName}')]`;
  
  return {
    type: 'Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems',
    apiVersion: '2023-06-01',
    name: `${config.vaultName}/Azure/iaasvmcontainer;iaasvmcontainerv2;${resourceGroup};${config.vmName}/vm;iaasvmcontainerv2;${resourceGroup};${config.vmName}`,
    properties: {
      protectedItemType: 'Microsoft.Compute/virtualMachines',
      policyId: `[resourceId('Microsoft.RecoveryServices/vaults/backupPolicies', '${config.vaultName}', '${config.policyName}')]`,
      sourceResourceId: vmId
    }
  };
}

/**
 * Standard backup policy presets
 */
export const BackupPresets = {
  /**
   * Development: 7 days daily retention, 2-day instant restore
   */
  development: (vaultName: string): BackupPolicyConfig => ({
    name: 'policy-dev',
    vaultName,
    scheduleType: 'Daily',
    scheduleTime: '02:00',
    dailyRetentionDays: 7,
    instantRpRetentionRangeInDays: 2
  }),

  /**
   * Production: 30 days daily, 12 weeks weekly, 12 months monthly, 5-day instant restore
   */
  production: (vaultName: string): BackupPolicyConfig => ({
    name: 'policy-prod',
    vaultName,
    scheduleType: 'Daily',
    scheduleTime: '02:00',
    dailyRetentionDays: 30,
    weeklyRetentionWeeks: 12,
    monthlyRetentionMonths: 12,
    instantRpRetentionRangeInDays: 5
  }),

  /**
   * Long-term: 90 days daily, 52 weeks weekly, 60 months monthly, 7 years yearly
   */
  longTerm: (vaultName: string): BackupPolicyConfig => ({
    name: 'policy-longterm',
    vaultName,
    scheduleType: 'Daily',
    scheduleTime: '02:00',
    dailyRetentionDays: 90,
    weeklyRetentionWeeks: 52,
    monthlyRetentionMonths: 60,
    yearlyRetentionYears: 7,
    instantRpRetentionRangeInDays: 5
  })
};

/**
 * Calculate estimated backup storage cost (GB)
 * 
 * @param vmSizeGB - VM disk size in GB
 * @param dailyRetention - Daily retention days
 * @param weeklyRetention - Weekly retention weeks
 * @param monthlyRetention - Monthly retention months
 * @param compressionRatio - Expected compression (default: 0.5 = 50% reduction)
 * @returns Estimated storage in GB
 */
export function estimateBackupStorage(
  vmSizeGB: number,
  dailyRetention: number = 30,
  weeklyRetention: number = 12,
  monthlyRetention: number = 12,
  compressionRatio: number = 0.5
): number {
  const compressedSize = vmSizeGB * compressionRatio;
  
  // Estimate incremental backups (10% change rate per day)
  const dailyIncremental = vmSizeGB * 0.1 * compressionRatio;
  const weeklyIncremental = vmSizeGB * 0.3 * compressionRatio;
  const monthlyIncremental = vmSizeGB * 0.5 * compressionRatio;
  
  const dailyStorage = compressedSize + (dailyIncremental * (dailyRetention - 1));
  const weeklyStorage = weeklyIncremental * weeklyRetention;
  const monthlyStorage = monthlyIncremental * monthlyRetention;
  
  return Math.round(dailyStorage + weeklyStorage + monthlyStorage);
}

/**
 * Validate backup policy configuration
 * 
 * @param config - Backup policy configuration
 * @returns Validation result
 */
export function validateBackupPolicy(config: BackupPolicyConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!config.name || config.name.length === 0) {
    errors.push('Policy name is required');
  }

  // Validate vault name
  if (!config.vaultName || config.vaultName.length === 0) {
    errors.push('Vault name is required');
  }

  // Validate schedule time format (HH:mm)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(config.scheduleTime)) {
    errors.push('Schedule time must be in HH:mm format (e.g., 02:00)');
  }

  // Validate instant restore retention (1-5 days)
  if (config.instantRpRetentionRangeInDays) {
    if (config.instantRpRetentionRangeInDays < 1 || config.instantRpRetentionRangeInDays > 5) {
      errors.push('Instant restore retention must be between 1 and 5 days');
    }
  }

  // Validate retention periods
  if (config.dailyRetentionDays && config.dailyRetentionDays < 7) {
    warnings.push('Daily retention less than 7 days is not recommended for production');
  }

  if (!config.dailyRetentionDays && !config.weeklyRetentionWeeks) {
    warnings.push('No retention policy specified - backups will not be retained');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Backup best practices documentation
 * 
 * @returns Best practices as markdown string
 */
export function backupBestPractices(): string {
  return `
# Azure VM Backup Best Practices

## Recovery Services Vault

### Configuration
- **SKU**: Use RS0 (Standard) for most scenarios
- **Location**: Same region as VMs for optimal performance
- **Redundancy**: Choose between GRS (Geo-Redundant) or LRS (Locally Redundant)
- **Cross-Region Restore**: Enable for disaster recovery scenarios

### Security
- Enable soft delete (14-day retention for deleted backups)
- Use Azure Private Link for secure connectivity
- Implement RBAC for backup management
- Enable MFA for critical operations

## Backup Policies

### Schedule Recommendations
- **Development**: Daily backups, 7-day retention
- **Production**: Daily backups, 30+ day retention
- **Critical Systems**: Daily + weekly + monthly + yearly retention

### Retention Guidelines
- **Daily**: 7-30 days minimum
- **Weekly**: 12 weeks (3 months) minimum
- **Monthly**: 12 months (1 year) minimum
- **Yearly**: 7 years for compliance

### Instant Restore
- 1-5 days of snapshots for fast recovery
- 2 days for dev/test
- 5 days for production critical workloads

## Cost Optimization

### Storage Estimates
- Expect 40-60% compression for typical workloads
- Incremental backups reduce storage significantly
- First backup: Full size (compressed)
- Subsequent backups: ~10-30% incremental

### Cost Factors
- Protected instance cost: ~$10/month per VM
- Storage cost: ~$0.10/GB per month (GRS) or ~$0.05/GB (LRS)
- Restore bandwidth: Free within Azure

### Example Costs (100GB VM)
- **Development** (7 days): ~$15/month
- **Production** (30 days + 12 weeks): ~$35/month
- **Long-term** (90 days + 52 weeks + 12 months): ~$75/month

## Performance

### Backup Windows
- Schedule during off-peak hours (2:00-4:00 AM recommended)
- Avoid overlapping with maintenance windows
- Consider timezone for global deployments

### Network Impact
- Initial backup: Full disk transfer
- Incremental: Changed blocks only
- Use Azure ExpressRoute for large VMs
- Typical backup time: 1-4 hours for 1TB

## Recovery Scenarios

### Recovery Time Objectives (RTO)
- **Instant Restore**: 15-30 minutes
- **Standard Restore**: 2-6 hours
- **Full VM Recreation**: 4-8 hours

### Recovery Point Objectives (RPO)
- **Daily Backups**: 24 hours max data loss
- **Instant Restore**: Minimal data loss (snapshot-based)

## Compliance

### Regulatory Requirements
- HIPAA: 7 years retention
- GDPR: Right to delete (use soft delete)
- SOX: 7 years retention
- PCI DSS: 3+ months retention

### Audit Trail
- Enable diagnostic logs
- Monitor backup health
- Alert on backup failures
- Regular restore testing (quarterly minimum)

## Limitations

### Not Supported
- VMs with write accelerator enabled disks
- VMs with disk encryption (pre-ADE)
- VMs with ultra disks (use snapshots instead)

### Size Limits
- Max VM size: 32 TB
- Max disks per VM: 32 data disks
- Max single disk: 32 TB
  `.trim();
}

/**
 * Export all backup functions
 */
export const backup = {
  recoveryServicesVault,
  backupPolicy,
  enableVMBackup,
  BackupPresets,
  estimateBackupStorage,
  validateBackupPolicy,
  backupBestPractices
};
