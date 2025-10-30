"use strict";
/**
 * Azure Hybrid Benefit Module
 *
 * Implements Azure Hybrid Benefit support for Windows Server and SQL Server VMs.
 * Provides license validation, cost calculations, and ARM template generation.
 *
 * @module azure/hybrid-benefit
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridBenefitManager = exports.EligibleVmSize = exports.LicenseType = void 0;
/**
 * License types supported by Azure Hybrid Benefit
 */
var LicenseType;
(function (LicenseType) {
    /** No hybrid benefit - pay-as-you-go licensing */
    LicenseType["None"] = "None";
    /** Windows Server with Software Assurance */
    LicenseType["WindowsServer"] = "Windows_Server";
    /** Windows Client (Windows 10/11 multi-tenant hosting rights) */
    LicenseType["WindowsClient"] = "Windows_Client";
    /** SQL Server Enterprise with Software Assurance */
    LicenseType["SqlServerEnterprise"] = "AHUB";
    /** SQL Server Standard with Software Assurance */
    LicenseType["SqlServerStandard"] = "AHUB";
})(LicenseType || (exports.LicenseType = LicenseType = {}));
/**
 * VM sizes eligible for Azure Hybrid Benefit
 */
var EligibleVmSize;
(function (EligibleVmSize) {
    EligibleVmSize["Standard_D2s_v3"] = "Standard_D2s_v3";
    EligibleVmSize["Standard_D4s_v3"] = "Standard_D4s_v3";
    EligibleVmSize["Standard_D8s_v3"] = "Standard_D8s_v3";
    EligibleVmSize["Standard_D16s_v3"] = "Standard_D16s_v3";
    EligibleVmSize["Standard_D32s_v3"] = "Standard_D32s_v3";
    EligibleVmSize["Standard_D48s_v3"] = "Standard_D48s_v3";
    EligibleVmSize["Standard_D64s_v3"] = "Standard_D64s_v3";
    EligibleVmSize["Standard_E2s_v3"] = "Standard_E2s_v3";
    EligibleVmSize["Standard_E4s_v3"] = "Standard_E4s_v3";
    EligibleVmSize["Standard_E8s_v3"] = "Standard_E8s_v3";
    EligibleVmSize["Standard_E16s_v3"] = "Standard_E16s_v3";
    EligibleVmSize["Standard_E32s_v3"] = "Standard_E32s_v3";
    EligibleVmSize["Standard_E48s_v3"] = "Standard_E48s_v3";
    EligibleVmSize["Standard_E64s_v3"] = "Standard_E64s_v3";
})(EligibleVmSize || (exports.EligibleVmSize = EligibleVmSize = {}));
/**
 * Manages Azure Hybrid Benefit configuration and validation
 */
