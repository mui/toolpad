import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { expect, test } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expectBasicRuntimeTests } from './shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    // eslint-disable-next-line material-ui/straight-quotes
    /The page’s settings blocked the loading of a resource \(img-src\) at http:\/\/localhost:\d+\/favicon\.ico/,
    /Failed to load resource: the server responded with a status of 404/,
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
    base: '/foo',
  },
});

test('base path basics', async ({ page, context, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  await context.addCookies([
    { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
  ]);

  const res = await page.goto(`${localApp.url}/prod`);
  expect(res?.status()).toBe(404);

  const runtimeModel = new ToolpadRuntime(page, {
    base: '/foo',
  });
  await runtimeModel.goToPage('basic');

  await expectBasicRuntimeTests(page);
});
