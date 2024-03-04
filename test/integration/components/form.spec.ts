import * as path from 'path';
import * as url from 'url';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-form'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('submits form data', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('form');

  const nameInput = page.getByLabel('name');
  await nameInput.clear();
  await nameInput.type('Toolpad');

  const dateInput = page.getByLabel('date', { exact: true });
  await dateInput.focus();
  await dateInput.type('01011990');

  await page.getByLabel('option').click();
  await page.getByRole('option', { name: 'option 2' }).click();

  await page.getByLabel('file').setInputFiles({
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello'),
  });

  const countryInput = page.getByLabel('country');
  await countryInput.clear();
  await countryInput.type('Por');
  await page.getByRole('option', { name: 'Portugal' }).click();

  await expect
    .poll(async () => {
      const text = await page.getByText('My form data').textContent();
      if (text) {
        return JSON.parse(text.slice('My form data: '.length));
      }
      return null;
    })
    .toStrictEqual({
      name: 'Toolpad',
      date: '1990-01-01',
      option: 'option 2',
      file: [
        {
          name: 'test.txt',
          type: 'text/plain',
          size: 5,
          base64: 'data:text/plain;base64,aGVsbG8=',
        },
      ],
      country: 'Portugal',
    });

  await expect(page.getByRole('button', { name: 'Submitted' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('button', { name: 'Submitted' })).toBeVisible();
});

test('resets form data', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('form');

  const nameInput = page.getByLabel('name');
  await nameInput.clear();
  await nameInput.type('MUI');

  const dateInput = page.getByLabel('date', { exact: true });
  await dateInput.focus();
  await dateInput.type('05051995');

  await page.getByLabel('option').click();
  await page.getByRole('option', { name: 'option 3' }).click();

  await page.getByLabel('file').setInputFiles({
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello'),
  });

  const countryInput = page.getByLabel('country');
  await countryInput.clear();
  await countryInput.type('Bel');
  await page.getByRole('option', { name: 'Belgium' }).click();

  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(page.getByText('My form data')).toContainText(
    JSON.stringify({
      name: 'Default Name',
    }),
  );
});

test('validates form data', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('form');

  const nameInput = page.getByLabel('name');
  await nameInput.clear();
  await nameInput.type('OK');

  await page.getByLabel('option').click();
  await page.getByRole('option', { name: 'option 1' }).click();

  await page.getByLabel('outside').type('toolong');

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('name must have at least 3 characters.')).toBeVisible();
  await expect(page.getByText('date is required.')).toBeVisible();
  await expect(page.getByText('outside must have no more than 3 characters.')).toBeVisible();
  await expect(page.getByText('country is required.')).toBeVisible();
});
