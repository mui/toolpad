import * as path from 'path';
import * as fs from 'fs/promises';
import { expect, Page, RunningLocalApp } from '../../playwright/localTest';

import { fileReplace } from '../../../packages/toolpad-utils/src/fs';

export async function expectBasicPageContent(page: Page, localApp: RunningLocalApp) {
  await expect(page.getByText('hello, message: hello world', { exact: true })).toBeVisible();
  await expect(page.getByText('throws, error.message: BOOM!', { exact: true })).toBeVisible();
  await expect(page.getByText('throws, data had an error', { exact: true })).toBeVisible();
  await expect(page.getByText('threw error 1', { exact: true })).toBeVisible();
  await expect(
    page.getByText('echo, parameter: bound foo parameter', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('echo, secret: Some bar secret', { exact: true })).toBeVisible();
  await expect(
    page.getByText('echo, secret not in .env: Some baz secret', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Propagated error: KABOOM!', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Loading: true; Propagated loading: true', { exact: true }),
  ).toBeVisible();

  const envFilePath = path.resolve(localApp.dir, './.env');
  const envOriginal = await fs.readFile(envFilePath, 'utf-8');
  try {
    await fileReplace(envFilePath, 'SECRET_BAR="Some bar secret"', 'SECRET_BAR="Some quux secret"');

    await expect(page.getByText('echo, secret: Some quux secret', { exact: true })).toBeVisible();
  } finally {
    await fs.writeFile(envFilePath, envOriginal);
  }
}
