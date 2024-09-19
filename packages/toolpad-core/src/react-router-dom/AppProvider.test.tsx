/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from './AppProvider';
import { Router } from '../AppProvider';

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

describe('React Router DOM AppProvider', () => {
  test('renders content correctly', async () => {
    // placeholder test
    render(<RouterTest>Hello</RouterTest>);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
