#!/usr/bin/env node

import 'dotenv/config';
import yargs from 'yargs';
import { devCommand, generateCommand } from './liveConfigurator';

export type { Config } from '../shared/types';

const sharedOptions = {
  dir: {
    type: 'string',
    describe: 'Directory of the Toolpad application',
    default: '.',
  },
} as const;

const parsedArgs = yargs(process.argv.slice(2))
  // See https://github.com/yargs/yargs/issues/538
  .scriptName('toolpad')
  .command(
    ['$0 [dir]', 'dev [dir]'],
    'Run Toolpad in development mode',
    {
      ...sharedOptions,
    },
    (args) => devCommand(args),
  )
  .command(
    'generate [dir]',
    'Run Toolpad live configurators',
    {
      ...sharedOptions,
    },
    (args) => generateCommand(args),
  )
  .command('help', 'Show help', {}, async () => {
    // eslint-disable-next-line no-console
    console.log(await parsedArgs.getHelp());
  })
  .help();

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
parsedArgs.argv;
