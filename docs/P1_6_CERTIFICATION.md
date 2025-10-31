# P1-6: Azure Marketplace Certification Tooling

**Status:** ✅ Completed  
**Version:** 1.0.0  
**Last Updated:** 2024

## Overview

The Azure Marketplace Certification Tooling provides a comprehensive framework for validating and testing Azure Virtual Machine (VM) images before marketplace submission. This tooling automates the certification process, generates detailed reports in multiple formats, and ensures VHD images meet all Azure Marketplace requirements.

### Key Components

- **Certification Test Runner**: Core testing framework with 6 test categories
- **Report Generator**: Multi-format report generation (HTML, JSON, XML)
- **CLI Command**: User-friendly command-line interface
- **Workflow Script**: End-to-end automation for the certification process
- **HTML Template**: Modern, responsive report visualization

### Features

✅ **Comprehensive Testing**
- VHD validation (format, size, alignment)
- Security scanning (vulnerabilities, credentials, malware)
- VM generalization checks
- Azure-specific configuration validation
- Performance benchmarking
- Compliance verification

✅ **Multi-Format Reporting**
- HTML reports with modern, responsive design
- JSON reports for API integration
- XML reports for Partner Center submission

✅ **Flexible Execution**
- Single VHD testing
- Batch processing for multiple VHDs
- Selective test execution (skip security/performance)
- Verbose logging for debugging

✅ **Azure Integration**
- Azure CLI workflow automation
- VM creation and management
- Storage account operations
- Partner Center preparation

---

## Installation

The certification tooling is included in the `azmp-plugin-vm` package.

### Prerequisites

- Node.js 14.x or higher
- Azure CLI 2.30.0 or higher (for workflow script)
- Azure subscription with appropriate permissions
- VHD file to test

### Setup

```bash
# Install the package
npm install -g @hoiltd/azmp-plugin-vm

# Verify installation
azmp-plugin-vm vm run-certification --help
```

---

## Quick Start

### Basic Usage

```bash
# Run certification tests on a VHD file
azmp-plugin-vm vm run-certification --vhd /path/to/vm.vhd

# This will:
# 1. Validate the VHD file
# 2. Run all certification tests
# 3. Generate an HTML report in ./certification-report-TIMESTAMP.html
```

### Complete Workflow

```bash
# Run the complete certification workflow
./scripts/certification-workflow.sh /path/to/vm.vhd

# This will:
# 1. Set up Azure environment
# 2. Prepare and upload VHD
# 3. Create VM from VHD
# 4. Run all certification tests
# 5. Generate reports in all formats
# 6. Prepare Partner Center submission package
```

---

## CLI Command Reference

### Command Syntax

```bash
azmp-plugin-vm vm run-certification [options]
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--vhd <path>` | string | **Yes** | Path to the VHD file to test |
| `--format <format>` | string | No | Report format: `html`, `json`, `xml`, or `all` (default: `html`) |
| `--output <path>` | string | No | Output file or directory path |
| `--skip-security` | boolean | No | Skip security scan (faster testing) |
| `--skip-performance` | boolean | No | Skip performance benchmarks |
| `--verbose` | boolean | No | Enable verbose output for debugging |
| `--batch <paths...>` | string[] | No | Batch mode: test multiple VHDs |

### Examples

#### Example 1: Basic Test with HTML Report

```bash
azmp-plugin-vm vm run-certification --vhd /data/ubuntu-vm.vhd
```

**Output:**
```
Running certification tests on: /data/ubuntu-vm.vhd
✓ VHD validation passed
✓ Security scan passed
✓ Generalization check passed
✓ Configuration validation passed
✓ Performance benchmark passed
✓ Compliance check passed

Overall Status: PASSED
Score: 95/100

Report saved: ./certification-report-2024-01-15-143022.html
```

#### Example 2: Generate All Report Formats

```bash
azmp-plugin-vm vm run-certification \
  --vhd /data/ubuntu-vm.vhd \
  --format all \
  --output ./reports
```

**Output:**
```
Report saved: ./reports/certification-report-2024-01-15-143022.html
Report saved: ./reports/certification-report-2024-01-15-143022.json
Report saved: ./reports/certification-report-2024-01-15-143022.xml
```

#### Example 3: Quick Validation (Skip Security and Performance)

```bash
azmp-plugin-vm vm run-certification \
  --vhd /data/ubuntu-vm.vhd \
  --skip-security \
  --skip-performance
```

**Use Case:** Fast validation during development iterations.

#### Example 4: Batch Testing Multiple VHDs

```bash
azmp-plugin-vm vm run-certification \
  --batch /data/ubuntu-vm.vhd /data/centos-vm.vhd /data/rhel-vm.vhd \
  --format json \
  --output ./batch-results
```

