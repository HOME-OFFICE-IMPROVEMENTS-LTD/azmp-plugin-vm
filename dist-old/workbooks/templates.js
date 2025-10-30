"use strict";
/**
 * Azure Monitor Workbook Templates
 * Pre-built workbook definitions for VM monitoring, application insights, and infrastructure analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkbookTemplateManager = void 0;
const workbooks_1 = require("../monitoring/workbooks");
/**
 * VM Monitoring Templates (8 templates)
 * Focus on VM performance, health, security, and operational metrics
 */
const VM_MONITORING_TEMPLATES = [
    {
        id: "vm-performance-dashboard",
        name: "VM Performance Dashboard",
        description: "Comprehensive VM performance monitoring with CPU, memory, disk, and network metrics",
        category: "vm-monitoring",
        tags: ["performance", "monitoring", "cpu", "memory", "disk", "network"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Performance Dashboard\n\nComprehensive monitoring of virtual machine performance metrics including CPU utilization, memory usage, disk I/O, and network throughput.",
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: 'Perf | where ObjectName == "Processor" and CounterName == "% Processor Time" | where TimeGenerated > ago(1h) | summarize avg(CounterValue) by bin(TimeGenerated, 5m), Computer | render timechart',
                        size: 0,
                        title: "CPU Utilization Over Time",
                        timeContext: {
                            durationMs: 3600000,
                        },
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: 'Perf | where ObjectName == "Memory" and CounterName == "Available MBytes" | where TimeGenerated > ago(1h) | summarize avg(CounterValue) by bin(TimeGenerated, 5m), Computer | render timechart',
                        size: 0,
                        title: "Available Memory Over Time",
                    },
                },
            ],
        },
    },
    {
        id: "vm-availability-monitor",
        name: "VM Availability Monitor",
        description: "Track VM uptime, availability, and heartbeat status across your infrastructure",
        category: "vm-monitoring",
        tags: ["availability", "uptime", "heartbeat", "monitoring"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Availability Monitor\n\nMonitor virtual machine availability, uptime, and heartbeat status to ensure infrastructure reliability.",
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: 'Heartbeat | where TimeGenerated > ago(24h) | summarize LastHeartbeat = max(TimeGenerated) by Computer | extend Status = iff(LastHeartbeat > ago(5m), "Online", "Offline") | project Computer, LastHeartbeat, Status',
                        size: 0,
                        title: "VM Heartbeat Status",
                    },
                },
            ],
        },
    },
    {
        id: "vm-security-insights",
        name: "VM Security Insights",
        description: "Security monitoring dashboard for VMs including security events, updates, and compliance status",
        category: "vm-monitoring",
        tags: ["security", "compliance", "updates", "events"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Security Insights\n\nComprehensive security monitoring for virtual machines including security events, update compliance, and threat detection.",
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: "SecurityEvent | where TimeGenerated > ago(24h) | summarize count() by EventID, Activity | top 10 by count_",
                        size: 0,
                        title: "Top Security Events (24h)",
                    },
                },
            ],
        },
    },
    {
        id: "vm-cost-analysis",
        name: "VM Cost Analysis",
        description: "Cost optimization dashboard showing VM spending, rightsizing recommendations, and usage patterns",
        category: "vm-monitoring",
        tags: ["cost", "optimization", "spending", "rightsizing"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Cost Analysis\n\nAnalyze virtual machine costs, identify optimization opportunities, and track spending trends.",
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: 'Usage | where ResourceType == "Microsoft.Compute/virtualMachines" | summarize TotalCost = sum(PretaxCost) by ResourceName, MeterCategory | top 10 by TotalCost',
                        size: 0,
                        title: "Top VM Costs by Resource",
                    },
                },
            ],
        },
    },
    {
        id: "vm-capacity-planning",
        name: "VM Capacity Planning",
        description: "Capacity planning dashboard for VM resources with growth trends and utilization forecasting",
        category: "vm-monitoring",
        tags: ["capacity", "planning", "forecasting", "growth"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Capacity Planning\n\nPlan for future capacity needs with utilization trends, growth forecasting, and resource recommendations.",
                    },
                },
                {
                    type: 3,
                    content: {
                        version: "KqlItem/1.0",
                        query: 'Perf | where CounterName == "% Processor Time" and ObjectName == "Processor" | where TimeGenerated > ago(30d) | summarize avg(CounterValue) by bin(TimeGenerated, 1d), Computer | render timechart',
                        size: 0,
                        title: "CPU Utilization Trend (30 days)",
                    },
                },
            ],
        },
    },
    {
        id: "vm-backup-compliance",
        name: "VM Backup Compliance",
        description: "Monitor VM backup status, compliance, and recovery point objectives across your environment",
        category: "vm-monitoring",
        tags: ["backup", "compliance", "recovery", "rpo"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Backup Compliance\n\nMonitor backup status, compliance levels, and recovery objectives for virtual machines.",
                    },
                },
            ],
        },
    },
    {
        id: "vm-network-insights",
        name: "VM Network Insights",
        description: "Network performance and connectivity analysis for VMs including bandwidth and latency metrics",
        category: "vm-monitoring",
        tags: ["network", "connectivity", "bandwidth", "latency"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Network Insights\n\nAnalyze network performance, connectivity, and bandwidth utilization for virtual machines.",
                    },
                },
            ],
        },
    },
    {
        id: "vm-extension-health",
        name: "VM Extension Health",
        description: "Monitor VM extensions status, health, and performance across your virtual machine fleet",
        category: "vm-monitoring",
        tags: ["extensions", "health", "status", "performance"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VM Extension Health\n\nMonitor the health and status of VM extensions across your virtual machine infrastructure.",
                    },
                },
            ],
        },
    },
];
const ADVANCED_MONITORING_TEMPLATES = workbooks_1.advancedWorkbookTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags.map((tag) => tag.toLowerCase()),
    version: template.version,
    definition: template.template,
    complexity: template.complexity,
    estimatedSetupTime: template.estimatedSetupTime,
    prerequisites: template.prerequisites,
}));
/**
 * Application Templates (6 templates)
 * Focus on application performance monitoring and user experience
 */
