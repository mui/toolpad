import { Har } from 'har-format';

export default function createHarLog(): Har {
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
