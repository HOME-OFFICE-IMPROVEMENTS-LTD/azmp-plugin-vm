/**
 * Log Analytics Workspace Helpers
 * Creates and configures Log Analytics workspaces for centralized logging
 */

import Handlebars from 'handlebars';

export interface LogAnalyticsWorkspaceOptions {
  name: string;
  location?: string;
  sku?: 'Free' | 'PerGB2018' | 'PerNode' | 'Premium' | 'Standalone' | 'Standard';
  retentionInDays?: number;
  dailyQuotaGb?: number;
  publicNetworkAccessForIngestion?: 'Enabled' | 'Disabled';
  publicNetworkAccessForQuery?: 'Enabled' | 'Disabled';
  tags?: Record<string, string>;
}

/**
 * Create Log Analytics workspace for centralized logging
 * @example
 * {{monitor:logAnalyticsWorkspace
 *   name="vmss-logs-workspace"
 *   location="East US"
 *   sku="PerGB2018"
 *   retentionInDays=90
 *   dailyQuotaGb=10
 * }}
 */
export function monitorLogAnalyticsWorkspace(this: any, options: any): string {
  const hash = options.hash as LogAnalyticsWorkspaceOptions;
  
  if (!hash.name) {
    throw new Error('monitor:logAnalyticsWorkspace requires name parameter');
  }

  const location = hash.location || '[resourceGroup().location]';
  const sku = hash.sku || 'PerGB2018';
  const retentionInDays = hash.retentionInDays || 30;
  const publicNetworkAccessForIngestion = hash.publicNetworkAccessForIngestion || 'Enabled';
  const publicNetworkAccessForQuery = hash.publicNetworkAccessForQuery || 'Enabled';

  const result = {
    type: 'Microsoft.OperationalInsights/workspaces',
    apiVersion: '2022-10-01',
    name: hash.name,
    location: location,
    ...(hash.tags && { tags: hash.tags }),
    properties: {
      sku: {
        name: sku
      },
      retentionInDays: retentionInDays,
      features: {
        enableLogAccessUsingOnlyResourcePermissions: true
      },
      workspaceCapping: hash.dailyQuotaGb ? {
        dailyQuotaGb: hash.dailyQuotaGb
      } : undefined,
      publicNetworkAccessForIngestion: publicNetworkAccessForIngestion,
      publicNetworkAccessForQuery: publicNetworkAccessForQuery
    }
  };

  return JSON.stringify(result, null, 2);
}

export function registerWorkspaceHelpers(): void {
  Handlebars.registerHelper('monitor:logAnalyticsWorkspace', monitorLogAnalyticsWorkspace);
}
