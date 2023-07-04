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

  await page.frameLocator('iframe').locator(':root').evaluate(setHidden, hidden);
}
