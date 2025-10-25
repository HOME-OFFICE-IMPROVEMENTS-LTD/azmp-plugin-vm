/**
 * Advanced Azure Monitor Workbook Templates
 * 
 * Integrates performance metrics, cost analysis, and scaling patterns
 * for comprehensive VM observability and operational insights.
 */

// Advanced workbook template definitions
export interface AdvancedWorkbookTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vm-monitoring' | 'cost-optimization' | 'scaling-analytics' | 'advanced-monitoring';
  tags: string[];
  version: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  estimatedSetupTime: string;
  prerequisites: string[];
  template: WorkbookDefinition;
}

// Comprehensive workbook structure
export interface WorkbookDefinition {
  version: string;
  parameters: WorkbookParameter[];
  variables: WorkbookVariable[];
  resources: WorkbookResource[];
  items: WorkbookItem[];
  metadata: {
    templateId: string;
    integrations: string[];
    dataRetention: string;
    refreshInterval: string;
    costEstimate: string;
  };
}

// Enhanced workbook parameters
export interface WorkbookParameter {
  name: string;
  type: 'subscription' | 'resourceGroup' | 'resource' | 'text' | 'dropdown' | 'timeRange' | 'multiSelect';
  label: string;
  description: string;
  defaultValue?: any;
  required: boolean;
  multiSelect?: boolean;
  query?: string;
  datasource?: WorkbookDatasource;
  dependsOn?: string[];
  validation?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  options?: Array<{
    label: string;
    value: string;
  }>;
}

// Advanced datasource configurations
export interface WorkbookDatasource {
  type: 'Azure Resource Graph' | 'Azure Monitor Logs' | 'Azure Monitor Metrics' | 'Azure Cost Management';
  resourceType?: string;
  namespace?: string;
  resourceUri?: string;
  workspace?: string;
  subscription?: string;
  timespan?: string;
}

// Enhanced workbook items with performance integration
export interface WorkbookItem {
  type: 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // Numeric types matching Azure Workbook schema
  content: any;
  conditionalVisibility?: {
    parameterName: string;
    comparison: string;
    value: any;
  };
  customWidth?: string;
  name?: string;
  styleSettings?: any;
  queryType?: number;
  resourceType?: string;
  datasource?: WorkbookDatasource;
  visualization?: 'table' | 'chart' | 'grid' | 'map' | 'tiles' | 'graph';
  chartSettings?: {
    type: 'line' | 'area' | 'bar' | 'scatter' | 'pie' | 'heatmap';
    yAxis?: string[];
    xAxis?: string;
    series?: any[];
    legend?: 'top' | 'bottom' | 'left' | 'right' | 'hidden';
    annotations?: any[];
  };
  gridSettings?: {
    filter: boolean;
    sort: boolean;
    formatters: any[];
  };
}

export interface WorkbookVariable {
  name: string;
  type: 3 | 'static' | 'parameter';
  value: any;
  datasource?: WorkbookDatasource;
}

export interface WorkbookResource {
  type: string;
  name: string;
  properties: any;
}

/**
 * Advanced Workbook Template Generator
 * Combines performance, cost, and scaling analytics
 */
export class AdvancedWorkbookGenerator {

  /**
   * Generate comprehensive VM performance workbook
   * Integrates performance metrics, cost analysis, and scaling insights
   */
  static generateVmPerformanceWorkbook(options: {
    subscriptionId?: string;
    resourceGroupName?: string;
    vmName?: string;
    location?: string;
    includePerformanceAnalysis?: boolean;
    includeCostAnalysis?: boolean;
    includeScalingAnalytics?: boolean;
    timeRange?: string;
  } = {}): WorkbookDefinition {
    
    const items: WorkbookItem[] = [];
    
    // Header and introduction
    items.push(this.createHeaderItem('VM Performance & Cost Analytics', 
      'Comprehensive analysis of virtual machine performance, cost optimization opportunities, and scaling patterns'));
    
    // Parameters section
    items.push(this.createParametersItem());
    
    // VM Overview section
    items.push(this.createVmOverviewSection());
    
    // Performance Analysis section
    if (options.includePerformanceAnalysis !== false) {
      items.push(...this.createPerformanceAnalysisSection());
    }
    
    // Cost Analysis section
    if (options.includeCostAnalysis !== false) {
      items.push(...this.createCostAnalysisSection());
    }
    
    // Scaling Analytics section
    if (options.includeScalingAnalytics !== false) {
      items.push(...this.createScalingAnalyticsSection());
    }
    
    // Recommendations section
    items.push(...this.createRecommendationsSection());
    
    // Alerts and Actions section
    items.push(...this.createAlertsSection());
    
    return {
      version: 'Notebook/1.0',
      parameters: this.getStandardParameters(),
      variables: this.getStandardVariables(),
      resources: [],
      items,
      metadata: {
        templateId: 'vm-performance-analytics',
        integrations: ['Azure Monitor', 'Cost Management', 'Performance Insights'],
        dataRetention: '90 days',
        refreshInterval: '5 minutes',
        costEstimate: 'Low - uses standard Azure Monitor logs'
      }
    };
  }

