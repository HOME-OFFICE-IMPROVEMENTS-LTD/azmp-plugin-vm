#!/usr/bin/env node
const { Command } = require('commander');
const VmPlugin = require('./dist/index.js').default;

const plugin = new VmPlugin();
const program = new Command();

const logger = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
  error: (msg) => console.error(msg),
  debug: (msg) => {}, // Silent debug
};

const ctx = { logger, options: {} };

plugin.initialize(ctx).then(() => {
  plugin.registerCommands(program);
  program.parse(process.argv);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
