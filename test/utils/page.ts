import { Page } from '@playwright/test';

export async function setPageHidden(page: Page, hidden = true) {
  await page.evaluate((hiddenLocal) => {
    const hideDoc = (doc: Document) => {
      Object.defineProperty(doc, 'visibilityState', {
        value: hiddenLocal ? 'hidden' : 'visible',
        writable: true,
      });
      Object.defineProperty(doc, 'hidden', { value: hiddenLocal, writable: true });
      doc.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
    };

    for (const frame of document.querySelectorAll('iframe')) {
      if (frame.contentDocument) {
        hideDoc(frame.contentDocument);
      }
    }

    hideDoc(document);
  }, hidden);
}
