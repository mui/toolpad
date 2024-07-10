import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Sign In', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('credentials successful sign in', async () => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');

    const credentialsSignIn = await page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });

    await credentialsSignIn.click();

    await page.waitForNavigation();

    expect(page.url()).toBe(`${BASE_URL}/`);
  });

  test('failed sign in with incorrect credentials', async () => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    const credentialsSignIn = await page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });

    await credentialsSignIn.click();

    await page.waitForSelector('text=Invalid credentials.');

    expect(page.url()).toBe(`${BASE_URL}/auth/signin`);
  });

  test.afterEach(async () => {
    await page.close();
  });
});
