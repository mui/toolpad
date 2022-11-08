import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import clickCenter from '../../utils/clickCenter';

// test.only('undo', async ({ page, browserName }) => {
//   if (browserName !== 'chromium') {
//     test.skip(true, 'Skip FF for now');
//   }

//   const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

//   const homeModel = new ToolpadHome(page);
//   await homeModel.goto();
//   const app = await homeModel.createApplication({ dom });

//   const editorModel = new ToolpadEditor(page, browserName);
//   await editorModel.goto(app.id);

//   await editorModel.pageRoot.waitFor();

//   const canvasInputLocator = editorModel.appCanvas.locator('input');
//   const canvasRemoveElementButtonLocator = editorModel.appCanvas.locator(
//     'button[aria-label="Remove element"]',
//   );

//   // Ensure we have input in canvas
//   await expect(canvasInputLocator).toHaveCount(2);

//   await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

//   // Select input so that HUD appears
//   await clickCenter(page, canvasInputLocator.first());
//   // Delete one input
//   await canvasRemoveElementButtonLocator.click();

//   await expect(canvasInputLocator).toHaveCount(1);

//   await page.pause();
// });

test('can delete elements from page', async ({ page, browserName }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page, browserName);

  const domInput = await readJsonFile(path.resolve(__dirname, '../editor/domInput.json'));

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasRemoveElementButtonLocator = editorModel.appCanvas.locator(
    'button[aria-label="Remove element"]',
  );

  await expect(canvasInputLocator).toHaveCount(2);

  // Delete element by clicking

  await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

  const firstTextFieldLocator = canvasInputLocator.first();

  await clickCenter(page, firstTextFieldLocator);
  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  await clickCenter(page, firstTextFieldLocator);
  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});
