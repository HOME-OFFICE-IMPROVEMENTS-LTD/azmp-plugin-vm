// High Availability CLI commands for azmp plugin
// Provides regional validation, PPG checking, and HA configuration helpers

import { Command } from "commander";
import { ProximityPlacementGroupCLI } from "../highavailability/ppg";
import { HighAvailabilityCLI } from "../highavailability/cluster";
import { LoadBalancerCLI } from "../highavailability/loadbalancer";

/**
 * Register HA CLI commands with parent VM command
 */
export function registerHACommands(parentCommand: Command): void {
  const haCommand = parentCommand
    .command('ha')
    .description('High Availability cluster management commands');

  // Check region capability
  haCommand
    .command('check-region <region>')
    .description('Validate region support for PPG and availability zones')
    .action((region: string) => {
      try {
        ProximityPlacementGroupCLI.checkRegion(region);
      } catch (error) {
        console.error(`❌ Error checking region: ${error}`);
        process.exit(1);
      }
    });

  // List supported regions
  haCommand
    .command('list-regions')
    .description('List all Azure regions with PPG and zone support')
    .action(() => {
      try {
        ProximityPlacementGroupCLI.listSupportedRegions();
      } catch (error) {
        console.error(`❌ Error listing regions: ${error}`);
        process.exit(1);
      }
    });

  // Validate VM size for region
  haCommand
    .command('check-vm-size <vmSize> <region>')
    .description('Validate VM size compatibility with PPG in specific region')
    .action((vmSize: string, region: string) => {
      try {
        ProximityPlacementGroupCLI.validateVmSize(vmSize, region);
      } catch (error) {
        console.error(`❌ Error validating VM size: ${error}`);
        process.exit(1);
      }
    });

  // Validate HA configuration
  haCommand
    .command('validate <configFile>')
    .description('Validate HA configuration file')
    .action((configFile: string) => {
      try {
        // TODO: Implement config file validation
        console.log(`🔍 Validating HA configuration: ${configFile}`);
        console.log('⚠️  Configuration validation not yet implemented');
        HighAvailabilityCLI.listExamples();
      } catch (error) {
        console.error(`❌ Error validating configuration: ${error}`);
        process.exit(1);
      }
    });

  // List HA examples
  haCommand
    .command('examples')
    .description('List available HA configuration examples')
    .action(() => {
      try {
        HighAvailabilityCLI.listExamples();
      } catch (error) {
        console.error(`❌ Error listing examples: ${error}`);
        process.exit(1);
      }
    });
  
  // Best practices
  haCommand
    .command('best-practices')
    .description('Show HA best practices and recommendations')
    .action(() => {
      try {
        HighAvailabilityCLI.showBestPractices();
      } catch (error) {
        console.error(`❌ Error showing best practices: ${error}`);
        process.exit(1);
      }
    });

  // PPG planning helper
  haCommand
    .command('plan-ppg')
    .description('Interactive PPG planning wizard')
    .option('-r, --region <region>', 'Target Azure region')
    .option('-s, --vm-size <size>', 'Planned VM size')
    .option('-c, --instance-count <count>', 'Expected instance count', '3')
    .action((options) => {
      try {
        console.log('\n🏗️  Proximity Placement Group Planning');
        console.log('='.repeat(50));

        if (options.region) {
          console.log(`📍 Target Region: ${options.region}`);
          ProximityPlacementGroupCLI.checkRegion(options.region);
        }

        if (options.vmSize && options.region) {
          ProximityPlacementGroupCLI.validateVmSize(options.vmSize, options.region);
        }

        console.log(`\n🔢 Planned Instance Count: ${options.instanceCount}`);

        if (parseInt(options.instanceCount) < 2) {
          console.log('⚠️  Consider at least 2 instances for HA benefits');
        }

        console.log('\n💡 Next Steps:');
        console.log('   1. Choose a supported region with 2+ zones');
        console.log('   2. Select compatible VM sizes from recommended list');
        console.log('   3. Use azmp vm template generate with HA configuration');

      } catch (error) {
        console.error(`❌ Error planning PPG: ${error}`);
        process.exit(1);
      }
    });

  // Load balancer planning helper
  haCommand
    .command('plan-lb')
    .description('Interactive load balancer planning wizard')
    .option('-t, --type <type>', 'Load balancer type (public|internal)', 'public')
    .option('-s, --sku <sku>', 'Load balancer SKU (Basic|Standard)', 'Standard')
    .option('-p, --port <port>', 'Application port', '80')
    .option('--health-port <port>', 'Health probe port')
    .option('--health-path <path>', 'Health probe path (for HTTP)', '/health')
    .action((options) => {
      try {
        console.log('\n⚖️  Load Balancer Planning');
        console.log('='.repeat(40));
        
        console.log(`📊 Type: ${options.type} | SKU: ${options.sku}`);
        console.log(`🔌 Application Port: ${options.port}`);
        
        if (options.healthPort) {
          console.log(`❤️  Health Probe: Port ${options.healthPort}`);
        } else {
          console.log(`❤️  Health Probe: Port ${options.port} (same as app)`);
        }
        
        if (options.type === 'public') {
          console.log('🌐 Frontend: Public IP with DNS label');
        } else {
          console.log('🔒 Frontend: Internal subnet IP (static/dynamic)');
        }
        
        console.log('\n📋 Configuration Summary:');
        console.log(`   • Frontend Port: ${options.port}`);
        console.log(`   • Backend Port: ${options.port}`);
        console.log(`   • Protocol: TCP`);
        
        if (options.healthPath && options.port === '80') {
          console.log(`   • Health Probe: HTTP ${options.healthPath}`);
        } else {
          console.log(`   • Health Probe: TCP`);
        }
        
        console.log('\n💡 Next Steps:');
        console.log('   1. Review load balancer best practices');
        console.log('   2. Configure backend pools for VMs/VMSS');
        console.log('   3. Set up health probe endpoints');
        console.log('   4. Test failover scenarios');
        
      } catch (error) {
        console.error(`❌ Error planning load balancer: ${error}`);
        process.exit(1);
      }
    });

  // Load balancer best practices
  haCommand
    .command('lb-best-practices')
    .description('Show load balancer best practices and recommendations')
    .action(() => {
      try {
        LoadBalancerCLI.showBestPractices();
      } catch (error) {
        console.error(`❌ Error showing LB best practices: ${error}`);
        process.exit(1);
      }
    });

  // Load balancer examples
  haCommand
    .command('lb-examples')
    .description('Show load balancer configuration examples')
    .action(() => {
      try {
        LoadBalancerCLI.showExamples();
      } catch (error) {
        console.error(`❌ Error showing LB examples: ${error}`);
        process.exit(1);
      }
    });

  // VMSS planning helper
  haCommand
    .command('plan-vmss')
    .description('Interactive VMSS planning wizard')
    .option('-s, --vm-size <size>', 'VM size for scale set instances', 'Standard_D2s_v3')
    .option('--min <count>', 'Minimum instance count', '2')
    .option('--max <count>', 'Maximum instance count', '10')
    .option('--default <count>', 'Default instance count', '3')
    .option('-z, --zones <zones>', 'Availability zones (comma-separated)', '1,2,3')
    .option('--upgrade-policy <policy>', 'Upgrade policy (Manual|Automatic|Rolling)', 'Rolling')
    .action((options) => {
      try {
        console.log('\n📊 VMSS Planning');
        console.log('='.repeat(40));
        
        const zones = options.zones.split(',').map((z: string) => z.trim());
        const minCount = parseInt(options.min);
        const maxCount = parseInt(options.max);
        const defaultCount = parseInt(options.default);
        
        console.log(`🖥️  VM Size: ${options.vmSize}`);
        console.log(`📈 Instance Range: ${minCount} - ${maxCount} (default: ${defaultCount})`);
        console.log(`🌍 Zones: ${zones.join(', ')}`);
        console.log(`🔄 Upgrade Policy: ${options.upgradePolicy}`);
        
        console.log('\n🔧 Recommended Configuration:');
        console.log(`   • Platform Fault Domains: ${zones.length > 1 ? '1 (multi-zone)' : '2-3 (single-zone)'}`);
        console.log(`   • Single Placement Group: ${maxCount > 100 ? 'false (large scale)' : 'true'}`);
        console.log('   • Over Provisioning: true (faster scaling)');
        console.log('   • Automatic Repairs: enabled with 30min grace period');
        
        console.log('\n⚖️  Load Balancer Integration:');
        console.log('   • Backend Pool: Automatic VMSS instance registration');
        console.log('   • Health Probes: TCP or HTTP based on application');
        console.log('   • Session Affinity: Configure based on application needs');
        
        console.log('\n📈 Autoscale Recommendations:');
        console.log('   • CPU Threshold: Scale out at 70%, scale in at 30%');
        console.log('   • Cooldown: 5 minutes for scale out, 15 minutes for scale in');
        console.log('   • Scale Action: Add/remove 1 instance per trigger');
        
        console.log('\n💡 Next Steps:');
        console.log('   1. Configure application health extension');
        console.log('   2. Set up autoscale rules');
        console.log('   3. Test scaling behavior');
        console.log('   4. Validate load balancer integration');
        
      } catch (error) {
        console.error(`❌ Error planning VMSS: ${error}`);
        process.exit(1);
      }
    });

  // VMSS best practices
  haCommand
    .command('vmss-best-practices')
    .description('VMSS configuration best practices and guidelines')
    .action(() => {
      try {
        const { VmssCLI } = require('../highavailability/vmss');
        const practices = VmssCLI.getVmssBestPractices();
        
        console.log('\n🏆 VMSS Best Practices');
        console.log('='.repeat(50));
        practices.forEach((practice: string) => console.log(practice));
        
      } catch (error) {
        console.error(`❌ Error showing VMSS best practices: ${error}`);
        process.exit(1);
      }
    });

  // VMSS configuration examples
  haCommand
    .command('vmss-examples')
    .description('Common VMSS configuration examples')
    .action(() => {
      try {
        const { VmssCLI } = require('../highavailability/vmss');
        const examples = VmssCLI.getVmssExamples();
        const autoscaleExamples = VmssCLI.getAutoscaleExamples();
        
        console.log('\n📋 VMSS Configuration Examples');
        console.log('='.repeat(50));
        
        examples.forEach((example: any, index: number) => {
          console.log(`\n${index + 1}. ${example.name}`);
          console.log(`   ${example.description}`);
          console.log(`   VM Size: ${example.config.vmSize}`);
          console.log(`   Instance Range: ${example.config.instanceCount?.min}-${example.config.instanceCount?.max}`);
          console.log(`   Zones: ${example.config.zones?.join(', ') || 'Single zone'}`);
          console.log(`   Upgrade Policy: ${example.config.upgradePolicy}`);
        });
        
        console.log('\n📈 Autoscale Examples');
        console.log('='.repeat(30));
        
        autoscaleExamples.forEach((example: any, index: number) => {
          console.log(`\n${index + 1}. ${example.name}`);
          console.log(`   ${example.description}`);
          console.log(`   Profiles: ${example.config.profiles?.length || 0}`);
        });
        
      } catch (error) {
        console.error(`❌ Error showing VMSS examples: ${error}`);
        process.exit(1);
      }
    });

  // Health extension planning helper
  haCommand
    .command('plan-health')
    .description('Interactive health extension planning wizard')
    .option('-p, --protocol <protocol>', 'Health probe protocol (http|https|tcp)', 'http')
    .option('--port <port>', 'Health probe port', '80')
    .option('--path <path>', 'Health probe path (for HTTP/HTTPS)', '/health')
    .option('--interval <seconds>', 'Health probe interval in seconds', '30')
    .option('--grace-period <duration>', 'Grace period for health monitoring', 'PT30M')
    .action((options) => {
      try {
        console.log('\n🏥 Health Extension Planning');
        console.log('='.repeat(40));
        
        console.log(`💊 Protocol: ${options.protocol.toUpperCase()}`);
        console.log(`🔌 Port: ${options.port}`);
        
        if (options.protocol !== 'tcp') {
          console.log(`📍 Health Path: ${options.path}`);
        }
        
        console.log(`⏱️  Probe Interval: ${options.interval} seconds`);
        console.log(`⏰ Grace Period: ${options.gracePeriod}`);
        
        console.log('\n🔧 Recommended Configuration:');
        console.log('   • Automatic Repairs: Enabled with 15-30 minute grace period');
        console.log('   • Repair Action: Replace for stateless apps, Restart for recoverable issues');
        console.log('   • Max Repair Percentage: 20-30% to prevent cascading failures');
        console.log('   • Load Balancer Correlation: Align with LB health probe settings');
        
        console.log('\n🎯 Health Endpoint Best Practices:');
        if (options.protocol === 'tcp') {
          console.log('   • Ensure service is listening on the specified port');
          console.log('   • TCP probe checks connectivity only, not application health');
          console.log('   • Consider custom health probes for application-level checks');
        } else {
          console.log('   • Return HTTP 200 for healthy, 503 for unhealthy');
          console.log('   • Keep health checks lightweight and fast (< 5 seconds)');
          console.log('   • Verify critical dependencies (database, external services)');
          console.log('   • Include timestamp and basic service information');
        }
        
        console.log('\n📊 Monitoring Integration:');
        console.log('   • Send health metrics to Log Analytics or Application Insights');
        console.log('   • Create alerts for health probe failure rates');
        console.log('   • Track repair actions and their effectiveness');
        console.log('   • Monitor health trends to identify degradation patterns');
        
        console.log('\n💡 Next Steps:');
        console.log('   1. Implement health endpoint in your application');
        console.log('   2. Test health probe locally');
        console.log('   3. Configure automatic repair policies');
        console.log('   4. Set up health monitoring and alerting');
        
      } catch (error) {
        console.error(`❌ Error planning health extensions: ${error}`);
        process.exit(1);
      }
    });

  // Health extension best practices
  haCommand
    .command('health-best-practices')
    .description('Health extension configuration best practices and guidelines')
    .action(() => {
      try {
        const { HealthExtensionCLI } = require('../highavailability/health');
        const practices = HealthExtensionCLI.getHealthExtensionBestPractices();
        
        console.log('\n🏆 Health Extension Best Practices');
        console.log('='.repeat(50));
        practices.forEach((practice: string) => console.log(practice));
        
      } catch (error) {
        console.error(`❌ Error showing health extension best practices: ${error}`);
        process.exit(1);
      }
    });

  // Health extension configuration examples
  haCommand
    .command('health-examples')
    .description('Common health extension configuration examples')
    .action(() => {
      try {
        const { HealthExtensionCLI } = require('../highavailability/health');
        const examples = HealthExtensionCLI.getHealthExtensionExamples();
        const templates = HealthExtensionCLI.getHealthProbeTemplates();
        
        console.log('\n📋 Health Extension Configuration Examples');
        console.log('='.repeat(50));
        
        examples.forEach((example: any, index: number) => {
          console.log(`\n${index + 1}. ${example.name}`);
          console.log(`   ${example.description}`);
          console.log(`   Protocol: ${example.config.applicationHealthExtension?.protocol?.toUpperCase()}`);
          console.log(`   Port: ${example.config.applicationHealthExtension?.port}`);
          console.log(`   Health Path: ${example.config.applicationHealthExtension?.requestPath || 'N/A'}`);
          console.log(`   Automatic Repairs: ${example.config.automaticRepairPolicy?.enabled ? 'Enabled' : 'Disabled'}`);
        });
        
        console.log('\n💻 Health Probe Code Templates');
        console.log('='.repeat(35));
        
        templates.forEach((template: any, index: number) => {
          console.log(`\n${index + 1}. ${template.name} (${template.type})`);
          console.log('```');
          console.log(template.template);
          console.log('```');
        });
        
      } catch (error) {
        console.error(`❌ Error showing health extension examples: ${error}`);
        process.exit(1);
      }
    });
}
 
// Export CLI classes for direct usage
export { ProximityPlacementGroupCLI, HighAvailabilityCLI, LoadBalancerCLI };
export { VmssCLI } from '../highavailability/vmss';
export { HealthExtensionCLI } from '../highavailability/health';