const APPLICATION_TEMPLATES = [
    {
        id: "app-performance-monitoring",
        name: "Application Performance Monitoring",
        description: "APM dashboard for applications running on VMs with response times, error rates, and throughput",
        category: "application",
        tags: ["apm", "performance", "response-time", "errors", "throughput"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Application Performance Monitoring\n\nMonitor application performance with response times, error rates, and throughput metrics.",
                    },
                },
            ],
        },
    },
    {
        id: "user-analytics-dashboard",
        name: "User Analytics Dashboard",
        description: "User behavior and analytics dashboard for applications with session data and user journeys",
        category: "application",
        tags: ["analytics", "users", "sessions", "behavior"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## User Analytics Dashboard\n\nAnalyze user behavior, sessions, and application usage patterns.",
                    },
                },
            ],
        },
    },
    {
        id: "error-tracking-analysis",
        name: "Error Tracking & Analysis",
        description: "Error tracking dashboard with exception analysis, error trends, and impact assessment",
        category: "application",
        tags: ["errors", "exceptions", "tracking", "analysis"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Error Tracking & Analysis\n\nTrack application errors, analyze exception patterns, and assess impact on user experience.",
                    },
                },
            ],
        },
    },
    {
        id: "dependency-map-monitor",
        name: "Dependency Map Monitor",
        description: "Application dependency mapping and monitoring with service topology and health status",
        category: "application",
        tags: ["dependencies", "topology", "services", "health"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Dependency Map Monitor\n\nVisualize application dependencies, service topology, and component health status.",
                    },
                },
            ],
        },
    },
    {
        id: "availability-sla-tracker",
        name: "Availability & SLA Tracker",
        description: "Application availability tracking with SLA compliance monitoring and uptime analysis",
        category: "application",
        tags: ["availability", "sla", "uptime", "compliance"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Availability & SLA Tracker\n\nTrack application availability, monitor SLA compliance, and analyze uptime trends.",
                    },
                },
            ],
        },
    },
    {
        id: "custom-metrics-dashboard",
        name: "Custom Metrics Dashboard",
        description: "Custom application metrics dashboard with business KPIs and domain-specific measurements",
        category: "application",
        tags: ["custom", "metrics", "kpis", "business"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Custom Metrics Dashboard\n\nMonitor custom application metrics, business KPIs, and domain-specific measurements.",
                    },
                },
            ],
        },
    },
];
/**
 * Infrastructure Templates (6 templates)
 * Focus on infrastructure-wide monitoring and management
 */
