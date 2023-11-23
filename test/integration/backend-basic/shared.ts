import { expect, Locator, Page, FrameLocator } from '../../playwright/localTest';

export async function expectBasicRuntimeContentTests(page: Page | Locator | FrameLocator) {
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
  await expect(
    page.getByText("Raw text: Hello, I'm raw text! | SELECT NOW()", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('my custom cookie: foo-bar-baz', { exact: true })).toBeVisible();
}

export async function expectBasicRuntimeTests(page: Page | Locator | FrameLocator) {
  await expectBasicRuntimeContentTests(page);

  await page.getByRole('button', { name: 'set cookie' }).click();

  await expect(
    page.getByText('my custom cookie: hello everybody!!!', { exact: true }),
  ).toBeVisible();
}
