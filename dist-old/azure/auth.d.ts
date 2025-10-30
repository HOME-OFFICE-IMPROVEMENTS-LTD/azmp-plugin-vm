/**
 * Azure Authentication Helper
 *
 * Provides authentication utilities for Azure SDK clients.
 * Uses DefaultAzureCredential for flexible authentication across environments.
 *
 * @module azure/auth
 */
import { TokenCredential } from "@azure/identity";
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
export declare class AzureAuthHelper {
    private credential;
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
    getCredential(): TokenCredential;
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
    validateCredentials(subscriptionId?: string): Promise<boolean>;
    /**
     * Get authentication status
     *
     * Returns information about the current authentication state without making API calls.
     *
     * @returns {object} Authentication status information
     */
    getAuthStatus(): {
        hasCredential: boolean;
        credentialType: string;
    };
    /**
     * Reset credential cache
     *
     * Forces re-authentication on next getCredential() call.
     * Useful when credentials have been updated.
     */
    resetCredential(): void;
}
/**
 * Singleton instance for global usage
 */
export declare const azureAuth: AzureAuthHelper;
