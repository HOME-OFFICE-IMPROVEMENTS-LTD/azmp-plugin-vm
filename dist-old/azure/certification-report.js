"use strict";
/**
 * Azure VM Certification Report Generator
 * Generates certification reports in HTML, JSON, and XML formats
 */
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
exports.CertificationReportGenerator = exports.ReportFormat = void 0;
exports.generateCertificationReport = generateCertificationReport;
exports.generateQuickHTMLReport = generateQuickHTMLReport;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Handlebars = __importStar(require("handlebars"));
const certification_tests_1 = require("./certification-tests");
/**
 * Report output format
 */
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["HTML"] = "html";
    ReportFormat["JSON"] = "json";
    ReportFormat["XML"] = "xml";
    ReportFormat["Markdown"] = "markdown";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
/**
 * Certification Report Generator
 */
class CertificationReportGenerator {
    config;
    results;
    metadata;
    constructor(results, config, metadata) {
        if (!results) {
            throw new Error('Certification results are required');
        }
        if (!config.outputDir) {
            throw new Error('Output directory is required');
        }
        this.results = results;
        this.config = {
            includeDetails: true,
            includeRecommendations: true,
            filename: 'certification-report',
            ...config
        };
        this.metadata = metadata;
        // Create output directory if it doesn't exist
        if (!fs.existsSync(this.config.outputDir)) {
            fs.mkdirSync(this.config.outputDir, { recursive: true });
        }
    }
    /**
     * Generate reports in all configured formats
     */
    async generateAll() {
        const generatedFiles = [];
        for (const format of this.config.formats) {
            const filePath = await this.generate(format);
            generatedFiles.push(filePath);
        }
        return generatedFiles;
    }
    /**
     * Generate report in specific format
     */
    async generate(format) {
        switch (format) {
            case ReportFormat.HTML:
                return this.generateHTML();
            case ReportFormat.JSON:
                return this.generateJSON();
            case ReportFormat.XML:
                return this.generateXML();
            case ReportFormat.Markdown:
                return this.generateMarkdown();
            default:
                throw new Error(`Unsupported report format: ${format}`);
        }
    }
    /**
     * Generate HTML report
     */
    async generateHTML() {
        const templatePath = this.config.htmlTemplatePath ||
            path.join(__dirname, '../../templates/certification-report.html.hbs');
        let template;
        if (fs.existsSync(templatePath)) {
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            template = Handlebars.compile(templateSource);
        }
        else {
            // Use default inline template if no template file found
            template = this.getDefaultHTMLTemplate();
        }
        const html = template({
            ...this.metadata,
            results: this.results,
            includeDetails: this.config.includeDetails,
            includeRecommendations: this.config.includeRecommendations,
            testsByCategory: this.groupTestsByCategory(),
            statusSummary: this.getStatusSummary(),
            helpers: {
                formatDate: (date) => date.toLocaleString(),
                formatDuration: (ms) => `${(ms / 1000).toFixed(2)}s`,
                statusColor: (status) => this.getStatusColor(status),
                statusIcon: (status) => this.getStatusIcon(status)
            }
        });
        const filename = `${this.config.filename}.html`;
        const filePath = path.join(this.config.outputDir, filename);
        fs.writeFileSync(filePath, html, 'utf8');
        return filePath;
    }
    /**
     * Generate JSON report
     */
    async generateJSON() {
        const report = {
            metadata: {
                title: this.metadata.title,
                generatedDate: this.metadata.generatedDate.toISOString(),
                companyName: this.metadata.companyName,
                projectName: this.metadata.projectName,
                vhdPath: this.metadata.vhdPath,
                vmSize: this.metadata.vmSize,
                region: this.metadata.region
            },
            summary: {
                overallStatus: this.results.overallStatus,
                score: this.results.score,
                totalTests: this.results.totalTests,
                passedTests: this.results.passedTests,
                failedTests: this.results.failedTests,
                warningTests: this.results.warningTests,
                skippedTests: this.results.skippedTests,
                duration: this.results.duration,
                startTime: this.results.startTime.toISOString(),
                endTime: this.results.endTime.toISOString()
            },
            testResults: this.results.testResults.map((test) => ({
                name: test.name,
                category: test.category,
                status: test.status,
                message: test.message,
                details: test.details,
                duration: test.duration,
                timestamp: test.timestamp.toISOString()
            })),
            recommendations: this.config.includeRecommendations
                ? this.results.recommendations
                : undefined,
            errors: this.results.errors,
            testsByCategory: this.groupTestsByCategory()
        };
        const filename = `${this.config.filename}.json`;
        const filePath = path.join(this.config.outputDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
        return filePath;
    }
    /**
     * Generate XML report
     */
    async generateXML() {
        const xml = this.buildXML();
        const filename = `${this.config.filename}.xml`;
        const filePath = path.join(this.config.outputDir, filename);
        fs.writeFileSync(filePath, xml, 'utf8');
        return filePath;
    }
    /**
     * Generate Markdown report
     */
    async generateMarkdown() {
        const lines = [];
        // Header
        lines.push(`# ${this.metadata.title}`);
        lines.push('');
        lines.push(`**Generated:** ${this.metadata.generatedDate.toLocaleString()}`);
        if (this.metadata.companyName) {
            lines.push(`**Company:** ${this.metadata.companyName}`);
        }
        if (this.metadata.projectName) {
            lines.push(`**Project:** ${this.metadata.projectName}`);
        }
        lines.push(`**VHD Path:** ${this.metadata.vhdPath}`);
        if (this.metadata.vmSize) {
            lines.push(`**VM Size:** ${this.metadata.vmSize}`);
        }
        if (this.metadata.region) {
            lines.push(`**Region:** ${this.metadata.region}`);
        }
        lines.push('');
        // Executive Summary
        lines.push('## Executive Summary');
        lines.push('');
        lines.push(`**Overall Status:** ${this.getStatusIcon(this.results.overallStatus)} ${this.results.overallStatus.toUpperCase()}`);
        lines.push(`**Score:** ${this.results.score}/100`);
        lines.push('');
        // Test Summary
        lines.push('## Test Summary');
        lines.push('');
        lines.push(`- Total Tests: ${this.results.totalTests}`);
        lines.push(`- Passed: ${this.results.passedTests} ✓`);
        lines.push(`- Failed: ${this.results.failedTests} ✗`);
        lines.push(`- Warnings: ${this.results.warningTests} ⚠`);
        lines.push(`- Skipped: ${this.results.skippedTests} ○`);
        lines.push(`- Duration: ${(this.results.duration / 1000).toFixed(2)}s`);
        lines.push('');
        // Test Results by Category
        lines.push('## Test Results by Category');
        lines.push('');
        const testsByCategory = this.groupTestsByCategory();
        Object.entries(testsByCategory).forEach(([category, tests]) => {
            lines.push(`### ${category}`);
            lines.push('');
            tests.forEach((test) => {
                const icon = this.getStatusIcon(test.status);
                lines.push(`- ${icon} **${test.name}** - ${test.status}`);
                if (this.config.includeDetails && test.message) {
                    lines.push(`  - ${test.message}`);
                }
            });
            lines.push('');
        });
        // Recommendations
        if (this.config.includeRecommendations && this.results.recommendations.length > 0) {
            lines.push('## Recommendations');
            lines.push('');
            this.results.recommendations.forEach((rec) => {
                lines.push(`- ${rec}`);
            });
            lines.push('');
        }
        // Errors
        if (this.results.errors.length > 0) {
            lines.push('## Errors');
            lines.push('');
            this.results.errors.forEach((error) => {
                lines.push(`- ✗ ${error}`);
            });
            lines.push('');
        }
        const markdown = lines.join('\n');
        const filename = `${this.config.filename}.md`;
        const filePath = path.join(this.config.outputDir, filename);
        fs.writeFileSync(filePath, markdown, 'utf8');
        return filePath;
    }
    /**
     * Build XML string from results
     */
    buildXML() {
        const lines = [];
        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push('<certificationReport>');
        // Metadata
        lines.push('  <metadata>');
        lines.push(`    <title>${this.escapeXML(this.metadata.title)}</title>`);
        lines.push(`    <generatedDate>${this.metadata.generatedDate.toISOString()}</generatedDate>`);
        if (this.metadata.companyName) {
            lines.push(`    <companyName>${this.escapeXML(this.metadata.companyName)}</companyName>`);
        }
        if (this.metadata.projectName) {
            lines.push(`    <projectName>${this.escapeXML(this.metadata.projectName)}</projectName>`);
        }
        lines.push(`    <vhdPath>${this.escapeXML(this.metadata.vhdPath)}</vhdPath>`);
        if (this.metadata.vmSize) {
            lines.push(`    <vmSize>${this.escapeXML(this.metadata.vmSize)}</vmSize>`);
        }
        if (this.metadata.region) {
            lines.push(`    <region>${this.escapeXML(this.metadata.region)}</region>`);
        }
        lines.push('  </metadata>');
        // Summary
        lines.push('  <summary>');
        lines.push(`    <overallStatus>${this.results.overallStatus}</overallStatus>`);
        lines.push(`    <score>${this.results.score}</score>`);
        lines.push(`    <totalTests>${this.results.totalTests}</totalTests>`);
        lines.push(`    <passedTests>${this.results.passedTests}</passedTests>`);
        lines.push(`    <failedTests>${this.results.failedTests}</failedTests>`);
        lines.push(`    <warningTests>${this.results.warningTests}</warningTests>`);
        lines.push(`    <skippedTests>${this.results.skippedTests}</skippedTests>`);
        lines.push(`    <duration>${this.results.duration}</duration>`);
        lines.push(`    <startTime>${this.results.startTime.toISOString()}</startTime>`);
        lines.push(`    <endTime>${this.results.endTime.toISOString()}</endTime>`);
        lines.push('  </summary>');
        // Test Results
        lines.push('  <testResults>');
        this.results.testResults.forEach((test) => {
            lines.push('    <test>');
            lines.push(`      <name>${this.escapeXML(test.name)}</name>`);
            lines.push(`      <category>${test.category}</category>`);
            lines.push(`      <status>${test.status}</status>`);
            lines.push(`      <message>${this.escapeXML(test.message)}</message>`);
            if (this.config.includeDetails && test.details) {
                lines.push(`      <details>${this.escapeXML(JSON.stringify(test.details))}</details>`);
            }
            lines.push(`      <duration>${test.duration}</duration>`);
            lines.push(`      <timestamp>${test.timestamp.toISOString()}</timestamp>`);
            lines.push('    </test>');
        });
        lines.push('  </testResults>');
        // Recommendations
        if (this.config.includeRecommendations && this.results.recommendations.length > 0) {
            lines.push('  <recommendations>');
            this.results.recommendations.forEach((rec) => {
                lines.push(`    <recommendation>${this.escapeXML(rec)}</recommendation>`);
            });
            lines.push('  </recommendations>');
        }
        // Errors
        if (this.results.errors.length > 0) {
            lines.push('  <errors>');
            this.results.errors.forEach((error) => {
                lines.push(`    <error>${this.escapeXML(error)}</error>`);
            });
            lines.push('  </errors>');
        }
        lines.push('</certificationReport>');
        return lines.join('\n');
    }
    /**
     * Group test results by category
     */
    groupTestsByCategory() {
        const grouped = {};
        this.results.testResults.forEach((test) => {
            const category = test.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(test);
        });
        return grouped;
    }
    /**
     * Get status summary for each category
     */
    getStatusSummary() {
        const summary = {};
        Object.values(certification_tests_1.TestCategory).forEach((category) => {
            summary[category] = { passed: 0, failed: 0, warning: 0 };
        });
        this.results.testResults.forEach((test) => {
            if (test.status === certification_tests_1.TestStatus.Passed) {
                summary[test.category].passed++;
            }
            else if (test.status === certification_tests_1.TestStatus.Failed) {
                summary[test.category].failed++;
            }
            else if (test.status === certification_tests_1.TestStatus.Warning) {
                summary[test.category].warning++;
            }
        });
        return summary;
    }
    /**
     * Get color for test status
     */
    getStatusColor(status) {
        switch (status) {
            case certification_tests_1.TestStatus.Passed:
                return '#28a745'; // Green
            case certification_tests_1.TestStatus.Failed:
                return '#dc3545'; // Red
            case certification_tests_1.TestStatus.Warning:
                return '#ffc107'; // Yellow
            case certification_tests_1.TestStatus.Skipped:
                return '#6c757d'; // Gray
            case certification_tests_1.TestStatus.Running:
                return '#007bff'; // Blue
            default:
                return '#6c757d';
        }
    }
    /**
     * Get icon for test status
     */
    getStatusIcon(status) {
        switch (status) {
            case certification_tests_1.TestStatus.Passed:
                return '✓';
            case certification_tests_1.TestStatus.Failed:
                return '✗';
            case certification_tests_1.TestStatus.Warning:
                return '⚠';
            case certification_tests_1.TestStatus.Skipped:
                return '○';
            case certification_tests_1.TestStatus.Running:
                return '⟳';
            default:
                return '?';
        }
    }
    /**
     * Escape XML special characters
     */
    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    /**
     * Get default HTML template (used when template file not found)
     */
    getDefaultHTMLTemplate() {
        const templateSource = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .content { padding: 40px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .summary-card { padding: 20px; border-radius: 8px; background: #f8f9fa; border-left: 4px solid #667eea; }
    .summary-card h3 { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .summary-card .value { font-size: 36px; font-weight: bold; color: #333; }
    .status-passed { border-left-color: #28a745; }
    .status-failed { border-left-color: #dc3545; }
    .status-warning { border-left-color: #ffc107; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 24px; margin-bottom: 20px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .test-list { list-style: none; }
    .test-item { padding: 15px; margin-bottom: 10px; border-radius: 6px; background: #f8f9fa; border-left: 4px solid #667eea; }
    .test-item.passed { border-left-color: #28a745; }
    .test-item.failed { border-left-color: #dc3545; }
    .test-item.warning { border-left-color: #ffc107; }
    .test-item .test-name { font-weight: 600; margin-bottom: 5px; }
    .test-item .test-message { color: #666; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-passed { background: #28a745; color: white; }
    .badge-failed { background: #dc3545; color: white; }
    .badge-warning { background: #ffc107; color: #333; }
    .recommendations { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 20px; }
    .recommendations ul { margin-left: 20px; }
    .recommendations li { margin-bottom: 10px; }
    .errors { background: #ffe7e7; border: 1px solid #ffb3b3; border-radius: 6px; padding: 20px; }
    .errors ul { margin-left: 20px; }
    .errors li { margin-bottom: 10px; color: #dc3545; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{title}}</h1>
      <p>Generated: {{helpers.formatDate generatedDate}}</p>
      {{#if companyName}}<p>Company: {{companyName}}</p>{{/if}}
      {{#if projectName}}<p>Project: {{projectName}}</p>{{/if}}
    </div>

    <div class="content">
      <div class="summary">
        <div class="summary-card status-{{results.overallStatus}}">
          <h3>Overall Status</h3>
          <div class="value">{{helpers.statusIcon results.overallStatus}} {{results.overallStatus}}</div>
        </div>
        <div class="summary-card">
          <h3>Score</h3>
          <div class="value">{{results.score}}/100</div>
        </div>
        <div class="summary-card status-passed">
          <h3>Passed Tests</h3>
          <div class="value">{{results.passedTests}}</div>
        </div>
        <div class="summary-card status-failed">
          <h3>Failed Tests</h3>
          <div class="value">{{results.failedTests}}</div>
        </div>
      </div>

      {{#each testsByCategory}}
      <div class="section">
        <h2>{{@key}}</h2>
        <ul class="test-list">
          {{#each this}}
          <li class="test-item {{status}}">
            <div class="test-name">
              <span class="badge badge-{{status}}">{{status}}</span>
              {{name}}
            </div>
            {{#if ../includeDetails}}
            <div class="test-message">{{message}}</div>
            {{/if}}
          </li>
          {{/each}}
        </ul>
      </div>
      {{/each}}

      {{#if includeRecommendations}}
      {{#if results.recommendations.length}}
      <div class="section">
        <h2>Recommendations</h2>
        <div class="recommendations">
          <ul>
            {{#each results.recommendations}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </div>
      {{/if}}
      {{/if}}

      {{#if results.errors.length}}
      <div class="section">
        <h2>Errors</h2>
        <div class="errors">
          <ul>
            {{#each results.errors}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </div>
      {{/if}}
    </div>

    <div class="footer">
      <p>Azure VM Certification Report • Duration: {{helpers.formatDuration results.duration}}</p>
    </div>
  </div>
</body>
</html>
    `;
        return Handlebars.compile(templateSource);
    }
}
exports.CertificationReportGenerator = CertificationReportGenerator;
/**
 * Generate certification report from test results
 */
async function generateCertificationReport(results, config, metadata) {
    const generator = new CertificationReportGenerator(results, config, metadata);
    return generator.generateAll();
}
/**
 * Generate quick HTML report
 */
async function generateQuickHTMLReport(results, outputPath, vhdPath) {
    const generator = new CertificationReportGenerator(results, {
        outputDir: path.dirname(outputPath),
        formats: [ReportFormat.HTML],
        filename: path.basename(outputPath, '.html')
    }, {
        title: 'Azure VM Certification Report',
        generatedDate: new Date(),
        vhdPath
    });
    const files = await generator.generateAll();
    return files[0];
}
