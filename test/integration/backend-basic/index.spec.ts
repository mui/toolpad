import * as path from 'path';
import { fileReplace } from '../../../packages/toolpad-utils/src/fs';
import { test, expect, Page } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { waitForMatch } from '../../utils/streams';

const BASIC_TESTS_PAGE_ID = '5q1xd0t';

test.use({
  ignoreConsoleErrors: [
    // Chrome:
    /Cannot read properties of null/,
    // firefox:
    /throws\.error is null/,
    // Intentionally thrown
    /BOOM!/,
  ],
});

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

// Workaround for missing page blur/focus controls in playwright
// See https://github.com/microsoft/playwright/issues/3570#issuecomment-689407637
async function setReactQueryFocused(page: Page, focus: boolean) {
  await page.evaluate((focusValue) => {
    // eslint-disable-next-line no-underscore-dangle
    (window as any).__TOOLPAD_PLAYWRIGHT_TOOLS__.focusManager.setFocused(focusValue);
  }, focus);
}

test('functions basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('basic');

  await expect(page.locator('text="hello, message: hello world"')).toBeVisible();
  await expect(page.locator('text="throws, error.message: BOOM!"')).toBeVisible();
  await expect(page.locator('text="throws, data undefined"')).toBeVisible();
  await expect(page.locator('text="echo, parameter: bound foo parameter"')).toBeVisible();
  await expect(page.locator('text="echo, secret: Some bar secret"')).toBeVisible();
  await expect(page.locator('text="echo, secret not in .env: Some baz secret"')).toBeVisible();
});

test('function editor reload', async ({ page, localApp }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(BASIC_TESTS_PAGE_ID);

  await expect(editorModel.appCanvas.getByText('edited hello')).toBeVisible();

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await fileReplace(functionsFilePath, "'edited hello'", "'edited goodbye!!!'");

  await expect(editorModel.appCanvas.getByText('edited goodbye!!!')).toBeVisible();
});

test('function editor parameters update', async ({ page, localApp }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(BASIC_TESTS_PAGE_ID);

  await editorModel.componentEditor.getByRole('button', { name: 'withParams' }).click();

  const queryEditor = page.getByRole('dialog', { name: 'withParams' });
  await expect(queryEditor).toBeVisible();
  await expect(queryEditor.getByLabel('foo', { exact: true })).toBeVisible();
  await expect(queryEditor.getByLabel('bar', { exact: true })).not.toBeVisible();

  await setReactQueryFocused(page, false); // simulate page hidden

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await Promise.all([
    fileReplace(functionsFilePath, '// __NEW_PARAMETER__', "bar: { type: 'string' },"),
    waitForMatch(localApp.stdout, /built functions\.ts/),
  ]);

  await setReactQueryFocused(page, true); // simulate page restored

  await expect(queryEditor.getByLabel('bar', { exact: true })).toBeVisible();
});

test('bound parameters are preserved on manual call', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('basic');

  await page.getByRole('button', { name: 'Run Manual Query' }).click();

  await expect(page.getByText('destination: checksum', { exact: true })).toBeVisible();
});

test('global variables are retained in function runtime', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('basic');

  await expect(page.getByText('global value: 1', { exact: true })).toBeVisible();
  await expect(page.getByText('global value: 2', { exact: true })).not.toBeVisible();

  await page.getByRole('button', { name: 'increment' }).click();

  await expect(page.getByText('global value: 2', { exact: true })).toBeVisible();
});

test('Query serialization', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('serialization');

  await expect(page.getByText('Circlular property: [Circular]', { exact: true })).toBeVisible();
  await expect(page.getByText('Non-circular: hello:hello', { exact: true })).toBeVisible();
  await expect(page.getByText('Invalid error: undefined', { exact: true })).toBeVisible();
});

test('Extracted types', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('extractedTypes');

  await expect(
    page.getByText('bare function with parameters: foo: bar; typeof bar: number; baz.hello: 5', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("synchronous function: hello I'm synchronous", { exact: true }),
  ).toBeVisible();
});
