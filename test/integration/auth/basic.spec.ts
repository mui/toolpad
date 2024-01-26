import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';
import { tryCredentialsSignIn } from './shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    /Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/,
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      TOOLPAD_AUTH_SECRET: 'donttellanyone',
      NODE_ENV: 'test',
    },
  },
});

test('Must be authenticated with valid domain to view app', async ({ page }) => {
  // Is redirected when unauthenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL(/\/prod\/signin/);

  // Sign in with invalid domain
  await tryCredentialsSignIn(page, 'test', 'test');
  await expect(page).toHaveURL(/\/prod\/signin/);
  await expect(page.getByText('Access unauthorized.')).toBeVisible();

  // Sign in with valid domain
  await tryCredentialsSignIn(page, 'mui', 'mui');
  await expect(page).toHaveURL(/\/prod\/pages\/mypage/);

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
