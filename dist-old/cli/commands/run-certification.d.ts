/**
 * CLI Command: Run Azure VM Certification Tests
 * Executes certification tests on VHD files and generates reports
 */
/**
 * CLI command options for certification testing
 */
export interface RunCertificationOptions {
    /**
     * Path to VHD file or directory containing VHDs
     */
    vhdPath: string;
    /**
     * Azure VM size (e.g., Standard_D2s_v3)
     */
    vmSize?: string;
    /**
     * Azure region (e.g., eastus, westus2)
     */
    region?: string;
    /**
     * Skip security scan
     */
    skipSecurity?: boolean;
    /**
     * Skip performance tests
     */
    skipPerformance?: boolean;
    /**
     * Output directory for reports
     */
    outputDir?: string;
    /**
     * Report formats (comma-separated: html,json,xml,markdown)
     */
    formats?: string;
    /**
     * Quick validation mode (VHD format only)
     */
    quick?: boolean;
    /**
     * Batch mode (process all VHDs in directory)
     */
    batch?: boolean;
    /**
     * Verbose output
     */
    verbose?: boolean;
    /**
     * Company name for report header
     */
    company?: string;
    /**
     * Project name for report header
     */
    project?: string;
    /**
     * Open HTML report after generation
     */
    open?: boolean;
}
/**
 * Run certification tests on VHD file(s)
 */
export declare function runCertification(options: RunCertificationOptions): Promise<void>;
/**
 * Parse CLI arguments and run certification
 */
export declare function runCertificationCommand(args: string[]): Promise<void>;
