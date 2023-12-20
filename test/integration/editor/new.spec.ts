import path from 'path';
import invariant from 'invariant';
import { fileExists, folderExists } from '@mui/toolpad-utils/fs';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';

test.use({
  localAppConfig: {
    cmd: 'dev',
  },
});

test('can place new components from catalog', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  await expect(canvasInputLocator).toHaveCount(0);

  const TEXT_FIELD_COMPONENT_DISPLAY_NAME = 'Text Field';

  // Drag in a first component

  await editorModel.dragNewComponentToCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();

  await expect(editorModel.componentEditor.getByText('textField')).toBeVisible();

  // Drag in a second component

  await editorModel.dragNewComponentToCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

  await expect(canvasInputLocator).toHaveCount(2);
});

test('can create and place new component', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.createPage('somePage');
  await editorModel.createComponent('someComponent');
  await editorModel.componentCatalog.hover();
  await expect(editorModel.componentCatalog.getByText('someComponent')).toBeVisible();
  await editorModel.dragNewComponentToCanvas('someComponent');
  await expect(editorModel.appCanvas.getByText('Hello world!')).toBeVisible();
});

test('can create/delete page', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.createPage('someOtherPage');

  const pageMenuItem = editorModel.getExplorerItem('someOtherPage');
  const pageFolder = path.resolve(localApp.dir, './toolpad/pages/someOtherPage');
  const pageFile = path.resolve(pageFolder, './page.yml');

  await expect(pageMenuItem).toBeVisible();
  await expect.poll(async () => folderExists(pageFolder)).toBe(true);
  await expect.poll(async () => fileExists(pageFile)).toBe(true);

  await pageMenuItem.hover();

  await pageMenuItem.getByRole('button', { name: 'Open page explorer menu' }).click();

  await page.getByRole('menuitem', { name: 'Delete' }).click();

  await page
    .getByRole('dialog', { name: 'Confirm' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await expect(pageMenuItem).toBeHidden();

  await expect.poll(async () => folderExists(pageFolder)).toBe(false);
});
