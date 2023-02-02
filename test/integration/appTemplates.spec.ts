import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadRuntime } from '../models/ToolpadRuntime';
import { test, expect } from '../playwright/test';

test('can use default app template', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'default' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  const emptyCanvasLocator = page.getByText('Drop component here');
  await expect(emptyCanvasLocator).not.toBeVisible();
});

test('can use hr template', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'hr' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  const dataGridRowLocator = page.getByText('Todd Breitenberg');
  await expect(dataGridRowLocator).toBeVisible();
});

test('can use images app template', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'images' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'dogBreedsPage');

  await page.locator('h3:has-text("Dog Images")').waitFor({ state: 'visible' });

  const breedInputLocator = page.getByRole('button', { name: /Pick a dog breed/ });
  await breedInputLocator.click();
  await page.getByRole('option', { name: 'australian' }).click();

  const subBreedInputLocator = page.getByRole('button', { name: /Pick a sub-breed/ });
  await subBreedInputLocator.click();
  await page.getByRole('option', { name: 'shepherd' }).click();

  const imageLocator = page.getByTestId('page-root').locator('img');

  await expect(imageLocator).toHaveAttribute(
    'src',
    /^https:\/\/images.dog.ceo\/breeds\/australian-shepherd\/[^/]+$/,
  );
});
