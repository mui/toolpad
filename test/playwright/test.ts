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
  /JavaScript Error: "Image corrupt or truncated./,
  /net::ERR_INTERNET_DISCONNECTED/,
  // TODO: Comes up in firefox on CI sometimes
  /InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable/,
  /Failed to load resource: the server responded with a status of 504 \(Outdated Optimize Dep\)/,
];

export type Options = { ignoreConsoleErrors: RegExp[] };

export const test = base.extend<Options>({
  ignoreConsoleErrors: [[], { option: true }],
  page: async ({ page, ignoreConsoleErrors }, run) => {
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

    await run(page);

    page.off('console', consoleHandler);

    const entries = await Promise.all(entryPromises);
    const ignoredEntries = [...IGNORED_ERRORS, ...ignoreConsoleErrors];
    for (const entry of entries) {
      if (
        entry.type === 'error' &&
        !ignoredEntries.some(
          (regex) => regex.test(entry.text) || entry.args.some((arg) => regex.test(arg)),
        )
      ) {
        // Currently a catch-all for console error messages. Expecting us to add a way of blacklisting
        // expected error messages at some point here
        throw new Error(`Console error message detected\n${JSON.stringify(entry, null, 2)}`);
      }
    }
  },
});
