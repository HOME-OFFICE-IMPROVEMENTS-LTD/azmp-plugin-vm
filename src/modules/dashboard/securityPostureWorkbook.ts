import * as Handlebars from "handlebars";

export interface SecurityPostureWorkbookOptions {
  name: string;
  location: string;
  resourceGroup: string;
  subscriptionId: string;
  workspaceResourceId?: string;
  showSecurityRecommendations?: boolean;
  showSecurityAlerts?: boolean;
  showComplianceStatus?: boolean;
  showVulnerabilities?: boolean;
  tags?: Record<string, string>;
}

/**
 * Generate security posture workbook with Defender for Cloud insights
 */
export function workbookSecurityPosture(
  this: unknown,
  options: SecurityPostureWorkbookOptions,
): string {
  if (!options.name)
    throw new Error("name is required for workbook:securityPosture");
  if (!options.location)
    throw new Error("location is required for workbook:securityPosture");
  if (!options.resourceGroup)
    throw new Error("resourceGroup is required for workbook:securityPosture");
  if (!options.subscriptionId)
    throw new Error("subscriptionId is required for workbook:securityPosture");

  const showSecurityRecommendations =
    options.showSecurityRecommendations !== false;
  const showSecurityAlerts = options.showSecurityAlerts !== false;
  const showComplianceStatus = options.showComplianceStatus !== false;
  const showVulnerabilities = options.showVulnerabilities !== false;

  const items: unknown[] = [];

  items.push({
    type: 1,
    content: {
      json: "## Security Posture Dashboard\n\nOverview of security recommendations, alerts, compliance status, and vulnerabilities from Microsoft Defender for Cloud.",
    },
  });

  if (showSecurityRecommendations) {
    items.push({
      type: 1,
      content: { json: "### Security Recommendations" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/assessments'\n| where properties.status.code != 'Healthy' and properties.status.code != 'NotApplicable'\n| extend severity = tostring(properties.metadata.severity)\n| summarize count() by severity\n| order by count_ desc`,
        size: 1, // Large
        title: "Active Recommendations by Severity",
        queryType: 1, // Azure Resource Graph
        visualization: "piechart",
      },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/assessments'\n| where properties.status.code != 'Healthy'\n| project Recommendation=properties.displayName, Severity=properties.metadata.severity, Status=properties.status.code, Resource=properties.resourceDetails.Id\n| order by Severity desc\n| take 20`,
        size: 0,
        title: "Top Security Recommendations",
        queryType: 1,
        visualization: "table",
      },
    });
  }

  if (showSecurityAlerts) {
    items.push({
      type: 1,
      content: { json: "### Security Alerts" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/locations/alerts'\n| extend severity = tostring(properties.severity)\n| summarize AlertCount=count() by severity, bin(todatetime(properties.timeGeneratedUtc), 1d)\n| render columnchart`,
        size: 0,
        title: "Security Alerts Over Time",
        queryType: 1,
        visualization: "columnchart",
      },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/locations/alerts'\n| where properties.status == 'Active'\n| project Alert=properties.alertDisplayName, Severity=properties.severity, Time=properties.timeGeneratedUtc, Description=properties.description\n| order by Time desc\n| take 20`,
        size: 0,
        title: "Recent Active Alerts",
        queryType: 1,
        visualization: "table",
      },
    });
  }

  if (showComplianceStatus) {
    items.push({
      type: 1,
      content: { json: "### Compliance Status" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/regulatorycompliancestandards/regulatorycompliancecontrols/regulatorycomplianceassessments'\n| extend complianceState = tostring(properties.state)\n| summarize count() by complianceState\n| render piechart`,
        size: 1,
        title: "Regulatory Compliance Overview",
        queryType: 1,
        visualization: "piechart",
      },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `securityresources\n| where type == 'microsoft.security/regulatorycompliancestandards'\n| extend passedControls = toint(properties.passedControls), failedControls = toint(properties.failedControls)\n| project Standard=name, PassedControls=passedControls, FailedControls=failedControls, CompliancePercent=round((todouble(passedControls)/(passedControls+failedControls))*100, 2)\n| order by CompliancePercent asc`,
        size: 0,
        title: "Compliance by Standard",
        queryType: 1,
        visualization: "table",
      },
    });
  }

  if (showVulnerabilities && options.workspaceResourceId) {
    items.push({
      type: 1,
      content: { json: "### Vulnerabilities" },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `SecurityBaseline\n| where AnalyzeResult == 'Failed'\n| summarize count() by RuleSeverity\n| render piechart`,
        size: 1,
        title: "Security Baseline Failures by Severity",
        queryType: 0,
        resourceType: "microsoft.operationalinsights/workspaces",
        crossComponentResources: [options.workspaceResourceId],
        visualization: "piechart",
      },
    });

    items.push({
      type: 3,
      content: {
        version: "KqlItem/1.0",
        query: `SecurityBaseline\n| where AnalyzeResult == 'Failed'\n| project Computer, BaselineName, RuleId, Description=RuleDescription, Severity=RuleSeverity\n| order by Severity desc\n| take 50`,
        size: 0,
        title: "Top Security Baseline Failures",
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
      displayName: "Security Posture Workbook",
      serializedData: JSON.stringify({
        version: "Notebook/1.0",
        items,
        styleSettings: {},
        $schema:
          "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json",
      }),
      category: "workbook",
      sourceId: `/subscriptions/${options.subscriptionId}/resourceGroups/${options.resourceGroup}`,
    },
  };

  return JSON.stringify(workbook, null, 2);
}

export function registerSecurityPostureWorkbookHelpers(): void {
  Handlebars.registerHelper(
    "workbook:securityPosture",
    function (this: unknown, options: unknown) {
      const opts =
        (options as { hash?: SecurityPostureWorkbookOptions })?.hash || options;
      return new Handlebars.SafeString(
        workbookSecurityPosture.call(
          this,
          opts as SecurityPostureWorkbookOptions,
        ),
      );
    },
  );
}
