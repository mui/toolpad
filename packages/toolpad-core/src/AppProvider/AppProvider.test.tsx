/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from './AppProvider';

afterEach(cleanup);

describe('AppProvider', () => {
  test('renders content correctly', async () => {
    const theme = createTheme();

    const { getByText } = render(
      <AppProvider theme={theme} navigation={[]}>
        Hello world
      </AppProvider>,
    );

    expect(getByText('Hello world')).toBeTruthy();
  });
});
