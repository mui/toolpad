import { test, expect, Page } from '@playwright/test';
import createApp from '../utils/createApp';
import selectCanvasComponent from '../utils/selectCanvasComponent';
import generateId from '../utils/generateId';
import { canvasFrame, componentPropsEditor, pageRoot } from '../utils/locators';
import twoFieldsDomTemplate from '../domTemplates/twoTextFields.json';

async function getPropControlInputLocator(page: Page, inputPropName: string) {
  const componentPropsEditorLocator = page.locator(componentPropsEditor);

  const propControlLabelHandle = await componentPropsEditorLocator
    .locator(`label:has-text("${inputPropName}")`)
    .elementHandle();
  const propControlLabelFor = await propControlLabelHandle?.getAttribute('for');

  return componentPropsEditorLocator.locator(`input[id="${propControlLabelFor}"]`);
}

test('can control component prop values in properties control panel', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(twoFieldsDomTemplate));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageRootLocator.waitFor();

  // Verify that initial prop control values are correct

  const firstInputLocator = canvasInputLocator.first();
  await selectCanvasComponent(page, firstInputLocator);

  const labelControlInputLocator = await getPropControlInputLocator(page, 'label');

  await expect(labelControlInputLocator).toHaveAttribute('value', 'textField1');

  // Change component prop values directly

  const valueControlInputLocator = await getPropControlInputLocator(page, 'value');

  const TEST_VALUE_1 = 'value1';

  await expect(valueControlInputLocator).not.toHaveAttribute('value', TEST_VALUE_1);
  await firstInputLocator.type(TEST_VALUE_1);
  await expect(valueControlInputLocator).toHaveAttribute('value', TEST_VALUE_1);

  // Change component prop values through controls

  const TEST_VALUE_2 = 'value2';

  await expect(firstInputLocator).not.toHaveAttribute('value', TEST_VALUE_2);
  await valueControlInputLocator.type(TEST_VALUE_2);
  await expect(firstInputLocator).toHaveAttribute('value', TEST_VALUE_2);
});
