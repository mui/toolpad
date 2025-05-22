/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { TanstackReactRouterAppProvider } from './TanstackReactRouterAppProvider';

describe('Tanstack React Router AppProvider', () => {
  const rootRoute = createRootRoute({
    component: () => <TanstackReactRouterAppProvider>Hello</TanstackReactRouterAppProvider>,
  });

  const router = createRouter({ routeTree: rootRoute });

  test('renders content correctly', async () => {
    // placeholder test
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
