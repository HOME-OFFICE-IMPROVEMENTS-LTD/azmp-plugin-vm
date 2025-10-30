"use strict";
/**
 * Azure VM Monitoring and Alert Rules Configuration
 * Provides monitoring, alerting, and auto-shutdown capabilities for Azure Marketplace VMs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringManager = exports.TimeAggregation = exports.AlertOperator = exports.AlertSeverity = exports.MetricType = void 0;
var MetricType;
(function (MetricType) {
    MetricType["CPU"] = "Percentage CPU";
    MetricType["Memory"] = "Available Memory Bytes";
    MetricType["DiskRead"] = "Disk Read Bytes";
    MetricType["DiskWrite"] = "Disk Write Bytes";
    MetricType["NetworkIn"] = "Network In Total";
    MetricType["NetworkOut"] = "Network Out Total";
})(MetricType || (exports.MetricType = MetricType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity[AlertSeverity["Critical"] = 0] = "Critical";
    AlertSeverity[AlertSeverity["Error"] = 1] = "Error";
    AlertSeverity[AlertSeverity["Warning"] = 2] = "Warning";
    AlertSeverity[AlertSeverity["Informational"] = 3] = "Informational";
    AlertSeverity[AlertSeverity["Verbose"] = 4] = "Verbose";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertOperator;
(function (AlertOperator) {
    AlertOperator["GreaterThan"] = "GreaterThan";
    AlertOperator["GreaterThanOrEqual"] = "GreaterThanOrEqual";
    AlertOperator["LessThan"] = "LessThan";
    AlertOperator["LessThanOrEqual"] = "LessThanOrEqual";
    AlertOperator["Equal"] = "Equal";
    AlertOperator["NotEqual"] = "NotEqual";
})(AlertOperator || (exports.AlertOperator = AlertOperator = {}));
var TimeAggregation;
(function (TimeAggregation) {
    TimeAggregation["Average"] = "Average";
    TimeAggregation["Minimum"] = "Minimum";
    TimeAggregation["Maximum"] = "Maximum";
    TimeAggregation["Total"] = "Total";
    TimeAggregation["Count"] = "Count";
})(TimeAggregation || (exports.TimeAggregation = TimeAggregation = {}));
/**
 * Monitoring and alert configuration manager
 */
