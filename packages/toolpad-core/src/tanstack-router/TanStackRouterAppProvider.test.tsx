/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterAppProvider } from './TanStackRouterAppProvider';

describe('Tanstack React Router AppProvider', () => {
  const rootRoute = createRootRoute({
    component: () => <TanStackRouterAppProvider>Hello</TanStackRouterAppProvider>,
  });

  const router = createRouter({ routeTree: rootRoute });

  test('renders content correctly', async () => {
    // placeholder test
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
