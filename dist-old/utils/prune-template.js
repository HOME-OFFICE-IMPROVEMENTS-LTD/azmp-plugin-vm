"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneTemplate = void 0;
const PARAM_REF_PREFIX = "parameters('";
const VAR_REF_PREFIX = "variables('";
const collectEntries = (section, templateText, prefix) => {
    if (!section) {
        return new Set();
    }
    return new Set(Object.keys(section).filter((key) => templateText.includes(`${prefix}${key}')`)));
};
const pruneTemplate = (templateText, logger) => {
    try {
        const template = JSON.parse(templateText);
        let workingText = templateText;
        if (template.variables) {
            const usedVariables = collectEntries(template.variables, workingText, VAR_REF_PREFIX);
            let removed = false;
            for (const key of Object.keys(template.variables)) {
                if (!usedVariables.has(key)) {
                    delete template.variables[key];
                    removed = true;
                    logger?.debug?.(`Pruned unused variable from template: ${key}`);
                }
            }
            if (removed) {
                workingText = JSON.stringify(template);
            }
        }
        if (template.parameters) {
            const usedParameters = collectEntries(template.parameters, workingText, PARAM_REF_PREFIX);
            for (const key of Object.keys(template.parameters)) {
                if (!usedParameters.has(key)) {
                    delete template.parameters[key];
                    logger?.debug?.(`Pruned unused parameter from template: ${key}`);
                }
            }
        }
        const activeParameters = Object.keys(template.parameters || {});
        const json = JSON.stringify(template, null, 2);
        return {
            json,
            template,
            activeParameters,
        };
    }
    catch (error) {
        logger?.warn?.(`Failed to prune template; returning original output. ${error instanceof Error ? error.message : "Unknown error"}`);
        return {
            json: templateText,
            template: {},
            activeParameters: [],
        };
    }
};
exports.pruneTemplate = pruneTemplate;
