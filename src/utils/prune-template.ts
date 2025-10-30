import type { PluginContext } from "../types";

type Logger = PluginContext["logger"];

const PARAM_REF_PREFIX = "parameters('";
const VAR_REF_PREFIX = "variables('";

interface ArmTemplate {
  parameters?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

const collectEntries = (
  section: Record<string, unknown> | undefined,
  templateText: string,
  prefix: string,
) => {
  if (!section) {
    return new Set<string>();
  }

  return new Set(
    Object.keys(section).filter((key) =>
      templateText.includes(`${prefix}${key}')`),
    ),
  );
};

export interface PrunedTemplateResult {
  json: string;
  template: ArmTemplate;
  activeParameters: string[];
}

export interface PruneOptions {
  preserveParameters?: string[];
  logger?: Logger;
}

export const pruneTemplate = (
  templateText: string,
  loggerOrOptions?: Logger | PruneOptions,
): PrunedTemplateResult => {
  // Handle backwards compatibility: logger param or options object
  let logger: Logger | undefined;
  let preserveParameters: Set<string>;
  
  if (!loggerOrOptions || typeof (loggerOrOptions as any).info === 'function') {
    // Old API: logger passed directly
    logger = loggerOrOptions as Logger | undefined;
    preserveParameters = new Set();
  } else {
    // New API: options object
    const options = loggerOrOptions as PruneOptions;
    logger = options.logger;
    preserveParameters = new Set(options.preserveParameters || []);
  }
  try {
    const template: ArmTemplate = JSON.parse(templateText);
    let workingText = templateText;

    if (template.variables) {
      const usedVariables = collectEntries(
        template.variables,
        workingText,
        VAR_REF_PREFIX,
      );
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
      const usedParameters = collectEntries(
        template.parameters,
        workingText,
        PARAM_REF_PREFIX,
      );
      for (const key of Object.keys(template.parameters)) {
        // Preserve parameter if it's in the whitelist OR if it's actually used
        if (!usedParameters.has(key) && !preserveParameters.has(key)) {
          delete template.parameters[key];
          logger?.debug?.(
            `Pruned unused parameter from template: ${key}`,
          );
        } else if (preserveParameters.has(key) && !usedParameters.has(key)) {
          logger?.debug?.(
            `Preserved parameter (whitelisted): ${key}`,
          );
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
  } catch (error) {
    logger?.warn?.(
      `Failed to prune template; returning original output. ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
    return {
      json: templateText,
      template: {},
      activeParameters: [],
    };
  }
};
