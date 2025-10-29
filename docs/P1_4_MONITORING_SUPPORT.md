# P1-4: Monitoring & Alerts Support

**Status**: ✅ Completed  
**Implementation Date**: January 2025  
**Tests**: 29/29 passing

## Overview

The Monitoring & Alerts feature provides comprehensive Azure Monitor integration for VMs with automated metric alerts, auto-shutdown scheduling, and cost-effective monitoring configurations. This implementation supports both preset and custom monitoring configurations.

## Features

### 1. Metric Alerts
- **CPU Utilization**: Alert when CPU usage exceeds thresholds
- **Memory Availability**: Alert when available memory drops too low
- **Disk I/O**: Monitor disk read/write operations
- **Network I/O**: Track network in/out traffic

### 2. Auto-Shutdown
- **Scheduled Shutdown**: Automatically stop VMs at specified times
- **Timezone Support**: Configure shutdown time in any timezone
- **Notification**: Email alerts before shutdown
- **Cost Savings**: Reduce costs for non-production environments

### 3. Monitoring Presets
- **Production**: Comprehensive monitoring with aggressive thresholds (75% CPU, 500MB memory)
- **Development**: Balanced monitoring with moderate thresholds (85% CPU, 256MB memory)
- **Testing**: Minimal monitoring with relaxed thresholds (90% CPU, no memory alerts)

## CLI Usage

### Basic Usage with Presets

```bash
# Production preset (comprehensive monitoring)
azmp vm configure-monitoring \
  --vm-name my-prod-vm \
  --email ops@example.com \
  --preset production

# Development preset with auto-shutdown
azmp vm configure-monitoring \
  --vm-name my-dev-vm \
  --email dev@example.com \
  --preset development \
  --auto-shutdown \
  --shutdown-time 19:00 \
  --timezone "Pacific Standard Time"

# Testing preset (minimal monitoring)
azmp vm configure-monitoring \
  --vm-name my-test-vm \
  --email test@example.com \
  --preset testing
```

### Custom Configuration

```bash
# Custom alerts with specific metrics
azmp vm configure-monitoring \
  --vm-name my-custom-vm \
  --email ops@example.com \
  --alert-cpu \
  --alert-memory \
  --alert-disk \
  --threshold 80 \
  --severity Warning

# Validate configuration only
azmp vm configure-monitoring \
  --vm-name my-vm \
  --email ops@example.com \
  --preset production \
  --validate

# Save ARM template to file
azmp vm configure-monitoring \
  --vm-name my-vm \
  --email ops@example.com \
  --preset production \
  --output monitoring-template.json
```

### List Available Presets

```bash
azmp vm configure-monitoring --list-presets
```

## ARM Template Integration

### Parameters

The monitoring feature adds the following parameters to mainTemplate.json:

```json
{
  "enableMonitoring": {
    "type": "bool",
    "defaultValue": true,
    "metadata": {
      "description": "Enable monitoring and alerts"
    }
  },
  "monitoringEmail": {
    "type": "string",
    "defaultValue": "",
    "metadata": {
      "description": "Email address for alert notifications"
    }
  },
  "monitoringPreset": {
    "type": "string",
    "defaultValue": "Production",
    "allowedValues": ["Production", "Development", "Testing", "Custom"],
    "metadata": {
      "description": "Monitoring configuration preset"
    }
  },
  "enableCpuAlert": {
    "type": "bool",
    "defaultValue": false,
    "metadata": {
      "description": "Enable CPU utilization alert (Custom preset only)"
    }
  },
  "enableMemoryAlert": {
    "type": "bool",
    "defaultValue": false,
    "metadata": {
      "description": "Enable memory alert (Custom preset only)"
    }
  },
  "enableDiskAlert": {
    "type": "bool",
    "defaultValue": false,
    "metadata": {
      "description": "Enable disk I/O alerts (Custom preset only)"
    }
  },
  "enableNetworkAlert": {
    "type": "bool",
    "defaultValue": false,
    "metadata": {
      "description": "Enable network I/O alerts (Custom preset only)"
    }
  },
  "alertSeverity": {
    "type": "string",
    "defaultValue": "Warning",
    "allowedValues": ["Critical", "Error", "Warning", "Informational"],
    "metadata": {
      "description": "Alert severity level"
    }
  },
  "enableAutoShutdown": {
    "type": "bool",
    "defaultValue": false,
    "metadata": {
      "description": "Enable auto-shutdown schedule"
    }
  },
  "shutdownTime": {
    "type": "string",
    "defaultValue": "19:00",
    "metadata": {
      "description": "Auto-shutdown time in HH:MM format"
    }
  },
  "shutdownTimezone": {
    "type": "string",
    "defaultValue": "UTC",
    "metadata": {
      "description": "Timezone for shutdown schedule"
    }
  }
}
```

