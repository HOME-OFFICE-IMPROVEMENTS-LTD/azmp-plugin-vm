const fs = require("fs");
const path = require("path");

const templatePath = path.resolve(
  __dirname,
  "arm-ttk-analysis/outputs/minimal/mainTemplate.json",
);

const templateText = fs.readFileSync(templatePath, "utf8");
const template = JSON.parse(templateText);

const parameters = Object.keys(template.parameters || {});
const variables = Object.keys(template.variables || {});

const findUnused = (names, pattern) =>
  names.filter((name) => !templateText.includes(pattern(name)));

const unusedParameters = findUnused(parameters, (name) => `parameters('${name}')`);
const unusedVariables = findUnused(variables, (name) => `variables('${name}')`);

console.log("Parameters:", parameters.length);
console.log("Unused parameters:", unusedParameters.length);
unusedParameters.forEach((name) => console.log(`  - ${name}`));

console.log("\nVariables:", variables.length);
console.log("Unused variables:", unusedVariables.length);
unusedVariables.forEach((name) => console.log(`  - ${name}`));