  /**
   * Generate VMSS scaling analytics workbook
   * Focuses on autoscale performance and cost optimization
   */
  static generateVmssScalingWorkbook(options: {
    vmssResourceId?: string;
    includeLoadPatterns?: boolean;
    includePredictiveAnalysis?: boolean;
    includeCostProjections?: boolean;
  } = {}): WorkbookDefinition {
    
    const items: WorkbookItem[] = [];
    
    // Header
    items.push(this.createHeaderItem('VMSS Scaling Analytics', 
      'Advanced autoscaling analysis with load patterns, predictive insights, and cost optimization'));
    
    // Parameters
    items.push(this.createParametersItem('vmss'));
    
    // VMSS Overview
    items.push(this.createVmssOverviewSection());
    
    // Load Pattern Analysis
    if (options.includeLoadPatterns !== false) {
      items.push(...this.createLoadPatternSection());
    }
    
    // Autoscale Performance
    items.push(...this.createAutoscalePerformanceSection());
    
    // Predictive Analysis
    if (options.includePredictiveAnalysis !== false) {
      items.push(...this.createPredictiveAnalysisSection());
    }
    
    // Cost Analysis
    if (options.includeCostProjections !== false) {
      items.push(...this.createScalingCostSection());
    }
    
    // Optimization Recommendations
    items.push(...this.createScalingOptimizationSection());
    
    return {
      version: 'Notebook/1.0',
      parameters: this.getVmssParameters(),
      variables: this.getVmssVariables(),
      resources: [],
      items,
      metadata: {
        templateId: 'vmss-scaling-analytics',
        integrations: ['Azure Monitor', 'Autoscale', 'Cost Management', 'Performance Analytics'],
        dataRetention: '180 days',
        refreshInterval: '1 minute',
        costEstimate: 'Medium - includes detailed metrics analysis'
      }
    };
  }

  /**
   * Generate cost optimization workbook
   * Integrates performance insights with cost recommendations
   */
  static generateCostOptimizationWorkbook(options: {
    scope?: 'subscription' | 'resourceGroup' | 'resource';
    includeRightsizing?: boolean;
    includeReservedInstances?: boolean;
    includeSpotRecommendations?: boolean;
  } = {}): WorkbookDefinition {
    
    const items: WorkbookItem[] = [];
    
    // Header
    items.push(this.createHeaderItem('VM Cost Optimization', 
      'Comprehensive cost analysis with performance-aware recommendations'));
    
    // Parameters
    items.push(this.createParametersItem('cost'));
    
    // Cost Overview
    items.push(...this.createCostOverviewSection());
    
    // Right-sizing Analysis
    if (options.includeRightsizing !== false) {
      items.push(...this.createRightsizingSection());
    }
    
    // Reserved Instance Analysis
    if (options.includeReservedInstances !== false) {
      items.push(...this.createReservedInstanceSection());
    }
    
    // Spot Instance Opportunities
    if (options.includeSpotRecommendations !== false) {
      items.push(...this.createSpotInstanceSection());
    }
    
    // Performance Impact Analysis
    items.push(...this.createPerformanceImpactSection());
    
    // Action Items
    items.push(...this.createCostActionItemsSection());
    
    return {
      version: 'Notebook/1.0',
      parameters: this.getCostParameters(),
      variables: this.getCostVariables(),
      resources: [],
      items,
      metadata: {
        templateId: 'vm-cost-optimization',
        integrations: ['Cost Management', 'Azure Advisor', 'Performance Analytics'],
        dataRetention: '365 days',
        refreshInterval: '1 hour',
        costEstimate: 'Low - primarily uses Cost Management API'
      }
    };
  }

  // Helper methods for creating workbook sections

  private static createHeaderItem(title: string, description: string): WorkbookItem {
    return {
      type: 1, // text
      content: {
        json: `# ${title}\n\n${description}\n\n---`
      }
    };
  }

  private static createParametersItem(type: string = 'vm'): WorkbookItem {
    return {
      type: 9, // parameters
      content: {
        parameters: type === 'vmss' ? this.getVmssParameters() : 
                   type === 'cost' ? this.getCostParameters() : 
                   this.getStandardParameters()
      }
    };
  }

  private static createVmOverviewSection(): WorkbookItem {
    return {
      type: 3,
      content: {
        query: `
// VM Overview with Performance Context
let vm = Heartbeat
| where Computer == "{VirtualMachine}"
| where TimeGenerated >= ago({TimeRange})
| summarize 
    LastHeartbeat = max(TimeGenerated),
    TotalHeartbeats = count()
by Computer, ComputerIP, OSType, OSMajorVersion;

let perf = Perf
| where Computer == "{VirtualMachine}"
| where TimeGenerated >= ago({TimeRange})
| where (CounterName == "% Processor Time" and InstanceName == "_Total") or
        (CounterName == "Available MBytes") or
        (CounterName == "Disk Reads/sec") or
        (CounterName == "Disk Writes/sec")
| summarize 
    AvgCpuPercent = avg(iif(CounterName == "% Processor Time", CounterValue, double(null))),
    AvgMemoryMB = avg(iif(CounterName == "Available MBytes", CounterValue, double(null))),
    AvgDiskReads = avg(iif(CounterName == "Disk Reads/sec", CounterValue, double(null))),
    AvgDiskWrites = avg(iif(CounterName == "Disk Writes/sec", CounterValue, double(null)))
by Computer;

vm
| join kind=leftouter (perf) on Computer
| project 
    Computer,
    ComputerIP,
    OSType,
    OSVersion = OSMajorVersion,
    LastSeen = format_datetime(LastHeartbeat, "yyyy-MM-dd HH:mm"),
    Status = iif(LastHeartbeat >= ago(10m), "🟢 Online", "🔴 Offline"),
    AvgCpuPercent = round(AvgCpuPercent, 1),
    AvgMemoryMB = round(AvgMemoryMB, 0),
    AvgDiskReads = round(AvgDiskReads, 2),
    AvgDiskWrites = round(AvgDiskWrites, 2),
    HealthScore = case(
        AvgCpuPercent < 20 and AvgMemoryMB > 1000, "🟢 Excellent",
        AvgCpuPercent < 50 and AvgMemoryMB > 500, "🟡 Good", 
        AvgCpuPercent < 80, "🟠 Warning",
        "🔴 Critical"
    )
        `,
        size: 0,
        timeContext: {
          durationMs: 86400000
        },
        queryType: 0,
        resourceType: 'microsoft.operationalinsights/workspaces'
      },
      name: 'VM Overview',
      styleSettings: {
        showBorder: true
      }
    };
  }

