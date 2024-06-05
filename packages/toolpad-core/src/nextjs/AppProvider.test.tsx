/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { AppProvider } from './AppProvider';
import { Router } from '../AppProvider';

vi.mock('next/router', () => vi.importActual('next-router-mock'));
vi.mock('next/compat/router', () => vi.importActual('next-router-mock'));

interface RouterTestProps {
  children: React.ReactNode;
}

function RouterTest({ children }: RouterTestProps) {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return <AppProvider router={router}>{children}</AppProvider>;
}

describe('AppProvider', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    // placeholder test
    const { getByText } = render(<RouterTest>Hello</RouterTest>);

    expect(getByText('Hello')).toBeTruthy();
  });
});
