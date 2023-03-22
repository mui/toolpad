import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';
import { APP_ID_LOCAL_MARKER } from '../../../packages/toolpad-app/src/constants';

test.skip(!process.env.LOCAL_MODE_TESTS, 'These are local mode tests');

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('input basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(APP_ID_LOCAL_MARKER, 'page1');

  const textField1 = page.locator('label:has-text("textField1")');
  const textField2 = page.locator('label:has-text("textField2")');
  const textField3 = page.locator('label:has-text("textField3")');

  await page.locator('text="foo  bar"').waitFor({ state: 'visible' });

  await textField1.fill('hello');

  await page.locator('text="foo hello bar"').waitFor({ state: 'visible' });

  expect(await textField2.inputValue()).toBe('hello1');

  expect(await textField3.inputValue()).toBe('hello2');

  await page.goto(`${page.url()}?msg=hello3`);

  expect(await textField3.inputValue()).toBe('hello3');
});