**Output:**
```
Testing 3 VHDs...
[1/3] ubuntu-vm.vhd: PASSED (Score: 95/100)
[2/3] centos-vm.vhd: PASSED (Score: 92/100)
[3/3] rhel-vm.vhd: WARNING (Score: 85/100)

Batch results saved: ./batch-results/batch-report-2024-01-15-143022.json
```

#### Example 5: Verbose Output for Debugging

```bash
azmp-plugin-vm vm run-certification \
  --vhd /data/ubuntu-vm.vhd \
  --verbose
```

**Output:**
```
[DEBUG] Loading VHD file: /data/ubuntu-vm.vhd
[DEBUG] VHD size: 30 GB
[DEBUG] VHD format: Fixed
[DEBUG] Running VHD validation tests...
[DEBUG] Test: VHD format validation
[DEBUG] Result: PASSED
[DEBUG] Test: VHD size validation
[DEBUG] Result: PASSED
...
```

---

## Certification Test Categories

### 1. VHD Validation

Tests the VHD file format, structure, and Azure compatibility.

**Tests:**
- VHD format validation (fixed vs dynamic)
- VHD size validation (within Azure limits)
- VHD alignment validation (512-byte boundary)
- VHD footer validation
- VHD sector size validation

**Example Result:**
```json
{
  "category": "VHD_VALIDATION",
  "name": "VHD format validation",
  "status": "PASSED",
  "message": "VHD format is valid and compatible with Azure",
  "duration": 125
}
```

### 2. Security Scan

Scans for security vulnerabilities, hardcoded credentials, and malware.

**Tests:**
- Credential scan (passwords, API keys, certificates)
- Malware detection
- Security vulnerability assessment
- Open port analysis
- User account validation

**Example Result:**
```json
{
  "category": "SECURITY",
  "name": "Credential scan",
  "status": "PASSED",
  "message": "No hardcoded credentials found",
  "duration": 3500
}
```

### 3. Generalization Check

Verifies the VM is properly generalized (depersonalized).

**Tests:**
- Cloud-init status (Linux)
- Sysprep status (Windows)
- Machine-specific data removal
- SSH host keys removed (Linux)
- Windows activation status

**Example Result:**
```json
{
  "category": "GENERALIZATION",
  "name": "VM generalization check",
  "status": "PASSED",
  "message": "VM is properly generalized",
  "duration": 250
}
```

### 4. Configuration Validation

Validates Azure-specific configuration requirements.

**Tests:**
- Azure VM agent installation
- Azure VM extensions compatibility
- Network configuration
- Disk configuration
- Boot diagnostics settings

**Example Result:**
```json
{
  "category": "CONFIGURATION",
  "name": "Azure VM agent check",
  "status": "PASSED",
  "message": "Azure VM agent is installed and configured",
  "duration": 180
}
```

### 5. Performance Benchmark

Measures VM performance metrics.

**Tests:**
- Boot time measurement
- Disk I/O performance
- IOPS measurement
- Network throughput
- Memory allocation

**Example Result:**
```json
{
  "category": "PERFORMANCE",
  "name": "Boot time benchmark",
  "status": "PASSED",
  "message": "Boot time: 45 seconds (within acceptable range)",
  "duration": 45000
}
```

### 6. Compliance Check

Verifies compliance with Azure Marketplace policies.

**Tests:**
- Azure Marketplace terms acceptance
- Licensing validation
- Support information presence
- Documentation requirements
- Pricing model validation

**Example Result:**
```json
{
  "category": "COMPLIANCE",
  "name": "Marketplace terms validation",
  "status": "PASSED",
  "message": "VM complies with Azure Marketplace terms",
  "duration": 100
}
```

---

## Report Formats

### HTML Report

**File:** `certification-report-TIMESTAMP.html`

**Features:**
- Modern, responsive design
- Executive summary cards with key metrics
- Test results organized by category
- Color-coded status indicators
- Recommendations and error sections
- Printable format

**Visual Elements:**
- Overall status badge (PASSED/FAILED/WARNING)
- Score gauge (0-100)
- Test count summary (passed/failed/warning)
- Duration display
- Category-specific test lists
- Recommendation cards
- Error alerts

