/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import type { Navigation } from '../AppProvider';
import { NavigationContext } from '../shared/context';
import { useNavigation } from './useNavigation';

const MOCK_NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
    pattern: 'orders{/:orderId}*',
  },
];

interface TestWrapperProps {
  navigation: Navigation;
  children: React.ReactNode;
}

function TestWrapper({ children, navigation }: TestWrapperProps) {
  return <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>;
}

describe('useNavigation hook', () => {
  test('should return navigation', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: ({ children }) => <TestWrapper navigation={MOCK_NAVIGATION}>{children}</TestWrapper>,
    });

    expect(result.current).toEqual(MOCK_NAVIGATION);
  });
});
