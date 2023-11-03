import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { getTestProjectDir, runEditor, test } from '../../playwright/localTest';
import { expectBasicPageContent } from '../backend-basic/shared';
import { using } from '../../utils/resources';
import { ToolpadEditor } from '../../models/ToolpadEditor';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, '../backend-basic/fixture'),
  },
  customServerConfig: {
    dev: true,
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

test('custom server development mode', async ({ context, customServer, page }) => {
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

test('editor', async ({ customServer, page }) => {
  invariant(
    customServer,
    'test must be configured with `customServerConfig`. Add `test.use({ customServerConfig: ... })`',
  );

  await using(await getTestProjectDir(), async (projectDir) => {
    await using(
      await runEditor({
        cwd: projectDir.path,
        appUrl: customServer.url,
      }),
      async (editor) => {
        await page.goto(`${editor.url}/_toolpad`);
        const editorModel = new ToolpadEditor(page);
        await editorModel.waitForOverlay();
      },
    );
  });
});
