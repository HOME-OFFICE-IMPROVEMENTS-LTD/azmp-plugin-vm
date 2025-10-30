/**
 * Azure Application Gateway Configuration
 * Source: https://learn.microsoft.com/en-us/azure/application-gateway/overview
 */
/**
 * Application Gateway SKU
 */
export type AppGatewaySku = "Standard_v2" | "WAF_v2";
/**
 * Application Gateway Tier
 */
export type AppGatewayTier = "Standard_v2" | "WAF_v2";
/**
 * WAF Mode
 */
export type WafMode = "Detection" | "Prevention";
/**
 * SSL Policy Type
 */
export type SslPolicyType = "Predefined" | "Custom";
/**
 * Predefined SSL Policy Name
 */
export type SslPolicyName = "AppGwSslPolicy20150501" | "AppGwSslPolicy20170401" | "AppGwSslPolicy20170401S" | "AppGwSslPolicy20220101" | "AppGwSslPolicy20220101S";
/**
 * Backend Protocol
 */
export type BackendProtocol = "Http" | "Https";
/**
 * Listener Protocol
 */
export type ListenerProtocol = "Http" | "Https";
/**
 * Redirect Type
 */
export type RedirectType = "Permanent" | "Found" | "SeeOther" | "Temporary";
/**
 * Application Gateway Template Configuration
 */
export interface AppGatewayTemplate {
    readonly name: string;
    readonly description: string;
    readonly sku: AppGatewaySku;
    readonly tier: AppGatewayTier;
    readonly capacity: number;
    readonly enableWaf: boolean;
    readonly wafMode?: WafMode;
    readonly enableHttp2: boolean;
    readonly sslPolicy: SslPolicyName;
}
/**
 * Backend Pool Configuration
 */
export interface BackendPoolConfig {
    readonly name: string;
    readonly description: string;
    readonly targetType: "ip" | "fqdn" | "vm";
}
/**
 * HTTP Settings Configuration
 */
export interface HttpSettingsConfig {
    readonly name: string;
    readonly description: string;
    readonly port: number;
    readonly protocol: BackendProtocol;
    readonly cookieBasedAffinity: boolean;
    readonly requestTimeout: number;
    readonly probeName?: string;
}
/**
 * Listener Configuration
 */
export interface ListenerConfig {
    readonly name: string;
    readonly description: string;
    readonly protocol: ListenerProtocol;
    readonly port: number;
    readonly requireServerNameIndication: boolean;
}
/**
 * URL Path Map Configuration
 */
export interface UrlPathMapConfig {
    readonly name: string;
    readonly description: string;
    readonly paths: readonly string[];
    readonly backendPool: string;
}
/**
 * Application Gateway templates
 */
export declare const APP_GATEWAY_TEMPLATES: {
    /**
     * Basic web application gateway
     */
    readonly "basic-web": {
        readonly name: "Basic Web Application Gateway";
        readonly description: "Basic Application Gateway for web applications";
        readonly sku: "Standard_v2";
        readonly tier: "Standard_v2";
        readonly capacity: 2;
        readonly enableWaf: false;
        readonly enableHttp2: true;
        readonly sslPolicy: "AppGwSslPolicy20220101";
    };
    /**
     * WAF-enabled application gateway
     */
    readonly "waf-enabled": {
        readonly name: "WAF-Enabled Application Gateway";
        readonly description: "Application Gateway with Web Application Firewall";
        readonly sku: "WAF_v2";
        readonly tier: "WAF_v2";
        readonly capacity: 2;
        readonly enableWaf: true;
        readonly wafMode: "Prevention";
        readonly enableHttp2: true;
        readonly sslPolicy: "AppGwSslPolicy20220101S";
    };
    /**
     * Multi-site hosting gateway
     */
    readonly "multi-site": {
        readonly name: "Multi-Site Application Gateway";
        readonly description: "Application Gateway for hosting multiple sites";
        readonly sku: "Standard_v2";
        readonly tier: "Standard_v2";
        readonly capacity: 3;
        readonly enableWaf: false;
        readonly enableHttp2: true;
        readonly sslPolicy: "AppGwSslPolicy20220101";
    };
    /**
     * High-security gateway
     */
    readonly "high-security": {
        readonly name: "High-Security Application Gateway";
        readonly description: "Application Gateway with maximum security settings";
        readonly sku: "WAF_v2";
        readonly tier: "WAF_v2";
        readonly capacity: 3;
        readonly enableWaf: true;
        readonly wafMode: "Prevention";
        readonly enableHttp2: true;
        readonly sslPolicy: "AppGwSslPolicy20220101S";
    };
};
export type AppGatewayTemplateKey = keyof typeof APP_GATEWAY_TEMPLATES;
/**
 * Backend pool configurations
 */
export declare const BACKEND_POOLS: {
    readonly "web-pool": {
        readonly name: "web-backend-pool";
        readonly description: "Backend pool for web servers";
        readonly targetType: "vm";
    };
    readonly "api-pool": {
        readonly name: "api-backend-pool";
        readonly description: "Backend pool for API servers";
        readonly targetType: "vm";
    };
    readonly "app-pool": {
        readonly name: "app-backend-pool";
        readonly description: "Backend pool for application servers";
        readonly targetType: "vm";
    };
};
export type BackendPoolKey = keyof typeof BACKEND_POOLS;
/**
 * HTTP settings configurations
 */