  private static createPerformanceAnalysisSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 📊 Performance Analysis\n\nDetailed performance metrics with bottleneck identification and optimization opportunities.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Performance Metrics with Bottleneck Analysis
Perf
| where Computer == "{VirtualMachine}"
| where TimeGenerated >= ago({TimeRange})
| where (CounterName == "% Processor Time" and InstanceName == "_Total") or
        (CounterName == "Available MBytes") or
        (CounterName == "Avg. Disk sec/Read") or
        (CounterName == "Avg. Disk sec/Write") or
        (CounterName == "Bytes Received/sec") or
        (CounterName == "Bytes Sent/sec")
| summarize 
    Value = avg(CounterValue)
by bin(TimeGenerated, 5m), CounterName
| extend 
    MetricType = case(
        CounterName == "% Processor Time", "CPU",
        CounterName == "Available MBytes", "Memory", 
        CounterName contains "Disk", "Disk",
        CounterName contains "Bytes", "Network",
        "Other"
    ),
    Threshold = case(
        CounterName == "% Processor Time", 80.0,
        CounterName == "Available MBytes", 500.0,
        CounterName contains "Disk sec", 0.1,
        1000.0
    ),
    Status = case(
        CounterName == "% Processor Time" and Value > 80, "🔴 High CPU",
        CounterName == "Available MBytes" and Value < 500, "🔴 Low Memory",
        CounterName contains "Disk sec" and Value > 0.1, "🔴 Slow Disk",
        "🟢 Normal"
    )
| project TimeGenerated, MetricType, CounterName, Value, Status
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'chart'
        },
        name: 'Performance Trends',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createCostAnalysisSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 💰 Cost Analysis\n\nPerformance-aware cost optimization with right-sizing recommendations.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Cost Analysis with Performance Context
let costs = AzureActivity
| where ActivityStatus == "Succeeded"
| where ResourceGroup == "{ResourceGroup}"
| summarize Operations = count() by bin(TimeGenerated, 1d), Resource
| extend EstimatedDailyCost = Operations * 0.01; // Simplified cost calculation

let performance = Perf
| where Computer == "{VirtualMachine}"
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize AvgCpu = avg(CounterValue) by bin(TimeGenerated, 1d)
| extend 
    UtilizationCategory = case(
        AvgCpu < 20, "📉 Under-utilized",
        AvgCpu < 50, "📊 Well-utilized",
        AvgCpu < 80, "📈 High-utilized", 
        "🔥 Over-utilized"
    ),
    RightsizingOpportunity = case(
        AvgCpu < 20, "Consider smaller VM size",
        AvgCpu > 80, "Consider larger VM size",
        "Current size appropriate"
    );

performance
| project 
    Date = format_datetime(TimeGenerated, "MM-dd"),
    AvgCpuPercent = round(AvgCpu, 1),
    UtilizationCategory,
    RightsizingOpportunity
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces'
        },
        name: 'Cost vs Performance',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createScalingAnalyticsSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🚀 Scaling Analytics\n\nAutoscale performance and load pattern analysis.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Scaling Events and Load Patterns
let scaling = AzureActivity
| where OperationName contains "Scale"
| where ResourceGroup == "{ResourceGroup}"
| summarize ScaleEvents = count() by bin(TimeGenerated, 1h), OperationName
| extend ScaleDirection = iif(OperationName contains "Up" or OperationName contains "Out", "Scale Out", "Scale In");

let load = Perf
| where Computer == "{VirtualMachine}"
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize 
    AvgLoad = avg(CounterValue),
    PeakLoad = max(CounterValue),
    LoadVariability = stdev(CounterValue)
by bin(TimeGenerated, 1h)
| extend 
    LoadPattern = case(
        LoadVariability < 10, "🟢 Steady",
        LoadVariability < 25, "🟡 Moderate", 
        "🔴 Highly Variable"
    ),
    ScaleRecommendation = case(
        AvgLoad > 70 and LoadVariability > 20, "Enable aggressive autoscale",
        AvgLoad < 30 and LoadVariability < 15, "Enable cost-optimized scaling",
        "Current scaling appropriate"
    );

