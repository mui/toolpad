import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';
import { tryCredentialsSignIn } from './shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    [/Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/],
    { scope: 'test' },
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-roles'),
  },
  localAppConfig: {
    cmd: 'start',
    env: {
      TOOLPAD_AUTH_SECRET: 'donttellanyone',
      NODE_ENV: 'test',
    },
  },
});

test('Must have required roles to access pages', async ({ page }) => {
  await page.goto('/prod/signin');

  // Sign in without admin role
  await tryCredentialsSignIn(page, 'test', 'test');

  const desktopNavigation = page.getByRole('navigation', { name: 'Desktop' });

  await expect(desktopNavigation.getByText('Admin Page')).toBeHidden();

  // Sign in with admin role
  await page.getByRole('button', { name: 'Current User' }).click();
  await page.getByText('Sign out').click();
  await tryCredentialsSignIn(page, 'admin', 'admin');

  await expect(desktopNavigation.getByText('Admin Page')).toBeVisible();
  await expect(page.getByText('message: hello world')).toBeVisible();
});