**Screenshot:**
```
┌─────────────────────────────────────────────────┐
│ Azure VM Certification Report                   │
│ Generated: 2024-01-15 14:30:22                  │
├─────────────────────────────────────────────────┤
│ [PASSED] Score: 95/100  Duration: 5m 23s        │
│ ✓ 45 Passed  ✗ 2 Failed  ⚠ 3 Warning           │
├─────────────────────────────────────────────────┤
│ VHD Validation                    ✓ 5  ✗ 0  ⚠ 0│
│ ✓ VHD format validation                         │
│ ✓ VHD size validation                           │
│ ✓ VHD alignment validation                      │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

### JSON Report

**File:** `certification-report-TIMESTAMP.json`

**Features:**
- Machine-readable format
- API integration friendly
- Structured data with typed fields
- Easy parsing and processing

**Structure:**
```json
{
  "title": "Azure VM Certification Report",
  "generatedDate": "2024-01-15T14:30:22.123Z",
  "vhdPath": "/data/ubuntu-vm.vhd",
  "results": {
    "overallStatus": "PASSED",
    "score": 95,
    "totalTests": 50,
    "passedTests": 45,
    "failedTests": 2,
    "warningTests": 3,
    "skippedTests": 0,
    "duration": 323000,
    "startTime": "2024-01-15T14:25:00.000Z",
    "endTime": "2024-01-15T14:30:23.000Z",
    "tests": [
      {
        "category": "VHD_VALIDATION",
        "name": "VHD format validation",
        "status": "PASSED",
        "message": "VHD format is valid and compatible with Azure",
        "duration": 125
      }
    ],
    "recommendations": [
      "Consider enabling boot diagnostics for better troubleshooting",
      "Update Azure VM agent to the latest version"
    ],
    "errors": []
  }
}
```

### XML Report

**File:** `certification-report-TIMESTAMP.xml`

**Features:**
- Partner Center compatible
- Submission package ready
- Schema-validated format

**Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CertificationReport>
  <Metadata>
    <Title>Azure VM Certification Report</Title>
    <GeneratedDate>2024-01-15T14:30:22.123Z</GeneratedDate>
    <VhdPath>/data/ubuntu-vm.vhd</VhdPath>
  </Metadata>
  <Results>
    <OverallStatus>PASSED</OverallStatus>
    <Score>95</Score>
    <TotalTests>50</TotalTests>
    <PassedTests>45</PassedTests>
    <FailedTests>2</FailedTests>
    <WarningTests>3</WarningTests>
    <SkippedTests>0</SkippedTests>
    <Duration>323000</Duration>
    <Tests>
      <Test>
        <Category>VHD_VALIDATION</Category>
        <Name>VHD format validation</Name>
        <Status>PASSED</Status>
        <Message>VHD format is valid and compatible with Azure</Message>
        <Duration>125</Duration>
      </Test>
    </Tests>
    <Recommendations>
      <Recommendation>Consider enabling boot diagnostics</Recommendation>
    </Recommendations>
    <Errors/>
  </Results>
</CertificationReport>
```

---

## Workflow Automation Script

### Script Location

```
scripts/certification-workflow.sh
```

### Usage

```bash
./scripts/certification-workflow.sh [VHD_PATH] [OPTIONS]
```

### Configuration

Edit the script to configure your Azure environment:

```bash
# Azure Configuration
RESOURCE_GROUP="certification-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="certstg$(date +%s)"
VM_NAME="cert-vm"
VM_SIZE="Standard_D2s_v3"

# Report Configuration
REPORT_DIR="./certification-reports"
```

### Workflow Phases

#### Phase 1: Setup Environment

**Actions:**
- Check Azure CLI installation
- Verify Azure login
- Create resource group
- Set default subscription

**Output:**
```
[INFO] Setting up Azure environment...
[INFO] Checking Azure CLI installation...
[SUCCESS] Azure CLI is installed
[INFO] Checking Azure login...
[SUCCESS] Already logged in to Azure
[INFO] Creating resource group: certification-rg
[SUCCESS] Resource group created
```

#### Phase 2: Prepare VHD

**Actions:**
- Validate VHD file exists
- Create storage account
- Upload VHD to blob storage
- Convert VHD to managed disk

**Output:**
```
[INFO] Preparing VHD file...
[INFO] Validating VHD file: /data/ubuntu-vm.vhd
[SUCCESS] VHD file exists (30 GB)
[INFO] Creating storage account: certstg1705327822
[SUCCESS] Storage account created
[INFO] Uploading VHD to blob storage...
[SUCCESS] VHD uploaded (30 GB in 15m 30s)
[INFO] Converting to managed disk...
[SUCCESS] Managed disk created
```

#### Phase 3: Validate VHD

**Actions:**
- Run basic VHD validation checks
- Verify VHD format and size
- Check VHD alignment

**Output:**
```
[INFO] Validating VHD...
[INFO] Checking VHD format...
[SUCCESS] VHD format: Fixed
[INFO] Checking VHD size...
[SUCCESS] VHD size: 30 GB (within limits)
[INFO] Checking VHD alignment...
[SUCCESS] VHD is properly aligned
```