class HybridBenefitManager {
    config;
    /**
     * Windows Server base costs per core (USD/month)
     * Based on Azure pricing for Windows Server license premium
     */
    static WINDOWS_SERVER_COST_PER_CORE = 4.50;
    /**
     * SQL Server license costs per core (USD/month)
     */
    static SQL_ENTERPRISE_COST_PER_CORE = 145.00;
    static SQL_STANDARD_COST_PER_CORE = 36.25;
    /**
     * Minimum core requirements for SQL Server licenses
     */
    static SQL_ENTERPRISE_MIN_CORES = 4;
    static SQL_STANDARD_MIN_CORES = 4;
    /**
     * VM size to core count mapping
     */
    static VM_CORES = {
        'Standard_D2s_v3': 2,
        'Standard_D4s_v3': 4,
        'Standard_D8s_v3': 8,
        'Standard_D16s_v3': 16,
        'Standard_D32s_v3': 32,
        'Standard_D48s_v3': 48,
        'Standard_D64s_v3': 64,
        'Standard_E2s_v3': 2,
        'Standard_E4s_v3': 4,
        'Standard_E8s_v3': 8,
        'Standard_E16s_v3': 16,
        'Standard_E32s_v3': 32,
        'Standard_E48s_v3': 48,
        'Standard_E64s_v3': 64,
        'Standard_B2s': 2,
        'Standard_B4ms': 4,
        'Standard_F2s_v2': 2,
        'Standard_F4s_v2': 4,
        'Standard_F8s_v2': 8
    };
    constructor(config) {
        this.config = config;
    }
    /**
     * Validate hybrid benefit configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
        // Validate VM name
        if (!this.config.vmName || this.config.vmName.trim().length === 0) {
            errors.push('VM name is required');
        }
        // Validate VM size
        if (!this.config.vmSize || this.config.vmSize.trim().length === 0) {
            errors.push('VM size is required');
        }
        else if (!HybridBenefitManager.VM_CORES[this.config.vmSize]) {
            warnings.push(`VM size ${this.config.vmSize} is not in the known list - core count may be inaccurate`);
        }
        // Validate OS type
        if (this.config.osType !== 'Windows' && this.config.osType !== 'Linux') {
            errors.push('OS type must be Windows or Linux');
        }
        // Validate license type for OS
        if (this.config.osType === 'Linux' && this.config.licenseType !== LicenseType.None) {
            if (!this.config.hasSqlServer) {
                errors.push('Azure Hybrid Benefit is only available for Windows VMs (or Linux with SQL Server)');
            }
        }
        // Validate Windows license types
        if (this.config.osType === 'Windows') {
            if (this.config.licenseType === LicenseType.None) {
                warnings.push('Windows VM without Hybrid Benefit - consider enabling to save costs');
            }
            else if (this.config.licenseType !== LicenseType.WindowsServer &&
                this.config.licenseType !== LicenseType.WindowsClient &&
                !this.config.hasSqlServer) {
                errors.push('Invalid license type for Windows VM without SQL Server');
            }
        }
        // Validate SQL Server configuration
        if (this.config.hasSqlServer) {
            if (!this.config.sqlServerEdition) {
                errors.push('SQL Server edition is required when hasSqlServer is true');
            }
            const cores = this.getCoreCount();
            if (this.config.sqlServerEdition === 'Enterprise' && cores < HybridBenefitManager.SQL_ENTERPRISE_MIN_CORES) {
                errors.push(`SQL Server Enterprise requires minimum ${HybridBenefitManager.SQL_ENTERPRISE_MIN_CORES} cores`);
            }
            if (this.config.sqlServerEdition === 'Standard' && cores < HybridBenefitManager.SQL_STANDARD_MIN_CORES) {
                errors.push(`SQL Server Standard requires minimum ${HybridBenefitManager.SQL_STANDARD_MIN_CORES} cores`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Get the number of cores for the configured VM size
     */
    getCoreCount() {
        return HybridBenefitManager.VM_CORES[this.config.vmSize] || 2;
    }
    /**
     * Get license requirements for the current configuration
     */
    getLicenseRequirements() {
        const requirements = [];
        const cores = this.getCoreCount();
        // Windows Server license requirement
        if (this.config.osType === 'Windows' &&
            (this.config.licenseType === LicenseType.WindowsServer ||
                this.config.licenseType === LicenseType.WindowsClient)) {
            // Windows Server requires minimum 8-core or 16-core licenses
            const minCores = 8;
            const licensesNeeded = Math.max(1, Math.ceil(cores / 16));
            requirements.push({
                coresRequired: Math.max(cores, minCores),
                licenseType: this.config.licenseType,
                minimumLicenses: licensesNeeded,
                description: `${this.config.licenseType === LicenseType.WindowsServer ? 'Windows Server' : 'Windows Client'} license with Software Assurance covering ${Math.max(cores, minCores)} cores (minimum ${licensesNeeded} x 16-core license${licensesNeeded > 1 ? 's' : ''})`
            });
        }
        // SQL Server license requirement
        if (this.config.hasSqlServer && this.config.sqlServerEdition) {
            const minCores = this.config.sqlServerEdition === 'Enterprise'
                ? HybridBenefitManager.SQL_ENTERPRISE_MIN_CORES
                : HybridBenefitManager.SQL_STANDARD_MIN_CORES;
            const licensesNeeded = Math.max(1, Math.ceil(cores / 2)); // SQL licenses are typically 2-core packs
            requirements.push({
                coresRequired: Math.max(cores, minCores),
                licenseType: LicenseType.SqlServerEnterprise,
                minimumLicenses: licensesNeeded,
                description: `SQL Server ${this.config.sqlServerEdition} license with Software Assurance covering ${Math.max(cores, minCores)} cores (minimum ${licensesNeeded} x 2-core license${licensesNeeded > 1 ? 's' : ''})`
            });
        }
        return requirements;
    }
    /**
     * Calculate cost savings from hybrid benefit
     */
    calculateSavings() {
        const cores = this.getCoreCount();
        let paygMonthlyCost = 0;
        let hybridBenefitMonthlyCost = 0;
        // Windows Server cost savings
        if (this.config.osType === 'Windows' &&
            (this.config.licenseType === LicenseType.WindowsServer ||
                this.config.licenseType === LicenseType.WindowsClient)) {
            const windowsCost = cores * HybridBenefitManager.WINDOWS_SERVER_COST_PER_CORE;
            paygMonthlyCost += windowsCost;
            // Hybrid benefit eliminates Windows license cost
        }
        // SQL Server cost savings
        if (this.config.hasSqlServer && this.config.sqlServerEdition) {
            const sqlCostPerCore = this.config.sqlServerEdition === 'Enterprise'
                ? HybridBenefitManager.SQL_ENTERPRISE_COST_PER_CORE
                : HybridBenefitManager.SQL_STANDARD_COST_PER_CORE;
            const minCores = this.config.sqlServerEdition === 'Enterprise'
                ? HybridBenefitManager.SQL_ENTERPRISE_MIN_CORES
                : HybridBenefitManager.SQL_STANDARD_MIN_CORES;
            const sqlCost = Math.max(cores, minCores) * sqlCostPerCore;
            paygMonthlyCost += sqlCost;
            // Hybrid benefit eliminates SQL license cost
        }
        const monthlySavings = paygMonthlyCost - hybridBenefitMonthlyCost;
        const annualSavings = monthlySavings * 12;
        const savingsPercent = paygMonthlyCost > 0 ? (monthlySavings / paygMonthlyCost) * 100 : 0;
        return {
            paygMonthlyCost,
            hybridBenefitMonthlyCost,
            monthlySavings,
            annualSavings,
            savingsPercent,
            currency: 'USD'
        };
    }
    /**
     * Generate ARM template properties for hybrid benefit
     */
    toARMTemplate() {
        const template = {
            licenseType: this.config.licenseType
        };
        // Add SQL Server configuration if applicable
        if (this.config.hasSqlServer && this.config.sqlServerEdition) {
            template.sqlServerLicenseType = LicenseType.SqlServerEnterprise;
            template.sqlServerEdition = this.config.sqlServerEdition;
        }
        return template;
    }
    /**
     * Get configuration summary
     */
    getSummary() {
        const cores = this.getCoreCount();
        const requirements = this.getLicenseRequirements();
        const savings = this.calculateSavings();
        let summary = `Azure Hybrid Benefit Configuration\n`;
        summary += `=====================================\n\n`;
        summary += `VM Name: ${this.config.vmName}\n`;
        summary += `VM Size: ${this.config.vmSize} (${cores} cores)\n`;
        summary += `OS Type: ${this.config.osType}\n`;
        summary += `License Type: ${this.config.licenseType}\n`;
        if (this.config.hasSqlServer) {
            summary += `SQL Server: ${this.config.sqlServerEdition}\n`;
        }
        summary += `\nLicense Requirements:\n`;
        if (requirements.length === 0) {
            summary += `  No hybrid benefit licenses required\n`;
        }
        else {
            requirements.forEach((req, index) => {
                summary += `  ${index + 1}. ${req.description}\n`;
            });
        }
        summary += `\nCost Savings:\n`;
        summary += `  Pay-as-you-go: $${savings.paygMonthlyCost.toFixed(2)}/month\n`;
        summary += `  With Hybrid Benefit: $${savings.hybridBenefitMonthlyCost.toFixed(2)}/month\n`;
        summary += `  Monthly Savings: $${savings.monthlySavings.toFixed(2)} (${savings.savingsPercent.toFixed(1)}%)\n`;
        summary += `  Annual Savings: $${savings.annualSavings.toFixed(2)}\n`;
        return summary;
    }
    /**
     * Check if a VM size is eligible for hybrid benefit
     */
    static isEligibleVmSize(vmSize) {
        return vmSize in HybridBenefitManager.VM_CORES;
    }
    /**
     * Get all eligible VM sizes
     */
    static getEligibleVmSizes() {
        return Object.keys(HybridBenefitManager.VM_CORES);
    }
    /**
     * Calculate potential savings for a VM size
     */
    static estimateSavings(vmSize, osType, hasSqlServer = false, sqlServerEdition) {
        const config = {
            vmName: 'estimate',
            vmSize,
            osType,
            licenseType: osType === 'Windows' ? LicenseType.WindowsServer : LicenseType.None,
            hasSqlServer,
            sqlServerEdition
        };
        const manager = new HybridBenefitManager(config);
        return manager.calculateSavings();
    }
}
exports.HybridBenefitManager = HybridBenefitManager;
