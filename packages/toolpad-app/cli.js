#!/usr/bin/env node
// eslint-disable-next-line import/no-unresolved, import/extensions
const { default: cli } = require('./dist/cli');

cli(process.argv.slice(2));