#### Phase 4: Run Certification Tests

**Actions:**
- Create VM from VHD
- Run all certification tests
- Capture test results

**Output:**
```
[INFO] Running certification tests...
[INFO] Creating VM from VHD...
[SUCCESS] VM created: cert-vm
[INFO] Running tests...
[SUCCESS] All tests completed
[INFO] Overall Status: PASSED
[INFO] Score: 95/100
```

#### Phase 5: Generate Reports

**Actions:**
- Generate HTML report
- Generate JSON report
- Generate XML report
- Create report directory structure

**Output:**
```
[INFO] Generating reports...
[SUCCESS] HTML report: ./certification-reports/report.html
[SUCCESS] JSON report: ./certification-reports/report.json
[SUCCESS] XML report: ./certification-reports/report.xml
```

#### Phase 6: Prepare Partner Center Submission

**Actions:**
- Create submission package directory
- Generate metadata file
- Copy reports to package
- Create submission checklist

**Output:**
```
[INFO] Preparing Partner Center submission...
[INFO] Creating submission package...
[SUCCESS] Package created: ./partner-center-submission/
[INFO] Files included:
  - certification-report.html
  - certification-report.json
  - certification-report.xml
  - metadata.json
  - SUBMISSION_CHECKLIST.md
[SUCCESS] Ready for Partner Center submission
```

### Complete Workflow Example

```bash
# Run the complete workflow
./scripts/certification-workflow.sh /data/ubuntu-vm.vhd

# Expected duration: 20-30 minutes
# Expected output: Reports and submission package
```

---

## API Documentation

### CertificationTestRunner

**Location:** `src/azure/certification-tests.ts`

#### Class: `CertificationTestRunner`

```typescript
class CertificationTestRunner {
  constructor(config: CertificationTestConfig);
  
  // Test execution methods
  async runAll(): Promise<CertificationResults>;
  async runVhdValidation(): Promise<VHDValidation>;
  async runSecurityScan(): Promise<SecurityScan>;
  async runGeneralizationCheck(): Promise<TestResult[]>;
  async runConfigurationValidation(): Promise<TestResult[]>;
  async runPerformanceBenchmark(): Promise<PerformanceBenchmark>;
  async runComplianceCheck(): Promise<TestResult[]>;
  
  // Utility methods
  getSummary(): CertificationSummary;
  getTestsByCategory(): Map<TestCategory, TestResult[]>;
}
```

#### Constructor Options

```typescript
interface CertificationTestConfig {
  vhdPath: string;                    // Path to VHD file (required)
  skipSecurityScan?: boolean;         // Skip security tests (default: false)
  skipPerformanceTest?: boolean;      // Skip performance tests (default: false)
  verboseOutput?: boolean;            // Enable verbose logging (default: false)
  azureSubscriptionId?: string;       // Azure subscription ID
  azureResourceGroup?: string;        // Azure resource group name
  customTests?: TestFunction[];       // Custom test functions
}
```

#### Return Types

```typescript
interface CertificationResults {
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
  tests: TestResult[];
  vhdValidation?: VHDValidation;
  securityScan?: SecurityScan;
  performanceBenchmark?: PerformanceBenchmark;
  recommendations: string[];
  errors: string[];
}

interface TestResult {
  category: TestCategory;
  name: string;
  status: TestStatus;
  message: string;
  duration: number;
  timestamp: Date;
  details?: Record<string, any>;
}

enum TestStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
  SKIPPED = 'SKIPPED',
  RUNNING = 'RUNNING'
}

enum TestCategory {
  VHD_VALIDATION = 'VHD_VALIDATION',
  SECURITY = 'SECURITY',
  GENERALIZATION = 'GENERALIZATION',
  CONFIGURATION = 'CONFIGURATION',
  PERFORMANCE = 'PERFORMANCE',
  COMPLIANCE = 'COMPLIANCE'
}
```

#### Usage Example

```typescript
import { CertificationTestRunner } from './azure/certification-tests';

const runner = new CertificationTestRunner({
  vhdPath: '/data/ubuntu-vm.vhd',
  skipSecurityScan: false,
  skipPerformanceTest: false,
  verboseOutput: true,
  azureSubscriptionId: 'your-subscription-id',
  azureResourceGroup: 'certification-rg'
});

const results = await runner.runAll();

console.log(`Overall Status: ${results.overallStatus}`);
console.log(`Score: ${results.score}/100`);
console.log(`Passed: ${results.passedTests}`);
console.log(`Failed: ${results.failedTests}`);
console.log(`Duration: ${results.duration}ms`);
```

