#!/usr/bin/env node
/* eslint-disable */

const { fork } = require('child_process');

/**
 * We want to ensure that the node process that runs the cli has the --enable-source-maps flag
 * enabled. Since we can't add it to the shebang line we fork a new process with the flag enabled.
 */

const requiredFlags = ['--enable-source-maps'];
const actualFlags = new Set(process.execArgv);
const missingFlags = requiredFlags.filter((requiredFlag) => !actualFlags.has(requiredFlag));

if (missingFlags.length > 0) {
  // Get the node binary, file, and non-node arguments that we ran with
  const [, module, ...args] = process.argv;

  // Re-running with --enable-source-maps flag
  const child = fork(module, args, {
    stdio: 'inherit',
    execArgv: [
      // Get the arguments passed to the node binary
      ...process.execArgv,
      // Pass more arguments to node binary as desired
      ...missingFlags,
    ],
  });

  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGBREAK', () => child.kill('SIGBREAK'));
  process.on('SIGHUP', () => child.kill('SIGHUP'));
  child.once('close', (code) => process.exit(code));
} else {
  const { default: cli } = require('./dist/cli');
  cli(process.argv.slice(2));
}
