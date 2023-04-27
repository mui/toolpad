import 'dotenv/config';
import yargs from 'yargs';
import path from 'path';
import invariant from 'invariant';
import { Readable } from 'stream';
import * as readline from 'readline';
import openBrowser from 'react-dev-utils/openBrowser';

const DEFAULT_PORT = 3000;

async function waitForMatch(input: Readable, regex: RegExp): Promise<RegExpExecArray | null> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      const match = regex.exec(line);
      if (match) {
        rl.close();
        input.resume();
        resolve(match);
      }
    });
    rl.on('error', (err) => reject(err));
    rl.on('end', () => resolve(null));
  });
}

function* getPreferredPorts(port: number = DEFAULT_PORT): Iterable<number> {
  while (true) {
    yield port;
    port += 1;
  }
}

type Command = 'dev' | 'start' | 'build';
interface RunOptions {
  dir: string;
  port?: number;
  dev?: boolean;
}

async function runApp(cmd: Command, { port, dev = false, dir }: RunOptions) {
  const projectDir = path.resolve(process.cwd(), dir);
  const { execaNode } = await import('execa');
  const { default: chalk } = await import('chalk');
  const { default: getPort } = await import('get-port');
  const toolpadDir = path.resolve(__dirname, '../..'); // from ./dist/server

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getPreferredPorts(DEFAULT_PORT) }) : DEFAULT_PORT;
  } else {
    // if port is specified but is not available, exit
    const availablePort = await getPort({ port });
    if (availablePort !== port) {
      console.error(`${chalk.red('error')} - Port ${port} is not available. Aborted.`);
      process.exit(1);
    }
  }

  const serverPath = path.resolve(__dirname, './server.js');

  const cp = execaNode(serverPath, [], {
    cwd: projectDir,
    stdio: 'pipe',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      TOOLPAD_NEXT_DEV: dev ? '1' : '',
      TOOLPAD_DIR: toolpadDir,
      TOOLPAD_PROJECT_DIR: projectDir,
      TOOLPAD_PORT: String(port),
      TOOLPAD_CMD: cmd,
      FORCE_COLOR: '1',
    },
  });

  invariant(cp.stdout, 'child process must be started with "stdio: \'pipe\'"');
  invariant(cp.stderr, 'child process must be started with "stdio: \'pipe\'"');

  process.stdin.pipe(cp.stdin!);
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);

  if (cmd === 'dev') {
    // Poll stdout for "http://localhost:3000" first
    const match = await waitForMatch(cp.stdout, /http:\/\/localhost:(\d+)/);
    const detectedPort = match ? Number(match[1]) : null;
    invariant(detectedPort, 'Could not find port in stdout');
    const toolpadBaseUrl = `http://localhost:${detectedPort}/`;
    try {
      openBrowser(toolpadBaseUrl);
    } catch (err: any) {
      console.error(`${chalk.red('error')} - Failed to open browser: ${err.message}`);
    }
  }

  cp.on('exit', (code) => {
    if (code) {
      process.exit(code);
    }
  });
}

async function devCommand(args: RunOptions) {
  const { default: chalk } = await import('chalk');

  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad application in dev mode...`);
  await runApp('dev', args);
}

interface BuildOptions {
  dir: string;
}

async function buildCommand({ dir }: BuildOptions) {
  const projectDir = path.resolve(process.cwd(), dir);
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - building Toolpad application...`);

  const { execaNode } = await import('execa');

  const builderPath = path.resolve(__dirname, './appBuilder.js');

  await execaNode(builderPath, [], {
    cwd: projectDir,
    stdio: 'inherit',
    env: {
      NODE_ENV: 'production',
      TOOLPAD_PROJECT_DIR: projectDir,
      FORCE_COLOR: '1',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - build done.`);
}

async function startCommand(args: RunOptions) {
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - Starting Toolpad application...`);
  await runApp('start', args);
}

export default async function cli(argv: string[]) {
  const sharedOptions = {
    dir: {
      type: 'string',
      describe: 'Directory of the Toolpad application',
      default: '.',
    },
  } as const;

  const sharedRunOptions = {
    ...sharedOptions,
    port: {
      type: 'number',
      describe: 'Port to run the Toolpad application on',
      demandOption: false,
    },
    dev: {
      type: 'boolean',
      describe: 'Run the Toolpad editor Next.js app in development mode',
      demandOption: false,
      default: false,
      hidden: true,
    },
  } as const;

  await yargs(argv)
    // See https://github.com/yargs/yargs/issues/538
    .scriptName('toolpad')
    .command(
      ['$0 [dir]', 'dev [dir]'],
      'Run Toolpad in development mode',
      {
        ...sharedRunOptions,
      },
      (args) => devCommand(args),
    )
    .command(
      'start [dir]',
      'Run built Toolpad application in production mode',
      {
        ...sharedRunOptions,
      },
      (args) => startCommand(args),
    )
    .command(
      'build [dir]',
      'Build Toolpad app for production',
      {
        ...sharedOptions,
      },
      (args) => buildCommand(args),
    )
    .command('help', 'Show help', {}, async () => {
      // eslint-disable-next-line no-console
      console.log(await yargs.getHelp());
    })
    .help().argv;
}
