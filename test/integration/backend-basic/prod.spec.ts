import * as path from 'path';
import * as url from 'url';
import { test } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expectBasicRuntimeTests } from './shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    [
      // Chrome:
      /Cannot read properties of null/,
      // firefox:
      /throws\.error is null/,
      // Intentionally thrown
      /BOOM!/,
    ],
    { scope: 'test' },
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

test('functions basics', async ({ page, context }) => {
  await context.addCookies([
    { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
  ]);

  const runtimeModel = new ToolpadRuntime(page, { prod: true });
  await runtimeModel.goToPage('basic');

  await expectBasicRuntimeTests(page);
});
