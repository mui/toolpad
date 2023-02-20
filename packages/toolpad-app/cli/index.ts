import 'dotenv/config';
import arg from 'arg';
import path from 'path';

const DEFAULT_PORT = 3000;

function* getNextPort(port: number = DEFAULT_PORT) {
  while (true) {
    yield port;
    port += 1;
  }
}

interface RunCommandArgs {
  // Whether Toolpad editor is running in dev mode (for debugging purposes only)
  devMode?: boolean;
  port?: number;
}

async function runApp(cmd: 'dev' | 'start', { devMode = false, port }: RunCommandArgs) {
  const { execa } = await import('execa');
  const { default: getPort } = await import('get-port');
  const toolpadDir = path.resolve(__dirname, '../..'); // from ./dist/server
  const nextCommand = devMode ? 'dev' : 'start';

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
}

async function devCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('starting toolpad application in dev mode...');
  await runApp('dev', args);
}

async function buildCommand() {
  // eslint-disable-next-line no-console
  console.log('building toolpad application...');
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  // eslint-disable-next-line no-console
  console.log('done.');
}

async function startCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('starting toolpad application...');
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
