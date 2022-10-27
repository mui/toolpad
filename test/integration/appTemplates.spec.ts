import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadRuntime } from '../models/ToolpadRuntime';
import { test, expect } from '../playwright/test';

test('can use statistics app template', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'stats' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'stats');

  await page.locator('h3:has-text("Statistics")').waitFor({ state: 'visible' });
  await page.locator('text="Active Cases_text"').waitFor({ state: 'visible' });
  await page.locator('text="USA"').waitFor({ state: 'visible' });
});

test('can use images app template', async ({ page }) => {
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

  const subBreedInputLocator = page.locator('[aria-haspopup="listbox"]').nth(1);
  await subBreedInputLocator.click();
  await Promise.all([
    page.locator('li:has-text("shepherd")').click(),
    page.waitForResponse('https://images.dog.ceo/**'),
  ]);

  const imageLocator = page.locator('img');
  expect(await imageLocator.getAttribute('src')).toContain(
    'https://images.dog.ceo/breeds/australian-shepherd',
  );
});
