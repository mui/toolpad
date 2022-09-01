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
  args: any[];
}

const IGNORED_ERRORS = [
  /JavaScript Error: "downloadable font: download failed \(font-family: "Roboto" style:normal/,
];

export const test = base.extend({
  page: async ({ page }, use) => {
    const entryPromises: Promise<ConsoleEntry>[] = [];

    const consoleHandler = (msg: ConsoleMessage) => {
      entryPromises.push(
        Promise.all(
          msg.args().map(async (argHandle) => argHandle.jsonValue().catch(() => '<circular>')),
        ).then((args) => {
          return {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            args,
          };
        }),
      );
    };

    page.on('console', consoleHandler);

    await use(page);

    page.off('console', consoleHandler);

    const entries = await Promise.all(entryPromises);
    for (const entry of entries) {
      if (entry.type === 'error' && !IGNORED_ERRORS.some((regex) => regex.test(entry.text))) {
        // Currently a catch-all for console error messages. Expecting us to add a way of blacklisting
        // expected error messages at some point here
        throw new Error(`Console error message detected\n${JSON.stringify(entry, null, 2)}`);
      }
    }
  },
});
