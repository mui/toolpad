import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';

test.use({
  localAppConfig: {
    cmd: 'dev',
  },
});

test('do not find content if you delete page of middle ', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  const pageMenuItem = editorModel.getExplorerItem('page');

  await pageMenuItem.hover();
  await pageMenuItem.getByRole('button', { name: 'Open page explorer menu' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Confirm' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await expect(pageMenuItem).toBeHidden();
  await expect(page.getByText('No pages in this app.')).toBeVisible();

  if (process.env.EXPERIMENTAL_INLINE_CANVAS) {
    await expect(page).toHaveURL('/prod/editor/app/pages');
  } else {
    await expect(page).toHaveURL('/_toolpad/app/pages');
  }
});
