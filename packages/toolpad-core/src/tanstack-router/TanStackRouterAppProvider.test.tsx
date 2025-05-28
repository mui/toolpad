/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { TanStackRouterAppProvider } from './TanStackRouterAppProvider';

describe('Tanstack React Router AppProvider', () => {
  const rootRoute = createRootRoute({
    component: () => (
      <TanStackRouterAppProvider>
        <Outlet />
      </TanStackRouterAppProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <span>Hello</span>,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);
  const router = createRouter({ routeTree });

  test('renders content correctly', async () => {
    await act(() =>
      router.navigate({
        to: '/',
      }),
    );

    // placeholder test
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
