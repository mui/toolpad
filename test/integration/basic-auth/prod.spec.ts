import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    /Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/,
  ],
});

test.use({
  localAppConfig: {
    template: path.resolve(currentDirectory, './fixture'),
    cmd: 'start',
    env: {
      TOOLPAD_BASIC_AUTH_USER: 'foo',
      TOOLPAD_BASIC_AUTH_PASSWORD: 'bar',
    },
  },
});

test('Access is blocked', async ({ page }) => {
  const res = await page.goto('/prod/pages/page1');
  expect(res?.status()).toBe(401);
});

test('Access is blocked to API route', async ({ request }) => {
  const res = await request.post('/prod/api/data/page1/hello');
  expect(res.status()).toBe(401);
});

test('Access is granted when authenticated', async ({ browserName, page, localApp }) => {
  test.skip(
    browserName === 'firefox',
    'Fails due to https://bugzilla.mozilla.org/show_bug.cgi?id=1742396',
  );

  const appUrl = new URL(localApp.url);
  appUrl.username = 'foo';
  appUrl.password = 'bar';

  const res = await page.goto(appUrl.href);
  expect(res?.status()).toBe(200);
  await expect(page.locator('text="message: hello world"')).toBeVisible();
});
