'use client';
import * as React from 'react';
import type { PaletteMode } from '@mui/material';
import type { Branding, Navigation, Router } from '../AppProvider';
import type { DataModel } from '../Crud';
import type { CrudProviderProps } from '../Crud/CrudProvider';
import type { DataSourceCache } from '../Crud/cache';

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

export const CrudContext = React.createContext<{
  dataSource: CrudProviderProps<DataModel>['dataSource'] | null;
  dataSourceCache: DataSourceCache | null;
}>({
  dataSource: null,
  dataSourceCache: null,
});
