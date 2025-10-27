/**
 * Azure Authentication Helper
 *
 * Provides authentication utilities for Azure SDK clients.
 * Uses DefaultAzureCredential for flexible authentication across environments.
 *
 * @module azure/auth
 */

import { DefaultAzureCredential, TokenCredential } from "@azure/identity";

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
export class AzureAuthHelper {
  private credential: TokenCredential | null = null;

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
  public getCredential(): TokenCredential {
    if (!this.credential) {
      this.credential = new DefaultAzureCredential();
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
  public async validateCredentials(subscriptionId?: string): Promise<boolean> {
    try {
      const credential = this.getCredential();

      // Try to get a token for the management API
      const token = await credential.getToken(
        "https://management.azure.com/.default",
      );

      if (!token || !token.token) {
        return false;
      }

      // If subscription ID provided, we could add additional validation here
      // For now, just check token existence
      return true;
    } catch (error) {
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
  public getAuthStatus(): { hasCredential: boolean; credentialType: string } {
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
  public resetCredential(): void {
    this.credential = null;
  }
}

/**
 * Singleton instance for global usage
 */
export const azureAuth = new AzureAuthHelper();
