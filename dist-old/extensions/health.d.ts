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
export declare function generateWindowsHealthExtension(config: HealthExtensionConfig): object;
/**
 * Generates Linux health extension (Custom Script Extension)
 */
export declare function generateLinuxHealthExtension(config: HealthExtensionConfig): object;
/**
 * Generates health extension based on OS type
 */
export declare function generateHealthExtension(config: HealthExtensionConfig, osType: 'Windows' | 'Linux'): object;