export declare const HTTP_SETTINGS: {
    readonly "http-80": {
        readonly name: "http-settings-80";
        readonly description: "HTTP settings for port 80";
        readonly port: 80;
        readonly protocol: "Http";
        readonly cookieBasedAffinity: false;
        readonly requestTimeout: 30;
    };
    readonly "https-443": {
        readonly name: "https-settings-443";
        readonly description: "HTTPS settings for port 443";
        readonly port: 443;
        readonly protocol: "Https";
        readonly cookieBasedAffinity: false;
        readonly requestTimeout: 30;
    };
    readonly "http-8080": {
        readonly name: "http-settings-8080";
        readonly description: "HTTP settings for port 8080";
        readonly port: 8080;
        readonly protocol: "Http";
        readonly cookieBasedAffinity: false;
        readonly requestTimeout: 30;
    };
    readonly "http-affinity": {
        readonly name: "http-settings-affinity";
        readonly description: "HTTP settings with cookie affinity";
        readonly port: 80;
        readonly protocol: "Http";
        readonly cookieBasedAffinity: true;
        readonly requestTimeout: 30;
    };
};
export type HttpSettingsKey = keyof typeof HTTP_SETTINGS;
/**
 * Listener configurations
 */
export declare const LISTENERS: {
    readonly "http-listener": {
        readonly name: "http-listener";
        readonly description: "HTTP listener on port 80";
        readonly protocol: "Http";
        readonly port: 80;
        readonly requireServerNameIndication: false;
    };
    readonly "https-listener": {
        readonly name: "https-listener";
        readonly description: "HTTPS listener on port 443";
        readonly protocol: "Https";
        readonly port: 443;
        readonly requireServerNameIndication: true;
    };
    readonly "multi-site-listener": {
        readonly name: "multi-site-listener";
        readonly description: "HTTPS listener for multi-site hosting";
        readonly protocol: "Https";
        readonly port: 443;
        readonly requireServerNameIndication: true;
    };
};
export type ListenerKey = keyof typeof LISTENERS;
/**
 * URL path maps for path-based routing
 */
export declare const URL_PATH_MAPS: {
    readonly "api-routes": {
        readonly name: "api-path-map";
        readonly description: "Route /api/* to API backend";
        readonly paths: readonly ["/api/*"];
        readonly backendPool: "api-pool";
    };
    readonly "images-routes": {
        readonly name: "images-path-map";
        readonly description: "Route /images/* to image backend";
        readonly paths: readonly ["/images/*", "/img/*"];
        readonly backendPool: "web-pool";
    };
    readonly "video-routes": {
        readonly name: "video-path-map";
        readonly description: "Route /video/* to video backend";
        readonly paths: readonly ["/video/*", "/videos/*"];
        readonly backendPool: "app-pool";
    };
};
export type UrlPathMapKey = keyof typeof URL_PATH_MAPS;
/**
 * Get Application Gateway template by key
 */
export declare function getAppGatewayTemplate(key: AppGatewayTemplateKey): (typeof APP_GATEWAY_TEMPLATES)[AppGatewayTemplateKey] | undefined;
/**
 * Get all Application Gateway templates
 */
export declare function getAllAppGatewayTemplates(): Array<{
    key: AppGatewayTemplateKey;
    template: (typeof APP_GATEWAY_TEMPLATES)[AppGatewayTemplateKey];
}>;
/**
 * Get backend pool by key
 */
export declare function getBackendPool(key: BackendPoolKey): (typeof BACKEND_POOLS)[BackendPoolKey] | undefined;
/**
 * Get all backend pools
 */
export declare function getAllBackendPools(): Array<{
    key: BackendPoolKey;
    pool: (typeof BACKEND_POOLS)[BackendPoolKey];
}>;
/**
 * Get HTTP settings by key
 */
export declare function getHttpSettings(key: HttpSettingsKey): (typeof HTTP_SETTINGS)[HttpSettingsKey] | undefined;
/**
 * Get all HTTP settings
 */
export declare function getAllHttpSettings(): Array<{
    key: HttpSettingsKey;
    settings: (typeof HTTP_SETTINGS)[HttpSettingsKey];
}>;
/**
 * Get listener by key
 */
export declare function getListener(key: ListenerKey): (typeof LISTENERS)[ListenerKey] | undefined;
/**
 * Get all listeners
 */
export declare function getAllListeners(): Array<{
    key: ListenerKey;
    listener: (typeof LISTENERS)[ListenerKey];
}>;
/**
 * Get URL path map by key
 */
export declare function getUrlPathMap(key: UrlPathMapKey): (typeof URL_PATH_MAPS)[UrlPathMapKey] | undefined;
/**
 * Get all URL path maps
 */
export declare function getAllUrlPathMaps(): Array<{
    key: UrlPathMapKey;
    pathMap: (typeof URL_PATH_MAPS)[UrlPathMapKey];
}>;
/**
 * Validate Application Gateway capacity
 */
export declare function validateCapacity(capacity: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate request timeout
 */
export declare function validateRequestTimeout(timeout: number): {
    valid: boolean;
    error?: string;
};
