import * as path from 'path';
import { test, expect } from '../playwright/test';
import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadEditor } from '../models/ToolpadEditor';
import { readJsonFile } from '../utils/fs';
import * as locators from '../utils/locators';

test('duplicate app from home flow', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './duplicateNavigationDom.json'));
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });
  await homeModel.goto();
  const duplicateApp = await homeModel.duplicateApplication(app.name);

  await expect(page.locator(locators.toolpadHomeAppRow(`${app.name} (copy)`))).toBeVisible();

  await homeModel.duplicateApplication(app.name);
  await expect(page.locator(locators.toolpadHomeAppRow(`${app.name} (copy 2)`))).toBeVisible();

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(duplicateApp.id);
  await editorModel.goToPreview();

  await page.locator('div', { hasText: 'Page' }).click();
  await page.waitForNavigation();
  await page.locator('button', { hasText: 'Go to Page 2' }).click();
  await page.waitForNavigation();
  await expect(page.locator('button', { hasText: 'Go to Page 1' })).toBeVisible();
});
