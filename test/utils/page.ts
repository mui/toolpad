import { Page } from '@playwright/test';

export async function setPageHidden(page: Page, hidden = true) {
  const setHidden = (html: HTMLElement, hiddenLocal: boolean) => {
    const doc = html.ownerDocument;
    Object.defineProperty(doc, 'visibilityState', {
      value: hiddenLocal ? 'hidden' : 'visible',
      writable: true,
    });
    Object.defineProperty(doc, 'hidden', { value: hiddenLocal, writable: true });
    doc.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  };

  await page.locator(':root').evaluate(setHidden, hidden);

  for (const iframe of await page.locator('iframe').all()) {
    // eslint-disable-next-line no-await-in-loop
    await iframe.frameLocator(':scope').locator(':root').evaluate(setHidden, hidden);
  }
}
