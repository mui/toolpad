import * as path from 'path';
import * as fs from 'fs/promises';
import * as url from 'url';
import invariant from 'invariant';
import { fileReplaceAll } from '@mui/toolpad-utils/fs';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { startTestServer } from './testServer';
import { withTemporaryEdits } from '../../utils/fs';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

let testServer: Awaited<ReturnType<typeof startTestServer>> | undefined;

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
    async setup(ctx) {
      testServer = await startTestServer();
      const targetUrl = `http://localhost:${testServer.port}/`;
      const pageFilePath = path.resolve(ctx.dir, './toolpad/pages/page1/page.yml');
      await fileReplaceAll(pageFilePath, `http://localhost:8080/`, targetUrl);
    },
  },
  localAppConfig: {
    cmd: 'dev',
    env: {
      TEST_VAR: 'foo',
    },
  },
});

test.afterAll(async () => {
  testServer?.close();
});

test('rest runtime basics', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('page1');
  await expect(page.locator('text="query1: query1_value"')).toBeVisible();
  await expect(page.locator('text="query2: undefined"')).toBeVisible();
  await page.locator('button:has-text("fetch query2")').click();
  await expect(page.locator('text="query2: query2_value"')).toBeVisible();

  await expect(page.getByText('query3: Transformed')).toBeVisible();

  await expect(page.getByText('query4 authorization: foo')).toBeVisible();

  const envFilePath = path.resolve(localApp.dir, './.env');
  await withTemporaryEdits(envFilePath, async () => {
    await expect(page.getByText('query4 authorization: foo')).toBeVisible();
    await fs.writeFile(envFilePath, 'TEST_VAR=bar');
    await page.reload();
    await expect(page.getByText('query4 authorization: bar')).toBeVisible();
  });
});

test('rest editor basics', async ({ page, context, localApp, argosScreenshot }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();
  await editorModel.waitForOverlay();

  await editorModel.pageEditor.getByRole('button', { name: 'Add query' }).click();
  await page.getByRole('button', { name: 'HTTP request' }).click();

  const newQueryEditor = page.getByRole('dialog', { name: 'query' });

  await expect(newQueryEditor).toBeVisible();

  const urlInput = newQueryEditor.getByLabel('url', { exact: true });
  await urlInput.click();
  await urlInput.fill('http://foo.bar');

  await argosScreenshot('rest-editor', {
    clip: (await newQueryEditor.boundingBox()) || undefined,
  });

  const envFilePath = path.resolve(localApp.dir, './.env');
  await withTemporaryEdits(envFilePath, async () => {
    await expect(editorModel.appCanvas.getByText('query4 authorization: foo')).toBeVisible();
    await fs.writeFile(envFilePath, 'TEST_VAR=bar');
    await expect(editorModel.appCanvas.getByText('query4 authorization: bar')).toBeVisible();
  });

  // Make sure switching tabs does not close query editor
  const newTab = await context.newPage();
  await newTab.bringToFront();
  await page.bringToFront();
  await newTab.close();
  await expect(newQueryEditor).toBeVisible();

  await newQueryEditor.getByRole('button', { name: 'Save' }).click();
  await expect(newQueryEditor).not.toBeVisible();

  await editorModel.pageEditor.getByRole('button', { name: 'query1' }).click();

  const existingQueryEditor = page.getByRole('dialog', { name: 'query1' });

  await expect(existingQueryEditor).toBeVisible();

  await existingQueryEditor.getByRole('button', { name: 'Preview' }).click();
  const networkTab = existingQueryEditor.getByRole('tabpanel', { name: 'Network' });
  await expect(networkTab.getByText('/get?query1_param1=query1_value')).not.toBeEmpty();

  await newQueryEditor.getByRole('tab', { name: 'Headers' }).click();

  await existingQueryEditor.getByRole('button', { name: 'Cancel' }).click();
  await expect(existingQueryEditor).not.toBeVisible();

  await editorModel.pageEditor.getByRole('button', { name: 'queryWithEnv' }).click();

  const queryWithEnvQueryEditor = page.getByRole('dialog', { name: 'queryWithEnv' });
  await queryWithEnvQueryEditor.getByRole('tab', { name: 'Headers' }).click();
});
