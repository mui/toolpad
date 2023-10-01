import * as path from 'path';
import * as fs from 'fs/promises';
import childProcess from 'child_process';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { once } from 'events';
import invariant from 'invariant';
import * as archiver from 'archiver';
import getPort from 'get-port';
import { PageScreenshotOptions, test as baseTest } from './test';
import { waitForMatch } from '../utils/streams';

const CLI_CMD = path.resolve(__dirname, '../../packages/toolpad-app/cli.js');

const PROJECT_ROOT = path.resolve(__dirname, '../../');

// https://github.com/mui/material-ui/blob/bc35128302b5bd61fa35f89d371aeed91e6a5748/scripts/pushArgos.mjs#L7
const ARGOS_OUTPUT_FOLDER = 'test/regressions/screenshots/chrome';

export interface RunningLocalApp {
  url: string;
  dir: string;
  stdout: Readable;
}

// You'll need to have `yarn dev` running for this
const VERBOSE = true;

interface SetupContext {
  dir: string;
}

interface WithAppOptions {
  // Command to start toolpad with
  cmd?: 'start' | 'dev';
  // Template to be used as the starting point of the project folder toolpad is running in
  // This will copied to the temporary folder
  template?: string;
  // Run toolpad editor app in local dev mode
  toolpadDev?: boolean;
  setup?: (ctx: SetupContext) => Promise<void>;
  // Extra environment variables when running Toolpad
  env?: Record<string, string>;
  base?: string;
}

/**
 * Spins up a Toolpad app in a local temporary folder. The folder is deleted after `doWork` is done
 */
export async function withApp(
  options: WithAppOptions,
  doWork: (app: RunningLocalApp) => Promise<void>,
) {
  const { cmd = 'start', template, setup, env, base } = options;

  // Each test runs in its own temporary folder to avoid race conditions when running tests in parallel.
  // It also avoids mutating the source code of the fixture while running the test.
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

    const args: string[] = [CLI_CMD, cmd];
    if (options.toolpadDev) {
      args.push('--dev');
    }

    // Run each test on its own port to avoid race conditions when running tests in parallel.
    args.push('--port', String(await getPort()));

    if (base) {
      args.push('--base', base);
    }

    if (cmd === 'start') {
      const buildArgs = [CLI_CMD, 'build'];

      if (base) {
        buildArgs.push('--base', base);
      }

      const child = childProcess.spawn('node', buildArgs, {
        cwd: projectDir,
        stdio: 'pipe',
        shell: !process.env.CI,
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

    const child = childProcess.spawn('node', args, {
      cwd: projectDir,
      stdio: 'pipe',
      shell: !process.env.CI,
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
          await doWork({ url: `http://localhost:${port}`, dir: projectDir, stdout: child.stdout });
        })(),
      ]);
    } finally {
      child.kill();
    }
  } finally {
    await fs.rm(tmpTestDir, { recursive: true, maxRetries: 3, retryDelay: 1000 });
  }
}

const test = baseTest.extend<
  {
    projectSnapshot: null;
    // Take a screenshot of the app to be used in argos-ci
    argosScreenshot: (
      name: string,
      options?: Omit<PageScreenshotOptions, 'path' | 'type'>,
    ) => Promise<void>;
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
    { scope: 'worker', timeout: 60000 },
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
  argosScreenshot: [
    async ({ page }, use, testInfo) => {
      await use(async (name, options) => {
        const snapshotPath = testInfo.snapshotPath(`${name}.png`);
        const relative = path.relative(testInfo.project.testDir, snapshotPath);

        invariant(
          !relative.startsWith('..'),
          "Can't store a screenshot outside of the argos directory",
        );

        const screenshotPath = path.resolve(PROJECT_ROOT, ARGOS_OUTPUT_FOLDER, relative);
        await page.screenshot({
          path: screenshotPath,
          animations: 'disabled',
          ...options,
        });
      });
    },
    { scope: 'test', auto: true },
  ],
});

// eslint-disable-next-line import/export
export * from './test';
// eslint-disable-next-line import/export
export { test };
