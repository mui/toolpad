import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { fileReplace } from '@toolpad/utils/fs';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { waitForMatch } from '../../utils/streams';
import { expectBasicRuntimeTests } from './shared';
import { setPageHidden } from '../../utils/page';
import { withTemporaryEdits } from '../../utils/fs';
import { clickCenter, cellLocator } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

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
  await runtimeModel.goToPage('basic');

  await expectBasicRuntimeTests(page);
});

test('function editor reload', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('basic');

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
  await editorModel.goToPage('basic');

  await editorModel.queriesExplorer.getByText('withParams').click();

  const queryEditorTab = page.getByRole('tabpanel', { name: 'withParams' });
  await expect(queryEditorTab).toBeVisible();
  await expect(queryEditorTab.getByLabel('foo', { exact: true })).toBeVisible();
  await expect(queryEditorTab.getByLabel('bar', { exact: true })).not.toBeVisible();

  await argosScreenshot('function-editor', {
    clip: (await queryEditorTab.boundingBox()) || undefined,
  });

  await setPageHidden(page, true); // simulate page hidden

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await Promise.all([
    fileReplace(functionsFilePath, '// __NEW_PARAMETER__', "bar: { type: 'string' },"),
    waitForMatch(localApp.stdout, /built functions\.ts/),
  ]);

  await setPageHidden(page, false); // simulate page restored

  await expect(queryEditorTab.getByLabel('bar', { exact: true })).toBeVisible();
});

test('bound parameters are preserved on manual call', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('basic');

  await page.getByRole('button', { name: 'Run Manual Query' }).click();

  await expect(page.getByText('destination: checksum', { exact: true })).toBeVisible();
});

test('global variables are retained in function runtime', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('basic');

  await expect(page.getByText('global value: 1', { exact: true })).toBeVisible();
  await expect(page.getByText('global value: 2', { exact: true })).not.toBeVisible();

  await page.getByRole('button', { name: 'increment' }).click();

  await expect(page.getByText('global value: 2', { exact: true })).toBeVisible();
});

test('Query serialization', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('serialization');

  await expect(page.getByText('Circular property: hello', { exact: true })).toBeVisible();
  await expect(page.getByText('Non-circular: hello:hello', { exact: true })).toBeVisible();
  await expect(page.getByText('Invalid error: undefined', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Some Date object: 2023-11-27T14:35:35.511Z', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Some RegExp: "foo" i', { exact: true })).toBeVisible();
});

test('Circular scope value, binding editor', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('serialization');

  await editorModel.waitForOverlay();
  await clickCenter(
    page,
    editorModel.appCanvas.getByText('Circular property: hello', { exact: true }),
  );
  await editorModel.componentEditor.waitFor();
  await page.getByLabel('Bind property "Value"').click();
  await expect(page.getByRole('dialog', { name: 'Bind property "Value' })).toBeVisible();
});

