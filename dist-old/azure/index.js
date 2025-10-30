"use strict";
/**
 * Azure SDK Integration Module
 *
 * Main entry point for Azure SDK helpers and utilities.
 * Provides authentication, compute, and monitor functionality.
 *
 * @module azure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeHelper = exports.azureAuth = exports.AzureAuthHelper = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "AzureAuthHelper", { enumerable: true, get: function () { return auth_1.AzureAuthHelper; } });
Object.defineProperty(exports, "azureAuth", { enumerable: true, get: function () { return auth_1.azureAuth; } });
var compute_1 = require("./compute");
Object.defineProperty(exports, "ComputeHelper", { enumerable: true, get: function () { return compute_1.ComputeHelper; } });
