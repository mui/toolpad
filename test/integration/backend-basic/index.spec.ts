import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { fileReplace } from '@mui/toolpad-utils/fs';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { waitForMatch } from '../../utils/streams';
import { expectBasicRuntimeTests } from './shared';
import { setPageHidden } from '../../utils/page';
import { withTemporaryEdits } from '../../utils/fs';
import clickCenter from '../../utils/clickCenter';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const BASIC_TESTS_PAGE_ID = '5q1xd0t';
const EXTRACTED_TYPES_PAGE_ID = 'dt1T4rY';
const DATA_PROVIDERS_PAGE_ID = 'VnOzPpU';

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
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

test('functions basics', async ({ page, context }) => {
  await context.addCookies([
    { name: 'MY_TOOLPAD_COOKIE', value: 'foo-bar-baz', domain: 'localhost', path: '/' },
  ]);

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('basic');

  await expectBasicRuntimeTests(page);
});

test('function editor reload', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(BASIC_TESTS_PAGE_ID);

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await withTemporaryEdits(functionsFilePath, async () => {
    await expect(editorModel.appCanvas.getByText('edited hello')).toBeVisible();
    await fileReplace(functionsFilePath, "'edited hello'", "'edited goodbye!!!'");
    await expect(editorModel.appCanvas.getByText('edited goodbye!!!')).toBeVisible();
  });

  const envFilePath = path.resolve(localApp.dir, './.env');
  await withTemporaryEdits(envFilePath, async () => {
    await expect(editorModel.appCanvas.getByText('echo, secret: Some bar secret')).toBeVisible();
    await fileReplace(envFilePath, 'SECRET_BAR="Some bar secret"', 'SECRET_BAR="Some quux secret"');
    await expect(editorModel.appCanvas.getByText('echo, secret: Some quux secret')).toBeVisible();
  });
});

test('function editor parameters update', async ({ page, localApp, argosScreenshot }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(BASIC_TESTS_PAGE_ID);

  await editorModel.pageEditor.getByRole('button', { name: 'withParams' }).click();

  const queryEditor = page.getByRole('dialog', { name: 'withParams' });
  await expect(queryEditor).toBeVisible();
  await expect(queryEditor.getByLabel('foo', { exact: true })).toBeVisible();
  await expect(queryEditor.getByLabel('bar', { exact: true })).not.toBeVisible();

  await argosScreenshot('function-editor', {
    clip: (await queryEditor.boundingBox()) || undefined,
  });

  await setPageHidden(page, true); // simulate page hidden

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await Promise.all([
    fileReplace(functionsFilePath, '// __NEW_PARAMETER__', "bar: { type: 'string' },"),
    waitForMatch(localApp.stdout, /built functions\.ts/),
  ]);

  await setPageHidden(page, false); // simulate page restored

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

  await expect(page.getByText('Circular property: hello', { exact: true })).toBeVisible();
  await expect(page.getByText('Non-circular: hello:hello', { exact: true })).toBeVisible();
  await expect(page.getByText('Invalid error: undefined', { exact: true })).toBeVisible();
});

test('Extracted types', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('extractedTypes');

  await expect(
    page.getByText(
      'bare function with parameters: foo: bar; typeof bar: number; quux: true; baz.hello: 5',
      {
        exact: true,
      },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("synchronous function: hello I'm synchronous", { exact: true }),
  ).toBeVisible();
});

test('function editor extracted parameters', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(EXTRACTED_TYPES_PAGE_ID);

  await editorModel.pageEditor.getByRole('button', { name: 'bareWithParams' }).click();
  const queryEditor = page.getByRole('dialog', { name: 'bareWithParams' });

  await queryEditor.getByRole('button', { name: 'Preview', exact: true }).click();
  await queryEditor
    .getByTestId('query-preview')
    .getByText(
      'bare function with parameters: foo: bar; typeof bar: number; quux: true; baz.hello: 5',
    );

  await expect(queryEditor).toBeVisible();
  await expect(queryEditor.getByRole('checkbox', { name: 'quux', exact: true })).toBeVisible();
  await expect(queryEditor.getByRole('textbox', { name: 'foo', exact: true })).toBeVisible();
  await expect(queryEditor.getByRole('textbox', { name: 'foo', exact: true })).toBeVisible();
  await expect(queryEditor.getByRole('button', { name: 'baz', exact: true })).toBeVisible();
  await expect(queryEditor.getByRole('spinbutton', { name: 'bar', exact: true })).toBeVisible();

  const fizzCombobox = queryEditor.getByRole('combobox', { name: 'fizz', exact: true });
  await expect(fizzCombobox).toBeVisible();

  await fizzCombobox.click();
  await expect(page.getByRole('option', { name: 'hello', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'world', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(queryEditor.getByRole('textbox', { name: 'buzz', exact: true })).not.toBeVisible();

  await setPageHidden(page, true); // simulate page hidden

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await Promise.all([
    fileReplace(functionsFilePath, '/** BARE_DUMMY_PARAM */', 'buzz: string,'),
    waitForMatch(localApp.stdout, /built functions\.ts/),
  ]);

  await setPageHidden(page, false); // simulate page restored

  await expect(queryEditor.getByRole('textbox', { name: 'buzz', exact: true })).toBeVisible();
});

test('data providers', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById(DATA_PROVIDERS_PAGE_ID);

  await editorModel.waitForOverlay();

  const grid1 = editorModel.appCanvas.getByRole('grid').nth(0);
  const grid2 = editorModel.appCanvas.getByRole('grid').nth(1);

  await expect(grid1.getByText('Index item 0')).toBeVisible();
  await expect(grid2.getByText('Cursor item 0')).toBeVisible();

  await clickCenter(page, grid1);

  await grid1.getByRole('button', { name: 'Go to next page' }).click();
  await expect(grid1.getByText('Index item 100')).toBeVisible();

  await clickCenter(page, grid2);

  await grid2.getByRole('button', { name: 'Go to next page' }).click();
  await expect(grid2.getByText('Cursor item 100')).toBeVisible();
  await expect(grid2.getByText('Cursor item 0')).not.toBeVisible();

  await grid2.getByRole('combobox', { name: 'Rows per page:' }).click();
  await editorModel.appCanvas.getByRole('option', { name: '25', exact: true }).click();

  await expect(grid2.getByText('Cursor item 0')).toBeVisible();
});
