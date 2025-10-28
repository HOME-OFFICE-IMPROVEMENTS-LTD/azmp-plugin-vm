/**
 * Health Extensions for HA Clusters
 * Provides application-level health monitoring, automatic repair policies,
 * and health signal correlation between load balancer probes and application health
 */

import { LoadBalancerConfig } from './loadbalancer';
import { VmssConfig } from './vmss';

export interface ApplicationHealthExtensionConfig {
  enabled: boolean;
  protocol: 'http' | 'https' | 'tcp';
  port: number;
  requestPath?: string; // Required for HTTP/HTTPS
  intervalInSeconds?: number;
  numberOfProbes?: number;
  gracePeriod?: string; // ISO 8601 duration (e.g., "PT30M")
  autoUpgradeMinorVersion?: boolean;
  settings?: {
    protocol?: string;
    port?: number;
    requestPath?: string;
    intervalInSeconds?: number;
    numberOfProbes?: number;
    gracePeriod?: string;
  };
  protectedSettings?: {
    // Reserved for future authentication settings
  };
}

export interface CustomHealthProbeConfig {
  enabled: boolean;
  name: string;
  description?: string;
  script?: {
    scriptPath: string;
    scriptArguments?: string;
    timeoutInSeconds?: number;
    intervalInSeconds?: number;
    retryCount?: number;
  };
  httpEndpoint?: {
    url: string;
    method?: 'GET' | 'POST' | 'HEAD';
    headers?: Record<string, string>;
    expectedStatusCodes?: number[];
    timeoutInSeconds?: number;
    intervalInSeconds?: number;
    retryCount?: number;
  };
  commandLine?: {
    command: string;
    arguments?: string[];
    workingDirectory?: string;
    timeoutInSeconds?: number;
    intervalInSeconds?: number;
    retryCount?: number;
  };
  healthThresholds?: {
    healthyThreshold: number;
    unhealthyThreshold: number;
    consecutiveFailuresRequired?: number;
  };
}

export interface HealthMonitoringConfig {
  applicationHealthExtension: ApplicationHealthExtensionConfig;
  customHealthProbes?: CustomHealthProbeConfig[];
  healthSignalCorrelation?: {
    enabled: boolean;
    loadBalancerProbeCorrelation?: boolean;
    healthGracePeriod?: string; // ISO 8601 duration
    repairGracePeriod?: string; // ISO 8601 duration
    maxRepairActions?: number;
    repairCooldown?: string; // ISO 8601 duration
  };
  automaticRepairPolicy?: {
    enabled: boolean;
    gracePeriod?: string; // ISO 8601 duration
    repairAction?: 'Replace' | 'Restart' | 'Reimage';
    maxInstanceRepairsPercent?: number;
    enableAutomaticOSUpgrade?: boolean;
  };
  healthReporting?: {
    enabled: boolean;
    logAnalyticsWorkspaceId?: string;
    applicationInsightsInstrumentationKey?: string;
    customMetrics?: Array<{
      name: string;
      description: string;
      unit: string;
      aggregationType: 'Average' | 'Maximum' | 'Minimum' | 'Total' | 'Count';
    }>;
  };
}

/**
 * Validates health extension configuration
 */