### Resources

Three types of monitoring resources are deployed:

1. **Action Groups** (`microsoft.insights/actionGroups`)
   - Email notifications for alerts
   - Named: `{vmName}-alerts-ag`

2. **Metric Alerts** (`microsoft.insights/metricAlerts`)
   - CPU utilization alerts
   - Memory availability alerts (Windows)
   - Disk I/O alerts (read/write)
   - Network I/O alerts (in/out)
   - Configurable thresholds and severities

3. **Auto-Shutdown Schedules** (`Microsoft.DevTestLab/schedules`)
   - Daily shutdown at specified time
   - Timezone-aware scheduling
   - Email notifications before shutdown

## UI Configuration

The Azure Marketplace UI includes a "Monitoring & Alerts" blade with:

### Alert Configuration
- **Enable Monitoring** checkbox
- **Notification Email** input
- **Monitoring Preset** dropdown (Production/Development/Testing/Custom)
- **Custom Alert Toggles** (CPU, Memory, Disk, Network) - visible when Custom preset selected
- **Alert Severity** dropdown - visible when Custom preset selected

### Auto-Shutdown Configuration
- **Enable Auto-Shutdown** checkbox
- **Shutdown Time** input (HH:MM format)
- **Timezone** dropdown

## Monitoring Presets Details

### Production Preset
**Best for**: Production workloads requiring high availability

- **Alert Rules**: 6 total
  - CPU > 75% (Critical severity)
  - Memory < 500MB (Error severity)
  - Disk read > 100 MB/s (Warning severity)
  - Disk write > 100 MB/s (Warning severity)
  - Network in > 100 MB/s (Warning severity)
  - Network out > 100 MB/s (Warning severity)
- **Evaluation Window**: 5 minutes
- **Evaluation Frequency**: 1 minute
- **Auto-Shutdown**: Disabled
- **Monthly Cost**: ~$1.80 (6 alerts × $0.10 + 1 action group × $1.20)

### Development Preset
**Best for**: Development environments with balanced monitoring

- **Alert Rules**: 4 total
  - CPU > 85% (Warning severity)
  - Memory < 256MB (Warning severity)
  - Disk read > 200 MB/s (Informational severity)
  - Disk write > 200 MB/s (Informational severity)
- **Evaluation Window**: 10 minutes
- **Evaluation Frequency**: 5 minutes
- **Auto-Shutdown**: Enabled (19:00 UTC)
- **Monthly Cost**: ~$1.60 (4 alerts × $0.10 + 1 action group × $1.20)

### Testing Preset
**Best for**: Test environments with cost-optimized monitoring

- **Alert Rules**: 1 total
  - CPU > 90% (Informational severity)
- **Evaluation Window**: 15 minutes
- **Evaluation Frequency**: 15 minutes
- **Auto-Shutdown**: Enabled (18:00 UTC)
- **Monthly Cost**: ~$1.30 (1 alert × $0.10 + 1 action group × $1.20)

## Cost Estimation

### Pricing Components
- **Action Groups**: $1.20/month for email notifications
- **Metric Alerts**: $0.10/month per alert rule
- **Auto-Shutdown**: Free (no additional cost)

