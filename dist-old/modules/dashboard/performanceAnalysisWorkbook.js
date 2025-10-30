"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.workbookPerformanceAnalysis = workbookPerformanceAnalysis;
exports.registerPerformanceAnalysisWorkbookHelpers = registerPerformanceAnalysisWorkbookHelpers;
const Handlebars = __importStar(require("handlebars"));
/**
 * Generate performance analysis workbook with detailed metrics and anomaly detection
 */
function workbookPerformanceAnalysis(options) {
    if (!options.name)
        throw new Error("name is required for workbook:performanceAnalysis");
    if (!options.location)
        throw new Error("location is required for workbook:performanceAnalysis");
    if (!options.resourceGroup)
        throw new Error("resourceGroup is required for workbook:performanceAnalysis");
    if (!options.workspaceResourceId)
        throw new Error("workspaceResourceId is required for workbook:performanceAnalysis");
    const showCpuAnalysis = options.showCpuAnalysis !== false;
    const showMemoryAnalysis = options.showMemoryAnalysis !== false;
    const showDiskAnalysis = options.showDiskAnalysis !== false;
    const showNetworkAnalysis = options.showNetworkAnalysis !== false;
    const showAnomalies = options.showAnomalies !== false;
    const items = [];
    items.push({
        type: 1,
        content: {
            json: "## Performance Analysis Workbook\n\nComprehensive performance analysis with CPU, memory, disk, and network metrics. Includes anomaly detection and trend analysis.",
        },
    });
    // Time range parameter
    items.push({
        type: 9,
        content: {
            version: "KqlParameterItem/1.0",
            name: "TimeRange",
            label: "Time Range",
            type: 4, // Time range picker
            isRequired: true,
            value: { durationMs: 3600000 }, // 1 hour
            typeSettings: {
                selectableValues: [
                    { durationMs: 300000, displayName: "5 minutes" },
                    { durationMs: 900000, displayName: "15 minutes" },
                    { durationMs: 3600000, displayName: "1 hour" },
                    { durationMs: 14400000, displayName: "4 hours" },
                    { durationMs: 86400000, displayName: "24 hours" },
                    { durationMs: 604800000, displayName: "7 days" },
                ],
                allowCustom: true,
            },
        },
    });
    if (showCpuAnalysis) {
        items.push({
            type: 1,
            content: { json: "### CPU Analysis" },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Processor' and CounterName == '% Processor Time'\n| where TimeGenerated {TimeRange}\n| summarize avg(CounterValue), max(CounterValue), percentile(CounterValue, 95) by Computer, bin(TimeGenerated, 5m)\n| render timechart`,
                size: 0,
                title: "CPU Usage Over Time",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "timechart",
            },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Processor' and CounterName == '% Processor Time'\n| where TimeGenerated {TimeRange}\n| summarize AvgCPU=avg(CounterValue), MaxCPU=max(CounterValue), P95=percentile(CounterValue, 95) by Computer\n| order by AvgCPU desc`,
                size: 0,
                title: "CPU Statistics by Server",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "table",
            },
        });
    }
    if (showMemoryAnalysis) {
        items.push({
            type: 1,
            content: { json: "### Memory Analysis" },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Memory' and CounterName == 'Available MBytes'\n| where TimeGenerated {TimeRange}\n| summarize avg(CounterValue), min(CounterValue) by Computer, bin(TimeGenerated, 5m)\n| render timechart`,
                size: 0,
                title: "Available Memory Over Time",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "timechart",
            },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Memory'\n| where CounterName in ('Available MBytes', '% Committed Bytes In Use')\n| where TimeGenerated {TimeRange}\n| summarize avg(CounterValue) by Computer, CounterName\n| evaluate pivot(CounterName)`,
                size: 0,
                title: "Memory Metrics by Server",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "table",
            },
        });
    }
    if (showDiskAnalysis) {
        items.push({
            type: 1,
            content: { json: "### Disk Analysis" },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'LogicalDisk' and CounterName in ('Disk Reads/sec', 'Disk Writes/sec')\n| where TimeGenerated {TimeRange}\n| summarize sum(CounterValue) by CounterName, Computer, bin(TimeGenerated, 5m)\n| render timechart`,
                size: 0,
                title: "Disk I/O Operations",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "timechart",
            },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'LogicalDisk' and CounterName == '% Free Space'\n| where TimeGenerated {TimeRange}\n| summarize AvgFreeSpace=avg(CounterValue), MinFreeSpace=min(CounterValue) by Computer, InstanceName\n| where MinFreeSpace < 20\n| order by MinFreeSpace asc`,
                size: 0,
                title: "Low Disk Space Warnings",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "table",
            },
        });
    }
    if (showNetworkAnalysis) {
        items.push({
            type: 1,
            content: { json: "### Network Analysis" },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Network Adapter' and CounterName in ('Bytes Received/sec', 'Bytes Sent/sec')\n| where TimeGenerated {TimeRange}\n| summarize sum(CounterValue) by CounterName, Computer, bin(TimeGenerated, 5m)\n| render timechart`,
                size: 0,
                title: "Network Throughput",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "timechart",
            },
        });
    }
    if (showAnomalies) {
        items.push({
            type: 1,
            content: { json: "### Anomaly Detection" },
        });
        items.push({
            type: 3,
            content: {
                version: "KqlItem/1.0",
                query: `Perf\n| where ObjectName == 'Processor' and CounterName == '% Processor Time'\n| where TimeGenerated {TimeRange}\n| make-series avg(CounterValue) default=0 on TimeGenerated from ago(7d) to now() step 5m by Computer\n| extend anomalies = series_decompose_anomalies(avg_CounterValue, 1.5)\n| mv-expand TimeGenerated, avg_CounterValue, anomalies\n| where anomalies != 0\n| project Computer, TimeGenerated=todatetime(TimeGenerated), CPUUsage=todouble(avg_CounterValue), AnomalyScore=toint(anomalies)`,
                size: 0,
                title: "CPU Anomalies (Last 7 Days)",
                queryType: 0,
                resourceType: "microsoft.operationalinsights/workspaces",
                crossComponentResources: [options.workspaceResourceId],
                visualization: "table",
            },
        });
    }
    const workbook = {
        type: "Microsoft.Insights/workbooks",
        apiVersion: "2022-04-01",
        name: options.name,
        location: options.location,
        tags: options.tags || {},
        kind: "shared",
        properties: {
            displayName: "Performance Analysis Workbook",
            serializedData: JSON.stringify({
                version: "Notebook/1.0",
                items,
                styleSettings: {},
                $schema: "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json",
            }),
            category: "workbook",
            sourceId: options.workspaceResourceId,
        },
    };
    return JSON.stringify(workbook, null, 2);
}
function registerPerformanceAnalysisWorkbookHelpers() {
    Handlebars.registerHelper("workbook:performanceAnalysis", function (options) {
        const opts = options?.hash ||
            options;
        return new Handlebars.SafeString(workbookPerformanceAnalysis.call(this, opts));
    });
}
