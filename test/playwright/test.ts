import { ConsoleMessage, test as base } from '@playwright/test';

export * from '@playwright/test';

interface ConsoleEntry {
  type: string;
  text: string;
  location: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const entries: ConsoleEntry[] = [];

    const consoleHandler = (msg: ConsoleMessage) => {
      entries.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });
    };

    page.on('console', consoleHandler);

    await use(page);

    page.off('console', consoleHandler);

    for (const entry of entries) {
      if (entry.type === 'error') {
        // Currently a catch-all for console error messages. Expecting us to add a way of blacklisting
        // expected error messages at some point here
        throw new Error(`Console error message detected\n${entry.text}`);
      }
    }
  },
});
