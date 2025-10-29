/**
 * CLI Command: Configure VM Monitoring
 * 
 * Configures Azure VM monitoring, alert rules, and auto-shutdown.
 * Implements P1-4: Monitoring and Alerts Support.
 * 
 * Usage:
 *   azmp vm configure-monitoring --vm-name <name> --email <email> --preset production
 *   azmp vm configure-monitoring --vm-name <name> --email <email> --alert-cpu --alert-memory
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {
  MonitoringManager,
  MonitoringConfig,
  AlertRule,
  AutoShutdownConfig,
  MonitoringPreset,
  MetricType,
  AlertSeverity,
  AlertOperator,
  TimeAggregation,
} from '../../azure/monitoring';

// ============================================================================
// Command Implementation
// ============================================================================

const configureMonitoringCommand = new Command('configure-monitoring')
  .description('Configure VM monitoring and alert rules')
  .option('--vm-name <name>', 'Virtual machine name (required)')
  .option('--email <email>', 'Notification email address (required)')
  .option('--preset <preset>', 'Use monitoring preset: production, development, performance, cost-optimized')
  .option('--alert-cpu', 'Enable CPU usage alerts')
  .option('--alert-memory', 'Enable memory usage alerts')
  .option('--alert-disk', 'Enable disk I/O alerts')
  .option('--alert-network', 'Enable network I/O alerts')
  .option('--threshold <number>', 'Alert threshold (default: 85)', parseFloat)
  .option('--severity <level>', 'Alert severity: Critical, Error, Warning, Informational, Verbose', 'Warning')
  .option('--auto-shutdown', 'Enable auto-shutdown to save costs')
  .option('--shutdown-time <time>', 'Shutdown time in HH:MM format (default: 19:00)', '19:00')
  .option('--timezone <zone>', 'Timezone for auto-shutdown (default: UTC)', 'UTC')
  .option('--list-presets', 'List available monitoring presets')
  .option('--validate', 'Validate configuration without generating template')
  .option('--output <file>', 'Output ARM template to file (JSON format)')
  .action(async (options) => {
    try {
      await handleConfigureMonitoring(options);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================================
// Command Handler
// ============================================================================

async function handleConfigureMonitoring(options: any): Promise<void> {
  // List presets if requested
  if (options.listPresets) {
    listPresets();
    return;
  }

  // Validate required options
  if (!options.vmName) {
    throw new Error('--vm-name is required');
  }

  if (!options.email) {
    throw new Error('--email is required for alert notifications');
  }

  // Create monitoring manager
  let manager: MonitoringManager;

  if (options.preset) {
    // Use preset configuration  
    const presetName = options.preset.charAt(0).toUpperCase() + options.preset.slice(1).toLowerCase();
    const preset = (MonitoringManager.PRESETS as any)[presetName];
    
    if (!preset) {
      throw new Error(`Unknown preset: ${options.preset}. Available: production, development, testing, costoptimized`);
    }

    // Build config from preset
    const config: MonitoringConfig = {
      vmName: options.vmName,
      alertRules: preset.alertRules.map((rule: any, index: number) => ({
        ...rule,
        name: `${presetName.toLowerCase()}-alert-${index + 1}`
      })),
      autoShutdown: preset.autoShutdown?.enabled ? {
        ...preset.autoShutdown,
        notificationEmail: options.email
      } : undefined,
      enableDiagnostics: false,
      notificationEmails: [options.email],
    };

    manager = new MonitoringManager(config);
  } else {
    // Build custom configuration from options
    manager = createFromCustomOptions(options);
  }

  // Validate configuration
  const validation = manager.validate();

  if (!validation.isValid) {
    console.error('\n❌ Monitoring configuration is invalid:\n');
    validation.errors.forEach((error: string) => {
      console.error(`  • ${error}`);
    });
    process.exit(1);
  }

  // Output validation warnings if any
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach((warning: string) => {
      console.log(`  • ${warning}`);
    });
  }

  // If validate-only mode, exit
  if (options.validate) {
    console.log('\n✅ Configuration is valid');
    return;
  }

  // Display configuration summary
  console.log('\n' + manager.getSummary());

  // Generate ARM template
  const template = {
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "resources": manager.toARMTemplate()
  };

  // Save template if requested
  if (options.output) {
    saveTemplateToFile(template, options.output);
    console.log(`\n✅ ARM template saved to: ${options.output}`);
  }

  // Display cost estimate
  const cost = manager.estimateMonthlyCost();
  console.log(`\nEstimated monthly cost: $${cost.toFixed(2)}`);
}

// ============================================================================
// Helper Functions
// ============================================================================

function createFromCustomOptions(options: any): MonitoringManager {
  const config: MonitoringConfig = {
    vmName: options.vmName,
    alertRules: [],
    autoShutdown: options.autoShutdown ? {
      enabled: true,
      shutdownTime: options.shutdownTime,
      timezone: options.timezone,
      notificationEmail: options.email,
      notificationMinutesBefore: 30,
    } : undefined,
    enableDiagnostics: false,
    notificationEmails: [options.email],
  };

  const manager = new MonitoringManager(config);
  const threshold = options.threshold || 85;
  const severity = mapSeverity(options.severity || 'Warning');

  // Add alert rules based on flags
  if (options.alertCpu) {
    addCpuAlert(manager, options.vmName, threshold, severity, options.email);
  }

  if (options.alertMemory) {
    addMemoryAlert(manager, options.vmName, threshold, severity, options.email);
  }

  if (options.alertDisk) {
    addDiskAlerts(manager, options.vmName, threshold, severity, options.email);
  }

  if (options.alertNetwork) {
    addNetworkAlerts(manager, options.vmName, threshold, severity, options.email);
  }

  return manager;
}

function addCpuAlert(manager: MonitoringManager, vmName: string, threshold: number, severity: AlertSeverity, email: string): void {
  const rule: AlertRule = {
    name: 'high-cpu',
    description: 'Alert when CPU usage is high',
    metricName: MetricType.CPU,
    operator: AlertOperator.GreaterThan,
    threshold,
    severity,
    timeAggregation: TimeAggregation.Average,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(rule);
}

function addMemoryAlert(manager: MonitoringManager, vmName: string, threshold: number, severity: AlertSeverity, email: string): void {
  const rule: AlertRule = {
    name: 'low-memory',
    description: 'Alert when available memory is low',
    metricName: MetricType.Memory,
    operator: AlertOperator.LessThan,
    threshold,
    severity,
    timeAggregation: TimeAggregation.Average,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(rule);
}

function addDiskAlerts(manager: MonitoringManager, vmName: string, threshold: number, severity: AlertSeverity, email: string): void {
  // Disk Read alert
  const readRule: AlertRule = {
    name: 'high-disk-read',
    description: 'Alert when disk read is high',
    metricName: MetricType.DiskRead,
    operator: AlertOperator.GreaterThan,
    threshold: 1073741824, // 1GB in bytes
    severity,
    timeAggregation: TimeAggregation.Total,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(readRule);

  // Disk Write alert
  const writeRule: AlertRule = {
    name: 'high-disk-write',
    description: 'Alert when disk write is high',
    metricName: MetricType.DiskWrite,
    operator: AlertOperator.GreaterThan,
    threshold: 1073741824, // 1GB in bytes
    severity,
    timeAggregation: TimeAggregation.Total,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(writeRule);
}

function addNetworkAlerts(manager: MonitoringManager, vmName: string, threshold: number, severity: AlertSeverity, email: string): void {
  // Network In alert
  const inRule: AlertRule = {
    name: 'high-network-in',
    description: 'Alert when network ingress is high',
    metricName: MetricType.NetworkIn,
    operator: AlertOperator.GreaterThan,
    threshold: 1073741824, // 1GB in bytes
    severity,
    timeAggregation: TimeAggregation.Total,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(inRule);

  // Network Out alert
  const outRule: AlertRule = {
    name: 'high-network-out',
    description: 'Alert when network egress is high',
    metricName: MetricType.NetworkOut,
    operator: AlertOperator.GreaterThan,
    threshold: 1073741824, // 1GB in bytes
    severity,
    timeAggregation: TimeAggregation.Total,
    windowSize: 'PT5M',
    evaluationFrequency: 'PT5M',
    enabled: true,
  };
  manager.addAlertRule(outRule);
}

function listPresets(): void {
  console.log('\n📋 Available Monitoring Presets:\n');
  
  const presets = [
    {
      name: '🏭 Production',
      description: 'Comprehensive monitoring for production workloads (CPU, Memory, Disk, Network)',
    },
    {
      name: '🛠️  Development',
      description: 'Basic monitoring with auto-shutdown at 19:00 UTC',
    },
    {
      name: '⚡ Performance',
      description: 'Aggressive monitoring with 1-minute evaluation for performance-critical VMs',
    },
    {
      name: '💰 Cost-Optimized',
      description: 'Minimal monitoring (CPU, Memory only) with auto-shutdown at 18:00 UTC',
    },
  ];

  presets.forEach((preset) => {
    console.log(`  ${preset.name}`);
    console.log(`  Description: ${preset.description}\n`);
  });
}

function mapSeverity(severity: string): AlertSeverity {
  const severityMap: { [key: string]: AlertSeverity } = {
    'Critical': AlertSeverity.Critical,
    'Error': AlertSeverity.Error,
    'Warning': AlertSeverity.Warning,
    'Informational': AlertSeverity.Informational,
    'Verbose': AlertSeverity.Verbose,
  };

  return severityMap[severity] || AlertSeverity.Warning;
}

function saveTemplateToFile(template: any, filePath: string): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to save template to ${filePath}: ${error.message}`);
  }
}

export default configureMonitoringCommand;
