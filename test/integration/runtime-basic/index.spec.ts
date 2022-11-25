import invariant from 'invariant';
import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import { createApplication } from '../../utils/toolpadApi';

test('input basics', async ({ page, baseURL }) => {
  invariant(baseURL, 'playwright must be run with a a baseURL');

  const dom = await readJsonFile(path.resolve(__dirname, './basicDom.json'));
  const app = await createApplication(baseURL, { dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

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