export function validateHealthExtensionConfiguration(
  healthConfig: HealthMonitoringConfig,
  vmssConfig: VmssConfig,
  lbConfig?: LoadBalancerConfig
): string[] {
  const errors: string[] = [];

  if (!healthConfig.applicationHealthExtension.enabled) {
    return errors;
  }

  const appHealth = healthConfig.applicationHealthExtension;

  // Basic validation
  if (!appHealth.port || appHealth.port <= 0 || appHealth.port > 65535) {
    errors.push('Application health extension port must be between 1 and 65535');
  }

  if ((appHealth.protocol === 'http' || appHealth.protocol === 'https') && !appHealth.requestPath) {
    errors.push('Request path is required for HTTP/HTTPS health probes');
  }

  if (appHealth.requestPath && !appHealth.requestPath.startsWith('/')) {
    errors.push('Request path must start with "/"');
  }

  // Interval validation
  if (appHealth.intervalInSeconds !== undefined) {
    if (appHealth.intervalInSeconds < 5 || appHealth.intervalInSeconds > 300) {
      errors.push('Health probe interval must be between 5 and 300 seconds');
    }
  }

  // Probe count validation
  if (appHealth.numberOfProbes !== undefined) {
    if (appHealth.numberOfProbes < 1 || appHealth.numberOfProbes > 10) {
      errors.push('Number of health probes must be between 1 and 10');
    }
  }

  // Grace period validation
  if (appHealth.gracePeriod) {
    if (!isValidISO8601Duration(appHealth.gracePeriod)) {
      errors.push('Health extension grace period must be a valid ISO 8601 duration');
    }
  }

  // Load balancer correlation validation
  if (healthConfig.healthSignalCorrelation?.loadBalancerProbeCorrelation && lbConfig) {
    // Verify health probe port matches load balancer probe port
    const lbHealthProbes = lbConfig.healthProbes || [];
    const matchingProbe = lbHealthProbes.find(probe => probe.port === appHealth.port);
    
    if (!matchingProbe) {
      errors.push(`Application health extension port ${appHealth.port} does not match any load balancer health probe ports`);
    } else if (matchingProbe.protocol.toLowerCase() !== appHealth.protocol) {
      errors.push(`Application health extension protocol (${appHealth.protocol}) does not match load balancer probe protocol (${matchingProbe.protocol})`);
    }

    if (appHealth.requestPath && matchingProbe && matchingProbe.path && matchingProbe.path !== appHealth.requestPath) {
      errors.push(`Application health extension path (${appHealth.requestPath}) does not match load balancer probe path (${matchingProbe.path})`);
    }
  }

  // Custom health probes validation
  if (healthConfig.customHealthProbes) {
    healthConfig.customHealthProbes.forEach((probe, index) => {
      if (!probe.name) {
        errors.push(`Custom health probe ${index} must have a name`);
      }

      const probeTypes = [probe.script, probe.httpEndpoint, probe.commandLine].filter(Boolean);
      if (probeTypes.length !== 1) {
        errors.push(`Custom health probe ${probe.name || index} must define exactly one probe type (script, httpEndpoint, or commandLine)`);
      }

      if (probe.httpEndpoint) {
        try {
          new URL(probe.httpEndpoint.url);
        } catch {
          errors.push(`Custom health probe ${probe.name || index} has invalid HTTP endpoint URL`);
        }

        if (probe.httpEndpoint.expectedStatusCodes) {
          const invalidCodes = probe.httpEndpoint.expectedStatusCodes.filter(code => code < 100 || code > 599);
          if (invalidCodes.length > 0) {
            errors.push(`Custom health probe ${probe.name || index} has invalid HTTP status codes: ${invalidCodes.join(', ')}`);
          }
        }
      }

      if (probe.script && !probe.script.scriptPath) {
        errors.push(`Custom health probe ${probe.name || index} script must specify scriptPath`);
      }

      if (probe.commandLine && !probe.commandLine.command) {
        errors.push(`Custom health probe ${probe.name || index} commandLine must specify command`);
      }
    });
  }

  // Automatic repair policy validation
  if (healthConfig.automaticRepairPolicy?.enabled) {
    const repairPolicy = healthConfig.automaticRepairPolicy;

    if (repairPolicy.gracePeriod && !isValidISO8601Duration(repairPolicy.gracePeriod)) {
      errors.push('Automatic repair policy grace period must be a valid ISO 8601 duration');
    }

    if (repairPolicy.maxInstanceRepairsPercent !== undefined) {
      if (repairPolicy.maxInstanceRepairsPercent < 1 || repairPolicy.maxInstanceRepairsPercent > 100) {
        errors.push('Maximum instance repairs percentage must be between 1 and 100');
      }
    }

    // Validate repair action compatibility
    if (vmssConfig.upgradePolicy === 'Automatic' && repairPolicy.repairAction === 'Reimage') {
      errors.push('Reimage repair action is not compatible with automatic upgrade policy');
    }
  }

  // Health reporting validation
  if (healthConfig.healthReporting?.enabled) {
    const reporting = healthConfig.healthReporting;

    if (!reporting.logAnalyticsWorkspaceId && !reporting.applicationInsightsInstrumentationKey) {
      errors.push('Health reporting requires either Log Analytics workspace ID or Application Insights instrumentation key');
    }

    if (reporting.customMetrics) {
      reporting.customMetrics.forEach((metric, index) => {
        if (!metric.name) {
          errors.push(`Custom metric ${index} must have a name`);
        }
        if (!metric.unit) {
          errors.push(`Custom metric ${metric.name || index} must specify a unit`);
        }
      });
    }
  }

  return errors;
}

/**
 * Validates ISO 8601 duration format
 */
