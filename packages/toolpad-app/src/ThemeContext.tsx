import * as React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material/utils';
import { getDesignTokens, getThemedComponents, getMetaThemeColor } from './theme';

interface ThemeProviderProps {
  children?: React.ReactNode;
}

export type PaletteModeOptions = 'light' | 'dark';

export const DispatchContext = React.createContext<
  React.Dispatch<React.SetStateAction<PaletteModeOptions>>
>(() => {
  throw new Error('Forgot to wrap component in `ThemeProvider`');
});

export function ThemeProvider(props: ThemeProviderProps) {
  const { children } = props;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const preferredMode = prefersDarkMode ? 'dark' : 'light';
  const [paletteMode, setPaletteMode] = React.useState<PaletteModeOptions>(preferredMode);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPaletteMode(
        JSON.parse(localStorage.getItem('paletteMode') as PaletteModeOptions) || preferredMode,
      );
    }
  }, [preferredMode]);

  React.useEffect(() => {
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => {
      meta.setAttribute('content', getMetaThemeColor(paletteMode));
    });
  }, [paletteMode]);

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

  useEnhancedEffect(() => {
    if (theme.palette.mode === 'dark') {
      document.body.classList.remove('mode-light');
      document.body.classList.add('mode-dark');
    } else {
      document.body.classList.remove('mode-dark');
      document.body.classList.add('mode-light');
    }
  }, [theme.palette.mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <DispatchContext.Provider value={setPaletteMode}>{children}</DispatchContext.Provider>
    </MuiThemeProvider>
  );
}

export function useChangeTheme() {
  const dispatch = React.useContext(DispatchContext);
  return React.useCallback((mode: PaletteModeOptions) => dispatch(mode), [dispatch]);
}
