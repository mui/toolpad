import * as React from 'react';
import Head from 'next/head';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getDesignTokens, getThemedComponents, getMetaThemeColor } from './theme';
import useLocalStorageState from './utils/useLocalStorageState';

interface ThemeProviderProps {
  children?: React.ReactNode;
}

export type PaletteModeOptions = 'light' | 'dark';
export type ThemeModeOptions = PaletteModeOptions | 'system';

export const DispatchContext = React.createContext<
  React.Dispatch<React.SetStateAction<ThemeModeOptions>>
>(() => {
  throw new Error('Forgot to wrap component in `ThemeProvider`');
});

function usePreferredMode() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDarkMode ? 'dark' : 'light';
}

export function useToolpadThemeMode() {
  const preferredMode = usePreferredMode();
  return useLocalStorageState<ThemeModeOptions>('toolpad-palette-mode', preferredMode);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useToolpadThemeMode();

  const preferredMode = usePreferredMode();

  const paletteMode: PaletteModeOptions = React.useMemo(
    () => (themeMode === 'system' ? preferredMode : themeMode),
    [preferredMode, themeMode],
  );

  const theme = React.useMemo(() => {
    const brandingDesignTokens = getDesignTokens(paletteMode);
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: paletteMode,
      },
    });
    nextTheme = deepmerge(nextTheme, getThemedComponents(nextTheme));

    return nextTheme;
  }, [paletteMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <Head>
        {/* PWA primary color */}
        <meta
          name="theme-color"
          content={getMetaThemeColor(paletteMode)}
          media={`(prefers-color-scheme: ${paletteMode})`}
        />
      </Head>
      <DispatchContext.Provider value={setThemeMode}>{children}</DispatchContext.Provider>
    </MuiThemeProvider>
  );
}
