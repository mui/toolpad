import * as path from 'path';
import * as url from 'url';
import { encode } from '@auth/core/jwt';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const TOOLPAD_AUTH_SECRET = 'donttellanyone';

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
      TOOLPAD_AUTH_SECRET,
    },
  },
});

test('Must be authenticated to view pages', async ({ page, context, baseURL }) => {
  // @TODO: Try mocking https://api.github.com/user and https://api.github.com/user/emails instead
  await page.route('*/**/api/auth/signin/github', async (route) => {
    const token = await encode({
      token: {
        name: 'Adelbert Steiner',
        email: 'steiner@plutoknights.com',
        picture: 'https://placehold.co/600x400',
      },
      secret: TOOLPAD_AUTH_SECRET,
      salt: 'authjs.session-token',
    });

    context.addCookies([{ name: 'authjs.session-token', value: token, url: baseURL }]);

    const json = { url: '/prod/pages/mypage' };
    await route.fulfill({ json });
  });

  await page.goto('/prod/pages/mypage');

  // Is redirected when unauthenticated
  await expect(page).toHaveURL('/prod/signin');

  const githubLoginButton = page.getByText('Sign in with GitHub');

  await githubLoginButton.click();

  // Goes to correct redirect URL, and is not redirected when authenticated
  await expect(page).toHaveURL('/prod/pages/mypage');

  const profileButtonLocator = page.getByText('Adelbert Steiner');

  await expect(profileButtonLocator).toBeVisible();

  // Sign out

  await profileButtonLocator.click();
  await page.getByText('Sign out').click();

  await expect(page).toHaveURL(/\/prod\/signin/);
});
