import * as path from 'path';
import { test, expect, Locator } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('can move elements in page', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasMoveElementHandleLocator = editorModel.appCanvas.getByTestId('node-hud-tag');

  const firstTextFieldLocator = canvasInputLocator.first();
  const secondTextFieldLocator = canvasInputLocator.nth(1);

  await firstTextFieldLocator.focus();
  await firstTextFieldLocator.fill('textField1');

  await secondTextFieldLocator.focus();
  await secondTextFieldLocator.fill('textField2');

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField1');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField2');

  await expect(canvasMoveElementHandleLocator).not.toBeVisible();

  // Move first element by dragging it to the right side of second element

  await clickCenter(page, firstTextFieldLocator);

  const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();
  expect(secondTextFieldBoundingBox).toBeDefined();

  const moveTargetX = secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width;
  const moveTargetY = secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2;

  await editorModel.dragTo(
    editorModel.appCanvas.getByTestId('node-hud-tag'),
    moveTargetX,
    moveTargetY,
  );

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField2');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField1');
});

test('can delete elements from page', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasButtonLocator = editorModel.appCanvas.getByRole('button');

  await expect(canvasInputLocator).toHaveCount(2);

  const canvasRemoveElementButtonLocator = editorModel.appCanvas.getByRole('button', {
    name: 'Remove',
  });

  // Delete element by clicking

  await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

  const removeElementByClick = async (locator: Locator) => {
    await clickCenter(page, locator);
    await canvasRemoveElementButtonLocator.click();
  };

  const firstTextFieldLocator = canvasInputLocator.first();

  await removeElementByClick(firstTextFieldLocator);

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  await clickCenter(page, firstTextFieldLocator);
  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);

  // Delete last elements in nested rows or columns

  await expect(canvasButtonLocator).toHaveCount(5);

  const lastButtonInRowLocator = editorModel.appCanvas.getByRole('button', { name: 'last in row' });

  await removeElementByClick(lastButtonInRowLocator);

  await expect(canvasButtonLocator).toHaveCount(4);

  const lastButtonInColumnLocator = editorModel.appCanvas.getByRole('button', {
    name: 'last in column',
  });

  await removeElementByClick(lastButtonInColumnLocator);

  await expect(canvasButtonLocator).toHaveCount(3);
});

test('must correctly size new layout columns', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPageById('cSmMlic');

  await editorModel.waitForOverlay();

  const getNthFullWidthBoundingBox = (
    n: number,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> =>
    editorModel.appCanvas.getByText('fullwidth').nth(n).boundingBox();

  const firstFullWidthBoundingBox1 = await getNthFullWidthBoundingBox(0);

  // Drag new element to same row as existing element

  await editorModel.dragNewComponentTo(
    'FullWidth',
    firstFullWidthBoundingBox1!.x + (3 / 4) * firstFullWidthBoundingBox1!.width,
    firstFullWidthBoundingBox1!.y + firstFullWidthBoundingBox1!.height / 2,
  );

  const firstFullWidthBoundingBox2 = await getNthFullWidthBoundingBox(0);
  const secondFullWidthBoundingBox2 = await getNthFullWidthBoundingBox(1);

  expect(firstFullWidthBoundingBox2!.width).toBe(secondFullWidthBoundingBox2!.width);

  // Drag new element to same row as existing same-width elements

  await editorModel.dragNewComponentTo(
    'FullWidth',
    secondFullWidthBoundingBox2!.x + (3 / 4) * secondFullWidthBoundingBox2!.width,
    secondFullWidthBoundingBox2!.y + secondFullWidthBoundingBox2!.height / 2,
  );

  const firstFullWidthBoundingBox3 = await getNthFullWidthBoundingBox(0);
  const secondFullWidthBoundingBox3 = await getNthFullWidthBoundingBox(1);
  const thirdFullWidthBoundingBox3 = await getNthFullWidthBoundingBox(2);

  expect(firstFullWidthBoundingBox3!.width).toBe(secondFullWidthBoundingBox3!.width);
  expect(secondFullWidthBoundingBox3!.width).toBe(thirdFullWidthBoundingBox3!.width);

  // Drag new element to same row as existing different-width elements

  const fifthFullWidthBoundingBox = await getNthFullWidthBoundingBox(4);

  await editorModel.dragNewComponentTo(
    'FullWidth',
    fifthFullWidthBoundingBox!.x + (3 / 4) * fifthFullWidthBoundingBox!.width,
    fifthFullWidthBoundingBox!.y + fifthFullWidthBoundingBox!.height / 2,
  );

  const sixthFullWidthBoundingBox = await getNthFullWidthBoundingBox(5);

  expect(sixthFullWidthBoundingBox!.width).toBe(thirdFullWidthBoundingBox3!.width);
});

test('code editor auto-complete', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPageById('K7SkzhT');

  await editorModel.waitForOverlay();

  const text = editorModel.appCanvas.getByText('text-foo');

  await clickCenter(page, text);

  const bindingButton = editorModel.componentEditor.getByLabel('Bind property "Value"');

  await bindingButton.click();

  const editor = page
    .getByRole('dialog', { name: 'Bind property "Value"' })
    .locator('.monaco-editor');

  await editor.waitFor();

  await page.keyboard.type('textF');
  await expect(page.getByRole('option', { name: 'textField' })).toBeVisible();
});

test('must deselect selected element when clicking outside of it', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPageById('K7SkzhT');

  await editorModel.waitForOverlay();
  const nodeHudTag = editorModel.appCanvas.getByTestId('node-hud-tag');
  const input = editorModel.appCanvas.locator('input:nth-child(1)');
  const boundingBox = await input.boundingBox();
  await clickCenter(page, input);
  await expect(nodeHudTag).toBeVisible();
  await page.mouse.click(boundingBox!.x + 50, boundingBox!.y + 50);
  await expect(nodeHudTag).toBeHidden();
});
