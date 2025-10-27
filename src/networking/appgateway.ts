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
export type SslPolicyName =
  | "AppGwSslPolicy20150501"
  | "AppGwSslPolicy20170401"
  | "AppGwSslPolicy20170401S"
  | "AppGwSslPolicy20220101"
  | "AppGwSslPolicy20220101S";

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
export const APP_GATEWAY_TEMPLATES = {
  /**
   * Basic web application gateway
   */
  "basic-web": {
    name: "Basic Web Application Gateway",
    description: "Basic Application Gateway for web applications",
    sku: "Standard_v2",
    tier: "Standard_v2",
    capacity: 2,
    enableWaf: false,
    enableHttp2: true,
    sslPolicy: "AppGwSslPolicy20220101",
  },

  /**
   * WAF-enabled application gateway
   */
  "waf-enabled": {
    name: "WAF-Enabled Application Gateway",
    description: "Application Gateway with Web Application Firewall",
    sku: "WAF_v2",
    tier: "WAF_v2",
    capacity: 2,
    enableWaf: true,
    wafMode: "Prevention",
    enableHttp2: true,
    sslPolicy: "AppGwSslPolicy20220101S",
  },

  /**
   * Multi-site hosting gateway
   */
  "multi-site": {
    name: "Multi-Site Application Gateway",
    description: "Application Gateway for hosting multiple sites",
    sku: "Standard_v2",
    tier: "Standard_v2",
    capacity: 3,
    enableWaf: false,
    enableHttp2: true,
    sslPolicy: "AppGwSslPolicy20220101",
  },

  /**
   * High-security gateway
   */
  "high-security": {
    name: "High-Security Application Gateway",
    description: "Application Gateway with maximum security settings",
    sku: "WAF_v2",
    tier: "WAF_v2",
    capacity: 3,
    enableWaf: true,
    wafMode: "Prevention",
    enableHttp2: true,
    sslPolicy: "AppGwSslPolicy20220101S",
  },
} as const;

export type AppGatewayTemplateKey = keyof typeof APP_GATEWAY_TEMPLATES;

/**
 * Backend pool configurations
 */
export const BACKEND_POOLS = {
  "web-pool": {
    name: "web-backend-pool",
    description: "Backend pool for web servers",
    targetType: "vm",
  },
  "api-pool": {
    name: "api-backend-pool",
    description: "Backend pool for API servers",
    targetType: "vm",
  },
  "app-pool": {
    name: "app-backend-pool",
    description: "Backend pool for application servers",
    targetType: "vm",
  },
} as const;

export type BackendPoolKey = keyof typeof BACKEND_POOLS;

/**
 * HTTP settings configurations
 */
export const HTTP_SETTINGS = {
  "http-80": {
    name: "http-settings-80",
    description: "HTTP settings for port 80",
    port: 80,
    protocol: "Http",
    cookieBasedAffinity: false,
    requestTimeout: 30,
  },
  "https-443": {
    name: "https-settings-443",
    description: "HTTPS settings for port 443",
    port: 443,
    protocol: "Https",
    cookieBasedAffinity: false,
    requestTimeout: 30,
  },
  "http-8080": {
    name: "http-settings-8080",
    description: "HTTP settings for port 8080",
    port: 8080,
    protocol: "Http",
    cookieBasedAffinity: false,
    requestTimeout: 30,
  },
  "http-affinity": {
    name: "http-settings-affinity",
    description: "HTTP settings with cookie affinity",
    port: 80,
    protocol: "Http",
    cookieBasedAffinity: true,
    requestTimeout: 30,
  },
} as const;

export type HttpSettingsKey = keyof typeof HTTP_SETTINGS;

/**
 * Listener configurations
 */
export const LISTENERS = {
  "http-listener": {
    name: "http-listener",
    description: "HTTP listener on port 80",
    protocol: "Http",
    port: 80,
    requireServerNameIndication: false,
  },
  "https-listener": {
    name: "https-listener",
    description: "HTTPS listener on port 443",
    protocol: "Https",
    port: 443,
    requireServerNameIndication: true,
  },
  "multi-site-listener": {
    name: "multi-site-listener",
    description: "HTTPS listener for multi-site hosting",
    protocol: "Https",
    port: 443,
    requireServerNameIndication: true,
  },
} as const;

export type ListenerKey = keyof typeof LISTENERS;

