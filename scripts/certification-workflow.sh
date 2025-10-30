#!/bin/bash

###############################################################################
# Azure VM Certification Workflow Script
# End-to-end automation for Azure Marketplace VM certification
#
# Workflow: Prepare → Validate → Test → Report → Submit
#
# Usage:
#   ./certification-workflow.sh --vhd-path /path/to/vm.vhd [options]
#
# Requirements:
#   - Azure CLI installed and authenticated
#   - VHD file prepared and generalized
#   - azmp-plugin-vm CLI tool installed
#   - Azure Marketplace Partner Center account configured
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
VHD_PATH=""
VM_SIZE="Standard_D2s_v3"
REGION="eastus"
OUTPUT_DIR="./certification-results"
FORMATS="html,json,xml"
STORAGE_ACCOUNT=""
CONTAINER_NAME="vhds"
RESOURCE_GROUP=""
SKIP_UPLOAD=false
SKIP_TESTS=false
SKIP_SUBMIT=false
VERBOSE=false
COMPANY_NAME=""
PROJECT_NAME=""

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
}

# Function to print help
print_help() {
    cat << EOF
Azure VM Certification Workflow Script
======================================

Automates the end-to-end Azure Marketplace VM certification process:
  1. Prepare: Check prerequisites and validate VHD
  2. Upload: Upload VHD to Azure Storage (optional)
  3. Test: Run certification tests
  4. Report: Generate certification reports
  5. Submit: Prepare for Partner Center submission (optional)

Usage:
  ./certification-workflow.sh --vhd-path <path> [options]

Required Arguments:
  --vhd-path <path>              Path to VHD file

Optional Arguments:
  --vm-size <size>               Azure VM size (default: Standard_D2s_v3)
  --region <region>              Azure region (default: eastus)
  --output-dir <dir>             Output directory (default: ./certification-results)
  --formats <formats>            Report formats (default: html,json,xml)
  --company <name>               Company name for reports
  --project <name>               Project name for reports

Azure Upload Options:
  --storage-account <name>       Azure Storage account name
  --container <name>             Storage container name (default: vhds)
  --resource-group <name>        Azure resource group
  --skip-upload                  Skip VHD upload to Azure

Workflow Options:
  --skip-tests                   Skip certification tests
  --skip-submit                  Skip Partner Center submission preparation
  --verbose                      Enable verbose output
  --help, -h                     Show this help message

Examples:
  # Basic certification workflow
  ./certification-workflow.sh --vhd-path ./my-vm.vhd

  # Full workflow with Azure upload
  ./certification-workflow.sh \\
    --vhd-path ./my-vm.vhd \\
    --storage-account mystorageacct \\
    --resource-group myresourcegroup \\
    --company "Acme Corp" \\
    --project "Ubuntu Server 22.04"

  # Test only (skip upload and submission)
  ./certification-workflow.sh \\
    --vhd-path ./my-vm.vhd \\
    --skip-upload \\
    --skip-submit

For more information, visit:
https://docs.microsoft.com/azure/marketplace/azure-vm-certification

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --vhd-path)
            VHD_PATH="$2"
            shift 2
            ;;
        --vm-size)
            VM_SIZE="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --formats)
            FORMATS="$2"
            shift 2
            ;;
        --storage-account)
            STORAGE_ACCOUNT="$2"
            shift 2
            ;;
        --container)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        --resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --company)
            COMPANY_NAME="$2"
            shift 2
            ;;
        --project)
            PROJECT_NAME="$2"
            shift 2
            ;;
        --skip-upload)
            SKIP_UPLOAD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-submit)
            SKIP_SUBMIT=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            print_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            print_help
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$VHD_PATH" ]; then
    print_error "VHD path is required. Use --vhd-path <path>"
    print_help
    exit 1
fi

if [ ! -f "$VHD_PATH" ]; then
    print_error "VHD file not found: $VHD_PATH"
    exit 1
fi

# Print configuration
print_step "Azure VM Certification Workflow"
print_info "Configuration:"
print_info "  VHD Path:       $VHD_PATH"
print_info "  VM Size:        $VM_SIZE"
print_info "  Region:         $REGION"
print_info "  Output Dir:     $OUTPUT_DIR"
print_info "  Report Formats: $FORMATS"
[ -n "$COMPANY_NAME" ] && print_info "  Company:        $COMPANY_NAME"
[ -n "$PROJECT_NAME" ] && print_info "  Project:        $PROJECT_NAME"

# Create output directory
mkdir -p "$OUTPUT_DIR"

###############################################################################
# STEP 1: PREPARE - Check prerequisites and validate VHD
###############################################################################

print_step "Step 1: Prepare - Checking Prerequisites"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install from https://aka.ms/azure-cli"
    exit 1
fi
print_success "Azure CLI installed"

