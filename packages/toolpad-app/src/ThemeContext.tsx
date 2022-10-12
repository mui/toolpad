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

type PaletteModeOptions = 'light' | 'dark';
export type ThemeModeOptions = PaletteModeOptions | 'system';

function usePreferredMode(): PaletteModeOptions {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDarkMode ? 'dark' : 'light';
}

export function useToolpadThemeModeSetting() {
  return useLocalStorageState<ThemeModeOptions>('toolpad-palette-mode', 'system');
}

export function useToolpadThemeMode(): PaletteModeOptions {
  const preferredMode = usePreferredMode();
  const [setting] = useToolpadThemeModeSetting();
  return setting === 'system' ? preferredMode : setting;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const paletteMode = useToolpadThemeMode();
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
      {children}
    </MuiThemeProvider>
  );
}
