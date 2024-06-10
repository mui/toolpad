import { afterEach } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';
import { cleanup } from '@testing-library/react';

failOnConsole({
  silenceMessage: (errorMessage) => {
    // See https://github.com/jsdom/jsdom/issues/2177#issuecomment-1853544305
    if (/Could not parse CSS stylesheet/.test(errorMessage)) {
      return true;
    }
    return false;
  },
});

afterEach(cleanup);
