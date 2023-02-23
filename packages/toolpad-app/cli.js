#!/usr/bin/env node
/* eslint-disable */

const { default: cli } = require('./dist/cli');

cli(process.argv.slice(2));