### CertificationReportGenerator

**Location:** `src/azure/certification-report.ts`

#### Class: `CertificationReportGenerator`

```typescript
class CertificationReportGenerator {
  constructor(results: CertificationResults, config?: ReportConfig);
  
  // Format generation methods
  async generateHTML(): Promise<string>;
  async generateJSON(): Promise<string>;
  async generateXML(): Promise<string>;
  
  // File operations
  async saveReport(format: ReportFormat, outputPath?: string): Promise<string>;
  async saveAllFormats(outputDir?: string): Promise<Map<ReportFormat, string>>;
}
```

#### Constructor Options

```typescript
interface ReportConfig {
  templatePath?: string;                      // Custom HTML template path
  includeSensitiveData?: boolean;            // Include sensitive data (default: false)
  customSections?: Map<string, string>;      // Custom report sections
}

enum ReportFormat {
  HTML = 'html',
  JSON = 'json',
  XML = 'xml'
}
```

#### Usage Example

```typescript
import { CertificationReportGenerator, ReportFormat } from './azure/certification-report';

const generator = new CertificationReportGenerator(results, {
  templatePath: './custom-template.hbs',
  includeSensitiveData: false
});

// Generate HTML report
const htmlContent = await generator.generateHTML();
console.log(htmlContent);

// Generate JSON report
const jsonContent = await generator.generateJSON();
const parsed = JSON.parse(jsonContent);

// Generate XML report
const xmlContent = await generator.generateXML();

// Save report to file
const reportPath = await generator.saveReport(ReportFormat.HTML, './report.html');
console.log(`Report saved: ${reportPath}`);

// Save all formats
const reportPaths = await generator.saveAllFormats('./reports');
reportPaths.forEach((path, format) => {
  console.log(`${format}: ${path}`);
});
```

### Helper Functions

```typescript
// Batch test multiple VHDs
async function runBatchTests(
  vhdPaths: string[],
  config?: Partial<CertificationTestConfig>
): Promise<Map<string, CertificationResults>>;

// Quick validation (VHD + basic checks only)
async function quickValidate(
  vhdPath: string
): Promise<{ valid: boolean; errors: string[] }>;
```

#### Usage Example

```typescript
import { runBatchTests, quickValidate } from './azure/certification-tests';

// Batch testing
const vhdPaths = [
  '/data/ubuntu-vm.vhd',
  '/data/centos-vm.vhd',
  '/data/rhel-vm.vhd'
];

const batchResults = await runBatchTests(vhdPaths, {
  skipPerformanceTest: true,
  verboseOutput: false
});

batchResults.forEach((results, vhdPath) => {
  console.log(`${vhdPath}: ${results.overallStatus} (${results.score}/100)`);
});

// Quick validation
const quickResult = await quickValidate('/data/test-vm.vhd');
if (quickResult.valid) {
  console.log('VHD is valid!');
} else {
  console.error('Validation errors:', quickResult.errors);
}
```

---

## Integration Examples

### Example 1: CI/CD Pipeline Integration

**GitHub Actions Workflow:**

```yaml
name: VM Certification

on:
  push:
    branches: [ main ]
    paths:
      - 'vhd-images/**'

jobs:
  certify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install certification tools
        run: npm install -g @hoiltd/azmp-plugin-vm
      
      - name: Run certification tests
        run: |
          azmp-plugin-vm vm run-certification \
            --vhd ./vhd-images/ubuntu-vm.vhd \
            --format json \
            --output ./certification-results.json
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: certification-report
          path: ./certification-results.json
      
      - name: Check certification status
        run: |
          STATUS=$(jq -r '.results.overallStatus' certification-results.json)
          SCORE=$(jq -r '.results.score' certification-results.json)
          echo "Status: $STATUS"
          echo "Score: $SCORE"
          if [ "$STATUS" != "PASSED" ]; then
            echo "Certification failed!"
            exit 1
          fi
```

### Example 2: Automated Testing Script

**test-vhd.sh:**

```bash
#!/bin/bash

VHD_PATH="$1"
MIN_SCORE=90

echo "Testing VHD: $VHD_PATH"

# Run certification tests
azmp-plugin-vm vm run-certification \
  --vhd "$VHD_PATH" \
  --format json \
  --output ./results.json

# Parse results
STATUS=$(jq -r '.results.overallStatus' results.json)
SCORE=$(jq -r '.results.score' results.json)
FAILED=$(jq -r '.results.failedTests' results.json)

echo "Status: $STATUS"
echo "Score: $SCORE/100"
echo "Failed Tests: $FAILED"

# Check if passed
if [ "$STATUS" = "PASSED" ] && [ "$SCORE" -ge "$MIN_SCORE" ]; then
  echo "✓ VHD passed certification!"
  exit 0
else
  echo "✗ VHD failed certification"
  echo "Recommendations:"
  jq -r '.results.recommendations[]' results.json
  exit 1
fi
```

