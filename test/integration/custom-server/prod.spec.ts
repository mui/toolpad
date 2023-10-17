import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { test } from '../../playwright/localTest';
import { expectBasicPageContent } from '../backend-basic/shared';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, '../backend-basic/fixture'),
  },
  customServerConfig: {
    dev: false,
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

test('custom server production mode', async ({ context, customServer, page }) => {
  invariant(
    customServer,
    'test must be configured with `customServerConfig`. Add `test.use({ customServerConfig: ... })`',
  );

  await context.addCookies([
    { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
  ]);

  await page.goto(customServer.url);

  await expectBasicPageContent(page);
});
