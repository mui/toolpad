import * as React from 'react';

export interface AppHostContextValue {
  isPreview: boolean;
  isCustomServer: boolean;
}

export const AppHostContext = React.createContext<AppHostContextValue | null>(null);
