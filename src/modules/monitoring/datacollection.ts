/**
 * Data Collection Rule Helpers
 * Defines data collection rules for Azure Monitor Agent (AMA)
 */

import Handlebars from "handlebars";

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
export function monitorDataCollectionRule(this: any, options: any): string {
  const hash = options.hash as DataCollectionRuleOptions;

  if (!hash.name) {
    throw new Error("monitor:dataCollectionRule requires name parameter");
  }

  const location = hash.location || "[resourceGroup().location]";

  // Parse JSON strings if provided
  let dataSources = hash.dataSources;
  if (typeof dataSources === "string") {
    try {
      dataSources = JSON.parse(dataSources);
    } catch (e) {
      throw new Error(
        "monitor:dataCollectionRule dataSources must be valid JSON",
      );
    }
  }

  let destinations = hash.destinations;
  if (typeof destinations === "string") {
    try {
      destinations = JSON.parse(destinations);
    } catch (e) {
      throw new Error(
        "monitor:dataCollectionRule destinations must be valid JSON",
      );
    }
  }

  let dataFlows = hash.dataFlows;
  if (typeof dataFlows === "string") {
    try {
      dataFlows = JSON.parse(dataFlows);
    } catch (e) {
      throw new Error(
        "monitor:dataCollectionRule dataFlows must be valid JSON",
      );
    }
  }

  const result = {
    type: "Microsoft.Insights/dataCollectionRules",
    apiVersion: "2022-06-01",
    name: hash.name,
    location: location,
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      ...(hash.description && { description: hash.description }),
      dataSources: dataSources || {
        performanceCounters: [
          {
            streams: ["Microsoft-Perf"],
            samplingFrequencyInSeconds: 60,
            counterSpecifiers: [
              "\\Processor(_Total)\\% Processor Time",
              "\\Memory\\Available MBytes",
              "\\Network Interface(*)\\Bytes Total/sec",
            ],
            name: "perfCounterDataSource",
          },
        ],
      },
      destinations: destinations || {
        logAnalytics: [
          {
            workspaceResourceId: "[parameters('workspaceId')]",
            name: "centralWorkspace",
          },
        ],
      },
      dataFlows: dataFlows || [
        {
          streams: ["Microsoft-Perf"],
          destinations: ["centralWorkspace"],
        },
      ],
    },
  };

  return JSON.stringify(result, null, 2);
}

export function registerDataCollectionHelpers(): void {
  Handlebars.registerHelper(
    "monitor:dataCollectionRule",
    monitorDataCollectionRule,
  );
}