# Check if Azure CLI is authenticated (if upload is not skipped)
if [ "$SKIP_UPLOAD" = false ]; then
    if ! az account show &> /dev/null; then
        print_error "Not authenticated with Azure CLI. Run 'az login' first."
        exit 1
    fi
    print_success "Azure CLI authenticated"
fi

# Check if azmp-plugin-vm is available
if ! command -v azmp-plugin-vm &> /dev/null; then
    if ! command -v npx &> /dev/null; then
        print_error "Neither azmp-plugin-vm nor npx found. Please install Node.js and the plugin."
        exit 1
    fi
    print_warning "azmp-plugin-vm not in PATH, will use npx"
    AZMP_CMD="npx azmp-plugin-vm"
else
    AZMP_CMD="azmp-plugin-vm"
fi
print_success "Certification tool available"

# Quick VHD validation
print_info "Running quick VHD validation..."
if $AZMP_CMD vm run-certification --vhd-path "$VHD_PATH" --quick; then
    print_success "VHD format validation passed"
else
    print_error "VHD format validation failed"
    exit 1
fi

###############################################################################
# STEP 2: UPLOAD - Upload VHD to Azure Storage (optional)
###############################################################################

if [ "$SKIP_UPLOAD" = false ]; then
    print_step "Step 2: Upload VHD to Azure Storage"

    if [ -z "$STORAGE_ACCOUNT" ] || [ -z "$RESOURCE_GROUP" ]; then
        print_warning "Storage account or resource group not specified, skipping upload"
        SKIP_UPLOAD=true
    else
        print_info "Checking if storage account exists..."
        if ! az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
            print_error "Storage account '$STORAGE_ACCOUNT' not found in resource group '$RESOURCE_GROUP'"
            exit 1
        fi
        print_success "Storage account found"

        # Get storage account key
        print_info "Retrieving storage account key..."
        STORAGE_KEY=$(az storage account keys list --account-name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" --query "[0].value" -o tsv)
        if [ -z "$STORAGE_KEY" ]; then
            print_error "Failed to retrieve storage account key"
            exit 1
        fi

        # Check if container exists, create if not
        print_info "Checking if container '$CONTAINER_NAME' exists..."
        if ! az storage container show --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --account-key "$STORAGE_KEY" &> /dev/null; then
            print_info "Creating container '$CONTAINER_NAME'..."
            az storage container create --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --account-key "$STORAGE_KEY"
            print_success "Container created"
        else
            print_success "Container exists"
        fi

        # Upload VHD
        VHD_NAME=$(basename "$VHD_PATH")
        print_info "Uploading VHD to Azure Storage..."
        print_info "This may take several minutes depending on VHD size..."
        
        if az storage blob upload \
            --account-name "$STORAGE_ACCOUNT" \
            --account-key "$STORAGE_KEY" \
            --container-name "$CONTAINER_NAME" \
            --name "$VHD_NAME" \
            --file "$VHD_PATH" \
            --type page \
            --overwrite; then
            print_success "VHD uploaded successfully"
            
            # Get VHD URL
            VHD_URL=$(az storage blob url \
                --account-name "$STORAGE_ACCOUNT" \
                --account-key "$STORAGE_KEY" \
                --container-name "$CONTAINER_NAME" \
                --name "$VHD_NAME" \
                -o tsv)
            print_info "VHD URL: $VHD_URL"
            echo "$VHD_URL" > "$OUTPUT_DIR/vhd-url.txt"
        else
            print_error "VHD upload failed"
            exit 1
        fi
    fi
else
    print_step "Step 2: Upload VHD to Azure Storage - SKIPPED"
fi

###############################################################################
# STEP 3: TEST - Run certification tests
###############################################################################

if [ "$SKIP_TESTS" = false ]; then
    print_step "Step 3: Run Certification Tests"

    CERT_CMD="$AZMP_CMD vm run-certification --vhd-path $VHD_PATH --vm-size $VM_SIZE --region $REGION --output-dir $OUTPUT_DIR --formats $FORMATS"
    
    [ -n "$COMPANY_NAME" ] && CERT_CMD="$CERT_CMD --company \"$COMPANY_NAME\""
    [ -n "$PROJECT_NAME" ] && CERT_CMD="$CERT_CMD --project \"$PROJECT_NAME\""
    [ "$VERBOSE" = true ] && CERT_CMD="$CERT_CMD --verbose"

    print_info "Running certification tests..."
    print_info "Command: $CERT_CMD"
    
    if eval $CERT_CMD; then
        print_success "Certification tests passed"
    else
        print_error "Certification tests failed"
        print_info "Check reports in: $OUTPUT_DIR"
        exit 1
    fi
else
    print_step "Step 3: Run Certification Tests - SKIPPED"
fi

###############################################################################
# STEP 4: REPORT - Certification reports generated
###############################################################################

print_step "Step 4: Certification Reports"

if [ -d "$OUTPUT_DIR" ]; then
    print_info "Reports generated in: $OUTPUT_DIR"
    print_info "Available reports:"
    ls -lh "$OUTPUT_DIR" | grep -v "^total" | awk '{print "  - " $9 " (" $5 ")"}'
    
    # Find HTML report and print location
    HTML_REPORT=$(find "$OUTPUT_DIR" -name "*.html" -type f | head -n 1)
    if [ -n "$HTML_REPORT" ]; then
        print_info "HTML Report: file://$PWD/$HTML_REPORT"
    fi
else
    print_warning "Output directory not found: $OUTPUT_DIR"
fi

###############################################################################
# STEP 5: SUBMIT - Prepare for Partner Center submission
###############################################################################

if [ "$SKIP_SUBMIT" = false ]; then
    print_step "Step 5: Prepare for Partner Center Submission"

    # Create submission checklist
    CHECKLIST_FILE="$OUTPUT_DIR/submission-checklist.md"
    
    cat > "$CHECKLIST_FILE" << EOF
# Azure Marketplace Submission Checklist

## VHD Requirements
- [ ] VHD is in fixed format (not dynamic or differencing)
- [ ] VHD size is between 1-1023 GB
- [ ] VHD size is 1MB aligned
- [ ] VHD is generalized (sysprep for Windows, waagent for Linux)
- [ ] No default credentials or SSH keys present
- [ ] No malware detected
- [ ] Azure Guest Agent installed and configured

## Testing
- [ ] Certification tests passed with score ≥ 90/100
- [ ] Security scan completed with no critical vulnerabilities
- [ ] Performance benchmarks meet Azure requirements:
  - Boot time < 60 seconds
  - Disk read > 100 MB/s
  - Disk write > 80 MB/s
  - Disk IOPS > 1000
- [ ] Compliance checks passed

## Documentation
- [ ] Product description ready
- [ ] Screenshots prepared (5 minimum)
- [ ] User guide/documentation available
- [ ] Support contact information ready
- [ ] Pricing model defined
- [ ] Terms and conditions reviewed

## Azure Partner Center
- [ ] Partner Center account created and verified
- [ ] Publisher profile completed
- [ ] New offer created (Virtual Machine)
- [ ] Offer configured with VM plan
- [ ] VHD uploaded to Azure Storage and URL provided
- [ ] Technical configuration completed
- [ ] Offer preview generated
- [ ] Offer tested in preview environment
- [ ] Ready for submission to Microsoft for review

## Next Steps
1. Review certification report: $OUTPUT_DIR
2. Address any warnings or recommendations
3. Log in to Azure Partner Center: https://partner.microsoft.com/dashboard/marketplace
4. Navigate to: Commercial Marketplace → Virtual Machine Offer
5. Follow the submission wizard with the information above
6. Provide VHD URL: $([ -f "$OUTPUT_DIR/vhd-url.txt" ] && cat "$OUTPUT_DIR/vhd-url.txt" || echo "N/A - VHD not uploaded")

## Resources
- Azure Marketplace Documentation: https://docs.microsoft.com/azure/marketplace/
- VM Certification Guide: https://docs.microsoft.com/azure/marketplace/azure-vm-certification
- Partner Center Help: https://docs.microsoft.com/partner-center/

Generated: $(date)
EOF

    print_success "Submission checklist created: $CHECKLIST_FILE"
    
    # Print summary
    print_info "\nNext Steps for Azure Marketplace Submission:"
    print_info "1. Review the certification report and checklist"
    print_info "2. Address any warnings or recommendations"
    print_info "3. Log in to Azure Partner Center"
    print_info "4. Create or update your Virtual Machine offer"
    print_info "5. Upload VHD or provide VHD URL"
    print_info "6. Submit offer for Microsoft review"
    print_info "\nChecklist: $CHECKLIST_FILE"
else
    print_step "Step 5: Prepare for Partner Center Submission - SKIPPED"
fi

###############################################################################
# COMPLETION
###############################################################################

print_step "Certification Workflow Complete"

print_success "All steps completed successfully!"
print_info "\nResults Summary:"
print_info "  - VHD validated: ✓"
[ "$SKIP_UPLOAD" = false ] && print_info "  - VHD uploaded: ✓" || print_info "  - VHD uploaded: skipped"
[ "$SKIP_TESTS" = false ] && print_info "  - Certification tests: ✓" || print_info "  - Certification tests: skipped"
print_info "  - Reports generated: ✓"
[ "$SKIP_SUBMIT" = false ] && print_info "  - Submission checklist: ✓" || print_info "  - Submission checklist: skipped"

print_info "\nOutput directory: $OUTPUT_DIR"

# Open HTML report if available
if [ "$SKIP_TESTS" = false ] && [ -n "$HTML_REPORT" ]; then
    read -p "Would you like to open the HTML report? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$HTML_REPORT"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$HTML_REPORT"
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            start "$HTML_REPORT"
        fi
        print_success "Opened HTML report in browser"
    fi
fi

exit 0
