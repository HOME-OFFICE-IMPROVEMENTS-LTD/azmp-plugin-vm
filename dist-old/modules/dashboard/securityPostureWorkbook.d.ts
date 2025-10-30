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
export declare function workbookSecurityPosture(this: unknown, options: SecurityPostureWorkbookOptions): string;
export declare function registerSecurityPostureWorkbookHelpers(): void;
