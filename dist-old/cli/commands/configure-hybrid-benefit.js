"use strict";
/**
 * CLI command for configuring Azure Hybrid Benefit
 */
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const hybrid_benefit_1 = require("../../azure/hybrid-benefit");
const configureHybridBenefitCommand = new commander_1.Command('configure-hybrid-benefit')
    .description('Configure Azure Hybrid Benefit for Windows Server and SQL Server VMs')
    .option('--vm-name <name>', 'Name of the virtual machine')
    .option('--vm-size <size>', 'Azure VM size (e.g., Standard_D4s_v3)')
    .option('--os-type <type>', 'Operating system type: Windows or Linux')
    .option('--license-type <type>', 'License type: None, Windows_Server, Windows_Client')
    .option('--sql-server', 'Enable SQL Server license')
    .option('--sql-edition <edition>', 'SQL Server edition: Enterprise or Standard')
    .option('--region <region>', 'Azure region for pricing estimates')
    .option('--estimate-only', 'Only show cost estimates without validation')
    .option('--list-sizes', 'List eligible VM sizes for hybrid benefit')
    .option('--validate', 'Validate configuration without generating output')
    .option('--output <format>', 'Output format: json, text, or arm (default: text)')
    .action(async (options) => {
    try {
        // List eligible VM sizes
        if (options.listSizes) {
            const sizes = hybrid_benefit_1.HybridBenefitManager.getEligibleVmSizes();
            console.log('\nEligible VM Sizes for Azure Hybrid Benefit:');
            console.log('===========================================\n');
            sizes.forEach((size) => {
                const manager = new hybrid_benefit_1.HybridBenefitManager({
                    vmName: 'estimate',
                    vmSize: size,
                    osType: 'Windows',
                    licenseType: hybrid_benefit_1.LicenseType.WindowsServer
                });
                const cores = manager.getCoreCount();
                console.log(`  ${size} (${cores} cores)`);
            });
            console.log('');
            return;
        }
        // Estimate-only mode
        if (options.estimateOnly) {
            if (!options.vmSize || !options.osType) {
                console.error('Error: --vm-size and --os-type are required for estimates');
                process.exit(1);
            }
            const hasSqlServer = options.sqlServer === true;
            const sqlServerEdition = options.sqlEdition;
            const savings = hybrid_benefit_1.HybridBenefitManager.estimateSavings(options.vmSize, options.osType, hasSqlServer, sqlServerEdition);
            if (options.output === 'json') {
                console.log(JSON.stringify(savings, null, 2));
            }
            else {
                console.log('\nCost Savings Estimate');
                console.log('=====================\n');
                console.log(`VM Size: ${options.vmSize}`);
                console.log(`OS Type: ${options.osType}`);
                if (hasSqlServer) {
                    console.log(`SQL Server: ${sqlServerEdition || 'Not specified'}`);
                }
                console.log('');
                console.log(`Pay-as-you-go Cost: $${savings.paygMonthlyCost.toFixed(2)}/month`);
                console.log(`With Hybrid Benefit: $${savings.hybridBenefitMonthlyCost.toFixed(2)}/month`);
                console.log(`Monthly Savings: $${savings.monthlySavings.toFixed(2)} (${savings.savingsPercent.toFixed(1)}%)`);
                console.log(`Annual Savings: $${savings.annualSavings.toFixed(2)}`);
                console.log('');
            }
            return;
        }
        // Validate required options for full configuration
        if (!options.vmName) {
            console.error('Error: --vm-name is required');
            process.exit(1);
        }
        if (!options.vmSize) {
            console.error('Error: --vm-size is required');
            process.exit(1);
        }
        if (!options.osType) {
            console.error('Error: --os-type is required (Windows or Linux)');
            process.exit(1);
        }
        if (!options.licenseType) {
            console.error('Error: --license-type is required');
            console.error('Valid values: None, Windows_Server, Windows_Client');
            process.exit(1);
        }
        // Validate OS type
        if (options.osType !== 'Windows' && options.osType !== 'Linux') {
            console.error('Error: --os-type must be Windows or Linux');
            process.exit(1);
        }
        // Validate license type
        const validLicenseTypes = ['None', 'Windows_Server', 'Windows_Client'];
        if (!validLicenseTypes.includes(options.licenseType)) {
            console.error(`Error: --license-type must be one of: ${validLicenseTypes.join(', ')}`);
            process.exit(1);
        }
        // Validate SQL Server configuration
        if (options.sqlServer && !options.sqlEdition) {
            console.error('Error: --sql-edition is required when --sql-server is enabled');
            console.error('Valid values: Enterprise, Standard');
            process.exit(1);
        }
        if (options.sqlEdition && !options.sqlServer) {
            console.warn('Warning: --sql-edition specified but --sql-server not enabled');
        }
        if (options.sqlEdition && !['Enterprise', 'Standard'].includes(options.sqlEdition)) {
            console.error('Error: --sql-edition must be Enterprise or Standard');
            process.exit(1);
        }
        // Create configuration
        const config = {
            vmName: options.vmName,
            vmSize: options.vmSize,
            osType: options.osType,
            licenseType: hybrid_benefit_1.LicenseType[options.licenseType.replace('_', '')],
            hasSqlServer: options.sqlServer === true,
            sqlServerEdition: options.sqlEdition,
            region: options.region
        };
        // Create manager instance
        const manager = new hybrid_benefit_1.HybridBenefitManager(config);
        // Validate configuration
        const validation = manager.validate();
        if (!validation.isValid) {
            console.error('\nValidation Errors:');
            validation.errors.forEach((error) => {
                console.error(`  ✗ ${error}`);
            });
            process.exit(1);
        }
        if (validation.warnings.length > 0) {
            console.warn('\nValidation Warnings:');
            validation.warnings.forEach((warning) => {
                console.warn(`  ⚠ ${warning}`);
            });
            console.warn('');
        }
        // Validate-only mode
        if (options.validate) {
            console.log('\n✓ Configuration is valid\n');
            if (validation.warnings.length === 0) {
                console.log('No warnings');
            }
            return;
        }
        // Generate output based on format
        const outputFormat = options.output || 'text';
        switch (outputFormat) {
            case 'json':
                const jsonOutput = {
                    configuration: config,
                    validation: validation,
                    licenseRequirements: manager.getLicenseRequirements(),
                    costSavings: manager.calculateSavings(),
                    armTemplate: manager.toARMTemplate()
                };
                console.log(JSON.stringify(jsonOutput, null, 2));
                break;
            case 'arm':
                const armTemplate = manager.toARMTemplate();
                console.log(JSON.stringify(armTemplate, null, 2));
                break;
            case 'text':
            default:
                const summary = manager.getSummary();
                console.log('\n' + summary);
                break;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${errorMessage}`);
        process.exit(1);
    }
});
exports.default = configureHybridBenefitCommand;