function isValidISO8601Duration(duration: string): boolean {
  const iso8601Regex = /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  return iso8601Regex.test(duration);
}

/**
 * Generates ARM template extension for Application Health
 */
export function generateApplicationHealthExtension(
  healthConfig: HealthMonitoringConfig,
  vmssConfig: VmssConfig
): any {
  if (!healthConfig.applicationHealthExtension.enabled || !vmssConfig.enabled) {
    return null;
  }

  const appHealth = healthConfig.applicationHealthExtension;

  return {
    name: 'ApplicationHealthExtension',
    properties: {
      publisher: 'Microsoft.ManagedServices',
      type: 'ApplicationHealthLinux', // Will be made dynamic based on OS
      typeHandlerVersion: '1.0',
      autoUpgradeMinorVersion: appHealth.autoUpgradeMinorVersion !== false,
      settings: {
        protocol: appHealth.protocol,
        port: appHealth.port,
        requestPath: appHealth.requestPath,
        intervalInSeconds: appHealth.intervalInSeconds || 30,
        numberOfProbes: appHealth.numberOfProbes || 1,
        gracePeriod: appHealth.gracePeriod || 'PT30M',
        ...appHealth.settings
      },
      protectedSettings: appHealth.protectedSettings || {}
    }
  };
}

/**
 * Generates ARM template for custom health monitoring script
 */
export function generateCustomHealthMonitoringExtension(
  healthConfig: HealthMonitoringConfig
): any {
  if (!healthConfig.customHealthProbes || healthConfig.customHealthProbes.length === 0) {
    return null;
  }

  const customScript = healthConfig.customHealthProbes[0]; // Primary custom probe

  if (!customScript.enabled) {
    return null;
  }

  return {
    name: 'CustomHealthMonitoring',
    properties: {
      publisher: 'Microsoft.Azure.Extensions',
      type: 'CustomScript',
      typeHandlerVersion: '2.1',
      autoUpgradeMinorVersion: true,
      settings: {
        skipDos2Unix: false,
        timestamp: '[parameters(\'extensionTimestamp\')]'
      },
      protectedSettings: {
        commandToExecute: generateHealthMonitoringScript(customScript),
        fileUris: customScript.script?.scriptPath ? [customScript.script.scriptPath] : undefined
      }
    }
  };
}

/**
 * Generates health monitoring script command
 */
function generateHealthMonitoringScript(probe: CustomHealthProbeConfig): string {
  if (probe.script) {
    const args = probe.script.scriptArguments ? ` ${probe.script.scriptArguments}` : '';
    return `chmod +x ${probe.script.scriptPath} && ${probe.script.scriptPath}${args}`;
  }

  if (probe.httpEndpoint) {
    const method = probe.httpEndpoint.method || 'GET';
    const timeout = probe.httpEndpoint.timeoutInSeconds || 30;
    const expectedCodes = probe.httpEndpoint.expectedStatusCodes || [200];
    
    let curlCommand = `curl -X ${method} -w "%{http_code}" -o /dev/null -s --max-time ${timeout}`;
    
    if (probe.httpEndpoint.headers) {
      Object.entries(probe.httpEndpoint.headers).forEach(([key, value]) => {
        curlCommand += ` -H "${key}: ${value}"`;
      });
    }
    
    curlCommand += ` "${probe.httpEndpoint.url}"`;
    
    return `HTTP_CODE=$(${curlCommand}) && echo "HTTP response code: $HTTP_CODE" && [[ " ${expectedCodes.join(' ')} " =~ " $HTTP_CODE " ]]`;
  }

  if (probe.commandLine) {
    const cmd = probe.commandLine.command;
    const args = probe.commandLine.arguments ? ` ${probe.commandLine.arguments.join(' ')}` : '';
    const workDir = probe.commandLine.workingDirectory ? `cd ${probe.commandLine.workingDirectory} && ` : '';
    
    return `${workDir}${cmd}${args}`;
  }

  return 'echo "No health probe configuration found" && exit 1';
}

/**
 * Generates ARM template parameters for health extensions
 */
