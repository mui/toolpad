import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Credentials Sign In', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('sign in with incorrect credentials displays error notification', async () => {
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

  test('sign in with correct credentials redirects to home page', async () => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');

    const credentialsSignIn = await page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });

    await credentialsSignIn.click();

    await page.waitForSelector('text=Welcome to Toolpad, Test User!');

    expect(page.url()).toBe(`${BASE_URL}/`);
  });

  test.afterEach(async () => {
    await page.close();
  });
});

test.describe('GitHub Sign In', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('OAuth sign in flow is initiated successfully', async () => {
    await page.goto(`${BASE_URL}/auth/signin`);

    const githubSignIn = await page.getByRole('button', {
      name: 'Sign in with GitHub',
      exact: true,
    });

    await githubSignIn.click();

    await page.waitForSelector(
      'text=Sign in to GitHub to continue to Toolpad Core Next.js Playground',
    );
  });

  test.afterEach(async () => {
    await page.close();
  });
});
