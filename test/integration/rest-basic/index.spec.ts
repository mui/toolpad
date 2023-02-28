import * as path from 'path';
import { test, expect } from '../../playwright/test';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { readJsonFile } from '../../utils/fs';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import generateId from '../../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

// We can run our own httpbin instance if necessary:
//    $ docker run -p 80:80 kennethreitz/httpbin
const customHttbinBaseUrl = process.env.HTTPBIN_BASEURL;

if (customHttbinBaseUrl) {
  // eslint-disable-next-line no-console
  console.log(`Running tests with custom httpbin service: ${customHttbinBaseUrl}`);
}

const HTTPBIN_SOURCE_URL = 'https://httpbin.org/';
const HTTPBIN_TARGET_URL = customHttbinBaseUrl || HTTPBIN_SOURCE_URL;

test('rest basics', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './restDom.json'), (key, value) => {
    if (typeof value === 'string') {
      return value.replaceAll(HTTPBIN_SOURCE_URL, HTTPBIN_TARGET_URL);
    }
    return value;
  });

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');
  await expect(page.locator('text="query1: query1_value"')).toBeVisible();
  await expect(page.locator('text="query2: undefined"')).toBeVisible();
  await page.locator('button:has-text("fetch query2")').click();
  await expect(page.locator('text="query2: query2_value"')).toBeVisible();
  await expect(page.locator('text="browserQuery: browserQuery_value"')).toBeVisible();
  await expect(page.locator('text="browserQuery: browserQuery_value"')).toBeVisible();

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.componentEditor.getByRole('button', { name: 'browserQuery' }).click();
  const queryEditor = page.getByRole('dialog', { name: 'browserQuery' });
  await queryEditor.getByRole('button', { name: 'Preview' }).click();
  const networkTab = queryEditor.getByRole('tabpanel', { name: 'Network' });
  await expect(networkTab.getByText('/get?browserQuery_param1=browserQuery_value')).not.toBeEmpty();
});
