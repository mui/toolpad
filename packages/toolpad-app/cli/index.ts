import 'dotenv/config';
import arg from 'arg';
import path from 'path';
import open, { App } from 'open';
import invariant from 'invariant';

const DEFAULT_PORT = 3000;
// https://github.com/sindresorhus/open#app
const DEFAULT_BROWSER = open.apps.chrome;
const INTERVAL = 1000;
const MAX_RETRIES = 30;

const HEALTH_CHECK_URL = `/health-check`;

function* getNextPort(port: number = DEFAULT_PORT) {
  while (true) {
    yield port;
    port += 1;
  }
}

interface RunCommandArgs {
  // Whether Toolpad editor is running in debug mode
  debugMode?: boolean;
  port?: number;
}

const waitForHealthCheck = async (port: number): Promise<void> => {
  const { default: chalk } = await import('chalk');
  const TOOLPAD_BASE_URL = `http://localhost:${port}/`;
  const checkedUrl = new URL(HEALTH_CHECK_URL, TOOLPAD_BASE_URL);
  for (let i = 1; i <= MAX_RETRIES; i += 1) {
    try {
      // eslint-disable-next-line no-console
      console.log(`(${i}/${MAX_RETRIES}) trying to reach "${checkedUrl.href}"...`);
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(checkedUrl.href);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // eslint-disable-next-line no-console
      console.log(`${chalk.green('success')} - Toolpad connected! Opening browser...`);
      return;
    } catch (err: any) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, INTERVAL);
      });
    }
  }
  throw new Error(`Failed to connect`);
};

// From https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js

const Actions = Object.freeze({
  NONE: 0,
  BROWSER: 1,
});

function getBrowserEnv() {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/open#app for documentation.
  const value = process.env.TOOLPAD_CLI_BROWSER;

  const args = process.env.BROWSER_ARGS ? process.env.BROWSER_ARGS.split(' ') : [];

  let action;
  if (!value) {
    // Default.
    action = Actions.BROWSER;
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE;
  } else {
    action = Actions.BROWSER;
  }
  return { action, value, args };
}

async function startBrowserProcess(url: string, browserName?: string, args?: string[]) {
  // (Use open to open a new tab)
  try {
    const browser: App = {
      name: browserName || DEFAULT_BROWSER,
      arguments: args,
    };

    const options = { app: browser, wait: false, url: true };

    open(url, options);

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reads the TOOLPAD_CLI_BROWSER environment variable and decides what to do with it. Returns
 * true if it opened a browser, otherwise false.
 */
async function openBrowser(url: string) {
  const { action, value, args } = getBrowserEnv();
  switch (action) {
    case Actions.NONE:
      // Special case: BROWSER="none" will prevent opening completely.
      return false;

    case Actions.BROWSER:
      return startBrowserProcess(url, value, args);

    default:
      throw new Error('Not implemented.');
  }
}

async function runApp(cmd: 'dev' | 'start', { debugMode = false, port }: RunCommandArgs) {
  const { execa } = await import('execa');
  const { default: chalk } = await import('chalk');
  const { default: getPort } = await import('get-port');
  const toolpadDir = path.resolve(__dirname, '../..'); // from ./dist/server
  const nextCommand = debugMode ? 'dev' : 'start';

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getNextPort(DEFAULT_PORT) }) : DEFAULT_PORT;
  } else {
    // if port is specified but is not available, exit
    const availablePort = await getPort({ port });
    if (availablePort !== port) {
      // eslint-disable-next-line no-console
      console.error(`${chalk.red('error')} - Port ${port} is not available. Aborted.`);
      process.exit(1);
    }
  }

  const cp = execa('next', [nextCommand, `--port=${port}`], {
    cwd: toolpadDir,
    preferLocal: true,
    stdio: 'pipe',
    env: {
      TOOLPAD_LOCAL_MODE: '1',
      TOOLPAD_PROJECT_DIR: process.cwd(),
      TOOLPAD_CMD: cmd,
      FORCE_COLOR: '1',
    } as any,
  });

  invariant(cp.stdout, 'child process must be started with "stdio: \'pipe\'"');

  if (cmd === 'dev') {
    const TOOLPAD_BASE_URL = `http://localhost:${port}/`;
    await waitForHealthCheck(port);
    try {
      await openBrowser(TOOLPAD_BASE_URL);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(`${chalk.red('error')} - Failed to open browser: ${err.message}`);
    }
  }

  process.stdin.pipe(cp.stdin!);
  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stdout);

  cp.on('exit', (code) => {
    if (code) {
      process.exit(code);
    }
  });
}

async function devCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('Starting Toolpad application in dev mode...');
  await runApp('dev', args);
}

async function buildCommand() {
  // eslint-disable-next-line no-console
  console.log('Building Toolpad application...');
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  // eslint-disable-next-line no-console
  console.log('done.');
}

async function startCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('Starting Toolpad application...');
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
    debugMode: args['--dev'],
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
