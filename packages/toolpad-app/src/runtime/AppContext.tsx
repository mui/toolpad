import * as React from 'react';
import { useNonNullableContext } from '@mui/toolpad-core/utils/react';
import { VersionOrPreview } from '../types';

export interface AppContext {
  version: VersionOrPreview;
}

const Context = React.createContext<AppContext | null>(null);

export const AppContextProvider = Context.Provider;
export function useAppContext() {
  return useNonNullableContext(Context);
}