### Example 3: Node.js Integration

**certify.js:**

```javascript
const { CertificationTestRunner } = require('@hoiltd/azmp-plugin-vm/dist/azure/certification-tests');
const { CertificationReportGenerator } = require('@hoiltd/azmp-plugin-vm/dist/azure/certification-report');

async function certifyVHD(vhdPath) {
  console.log(`Certifying VHD: ${vhdPath}`);
  
  // Run tests
  const runner = new CertificationTestRunner({
    vhdPath,
    verboseOutput: true
  });
  
  const results = await runner.runAll();
  
  // Generate report
  const generator = new CertificationReportGenerator(results);
  await generator.saveAllFormats('./reports');
  
  // Return results
  return {
    status: results.overallStatus,
    score: results.score,
    passed: results.passedTests,
    failed: results.failedTests,
    reportPath: './reports/certification-report.html'
  };
}

// Usage
certifyVHD('/data/ubuntu-vm.vhd')
  .then(result => {
    console.log(`Status: ${result.status}`);
    console.log(`Score: ${result.score}/100`);
    console.log(`Report: ${result.reportPath}`);
  })
  .catch(error => {
    console.error('Certification failed:', error);
    process.exit(1);
  });
```

### Example 4: REST API Integration

**api-server.js:**

```javascript
const express = require('express');
const multer = require('multer');
const { CertificationTestRunner } = require('@hoiltd/azmp-plugin-vm/dist/azure/certification-tests');
const { CertificationReportGenerator } = require('@hoiltd/azmp-plugin-vm/dist/azure/certification-report');

const app = express();
const upload = multer({ dest: 'uploads/' });

// POST /api/certify - Upload and certify VHD
app.post('/api/certify', upload.single('vhd'), async (req, res) => {
  try {
    const vhdPath = req.file.path;
    
    // Run certification
    const runner = new CertificationTestRunner({ vhdPath });
    const results = await runner.runAll();
    
    // Generate report
    const generator = new CertificationReportGenerator(results);
    const jsonReport = await generator.generateJSON();
    
    res.json(JSON.parse(jsonReport));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certify/:id - Get certification status
app.get('/api/certify/:id', async (req, res) => {
  // Implementation for retrieving stored results
});

app.listen(3000, () => {
  console.log('Certification API running on port 3000');
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: VHD Format Not Supported

**Error:**
```
VHD format validation failed: Dynamic VHD not supported
```

**Solution:**
Convert dynamic VHD to fixed format:
```bash
# Using Azure CLI
az disk create \
  --resource-group myResourceGroup \
  --name myDisk \
  --source /path/to/dynamic.vhd \
  --hyper-v-generation V1

# Using Hyper-V (Windows)
Convert-VHD -Path dynamic.vhd -DestinationPath fixed.vhd -VHDType Fixed
```

#### Issue 2: VHD Size Too Large

**Error:**
```
VHD size validation failed: VHD size (2TB) exceeds maximum (1TB)
```

**Solution:**
Resize the VHD or use a smaller disk:
```bash
# Resize VHD (Linux)
qemu-img resize disk.vhd 1T

# Create new VM with smaller disk
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image UbuntuLTS \
  --os-disk-size-gb 1023
```

#### Issue 3: Security Scan Failures

**Error:**
```
Credential scan failed: Hardcoded credentials found
```

**Solution:**
Remove credentials from VHD:
```bash
# Remove SSH keys
sudo rm -rf /home/*/.ssh/authorized_keys
sudo rm -rf /root/.ssh/authorized_keys

# Remove bash history
sudo rm -rf /home/*/.bash_history
sudo rm -rf /root/.bash_history

# Remove cloud-init data
sudo rm -rf /var/lib/cloud
```

#### Issue 4: Generalization Check Failures

**Error:**
```
VM generalization check failed: VM is not generalized
```

**Solution:**

**Linux:**
```bash
# Generalize Linux VM
sudo waagent -deprovision+user -force
sudo rm -rf /var/lib/cloud
sudo cloud-init clean --logs
```

**Windows:**
```powershell
# Generalize Windows VM
C:\Windows\System32\Sysprep\sysprep.exe /generalize /oobe /shutdown
```

#### Issue 5: Performance Benchmark Failures

**Error:**
```
Boot time benchmark failed: Boot time (5 minutes) exceeds maximum (2 minutes)
```

**Solution:**
Optimize VM boot time:
```bash
# Disable unnecessary services (Linux)
sudo systemctl disable <service-name>

