/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from './AppProvider';

describe('AppProvider', () => {
  test('renders content correctly', async () => {
    render(<AppProvider>Hello world</AppProvider>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });
});
