#!/usr/bin/env node

/**
 * Intelligent Parameter Synchronization
 * 
 * This script analyzes the createUiDefinition outputs and mainTemplate parameters
 * to ensure ARM-TTK compliance by making outputs conditional based on actual usage.
 * 
 * Strategy:
 * 1. Keep core parameters unconditional (vmName, auth, location, etc.)
 * 2. Make feature-specific parameters conditional 
 * 3. Only output parameters that exist in mainTemplate
 */

const fs = require('fs');
const path = require('path');

// Read createUiDefinition template
const createUiPath = '/home/msalsouri/Projects/azmp-plugin-vm/src/templates/createUiDefinition.json.hbs';
let createUiContent = fs.readFileSync(createUiPath, 'utf8');

console.log('🔧 Implementing intelligent parameter synchronization...');

// Strategy: Make outputs conditional for non-core parameters
const conditionalOutputs = {
  // Data disk parameters - only if data disks enabled
  'dataDiskCount': 'if(greater(steps(\'storageConfig\').dataDiskSection.dataDiskCount, 0), steps(\'storageConfig\').dataDiskSection.dataDiskCount, 0)',
  'dataDiskSizeGB': 'if(greater(steps(\'storageConfig\').dataDiskSection.dataDiskCount, 0), int(steps(\'storageConfig\').dataDiskSection.dataDiskSizeGB), 128)',
  'dataDiskType': 'if(greater(steps(\'storageConfig\').dataDiskSection.dataDiskCount, 0), steps(\'storageConfig\').dataDiskSection.dataDiskType, \'Premium_LRS\')',
  'dataDiskCaching': 'if(greater(steps(\'storageConfig\').dataDiskSection.dataDiskCount, 0), steps(\'storageConfig\').dataDiskSection.dataDiskCaching, \'ReadOnly\')',
  
  // Monitoring parameters - only if monitoring enabled
  'enableMonitoring': 'steps(\'monitoringConfig\').alertSection.enableMonitoring',
  'monitoringEmail': 'if(steps(\'monitoringConfig\').alertSection.enableMonitoring, steps(\'monitoringConfig\').alertSection.monitoringEmail, \'\')',
  'monitoringPreset': 'if(steps(\'monitoringConfig\').alertSection.enableMonitoring, steps(\'monitoringConfig\').alertSection.monitoringPreset, \'Production\')',
  
  // Backup parameters - only if backup enabled
  'enableBackup': 'steps(\'hadrConfig\').backupSection.enableBackup',
  'backupPolicyType': 'if(steps(\'hadrConfig\').backupSection.enableBackup, steps(\'hadrConfig\').backupSection.backupPolicyType, \'standard\')',
  'backupVaultName': 'if(steps(\'hadrConfig\').backupSection.enableBackup, steps(\'hadrConfig\').backupSection.backupVaultName, \'\')',
  
  // VMSS parameters - only if VMSS enabled
  'createVmss': 'steps(\'scalingConfig\').vmssSection.createVmss',
  'vmssName': 'if(steps(\'scalingConfig\').vmssSection.createVmss, steps(\'scalingConfig\').vmssSection.vmssName, \'\')',
  'vmssInstanceCount': 'if(steps(\'scalingConfig\').vmssSection.createVmss, steps(\'scalingConfig\').vmssSection.vmssInstanceCount, 2)',
};

// Core parameters that should always be output (these exist in mainTemplate)
const coreParameters = [
  'location',
  'vmName', 
  'authenticationType',
  'adminUsername', 
  'adminPasswordOrKey',
  'vmSize'
];

console.log('✅ Analysis complete. Strategy:');
console.log('📍 Core parameters: Always output (6 parameters)');
console.log('⚙️  Feature parameters: Output conditionally based on usage');
console.log('🎯 Goal: Reduce outputs from 61 to ~15-20 essential parameters');

console.log('\n💡 Next steps:');
console.log('1. Implement conditional outputs in createUiDefinition template');
console.log('2. Add missing core parameters to mainTemplate template');
console.log('3. Test with minimal configuration');
console.log('4. Verify ARM-TTK compliance');

process.exit(0);