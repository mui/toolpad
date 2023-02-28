import 'dotenv/config';
import arg from 'arg';
import path from 'path';

const DEFAULT_PORT = 3000;

const INTERVAL = 1000;
const MAX_RETRIES = 30;

const DEFAULT_URL = 'http://localhost:3000/';
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
  // Whether to disable the browser automatically opening up on startup
  noBrowser?: boolean;
}

async function runApp(
  cmd: 'dev' | 'start',
  { debugMode = false, port, noBrowser }: RunCommandArgs,
) {
  const { execa } = await import('execa');
  const { default: getPort } = await import('get-port');
  const toolpadDir = path.resolve(__dirname, '../..'); // from ./dist/server
  const nextCommand = debugMode ? 'dev' : 'start';

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getNextPort(DEFAULT_PORT) }) : DEFAULT_PORT;
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

  process.stdin.pipe(cp.stdin!);
  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stdout);

  if (cp.stdout && cmd === 'dev' && !noBrowser) {
    const checkedUrl = new URL(HEALTH_CHECK_URL, DEFAULT_URL);
    for (let i = 1; i <= MAX_RETRIES; i += 1) {
      try {
        // eslint-disable-next-line no-console
        console.log(`(${i}/${MAX_RETRIES}) trying reach "${checkedUrl.href}"...`);
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(checkedUrl.href);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // eslint-disable-next-line no-console
        console.log(`Connected! Opening browser to Toolpad app...`);
        // eslint-disable-next-line no-await-in-loop
        await execa('open', [DEFAULT_URL], { stdio: 'inherit' });
        return;
      } catch (err: any) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, INTERVAL);
        });
      }
    }
    throw new Error(`Failed to connect`);
  }

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
      '--next-dev': Boolean,
      '--port': Number,
      '--no-browser': Boolean,

      // Aliases
      '-p': '--port',
    },
    {
      argv,
    },
  );

  const command = args._[0];

  const runArgs = {
    debugMode: args['--next-dev'],
    port: args['--port'],
  };

  const devArgs = {
    ...runArgs,
    noBrowser: args['--no-browser'],
  };

  switch (command) {
    case undefined:
    case 'dev':
      await devCommand(devArgs);
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
