/**
 * Handlebars helpers for Azure Monitor Workbooks
 * Provides workbook: namespace helpers for template generation
 */
/**
 * Register all workbook-related Handlebars helpers
 * Adds helpers with 'workbook:' namespace prefix
 */
export declare function registerWorkbookHelpers(): void;
/**
 * Get list of all available workbook helpers
 */
export declare function getAvailableHelpers(): string[];
/**
 * Helper documentation for developers
 */
export declare const HELPER_DOCUMENTATION: {
    "workbook:definition": {
        description: string;
        syntax: string;
        parameters: {
            templateId: string;
            subscriptionId: string;
            resourceGroupName: string;
            vmName: string;
            location: string;
            parameters: string;
        };
    };
    "workbook:template": {
        description: string;
        syntax: string;
        parameters: {
            templateId: string;
        };
    };
    "workbook:kqlQuery": {
        description: string;
        syntax: string;
        parameters: {
            query: string;
            title: string;
            size: string;
            timeContext: string;
        };
    };
    "workbook:metricsChart": {
        description: string;
        syntax: string;
        parameters: {
            resourceType: string;
            metricName: string;
            title: string;
            chartType: string;
            aggregation: string;
            timeRange: string;
        };
    };
    "workbook:parameter": {
        description: string;
        syntax: string;
        parameters: {
            parameterName: string;
            parameterType: string;
            displayName: string;
            description: string;
            required: string;
            defaultValue: string;
        };
    };
    "workbook:grid": {
        description: string;
        syntax: string;
        parameters: {
            query: string;
            title: string;
            showExportToExcel: string;
            showSearch: string;
        };
    };
    "workbook:link": {
        description: string;
        syntax: string;
        parameters: {
            linkText: string;
            linkUrl: string;
            linkType: string;
            openInNewTab: string;
        };
    };
    "workbook:export": {
        description: string;
        syntax: string;
        parameters: {
            format: string;
            includeParameters: string;
            filename: string;
        };
    };
};
