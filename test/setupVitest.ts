import { afterEach, vi } from 'vitest';
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

// Mocks

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
