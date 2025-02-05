import * as React from 'react';
import type { PaletteMode } from '@mui/material';
import type { Branding, Navigation, Router } from '../AppProvider';
import type { DataModel } from '../CRUD';
import type { CRUDProviderProps } from '../CRUD/CRUDProvider';

export const BrandingContext = React.createContext<Branding | null>(null);

export const NavigationContext = React.createContext<Navigation>([]);

export const PaletteModeContext = React.createContext<{
  paletteMode: PaletteMode;
  setPaletteMode: (mode: PaletteMode) => void;
  isDualTheme: boolean;
}>({
  paletteMode: 'light',
  setPaletteMode: () => {},
  isDualTheme: false,
});

export const RouterContext = React.createContext<Router | null>(null);

export const WindowContext = React.createContext<Window | undefined>(undefined);

export const CRUDContext = React.createContext<{
  dataSource: CRUDProviderProps<DataModel>['dataSource'] | null;
}>({
  dataSource: null,
});
