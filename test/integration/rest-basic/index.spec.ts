import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { fileReplaceAll } from '../../utils/fs';
import { ToolpadEditor } from '../../models/ToolpadEditor';

// We can run our own httpbin instance if necessary:
//    $ docker run -p 80:80 kennethreitz/httpbin
const customHttbinBaseUrl = process.env.HTTPBIN_BASEURL;

if (customHttbinBaseUrl) {
  // eslint-disable-next-line no-console
  console.log(`Running tests with custom httpbin service: ${customHttbinBaseUrl}`);
}

const HTTPBIN_SOURCE_URL = 'https://httpbin.org/';
const HTTPBIN_TARGET_URL = customHttbinBaseUrl || HTTPBIN_SOURCE_URL;

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    async setup({ dir }) {
      const configFilePath = path.resolve(dir, './toolpad/pages/page1/page.yml');
      await fileReplaceAll(configFilePath, HTTPBIN_SOURCE_URL, HTTPBIN_TARGET_URL);
    },
    cmd: 'dev',
  },
});

test('rest basics', async ({ page, context }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('page1');
  await expect(page.locator('text="query1: query1_value"')).toBeVisible();
  await expect(page.locator('text="query2: undefined"')).toBeVisible();
  await page.locator('button:has-text("fetch query2")').click();
  await expect(page.locator('text="query2: query2_value"')).toBeVisible();

  await expect(page.getByText('query3: Transformed')).toBeVisible();

  await expect(page.getByText('query4 authorization: test')).toBeVisible();

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.componentEditor.getByRole('button', { name: 'Add query' }).click();
  await page.getByRole('button', { name: 'HTTP request' }).click();

  const newQueryEditor = page.getByRole('dialog', { name: 'query' });

  await expect(newQueryEditor).toBeVisible();

  // Make sure switching tabs does not close query editor
  const newTab = await context.newPage();
  await newTab.bringToFront();
  await page.bringToFront();
  await expect(newQueryEditor).toBeVisible();

  await newQueryEditor.getByRole('button', { name: 'Save' }).click();
  await expect(newQueryEditor).not.toBeVisible();

  await editorModel.componentEditor.getByRole('button', { name: 'query1' }).click();

  const existingQueryEditor = page.getByRole('dialog', { name: 'query1' });

  await expect(existingQueryEditor).toBeVisible();

  await existingQueryEditor.getByRole('button', { name: 'Preview' }).click();
  const networkTab = existingQueryEditor.getByRole('tabpanel', { name: 'Network' });
  await expect(networkTab.getByText('/get?query1_param1=query1_value')).not.toBeEmpty();

  await existingQueryEditor.getByRole('button', { name: 'Cancel' }).click();
  await expect(existingQueryEditor).not.toBeVisible();
});
