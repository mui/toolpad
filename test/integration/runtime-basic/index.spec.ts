import { ToolpadHome } from '../../models/ToolpadHome';
import { test, expect } from '../../playwright/test';
import basicDom from './basicDom.json';

const PAGE_ID = 'vlpwdwr';

test('input basics', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: basicDom });

  await page.goto(`/app/${app.id}/preview/pages/${PAGE_ID}`);

  const textField1 = page.locator('label:has-text("textField1")');
  const textField2 = page.locator('label:has-text("textField2")');
  const textField3 = page.locator('label:has-text("textField3")');

  await page.locator('text="foo  bar"').waitFor({ state: 'visible' });

  await textField1.fill('hello');

  await page.locator('text="foo hello bar"').waitFor({ state: 'visible' });

  expect(await textField2.inputValue()).toBe('hello1');

  expect(await textField3.inputValue()).toBe('hello2');

  await page.goto(`/app/${app.id}/preview/pages/${PAGE_ID}?msg=hello3`);

  expect(await textField3.inputValue()).toBe('hello3');
});
