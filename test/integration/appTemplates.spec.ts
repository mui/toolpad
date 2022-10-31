import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadRuntime } from '../models/ToolpadRuntime';
import { test, expect } from '../playwright/test';
import { waitForDataResponse } from '../utils/response';

test('can use statistics app template', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'stats' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'stats');

  await page.locator('h3:has-text("Statistics")').waitFor({ state: 'visible' });
  expect(await page.locator('[role="columnheader"]').first().textContent()).toBe(
    'Active Cases_text',
  );
});

test('can use images app template', async ({ page, baseURL }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'images' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'dogBreedsPage');

  await page.locator('h3:has-text("Dog Images")').waitFor({ state: 'visible' });

  const breedInputLocator = page.locator('[aria-haspopup="listbox"]').first();
  await breedInputLocator.click();
  await page.locator('li:has-text("australian")').click();
  await waitForDataResponse(page, baseURL!);

  const subBreedInputLocator = page.locator('[aria-haspopup="listbox"]').nth(1);
  await subBreedInputLocator.click();
  await page.locator('li:has-text("shepherd")').click();
  await waitForDataResponse(page, baseURL!);

  const imageLocator = page.locator('img');
  expect(await imageLocator.getAttribute('src')).toContain(
    'https://images.dog.ceo/breeds/australian-shepherd',
  );
});
