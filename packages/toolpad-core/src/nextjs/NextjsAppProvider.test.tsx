/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextjsAppProvider } from './NextjsAppProvider';
import { Router } from '../AppProvider';

vi.mock('next/navigation', () => {
  const searchParams = new URLSearchParams();
  const push = () => {};
  const replace = () => {};
  const router = { push, replace };
  return {
    usePathname: () => '/',
    useSearchParams: () => searchParams,
    useRouter: () => router,
  };
});

vi.mock('next/router', () => ({ useRouter: () => null }));

vi.mock('next/compat/router', () => ({ useRouter: () => null }));

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

  return <NextjsAppProvider router={router}>{children}</NextjsAppProvider>;
}

describe('Nextjs AppProvider', () => {
  test('renders content correctly', async () => {
    // placeholder test
    render(<RouterTest>Hello</RouterTest>);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
