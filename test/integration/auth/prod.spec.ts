import * as path from 'path';
import * as url from 'url';
import { encode } from '@auth/core/jwt';
import { test, expect, BrowserContext } from '../../playwright/localTest';

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

const authenticateUser = async (
  context: BrowserContext,
  baseURL: string | undefined,
): Promise<void> => {
  const token = await encode({
    token: {
      name: 'Adelbert Steiner',
      email: 'steiner@plutoknights.com',
      picture: 'https://placehold.co/600x400',
    },
    secret: TOOLPAD_AUTH_SECRET,
    salt: 'authjs.session-token',
  });
  await context.addCookies([{ name: 'authjs.session-token', value: token, url: baseURL }]);
};

test('Must be authenticated to view pages', async ({ page, context, baseURL }) => {
  // Is redirected when unauthenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL('/prod/signin');

  // Authenticate mock user
  await authenticateUser(context, baseURL);

  // Sees page content when authenticated
  await page.goto('/prod/pages/mypage');
  await expect(page).toHaveURL('/prod/pages/mypage');

  const profileButtonLocator = page.getByText('Adelbert Steiner');
  await expect(profileButtonLocator).toBeVisible();
});
