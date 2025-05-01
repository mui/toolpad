/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from './AppProvider';

vi.mock('@mui/material/InitColorSchemeScript', () => ({
  default: (props: any) => {
    return <script nonce={props.nonce} data-testid="init-color-scheme-script" />;
  },
}));

describe('AppProvider', () => {
  test('renders content correctly', async () => {
    render(<AppProvider>Hello world</AppProvider>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  test('renders nonce correctly on color scheme script', async () => {
    const nonce = btoa(crypto.randomUUID());

    render(<AppProvider nonce={nonce}>Hello world</AppProvider>);

    const scriptTag = await screen.findByTestId('init-color-scheme-script');
    expect(scriptTag.getAttribute('nonce')).toBe(nonce);
  });

  test('renders content correctly when using legacy theme', async () => {
    const legacyTheme = createTheme();

    render(<AppProvider theme={legacyTheme}>Hello world</AppProvider>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });
});
