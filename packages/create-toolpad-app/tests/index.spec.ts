import * as fs from 'fs/promises';
import * as path from 'path';
import * as url from 'url';
import readline from 'readline';
import { Readable } from 'stream';
import { execa } from 'execa';
import { test, expect, afterEach } from 'vitest';
import * as os from 'os';
import terminate from 'terminate';

type ExecaChildProcess = ReturnType<typeof execa>;

const TEST_TIMEOUT = process.env.CI ? 60000 : 600000;

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const cliPath = path.resolve(currentDirectory, '../dist/index.js');

let testDir: string | undefined;
let cp: ExecaChildProcess | undefined;
let toolpadProcess: ExecaChildProcess | undefined;

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

async function waitForPromptAndRespond(
  cpr: ExecaChildProcess,
  regex: RegExp,
  response: string,
): Promise<void> {
  return new Promise((resolve) => {
    const onData = (data: Buffer) => {
      const output = data.toString();
      // Check if the output matches the regex
      if (regex.test(output)) {
        // Remove the listener to prevent it from being called again
        cpr.stdout?.removeListener('data', onData);
        // Write the response to the stdin
        cpr.stdin?.write(response);
        cpr.stdin?.write('\n');
        resolve();
      }
    };
    cpr.stdout?.on('data', onData);
  });
}

test(
  'create-toolpad-app can bootstrap a Toolpad Studio app',
  async () => {
    testDir = await fs.mkdtemp(path.resolve(os.tmpdir(), './test-app-'));
    cp = execa(cliPath, [testDir, '--studio'], {
      cwd: currentDirectory,
    });
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);
    const result = await cp;
    expect(result.stdout).toMatch('Run the following to get started');
    const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
      encoding: 'utf-8',
    });
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toEqual(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@toolpad/studio': expect.any(String),
        }),
        scripts: expect.objectContaining({
          build: 'toolpad-studio build',
          dev: 'toolpad-studio dev',
          start: 'toolpad-studio start',
        }),
      }),
    );

    // check that file exists or not in the directory
    const gitignore = await fs.readFile(path.resolve(testDir, './.gitignore'), {
      encoding: 'utf-8',
    });

    expect(gitignore.length).toBeGreaterThan(0);

    toolpadProcess = execa('pnpm', ['dev', '--create'], {
      cwd: testDir,
      env: {
        FORCE_COLOR: '0',
        BROWSER: 'none',
      },
    });
    toolpadProcess.stdout?.pipe(process.stdout);
    toolpadProcess.stderr?.pipe(process.stderr);

    const match = await waitForMatch(toolpadProcess.stdout!, /http:\/\/localhost:(\d+)/);

    expect(match).toBeTruthy();

    const appUrl = match![0];
    const res = await fetch(`${appUrl}/health-check`);
    expect(res).toHaveProperty('status', 200);
  },
  TEST_TIMEOUT,
);

test(
  'create-toolpad-app can bootstrap a Toolpad Core app without authentication',
  async () => {
    testDir = await fs.mkdtemp(path.resolve(os.tmpdir(), './test-app-'));
    cp = execa(cliPath, [testDir, '--coreVersion', 'latest'], {
      cwd: currentDirectory,
    });
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);

    // Wait for the framework prompt and select Next.js (default)
    await waitForPromptAndRespond(cp, /Which framework/, '\n');

    // Wait for the router prompt and select the App Router
    await waitForPromptAndRespond(cp, /Which router/, '\n');

    // Wait for the authentication prompt and select 'No'
    await waitForPromptAndRespond(cp, /enable authentication/, 'n');

    const result = await cp;
    expect(result.stdout).toMatch('Run the following to get started');
    const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
      encoding: 'utf-8',
    });
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toEqual(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@toolpad/core': expect.any(String),
        }),
        scripts: expect.objectContaining({
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        }),
      }),
    );

    // check that file exists or not in the directory
    const gitignore = await fs.readFile(path.resolve(testDir, './.gitignore'), {
      encoding: 'utf-8',
    });

    expect(gitignore.length).toBeGreaterThan(0);

    toolpadProcess = execa('pnpm', ['dev'], {
      cwd: testDir,
      env: {
        FORCE_COLOR: '0',
        BROWSER: 'none',
      },
    });
    toolpadProcess.stdout?.pipe(process.stdout);
    toolpadProcess.stderr?.pipe(process.stderr);

    const match = await waitForMatch(toolpadProcess.stdout!, /http:\/\/localhost:(\d+)/);

    expect(match).toBeTruthy();
  },
  TEST_TIMEOUT,
);

