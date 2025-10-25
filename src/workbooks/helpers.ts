/**
 * Handlebars helpers for Azure Monitor Workbooks
 * Provides workbook: namespace helpers for template generation
 */

import Handlebars from 'handlebars';
import { WorkbookTemplateManager } from './templates';
import type { WorkbookTemplate, WorkbookGenerationOptions } from './index';

/**
 * Register all workbook-related Handlebars helpers
 * Adds helpers with 'workbook:' namespace prefix
 */
export function registerWorkbookHelpers(): void {
  // Helper 1: workbook:definition - Generate complete workbook definition
  Handlebars.registerHelper('workbook:definition', function(templateId: string, options: any) {
    try {
      const template = WorkbookTemplateManager.getTemplate(templateId);
      if (!template) {
        return `Error: Template '${templateId}' not found`;
      }

      const generationOptions: WorkbookGenerationOptions = {
        templateId,
        subscriptionId: options.hash?.subscriptionId,
        resourceGroupName: options.hash?.resourceGroupName,
        vmName: options.hash?.vmName,
        location: options.hash?.location,
        customParameters: options.hash?.parameters || {}
      };

      const workbook = WorkbookTemplateManager.generateWorkbook(generationOptions);
      return new Handlebars.SafeString(JSON.stringify(workbook, null, 2));
    } catch (error) {
      return `Error generating workbook: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 2: workbook:template - Get template metadata without full definition
  Handlebars.registerHelper('workbook:template', function(templateId: string) {
    try {
      const template = WorkbookTemplateManager.getTemplate(templateId);
      if (!template) {
        return `Error: Template '${templateId}' not found`;
      }

      const metadata = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        version: template.version
      };

      return new Handlebars.SafeString(JSON.stringify(metadata, null, 2));
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 3: workbook:kqlQuery - Generate KQL query item for workbooks
  Handlebars.registerHelper('workbook:kqlQuery', function(query: string, options: any) {
    try {
      const title = options.hash?.title || 'KQL Query';
      const size = options.hash?.size || 0;
      const timeContext = options.hash?.timeContext || { durationMs: 3600000 }; // 1 hour default

      const kqlItem = {
        type: 3, // KQL query item type
        content: {
          version: 'KqlItem/1.0',
          query: query,
          size: size,
          title: title,
          timeContext: timeContext
        }
      };

      return new Handlebars.SafeString(JSON.stringify(kqlItem, null, 2));
    } catch (error) {
      return `Error generating KQL query: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 4: workbook:metricsChart - Generate metrics chart item
  Handlebars.registerHelper('workbook:metricsChart', function(resourceType: string, metricName: string, options: any) {
    try {
      const title = options.hash?.title || `${metricName} Chart`;
      const chartType = options.hash?.chartType || 'Line';
      const aggregation = options.hash?.aggregation || 'Average';
      const timeRange = options.hash?.timeRange || 'PT1H';

      const metricsItem = {
        type: 10, // Metrics chart item type
        content: {
          version: 'MetricsItem/2.0',
          size: 0,
          chartType: chartType,
          resourceType: resourceType,
          metricScope: 0,
          resourceParameter: 'selectedResource',
          metrics: [
            {
              namespace: resourceType,
              metric: metricName,
              aggregation: aggregation,
              splitBy: null
            }
          ],
          title: title,
          timeContext: {
            durationMs: parseTimeRange(timeRange)
          },
          gridSettings: {
            rowLimit: 10000
          }
        }
      };

      return new Handlebars.SafeString(JSON.stringify(metricsItem, null, 2));
    } catch (error) {
      return `Error generating metrics chart: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 5: workbook:parameter - Generate parameter item for workbooks
  Handlebars.registerHelper('workbook:parameter', function(parameterName: string, parameterType: string, options: any) {
    try {
      const displayName = options.hash?.displayName || parameterName;
      const description = options.hash?.description || '';
      const required = options.hash?.required || false;
      const defaultValue = options.hash?.defaultValue;

      const parameterItem = {
        type: 9, // Parameter item type
        content: {
          version: 'ParametersItem/1.0',
          parameters: [
            {
              id: parameterName,
              version: 'KqlParameterItem/1.0',
              name: parameterName,
              label: displayName,
              type: getParameterType(parameterType),
              description: description,
              required: required,
              value: defaultValue
            }
          ],
          style: 'pills',
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces'
        }
      };

      return new Handlebars.SafeString(JSON.stringify(parameterItem, null, 2));
    } catch (error) {
      return `Error generating parameter: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 6: workbook:grid - Generate grid/table item
  Handlebars.registerHelper('workbook:grid', function(query: string, options: any) {
    try {
      const title = options.hash?.title || 'Data Grid';
      const showExportToExcel = options.hash?.showExportToExcel || true;
      const showSearch = options.hash?.showSearch || true;

      const gridItem = {
        type: 3, // Query item type with grid visualization
        content: {
          version: 'KqlItem/1.0',
          query: query,
          size: 0,
          title: title,
          showExportToExcel: showExportToExcel,
          queryType: 0,
          resourceType: 'microsoft.operationalinsights/workspaces',
          visualization: 'table',
          gridSettings: {
            formatters: [],
            rowLimit: 1000,
            filter: showSearch
          }
        }
      };

      return new Handlebars.SafeString(JSON.stringify(gridItem, null, 2));
    } catch (error) {
      return `Error generating grid: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 7: workbook:link - Generate link item for navigation
  Handlebars.registerHelper('workbook:link', function(linkText: string, linkUrl: string, options: any) {
    try {
      const linkType = options.hash?.linkType || 'url'; // url, workbook, dashboard
      const openInNewTab = options.hash?.openInNewTab || false;

      const linkItem = {
        type: 11, // Link item type
        content: {
          version: 'LinkItem/1.0',
          style: 'link',
          links: [
            {
              cellValue: linkText,
              linkTarget: linkType,
              linkLabel: linkText,
              preText: '',
              postText: '',
              style: 'link'
            }
          ]
        }
      };

      if (linkType === 'url') {
        linkItem.content.links[0].linkTarget = 'Url';
        (linkItem.content.links[0] as any).linkIsContextBlade = !openInNewTab;
      }

      return new Handlebars.SafeString(JSON.stringify(linkItem, null, 2));
    } catch (error) {
      return `Error generating link: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });

  // Helper 8: workbook:export - Generate export configuration
  Handlebars.registerHelper('workbook:export', function(options: any) {
    try {
      const exportFormat = options.hash?.format || 'excel'; // excel, csv, json
      const includeParameters = options.hash?.includeParameters || true;
      const filename = options.hash?.filename || 'workbook-export';

      const exportConfig = {
        exportSettings: {
          format: exportFormat,
          includeParameters: includeParameters,
          filename: filename,
          timestamp: true
        }
      };

      return new Handlebars.SafeString(JSON.stringify(exportConfig, null, 2));
    } catch (error) {
      return `Error generating export config: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });
}

/**
 * Helper utility functions
 */

// Convert time range string to milliseconds
function parseTimeRange(timeRange: string): number {
  const timeRangeMap: Record<string, number> = {
    'PT5M': 5 * 60 * 1000,      // 5 minutes
    'PT15M': 15 * 60 * 1000,    // 15 minutes
    'PT30M': 30 * 60 * 1000,    // 30 minutes
    'PT1H': 60 * 60 * 1000,     // 1 hour
    'PT4H': 4 * 60 * 60 * 1000, // 4 hours
    'PT12H': 12 * 60 * 60 * 1000, // 12 hours
    'P1D': 24 * 60 * 60 * 1000,   // 1 day
    'P7D': 7 * 24 * 60 * 60 * 1000, // 7 days
    'P30D': 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  return timeRangeMap[timeRange] || timeRangeMap['PT1H'];
}

// Convert parameter type string to workbook parameter type
function getParameterType(parameterType: string): number {
  const typeMap: Record<string, number> = {
    'text': 1,
    'dropdown': 2,
    'timeRange': 4,
    'resource': 5,
    'subscription': 6,
    'resourceGroup': 7,
    'multiSelect': 2
  };

  return typeMap[parameterType.toLowerCase()] || 1; // Default to text
}

/**
 * Get list of all available workbook helpers
 */
export function getAvailableHelpers(): string[] {
  return [
    'workbook:definition',
    'workbook:template',
    'workbook:kqlQuery',
    'workbook:metricsChart',
    'workbook:parameter',
    'workbook:grid',
    'workbook:link',
    'workbook:export'
  ];
}

/**
 * Helper documentation for developers
 */
export const HELPER_DOCUMENTATION = {
  'workbook:definition': {
    description: 'Generate complete workbook definition from template',
    syntax: '{{workbook:definition "template-id" subscriptionId="sub-id" vmName="vm-name"}}',
    parameters: {
      templateId: 'Required. ID of the workbook template',
      subscriptionId: 'Optional. Azure subscription ID',
      resourceGroupName: 'Optional. Resource group name',
      vmName: 'Optional. Virtual machine name',
      location: 'Optional. Azure region',
      parameters: 'Optional. Custom parameters object'
    }
  },
  'workbook:template': {
    description: 'Get template metadata without full definition',
    syntax: '{{workbook:template "template-id"}}',
    parameters: {
      templateId: 'Required. ID of the workbook template'
    }
  },
  'workbook:kqlQuery': {
    description: 'Generate KQL query item for workbooks',
    syntax: '{{workbook:kqlQuery "query" title="Chart Title" size=0}}',
    parameters: {
      query: 'Required. KQL query string',
      title: 'Optional. Chart title',
      size: 'Optional. Chart size (0=auto, 1=small, 2=medium, 3=large)',
      timeContext: 'Optional. Time context object'
    }
  },
  'workbook:metricsChart': {
    description: 'Generate metrics chart item',
    syntax: '{{workbook:metricsChart "resourceType" "metricName" title="Chart Title"}}',
    parameters: {
      resourceType: 'Required. Azure resource type',
      metricName: 'Required. Metric name',
      title: 'Optional. Chart title',
      chartType: 'Optional. Chart type (Line, Area, Bar, etc.)',
      aggregation: 'Optional. Aggregation type (Average, Maximum, etc.)',
      timeRange: 'Optional. Time range (PT1H, P1D, etc.)'
    }
  },
  'workbook:parameter': {
    description: 'Generate parameter item for workbooks',
    syntax: '{{workbook:parameter "paramName" "paramType" displayName="Display Name"}}',
    parameters: {
      parameterName: 'Required. Parameter name',
      parameterType: 'Required. Parameter type (text, dropdown, timeRange, etc.)',
      displayName: 'Optional. Display name',
      description: 'Optional. Parameter description',
      required: 'Optional. Whether parameter is required',
      defaultValue: 'Optional. Default value'
    }
  },
  'workbook:grid': {
    description: 'Generate grid/table item',
    syntax: '{{workbook:grid "query" title="Table Title" showSearch=true}}',
    parameters: {
      query: 'Required. KQL query for table data',
      title: 'Optional. Table title',
      showExportToExcel: 'Optional. Show export to Excel button',
      showSearch: 'Optional. Show search/filter capability'
    }
  },
  'workbook:link': {
    description: 'Generate link item for navigation',
    syntax: '{{workbook:link "Link Text" "https://example.com" openInNewTab=true}}',
    parameters: {
      linkText: 'Required. Text to display for link',
      linkUrl: 'Required. URL or target for link',
      linkType: 'Optional. Link type (url, workbook, dashboard)',
      openInNewTab: 'Optional. Open link in new tab'
    }
  },
  'workbook:export': {
    description: 'Generate export configuration',
    syntax: '{{workbook:export format="excel" filename="my-report"}}',
    parameters: {
      format: 'Optional. Export format (excel, csv, json)',
      includeParameters: 'Optional. Include parameters in export',
      filename: 'Optional. Export filename'
    }
  }
};