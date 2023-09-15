#!/usr/bin/env node
/* eslint-disable */

if (process.env.MEM_LOG) {
  const bytesFormatter = Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
  });

  setInterval(() => {
    const memoryData = process.memoryUsage();
    console.log(bytesFormatter.format(memoryData.rss));
  }, 100);
}

const { default: cli } = require('./dist/cli');
cli(process.argv.slice(2));