test('Extracted types', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('extractedTypes');

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
  await editorModel.goToPage('extractedTypes');

  await editorModel.queriesExplorer.getByText('bareWithParams').click();

  await editorModel.queryEditorPanel.getByRole('button', { name: 'Run' }).click();
  await editorModel.queryEditorPanel
    .getByTestId('query-preview')
    .getByText(
      'bare function with parameters: foo: bar; typeof bar: number; quux: true; baz.hello: 5',
    );

  await expect(editorModel.queryEditorPanel).toBeVisible();
  await expect(
    editorModel.queryEditorPanel.getByRole('checkbox', { name: 'quux', exact: true }),
  ).toBeVisible();
  await expect(
    editorModel.queryEditorPanel.getByRole('textbox', { name: 'foo', exact: true }),
  ).toBeVisible();
  await expect(
    editorModel.queryEditorPanel.getByRole('button', { name: 'baz', exact: true }),
  ).toBeVisible();
  await expect(
    editorModel.queryEditorPanel.getByRole('spinbutton', { name: 'bar', exact: true }),
  ).toBeVisible();

  const fizzCombobox = editorModel.queryEditorPanel.getByRole('combobox', {
    name: 'fizz',
    exact: true,
  });
  await expect(fizzCombobox).toBeVisible();

  await fizzCombobox.click();
  await expect(page.getByRole('option', { name: 'hello', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'world', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(
    editorModel.queryEditorPanel.getByRole('textbox', { name: 'buzz', exact: true }),
  ).not.toBeVisible();

  await setPageHidden(page, true); // simulate page hidden

  const functionsFilePath = path.resolve(localApp.dir, './toolpad/resources/functions.ts');
  await Promise.all([
    fileReplace(functionsFilePath, '/** BARE_DUMMY_PARAM */', 'buzz: string,'),
    waitForMatch(localApp.stdout, /built functions\.ts/),
  ]);

  await setPageHidden(page, false); // simulate page restored

  await expect(
    editorModel.queryEditorPanel.getByRole('textbox', { name: 'buzz', exact: true }),
  ).toBeVisible();
});

test('data providers', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('dataProviders');

  await editorModel.waitForOverlay();

  const grid1 = editorModel.appCanvas.getByRole('grid').nth(0);
  const grid2 = editorModel.appCanvas.getByRole('grid').nth(1);

  await expect(grid1.getByText('Index item 0')).toBeVisible();
  await expect(grid2.getByText('Cursor item 0')).toBeVisible();

  await clickCenter(page, grid1);

  await editorModel.appCanvas.getByRole('button', { name: 'Go to next page' }).nth(0).click();
  await expect(grid1.getByText('Index item 100')).toBeVisible();

  await clickCenter(page, grid2);

  await editorModel.appCanvas.getByRole('button', { name: 'Go to next page' }).nth(1).click();
  await expect(grid2.getByText('Cursor item 100')).toBeVisible();
  await expect(grid2.getByText('Cursor item 0')).not.toBeVisible();

  await editorModel.appCanvas.getByRole('combobox', { name: 'Rows per page:' }).nth(1).click();
  await editorModel.appCanvas.getByRole('option', { name: '25', exact: true }).click();

  await expect(grid2.getByText('Cursor item 0')).toBeVisible();
});

test('data providers crud', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('crud');

  await editorModel.waitForOverlay();

  const grid = editorModel.appCanvas.getByRole('grid');

  await expect(grid.getByText('Index item 5')).toBeVisible();

  await clickCenter(page, grid);

  await editorModel.appCanvas
    .getByRole('button', { name: 'Delete row with id "5"', exact: true })
    .click();

  await expect(
    editorModel.appCanvas.getByText('Record deleted successfully', { exact: true }),
  ).toBeVisible();

  await expect(grid.getByText('Index item 5')).not.toBeVisible();

  await editorModel.appCanvas
    .getByRole('button', { name: 'Edit row with id "7"', exact: true })
    .click();

  await cellLocator(grid, 8, 1).getByRole('textbox').fill('edited');

  await editorModel.appCanvas.getByRole('button', { name: 'Cancel updates', exact: true }).click();

  await expect(cellLocator(grid, 8, 1)).toHaveText('Index item 7');

  await editorModel.appCanvas
    .getByRole('button', { name: 'Edit row with id "7"', exact: true })
    .click();

  await cellLocator(grid, 8, 1).getByRole('textbox').fill('edited');

  await editorModel.appCanvas
    .getByRole('button', { name: 'Save updates to row with id "7"', exact: true })
    .click();

  await expect(
    editorModel.appCanvas.getByText('Record updated successfully', { exact: true }),
  ).toBeVisible();

  await expect(cellLocator(grid, 8, 1)).toHaveText('edited');

  await expect(
    editorModel.appCanvas.getByRole('button', { name: 'Cancel updates', exact: true }),
  ).not.toBeVisible();
  await expect(
    editorModel.appCanvas.getByRole('button', {
      name: 'Save updates to row with id "7"',
      exact: true,
    }),
  ).not.toBeVisible();

  await editorModel.appCanvas.getByRole('button', { name: 'Add record', exact: true }).click();

  await cellLocator(grid, 2, 1).getByRole('textbox').fill('created');

  await editorModel.appCanvas
    .getByRole('button', { name: 'Save updates to new row', exact: true })
    .click();

  await expect(
    editorModel.appCanvas.getByText('New record created successfully', { exact: true }),
  ).toBeVisible();

  await editorModel.appCanvas.getByRole('button', { name: 'Add record', exact: true }).click();

  await page.keyboard.press('Escape');

  await expect(cellLocator(grid, 2, 1)).toHaveText('Index item 0');
});
