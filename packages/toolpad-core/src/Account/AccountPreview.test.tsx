/// <reference types="@testing-library/jest-dom/vitest" />

/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountPreview } from './AccountPreview';
import { AppProvider } from '../AppProvider';

describe('AccountPreview', () => {
  const auth = { signIn: vi.fn(), signOut: vi.fn() };
  const session = {
    user: { name: 'John Doe', email: 'john@example.com', image: 'https://example.com/avatar.jpg' },
  };

  test('renders nothing when no session is provided', () => {
    render(
      <AppProvider authentication={auth}>
        <AccountPreview />
      </AppProvider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('displays condensed variant by default', () => {
    render(
      <AppProvider authentication={auth} session={session}>
        <AccountPreview />
      </AppProvider>,
    );

    const avatar = screen.getByRole('img', { name: 'John Doe' });
    expect(avatar).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('displays user name, email, and avatar in expanded variant', () => {
    render(
      <AppProvider authentication={auth} session={session}>
        <AccountPreview variant="expanded" />
      </AppProvider>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument();
  });

  test('calls handleClick when more icon button is clicked in expanded variant', async () => {
    const handleClick = vi.fn();
    render(
      <AppProvider authentication={auth} session={session}>
        <AccountPreview variant="expanded" handleClick={handleClick} />
      </AppProvider>,
    );

    const moreButton = screen.getByRole('button');
    await userEvent.click(moreButton);

    expect(handleClick).toHaveBeenCalled();
  });

  test('calls handleClick when avatar is clicked in condensed variant', async () => {
    const handleClick = vi.fn();
    render(
      <AppProvider authentication={auth} session={session}>
        <AccountPreview handleClick={handleClick} />
      </AppProvider>,
    );

    const avatarButton = screen.getByRole('button', { name: 'Current User' });
    await userEvent.click(avatarButton);

    expect(handleClick).toHaveBeenCalled();
  });
});
