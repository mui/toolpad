import * as React from 'react';

export interface AppContextValue {
  isPreview: boolean;
  isCustomServer: boolean;
}

export const AppContext = React.createContext<AppContextValue | null>(null);
