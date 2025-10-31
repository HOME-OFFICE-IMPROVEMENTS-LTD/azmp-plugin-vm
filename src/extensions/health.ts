// Health extension helpers for HA cluster health monitoring
// Provides HTTP endpoint scaffolding for Windows and Linux VMs

/**
 * Health extension configuration
 */
export interface HealthExtensionConfig {
  enabled: boolean;
  port: number;
  endpoint: string;
  protocol: 'HTTP' | 'HTTPS';
  responseContent?: string;
  checkInterval?: number;
}

/**
 * Generates Windows health extension (Custom Script Extension)
 */
export function generateWindowsHealthExtension(config: HealthExtensionConfig): object {
  if (!config.enabled) {
    return {};
  }

  const scriptContent = `
# Create simple health endpoint
$port = ${config.port}
$endpoint = "${config.endpoint}"
$response = "${config.responseContent || 'OK'}"

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()

Write-Host "Health endpoint listening on port $port"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    if ($request.Url.AbsolutePath -eq $endpoint) {
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($response)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    } else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}
`;

  return {
    type: 'Microsoft.Compute/virtualMachines/extensions',
    apiVersion: '2023-03-01',
    name: '[concat(parameters("vmName"), "/HealthExtension")]',
    dependsOn: [
      '[resourceId("Microsoft.Compute/virtualMachines", parameters("vmName"))]'
    ],
    properties: {
      publisher: 'Microsoft.Compute',
      type: 'CustomScriptExtension',
      typeHandlerVersion: '1.10',
      autoUpgradeMinorVersion: true,
      settings: {
        commandToExecute: `powershell -ExecutionPolicy Unrestricted -Command "${scriptContent.replace(/"/g, '\\"')}"`
      }
    }
  };
}

/**
 * Generates Linux health extension (Custom Script Extension)
 */
export function generateLinuxHealthExtension(config: HealthExtensionConfig): object {
  if (!config.enabled) {
    return {};
  }

  const scriptContent = `#!/bin/bash
# Create simple health endpoint service

PORT=${config.port}
ENDPOINT="${config.endpoint}"
RESPONSE="${config.responseContent || 'OK'}"

# Create health check script
cat > /opt/health-check.sh << 'EOF'
#!/bin/bash
while true; do
  echo -e "HTTP/1.1 200 OK\\r\\nContent-Length: \${#RESPONSE}\\r\\n\\r\\n\${RESPONSE}" | nc -l -p \${PORT} -q 1
done
EOF

chmod +x /opt/health-check.sh

# Create systemd service
cat > /etc/systemd/system/health-check.service << EOF
[Unit]
Description=Health Check Service
After=network.target

[Service]
Type=simple
ExecStart=/opt/health-check.sh
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable health-check.service
systemctl start health-check.service
`;

  return {
    type: 'Microsoft.Compute/virtualMachines/extensions',
    apiVersion: '2023-03-01',
    name: '[concat(parameters("vmName"), "/HealthExtension")]',
    dependsOn: [
      '[resourceId("Microsoft.Compute/virtualMachines", parameters("vmName"))]'
    ],
    properties: {
      publisher: 'Microsoft.Azure.Extensions',
      type: 'CustomScript',
      typeHandlerVersion: '2.1',
      autoUpgradeMinorVersion: true,
      settings: {
        script: Buffer.from(scriptContent).toString('base64')
      }
    }
  };
}

/**
 * Generates health extension based on OS type
 */
export function generateHealthExtension(
  config: HealthExtensionConfig, 
  osType: 'Windows' | 'Linux'
): object {
  switch (osType) {
    case 'Windows':
      return generateWindowsHealthExtension(config);
    case 'Linux':
      return generateLinuxHealthExtension(config);
    default:
      throw new Error(`Unsupported OS type: ${osType}`);
  }
}