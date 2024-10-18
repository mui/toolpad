'use client';

import * as React from 'react';
import DEFAULT_LOCALE_TEXT from './en';

export type LocaleContextType = {
  // Account
  signInLabel?: string;
  signOutLabel?: string;
  // Account Preview
  iconButtonAriaLabel?: string;
};

export const LocaleContext = React.createContext<LocaleContextType>(DEFAULT_LOCALE_TEXT);

export interface LocaleProviderProps {
  localeText?: Partial<LocaleContextType>;
  children: React.ReactNode;
}

/**
 * @ignore - internal component.
 */
export function LocaleProvider({ localeText, children }: LocaleProviderProps) {
  const mergedLocaleText = React.useMemo(
    () => ({ ...DEFAULT_LOCALE_TEXT, ...localeText }),
    [localeText],
  );

  return <LocaleContext.Provider value={mergedLocaleText}>{children}</LocaleContext.Provider>;
}

/**
 * @ignore - internal hook.
 */

export function useLocaleText() {
  return React.useContext(LocaleContext);
}
