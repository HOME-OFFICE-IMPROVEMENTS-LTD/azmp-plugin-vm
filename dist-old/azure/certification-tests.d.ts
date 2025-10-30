/**
 * Azure VM Certification Test Module
 *
 * Provides comprehensive testing and validation for Azure Marketplace VM certification.
 * Integrates with Azure VM Certification Test Tool and provides automated validation
 * for VHD format, security, performance, and compliance requirements.
 *
 * @module azure/certification-tests
 */
/**
 * Test result status
 */
export declare enum TestStatus {
    Passed = "passed",
    Failed = "failed",
    Warning = "warning",
    Skipped = "skipped",
    Running = "running"
}
/**
 * Test category
 */
export declare enum TestCategory {
    VHDFormat = "vhd-format",
    Security = "security",
    Performance = "performance",
    Generalization = "generalization",
    Compliance = "compliance",
    Configuration = "configuration"
}
/**
 * Individual test result
 */
export interface TestResult {
    name: string;
    category: TestCategory;
    status: TestStatus;
    message: string;
    details?: string;
    duration?: number;
    timestamp: Date;
}
/**
 * Certification test suite results
 */
export interface CertificationResults {
    overallStatus: TestStatus;
    score: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningTests: number;
    skippedTests: number;
    duration: number;
    startTime: Date;
    endTime: Date;
    testResults: TestResult[];
    recommendations: string[];
    errors: string[];
}
/**
 * VHD validation result
 */
export interface VHDValidation {
    isValid: boolean;
    format: string;
    sizeGB: number;
    isFixedSize: boolean;
    hasCorrectAlignment: boolean;
    hasCorrectPartitioning: boolean;
    isGeneralized: boolean;
    hasRootPartition: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Security scan result
 */
export interface SecurityScan {
    hasNoDefaultCredentials: boolean;
    hasNoMalware: boolean;
    hasNoUnauthorizedSoftware: boolean;
    hasSecureConfiguration: boolean;
    vulnerabilities: Array<{
        severity: 'critical' | 'high' | 'medium' | 'low';
        description: string;
        recommendation: string;
    }>;
    errors: string[];
    warnings: string[];
}
/**
 * Performance benchmark result
 */
export interface PerformanceBenchmark {
    bootTimeSeconds: number;
    diskReadMBps: number;
    diskWriteMBps: number;
    diskIOPS: number;
    meetsMinimumRequirements: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Certification test configuration
 */
export interface CertificationTestConfig {
    vhdPath: string;
    vmSize?: string;
    region?: string;
    skipSecurityScan?: boolean;
    skipPerformanceTest?: boolean;
    verboseOutput?: boolean;
    outputDir?: string;
}
/**
 * CertificationTestRunner - Executes Azure VM certification tests
 */
export declare class CertificationTestRunner {
    private config;
    private results;
    private startTime?;
    constructor(config: CertificationTestConfig);
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Run all certification tests
     */
    runAll(): Promise<CertificationResults>;
    /**
     * Run VHD format validation
     */
    runVHDValidation(): Promise<VHDValidation>;
    /**
     * Run security scan
     */
    runSecurityScan(): Promise<SecurityScan>;
    /**
     * Run generalization check
     */
    runGeneralizationCheck(): Promise<boolean>;
    /**
     * Run configuration validation
     */
    runConfigurationValidation(): Promise<boolean>;
    /**
     * Run performance benchmark
     */
    runPerformanceBenchmark(): Promise<PerformanceBenchmark>;
    /**
     * Run compliance checks
     */
    runComplianceChecks(): Promise<boolean>;
    /**
     * Add test result
     */
    private addTestResult;
    /**
     * Generate certification results
     */
    private generateResults;
    private checkVHDIsFixedSize;
    private checkNoDefaultCredentials;
    private checkNoMalware;
    private checkNoUnauthorizedSoftware;
    private checkSecureConfiguration;
    private checkIsGeneralized;
    private checkAzureGuestAgent;
    private checkNetworkConfiguration;
    private checkStorageConfiguration;
    private checkBootConfiguration;
    private checkMarketplaceCompliance;
    private checkLicensingCompliance;
    private checkPrivacyCompliance;
    /**
     * Get test summary
     */
    getSummary(): string;
}
/**
 * Run batch certification tests on multiple VHDs
 */
export declare function runBatchTests(vhdPaths: string[], config?: Partial<CertificationTestConfig>): Promise<Map<string, CertificationResults>>;
/**
 * Quick validation (VHD format only)
 */
export declare function quickValidate(vhdPath: string): Promise<VHDValidation>;
