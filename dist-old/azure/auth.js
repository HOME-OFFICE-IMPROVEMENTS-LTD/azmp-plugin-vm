"use strict";
/**
 * Azure Authentication Helper
 *
 * Provides authentication utilities for Azure SDK clients.
 * Uses DefaultAzureCredential for flexible authentication across environments.
 *
 * @module azure/auth
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureAuth = exports.AzureAuthHelper = void 0;
const identity_1 = require("@azure/identity");
/**
 * Azure Authentication Helper Class
 *
 * Manages Azure credentials and provides authentication for SDK clients.
 *
 * @example
 * ```typescript
 * const auth = new AzureAuthHelper();
 * const credential = auth.getCredential();
 * const isValid = await auth.validateCredentials('subscription-id');
 * ```
 */
class AzureAuthHelper {
    credential = null;
    /**
     * Get Azure credential instance
     *
     * Returns a DefaultAzureCredential that tries multiple authentication methods:
     * 1. Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
     * 2. Managed Identity
     * 3. Visual Studio Code
     * 4. Azure CLI
     * 5. Azure PowerShell
     *
     * @returns {TokenCredential} Azure credential instance
     */
    getCredential() {
        if (!this.credential) {
            this.credential = new identity_1.DefaultAzureCredential();
        }
        return this.credential;
    }
    /**
     * Validate Azure credentials
     *
     * Tests credentials by attempting to acquire a token for the management API.
     *
     * @param {string} subscriptionId - Azure subscription ID to validate against
     * @returns {Promise<boolean>} True if credentials are valid, false otherwise
     *
     * @example
     * ```typescript
     * const auth = new AzureAuthHelper();
     * const isValid = await auth.validateCredentials('abc123-...');
     * if (!isValid) {
     *   console.error('Invalid Azure credentials');
     * }
     * ```
     */
    async validateCredentials(subscriptionId) {
        try {
            const credential = this.getCredential();
            // Try to get a token for the management API
            const token = await credential.getToken("https://management.azure.com/.default");
            if (!token || !token.token) {
                return false;
            }
            // If subscription ID provided, we could add additional validation here
            // For now, just check token existence
            return true;
        }
        catch (error) {
            console.error("Failed to validate Azure credentials:", error);
            return false;
        }
    }
    /**
     * Get authentication status
     *
     * Returns information about the current authentication state without making API calls.
     *
     * @returns {object} Authentication status information
     */
    getAuthStatus() {
        return {
            hasCredential: this.credential !== null,
            credentialType: this.credential ? "DefaultAzureCredential" : "None",
        };
    }
    /**
     * Reset credential cache
     *
     * Forces re-authentication on next getCredential() call.
     * Useful when credentials have been updated.
     */
    resetCredential() {
        this.credential = null;
    }
}
exports.AzureAuthHelper = AzureAuthHelper;
/**
 * Singleton instance for global usage
 */
exports.azureAuth = new AzureAuthHelper();
