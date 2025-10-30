import type { PluginContext } from "../types";
type Logger = PluginContext["logger"];
interface ArmTemplate {
    parameters?: Record<string, unknown>;
    variables?: Record<string, unknown>;
}
export interface PrunedTemplateResult {
    json: string;
    template: ArmTemplate;
    activeParameters: string[];
}
export declare const pruneTemplate: (templateText: string, logger?: Logger) => PrunedTemplateResult;
export {};