load
| project 
    Hour = format_datetime(TimeGenerated, "MM-dd HH:mm"),
    AvgLoad = round(AvgLoad, 1),
    PeakLoad = round(PeakLoad, 1),
    LoadPattern,
    ScaleRecommendation
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces'
        },
        name: 'Scaling Patterns',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createRecommendationsSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🎯 Optimization Recommendations\n\nActionable insights based on performance, cost, and scaling analysis.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Integrated Recommendations
let recommendations = datatable(
    Category: string, 
    Priority: string, 
    Recommendation: string, 
    Impact: string,
    Effort: string
) [
    "Performance", "High", "Upgrade to Premium SSD for better IOPS", "Improved response times", "Low",
    "Cost", "Medium", "Right-size to Standard_D2s_v3 based on utilization", "20-30% cost reduction", "Medium", 
    "Scaling", "High", "Enable predictive autoscale for load patterns", "Better availability", "Medium",
    "Monitoring", "Low", "Set up disk space alerts", "Proactive issue detection", "Low"
];

recommendations
| extend 
    PriorityIcon = case(
        Priority == "High", "🔴",
        Priority == "Medium", "🟡", 
        "🟢"
    ),
    CategoryIcon = case(
        Category == "Performance", "⚡",
        Category == "Cost", "💰",
        Category == "Scaling", "🚀",
        "📊"
    )
| project 
    Priority = strcat(PriorityIcon, " ", Priority),
    Category = strcat(CategoryIcon, " ", Category),
    Recommendation,
    ExpectedImpact = Impact,
    ImplementationEffort = Effort
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces'
        },
        name: 'Recommendations',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createAlertsSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🚨 Recommended Alerts\n\nProactive monitoring alerts based on current performance patterns.'
        }
      },
      {
        type: 1,
        content: {
          json: `
### Suggested Alert Rules:

1. **High CPU Alert** - Trigger when CPU > 80% for 10 minutes
2. **Low Memory Alert** - Trigger when available memory < 500 MB
3. **Disk Performance Alert** - Trigger when disk latency > 100ms
4. **Cost Anomaly Alert** - Trigger on 20% cost increase
5. **Scaling Failure Alert** - Trigger on autoscale failures

Use the CLI commands to deploy these alerts:
\`\`\`bash
azmp vm mon-alert-cpu --threshold 80 --duration 10m
azmp vm mon-alert-memory --threshold 500 --unit MB
azmp vm mon-alert-cost --threshold 20 --unit percent
\`\`\`
          `
        }
      }
    ];
  }

  // VMSS-specific sections
  private static createVmssOverviewSection(): WorkbookItem {
    return {
      type: 3,
      content: {
        query: `
// VMSS Overview with Scaling Context
AzureMetrics
| where ResourceId contains "{VmssResourceId}"
| where MetricName in ("Percentage CPU", "Network In Total", "Network Out Total")
| where TimeGenerated >= ago({TimeRange})
| summarize 
    AvgValue = avg(Average),
    MaxValue = max(Maximum)
by MetricName, bin(TimeGenerated, 5m)
| extend 
    Status = case(
        MetricName == "Percentage CPU" and AvgValue > 80, "🔴 High Load",
        MetricName == "Percentage CPU" and AvgValue < 20, "🟢 Low Load",
        "🟡 Normal"
    )
| project TimeGenerated, MetricName, AvgValue = round(AvgValue, 1), Status
        `,
        size: 0,
        queryType: 0,
        resourceType: 'microsoft.insights/components'
      },
      name: 'VMSS Overview'
    };
  }

  private static createLoadPatternSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 📈 Load Pattern Analysis\n\nDetailed analysis of load patterns for autoscale optimization.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Hourly Load Distribution with Pattern Classification
let cpuLoad = Perf
| where _ResourceId has "{VmssResourceId}"
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize 
    AvgLoad = avg(CounterValue),
    PeakLoad = max(CounterValue),
    MinLoad = min(CounterValue),
    LoadVariance = variance(CounterValue),
    DataPoints = count()
  by bin(TimeGenerated, 1h);

cpuLoad
| extend 
    LoadPattern = case(
        LoadVariance < 25 and AvgLoad < 40, "🟢 Stable",
        LoadVariance < 60, "🟡 Variable",
        "🔴 Unpredictable"
    ),
    ScalingAdvice = case(
        LoadPattern == "🟢 Stable" and AvgLoad < 35, "Enable cost-optimized scaling window",
        LoadPattern == "🔴 Unpredictable" or PeakLoad > 80, "Enable aggressive scaling rules",
        "Maintain current scaling configuration"
    )
| project 
    Hour = format_datetime(TimeGenerated, "yyyy-MM-dd HH:mm"),
    AvgLoad = round(AvgLoad, 1),
    PeakLoad = round(PeakLoad, 1),
    MinLoad = round(MinLoad, 1),
    LoadPattern,
    ScalingAdvice
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Load Pattern Classification',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createAutoscalePerformanceSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## ⚙️ Autoscale Performance\n\nScaling events, performance impact, and optimization opportunities.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Autoscale Events with Performance Context
let scaleEvents = AzureActivity
| where ResourceId == "{VmssResourceId}"
| where CategoryValue == "Autoscale"
| project EventTime = TimeGenerated, OperationName, ResultType, ResultDescription;

let performanceWindow = Perf
| where _ResourceId has "{VmssResourceId}"
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize AvgCpu = avg(CounterValue), PeakCpu = max(CounterValue) by bin(TimeGenerated, 5m);