# Clean up unnecessary packages
sudo apt-get autoremove
sudo apt-get clean

# Update kernel to latest version
sudo apt-get update
sudo apt-get upgrade linux-image-generic
```

### Debug Mode

Enable verbose output for detailed debugging:

```bash
azmp-plugin-vm vm run-certification \
  --vhd /data/ubuntu-vm.vhd \
  --verbose
```

This will output:
- Detailed test execution logs
- Timing information for each test
- Azure API call details
- File I/O operations
- Error stack traces

### Logs Location

Certification logs are stored in:
```
~/.azmp-plugin-vm/logs/certification-TIMESTAMP.log
```

View logs:
```bash
tail -f ~/.azmp-plugin-vm/logs/certification-*.log
```

---

## Best Practices

### 1. Pre-Certification Checklist

Before running certification tests:

- ✅ VM is properly generalized (Linux: waagent, Windows: Sysprep)
- ✅ All credentials and SSH keys removed
- ✅ VHD is in fixed format (not dynamic)
- ✅ VHD size is within Azure limits (≤ 1023 GB for OS disk)
- ✅ Azure VM agent is installed and configured
- ✅ VM boots successfully
- ✅ All required software is installed
- ✅ Boot diagnostics are enabled
- ✅ Security updates are applied
- ✅ Documentation is prepared

### 2. Testing Strategy

**Development Phase:**
```bash
# Quick validation during development
azmp-plugin-vm vm run-certification \
  --vhd /data/dev-vm.vhd \
  --skip-security \
  --skip-performance
```

**Pre-Production Phase:**
```bash
# Full certification before submission
azmp-plugin-vm vm run-certification \
  --vhd /data/prod-vm.vhd \
  --format all \
  --output ./reports
```

**Production Phase:**
```bash
# Complete workflow with Partner Center preparation
./scripts/certification-workflow.sh /data/prod-vm.vhd
```

### 3. Batch Testing

Test multiple VHD variants:

```bash
azmp-plugin-vm vm run-certification \
  --batch \
    /data/ubuntu-18.04-vm.vhd \
    /data/ubuntu-20.04-vm.vhd \
    /data/ubuntu-22.04-vm.vhd \
  --format json \
  --output ./batch-results
