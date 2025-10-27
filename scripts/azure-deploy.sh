#!/bin/bash
################################################################################
# Azure VM Deployment Quickstart Script
# Phase 5 - Live Azure Deployment Automation
#
# Purpose: Automate Azure resource group creation and ARM template deployment
# Usage: ./scripts/azure-deploy.sh [options]
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-rg-azmp-vm-test}"
LOCATION="${AZURE_LOCATION:-eastus}"
DEPLOYMENT_NAME="azmp-vm-deployment-$(date +%Y%m%d-%H%M%S)"
TEMPLATE_DIR="${TEMPLATE_DIR:-./test-deployment}"
PARAMETERS_FILE="${PARAMETERS_FILE:-}"
DRY_RUN="${DRY_RUN:-false}"
SKIP_RG_CREATE="${SKIP_RG_CREATE:-false}"
VERBOSE="${VERBOSE:-false}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════════╗"
    echo "║           Azure VM Template - Quickstart Deployment Script                ║"
    echo "╚════════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI (az) is not installed"
        echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    log_success "Azure CLI installed: $(az version --query '\"azure-cli\"' -o tsv)"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed (optional, but recommended for JSON parsing)"
    else
        log_success "jq installed: $(jq --version)"
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure"
        echo "Please run: az login"
        exit 1
    fi
    
    local subscription_name=$(az account show --query name -o tsv)
    local subscription_id=$(az account show --query id -o tsv)
    log_success "Logged in to Azure subscription: $subscription_name ($subscription_id)"
    
    # Check if template files exist
    if [[ ! -f "$TEMPLATE_DIR/mainTemplate.json" ]]; then
        log_error "mainTemplate.json not found in $TEMPLATE_DIR"
        echo "Please run: node scripts/generate-templates.js"
        exit 1
    fi
    log_success "Template directory found: $TEMPLATE_DIR"
}

create_resource_group() {
    if [[ "$SKIP_RG_CREATE" == "true" ]]; then
        log_info "Skipping resource group creation (--skip-rg-create)"
        return 0
    fi
    
    print_section "Creating Resource Group"
    
    # Check if resource group already exists
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_warning "Resource group '$RESOURCE_GROUP' already exists"
        read -p "Continue with existing resource group? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    else
        log_info "Creating resource group: $RESOURCE_GROUP in $LOCATION"
        
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags "Environment=Test" "Project=AZMP-Plugin-VM" "Phase=5-Validation" \
            --output table
        
        log_success "Resource group created successfully"
    fi
}

validate_template() {
    print_section "Validating ARM Template"
    
    log_info "Validating template syntax and structure..."
    
    local validate_cmd="az deployment group validate \
        --resource-group \"$RESOURCE_GROUP\" \
        --template-file \"$TEMPLATE_DIR/mainTemplate.json\""
    
    if [[ -n "$PARAMETERS_FILE" ]]; then
        validate_cmd="$validate_cmd --parameters \"@$PARAMETERS_FILE\""
    fi
    
    if [[ "$VERBOSE" == "true" ]]; then
        validate_cmd="$validate_cmd --verbose"
    fi
    
    if eval "$validate_cmd" &> /dev/null; then
        log_success "Template validation passed"
    else
        log_error "Template validation failed"
        echo "Run with --verbose for detailed error information"
        exit 1
    fi
}

deploy_template() {
    print_section "Deploying ARM Template"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "DRY RUN MODE - No actual deployment will occur"
        echo ""
        echo "Deployment Configuration:"
        echo "  Resource Group:   $RESOURCE_GROUP"
        echo "  Location:         $LOCATION"
        echo "  Deployment Name:  $DEPLOYMENT_NAME"
        echo "  Template File:    $TEMPLATE_DIR/mainTemplate.json"
        echo "  Parameters File:  ${PARAMETERS_FILE:-<none>}"
        return 0
    fi
    
    log_info "Starting deployment: $DEPLOYMENT_NAME"
    log_info "This may take 10-15 minutes..."
    echo ""
    
    local deploy_cmd="az deployment group create \
        --name \"$DEPLOYMENT_NAME\" \
        --resource-group \"$RESOURCE_GROUP\" \
        --template-file \"$TEMPLATE_DIR/mainTemplate.json\""
    
    if [[ -n "$PARAMETERS_FILE" ]]; then
        deploy_cmd="$deploy_cmd --parameters \"@$PARAMETERS_FILE\""
    fi
    
    if [[ "$VERBOSE" == "true" ]]; then
        deploy_cmd="$deploy_cmd --verbose"
    fi
    
    # Start deployment
    local start_time=$(date +%s)
    
    if eval "$deploy_cmd --output json" > /tmp/deployment-output.json; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "Deployment completed successfully in ${duration}s"
        
        # Extract and display outputs
        if command -v jq &> /dev/null; then
            echo ""
            log_info "Deployment Outputs:"
            jq -r '.properties.outputs | to_entries[] | "  • \(.key): \(.value.value)"' /tmp/deployment-output.json 2>/dev/null || true
        fi
    else
        log_error "Deployment failed"
        echo "Check Azure Portal for detailed error information"
        exit 1
    fi
}