scaleEvents
| join kind=leftouter (
    performanceWindow 
    | summarize 
        AvgCpuPost = avg(AvgCpu), 
        PeakCpuPost = max(PeakCpu) 
    by bin(TimeGenerated, 30m)
) on $left.EventTime <= $right.TimeGenerated and $left.EventTime >= $right.TimeGenerated - 30m
| extend 
    EventResult = case(
        isnull(ResultType), "Unknown",
        ResultType == "Success", "🟢 Success",
        ResultType == "Failed", "🔴 Failed",
        "🟡 Warning"
    ),
    PostScaleCpu = coalesce(AvgCpuPost, 0.0)
| project 
    EventTime = format_datetime(EventTime, "yyyy-MM-dd HH:mm"),
    OperationName,
    EventResult,
    ResultDescription,
    AvgCpu30m = round(PostScaleCpu, 1),
    PeakCpu30m = round(PeakCpuPost, 1)
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Autoscale Event Impact',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createPredictiveAnalysisSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🔮 Predictive Analysis\n\nForecasting and predictive scaling recommendations.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// CPU Forecast Using Seasonal Decomposition
let cpuSeries = Perf
| where _ResourceId has "{VmssResourceId}"
| where TimeGenerated between (ago({TimeRange}) .. now())
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize AvgCpu = avg(CounterValue) by bin(TimeGenerated, 15m);

cpuSeries
| make-series AvgCpu = avg(AvgCpu) on TimeGenerated in range(ago(3d), now(), 30m)
| extend 
    Forecast = series_decompose_forecast(AvgCpu, 16),
    Anomalies = series_decompose_anomalies(AvgCpu, 2.5, -1, 'linefit')
| mv-expand TimeGenerated to typeof(datetime), AvgCpu to typeof(double), Forecast to typeof(double), Anomalies to typeof(double)
| extend 
    ForecastLabel = case(TimeGenerated > now(), "🔮 Forecast", "Observed"),
    AnomalyIndicator = case(Anomalies > 0, "🔴 Potential Spike", "🟢 Normal")
| project 
    TimeGenerated,
    CpuValue = round(AvgCpu, 1),
    ForecastValue = round(Forecast, 1),
    ForecastLabel,
    AnomalyIndicator
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'chart'
        },
        name: 'CPU Forecast',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createScalingCostSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 💸 Scaling Cost Analysis\n\nCost impact of scaling decisions and optimization opportunities.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Estimated Cost Impact of Scaling Events
let vmCost = Usage
| where ResourceId == "{VmssResourceId}"
| where TimeGenerated >= ago({TimeRange})
| summarize TotalCost = sum(PreTaxCost) by bin(TimeGenerated, 1d);

let scaleEvents = AzureActivity
| where ResourceId == "{VmssResourceId}"
| where CategoryValue == "Autoscale"
| summarize ScaleCount = count() by bin(TimeGenerated, 1d);

vmCost
| join kind=leftouter scaleEvents on TimeGenerated
| extend ScaleCount = coalesce(ScaleCount, 0),
         CostPerEvent = case(ScaleCount == 0, 0.0, TotalCost / ScaleCount)
| sort by TimeGenerated asc
| serialize
| project 
    Day = format_datetime(TimeGenerated, "yyyy-MM-dd"),
    TotalCost = round(TotalCost, 2),
    ScaleEvents = ScaleCount,
    CostPerScaleEvent = round(CostPerEvent, 2),
    CostTrend = case(TotalCost > prev(TotalCost), "🔺 Rising", "🔻 Falling")
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Scaling Cost Impact',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createScalingOptimizationSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🎯 Scaling Optimization\n\nRecommendations for improving autoscale efficiency and cost-effectiveness.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Autoscale Optimization Opportunities
let loadSummary = Perf
| where _ResourceId has "{VmssResourceId}"
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize 
    AvgCpu = avg(CounterValue),
    PeakCpu = max(CounterValue),
    P95Cpu = percentiles(CounterValue, 95),
    Samples = count()
  by bin(TimeGenerated, 1h);

loadSummary
| summarize 
    AvgCpu = avg(AvgCpu),
    PeakCpu = max(PeakCpu),
    P95Cpu = avg(P95Cpu_95),
    HoursOver75 = countif(AvgCpu > 75)
| extend 
    Recommendation = case(
        HoursOver75 > 4, "Increase max instance count or enable predictive scaling",
        AvgCpu < 35, "Decrease min instance count during off-peak hours",
        P95Cpu > 85, "Add faster scale-out rule at 70% CPU",
        "Maintain current scaling configuration"
    ),
    Priority = case(
        HoursOver75 > 4 or P95Cpu > 85, "High",
        AvgCpu < 35, "Medium",
        "Low"
    )
| project 
    Priority = strcat(
        case(Priority == "High", "🔴", Priority == "Medium", "🟡", "🟢"),
        " ",
        Priority
    ),
    Recommendation,
    SupportingMetric = strcat("Average CPU: ", round(AvgCpu, 1), "%, Peak: ", round(PeakCpu, 1), "%, Hours > 75%: ", HoursOver75)
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Scaling Optimization Recommendations',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  // Cost-specific sections
  private static createCostOverviewSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 💰 Cost Overview\n\nComprehensive cost analysis with performance correlation.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Daily Cost with Performance Overlay
