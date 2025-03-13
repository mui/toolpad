'use client';
import * as React from 'react';
import type { LocaleText } from '../AppProvider/LocalizationProvider';

/**
 * @ignore - internal component.
 */
export const AccountLocaleContext = React.createContext<Partial<LocaleText> | null>(null);
