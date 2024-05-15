/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { AppProvider } from './AppProvider';

describe('AppProvider', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    const { getByText } = render(<AppProvider>Hello world</AppProvider>);

    expect(getByText('Hello world')).toBeTruthy();
  });
});
