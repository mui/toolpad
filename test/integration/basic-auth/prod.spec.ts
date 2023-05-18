import * as path from 'path';
import { test, expect } from '../../playwright/localTest';

test.use({
  ignoreConsoleErrors: [
    /Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/,
  ],
});

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
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

  const url = new URL(localApp.url);
  url.username = 'foo';
  url.password = 'bar';

  const res = await page.goto(url.href);
  expect(res?.status()).toBe(200);
  await expect(page.locator('text="message: hello world"')).toBeVisible();
});