let scopeType = '{Scope}';
let subscriptionId = '{SubscriptionId}';
let resourceGroupName = '{CostResourceGroup}';
let resourceId = '{CostResourceId}';

let filteredUsage = Usage
| where TimeGenerated >= ago({TimeRange})
| where case(
    scopeType == "subscription" and subscriptionId != "", SubscriptionId == subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", ResourceGroup == resourceGroupName,
    scopeType == "resource" and resourceId != "", ResourceId == resourceId,
    true
  );

let cost = filteredUsage
| summarize TotalCost = sum(PreTaxCost) by bin(TimeGenerated, 1d);

let performance = Perf
| where TimeGenerated >= ago({TimeRange})
| where case(
    scopeType == "subscription" and subscriptionId != "", _ResourceId has subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", _ResourceId has resourceGroupName,
    scopeType == "resource" and resourceId != "", _ResourceId == resourceId,
    true
  )
| summarize AvgCpu = avg(CounterValue) by bin(TimeGenerated, 1d), Computer
| summarize AvgCpu = avg(AvgCpu) by TimeGenerated;

cost
| join kind=leftouter performance on TimeGenerated
| sort by TimeGenerated asc
| serialize
| extend CostTrend = case(TotalCost > prev(TotalCost), "🔺 Increasing", "🔻 Decreasing")
| project 
    Day = format_datetime(TimeGenerated, "yyyy-MM-dd"),
    TotalCost = round(TotalCost, 2),
    AvgCpu = round(AvgCpu, 1),
    CostTrend
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Cost Overview',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createRightsizingSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 📏 Right-sizing Analysis\n\nPerformance-based VM size recommendations.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Rightsizing Opportunities Based on Utilization
let scopeType = '{Scope}';
let subscriptionId = '{SubscriptionId}';
let resourceGroupName = '{CostResourceGroup}';
let resourceId = '{CostResourceId}';

let cpu = Perf
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| where case(
    scopeType == "subscription" and subscriptionId != "", _ResourceId has subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", _ResourceId has resourceGroupName,
    scopeType == "resource" and resourceId != "", _ResourceId == resourceId,
    true
  )
| summarize AvgCpu = avg(CounterValue), PeakCpu = max(CounterValue) by Computer;

let memory = Perf
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "Available MBytes"
| where case(
    scopeType == "subscription" and subscriptionId != "", _ResourceId has subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", _ResourceId has resourceGroupName,
    scopeType == "resource" and resourceId != "", _ResourceId == resourceId,
    true
  )
| summarize AvgAvailable = avg(CounterValue) by Computer;

cpu
| join kind=leftouter memory on Computer
| extend 
    Recommendation = case(
        AvgCpu < 25 and AvgAvailable > 1024, "Downsize VM (low CPU and high memory headroom)",
        AvgCpu > 80, "Upsize VM (consistently high CPU)",
        AvgAvailable < 256, "Add memory or move to memory optimized SKU",
        "Current size appropriate"
    ),
    EstimatedSavings = case(
        Recommendation startswith "Downsize", "$150 - $300 / month",
        Recommendation startswith "Upsize", "Potentially higher ($200 - $400) but improves performance",
        "N/A"
    )
| project 
    Computer,
    AvgCpu = round(AvgCpu, 1),
    PeakCpu = round(PeakCpu, 1),
    AvgAvailableMemoryMB = round(AvgAvailable, 0),
    Recommendation,
    EstimatedSavings
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Rightsizing Recommendations',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createReservedInstanceSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🏦 Reserved Instance Analysis\n\nReservation recommendations based on usage patterns.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Reservation Suitability Analysis
let scopeType = '{Scope}';
let subscriptionId = '{SubscriptionId}';
let resourceGroupName = '{CostResourceGroup}';
let resourceId = '{CostResourceId}';

let hourlyUsage = Usage
| where TimeGenerated >= ago({TimeRange})
| where meterCategory == "Virtual Machines"
| where case(
    scopeType == "subscription" and subscriptionId != "", SubscriptionId == subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", ResourceGroup == resourceGroupName,
    scopeType == "resource" and resourceId != "", ResourceId == resourceId,
    true
  )
| summarize HourlyCost = sum(PreTaxCost) by ResourceId, bin(TimeGenerated, 1h);

hourlyUsage
| summarize 
    AvgHourlyCost = avg(HourlyCost),
    HoursInUse = count(),
    DaysActive = dcount(bin(TimeGenerated, 1d))
  by ResourceId
| extend 
    UtilizationPercent = todouble(HoursInUse) / todouble(DaysActive * 24) * 100.0,
    Recommendation = case(
        UtilizationPercent > 80, "Purchase 3-year Reserved Instance",
        UtilizationPercent > 60, "Purchase 1-year Reserved Instance",
        UtilizationPercent > 40, "Monitor usage for reservation readiness",
        "Keep Pay-As-You-Go"
    ),
    EstimatedSavingsPercent = case(
        UtilizationPercent > 80, 55,
        UtilizationPercent > 60, 40,
        UtilizationPercent > 40, 15,
        0
    )
| project 
    ResourceId,
    UtilizationPercent = round(UtilizationPercent, 1),
    AvgHourlyCost = round(AvgHourlyCost, 2),
    Recommendation,
    EstimatedSavingsPercent
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Reservation Coverage',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createSpotInstanceSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## 🎯 Spot Instance Opportunities\n\nSpot instance suitability analysis.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Spot Instance Suitability
let scopeType = '{Scope}';
let subscriptionId = '{SubscriptionId}';
let resourceGroupName = '{CostResourceGroup}';
let resourceId = '{CostResourceId}';