export function generateHealthExtensionParameters(healthConfig: HealthMonitoringConfig): any {
  if (!healthConfig.applicationHealthExtension.enabled) {
    return {};
  }

  const parameters: any = {
    healthExtensionProtocol: {
      type: 'string',
      defaultValue: healthConfig.applicationHealthExtension.protocol,
      allowedValues: ['http', 'https', 'tcp'],
      metadata: {
        description: 'Protocol for application health monitoring'
      }
    },
    healthExtensionPort: {
      type: 'int',
      defaultValue: healthConfig.applicationHealthExtension.port,
      minValue: 1,
      maxValue: 65535,
      metadata: {
        description: 'Port for application health monitoring'
      }
    }
  };

  if (healthConfig.applicationHealthExtension.requestPath) {
    parameters.healthExtensionRequestPath = {
      type: 'string',
      defaultValue: healthConfig.applicationHealthExtension.requestPath,
      metadata: {
        description: 'Request path for HTTP/HTTPS health monitoring'
      }
    };
  }

  if (healthConfig.applicationHealthExtension.gracePeriod) {
    parameters.healthExtensionGracePeriod = {
      type: 'string',
      defaultValue: healthConfig.applicationHealthExtension.gracePeriod,
      metadata: {
        description: 'Grace period for health extension monitoring'
      }
    };
  }

  if (healthConfig.customHealthProbes && healthConfig.customHealthProbes.length > 0) {
    parameters.extensionTimestamp = {
      type: 'int',
      defaultValue: '[dateTimeToEpoch(utcNow())]',
      metadata: {
        description: 'Timestamp to force extension update'
      }
    };
  }

  if (healthConfig.healthReporting?.enabled) {
    if (healthConfig.healthReporting.logAnalyticsWorkspaceId) {
      parameters.logAnalyticsWorkspaceId = {
        type: 'string',
        defaultValue: healthConfig.healthReporting.logAnalyticsWorkspaceId,
        metadata: {
          description: 'Log Analytics workspace ID for health reporting'
        }
      };
    }

    if (healthConfig.healthReporting.applicationInsightsInstrumentationKey) {
      parameters.applicationInsightsInstrumentationKey = {
        type: 'securestring',
        metadata: {
          description: 'Application Insights instrumentation key for health reporting'
        }
      };
    }
  }

  return parameters;
}

/**
 * CLI helper for health extension configuration
 */
export class HealthExtensionCLI {
  static async validateConfiguration(healthConfig: HealthMonitoringConfig, vmssConfig: VmssConfig): Promise<boolean> {
    const errors = validateHealthExtensionConfiguration(healthConfig, vmssConfig);
    
    if (errors.length > 0) {
      console.error('❌ Health extension configuration validation failed:');
      errors.forEach(error => console.error(`  • ${error}`));
      return false;
    }
    
    console.log('✅ Health extension configuration is valid');
    return true;
  }

  static getHealthExtensionBestPractices(): string[] {
    return [
      '🏥 **Application Health Monitoring**',
      '  • Use HTTP/HTTPS probes for web applications with meaningful health endpoints',
      '  • Implement dedicated health check endpoints that verify application dependencies',
      '  • Set probe intervals based on application startup time (30-60 seconds typical)',
      '  • Configure grace periods to allow for application initialization',
      '',
      '🔄 **Automatic Repair Policies**',
      '  • Enable automatic repairs with appropriate grace periods (15-30 minutes)',
      '  • Use Replace action for stateless applications, Restart for recoverable issues',
      '  • Limit repair percentage to prevent cascading failures (20-30% recommended)',
      '  • Configure repair cooldown periods to prevent rapid repair cycles',
      '',
      '⚖️ **Load Balancer Integration**',
      '  • Align health extension probes with load balancer health probes',
      '  • Use consistent protocols and ports for health monitoring',
      '  • Ensure health endpoints respond quickly (< 5 seconds)',
      '  • Implement proper HTTP status codes (200 for healthy, 503 for unhealthy)',
      '',
      '📊 **Health Signal Correlation**',
      '  • Enable correlation between load balancer and application health',
      '  • Configure different grace periods for different failure types',
      '  • Monitor health signal patterns to identify application issues',
      '  • Use custom metrics to track health probe success rates',
      '',
      '🔧 **Custom Health Probes**',
      '  • Implement application-specific health checks beyond basic connectivity',
      '  • Test database connections, external service availability, and resource health',
      '  • Use timeout values appropriate for each health check type',
      '  • Implement retry logic for transient failures',
      '',
      '📈 **Health Reporting & Monitoring**',
      '  • Send health metrics to Log Analytics or Application Insights',
      '  • Create alerts based on health probe failure rates',
      '  • Track repair actions and their effectiveness',
      '  • Monitor health trends to identify degradation patterns',
      '',
      '🔐 **Security Best Practices**',
      '  • Use HTTPS for health probes when possible',
      '  • Implement authentication for health endpoints if required',
      '  • Restrict health probe access to internal networks only',
      '  • Avoid exposing sensitive information in health responses',
      '',
      '⚡ **Performance Optimization**',
      '  • Keep health checks lightweight and fast',
      '  • Avoid complex business logic in health endpoints',
      '  • Cache health check results when appropriate',
      '  • Use separate health check instances for different service tiers'
    ];
  }

