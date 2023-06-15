#!/usr/bin/env node --enable-source-maps
/* eslint-disable */

const { default: cli } = require('@mui/toolpad-app/cli');

cli(process.argv.slice(2));
