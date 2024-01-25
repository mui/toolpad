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
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      TOOLPAD_AUTH_SECRET: 'donttellanyone',
      NODE_ENV: 'test',
    },
  },
});

test('Must be authenticated with valid domain to view pages', async ({ page }) => {
  // Is redirected when unauthenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL(/\/prod\/signin/);

  const tryCredentialsSignIn = async (username: string, password: string) => {
    // Sign in with invalid domain
    await page.getByText('Sign in with credentials').click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  };

  // Sign in with invalid domain
  await tryCredentialsSignIn('test', 'test');

  await expect(page).toHaveURL(/\/prod\/signin/);
  await expect(page.getByText('Access unauthorized.')).toBeVisible();

  // Sign in with valid domain
  await tryCredentialsSignIn('mui', 'mui');

  // Sees page content when authenticated
  await expect(page).toHaveURL(/\/prod\/pages\/mypage/);

  // Is not redirected when unauthenticated
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
