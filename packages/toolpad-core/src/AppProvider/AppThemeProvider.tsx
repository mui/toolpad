import * as React from 'react';
import { PaletteMode, Theme, useMediaQuery } from '@mui/material';
import { CssVarsProvider, ThemeProvider, useColorScheme, CssVarsTheme } from '@mui/material/styles';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import CssBaseline from '@mui/material/CssBaseline';
import { useLocalStorageState } from '../useLocalStorageState';
import { PaletteModeContext } from '../shared/context';
import type { AppProviderProps } from './AppProvider';

function usePreferredMode() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDarkMode ? 'dark' : 'light';
}

type ThemeMode = PaletteMode | 'system';

function useThemeMode() {
  const [themeMode, setThemeMode] = useLocalStorageState<ThemeMode>(
    'toolpad-palette-mode',
    'system',
  );
  return { themeMode, setThemeMode };
}

function useStandardPaletteMode() {
  const preferredMode = usePreferredMode();
  const { themeMode, setThemeMode } = useThemeMode();

  return {
    paletteMode: !themeMode || themeMode === 'system' ? preferredMode : themeMode,
    setPaletteMode: setThemeMode,
  };
}

interface StandardThemeProviderProps {
  children: React.ReactNode;
  theme: NonNullable<Theme | { light: Theme; dark: Theme }>;
}

/**
 * @ignore - internal component.
 */
function StandardThemeProvider(props: StandardThemeProviderProps) {
  const { children, theme } = props;

  const { paletteMode, setPaletteMode } = useStandardPaletteMode();

  const isDualTheme = 'light' in theme || 'dark' in theme;

  const dualAwareTheme = React.useMemo(
    () =>
      isDualTheme
        ? theme[paletteMode === 'dark' ? 'dark' : 'light'] ??
          theme[paletteMode === 'dark' ? 'light' : 'dark']
        : theme,
    [isDualTheme, paletteMode, theme],
  );

  const paletteModeContextValue = React.useMemo(
    () => ({ paletteMode, setPaletteMode, isDualTheme }),
    [isDualTheme, paletteMode, setPaletteMode],
  );

  return (
    <ThemeProvider theme={dualAwareTheme}>
      <PaletteModeContext.Provider value={paletteModeContextValue}>
        {children}
      </PaletteModeContext.Provider>
    </ThemeProvider>
  );
}

interface CSSVarsThemeConsumerProps {
  children: React.ReactNode;
  isDualTheme: boolean;
}

/**
 * @ignore - internal component.
 */
function CSSVarsThemeConsumer(props: CSSVarsThemeConsumerProps) {
  const { children, isDualTheme } = props;

  const preferredMode = usePreferredMode();
  const { mode, setMode } = useColorScheme();

  const paletteModeContextValue = React.useMemo(() => {
    return {
      paletteMode: !mode || mode === 'system' ? preferredMode : mode,
      setPaletteMode: setMode,
      isDualTheme,
    };
  }, [isDualTheme, mode, preferredMode, setMode]);

  return (
    <PaletteModeContext.Provider value={paletteModeContextValue}>
      {children}
    </PaletteModeContext.Provider>
  );
}

const COLOR_SCHEME_ATTRIBUTE = 'data-mui-color-scheme';
const COLOR_SCHEME_STORAGE_KEY = 'mui-toolpad-color-scheme';
const MODE_STORAGE_KEY = 'mui-toolpad-mode';

interface CSSVarsThemeProviderProps {
  children: React.ReactNode;
  theme: NonNullable<CssVarsTheme>;
  window?: AppProviderProps['window'];
}

/**
 * @ignore - internal component.
 */
function CSSVarsThemeProvider(props: CSSVarsThemeProviderProps) {
  const { children, theme, window: appWindow } = props;

  const isDualTheme = 'light' in theme.colorSchemes && 'dark' in theme.colorSchemes;

  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="system"
      documentNode={appWindow?.document}
      colorSchemeNode={appWindow?.document?.body}
      attribute={COLOR_SCHEME_ATTRIBUTE}
        colorSchemeStorageKey={COLOR_SCHEME_STORAGE_KEY}
        modeStorageKey={MODE_STORAGE_KEY}
    >
      <CSSVarsThemeConsumer isDualTheme={isDualTheme}>{children}</CSSVarsThemeConsumer>
    </CssVarsProvider>
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

  const isCSSVarsTheme = 'colorSchemes' in theme;

  const themeChildren = (
    <React.Fragment>
      <CssBaseline enableColorScheme />
      {children}
    </React.Fragment>
  );

  return isCSSVarsTheme ? (
    <React.Fragment>
      <InitColorSchemeScript
        attribute={COLOR_SCHEME_ATTRIBUTE}
        colorSchemeStorageKey={COLOR_SCHEME_STORAGE_KEY}
        modeStorageKey={MODE_STORAGE_KEY}
      />
      <CSSVarsThemeProvider theme={theme} window={appWindow}>
        {themeChildren}
      </CSSVarsThemeProvider>
    </React.Fragment>
  ) : (
    <StandardThemeProvider theme={theme}>{themeChildren}</StandardThemeProvider>
  );
}

export { AppThemeProvider };
