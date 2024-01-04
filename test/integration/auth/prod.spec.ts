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
    },
  },
});

test('Must redirect to sign-in page if user is not authenticated', async ({ page }) => {
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL('/prod/signin');
});

test.only('Must be redirected on sign in', async ({ page }) => {
  await page.goto('/prod/signin');

  const githubLoginButton = page.getByText('Sign in with GitHub');

  await page.route('*/**/api/auth/csrf', async (route) => {
    const json = { csrfToken: 'idontlikehackers' };
    await route.fulfill({ json });
  });

  await page.route('*/**/api/auth/signin/github', async (route) => {
    const json = { url: { signInUrl: '/prod/pages/mypage' } };
    await route.fulfill({ json });
  });

  await githubLoginButton.click();

  await expect(page).toHaveURL('/prod/pages/mypage');
});

test('Must be able to view pages if authenticated', async ({ page }) => {});
