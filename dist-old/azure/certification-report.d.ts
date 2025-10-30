/**
 * Azure VM Certification Report Generator
 * Generates certification reports in HTML, JSON, and XML formats
 */
import { CertificationResults } from './certification-tests';
/**
 * Report output format
 */
export declare enum ReportFormat {
    HTML = "html",
    JSON = "json",
    XML = "xml",
    Markdown = "markdown"
}
/**
 * Configuration for report generation
 */
export interface ReportConfig {
    /**
     * Output directory for report files
     */
    outputDir: string;
    /**
     * Report formats to generate
     */
    formats: ReportFormat[];
    /**
     * Base filename (without extension)
     */
    filename?: string;
    /**
     * Include detailed test logs in report
     */
    includeDetails?: boolean;
    /**
     * Include recommendations section
     */
    includeRecommendations?: boolean;
    /**
     * Company/organization name for report header
     */
    companyName?: string;
    /**
     * Project name for report header
     */
    projectName?: string;
    /**
     * Custom HTML template path
     */
    htmlTemplatePath?: string;
}
/**
 * Report metadata for header information
 */
export interface ReportMetadata {
    title: string;
    generatedDate: Date;
    companyName?: string;
    projectName?: string;
    vhdPath: string;
    vmSize?: string;
    region?: string;
}
/**
 * Certification Report Generator
 */
export declare class CertificationReportGenerator {
    private config;
    private results;
    private metadata;
    constructor(results: CertificationResults, config: ReportConfig, metadata: ReportMetadata);
    /**
     * Generate reports in all configured formats
     */
    generateAll(): Promise<string[]>;
    /**
     * Generate report in specific format
     */
    generate(format: ReportFormat): Promise<string>;
    /**
     * Generate HTML report
     */
    private generateHTML;
    /**
     * Generate JSON report
     */
    private generateJSON;
    /**
     * Generate XML report
     */
    private generateXML;
    /**
     * Generate Markdown report
     */
    private generateMarkdown;
    /**
     * Build XML string from results
     */
    private buildXML;
    /**
     * Group test results by category
     */
    private groupTestsByCategory;
    /**
     * Get status summary for each category
     */
    private getStatusSummary;
    /**
     * Get color for test status
     */
    private getStatusColor;
    /**
     * Get icon for test status
     */
    private getStatusIcon;
    /**
     * Escape XML special characters
     */
    private escapeXML;
    /**
     * Get default HTML template (used when template file not found)
     */
    private getDefaultHTMLTemplate;
}
/**
 * Generate certification report from test results
 */
export declare function generateCertificationReport(results: CertificationResults, config: ReportConfig, metadata: ReportMetadata): Promise<string[]>;
/**
 * Generate quick HTML report
 */
export declare function generateQuickHTMLReport(results: CertificationResults, outputPath: string, vhdPath: string): Promise<string>;