### Example Costs
- **Production (6 alerts)**: $1.80/month
- **Development (4 alerts + shutdown)**: $1.60/month
- **Testing (1 alert + shutdown)**: $1.30/month
- **Custom (varies)**: $1.20 base + $0.10 per enabled alert

## Implementation Details

### Core Module
**File**: `src/azure/monitoring.ts` (595 lines)

Key classes and interfaces:
```typescript
class MonitoringManager {
  constructor(config: MonitoringConfig)
  
  // Methods
  addAlertRule(rule: AlertRule): void
  removeAlertRule(name: string): boolean
  setAlertRuleEnabled(name: string, enabled: boolean): boolean
  configureAutoShutdown(config: AutoShutdownConfig): void
  validate(): ValidationResult
  toARMTemplate(): any
  estimateMonthlyCost(): CostEstimate
  getSummary(): string
  
  // Static presets
  static readonly PRESETS: Record<string, MonitoringPreset>
}

interface MonitoringConfig {
  vmName: string;
  enableDiagnostics: boolean;
  alertRules: AlertRule[];
  autoShutdown?: AutoShutdownConfig;
  notificationEmails: string[];
}

interface AlertRule {
  name: string;
  description: string;
  metricName: MetricType;
  operator: AlertOperator;
  threshold: number;
  timeAggregation: TimeAggregation;
  windowSize: string;
  evaluationFrequency: string;
  severity: AlertSeverity;
  enabled: boolean;
}

interface AutoShutdownConfig {
  enabled: boolean;
  shutdownTime: string; // HH:MM format
  timezone: string;
  notificationEmail?: string;
  notificationMinutesBefore: number;
}
```

### CLI Command
**File**: `src/cli/commands/configure-monitoring.ts` (336 lines)

Command options:
- `--vm-name <name>` - VM name (required)
- `--email <email>` - Notification email (required)
- `--preset <preset>` - Use preset configuration
- `--alert-cpu` - Enable CPU alerts
- `--alert-memory` - Enable memory alerts
- `--alert-disk` - Enable disk I/O alerts
- `--alert-network` - Enable network I/O alerts
- `--threshold <number>` - Alert threshold (default: 85)
- `--severity <level>` - Alert severity (default: Warning)
- `--auto-shutdown` - Enable auto-shutdown
- `--shutdown-time <time>` - Shutdown time in HH:MM format
- `--timezone <zone>` - Timezone (default: UTC)
- `--list-presets` - List available presets
- `--validate` - Validate configuration without deployment
- `--output <file>` - Save ARM template to file

### Test Coverage
**File**: `src/azure/__tests__/monitoring.test.ts` (29 tests, 100% passing)

Test suites:
1. **Construction** (4 tests): Basic manager creation, presets
2. **Alert Rules** (6 tests): Add, remove, enable/disable, validation
3. **Auto-Shutdown** (3 tests): Configuration, validation
4. **Validation** (4 tests): Rules validation, configuration checks
5. **Presets** (4 tests): All preset configurations
6. **ARM Template** (3 tests): Resource generation, parameters
7. **Cost Estimation** (2 tests): Basic costs, with diagnostics
8. **Summary** (1 test): Configuration output

## Integration Examples

### With Existing Features

#### Backup + Monitoring
```bash
# Enable both backup and monitoring
azmp vm configure-backup --vm-name my-vm --policy enhanced
azmp vm configure-monitoring --vm-name my-vm --email ops@example.com --preset production
```

#### Data Disks + Monitoring
```bash
# Configure data disks with disk I/O monitoring
azmp vm configure-data-disks --vm-name my-vm --count 2 --size 128 --type Premium_LRS
azmp vm configure-monitoring --vm-name my-vm --email ops@example.com --alert-disk
```

### Programmatic Usage

