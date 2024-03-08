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
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      TOOLPAD_AUTH_SECRET: 'donttellanyone',
      TOOLPAD_AUTH_USERNAME: 'foo',
      TOOLPAD_AUTH_PASSWORD: 'bar',
    },
  },
});

test('Must be authenticated with correct credentials to access app', async ({ page }) => {
  await page.goto('/prod/pages/mypage');

  // Sign in with invalid credentials
  await tryCredentialsSignIn(page, 'foo', 'wrongpassword');
  await expect(page).toHaveURL(/\/prod\/signin/);
  await expect(page.getByText('Invalid credentials.')).toBeVisible();

  // Sign in with valid credentials
  await tryCredentialsSignIn(page, 'foo', 'bar');
  await expect(page).toHaveURL(/\/prod\/pages\/mypage/);
  await expect(page.getByText('message: hello world')).toBeVisible();
});
