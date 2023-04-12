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
interface Options {
  port?: number;
  dev?: boolean;
  dir?: string;
}

async function runApp(cmd: Command, { port, dev = false, dir = '.' }: Options) {
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
      NODE_ENV: dev ? 'development' : 'production',
      TOOLPAD_DIR: toolpadDir,
      TOOLPAD_PROJECT_DIR: projectDir,
      TOOLPAD_PORT: String(port),
      TOOLPAD_CMD: cmd,
      FORCE_COLOR: '1',
    },
  });

  invariant(cp.stdout, 'child process must be started with "stdio: \'pipe\'"');

  process.stdin.pipe(cp.stdin!);
  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stderr);

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

async function devCommand(args: yargs.ArgumentsCamelCase<Options>) {
  const { default: chalk } = await import('chalk');

  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad application in dev mode...`);
  await runApp('dev', args);
}

async function buildCommand({ dir = '.' }) {
  const projectDir = path.resolve(process.cwd(), dir);
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - building Toolpad application...`);

  process.env.TOOLPAD_PROJECT_DIR = projectDir;

  const { buildApp } = await import('../src/server/toolpadAppBuilder');

  await buildApp({ root: projectDir, base: '/prod' });
  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - build done.`);
}

async function startCommand(args: yargs.ArgumentsCamelCase<Options>) {
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - Starting Toolpad application...`);
  await runApp('start', args);
}

export default async function cli(argv: string[]) {
  await yargs(argv)
    // See https://github.com/yargs/yargs/issues/538
    .scriptName('toolpad')
    .command({
      command: 'dev [dir]',
      describe: 'Run Toolpad in development mode',
      builder: {
        port: {
          type: 'number',
          describe: 'Port to run the application on',
          demandOption: false,
        },
        dev: {
          type: 'boolean',
          describe: 'Run the Toolpad editor Next.js app in production mode',
          demandOption: false,
          default: false,
          hidden: true,
        },
      },
      handler: (args) => devCommand(args),
    })
    .command({
      command: 'start [dir]',
      describe: 'Run built Toolpad application in production mode',
      builder: {
        port: {
          type: 'number',
          describe: 'Port to run the application on',
          demandOption: false,
        },
        dev: {
          type: 'boolean',
          describe: 'Run the Toolpad editor Next.js app in production mode',
          demandOption: false,
          default: false,
          hidden: true,
        },
      },
      handler: (args) => startCommand(args),
    })
    .command({
      command: 'build [dir]',
      describe: 'Build Toolpad app for production',
      handler: (args) => buildCommand(args),
    })
    .command({
      command: 'help',
      describe: 'Show help',
      handler: async () => {
        // eslint-disable-next-line no-console
        console.log(await yargs.getHelp());
      },
    })
    .help().argv;
}
