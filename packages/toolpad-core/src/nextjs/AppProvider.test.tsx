/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { AppProvider } from './AppProvider';
import { DataGrid } from '../DataGrid';

describe('AppProvider', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    // placeholder test
    const { getByText } = render(<AppProvider>Hello</AppProvider>);

    expect(getByText('Hello')).toBeTruthy();
  });
});
