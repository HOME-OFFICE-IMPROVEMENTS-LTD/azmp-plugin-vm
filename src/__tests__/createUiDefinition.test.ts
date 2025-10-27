import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const loadCreateUiDefinition = (): string => {
  const uiPath = path.join(__dirname, '../../templates/createUiDefinition.json.hbs');
  return fs.readFileSync(uiPath, 'utf-8');
};

describe('createUiDefinition structure', () => {
  let uiDefinitionTemplate: string;

  beforeAll(() => {
    uiDefinitionTemplate = loadCreateUiDefinition();
  });

  test('should have valid Azure portal UI definition structure', () => {
    // v1.8.0 uses a flat structure with basics and steps, not a wizard
    expect(uiDefinitionTemplate).toBeDefined();
    expect(uiDefinitionTemplate).toContain('"$schema"');
    expect(uiDefinitionTemplate).toContain('"parameters"');
    expect(uiDefinitionTemplate).toContain('"basics"');
    expect(uiDefinitionTemplate).toContain('"steps"');
  });

  test('should include basic VM configuration in basics section', () => {
    // Core VM configuration elements in basics
    expect(uiDefinitionTemplate).toContain('"name": "vmName"');
    expect(uiDefinitionTemplate).toContain('"name": "authenticationType"');
    expect(uiDefinitionTemplate).toContain('"name": "adminUsername"');
    expect(uiDefinitionTemplate).toContain('"name": "adminPassword"');
  });

  test('should have networking configuration step', () => {
    // v1.8.0 has networkingConfig step
    expect(uiDefinitionTemplate).toContain('"name": "networkingConfig"');
    expect(uiDefinitionTemplate).toContain('"label": "Networking"');
  });

  test('should map basic values to outputs', () => {
    // Verify key output mappings exist in the template
    expect(uiDefinitionTemplate).toContain('"outputs"');
    expect(uiDefinitionTemplate).toContain('"vmName"');
    expect(uiDefinitionTemplate).toContain('"location"');
    expect(uiDefinitionTemplate).toContain('"authenticationType"');
    expect(uiDefinitionTemplate).toContain('[basics(\'vmName\')]');
    expect(uiDefinitionTemplate).toContain('[location()]');
  });
});
