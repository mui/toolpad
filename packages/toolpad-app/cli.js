#!/usr/bin/env node

const { default: cli } = require('./dist/cli');

cli(process.argv.slice(2));
