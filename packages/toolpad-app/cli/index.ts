import 'dotenv/config';
import arg from 'arg';
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

interface RunCommandArgs {
  // Whether Toolpad editor is running in debug mode
  devMode?: boolean;
  port?: number;
}

async function runApp(cmd: 'dev' | 'start', { devMode = false, port }: RunCommandArgs) {
  const { execa } = await import('execa');
  const { default: chalk } = await import('chalk');
  const { default: getPort } = await import('get-port');
  const toolpadDir = path.resolve(__dirname, '../..'); // from ./dist/server
  const nextCommand = devMode ? 'dev' : 'start';

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

  const cp = execa('next', [nextCommand, `--port=${port}`], {
    cwd: toolpadDir,
    preferLocal: true,
    stdio: 'pipe',
    env: {
      TOOLPAD_PROJECT_DIR: process.cwd(),
      TOOLPAD_CMD: cmd,
      FORCE_COLOR: '1',
    } as any,
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
      await openBrowser(toolpadBaseUrl);
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

async function devCommand(args: RunCommandArgs) {
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad application in dev mode...`);
  await runApp('dev', args);
}

async function buildCommand() {
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - building Toolpad application...`);
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  // eslint-disable-next-line no-console
  console.log('done.');
}

async function startCommand(args: RunCommandArgs) {
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - Starting Toolpad application...`);
  await runApp('start', args);
}

export default async function cli(argv: string[]) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--dev': Boolean,
      '--port': Number,

      // Aliases
      '-p': '--port',
    },
    {
      argv,
    },
  );

  const command = args._[0];

  const runArgs = {
    devMode: args['--dev'],
    port: args['--port'],
  };

  switch (command) {
    case undefined:
    case 'dev':
      await devCommand(runArgs);
      break;
    case 'build':
      await buildCommand();
      break;
    case 'start':
      await startCommand(runArgs);
      break;
    default:
      throw new Error(`Unknown command "${command}"`);
  }
}
