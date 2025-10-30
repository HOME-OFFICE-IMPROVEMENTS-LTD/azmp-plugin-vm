"use strict";
/**
 * Performance optimization module exports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPerformanceHelpers = exports.AutoscaleEngine = exports.PerformanceAnalyzer = void 0;
var analyzer_1 = require("./analyzer");
Object.defineProperty(exports, "PerformanceAnalyzer", { enumerable: true, get: function () { return analyzer_1.PerformanceAnalyzer; } });
var autoscale_1 = require("./autoscale");
Object.defineProperty(exports, "AutoscaleEngine", { enumerable: true, get: function () { return autoscale_1.AutoscaleEngine; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "registerPerformanceHelpers", { enumerable: true, get: function () { return helpers_1.registerPerformanceHelpers; } });
