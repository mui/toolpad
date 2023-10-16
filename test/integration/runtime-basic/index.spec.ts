import * as path from 'path';
import * as url from 'url';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('input basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('page1');

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

test('event mutations', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('page2');

  await page.getByText('Mutation tests').waitFor({ state: 'visible' });

  await expect(page.getByText('result 1')).not.toBeVisible();
  await expect(page.getByText('result 2')).not.toBeVisible();
  await page.getByRole('button', { name: 'button 1' }).click();
  await expect(page.getByText('result 1')).toBeVisible();
  await expect(page.getByText('result 2')).toBeVisible();

  await expect(page.getByText('result 3')).not.toBeVisible();
  await page.getByRole('button', { name: 'button 2' }).click();
  await expect(page.getByText('result 3')).toBeVisible();
});
