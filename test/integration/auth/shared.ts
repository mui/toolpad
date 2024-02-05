import { Page } from '@playwright/test';

export async function tryCredentialsSignIn(page: Page, username: string, password: string) {
  await page.getByText('Sign in with credentials').click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}
