import 'dotenv/config';
import arg from 'arg';
import path from 'path';
import * as fs from 'fs/promises';

const DEFAULT_PORT = 3000;

function* getNextPort(port: number = DEFAULT_PORT) {
  while (true) {
    yield port;
    port += 1;
  }
}

const TOOLPAD_DIR_PATH = path.resolve(__dirname, '../..'); // from ./dist/server

interface RunCommandArgs {
  // Whether Toolpad editor is running in dev mode (for debugging purposes only)
  devMode?: boolean;
  port?: number;
}

async function runApp(cmd: 'dev' | 'start', { devMode = false, port }: RunCommandArgs) {
  const { execa } = await import('execa');
  const { default: getPort } = await import('get-port');

  const nextCommand = devMode ? 'dev' : 'start';

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getNextPort(DEFAULT_PORT) }) : DEFAULT_PORT;
  }

  const cp = execa('next', [nextCommand, `--port=${port}`], {
    cwd: TOOLPAD_DIR_PATH,
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

  cp.on('exit', (code) => {
    if (code) {
      process.exit(code);
    }
  });
}

const PROJECT_FILES_PATH = path.resolve(TOOLPAD_DIR_PATH, './cli/projectFiles');

async function writeProjectFiles(): Promise<void> {
  const projectFileNames = await fs.readdir(PROJECT_FILES_PATH);
  await Promise.all(
    projectFileNames.map(async (fileName) => {
      const filePath = path.resolve(PROJECT_FILES_PATH, fileName);
      const fileContent = await fs.readFile(filePath);

      fs.writeFile(path.join(process.cwd(), fileName), fileContent, { encoding: 'utf-8' });
    }),
  );
}

async function devCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('generating project files…');
  await writeProjectFiles();

  // eslint-disable-next-line no-console
  console.log('starting toolpad application in dev mode…');
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
