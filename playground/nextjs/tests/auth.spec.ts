import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Credentials Sign In', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('orders page is not accessible without authentication', async () => {
    await page.goto(`${BASE_URL}/orders`);

    await page.waitForSelector('text=Welcome user, please sign in to continue');

    expect(page.url()).toBe(
      `${BASE_URL}/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Forders`,
    );
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

  test('sign out redirects to sign in page with callback URL', async () => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'welcome@email.com');
    await page.fill('input[name="password"]', 'password');

    const credentialsSignIn = await page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });

    await credentialsSignIn.click();

    await page.waitForSelector('text=Welcome to Toolpad, Test User!');
    expect(page.url()).toBe(`${BASE_URL}/`);

    await page.goto(`${BASE_URL}/orders`);

    const accountButton = await page.getByLabel('Current User');
    await accountButton.click();

    const signOut = await page.getByRole('button', {
      name: 'Sign Out',
      exact: true,
    });
    await signOut.click();

    await page.waitForSelector('text=please sign in to continue');

    expect(page.url()).toBe(
      `${BASE_URL}/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Forders`,
    );
  });

  test('sign in with correct credentials redirects to callback URL', async () => {
    await page.goto(`${BASE_URL}/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Forders`);

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');

    const credentialsSignIn = await page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });

    await credentialsSignIn.click();

    await page.waitForSelector('text=Welcome to the Toolpad orders!');

    expect(page.url()).toBe(`${BASE_URL}/orders`);
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
