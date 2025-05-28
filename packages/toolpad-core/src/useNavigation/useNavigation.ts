import * as React from 'react';
import type { Navigation } from '../AppProvider';
import { NavigationContext } from '../shared/context';

/**
 * Hook to access the current Toolpad Core navigation.
 * @returns The current navigation.
 */
export function useNavigation(): Navigation {
  return React.useContext(NavigationContext);
}