class MonitoringManager {
    config;
    /**
     * Predefined monitoring presets for common scenarios
     */
    static PRESETS = {
        Production: {
            name: 'Production',
            description: 'High-availability production workload with critical alerts',
            alertRules: [
                {
                    description: 'CPU usage exceeds 90%',
                    metricName: MetricType.CPU,
                    operator: AlertOperator.GreaterThan,
                    threshold: 90,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT5M',
                    evaluationFrequency: 'PT1M',
                    severity: AlertSeverity.Critical,
                    enabled: true
                },
                {
                    description: 'CPU usage exceeds 80%',
                    metricName: MetricType.CPU,
                    operator: AlertOperator.GreaterThan,
                    threshold: 80,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT5M',
                    evaluationFrequency: 'PT1M',
                    severity: AlertSeverity.Warning,
                    enabled: true
                },
                {
                    description: 'Available memory below 500 MB',
                    metricName: MetricType.Memory,
                    operator: AlertOperator.LessThan,
                    threshold: 500 * 1024 * 1024, // 500 MB in bytes
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT5M',
                    evaluationFrequency: 'PT1M',
                    severity: AlertSeverity.Critical,
                    enabled: true
                },
                {
                    description: 'Disk read operations exceed 100 MB/s',
                    metricName: MetricType.DiskRead,
                    operator: AlertOperator.GreaterThan,
                    threshold: 100 * 1024 * 1024, // 100 MB/s in bytes
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT5M',
                    evaluationFrequency: 'PT5M',
                    severity: AlertSeverity.Warning,
                    enabled: true
                }
            ],
            autoShutdown: {
                enabled: false,
                shutdownTime: '19:00',
                timezone: 'UTC',
                notificationMinutesBefore: 30
            }
        },
        Development: {
            name: 'Development',
            description: 'Development environment with cost-saving auto-shutdown',
            alertRules: [
                {
                    description: 'CPU usage exceeds 95%',
                    metricName: MetricType.CPU,
                    operator: AlertOperator.GreaterThan,
                    threshold: 95,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT15M',
                    evaluationFrequency: 'PT5M',
                    severity: AlertSeverity.Warning,
                    enabled: true
                },
                {
                    description: 'Available memory below 200 MB',
                    metricName: MetricType.Memory,
                    operator: AlertOperator.LessThan,
                    threshold: 200 * 1024 * 1024,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT15M',
                    evaluationFrequency: 'PT5M',
                    severity: AlertSeverity.Warning,
                    enabled: true
                }
            ],
            autoShutdown: {
                enabled: true,
                shutdownTime: '19:00',
                timezone: 'UTC',
                notificationMinutesBefore: 15
            }
        },
        Testing: {
            name: 'Testing',
            description: 'Test environment with basic monitoring and auto-shutdown',
            alertRules: [
                {
                    description: 'CPU usage exceeds 95%',
                    metricName: MetricType.CPU,
                    operator: AlertOperator.GreaterThan,
                    threshold: 95,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT30M',
                    evaluationFrequency: 'PT15M',
                    severity: AlertSeverity.Informational,
                    enabled: true
                }
            ],
            autoShutdown: {
                enabled: true,
                shutdownTime: '18:00',
                timezone: 'UTC',
                notificationMinutesBefore: 10
            }
        },
        Minimal: {
            name: 'Minimal',
            description: 'Minimal monitoring with critical alerts only',
            alertRules: [
                {
                    description: 'CPU usage exceeds 98%',
                    metricName: MetricType.CPU,
                    operator: AlertOperator.GreaterThan,
                    threshold: 98,
                    timeAggregation: TimeAggregation.Average,
                    windowSize: 'PT15M',
                    evaluationFrequency: 'PT5M',
                    severity: AlertSeverity.Error,
                    enabled: true
                }
            ],
            autoShutdown: {
                enabled: false,
                shutdownTime: '20:00',
                timezone: 'UTC',
                notificationMinutesBefore: 0
            }
        }
    };
    constructor(config) {
        this.config = config;
    }
    /**
     * Apply a monitoring preset
     */
    static applyPreset(presetName, vmName, notificationEmails = []) {
        const preset = MonitoringManager.PRESETS[presetName];
        if (!preset) {
            throw new Error(`Unknown monitoring preset: ${presetName}`);
        }
        const config = {
            vmName,
            enableDiagnostics: true,
            alertRules: preset.alertRules.map((rule, index) => ({
                name: `${vmName}-alert-${index + 1}`,
                ...rule
            })),
            notificationEmails
        };
        if (preset.autoShutdown) {
            config.autoShutdown = {
                ...preset.autoShutdown,
                notificationEmail: notificationEmails[0]
            };
        }
        return new MonitoringManager(config);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    /**
     * Add alert rule
     */
    addAlertRule(rule) {
        this.config.alertRules.push(rule);
    }
    /**
     * Remove alert rule by name
     */
    removeAlertRule(ruleName) {
        const initialLength = this.config.alertRules.length;
        this.config.alertRules = this.config.alertRules.filter(r => r.name !== ruleName);
        return this.config.alertRules.length < initialLength;
    }
    /**
     * Enable/disable alert rule
     */
    setAlertRuleEnabled(ruleName, enabled) {
        const rule = this.config.alertRules.find(r => r.name === ruleName);
        if (!rule) {
            return false;
        }
        rule.enabled = enabled;
        return true;
    }
    /**
     * Configure auto-shutdown
     */
    configureAutoShutdown(config) {
        this.config.autoShutdown = config;
    }
    /**
     * Validate monitoring configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
        // Validate VM name
        if (!this.config.vmName || this.config.vmName.trim() === '') {
            errors.push('VM name is required');
        }
        // Validate alert rules
        if (this.config.alertRules.length === 0) {
            warnings.push('No alert rules configured - monitoring will be limited');
        }
        for (const rule of this.config.alertRules) {
            // Validate rule name
            if (!rule.name || rule.name.trim() === '') {
                errors.push('Alert rule name is required');
            }
            // Validate threshold
            if (rule.threshold < 0) {
                errors.push(`Alert rule "${rule.name}": threshold must be non-negative`);
            }
            // Validate time windows
            if (!this.isValidISO8601Duration(rule.windowSize)) {
                errors.push(`Alert rule "${rule.name}": invalid windowSize format (use ISO 8601 duration)`);
            }
            if (!this.isValidISO8601Duration(rule.evaluationFrequency)) {
                errors.push(`Alert rule "${rule.name}": invalid evaluationFrequency format (use ISO 8601 duration)`);
            }
            // Warning for high-frequency evaluation
            if (this.parseDurationToMinutes(rule.evaluationFrequency) < 1) {
                warnings.push(`Alert rule "${rule.name}": evaluation frequency < 1 minute may incur high costs`);
            }
        }
        // Validate auto-shutdown
        if (this.config.autoShutdown) {
            const shutdown = this.config.autoShutdown;
            // Validate time format
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(shutdown.shutdownTime)) {
                errors.push('Auto-shutdown time must be in HH:MM format (24-hour)');
            }
            // Validate timezone
            if (!shutdown.timezone || shutdown.timezone.trim() === '') {
                errors.push('Auto-shutdown timezone is required');
            }
            // Validate notification settings
            if (shutdown.notificationMinutesBefore < 0 || shutdown.notificationMinutesBefore > 120) {
                warnings.push('Notification minutes before shutdown should be between 0-120');
            }
            if (shutdown.enabled && !shutdown.notificationEmail && this.config.notificationEmails.length === 0) {
                warnings.push('Auto-shutdown enabled but no notification email configured');
            }
        }
        // Validate notification emails
        for (const email of this.config.notificationEmails) {
            if (!this.isValidEmail(email)) {
                errors.push(`Invalid email address: ${email}`);
            }
        }
        // Validate diagnostics
        if (this.config.enableDiagnostics && !this.config.diagnosticsStorageAccount) {
            warnings.push('Diagnostics enabled but no storage account specified - will use default');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Generate ARM template resources for monitoring
     */
    toARMTemplate() {
        const resources = [];
        // Action Group for notifications
        if (this.config.notificationEmails.length > 0) {
            resources.push({
                type: 'microsoft.insights/actionGroups',
                apiVersion: '2023-01-01',
                name: `[concat(parameters('vmName'), '-actiongroup')]`,
                location: 'Global',
                properties: {
                    groupShortName: '[substring(parameters(\'vmName\'), 0, 12)]',
                    enabled: true,
                    emailReceivers: this.config.notificationEmails.map((email, index) => ({
                        name: `email-${index + 1}`,
                        emailAddress: email,
                        useCommonAlertSchema: true
                    }))
                }
            });
        }
        // Metric alerts
        for (const rule of this.config.alertRules) {
            if (!rule.enabled)
                continue;
            resources.push({
                type: 'microsoft.insights/metricAlerts',
                apiVersion: '2018-03-01',
                name: `[concat(parameters('vmName'), '-', '${rule.name}')]`,
                location: 'global',
                dependsOn: [
                    '[resourceId(\'Microsoft.Compute/virtualMachines\', parameters(\'vmName\'))]',
                    ...(this.config.notificationEmails.length > 0 ? [
                        '[resourceId(\'microsoft.insights/actionGroups\', concat(parameters(\'vmName\'), \'-actiongroup\'))]'
                    ] : [])
                ],
                properties: {
                    description: rule.description,
                    severity: rule.severity,
                    enabled: true,
                    scopes: [
                        '[resourceId(\'Microsoft.Compute/virtualMachines\', parameters(\'vmName\'))]'
                    ],
                    evaluationFrequency: rule.evaluationFrequency,
                    windowSize: rule.windowSize,
                    criteria: {
                        'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria',
                        allOf: [
                            {
                                name: 'Metric1',
                                metricName: rule.metricName,
                                operator: rule.operator,
                                threshold: rule.threshold,
                                timeAggregation: rule.timeAggregation
                            }
                        ]
                    },
                    ...(this.config.notificationEmails.length > 0 && {
                        actions: [
                            {
                                actionGroupId: '[resourceId(\'microsoft.insights/actionGroups\', concat(parameters(\'vmName\'), \'-actiongroup\'))]'
                            }
                        ]
                    })
                }
            });
        }
        // Auto-shutdown schedule
        if (this.config.autoShutdown?.enabled) {
            const shutdown = this.config.autoShutdown;
            resources.push({
                type: 'Microsoft.DevTestLab/schedules',
                apiVersion: '2018-09-15',
                name: `[concat('shutdown-computevm-', parameters('vmName'))]`,
                location: '[resourceGroup().location]',
                dependsOn: [
                    '[resourceId(\'Microsoft.Compute/virtualMachines\', parameters(\'vmName\'))]'
                ],
                properties: {
                    status: 'Enabled',
                    taskType: 'ComputeVmShutdownTask',
                    dailyRecurrence: {
                        time: shutdown.shutdownTime.replace(':', '')
                    },
                    timeZoneId: shutdown.timezone,
                    notificationSettings: {
                        status: shutdown.notificationEmail ? 'Enabled' : 'Disabled',
                        timeInMinutes: shutdown.notificationMinutesBefore,
                        ...(shutdown.notificationEmail && {
                            emailRecipient: shutdown.notificationEmail
                        }),
                        ...(shutdown.notificationWebhookUrl && {
                            webhookUrl: shutdown.notificationWebhookUrl
                        }),
                        notificationLocale: 'en'
                    },
                    targetResourceId: '[resourceId(\'Microsoft.Compute/virtualMachines\', parameters(\'vmName\'))]'
                }
            });
        }
        return resources;
    }
    /**
     * Get estimated monthly cost for monitoring
     */
    estimateMonthlyCost() {
        let cost = 0;
        // Metric alerts: $0.10 per alert rule per month (first 10 free)
        const paidAlertRules = Math.max(0, this.config.alertRules.filter(r => r.enabled).length - 10);
        cost += paidAlertRules * 0.10;
        // Action group notifications: $0.001 per email (first 1000 free per month)
        // Estimate: assume 100 alerts per month per rule
        const estimatedAlertsPerMonth = this.config.alertRules.filter(r => r.enabled).length * 100;
        const paidEmails = Math.max(0, estimatedAlertsPerMonth - 1000);
        cost += paidEmails * 0.001;
        // Diagnostics storage: approximately $0.10/GB/month
        // Estimate: 1GB per month for diagnostics
        if (this.config.enableDiagnostics) {
            cost += 0.10;
        }
        // Auto-shutdown: free
        // Action groups: free
        return Math.round(cost * 100) / 100; // Round to 2 decimals
    }
    /**
     * Get summary of monitoring configuration
     */
    getSummary() {
        const lines = [
            `Monitoring Configuration for ${this.config.vmName}`,
            '='.repeat(50)
        ];
        // Alert rules
        lines.push(`\nAlert Rules: ${this.config.alertRules.length} configured`);
        for (const rule of this.config.alertRules) {
            const status = rule.enabled ? '✓' : '✗';
            lines.push(`  ${status} ${rule.name}: ${rule.description}`);
            lines.push(`    Severity: ${AlertSeverity[rule.severity]}, Threshold: ${rule.threshold}`);
        }
        // Auto-shutdown
        if (this.config.autoShutdown) {
            const status = this.config.autoShutdown.enabled ? 'Enabled' : 'Disabled';
            lines.push(`\nAuto-Shutdown: ${status}`);
            if (this.config.autoShutdown.enabled) {
                lines.push(`  Time: ${this.config.autoShutdown.shutdownTime} (${this.config.autoShutdown.timezone})`);
                lines.push(`  Notification: ${this.config.autoShutdown.notificationMinutesBefore} minutes before`);
            }
        }
        // Notifications
        lines.push(`\nNotification Emails: ${this.config.notificationEmails.length}`);
        for (const email of this.config.notificationEmails) {
            lines.push(`  - ${email}`);
        }
        // Cost
        lines.push(`\nEstimated Monthly Cost: $${this.estimateMonthlyCost()}`);
        return lines.join('\n');
    }
    // Helper methods
    isValidISO8601Duration(duration) {
        return /^PT(\d+H)?(\d+M)?(\d+S)?$/.test(duration) || /^P(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.test(duration);
    }
    parseDurationToMinutes(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match)
            return 0;
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        return hours * 60 + minutes + seconds / 60;
    }
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
exports.MonitoringManager = MonitoringManager;
