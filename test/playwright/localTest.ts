import * as path from 'path';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import childProcess from 'child_process';
import { Readable } from 'stream';
import { once } from 'events';
import { test as base } from './test';

// You'll need to have `yarn dev13` running for this
const VERBOSE = true;

async function waitForMatch(input: Readable, regex: RegExp): Promise<RegExpExecArray | null> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      const match = regex.exec(line);
      if (match) {
        rl.close();
        resolve(match);
      }
    });
    rl.on('error', (err) => reject(err));
    rl.on('end', () => resolve(null));
  });
}

interface WithAppOptions {
  // Command to start toolpad with
  cmd?: 'start' | 'dev';
  // Template to be used as the starting point of the project folder toolpad is running in
  // This will copied to the temporary folder
  template?: string;
  // Run toolpad next.js app in local dev mode
  toolpadDev?: boolean;
}

/**
 * Spins up a Toolpad app in a local temporary folder. The folder is deleted after `doWork` is done
 */
export async function withApp(options: WithAppOptions, doWork: (url: string) => Promise<void>) {
  const { cmd = 'start', template } = options;

  const projectDir = await fs.mkdtemp(path.resolve(__dirname, './tmp-'));

  try {
    if (template) {
      await fs.cp(template, projectDir, { recursive: true });
    }

    const args: string[] = [cmd];
    if (options.toolpadDev) {
      args.push('--dev');
    }

    const child = childProcess.spawn('toolpad', args, {
      cwd: projectDir,
      stdio: 'pipe',
    });

    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            reject(new Error(`App process exited unexpectedly${code ? ` with code ${code}` : ''}`));
          });
        }),
        (async () => {
          if (!child.stdout) {
            throw new Error('No stdout');
          }

          if (VERBOSE) {
            child.stdout?.pipe(process.stdout);
            child.stderr?.pipe(process.stderr);
          }

          const match = await waitForMatch(child.stdout, /localhost:(\d+)/);

          if (!match) {
            throw new Error('Failed to start');
          }

          const port = Number(match[1]);
          await doWork(`http://localhost:${port}`);
        })(),
      ]);
    } finally {
      child.kill();
      if (!child.exitCode) {
        await once(child, 'exit');
      }
    }
  } finally {
    await fs.rm(projectDir, { recursive: true });
  }
}

const test = base.extend<
  {
    toolpadDev: boolean;
    localAppConfig?: WithAppOptions;
    localApp: { url: string };
  },
  { browserCloser: null }
>({
  toolpadDev: false,
  localAppConfig: undefined,
  localApp: async ({ localAppConfig, toolpadDev }, use) => {
    if (!localAppConfig) {
      throw new Error('localAppConfig missing');
    }
    await withApp({ toolpadDev, ...localAppConfig }, async (url) => {
      await use({ url });
    });
  },
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
});

// eslint-disable-next-line import/export
export * from './test';
// eslint-disable-next-line import/export
export { test };
