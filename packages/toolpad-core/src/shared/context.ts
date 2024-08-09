import * as React from 'react';
import type { PaletteMode } from '@mui/material';
import type { Branding, Navigation, Router } from '../AppProvider';

if ((globalThis as any).BrandingContext) {
  console.error(
    'WARNING: module is being loaded more than once, multiple contexts will be created.',
  );
}

(globalThis as any).BrandingContext =
  (globalThis as any).BrandingContext ?? React.createContext<Branding | null>(null);

export const BrandingContext: React.Context<Branding | null> = (globalThis as any).BrandingContext;

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

export const DocsContext = React.createContext<boolean>(false);