/**
 * URL path maps for path-based routing
 */
export const URL_PATH_MAPS = {
  "api-routes": {
    name: "api-path-map",
    description: "Route /api/* to API backend",
    paths: ["/api/*"],
    backendPool: "api-pool",
  },
  "images-routes": {
    name: "images-path-map",
    description: "Route /images/* to image backend",
    paths: ["/images/*", "/img/*"],
    backendPool: "web-pool",
  },
  "video-routes": {
    name: "video-path-map",
    description: "Route /video/* to video backend",
    paths: ["/video/*", "/videos/*"],
    backendPool: "app-pool",
  },
} as const;

export type UrlPathMapKey = keyof typeof URL_PATH_MAPS;

/**
 * Get Application Gateway template by key
 */
export function getAppGatewayTemplate(
  key: AppGatewayTemplateKey,
): (typeof APP_GATEWAY_TEMPLATES)[AppGatewayTemplateKey] | undefined {
  return APP_GATEWAY_TEMPLATES[key];
}

/**
 * Get all Application Gateway templates
 */
export function getAllAppGatewayTemplates(): Array<{
  key: AppGatewayTemplateKey;
  template: (typeof APP_GATEWAY_TEMPLATES)[AppGatewayTemplateKey];
}> {
  return Object.entries(APP_GATEWAY_TEMPLATES).map(([key, template]) => ({
    key: key as AppGatewayTemplateKey,
    template,
  }));
}

/**
 * Get backend pool by key
 */
export function getBackendPool(
  key: BackendPoolKey,
): (typeof BACKEND_POOLS)[BackendPoolKey] | undefined {
  return BACKEND_POOLS[key];
}

/**
 * Get all backend pools
 */
export function getAllBackendPools(): Array<{
  key: BackendPoolKey;
  pool: (typeof BACKEND_POOLS)[BackendPoolKey];
}> {
  return Object.entries(BACKEND_POOLS).map(([key, pool]) => ({
    key: key as BackendPoolKey,
    pool,
  }));
}

/**
 * Get HTTP settings by key
 */
export function getHttpSettings(
  key: HttpSettingsKey,
): (typeof HTTP_SETTINGS)[HttpSettingsKey] | undefined {
  return HTTP_SETTINGS[key];
}

/**
 * Get all HTTP settings
 */
export function getAllHttpSettings(): Array<{
  key: HttpSettingsKey;
  settings: (typeof HTTP_SETTINGS)[HttpSettingsKey];
}> {
  return Object.entries(HTTP_SETTINGS).map(([key, settings]) => ({
    key: key as HttpSettingsKey,
    settings,
  }));
}

/**
 * Get listener by key
 */
export function getListener(
  key: ListenerKey,
): (typeof LISTENERS)[ListenerKey] | undefined {
  return LISTENERS[key];
}

/**
 * Get all listeners
 */
export function getAllListeners(): Array<{
  key: ListenerKey;
  listener: (typeof LISTENERS)[ListenerKey];
}> {
  return Object.entries(LISTENERS).map(([key, listener]) => ({
    key: key as ListenerKey,
    listener,
  }));
}

/**
 * Get URL path map by key
 */
export function getUrlPathMap(
  key: UrlPathMapKey,
): (typeof URL_PATH_MAPS)[UrlPathMapKey] | undefined {
  return URL_PATH_MAPS[key];
}

/**
 * Get all URL path maps
 */
export function getAllUrlPathMaps(): Array<{
  key: UrlPathMapKey;
  pathMap: (typeof URL_PATH_MAPS)[UrlPathMapKey];
}> {
  return Object.entries(URL_PATH_MAPS).map(([key, pathMap]) => ({
    key: key as UrlPathMapKey,
    pathMap,
  }));
}

/**
 * Validate Application Gateway capacity
 */
export function validateCapacity(capacity: number): {
  valid: boolean;
  error?: string;
} {
  if (capacity < 1 || capacity > 125) {
    return { valid: false, error: "Capacity must be between 1 and 125" };
  }
  return { valid: true };
}

/**
 * Validate request timeout
 */
export function validateRequestTimeout(timeout: number): {
  valid: boolean;
  error?: string;
} {
  if (timeout < 1 || timeout > 86400) {
    return {
      valid: false,
      error: "Request timeout must be between 1 and 86400 seconds",
    };
  }
  return { valid: true };
}
