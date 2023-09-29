import * as path from 'path';
import { expect, test } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expectBasicPageContent } from './shared';

test.use({
  ignoreConsoleErrors: [/The page’s settings blocked the loading of a resource at/],
});

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'start',
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
    base: '/foo',
  },
});

test('base path basics', async ({ page, context, localApp }) => {
  await context.addCookies([
    { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
  ]);

  const res = await page.goto(`${localApp.url}/prod`);
  expect(res?.status()).toBe(404);

  const runtimeModel = new ToolpadRuntime(page, {
    base: '/foo',
  });
  await runtimeModel.gotoPage('basic');

  await expectBasicPageContent(page);
});
