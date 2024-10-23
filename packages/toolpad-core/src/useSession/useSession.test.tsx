/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useSession } from './useSession';
import { Session, SessionContext } from '../AppProvider/AppProvider';

// Mock the session data
const mockSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharat@mui.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

interface TestWrapperProps {
  session: Session | null;
  children: React.ReactNode;
}

function TestWrapper({ children, session }: TestWrapperProps) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

describe('useSession hook', () => {
  test('should return session data when authenticated', () => {
    const { result } = renderHook(() => useSession(), {
      wrapper: ({ children }) => <TestWrapper session={mockSession}>{children}</TestWrapper>,
    });

    expect(result.current).toEqual(mockSession);
  });

  test('should return null session when not authenticated', () => {
    const { result } = renderHook(() => useSession(), {
      wrapper: ({ children }) => <TestWrapper session={null}>{children}</TestWrapper>,
    });

    expect(result.current).toBeNull();
  });
});
