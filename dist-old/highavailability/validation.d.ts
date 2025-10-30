import { HighAvailabilityConfig } from './cluster';
/**
 * Comprehensive HA configuration validation
 */
export interface HAValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
}
/**
 * Validates complete HA configuration including regional capabilities
 */
export declare function validateCompleteHAConfig(config: HighAvailabilityConfig, region: string): HAValidationResult;
/**
 * Validates compatibility with other features (cost optimization, security, etc.)
 */
export declare function validateFeatureCompatibility(haConfig: HighAvailabilityConfig, otherConfig: {
    useEphemeralOSDisk?: boolean;
    enableAutoShutdown?: boolean;
    trustedLaunch?: boolean;
}): string[];
