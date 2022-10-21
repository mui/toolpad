import * as React from 'react';
import Head from 'next/head';
import { PaletteMode } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getDesignTokens, getThemedComponents, getMetaThemeColor } from './theme';
import useLocalStorageState from './utils/useLocalStorageState';

interface ThemeProviderProps {
  children?: React.ReactNode;
}

export type ThemeMode = PaletteMode | 'system';

function usePreferredMode(): PaletteMode {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDarkMode ? 'dark' : 'light';
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useLocalStorageState<ThemeMode>(
    'toolpad-palette-mode',
    'system',
  );
  return { themeMode, setThemeMode };
}

export function usePaletteMode(): PaletteMode {
  const preferredMode = usePreferredMode();
  const { themeMode } = useThemeMode();
  return themeMode === 'system' ? preferredMode : themeMode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const paletteMode = usePaletteMode();
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
