import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import { folderExists } from '@mui/toolpad-utils/fs';
import { getTemporaryDir, runEditor, test, expect } from '../../playwright/localTest';
import { expectBasicRuntimeTests, expectBasicRuntimeContentTests } from '../backend-basic/shared';
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

  await expectBasicRuntimeTests(page);
});

test('standalone editor', async ({ context, customServer, page }) => {
  invariant(
    customServer,
    'test must be configured with `customServerConfig`. Add `test.use({ customServerConfig: ... })`',
  );

  if (process.env.EXPERIMENTAL_INLINE_CANVAS) {
    await context.addCookies([
      { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
    ]);

    await page.goto(`${customServer.url}/editor`);
    const editorModel = new ToolpadEditor(page);
    await editorModel.waitForOverlay();

    await expectBasicRuntimeContentTests(editorModel.appCanvas);

    const pageFolder = path.resolve(customServer.dir, './toolpad/pages/helloWorld');
    await expect(await folderExists(pageFolder)).toBe(false);
    await editorModel.createPage('helloWorld');

    await expect.poll(async () => folderExists(pageFolder)).toBe(true);
  } else {
    await using(await getTemporaryDir(), async (editorDir) => {
      await context.addCookies([
        { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
      ]);

      await using(
        await runEditor({
          cwd: editorDir.path,
          appUrl: customServer.url,
        }),
        async (editor) => {
          await page.goto(`${editor.url}/_toolpad`);
          const editorModel = new ToolpadEditor(page);
          await editorModel.waitForOverlay();

          await expectBasicRuntimeContentTests(editorModel.appCanvas);

          const pageFolder = path.resolve(customServer.dir, './toolpad/pages/helloWorld');
          await expect(await folderExists(pageFolder)).toBe(false);
          await editorModel.createPage('helloWorld');

          await expect.poll(async () => folderExists(pageFolder)).toBe(true);

          await expect(await fs.readdir(editorDir.path)).toEqual([]);
        },
      );
    });
  }
});
