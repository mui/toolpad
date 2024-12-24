/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ReactRouterAppProvider } from './ReactRouterAppProvider';

describe('React Router AppProvider', () => {
  test('renders content correctly', async () => {
    // placeholder test
    render(
      <BrowserRouter>
        <ReactRouterAppProvider>Hello</ReactRouterAppProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
