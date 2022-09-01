import { test, expect, Page, Locator } from '@playwright/test';
import createApp from '../../utils/createApp';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';
import { canvasFrame, selectedNodeEditor, pageRoot } from '../../utils/locators';
import domInput from './domInput.json';

async function getPropControlInputLocator(page: Page, inputPropName: string) {
  const selectedNodeEditorLocator = page.locator(selectedNodeEditor);

  const propControlLabelHandle = await selectedNodeEditorLocator
    .locator(`label:has-text("${inputPropName}")`)
    .elementHandle();
  const propControlLabelFor = await propControlLabelHandle?.getAttribute('for');

  return selectedNodeEditorLocator.locator(`input[id="${propControlLabelFor}"]`);
}

async function getInputElementLabelLocator(page: Page, inputLocator: Locator) {
  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const inputHandle = await inputLocator.elementHandle();
  const inputId = await inputHandle?.getAttribute('id');

  return canvasFrameLocator.locator(`label[for="${inputId}"]`);
}

test('can control component prop values in properties control panel', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(domInput));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const selectedNodeEditorLocator = page.locator(selectedNodeEditor);
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageRootLocator.waitFor();

  // Verify that initial prop control values are correct

  const firstInputLocator = canvasInputLocator.first();
  await clickCenter(page, firstInputLocator);

  const getLabelControlInputValue = async () =>
    selectedNodeEditorLocator.locator(`label:text-is("label")`).inputValue();
  const getValueControlInputValue = async () =>
    selectedNodeEditorLocator.locator(`label:text-is("value")`).inputValue();

  expect(await getLabelControlInputValue()).toBe('textField1');

  // Change component prop values directly

  const TEST_VALUE_1 = 'value1';

  expect(await getValueControlInputValue()).not.toBe(TEST_VALUE_1);
  await firstInputLocator.fill(TEST_VALUE_1);
  expect(await getValueControlInputValue()).toBe(TEST_VALUE_1);

  // Change component prop values through controls

  const firstInputLabelLocator = await getInputElementLabelLocator(page, firstInputLocator);
  const TEST_VALUE_2 = 'value2';

  await expect(firstInputLabelLocator).not.toHaveText(TEST_VALUE_2);

  const labelControlInputLocator = await getPropControlInputLocator(page, 'label');
  await labelControlInputLocator.fill('');
  await labelControlInputLocator.fill(TEST_VALUE_2);

  await expect(firstInputLabelLocator).toHaveText(TEST_VALUE_2);
});