test(
  'create-toolpad-app can bootstrap a Toolpad Core app with authentication',
  async () => {
    testDir = await fs.mkdtemp(path.resolve(os.tmpdir(), './test-app-auth-'));
    cp = execa(cliPath, [testDir, '--coreVersion', 'latest'], {
      cwd: currentDirectory,
    });

    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);

    // Wait for the framework prompt and select Next.js (default)
    await waitForPromptAndRespond(cp, /Which framework/, '\n');

    // Wait for the router prompt and select the App Router
    await waitForPromptAndRespond(cp, /Which router/, '\n');

    // Wait for the authentication prompt and select 'Yes'
    await waitForPromptAndRespond(cp, /enable authentication/, 'y');

    // Wait for the auth providers prompt and select all (press 'a' then Enter)
    await waitForPromptAndRespond(cp, /Select authentication providers/, 'a\n');

    const result = await cp;
    expect(result.stdout).toMatch('Run the following to get started');

    const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
      encoding: 'utf-8',
    });
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toEqual(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@toolpad/core': expect.any(String),
          'next-auth': expect.any(String),
        }),
        scripts: expect.objectContaining({
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        }),
      }),
    );

    // Check if auth.ts file is created
    const authFileExists = await fs
      .access(path.resolve(testDir, './auth.ts'))
      .then(() => true)
      .catch(() => false);

    expect(authFileExists).toBe(true);

    toolpadProcess = execa('pnpm', ['dev'], {
      cwd: testDir,
      env: {
        FORCE_COLOR: '0',
        BROWSER: 'none',
      },
    });
    toolpadProcess.stdout?.pipe(process.stdout);
    toolpadProcess.stderr?.pipe(process.stderr);

    const match = await waitForMatch(toolpadProcess.stdout!, /http:\/\/localhost:(\d+)/);

    expect(match).toBeTruthy();
  },
  TEST_TIMEOUT,
);

test(
  'create-toolpad-app can bootstrap a Toolpad Core app with Vite without authentication',
  async () => {
    testDir = await fs.mkdtemp(path.resolve(os.tmpdir(), './test-app-vite-'));
    cp = execa(cliPath, [testDir, '--coreVersion', 'latest'], {
      cwd: currentDirectory,
    });
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);

    // Wait for the framework prompt and select Vite (down arrow + enter)
    await waitForPromptAndRespond(cp, /Which framework/, '\u001b[B');

    // Wait for the authentication prompt and select 'No'
    await waitForPromptAndRespond(cp, /enable authentication/, 'n');

    const result = await cp;
    expect(result.stdout).toMatch('Run the following to get started');
    const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
      encoding: 'utf-8',
    });
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toEqual(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@toolpad/core': expect.any(String),
        }),
        scripts: expect.objectContaining({
          dev: 'vite',
          preview: 'vite preview',
        }),
      }),
    );

    // check that file exists or not in the directory
    const gitignore = await fs.readFile(path.resolve(testDir, './.gitignore'), {
      encoding: 'utf-8',
    });

    expect(gitignore.length).toBeGreaterThan(0);

    toolpadProcess = execa('pnpm', ['dev'], {
      cwd: testDir,
      env: {
        FORCE_COLOR: '0',
        BROWSER: 'none',
      },
    });
    toolpadProcess.stdout?.pipe(process.stdout);
    toolpadProcess.stderr?.pipe(process.stderr);

    // Add console.log to see what output we're getting
    toolpadProcess.stdout?.on('data', (data) => {
      console.log('Vite output:', data.toString());
    });

    // Modify the regex to be more lenient
    const match = await waitForMatch(toolpadProcess.stdout!, /ready in/);

    expect(match).toBeTruthy();
  },
  TEST_TIMEOUT,
);

test(
  'create-toolpad-app can bootstrap a Toolpad Core app with Vite with authentication',
  async () => {
    testDir = await fs.mkdtemp(path.resolve(os.tmpdir(), './test-app-vite-auth-'));
    cp = execa(cliPath, [testDir, '--coreVersion', 'latest'], {
      cwd: currentDirectory,
    });
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);

    // Wait for the framework prompt and select Vite (down arrow + enter)
    await waitForPromptAndRespond(cp, /Which framework/, '\u001b[B\n');

    // Wait for the authentication prompt and select 'Yes'
    await waitForPromptAndRespond(cp, /enable authentication/, 'y');

    // Wait for the auth providers prompt and select all (press 'a' then Enter)
    await waitForPromptAndRespond(cp, /Select authentication providers/, 'a\n');

    const result = await cp;
    expect(result.stdout).toMatch('Run the following to get started');

    const packageJsonContent = await fs.readFile(path.resolve(testDir, './package.json'), {
      encoding: 'utf-8',
    });
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toEqual(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@toolpad/core': expect.any(String),
          firebase: expect.any(String),
        }),
        scripts: expect.objectContaining({
          dev: 'vite',
          preview: 'vite preview',
        }),
      }),
    );

    // Check if auth.ts file is created
    const authFileExists = await fs
      .access(path.resolve(testDir, './src/firebase/auth.ts'))
      .then(() => true)
      .catch(() => false);

    expect(authFileExists).toBe(true);

    toolpadProcess = execa('pnpm', ['dev'], {
      cwd: testDir,
      env: {
        FORCE_COLOR: '0',
        BROWSER: 'none',
      },
    });
    toolpadProcess.stdout?.pipe(process.stdout);
    toolpadProcess.stderr?.pipe(process.stderr);

    const match = await waitForMatch(toolpadProcess.stdout!, /ready in/);

    expect(match).toBeTruthy();
  },
  TEST_TIMEOUT,
);

afterEach(async () => {
  if (toolpadProcess) {
    await terminate(toolpadProcess.pid!);
    await toolpadProcess.catch(() => null);
    console.log('toolpad ended');
  }

  if (cp) {
    await terminate(cp.pid!);
    await cp.catch(() => null);
    console.log('create-toolpad-app ended');
  }

  if (testDir) {
    await fs.rm(testDir, { recursive: true, force: true });
    console.log('test directory cleaned up');
  }
}, 30000);
