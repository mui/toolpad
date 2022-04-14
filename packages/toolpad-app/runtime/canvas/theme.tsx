import { createTheme, ThemeOptions, PaletteOptions } from '@mui/material/styles';
import * as colors from '@mui/material/colors';
import * as appDom from '../../src/appDom';
import { AppTheme } from '../../src/types';

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

  return { palette };
}

export function createToolpadTheme(themeNode?: appDom.ThemeNode | null): ThemeOptions {
  const options = themeNode ? createThemeOptions(appDom.fromConstPropValues(themeNode.theme)) : {};
  return createTheme(options);
}