```typescript
import { MonitoringManager, AlertSeverity, MetricType } from '@hoiltd/azmp-plugin-vm';

// Use preset
const preset = MonitoringManager.PRESETS['Production'];
const config = {
  vmName: 'my-prod-vm',
  alertRules: preset.alertRules.map((rule, index) => ({
    ...rule,
    name: `production-alert-${index + 1}`
  })),
  autoShutdown: preset.autoShutdown,
  notificationEmails: ['ops@example.com'],
  enableDiagnostics: true
};

const manager = new MonitoringManager(config);

// Validate
const validation = manager.validate();
if (!validation.isValid) {
  console.error('Validation failed:', validation.errors);
  process.exit(1);
}

// Generate ARM template
const template = manager.toARMTemplate();

// Estimate costs
const cost = manager.estimateMonthlyCost();
console.log(`Monthly cost: $${cost.total.toFixed(2)}`);

// Get summary
console.log(manager.getSummary());
```

## Troubleshooting

### Common Issues

**Problem**: Alerts not firing  
**Solution**: Ensure metrics are being collected by Azure Monitor. Check that the VM has the Azure Monitor Agent installed.

**Problem**: Auto-shutdown not working  
**Solution**: Verify the shutdown time and timezone are correctly configured. Check Azure DevTest Labs schedule permissions.

**Problem**: Email notifications not received  
**Solution**: Check spam folder, verify email address is correct in action group, ensure action group is linked to alert rules.

**Problem**: High alert costs  
**Solution**: Use Testing or Development presets for non-production environments. Disable unused alert rules. Consider increasing evaluation windows and frequencies.

## Validation

### Validation Rules
1. VM name must be provided
2. At least one notification email required
3. Alert rules must have valid thresholds (0-100 for percentages)
4. Auto-shutdown time must be in HH:MM format
5. Evaluation frequency must not exceed window size

### Example Validation Output
```
✅ Monitoring configuration is valid

Configuration Summary:
---------------------
VM Name: my-prod-vm
Notification Emails: ops@example.com

Alert Rules (6):
  1. production-alert-1: CPU > 75% (Critical)
  2. production-alert-2: Memory < 500MB (Error)
  3. production-alert-3: Disk Read > 100 MB/s (Warning)
  4. production-alert-4: Disk Write > 100 MB/s (Warning)
  5. production-alert-5: Network In > 100 MB/s (Warning)
  6. production-alert-6: Network Out > 100 MB/s (Warning)

Auto-Shutdown: Disabled

Estimated Monthly Cost: $1.80
  - Action Groups: $1.20
  - Metric Alerts: $0.60 (6 × $0.10)
```

## Best Practices

1. **Use Presets**: Start with presets appropriate for your environment (Production/Development/Testing)
2. **Email Notifications**: Configure distribution lists for production alerts
3. **Auto-Shutdown**: Enable for dev/test environments to save costs
4. **Alert Severity**: Use Critical/Error for production, Warning/Informational for dev/test
5. **Evaluation Windows**: Longer windows reduce noise but delay detection
6. **Cost Management**: Disable unnecessary alerts, especially for non-production
7. **Testing**: Validate configurations with `--validate` before deployment

## Migration from Previous Versions

If you're upgrading from a version without monitoring support:

1. **Add monitoring configuration** to existing VMs using the CLI
2. **Update ARM templates** to include monitoring parameters
3. **Configure presets** for different environments
4. **Test alerts** by temporarily lowering thresholds
5. **Document** monitoring strategy in runbooks

## Next Steps

After completing P1-4 Monitoring Support:
- **P1-5**: Azure Hybrid Benefit implementation
- **P1-6**: Certification Tool for Azure certification requirements

## References

- [Azure Monitor Alerts](https://docs.microsoft.com/azure/azure-monitor/alerts/alerts-overview)
- [Metric Alerts](https://docs.microsoft.com/azure/azure-monitor/alerts/alerts-metric)
- [Action Groups](https://docs.microsoft.com/azure/azure-monitor/alerts/action-groups)
- [Auto-Shutdown for VMs](https://docs.microsoft.com/azure/lab-services/how-to-enable-shutdown-disconnect)
- [Azure Monitor Pricing](https://azure.microsoft.com/pricing/details/monitor/)
