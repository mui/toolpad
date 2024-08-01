import * as React from 'react';
import { PaletteMode, useMediaQuery } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import CssBaseline from '@mui/material/CssBaseline';
import { useLocalStorageState } from '../useLocalStorageState';
import { PaletteModeContext } from '../shared/context';
import type { AppProviderProps } from './AppProvider';

const COLOR_SCHEME_ATTRIBUTE = 'data-toolpad-color-scheme';
const COLOR_SCHEME_STORAGE_KEY = 'mui-toolpad-color-scheme';
const MODE_STORAGE_KEY = 'mui-toolpad-mode';

function usePreferredMode() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDarkMode ? 'dark' : 'light';
}

type ThemeMode = PaletteMode | 'system';

function useStandardPaletteMode() {
  const preferredMode = usePreferredMode();
  const [mode, setMode] = useLocalStorageState<ThemeMode>(MODE_STORAGE_KEY, 'system');

  return {
    paletteMode: !mode || mode === 'system' ? preferredMode : mode,
    setPaletteMode: setMode,
  };
}

function PaletteModeProvider({ children }: { children: React.ReactNode }) {
  const preferredMode = usePreferredMode();
  const { mode, setMode, allColorSchemes } = useColorScheme();

  const paletteModeContextValue = React.useMemo(() => {
    return {
      paletteMode: !mode || mode === 'system' ? preferredMode : mode,
      setPaletteMode: setMode,
      isDualTheme: allColorSchemes.length > 1,
    };
  }, [allColorSchemes, mode, preferredMode, setMode]);

  return (
    <PaletteModeContext.Provider
      value={paletteModeContextValue}
    >
      {children}
    </PaletteModeContext.Provider>
  );
}

interface AppThemeProviderProps {
  children: React.ReactNode;
  theme: NonNullable<AppProviderProps['theme']>;
  window?: AppProviderProps['window'];
}

/**
 * @ignore - internal component.
 */
function AppThemeProvider(props: AppThemeProviderProps) {
  const { children, theme, window: appWindow } = props;

  const isDualTheme = 'light' in theme || 'dark' in theme;

  const { paletteMode } = useStandardPaletteMode();
  const dualAwareTheme = React.useMemo(
    () =>
      isDualTheme
        ? theme[paletteMode === 'dark' ? 'dark' : 'light'] ??
          theme[paletteMode === 'dark' ? 'light' : 'dark']
        : theme,
    [isDualTheme, paletteMode, theme],
  );

  return (
    <ThemeProvider
      theme={dualAwareTheme}
      documentNode={appWindow?.document}
      colorSchemeNode={appWindow?.document?.body}
      disableNestedContext
      colorSchemeStorageKey={COLOR_SCHEME_STORAGE_KEY}
      modeStorageKey={MODE_STORAGE_KEY}
    >
      {'vars' in theme && (
        <InitColorSchemeScript
          attribute={COLOR_SCHEME_ATTRIBUTE}
          colorSchemeStorageKey={COLOR_SCHEME_STORAGE_KEY}
          modeStorageKey={MODE_STORAGE_KEY}
        />
      )}
      <PaletteModeProvider>
      <CssBaseline enableColorScheme />
        {children}
      </PaletteModeProvider>
    </ThemeProvider>
  );
}

export { AppThemeProvider };
