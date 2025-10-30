/**
 * Azure VM Monitoring and Alert Rules Configuration
 * Provides monitoring, alerting, and auto-shutdown capabilities for Azure Marketplace VMs
 */
export declare enum MetricType {
    CPU = "Percentage CPU",
    Memory = "Available Memory Bytes",
    DiskRead = "Disk Read Bytes",
    DiskWrite = "Disk Write Bytes",
    NetworkIn = "Network In Total",
    NetworkOut = "Network Out Total"
}
export declare enum AlertSeverity {
    Critical = 0,
    Error = 1,
    Warning = 2,
    Informational = 3,
    Verbose = 4
}
export declare enum AlertOperator {
    GreaterThan = "GreaterThan",
    GreaterThanOrEqual = "GreaterThanOrEqual",
    LessThan = "LessThan",
    LessThanOrEqual = "LessThanOrEqual",
    Equal = "Equal",
    NotEqual = "NotEqual"
}
export declare enum TimeAggregation {
    Average = "Average",
    Minimum = "Minimum",
    Maximum = "Maximum",
    Total = "Total",
    Count = "Count"
}
export interface AlertRule {
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
export interface AutoShutdownConfig {
    enabled: boolean;
    shutdownTime: string;
    timezone: string;
    notificationEmail?: string;
    notificationWebhookUrl?: string;
    notificationMinutesBefore: number;
}
export interface MonitoringConfig {
    vmName: string;
    enableDiagnostics: boolean;
    diagnosticsStorageAccount?: string;
    alertRules: AlertRule[];
    autoShutdown?: AutoShutdownConfig;
    actionGroupName?: string;
    notificationEmails: string[];
}
export interface MonitoringPreset {
    name: string;
    description: string;
    alertRules: Omit<AlertRule, 'name'>[];
    autoShutdown?: Omit<AutoShutdownConfig, 'notificationEmail'>;
}
/**
 * Monitoring and alert configuration manager
 */
export declare class MonitoringManager {
    private config;
    /**
     * Predefined monitoring presets for common scenarios
     */
    static readonly PRESETS: Record<string, MonitoringPreset>;
    constructor(config: MonitoringConfig);
    /**
     * Apply a monitoring preset
     */
    static applyPreset(presetName: string, vmName: string, notificationEmails?: string[]): MonitoringManager;
    /**
     * Get configuration
     */
    getConfig(): MonitoringConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<MonitoringConfig>): void;
    /**
     * Add alert rule
     */
    addAlertRule(rule: AlertRule): void;
    /**
     * Remove alert rule by name
     */
    removeAlertRule(ruleName: string): boolean;
    /**
     * Enable/disable alert rule
     */
    setAlertRuleEnabled(ruleName: string, enabled: boolean): boolean;
    /**
     * Configure auto-shutdown
     */
    configureAutoShutdown(config: AutoShutdownConfig): void;
    /**
     * Validate monitoring configuration
     */
    validate(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Generate ARM template resources for monitoring
     */
    toARMTemplate(): any;
    /**
     * Get estimated monthly cost for monitoring
     */
    estimateMonthlyCost(): number;
    /**
     * Get summary of monitoring configuration
     */
    getSummary(): string;
    private isValidISO8601Duration;
    private parseDurationToMinutes;
    private isValidEmail;
}
