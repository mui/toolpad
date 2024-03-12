import 'dotenv/config';
import path from 'path';
import yargs from 'yargs';
import * as url from 'node:url';
import chalk from 'chalk';
import { execaNode } from 'execa';
import { runApp, runEditor } from '../src/server';

export type Command = 'dev' | 'start' | 'build';
export interface RunOptions {
  dir: string;
  port?: number;
  dev?: boolean;
  base: string;
}

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

async function runCommand(
  cmd: 'dev' | 'start',
  { dir, dev: toolpadDevMode, ...args }: Omit<RunOptions, 'cmd'>,
) {
  const projectDir = path.resolve(process.cwd(), dir);

  const app = await runApp({
    ...args,
    dir: projectDir,
    dev: cmd !== 'start',
    toolpadDevMode,
  });

  process.once('SIGINT', () => {
    app.dispose().finally(() => {
      process.exit(0);
    });
  });
}

async function devCommand(args: RunOptions) {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad Studio application in dev mode...`);
  await runCommand('dev', args);
}

interface EditorOptions {
  url: string;
  dev?: boolean;
}

async function editorCommand({ dev: toolpadDevMode, ...args }: EditorOptions) {
  await runEditor(args.url, { toolpadDevMode, ...args });
}

interface BuildOptions {
  dir: string;
  base: string;
}

async function buildCommand({ dir, base }: BuildOptions) {
  const projectDir = path.resolve(process.cwd(), dir);
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - building Toolpad Studio application...`);

  const builderPath = path.resolve(currentDirectory, './appBuilderWorker.mjs');

  await execaNode(builderPath, [], {
    stdio: 'inherit',
    env: {
      NODE_ENV: 'production',
      FORCE_COLOR: '1',
      TOOLPAD_PROJECT_DIR: projectDir,
      TOOLPAD_BASE: base,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - build done.`);
}

async function startCommand(args: RunOptions) {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - Starting Toolpad Studio application...`);
  await runCommand('start', args);
}

export default async function cli(argv: string[]) {
  const sharedOptions = {
    dir: {
      type: 'string',
      describe: 'Directory of the Toolpad Studio application',
      default: './toolpad',
    },
    base: {
      type: 'string',
      describe: 'Public base path of the Toolpad Studio application',
      default: '/prod',
    },
  } as const;

  const sharedRunOptions = {
    ...sharedOptions,
    port: {
      type: 'number',
      describe: 'Port to run the Toolpad Studio application on',
      demandOption: false,
      alias: 'p',
    },
    dev: {
      type: 'boolean',
      describe: 'Run the Toolpad Studio editor app in development mode',
      demandOption: false,
      default: false,
      hidden: true,
    },
  } as const;

  const parsedArgs = yargs(argv)
    // See https://github.com/yargs/yargs/issues/538
    .scriptName('toolpad-studio')
    .command(
      ['$0 [dir]', 'dev [dir]'],
      'Run Toolpad Studio in development mode',
      {
        ...sharedRunOptions,
      },
      (args) => devCommand(args),
    )
    .command(
      'start [dir]',
      'Run built Toolpad Studio application in production mode',
      {
        ...sharedRunOptions,
      },
      (args) => startCommand(args),
    )
    .command(
      'build [dir]',
      'Build Toolpad Studio app for production',
      {
        ...sharedOptions,
      },
      (args) => buildCommand(args),
    )
    .command(
      'editor [url]',
      'Run the Toolpad Studio editor for a custom server',
      {
        url: {
          type: 'string',
          describe: 'URL of the Toolpad Studio application',
          demandOption: true,
        },
        dev: {
          type: 'boolean',
          describe: 'Run the Toolpad Studio editor app in development mode',
          demandOption: false,
          default: false,
          hidden: true,
        },
      },
      (args) => editorCommand(args),
    )
    .command('help', 'Show help', {}, async () => {
      // eslint-disable-next-line no-console
      console.log(await parsedArgs.getHelp());
    })
    .help();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  parsedArgs.argv;
}
