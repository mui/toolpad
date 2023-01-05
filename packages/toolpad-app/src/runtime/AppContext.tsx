import { createProvidedContext } from '@mui/toolpad-core';
import { VersionOrPreview } from '../types';

export interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');

export { useAppContext, AppContextProvider };
