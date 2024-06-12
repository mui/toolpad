import * as React from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import useLocalStorageState from '@toolpad/utils/hooks/useLocalStorageState';
import type { AppProviderProps } from './AppProvider';

export interface ColorMode {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const ColorModeContext = React.createContext<ColorMode | null>(null);

export type ThemeMode = PaletteMode | 'system';

function usePreferredMode() {
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

export function usePaletteMode() {
  const preferredMode = usePreferredMode();
  const { themeMode, setThemeMode } = useThemeMode();

  return {
    paletteMode: themeMode === 'system' ? preferredMode : themeMode,
    setPaletteMode: setThemeMode as React.Dispatch<React.SetStateAction<PaletteMode>>,
  };
}

interface AppThemeProviderProps {
  children: React.ReactNode;
  themes: NonNullable<AppProviderProps['themes']>;
}

/**
 * @ignore - internal component.
 */
function AppThemeProvider(props: AppThemeProviderProps) {
  const { children, themes } = props;

  const { paletteMode, setPaletteMode } = usePaletteMode();

  const theme = React.useMemo(() => {
    const lightTheme = (themes as { light: Theme }).light;
    const darkTheme = (themes as { dark: Theme }).dark;

    let activeTheme = lightTheme ?? darkTheme;
    if (lightTheme && darkTheme) {
      activeTheme = paletteMode === 'dark' ? darkTheme : lightTheme;
    }

    return activeTheme;
  }, [paletteMode, themes]);

  const colorMode = React.useMemo(
    () => ({
      mode: paletteMode,
      toggleMode: () => {
        setPaletteMode((prevMode: PaletteMode) => (prevMode === 'dark' ? 'light' : 'dark'));
      },
    }),
    [paletteMode, setPaletteMode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export { AppThemeProvider };
