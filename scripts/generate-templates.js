#!/usr/bin/env node
/**
 * Standalone Template Generator for Phase 5 Testing
 * Compiles Handlebars .hbs templates to JSON
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register basic array helper (needed by templates)
Handlebars.registerHelper('array', function(...args) {
  // Remove the last argument which is the Handlebars options object
  return args.slice(0, -1);
});

// Register helpers from the VM plugin
// Note: The templates don't actually use custom helpers for basic generation,
// so we can skip this for now. The array helper is sufficient.
// try {
//   const { registerMonitoringHelpers } = require('../dist/monitoring');
//   const { registerCostHelpers } = require('../dist/cost');
//   const { registerPerformanceHelpers } = require('../dist/performance');
//   
//   registerMonitoringHelpers();
//   registerCostHelpers();
//   registerPerformanceHelpers();
//   console.log('✓ Registered plugin Handlebars helpers\n');
// } catch (err) {
//   console.warn('⚠ Warning: Could not load plugin helpers:', err.message);
//   console.warn('  Run "npm run build" if you need plugin helpers\n');
// }

// Helper function to read JSON file
function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Helper function to compile Handlebars template
function compileTemplate(templatePath, context) {
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  return template(context);
}

// Main generation function
async function generateTemplates() {
  console.log('🚀 Phase 5 Template Generator\n');

  // Read configuration
  const configPath = path.join(process.cwd(), 'test-deployment-config-full.json');
  console.log('📋 Loading configuration from:', configPath);
  const config = readJSON(configPath);
  console.log('✓ Configuration loaded\n');

  // Output directory
  const outputDir = path.join(process.cwd(), 'test-deployment');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log('📁 Output directory:', outputDir, '\n');

  // Template paths
  const templatesDir = path.join(process.cwd(), 'src', 'templates');
  const mainTemplatePath = path.join(templatesDir, 'mainTemplate.json.hbs');
  const createUiPath = path.join(templatesDir, 'createUiDefinition.json.hbs');
  const viewDefPath = path.join(templatesDir, 'viewDefinition.json.hbs');

  let successCount = 0;
  let errorCount = 0;

    // Generate mainTemplate.json
  try {
    console.log('🔧 Generating mainTemplate.json...');
    const compiledMain = compileTemplate(mainTemplatePath, config);
    
    // Validate JSON
    JSON.parse(compiledMain);
    
    // Write file
    const mainOutputPath = path.join(outputDir, 'mainTemplate.json');
    fs.writeFileSync(mainOutputPath, compiledMain);
    
    // Get file stats
    const stats = fs.statSync(mainOutputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    // Count resources and outputs
    const mainJson = JSON.parse(compiledMain);
    const resourceCount = mainJson.resources ? mainJson.resources.length : 0;
    const outputCount = mainJson.outputs ? Object.keys(mainJson.outputs).length : 0;
    
    console.log(`✓ Generated mainTemplate.json (${fileSizeKB} KB)`);
    console.log(`  • Resources: ${resourceCount}`);
    console.log(`  • Outputs: ${outputCount}\n`);
    successCount++;
  } catch (error) {
    console.error(`✗ Error generating mainTemplate.json: ${error.message}`);
    console.error(`  Stack trace:`);
    console.error(error.stack);
    console.error(`\n  This usually means there's a Handlebars syntax issue in src/templates/mainTemplate.json.hbs`);
    console.error(`  Check for malformed {{#if}} blocks, missing {{/if}}, or invalid variable references\n`);
    errorCount++;
  }

  console.log();

  // Generate createUiDefinition.json
  try {
    console.log('🔧 Generating createUiDefinition.json...');
    const createUiJson = compileTemplate(createUiPath, config);
    const createUiOutput = path.join(outputDir, 'createUiDefinition.json');
    
    // Validate JSON
    JSON.parse(createUiJson);
    
    fs.writeFileSync(createUiOutput, createUiJson, 'utf-8');
    const stats = fs.statSync(createUiOutput);
    console.log(`✓ Generated createUiDefinition.json (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Count steps
    const parsed = JSON.parse(createUiJson);
    console.log(`  • Wizard Steps: ${parsed.parameters?.steps?.length || 0}`);
    console.log(`  • Outputs: ${Object.keys(parsed.parameters?.outputs || {}).length}`);
    successCount++;
  } catch (error) {
    console.error('✗ Error generating createUiDefinition.json:', error.message);
    errorCount++;
  }

  console.log();

  // Generate viewDefinition.json
  try {
    console.log('🔧 Generating viewDefinition.json...');
    const viewDefJson = compileTemplate(viewDefPath, config);
    const viewDefOutput = path.join(outputDir, 'viewDefinition.json');
    
    // Write file first for debugging
    fs.writeFileSync(viewDefOutput, viewDefJson, 'utf-8');
    
    // Validate JSON
    const parsed = JSON.parse(viewDefJson);
    
    const stats = fs.statSync(viewDefOutput);
    console.log(`✓ Generated viewDefinition.json (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Count views
    console.log(`  • Views: ${parsed.views?.length || 0}`);
    successCount++;
  } catch (error) {
    console.error('✗ Error generating viewDefinition.json:', error.message);
    errorCount++;
  }

  console.log();
  console.log('═'.repeat(60));
  console.log(`✅ Generation Complete: ${successCount} files created, ${errorCount} errors`);
  console.log('═'.repeat(60));
  
  if (successCount === 3) {
    console.log('\n📝 Next Steps:');
    console.log('  1. Validate templates: npm run validate-templates');
    console.log('  2. Review generated files in test-deployment/');
    console.log('  3. Test with Azure CLI deployment');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run generator
generateTemplates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
