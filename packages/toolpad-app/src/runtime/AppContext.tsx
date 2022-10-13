import { VersionOrPreview } from '../types';
import { createProvidedContext } from '../utils/react';

export interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');

export { useAppContext, AppContextProvider };