let vmPerf = Perf
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| where case(
    scopeType == "subscription" and subscriptionId != "", _ResourceId has subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", _ResourceId has resourceGroupName,
    scopeType == "resource" and resourceId != "", _ResourceId == resourceId,
    true
  )
| summarize AvgCpu = avg(CounterValue), Peaks = max(CounterValue) by Computer;

let activity = AzureActivity
| where TimeGenerated >= ago({TimeRange})
| where OperationName contains "Delete" or OperationName contains "Evict"
| where case(
    scopeType == "subscription" and subscriptionId != "", SubscriptionId == subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", ResourceGroup == resourceGroupName,
    scopeType == "resource" and resourceId != "", ResourceId == resourceId,
    true
  )
| summarize Evictions = count() by ResourceGroup;

vmPerf
| join kind=leftouter activity on $left.Computer startswith $right.ResourceGroup
| extend 
    SpotSuitability = case(
        AvgCpu < 40 and Peaks < 70, "✅ Suitable",
        AvgCpu < 60, "⚠️ Requires resiliency validation",
        "❌ Not recommended"
    ),
    RecommendedAction = case(
        SpotSuitability == "✅ Suitable", "Evaluate Spot VM deployment with eviction policies",
        SpotSuitability == "⚠️ Requires resiliency validation", "Review workload fault tolerance before using Spot",
        "Use standard VM instances"
    ),
    RecentEvictions = coalesce(Evictions, 0)
| project 
    Computer,
    AvgCpu = round(AvgCpu, 1),
    PeakCpu = round(Peaks, 1),
    RecentEvictions,
    SpotSuitability,
    RecommendedAction
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Spot Suitability',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createPerformanceImpactSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## ⚡ Performance Impact Analysis\n\nPerformance implications of cost optimization recommendations.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Performance vs Cost Impact Matrix
let scopeType = '{Scope}';
let subscriptionId = '{SubscriptionId}';
let resourceGroupName = '{CostResourceGroup}';
let resourceId = '{CostResourceId}';

let cost = Usage
| where TimeGenerated >= ago({TimeRange})
| where case(
    scopeType == "subscription" and subscriptionId != "", SubscriptionId == subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", ResourceGroup == resourceGroupName,
    scopeType == "resource" and resourceId != "", ResourceId == resourceId,
    true
  )
| summarize TotalCost = sum(PreTaxCost) by ResourceId;

let perf = Perf
| where TimeGenerated >= ago({TimeRange})
| where CounterName == "% Processor Time" and InstanceName == "_Total"
| where case(
    scopeType == "subscription" and subscriptionId != "", _ResourceId has subscriptionId,
    scopeType == "resourceGroup" and resourceGroupName != "", _ResourceId has resourceGroupName,
    scopeType == "resource" and resourceId != "", _ResourceId == resourceId,
    true
  )
| summarize AvgCpu = avg(CounterValue), PeakCpu = max(CounterValue) by _ResourceId;

cost
| join kind=leftouter perf on $left.ResourceId == $right._ResourceId
| extend 
    PerformanceRisk = case(
        AvgCpu > 85, "High",
        AvgCpu > 65, "Medium",
        "Low"
    ),
    CostBand = case(
        TotalCost > 1000, "High Cost",
        TotalCost > 500, "Medium Cost",
        "Low Cost"
    ),
    RecommendedStrategy = case(
        PerformanceRisk == "High", "Prioritize performance improvements before cost reductions",
        CostBand == "High Cost" and PerformanceRisk == "Low", "Immediate cost optimization opportunity",
        "Maintain current configuration"
    )
