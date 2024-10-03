/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './AppProvider';

describe('React Router AppProvider', () => {
  test('renders content correctly', async () => {
    // placeholder test
    render(
      <BrowserRouter>
        <AppProvider>Hello</AppProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
