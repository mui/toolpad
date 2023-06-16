#!/usr/bin/env node
/* eslint-disable */

const { forkSync } = require('child_process');

/**
 * We want to ensure that the node process that runs the cli has the --enable-source-maps flag
 * enabled. Since we can't add it to the shebang line we fork a new process with the flag enabled.
 */

const requiredFlags = ['--enable-source-maps'];
const actualFlags = new Set(process.execArgv);
const missingFlags = requiredFlags.filter((requiredFlag) => !actualFlags.has(requiredFlag));

console.log(process.execArgv);
if (missingFlags.length > 0) {
  // Get the node binary, file, and non-node arguments that we ran with
  const [, module, ...args] = process.argv;

  // Re-running with --enable-source-maps flag
  forkSync(module, args, {
    stdio: 'inherit',
    execArgv: [
      // Get the arguments passed to the node binary
      ...process.execArgv,
      // Pass more arguments to node binary as desired
      ...missingFlags,
    ],
  });
} else {
  const { default: cli } = require('@mui/toolpad-app/cli');
  cli(process.argv.slice(2));
}
