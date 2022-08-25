import { test, expect, Page, Locator } from '@playwright/test';
import createApp from '../../utils/createApp';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';
import { canvasFrame, componentPropsEditor, pageRoot } from '../../utils/locators';
import domInput from './domInput.json';

async function getPropControlInputLocator(page: Page, inputPropName: string) {
  const componentPropsEditorLocator = page.locator(componentPropsEditor);

  const propControlLabelHandle = await componentPropsEditorLocator
    .locator(`label:has-text("${inputPropName}")`)
    .elementHandle();
  const propControlLabelFor = await propControlLabelHandle?.getAttribute('for');

  return componentPropsEditorLocator.locator(`input[id="${propControlLabelFor}"]`);
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
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageRootLocator.waitFor();

  // Verify that initial prop control values are correct

  const firstInputLocator = canvasInputLocator.first();
  await clickCenter(page, firstInputLocator);

  const labelControlInputLocator = await getPropControlInputLocator(page, 'label');

  await expect(labelControlInputLocator).toHaveAttribute('value', 'textField1');

  // Change component prop values directly

  const valueControlInputLocator = await getPropControlInputLocator(page, 'value');

  const TEST_VALUE_1 = 'value1';

  await expect(valueControlInputLocator).not.toHaveAttribute('value', TEST_VALUE_1);
  await firstInputLocator.type(TEST_VALUE_1);
  await expect(valueControlInputLocator).toHaveAttribute('value', TEST_VALUE_1);

  // Change component prop values through controls

  const firstInputLabelLocator = await getInputElementLabelLocator(page, firstInputLocator);
  const TEST_VALUE_2 = 'value2';

  await expect(firstInputLabelLocator).not.toHaveText(TEST_VALUE_2);

  await labelControlInputLocator.selectText();
  await page.keyboard.press('Backspace');
  await labelControlInputLocator.type(TEST_VALUE_2);

  await expect(firstInputLabelLocator).toHaveText(TEST_VALUE_2);
});
