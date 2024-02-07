import * as React from 'react';

export interface AppHost {
  isPreview: boolean;
  isCustomServer: boolean;
  isCanvas: boolean;
}

export const AppHostContext = React.createContext<AppHost | null>(null);