| project 
    ResourceId,
    TotalCost = round(TotalCost, 2),
    AvgCpu = round(AvgCpu, 1),
    PeakCpu = round(PeakCpu, 1),
    PerformanceRisk,
    CostBand,
    RecommendedStrategy
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Performance vs Cost Impact',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  private static createCostActionItemsSection(): WorkbookItem[] {
    return [
      {
        type: 1,
        content: {
          json: '## ✅ Action Items\n\nPrioritized cost optimization actions.'
        }
      },
      {
        type: 3,
        content: {
          query: `
// Consolidated Cost Optimization Actions
let rightsizing = datatable(Action: string, Priority: string, Effort: string, Impact: string) [
  "Implement rightsizing plan for low-utilization VMs", "High", "Medium", "Reduce compute spend by 20-30%",
  "Purchase reserved instances for steady workloads", "High", "Medium", "Reduce compute spend by 40-55%",
  "Evaluate Spot instances for dev/test workloads", "Medium", "Low", "Reduce compute spend by up to 70%",
  "Enable budget alerts at 80% and 100% thresholds", "Medium", "Low", "Proactive cost governance",
  "Review storage tiers for cold disks", "Low", "Medium", "Reduce storage spend by 15-25%"
];

rightsizing
| extend PriorityIcon = case(
    Priority == "High", "🔴",
    Priority == "Medium", "🟡",
    "🟢"
  )
| project 
    Priority = strcat(PriorityIcon, " ", Priority),
    Action,
    Effort,
    Impact
          `,
          size: 0,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table'
        },
        name: 'Cost Optimization Actions',
        styleSettings: {
          showBorder: true
        }
      }
    ];
  }

  // Parameter definitions
  private static getStandardParameters(): WorkbookParameter[] {
    return [
      {
        name: 'TimeRange',
        type: 'timeRange',
        label: 'Time Range',
        description: 'Time range for analysis',
        defaultValue: '24h',
        required: true
      },
      {
        name: 'Subscription',
        type: 'subscription',
        label: 'Subscription',
        description: 'Azure subscription',
        required: true
      },
      {
        name: 'ResourceGroup',
        type: 'resourceGroup',
        label: 'Resource Group',
        description: 'Resource group containing the VM',
        required: true,
        dependsOn: ['Subscription']
      },
      {
        name: 'VirtualMachine',
        type: 'resource',
        label: 'Virtual Machine',
        description: 'Target virtual machine',
        required: true,
        dependsOn: ['Subscription', 'ResourceGroup']
      }
    ];
  }

  private static getVmssParameters(): WorkbookParameter[] {
    return [
      {
        name: 'TimeRange',
        type: 'timeRange',
        label: 'Time Range',
        description: 'Time range for analysis',
        defaultValue: '7d',
        required: true
      },
      {
        name: 'VmssResourceId',
        type: 'resource',
        label: 'VMSS Resource',
        description: 'Virtual Machine Scale Set',
        required: true
      }
    ];
  }

  private static getCostParameters(): WorkbookParameter[] {
    return [
      {
        name: 'TimeRange',
        type: 'timeRange',
        label: 'Time Range',
        description: 'Time range for cost analysis',
        defaultValue: '30d',
        required: true
      },
      {
        name: 'Scope',
        type: 'dropdown',
        label: 'Analysis Scope',
        description: 'Scope of cost analysis',
        defaultValue: 'resourceGroup',
        required: true,
        options: [
          { label: 'Subscription', value: 'subscription' },
          { label: 'Resource Group', value: 'resourceGroup' },
          { label: 'Resource', value: 'resource' }
        ]
      },
      {
        name: 'SubscriptionId',
        type: 'subscription',
        label: 'Subscription (optional)',
        description: 'Target subscription for cost analysis',
        required: false
      },
      {
        name: 'CostResourceGroup',
        type: 'resourceGroup',
        label: 'Resource Group (optional)',
        description: 'Resource group to analyze',
        required: false,
        dependsOn: ['SubscriptionId']
      },
      {
        name: 'CostResourceId',
        type: 'resource',
        label: 'Resource (optional)',
        description: 'Specific resource scope (e.g., VM)',
        required: false,
        dependsOn: ['SubscriptionId', 'CostResourceGroup']
      }
    ];
  }

  private static getStandardVariables(): WorkbookVariable[] {
    return [
      {
        name: 'WorkspaceId',
        type: 3,
        value: 'Resources | where type == "microsoft.operationalinsights/workspaces" | project id'
      }
    ];
  }

  private static getVmssVariables(): WorkbookVariable[] {
    return [
      {
        name: 'VmssMetrics',
        type: 3, 
        value: 'AzureMetrics | where ResourceId contains "virtualMachineScaleSets" | distinct MetricName'
      }
    ];
  }

  private static getCostVariables(): WorkbookVariable[] {
    return [
      {
        name: 'CostScope',
        type: 'parameter',
        value: '{Scope}'
      }
    ];
  }
}

/**
 * Advanced workbook template registry
 */
export const advancedWorkbookTemplates: AdvancedWorkbookTemplate[] = [
  {
    id: 'vm-performance-analytics',
    name: 'VM Performance Analytics',
    description: 'Comprehensive VM performance analysis with cost insights and optimization recommendations',
    category: 'advanced-monitoring',
    tags: ['performance', 'cost', 'optimization', 'monitoring'],
    version: '2.0.0',
    complexity: 'advanced',
    estimatedSetupTime: '15-20 minutes',
    prerequisites: ['Log Analytics workspace', 'VM insights enabled', 'Performance counters configured'],
    template: AdvancedWorkbookGenerator.generateVmPerformanceWorkbook()
  },
  {
    id: 'vmss-scaling-analytics',
    name: 'VMSS Scaling Analytics',
    description: 'Advanced autoscaling analysis with load patterns and predictive insights',
    category: 'scaling-analytics',
    tags: ['vmss', 'autoscale', 'load-patterns', 'predictive', 'cost'],
    version: '2.0.0',
    complexity: 'expert',
    estimatedSetupTime: '20-30 minutes',
    prerequisites: ['VMSS with autoscale enabled', 'Azure Monitor metrics', 'Historical scaling data'],
    template: AdvancedWorkbookGenerator.generateVmssScalingWorkbook()
  },
  {
    id: 'vm-cost-optimization',
    name: 'VM Cost Optimization',
    description: 'Performance-aware cost optimization with right-sizing and reservation recommendations',
    category: 'cost-optimization',
    tags: ['cost', 'optimization', 'rightsizing', 'reservations', 'performance'],
    version: '2.0.0',
    complexity: 'intermediate',
    estimatedSetupTime: '10-15 minutes',
    prerequisites: ['Cost Management access', 'Performance data', 'Azure Advisor enabled'],
    template: AdvancedWorkbookGenerator.generateCostOptimizationWorkbook()
  }
];
