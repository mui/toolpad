'use client';
import * as React from 'react';
import { useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import useSsr from '@toolpad/utils/hooks/useSsr';
import { PaletteModeContext } from '../shared/context';

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [ThemeSwitcher API](https://mui.com/toolpad/core/api/theme-switcher)
 */
function ThemeSwitcher() {
  const isSsr = useSsr();
  const theme = useTheme();

  const { paletteMode, setPaletteMode, isDualTheme } = React.useContext(PaletteModeContext);

  const toggleMode = React.useCallback(() => {
    setPaletteMode(paletteMode === 'dark' ? 'light' : 'dark');
  }, [paletteMode, setPaletteMode]);

  return isDualTheme ? (
    <Tooltip
      title={isSsr ? 'Switch mode' : `${paletteMode === 'dark' ? 'Light' : 'Dark'} mode`}
      enterDelay={1000}
    >
      <div>
        <IconButton
          aria-label={
            isSsr
              ? 'Switch theme mode'
              : `Switch to ${paletteMode === 'dark' ? 'light' : 'dark'} mode`
          }
          onClick={toggleMode}
          sx={{
            color: (theme.vars ?? theme).palette.primary.dark,
          }}
        >
          {theme.getColorSchemeSelector ? (
            <React.Fragment>
              <DarkModeIcon
                sx={{
                  display: 'inline',
                  [theme.getColorSchemeSelector('dark')]: {
                    display: 'none',
                  },
                }}
              />
              <LightModeIcon
                sx={{
                  display: 'none',
                  [theme.getColorSchemeSelector('dark')]: {
                    display: 'inline',
                  },
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              {isSsr || paletteMode !== 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
            </React.Fragment>
          )}
        </IconButton>
      </div>
    </Tooltip>
  ) : null;
}

export { ThemeSwitcher };
