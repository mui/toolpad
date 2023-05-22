import * as path from 'path';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import childProcess from 'child_process';
import { Readable } from 'stream';
import { once } from 'events';
import invariant from 'invariant';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { test as base } from './test';

interface RunningLocalApp {
  url: string;
  dir: string;
}

// You'll need to have `yarn dev` running for this
const VERBOSE = true;

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

interface SetupContext {
  dir: string;
}

interface WithAppOptions {
  // Command to start toolpad with
  cmd?: 'start' | 'dev';
  // Template to be used as the starting point of the project folder toolpad is running in
  // This will copied to the temporary folder
  template?: string;
  // Run toolpad next.js app in local dev mode
  toolpadDev?: boolean;
  setup?: (ctx: SetupContext) => Promise<void>;
  // Extra environment variables when running Toolpad
  env?: Record<string, string>;
}

/**
 * Spins up a Toolpad app in a local temporary folder. The folder is deleted after `doWork` is done
 */
export async function withApp(
  options: WithAppOptions,
  doWork: (app: RunningLocalApp) => Promise<void>,
) {
  const { cmd = 'start', template, setup, env } = options;

  const tmpTestDir = await fs.mkdtemp(path.resolve(__dirname, './tmp-'));

  try {
    const projectDir = path.resolve(tmpTestDir, './fixture');
    await fs.mkdir(projectDir, { recursive: true });

    if (template) {
      await fs.cp(template, projectDir, { recursive: true });
    }

    if (setup) {
      await setup({ dir: projectDir });
    }

    const args: string[] = [cmd];
    if (options.toolpadDev) {
      args.push('--dev');
    }

    if (cmd === 'start') {
      const buildArgs = ['build'];

      const child = childProcess.spawn('toolpad', buildArgs, {
        cwd: projectDir,
        stdio: 'pipe',
        env: {
          ...process.env,
          ...env,
        },
      });

      if (VERBOSE) {
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
      }

      await once(child, 'exit');

      if (child.exitCode !== 0) {
        throw new Error('Build failed');
      }
    }

    const child = childProcess.spawn('toolpad', args, {
      cwd: projectDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        ...env,
      },
    });

    try {
      await Promise.race([
        once(child, 'exit').then(([code]) => {
          throw new Error(`App process exited unexpectedly${code ? ` with code ${code}` : ''}`);
        }),
        (async () => {
          invariant(child.stdout, "Childprocess must be started with stdio: 'pipe'");

          if (VERBOSE) {
            child.stdout?.pipe(process.stdout);
            child.stderr?.pipe(process.stderr);
          }

          const match = await waitForMatch(child.stdout, /localhost:(\d+)/);

          if (!match) {
            throw new Error('Failed to start');
          }

          const port = Number(match[1]);
          await doWork({ url: `http://localhost:${port}`, dir: projectDir });
        })(),
      ]);
    } finally {
      child.kill();
    }
  } finally {
    await fs.rm(tmpTestDir, { recursive: true });
  }
}

const test = base.extend<
  {
    projectSnapshot: null;
  },
  {
    browserCloser: null;
    localApp: RunningLocalApp;
    toolpadDev: boolean;
    localAppConfig?: WithAppOptions;
  }
>({
  toolpadDev: [!!process.env.TOOLPAD_NEXT_DEV, { option: true, scope: 'worker' }],
  localAppConfig: [undefined, { option: true, scope: 'worker' }],
  localApp: [
    async ({ localAppConfig, toolpadDev }, use) => {
      if (!localAppConfig) {
        throw new Error('localAppConfig missing');
      }
      await withApp({ toolpadDev, ...localAppConfig }, async (app) => {
        await use(app);
      });
    },
    { scope: 'worker' },
  ],
  baseURL: async ({ localApp }, use) => {
    await use(localApp.url);
  },
  browserCloser: [
    async ({ browser }, use) => {
      // For some reason the browser doesn't close automatically when running a child process
      await use(null);
      await browser.close();
    },
    {
      scope: 'worker',
      auto: true,
    },
  ],
  projectSnapshot: [
    async ({ localApp }, use, testInfo) => {
      await use(null);

      if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') {
        await fs.mkdir(testInfo.outputDir, { recursive: true });
        const output = createWriteStream(path.resolve(testInfo.outputDir, './projectSnapshot.zip'));
        const archive = archiver.create('zip');
        archive.directory(localApp.dir, '/project');
        archive.finalize();

        await pipeline(archive, output);
      }
    },
    { scope: 'test', auto: true },
  ],
});

// eslint-disable-next-line import/export
export * from './test';
// eslint-disable-next-line import/export
export { test };
