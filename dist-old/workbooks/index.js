"use strict";
/**
 * Azure Monitor Workbooks module for azmp-plugin-vm
 * Provides pre-built workbook templates and helpers for VM monitoring, performance analysis, and infrastructure insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWorkbookHelpers = exports.WorkbookTemplateManager = void 0;
var templates_1 = require("./templates");
Object.defineProperty(exports, "WorkbookTemplateManager", { enumerable: true, get: function () { return templates_1.WorkbookTemplateManager; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "registerWorkbookHelpers", { enumerable: true, get: function () { return helpers_1.registerWorkbookHelpers; } });
