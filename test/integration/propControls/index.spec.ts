import { test, expect, Locator } from '@playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';
import domInput from './domInput.json';

async function getPropControlInputLocator(editorModel: ToolpadEditor, inputPropName: string) {
  const propControlLabelHandle = await editorModel.selectedNodeEditor
    .locator(`label:has-text("${inputPropName}")`)
    .elementHandle();
  const propControlLabelFor = await propControlLabelHandle?.getAttribute('for');

  return editorModel.selectedNodeEditor.locator(`input[id="${propControlLabelFor}"]`);
}

async function getInputElementLabelLocator(editorModel: ToolpadEditor, inputLocator: Locator) {
  const inputHandle = await inputLocator.elementHandle();
  const inputId = await inputHandle?.getAttribute('id');

  return editorModel.appCanvas.locator(`label[for="${inputId}"]`);
}

test('can control component prop values in properties control panel', async ({
  page,
  browserName,
}) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page, browserName);

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Verify that initial prop control values are correct

  const firstInputLocator = canvasInputLocator.first();
  await clickCenter(page, firstInputLocator);

  const getLabelControlInputValue = async () =>
    editorModel.selectedNodeEditor.locator(`label:text-is("label")`).inputValue();
  const getValueControlInputValue = async () =>
    editorModel.selectedNodeEditor.locator(`label:text-is("value")`).inputValue();

  expect(await getLabelControlInputValue()).toBe('textField1');

  // Change component prop values directly

  const TEST_VALUE_1 = 'value1';

  expect(await getValueControlInputValue()).not.toBe(TEST_VALUE_1);
  await firstInputLocator.fill(TEST_VALUE_1);
  expect(await getValueControlInputValue()).toBe(TEST_VALUE_1);

  // Change component prop values through controls

  const firstInputLabelLocator = await getInputElementLabelLocator(editorModel, firstInputLocator);
  const TEST_VALUE_2 = 'value2';

  await expect(firstInputLabelLocator).not.toHaveText(TEST_VALUE_2);

  const labelControlInputLocator = await getPropControlInputLocator(editorModel, 'label');
  await labelControlInputLocator.fill('');
  await labelControlInputLocator.fill(TEST_VALUE_2);

  await expect(firstInputLabelLocator).toHaveText(TEST_VALUE_2);
});
