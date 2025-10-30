"use strict";
/**
 * Azure Application Gateway Configuration
 * Source: https://learn.microsoft.com/en-us/azure/application-gateway/overview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_PATH_MAPS = exports.LISTENERS = exports.HTTP_SETTINGS = exports.BACKEND_POOLS = exports.APP_GATEWAY_TEMPLATES = void 0;
exports.getAppGatewayTemplate = getAppGatewayTemplate;
exports.getAllAppGatewayTemplates = getAllAppGatewayTemplates;
exports.getBackendPool = getBackendPool;
exports.getAllBackendPools = getAllBackendPools;
exports.getHttpSettings = getHttpSettings;
exports.getAllHttpSettings = getAllHttpSettings;
exports.getListener = getListener;
exports.getAllListeners = getAllListeners;
exports.getUrlPathMap = getUrlPathMap;
exports.getAllUrlPathMaps = getAllUrlPathMaps;
exports.validateCapacity = validateCapacity;
exports.validateRequestTimeout = validateRequestTimeout;
/**
 * Application Gateway templates
 */
exports.APP_GATEWAY_TEMPLATES = {
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
};
/**
 * Backend pool configurations
 */
exports.BACKEND_POOLS = {
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
};
/**
 * HTTP settings configurations
 */
exports.HTTP_SETTINGS = {
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
};
/**
 * Listener configurations
 */
exports.LISTENERS = {
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
};
/**
 * URL path maps for path-based routing
 */
exports.URL_PATH_MAPS = {
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
};
/**
 * Get Application Gateway template by key
 */
function getAppGatewayTemplate(key) {
    return exports.APP_GATEWAY_TEMPLATES[key];
}
/**
 * Get all Application Gateway templates
 */
function getAllAppGatewayTemplates() {
    return Object.entries(exports.APP_GATEWAY_TEMPLATES).map(([key, template]) => ({
        key: key,
        template,
    }));
}
/**
 * Get backend pool by key
 */
function getBackendPool(key) {
    return exports.BACKEND_POOLS[key];
}
/**
 * Get all backend pools
 */
function getAllBackendPools() {
    return Object.entries(exports.BACKEND_POOLS).map(([key, pool]) => ({
        key: key,
        pool,
    }));
}
/**
 * Get HTTP settings by key
 */
function getHttpSettings(key) {
    return exports.HTTP_SETTINGS[key];
}
/**
 * Get all HTTP settings
 */
function getAllHttpSettings() {
    return Object.entries(exports.HTTP_SETTINGS).map(([key, settings]) => ({
        key: key,
        settings,
    }));
}
/**
 * Get listener by key
 */
function getListener(key) {
    return exports.LISTENERS[key];
}
/**
 * Get all listeners
 */
function getAllListeners() {
    return Object.entries(exports.LISTENERS).map(([key, listener]) => ({
        key: key,
        listener,
    }));
}
/**
 * Get URL path map by key
 */
function getUrlPathMap(key) {
    return exports.URL_PATH_MAPS[key];
}
/**
 * Get all URL path maps
 */
function getAllUrlPathMaps() {
    return Object.entries(exports.URL_PATH_MAPS).map(([key, pathMap]) => ({
        key: key,
        pathMap,
    }));
}
/**
 * Validate Application Gateway capacity
 */
function validateCapacity(capacity) {
    if (capacity < 1 || capacity > 125) {
        return { valid: false, error: "Capacity must be between 1 and 125" };
    }
    return { valid: true };
}
/**
 * Validate request timeout
 */
function validateRequestTimeout(timeout) {
    if (timeout < 1 || timeout > 86400) {
        return {
            valid: false,
            error: "Request timeout must be between 1 and 86400 seconds",
        };
    }
    return { valid: true };
}