```

### 4. CI/CD Integration

Automate certification in your CI/CD pipeline:

```yaml
# .github/workflows/certify.yml
name: Certify VHD
on: [push]
jobs:
  certify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run certification
        run: |
          npm install -g @hoiltd/azmp-plugin-vm
          azmp-plugin-vm vm run-certification \
            --vhd ./vhd-images/*.vhd \
            --format json
```

### 5. Report Management

Organize reports by version and date:

```bash
# Create version-specific report directory
REPORT_DIR="./reports/v1.2.0/$(date +%Y-%m-%d)"
mkdir -p "$REPORT_DIR"

# Generate reports
azmp-plugin-vm vm run-certification \
  --vhd /data/vm-v1.2.0.vhd \
  --format all \
  --output "$REPORT_DIR"
```

### 6. Security Best Practices

- Always run security scans (don't use `--skip-security`)
- Remove all credentials before testing
- Use dedicated test Azure subscriptions
- Rotate Azure credentials regularly
- Enable audit logging for compliance

### 7. Performance Optimization

- Test on representative VM sizes
- Use Azure regions close to your users
- Enable accelerated networking when possible
- Optimize boot time (< 2 minutes recommended)
- Test disk I/O performance

---

## Partner Center Submission

### Step 1: Run Complete Certification

```bash
./scripts/certification-workflow.sh /data/production-vm.vhd
```

This creates a `partner-center-submission/` directory with:
- `certification-report.html`
- `certification-report.json`
- `certification-report.xml`
- `metadata.json`
- `SUBMISSION_CHECKLIST.md`

### Step 2: Review Checklist

Open `partner-center-submission/SUBMISSION_CHECKLIST.md`:

```markdown
# Azure Marketplace Submission Checklist

## Pre-Submission
- [ ] All certification tests passed (score ≥ 90)
- [ ] No critical errors
- [ ] VHD is generalized
- [ ] Documentation is complete

## Technical Requirements
- [ ] VHD format: Fixed
- [ ] VHD size: Within limits
- [ ] Azure VM agent installed
- [ ] Boot diagnostics enabled

## Partner Center
- [ ] Create offer in Partner Center
- [ ] Upload VHD to Azure Storage
- [ ] Configure pricing and availability
- [ ] Submit for review
```

### Step 3: Upload to Partner Center

1. Log in to [Partner Center](https://partner.microsoft.com/dashboard/marketplace)
2. Create a new VM offer
3. Upload the VHD
4. Upload certification reports
5. Fill in metadata from `metadata.json`
6. Submit for Microsoft review

### Step 4: Monitor Review Status

Check Partner Center dashboard for:
- Automated validation results
- Manual review feedback
- Certification status updates

---

## FAQ

### Q1: How long does certification take?

**A:** Typical certification time:
- Quick validation (no security/performance): 2-5 minutes
- Full certification: 15-30 minutes
- Complete workflow (with Azure VM creation): 30-60 minutes

### Q2: What's a passing score?

**A:** Score guidelines:
- **90-100**: Ready for submission
- **70-89**: Review recommendations
- **Below 70**: Needs improvement

### Q3: Can I skip security scans?

**A:** Yes, for development testing only:
```bash
azmp-plugin-vm vm run-certification \
  --vhd /data/vm.vhd \
  --skip-security
```

**Warning:** Don't skip security scans for production submissions.

### Q4: How do I customize the HTML report?

**A:** Provide a custom Handlebars template:
```typescript
const generator = new CertificationReportGenerator(results, {
  templatePath: './my-custom-template.hbs'
});
```

### Q5: Can I add custom tests?

**A:** Yes, provide custom test functions:
```typescript
const customTest = async (vhdPath: string) => {
  // Your custom validation logic
  return {
    category: 'CUSTOM',
    name: 'My custom test',
    status: 'PASSED',
    message: 'Test passed',
    duration: 100
  };
};

const runner = new CertificationTestRunner({
  vhdPath: '/data/vm.vhd',
  customTests: [customTest]
});
```

### Q6: What VHD formats are supported?

**A:** Azure Marketplace requires:
- Format: Fixed VHD (not VHDX or dynamic VHD)
- Size: 1 MB to 1023 GB for OS disks
- Alignment: 512-byte boundary

### Q7: How do I troubleshoot test failures?

**A:** Steps to troubleshoot:
1. Enable verbose output: `--verbose`
2. Review test logs in `~/.azmp-plugin-vm/logs/`
3. Check specific test error messages in the report
4. Review recommendations section
5. Consult documentation for specific test category

### Q8: Can I run tests offline?

**A:** Limited functionality offline:
- VHD validation: ✅ Yes
- Security scan: ✅ Yes (local scanning)
- Generalization check: ✅ Yes
- Configuration validation: ⚠️ Partial (some checks require Azure)
- Performance benchmark: ❌ No (requires Azure VM)
- Compliance check: ⚠️ Partial

---

## Additional Resources

### Documentation

- [Azure Marketplace Documentation](https://docs.microsoft.com/azure/marketplace/)
- [VM Certification Requirements](https://docs.microsoft.com/azure/marketplace/azure-vm-certification)
- [Partner Center Guide](https://docs.microsoft.com/partner-center/)
- [Azure VM Image Builder](https://docs.microsoft.com/azure/virtual-machines/image-builder-overview)

### Tools

- [Azure CLI](https://docs.microsoft.com/cli/azure/)
- [Azure PowerShell](https://docs.microsoft.com/powershell/azure/)
- [Packer by HashiCorp](https://www.packer.io/docs/builders/azure)
- [Azure SDK for Node.js](https://docs.microsoft.com/javascript/api/overview/azure/)

### Support

- GitHub Issues: [azmp-plugin-vm/issues](https://github.com/hoiltd/azmp-plugin-vm/issues)
- Azure Support: [Azure Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- Partner Center Support: [Partner Dashboard](https://partner.microsoft.com/support)

---

## Changelog

### Version 1.0.0 (2024-01-15)

**Initial Release**

✅ **Core Features:**
- Certification test framework with 6 test categories
- Multi-format report generation (HTML, JSON, XML)
- CLI command with comprehensive options
- Workflow automation script
- Batch testing support

✅ **Test Categories:**
- VHD validation
- Security scanning
- Generalization checks
- Configuration validation
- Performance benchmarking
- Compliance verification

✅ **Integrations:**
- Azure CLI integration
- Partner Center preparation
- CI/CD pipeline examples
- REST API examples

✅ **Documentation:**
- Complete user guide
- API documentation
- Integration examples
- Troubleshooting guide

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/hoiltd/azmp-plugin-vm.git
cd azmp-plugin-vm

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

### Testing Your Changes

```bash
# Run certification tests on sample VHD
npm run test:certification -- /path/to/test-vm.vhd

# Generate all report formats
npm run test:reports

# Run workflow script
./scripts/certification-workflow.sh /path/to/test-vm.vhd
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Maintained By:** Azure Marketplace Plugin Team
