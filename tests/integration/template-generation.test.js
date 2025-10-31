#!/usr/bin/env node
/**
 * Test template generation with all P1 features enabled
 */

const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

async function testTemplateGeneration() {
    console.log('🧪 Testing Template Generation with P1 Features\n');
    
    try {
        // Load the VM plugin
        const { VmPlugin } = require('./dist/index');
        
        // Initialize plugin
        const mockContext = {
            logger: {
                info: console.log,
                error: console.error,
                warn: console.warn,
                debug: console.log
            }
        };
        
        const vmPlugin = new VmPlugin();
        await vmPlugin.initialize(mockContext);
        
        // Get template definition
        const templates = vmPlugin.getTemplates();
        const vmTemplate = templates[0];
        
        console.log('1️⃣  Template Definition:');
        console.log(`   Name: ${vmTemplate.name}`);
        console.log(`   Version: ${vmTemplate.version}`);
        console.log(`   Template Path: ${vmTemplate.templatePath}`);
        
        // Check if template files exist
        const templatePath = vmTemplate.templatePath;
        const mainTemplatePath = path.join(templatePath, vmTemplate.files.mainTemplate);
        const createUiPath = path.join(templatePath, vmTemplate.files.createUiDefinition);
        
        console.log('\n2️⃣  Template Files Check:');
        
        try {
            await fs.access(mainTemplatePath);
            console.log(`   ✅ Main Template: ${vmTemplate.files.mainTemplate} exists`);
        } catch (e) {
            console.log(`   ❌ Main Template: ${vmTemplate.files.mainTemplate} missing`);
        }
        
        try {
            await fs.access(createUiPath);
            console.log(`   ✅ CreateUI Template: ${vmTemplate.files.createUiDefinition} exists`);
        } catch (e) {
            console.log(`   ❌ CreateUI Template: ${vmTemplate.files.createUiDefinition} missing`);
        }
        
        // Test template compilation with P1 features
        console.log('\n3️⃣  Testing Template Compilation with P1 Features:');
        
        try {
            const mainTemplateContent = await fs.readFile(mainTemplatePath, 'utf8');
            const template = Handlebars.compile(mainTemplateContent);
            
            // Template data with all P1 features enabled
            const templateData = {
                // Basic VM config
                vmName: 'test-vm',
                vmSize: 'Standard_D2s_v3',
                adminUsername: 'azureuser',
                authenticationType: 'sshPublicKey',
                adminPasswordOrKey: 'ssh-rsa AAAAB...',
                location: 'eastus',
                osType: 'Linux',
                
                // P1-1: Disk Type Selection
                osDiskType: 'Premium_LRS',
                storageType: 'Premium_LRS',
                diskSizeGB: 128,
                
                // P1-2: Backup Auto-Enable
                enableBackup: true,
                backupPolicyName: 'DefaultPolicy',
                backupVaultName: 'test-vault',
                
                // P1-3: Data Disk Support
                enableDataDisks: true,
                dataDiskCount: 2,
                dataDisks: [
                    { name: 'datadisk1', sizeGB: 256, storageAccountType: 'Premium_LRS', lun: 0 },
                    { name: 'datadisk2', sizeGB: 512, storageAccountType: 'Standard_LRS', lun: 1 }
                ],
                
                // P1-4: Monitoring & Alerts
                installMonitoringExtension: true,
                enableAlerts: true,
                installExtensions: true,
                
                // P1-5: Azure Hybrid Benefit
                enableHybridBenefit: true,
                licenseType: 'RHEL_BYOS',
                
                // General options
                enableManagedIdentity: true,
                useAvailabilityZones: true,
                createPublicIP: true
            };
            
            // Compile template
            const compiledTemplate = template(templateData);
            
            // Parse the generated JSON to validate it
            const generatedTemplate = JSON.parse(compiledTemplate);
            
            console.log('   ✅ Template compilation successful');
            console.log(`   ✅ Generated template has ${Object.keys(generatedTemplate.resources || {}).length} resources`);
            
            // Check for P1 features in generated template
            const resources = generatedTemplate.resources || [];
            const parameters = generatedTemplate.parameters || {};
            const resourceTypes = resources.map(r => r.type);
            
            // P1-1: Check for disk type parameters and Premium_LRS usage
            const hasDiskTypeParams = Object.keys(parameters).some(param => 
                param.toLowerCase().includes('disk') && param.toLowerCase().includes('type') ||
                param.toLowerCase().includes('storage')
            );
            const hasPremiumDisk = JSON.stringify(generatedTemplate).includes('Premium_LRS');
            console.log(`   P1-1 Disk Types: ${(hasDiskTypeParams || hasPremiumDisk) ? '✅' : '❌'}`);
            
            // P1-2: Check for backup vault
            const hasBackupVault = resourceTypes.includes('Microsoft.RecoveryServices/vaults');
            console.log(`   P1-2 Backup Vault: ${hasBackupVault ? '✅' : '❌'}`);
            
            // P1-4: Check for monitoring/alerts
            const hasMonitoring = resourceTypes.some(type => 
                type.includes('Microsoft.Insights') || 
                type.includes('Monitor') ||
                type.includes('microsoft.compute/virtualmachines/extensions')
            );
            console.log(`   P1-4 Monitoring: ${hasMonitoring ? '✅' : '❌'}`);
            
            // Check VM resource configuration
            const vmResource = resources.find(r => r.type === 'Microsoft.Compute/virtualMachines');
            if (vmResource) {
                console.log('   ✅ VM resource found in template');
                
                // P1-5: Check for hybrid benefit (license type)
                const hasHybridBenefit = vmResource.properties?.licenseType !== undefined ||
                    JSON.stringify(generatedTemplate).includes('licenseType') ||
                    JSON.stringify(generatedTemplate).includes('RHEL_BYOS');
                console.log(`   P1-5 Hybrid Benefit: ${hasHybridBenefit ? '✅' : '❌'}`);
                
                // P1-3: Check for data disks configuration
                const hasDataDisks = vmResource.properties?.storageProfile?.dataDisks?.length > 0 ||
                    Object.keys(parameters).some(param => param.toLowerCase().includes('datadisk')) ||
                    JSON.stringify(generatedTemplate).includes('dataDisk');
                console.log(`   P1-3 Data Disks: ${hasDataDisks ? '✅' : '❌'}`);
            }
            
            // Save generated template for inspection
            await fs.writeFile('./test-generated-template.json', JSON.stringify(generatedTemplate, null, 2));
            console.log('   ✅ Generated template saved to test-generated-template.json');
            
        } catch (e) {
            console.log(`   ❌ Template compilation failed: ${e.message}`);
        }
        
        // Test CreateUI template
        console.log('\n4️⃣  Testing CreateUI Template:');
        
        try {
            const createUiContent = await fs.readFile(createUiPath, 'utf8');
            const createUiTemplate = Handlebars.compile(createUiContent);
            
            const createUiData = {
                // UI configuration for P1 features
                showDiskTypeOptions: true,
                showBackupOptions: true,
                showDataDiskOptions: true,
                showMonitoringOptions: true,
                showHybridBenefitOptions: true
            };
            
            const compiledCreateUi = createUiTemplate(createUiData);
            const generatedCreateUi = JSON.parse(compiledCreateUi);
            
            console.log('   ✅ CreateUI template compilation successful');
            
            // Check for P1 UI elements
            const steps = generatedCreateUi.parameters?.steps || [];
            const controls = steps.flatMap(step => step.elements || []);
            
            console.log(`   ✅ CreateUI has ${steps.length} steps and ${controls.length} controls`);
            
            // Save CreateUI for inspection
            await fs.writeFile('./test-generated-createui.json', JSON.stringify(generatedCreateUi, null, 2));
            console.log('   ✅ Generated CreateUI saved to test-generated-createui.json');
            
        } catch (e) {
            console.log(`   ❌ CreateUI compilation failed: ${e.message}`);
        }
        
        console.log('\n5️⃣  Template Validation:');
        
        // Basic ARM template validation
        try {
            const templateContent = await fs.readFile('./test-generated-template.json', 'utf8');
            const template = JSON.parse(templateContent);
            
            // Check required ARM template properties
            const hasSchema = template.$schema !== undefined;
            const hasContentVersion = template.contentVersion !== undefined;
            const hasResources = Array.isArray(template.resources);
            const hasParameters = template.parameters !== undefined;
            
            console.log(`   Schema: ${hasSchema ? '✅' : '❌'}`);
            console.log(`   Content Version: ${hasContentVersion ? '✅' : '❌'}`);
            console.log(`   Resources Array: ${hasResources ? '✅' : '❌'}`);
            console.log(`   Parameters: ${hasParameters ? '✅' : '❌'}`);
            
            if (hasSchema && hasContentVersion && hasResources && hasParameters) {
                console.log('   ✅ Template structure is valid ARM template');
            } else {
                console.log('   ❌ Template structure has issues');
            }
            
        } catch (e) {
            console.log(`   ❌ Template validation failed: ${e.message}`);
        }
        
        await vmPlugin.cleanup();
        
        console.log('\n🎉 Template Generation Test Complete!');
        console.log('📁 Generated files:');
        console.log('   - test-generated-template.json (ARM template)');
        console.log('   - test-generated-createui.json (Portal UI definition)');
        
    } catch (error) {
        console.error('\n💥 Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testTemplateGeneration().catch(console.error);
}

module.exports = { testTemplateGeneration };