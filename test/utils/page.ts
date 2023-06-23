import { Page } from '@playwright/test';

export async function hideTab(page: Page, hide = true) {
  await page.evaluate((hideLocal) => {
    const hideDoc = (doc: Document) => {
      Object.defineProperty(doc, 'visibilityState', {
        value: hideLocal ? 'hidden' : 'visible',
        writable: true,
      });
      Object.defineProperty(doc, 'hidden', { value: hideLocal, writable: true });
      doc.dispatchEvent(new Event('visibilitychange'));
    };

    for (const frame of document.querySelectorAll('iframe')) {
      if (frame.contentDocument) {
        hideDoc(frame.contentDocument);
      }
    }

    hideDoc(document);
  }, hide);
}