  static getHealthExtensionExamples(): Array<{ name: string; description: string; config: Partial<HealthMonitoringConfig> }> {
    return [
      {
        name: 'Web Application Health',
        description: 'HTTP health monitoring for web applications with automatic repairs',
        config: {
          applicationHealthExtension: {
            enabled: true,
            protocol: 'http',
            port: 80,
            requestPath: '/health',
            intervalInSeconds: 30,
            numberOfProbes: 2,
            gracePeriod: 'PT30M'
          },
          automaticRepairPolicy: {
            enabled: true,
            gracePeriod: 'PT15M',
            repairAction: 'Replace',
            maxInstanceRepairsPercent: 30
          },
          healthSignalCorrelation: {
            enabled: true,
            loadBalancerProbeCorrelation: true,
            healthGracePeriod: 'PT5M',
            repairGracePeriod: 'PT15M'
          }
        }
      },
      {
        name: 'API Service Health',
        description: 'HTTPS health monitoring for API services with custom probes',
        config: {
          applicationHealthExtension: {
            enabled: true,
            protocol: 'https',
            port: 443,
            requestPath: '/api/health',
            intervalInSeconds: 15,
            numberOfProbes: 3,
            gracePeriod: 'PT20M'
          },
          customHealthProbes: [
            {
              enabled: true,
              name: 'DatabaseConnectivity',
              description: 'Check database connection health',
              httpEndpoint: {
                url: 'https://localhost/api/health/database',
                method: 'GET',
                expectedStatusCodes: [200],
                timeoutInSeconds: 10,
                intervalInSeconds: 60
              }
            }
          ],
          healthReporting: {
            enabled: true,
            customMetrics: [
              {
                name: 'DatabaseHealthScore',
                description: 'Database connectivity health score',
                unit: 'Percent',
                aggregationType: 'Average'
              }
            ]
          }
        }
      },
      {
        name: 'TCP Service Health',
        description: 'TCP health monitoring for non-HTTP services',
        config: {
          applicationHealthExtension: {
            enabled: true,
            protocol: 'tcp',
            port: 8080,
            intervalInSeconds: 45,
            numberOfProbes: 1,
            gracePeriod: 'PT45M'
          },
          customHealthProbes: [
            {
              enabled: true,
              name: 'ServiceProcessHealth',
              description: 'Check if service process is running',
              commandLine: {
                command: 'systemctl',
                arguments: ['is-active', 'myservice'],
                timeoutInSeconds: 5,
                intervalInSeconds: 30
              }
            }
          ],
          automaticRepairPolicy: {
            enabled: true,
            gracePeriod: 'PT30M',
            repairAction: 'Restart',
            maxInstanceRepairsPercent: 20
          }
        }
      }
    ];
  }

  static getHealthProbeTemplates(): Array<{ name: string; type: string; template: string }> {
    return [
      {
        name: 'Basic Web Health',
        type: 'HTTP',
        template: `# Basic web application health endpoint
# Returns 200 OK if application is healthy

app.get('/health', (req, res) => {
  try {
    // Check basic application health
    if (app.isHealthy()) {
      res.status(200).json({ status: 'healthy', timestamp: new Date() });
    } else {
      res.status(503).json({ status: 'unhealthy', timestamp: new Date() });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});`
      },
      {
        name: 'Database Health Check',
        type: 'HTTP',
        template: `# Database connectivity health check
# Tests database connection and returns appropriate status

app.get('/health/database', async (req, res) => {
  try {
    await database.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date() 
    });
  }
});`
      },
      {
        name: 'Service Process Check',
        type: 'Script',
        template: `#!/bin/bash
# Custom health check script for service monitoring

SERVICE_NAME="myservice"
HEALTH_FILE="/tmp/service_health"

# Check if service is running
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "healthy" > $HEALTH_FILE
    echo "Service $SERVICE_NAME is running"
    exit 0
else
    echo "unhealthy" > $HEALTH_FILE
    echo "Service $SERVICE_NAME is not running"
    exit 1
fi`
      }
    ];
  }
}