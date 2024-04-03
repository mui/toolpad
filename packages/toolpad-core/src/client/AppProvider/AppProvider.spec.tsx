/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';
import AppProvider from './AppProvider';

afterEach(cleanup);

describe('AppProvider', () => {
  test('renders content correctly', async () => {
    const theme = createTheme();

    render(
      <AppProvider theme={theme} navigation={[]}>
        hello
      </AppProvider>,
    );

    expect(screen.getByText('hello')).toBeTruthy();
  });
});
