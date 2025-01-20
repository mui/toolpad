import * as React from 'react';
import type { LocaleText } from '../AppProvider/LocalizationProvider';

export const AccountLocaleContext = React.createContext<Partial<LocaleText> | null>(null);
