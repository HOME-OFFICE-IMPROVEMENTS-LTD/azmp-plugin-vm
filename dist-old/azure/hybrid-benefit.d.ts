/**
 * Azure Hybrid Benefit Module
 *
 * Implements Azure Hybrid Benefit support for Windows Server and SQL Server VMs.
 * Provides license validation, cost calculations, and ARM template generation.
 *
 * @module azure/hybrid-benefit
 */
/**
 * License types supported by Azure Hybrid Benefit
 */
export declare enum LicenseType {
    /** No hybrid benefit - pay-as-you-go licensing */
    None = "None",
    /** Windows Server with Software Assurance */
    WindowsServer = "Windows_Server",
    /** Windows Client (Windows 10/11 multi-tenant hosting rights) */
    WindowsClient = "Windows_Client",
    /** SQL Server Enterprise with Software Assurance */
    SqlServerEnterprise = "AHUB",
    /** SQL Server Standard with Software Assurance */
    SqlServerStandard = "AHUB"
}
/**
 * VM sizes eligible for Azure Hybrid Benefit
 */
export declare enum EligibleVmSize {
    Standard_D2s_v3 = "Standard_D2s_v3",
    Standard_D4s_v3 = "Standard_D4s_v3",
    Standard_D8s_v3 = "Standard_D8s_v3",
    Standard_D16s_v3 = "Standard_D16s_v3",
    Standard_D32s_v3 = "Standard_D32s_v3",
    Standard_D48s_v3 = "Standard_D48s_v3",
    Standard_D64s_v3 = "Standard_D64s_v3",
    Standard_E2s_v3 = "Standard_E2s_v3",
    Standard_E4s_v3 = "Standard_E4s_v3",
    Standard_E8s_v3 = "Standard_E8s_v3",
    Standard_E16s_v3 = "Standard_E16s_v3",
    Standard_E32s_v3 = "Standard_E32s_v3",
    Standard_E48s_v3 = "Standard_E48s_v3",
    Standard_E64s_v3 = "Standard_E64s_v3"
}
/**
 * License requirement for hybrid benefit
 */
export interface LicenseRequirement {
    /** Number of cores required */
    coresRequired: number;
    /** License type needed */
    licenseType: LicenseType;
    /** Minimum licenses needed */
    minimumLicenses: number;
    /** Description of requirement */
    description: string;
}
/**
 * Cost savings from hybrid benefit
 */
export interface CostSavings {
    /** Pay-as-you-go monthly cost */
    paygMonthlyCost: number;
    /** Hybrid benefit monthly cost */
    hybridBenefitMonthlyCost: number;
    /** Monthly savings amount */
    monthlySavings: number;
    /** Annual savings amount */
    annualSavings: number;
    /** Savings percentage */
    savingsPercent: number;
    /** Currency code */
    currency: string;
}
/**
 * Hybrid benefit configuration
 */
export interface HybridBenefitConfig {
    /** VM name */
    vmName: string;
    /** VM size */
    vmSize: string;
    /** Operating system type */
    osType: 'Windows' | 'Linux';
    /** License type to apply */
    licenseType: LicenseType;
    /** Whether SQL Server is installed */
    hasSqlServer?: boolean;
    /** SQL Server edition if installed */
    sqlServerEdition?: 'Enterprise' | 'Standard';
    /** Azure region for pricing */
    region?: string;
}
/**
 * Validation result for hybrid benefit configuration
 */
export interface ValidationResult {
    /** Whether configuration is valid */
    isValid: boolean;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
}
/**
 * Manages Azure Hybrid Benefit configuration and validation
 */
export declare class HybridBenefitManager {
    private config;
    /**
     * Windows Server base costs per core (USD/month)
     * Based on Azure pricing for Windows Server license premium
     */
    private static readonly WINDOWS_SERVER_COST_PER_CORE;
    /**
     * SQL Server license costs per core (USD/month)
     */
    private static readonly SQL_ENTERPRISE_COST_PER_CORE;
    private static readonly SQL_STANDARD_COST_PER_CORE;
    /**
     * Minimum core requirements for SQL Server licenses
     */
    private static readonly SQL_ENTERPRISE_MIN_CORES;
    private static readonly SQL_STANDARD_MIN_CORES;
    /**
     * VM size to core count mapping
     */
    private static readonly VM_CORES;
    constructor(config: HybridBenefitConfig);
    /**
     * Validate hybrid benefit configuration
     */
    validate(): ValidationResult;
    /**
     * Get the number of cores for the configured VM size
     */
    getCoreCount(): number;
    /**
     * Get license requirements for the current configuration
     */
    getLicenseRequirements(): LicenseRequirement[];
    /**
     * Calculate cost savings from hybrid benefit
     */
    calculateSavings(): CostSavings;
    /**
     * Generate ARM template properties for hybrid benefit
     */
    toARMTemplate(): any;
    /**
     * Get configuration summary
     */
    getSummary(): string;
    /**
     * Check if a VM size is eligible for hybrid benefit
     */
    static isEligibleVmSize(vmSize: string): boolean;
    /**
     * Get all eligible VM sizes
     */
    static getEligibleVmSizes(): string[];
    /**
     * Calculate potential savings for a VM size
     */
    static estimateSavings(vmSize: string, osType: 'Windows' | 'Linux', hasSqlServer?: boolean, sqlServerEdition?: 'Enterprise' | 'Standard'): CostSavings;
}
