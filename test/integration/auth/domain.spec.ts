import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';
import { tryCredentialsSignIn } from './shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    /Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/,
    /NetworkError when attempting to fetch resource./,
    /The operation was aborted./,
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-domain'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      TOOLPAD_AUTH_SECRET: 'donttellanyone',
      NODE_ENV: 'test',
    },
  },
});

test('Must be authenticated with valid domain to access app', async ({ page, request }) => {
  // Is redirected when unauthenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL(/\/prod\/signin/);

  // Access is blocked to API route
  const res = await request.post('/prod/api/data/page/hello');
  expect(res.status()).toBe(401);

  // Sign in with invalid domain
  await tryCredentialsSignIn(page, 'test', 'test');
  await expect(page).toHaveURL(/\/prod\/signin/);
  await expect(page.getByText('Access unauthorized.')).toBeVisible();

  // Sign in with valid domain
  await tryCredentialsSignIn(page, 'mui', 'mui');
  await expect(page).toHaveURL(/\/prod\/pages\/mypage/);
  await expect(page.getByText('my email: test@mui.com')).toBeVisible();

  // Is not redirected when authenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL(/\/prod\/pages\/mypage/);

  // Sign out
  await page.getByText('Mr. MUI 2024').click();
  await page.getByText('Sign out').click();

  await expect(page).toHaveURL(/\/prod\/signin/);

  // Is redirected when unauthenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL(/\/prod\/signin/);
});