const INFRASTRUCTURE_TEMPLATES = [
    {
        id: "multi-vm-dashboard",
        name: "Multi-VM Dashboard",
        description: "Comprehensive dashboard for monitoring multiple VMs across resource groups and subscriptions",
        category: "infrastructure",
        tags: ["multi-vm", "overview", "infrastructure", "fleet"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Multi-VM Dashboard\n\nComprehensive overview of multiple virtual machines across your Azure infrastructure.",
                    },
                },
            ],
        },
    },
    {
        id: "vmss-autoscale-monitor",
        name: "VMSS Autoscale Monitor",
        description: "Virtual Machine Scale Set monitoring with autoscale events, instance health, and scaling metrics",
        category: "infrastructure",
        tags: ["vmss", "autoscale", "scaling", "instances"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## VMSS Autoscale Monitor\n\nMonitor Virtual Machine Scale Sets with autoscale events, instance health, and scaling metrics.",
                    },
                },
            ],
        },
    },
    {
        id: "load-balancer-health",
        name: "Load Balancer Health",
        description: "Load balancer monitoring dashboard with backend health, traffic distribution, and performance metrics",
        category: "infrastructure",
        tags: ["load-balancer", "health", "traffic", "distribution"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Load Balancer Health\n\nMonitor load balancer health, backend pool status, and traffic distribution patterns.",
                    },
                },
            ],
        },
    },
    {
        id: "nsg-flow-analysis",
        name: "NSG Flow Analysis",
        description: "Network Security Group flow logs analysis with traffic patterns and security insights",
        category: "infrastructure",
        tags: ["nsg", "flows", "network", "security"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## NSG Flow Analysis\n\nAnalyze Network Security Group flow logs, traffic patterns, and security events.",
                    },
                },
            ],
        },
    },
    {
        id: "disaster-recovery-status",
        name: "Disaster Recovery Status",
        description: "DR monitoring dashboard with replication health, failover readiness, and recovery objectives",
        category: "infrastructure",
        tags: ["disaster-recovery", "replication", "failover", "rto"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Disaster Recovery Status\n\nMonitor disaster recovery status, replication health, and failover readiness.",
                    },
                },
            ],
        },
    },
    {
        id: "compliance-overview",
        name: "Compliance Overview",
        description: "Infrastructure compliance dashboard with policy adherence, security standards, and audit results",
        category: "infrastructure",
        tags: ["compliance", "policy", "security", "audit"],
        version: "1.0.0",
        definition: {
            version: "Notebook/1.0",
            items: [
                {
                    type: 1,
                    content: {
                        json: "## Compliance Overview\n\nMonitor infrastructure compliance with policies, security standards, and audit requirements.",
                    },
                },
            ],
        },
    },
];
/**
 * WorkbookTemplateManager class
 * Manages workbook templates and provides generation capabilities
 */
