import * as React from 'react';
import { createTheme, ThemeOptions, PaletteOptions, Theme, ThemeProvider } from '@mui/material';
import * as colors from '@mui/material/colors';
import * as appDom from '../appDom';
import { AppTheme } from '../types';

export function createThemeOptions(toolpadTheme: AppTheme): ThemeOptions {
  const palette: PaletteOptions = {};
  const primary = toolpadTheme['palette.primary.main'];
  if (primary) {
    palette.primary = (colors as any)[primary];
  }

  const secondary = toolpadTheme['palette.secondary.main'];
  if (secondary) {
    palette.secondary = (colors as any)[secondary];
  }

  const mode = toolpadTheme['palette.mode'];
  if (mode) {
    palette.mode = mode;
  }

  return { palette };
}

export function createToolpadTheme(themeNode?: appDom.ThemeNode | null): Theme {
  const options = themeNode?.theme
    ? createThemeOptions(appDom.fromConstPropValues(themeNode.theme))
    : {};
  return createTheme(options);
}

export interface ThemeProviderProps {
  dom: appDom.AppDom;
  children?: React.ReactNode;
}

export default function AppThemeProvider({ dom, children }: ThemeProviderProps) {
  const theme = React.useMemo(() => {
    const root = appDom.getApp(dom);
    const { themes = [] } = appDom.getChildNodes(dom, root);
    const themeNode = themes.length > 0 ? themes[0] : null;
    return createToolpadTheme(themeNode);
  }, [dom]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
