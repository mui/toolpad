/// <reference types="@testing-library/jest-dom/vitest" />

/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import describeConformance from '@toolpad/utils/describeConformance';
import { AccountDetails } from './AccountDetails';
import { SessionContext } from '../AppProvider';

describe('AccountDetails', () => {
  describeConformance(<AccountDetails />, () => ({
    skip: ['themeDefaultProps'],
  }));

  test('renders nothing when no session', () => {
    render(<AccountDetails />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders account details correctly when there is a session', () => {
    const session = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    };

    render(
      <SessionContext.Provider value={session}>
        <AccountDetails />
      </SessionContext.Provider>
    );

    const avatar = screen.getByRole('img', { name: 'John Doe' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('renders account details with fallback when image is not provided', () => {
    const session = {
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    };

    render(
      <SessionContext.Provider value={session}>
        <AccountDetails />
      </SessionContext.Provider>
    );
            
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