class WorkbookTemplateManager {
    static ALL_TEMPLATES = [
        ...VM_MONITORING_TEMPLATES,
        ...APPLICATION_TEMPLATES,
        ...INFRASTRUCTURE_TEMPLATES,
        ...ADVANCED_MONITORING_TEMPLATES,
    ];
    /**
     * Get all available workbook templates
     */
    static getAllTemplates() {
        return [...this.ALL_TEMPLATES];
    }
    /**
     * Get templates by category
     */
    static getTemplatesByCategory(category) {
        return this.ALL_TEMPLATES.filter((template) => template.category === category);
    }
    /**
     * Get a specific template by ID
     */
    static getTemplate(templateId) {
        return (this.ALL_TEMPLATES.find((template) => template.id === templateId) || null);
    }
    /**
     * Search templates by tags
     */
    static searchTemplatesByTags(tags) {
        return this.ALL_TEMPLATES.filter((template) => tags.some((tag) => template.tags.includes(tag.toLowerCase())));
    }
    /**
     * Generate a workbook from a template with custom parameters
     */
    static generateWorkbook(options) {
        const template = this.getTemplate(options.templateId);
        if (!template) {
            throw new Error(`Template not found: ${options.templateId}`);
        }
        // Clone the template definition
        const workbook = JSON.parse(JSON.stringify(template.definition));
        // Apply custom parameters if provided
        if (options.customParameters) {
            this.applyCustomParameters(workbook, options.customParameters);
        }
        // Add metadata
        workbook.metadata = {
            templateId: template.id,
            templateName: template.name,
            templateVersion: template.version,
            generatedAt: new Date().toISOString(),
            generatedBy: "azmp-plugin-vm",
            subscriptionId: options.subscriptionId,
            resourceGroupName: options.resourceGroupName,
            vmName: options.vmName,
            location: options.location,
        };
        return workbook;
    }
    /**
     * Apply custom parameters to a workbook definition
     */
    static applyCustomParameters(workbook, parameters) {
        // Replace parameter placeholders in the workbook definition
        const workbookString = JSON.stringify(workbook);
        let updatedWorkbookString = workbookString;
        for (const [key, value] of Object.entries(parameters)) {
            const placeholder = `{{${key}}}`;
            updatedWorkbookString = updatedWorkbookString.replace(new RegExp(placeholder, "g"), String(value));
        }
        const updatedWorkbook = JSON.parse(updatedWorkbookString);
        Object.assign(workbook, updatedWorkbook);
    }
    /**
     * Validate a workbook template definition
     */
    static validateTemplate(template) {
        const errors = [];
        // Basic validation
        if (!template.id || typeof template.id !== "string") {
            errors.push("Template ID is required and must be a string");
        }
        if (!template.name || typeof template.name !== "string") {
            errors.push("Template name is required and must be a string");
        }
        if (!template.description || typeof template.description !== "string") {
            errors.push("Template description is required and must be a string");
        }
        if (!["vm-monitoring", "application", "infrastructure"].includes(template.category)) {
            errors.push("Template category must be one of: vm-monitoring, application, infrastructure");
        }
        if (!Array.isArray(template.tags)) {
            errors.push("Template tags must be an array");
        }
        if (!template.version || typeof template.version !== "string") {
            errors.push("Template version is required and must be a string");
        }
        if (!template.definition || typeof template.definition !== "object") {
            errors.push("Template definition is required and must be an object");
        }
        // Workbook definition validation
        if (template.definition && !template.definition.version) {
            errors.push("Workbook definition must have a version property");
        }
        if (template.definition && !Array.isArray(template.definition.items)) {
            errors.push("Workbook definition must have an items array");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Get template statistics
     */
    static getTemplateStats() {
        const byCategory = {};
        const byTags = {};
        for (const template of this.ALL_TEMPLATES) {
            // Count by category
            byCategory[template.category] = (byCategory[template.category] || 0) + 1;
            // Count by tags
            for (const tag of template.tags) {
                byTags[tag] = (byTags[tag] || 0) + 1;
            }
        }
        return {
            total: this.ALL_TEMPLATES.length,
            byCategory,
            byTags,
        };
    }
}
exports.WorkbookTemplateManager = WorkbookTemplateManager;
