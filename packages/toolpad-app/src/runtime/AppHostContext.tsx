import * as React from 'react';

export interface RouterProps {
  children?: React.ReactNode;
}

export interface AppHost {
  isPreview: boolean;
  isCustomServer: boolean;
  isCanvas: boolean;
  Router: React.ComponentType<RouterProps>;
}

export const AppHostContext = React.createContext<AppHost | null>(null);
