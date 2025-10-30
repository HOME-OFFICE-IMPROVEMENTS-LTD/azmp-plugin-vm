const fs = require('fs');
const path = require('path');

// Read both files
const createUiPath = path.resolve(__dirname, "arm-ttk-analysis/outputs/minimal/createUiDefinition.json");
const mainTemplatePath = path.resolve(__dirname, "arm-ttk-analysis/outputs/minimal/mainTemplate.json");

const createUi = JSON.parse(fs.readFileSync(createUiPath, 'utf8'));
const mainTemplate = JSON.parse(fs.readFileSync(mainTemplatePath, 'utf8'));

// Extract outputs from createUiDefinition
const outputs = createUi.parameters.outputs;
console.log('=== CreateUiDefinition Outputs ===');
Object.keys(outputs).forEach(key => {
    console.log(`  ${key}: ${outputs[key]}`);
});

// Extract parameters from mainTemplate  
const parameters = mainTemplate.parameters;
console.log('\n=== MainTemplate Parameters ===');
Object.keys(parameters).forEach(key => {
    console.log(`  ${key}: ${parameters[key].type}`);
});

// Find missing parameters
console.log('\n=== Missing Parameters (in createUi outputs but not mainTemplate parameters) ===');
const missingParams = Object.keys(outputs).filter(key => !parameters.hasOwnProperty(key));
missingParams.forEach(param => {
    console.log(`  ❌ ${param}: ${outputs[param]}`);
});

console.log(`\nTotal outputs: ${Object.keys(outputs).length}`);
console.log(`Total parameters: ${Object.keys(parameters).length}`);
console.log(`Missing parameters: ${missingParams.length}`);
