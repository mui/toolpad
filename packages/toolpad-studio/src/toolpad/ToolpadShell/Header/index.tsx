import * as React from 'react';
import { AppBar, Box, Toolbar, Tooltip, Chip, Link, useTheme } from '@mui/material';
import UserFeedback from './UserFeedback';
import ThemeModeMenu from './ThemeModeMenu';
import { useThemeMode, ThemeMode } from '../../../ThemeContext';
import productIconDark from '../../../../public/product-icon-dark.svg';
import productIconLight from '../../../../public/product-icon-light.svg';

export interface HeaderProps {
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  status?: React.ReactNode;
  enableUserFeedback?: boolean;
}

function Header({ navigation, actions, status, enableUserFeedback = true }: HeaderProps) {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  const handleThemeModeChange = React.useCallback(
    (event: React.MouseEvent, mode: ThemeMode) => {
      setThemeMode(mode);
    },
    [setThemeMode],
  );

  const productIcon = theme.palette.mode === 'dark' ? productIconDark : productIconLight;

  return (
    <React.Fragment>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{ zIndex: theme.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'start',
            }}
          >
            <Tooltip title="Home">
              <Link
                color="inherit"
                aria-label="Home"
                href="/"
                underline="none"
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}
              >
                <img src={productIcon} alt="Toolpad product icon" width={25} height={25} />
                <Box
                  data-testid="brand"
                  sx={{
                    color: 'primary.main',
                    lineHeight: '21px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: 0,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Toolpad Studio
                </Box>
              </Link>
            </Tooltip>
            <Chip sx={{ ml: 1 }} label="Beta" size="small" color="grey" />
            {navigation}
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {actions}
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'end',
              gap: 2,
            }}
          >
            {status}
            <ThemeModeMenu mode={themeMode} onChange={handleThemeModeChange} />
            {enableUserFeedback ? <UserFeedback /> : null}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
}

export default Header;