display_deployment_info() {
    print_section "Deployment Information"
    
    echo "Resource Group:     $RESOURCE_GROUP"
    echo "Deployment Name:    $DEPLOYMENT_NAME"
    echo "Location:           $LOCATION"
    echo ""
    
    log_info "View deployment in Azure Portal:"
    echo "https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/deployments"
    echo ""
    
    log_info "View resource group:"
    echo "https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/overview"
}

list_resources() {
    print_section "Deployed Resources"
    
    log_info "Listing resources in $RESOURCE_GROUP..."
    echo ""
    
    az resource list \
        --resource-group "$RESOURCE_GROUP" \
        --output table
}

get_deployment_outputs() {
    print_section "Deployment Outputs"
    
    log_info "Fetching deployment outputs..."
    echo ""
    
    az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.outputs" \
        --output json | jq '.' 2>/dev/null || az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.outputs"
}

cleanup_resources() {
    print_section "Cleanup Resources"
    
    log_warning "This will DELETE the resource group and ALL resources within it!"
    read -p "Are you sure you want to delete resource group '$RESOURCE_GROUP'? (yes/no) " -r
    echo
    
    if [[ $REPLY == "yes" ]]; then
        log_info "Deleting resource group: $RESOURCE_GROUP"
        
        az group delete \
            --name "$RESOURCE_GROUP" \
            --yes \
            --no-wait
        
        log_success "Resource group deletion initiated (running in background)"
        log_info "Check status with: az group show --name $RESOURCE_GROUP"
    else
        log_info "Cleanup cancelled"
    fi
}

show_help() {
    cat << EOF
Azure VM Template - Quickstart Deployment Script

USAGE:
    ./scripts/azure-deploy.sh [OPTIONS] [COMMAND]

COMMANDS:
    deploy              Deploy ARM template (default)
    validate            Validate template only (no deployment)
    list                List deployed resources
    outputs             Show deployment outputs
    cleanup             Delete resource group and all resources
    help                Show this help message

OPTIONS:
    --resource-group, -g    Resource group name (default: rg-azmp-vm-test)
    --location, -l          Azure region (default: eastus)
    --parameters, -p        Parameters file path
    --dry-run               Validate without deploying
    --skip-rg-create        Skip resource group creation
    --verbose, -v           Enable verbose output
    --help, -h              Show this help message

ENVIRONMENT VARIABLES:
    AZURE_RESOURCE_GROUP    Resource group name
    AZURE_LOCATION          Azure region
    TEMPLATE_DIR            Template directory (default: ./test-deployment)
    PARAMETERS_FILE         Parameters file path
    DRY_RUN                 Set to 'true' for dry run
    SKIP_RG_CREATE          Set to 'true' to skip RG creation
    VERBOSE                 Set to 'true' for verbose output

EXAMPLES:
    # Basic deployment with defaults
    ./scripts/azure-deploy.sh

    # Deploy to specific resource group and location
    ./scripts/azure-deploy.sh -g my-rg -l westus2

    # Deploy with parameters file
    ./scripts/azure-deploy.sh -p ./my-parameters.json

    # Dry run (validation only)
    ./scripts/azure-deploy.sh --dry-run

    # Validate template without deploying
    ./scripts/azure-deploy.sh validate

    # List deployed resources
    ./scripts/azure-deploy.sh list

    # Show deployment outputs
    ./scripts/azure-deploy.sh outputs

    # Cleanup all resources
    ./scripts/azure-deploy.sh cleanup

EOF
}

################################################################################
# Main Script
################################################################################

main() {
    local command="${1:-deploy}"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            deploy|validate|list|outputs|cleanup|help)
                command="$1"
                shift
                ;;
            -g|--resource-group)
                RESOURCE_GROUP="$2"
                shift 2
                ;;
            -l|--location)
                LOCATION="$2"
                shift 2
                ;;
            -p|--parameters)
                PARAMETERS_FILE="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --skip-rg-create)
                SKIP_RG_CREATE="true"
                shift
                ;;
            -v|--verbose)
                VERBOSE="true"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Run './scripts/azure-deploy.sh help' for usage information"
                exit 1
                ;;
        esac
    done
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    case $command in
        deploy)
            print_header
            check_prerequisites
            create_resource_group
            validate_template
            deploy_template
            display_deployment_info
            list_resources
            get_deployment_outputs
            ;;
        validate)
            print_header
            check_prerequisites
            validate_template
            log_success "Template validation complete"
            ;;
        list)
            check_prerequisites
            list_resources
            ;;
        outputs)
            check_prerequisites
            get_deployment_outputs
            ;;
        cleanup)
            check_prerequisites
            cleanup_resources
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo "Run './scripts/azure-deploy.sh help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
