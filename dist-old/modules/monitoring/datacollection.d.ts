/**
 * Data Collection Rule Helpers
 * Defines data collection rules for Azure Monitor Agent (AMA)
 */
export interface DataCollectionRuleOptions {
    name: string;
    location?: string;
    dataSources?: string | any;
    destinations?: string | any;
    dataFlows?: string | any;
    description?: string;
    tags?: Record<string, string>;
}
/**
 * Define data collection rules for Azure Monitor Agent
 * @example
 * {{monitor:dataCollectionRule
 *   name="vm-performance-dcr"
 *   location="East US"
 *   dataSources='[{"performanceCounters":[{"counterSpecifiers":["\\Processor(_Total)\\% Processor Time"],"samplingFrequencyInSeconds":60}]}]'
 *   destinations='[{"logAnalytics":[{"workspaceResourceId":"[parameters(\'workspaceId\')]","name":"centralWorkspace"}]}]'
 *   dataFlows='[{"streams":["Microsoft-Perf"],"destinations":["centralWorkspace"]}]'
 * }}
 */
export declare function monitorDataCollectionRule(this: any, options: any): string;
export declare function registerDataCollectionHelpers(): void;
