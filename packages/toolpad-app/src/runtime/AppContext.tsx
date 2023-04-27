import * as React from 'react';
import { useNonNullableContext } from '@mui/toolpad-utils/react';
import { AppVersion } from '../types';

export interface AppContext {
  version: AppVersion;
}

const Context = React.createContext<AppContext | null>(null);

export const AppContextProvider = Context.Provider;
export function useAppContext() {
  return useNonNullableContext(Context);
}
