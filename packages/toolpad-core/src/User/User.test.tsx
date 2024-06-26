/// <reference types="@testing-library/jest-dom/vitest" />

/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from './User';
import { AppProvider } from '../AppProvider';

describe('AppProvider', () => {
  test('renders nothing in button when no authentication', async () => {
    render(<User />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders log in button when no session', async () => {
    const auth = { signIn: vi.fn(), signOut: vi.fn() };
    render(
      <AppProvider authentication={auth}>
        <User />
      </AppProvider>,
    );

    const loginButton = screen.getByRole('button', { name: 'Sign In' });

    await userEvent.click(loginButton);

    expect(auth.signIn).toHaveBeenCalled();
  });

  test('renders content correctly when tehre is a session', async () => {
    const auth = { signIn: vi.fn(), signOut: vi.fn() };
    const session = { user: { name: 'John Doe', email: 'john@example.com' } };
    render(
      <AppProvider authentication={auth} session={session}>
        <User />
      </AppProvider>,
    );

    const userButton = screen.getByRole('button', { name: 'Current User' });

    await userEvent.click(userButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });

    await userEvent.click(signOutButton);

    expect(auth.signOut).toHaveBeenCalled();
  });
});
