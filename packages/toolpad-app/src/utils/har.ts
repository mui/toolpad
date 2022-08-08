import { Har } from 'har-format';

export function createHarLog(): Har {
  return {
    log: {
      version: '0.0',
      creator: {
        name: 'Toolpad',
        version: process.env.TOOLPAD_VERSION,
      },
      entries: [],
    },
  };
}

interface WithStartedDateTime {
  startedDateTime: string;
}

function oldestFirst(a: WithStartedDateTime, b: WithStartedDateTime): number {
  return new Date(a.startedDateTime).valueOf() - new Date(b.startedDateTime).valueOf();
}

export function mergeHar(target: Har, ...src: Har[]): Har {
  for (const har of src) {
    if (har.log.pages) {
      if (!target.log.pages) {
        target.log.pages = [];
      }
      target.log.pages.push(...har.log.pages);
    }
    target.log.entries.push(...har.log.entries);
  }

  target.log.entries.sort(oldestFirst);

  if (target.log.pages) {
    target.log.pages.sort(oldestFirst);
  }

  return target;
}
