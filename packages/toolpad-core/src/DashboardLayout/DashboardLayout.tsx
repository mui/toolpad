'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { PaletteMode, styled, useTheme } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {} from '@mui/material/themeCssVarsAugmentation';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import useSsr from '@toolpad/utils/hooks/useSsr';
import { Link } from '../shared/Link';
import {
  BrandingContext,
  NavigationContext,
  PaletteModeContext,
  RouterContext,
  WindowContext,
} from '../shared/context';
import type { AppProviderProps, Navigation, NavigationPageItem } from '../AppProvider';
import { ToolpadLogo } from './ToolpadLogo';
import { getItemTitle, isPageItem } from '../shared/navigation';

const DRAWER_WIDTH = 320; // px

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  '& img': {
    maxHeight: 40,
  },
});

const NavigationListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTypography-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiSvgIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTouchRipple-child': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
  },
  '& .MuiSvgIcon-root': {
    color: (theme.vars ?? theme).palette.action.active,
  },
}));

interface ThemeSwitcherProps {
  value?: PaletteMode;
  onChange?: (mode: PaletteMode) => void;
}

function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  const isSsr = useSsr();
  const theme = useTheme();

  const paletteModeContext = React.useContext(PaletteModeContext);

  const paletteMode = value ?? paletteModeContext.paletteMode;
  const setPaletteMode = onChange ?? paletteModeContext.setPaletteMode;
  const isDualTheme = !!onChange ?? paletteModeContext.isDualTheme;

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
            padding: 1,
          }}
        >
          {theme.getColorSchemeSelector ? (
            <React.Fragment>
              <DarkModeIcon
                sx={{
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
          ) : null}
          {!theme.getColorSchemeSelector ? (
            <React.Fragment>
              {isSsr || paletteMode !== 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
            </React.Fragment>
          ) : null}
        </IconButton>
      </div>
    </Tooltip>
  ) : null;
}

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  basePath?: string;
  depth?: number;
  onSidebarItemClick?: (item: NavigationPageItem) => void;
}

function DashboardSidebarSubNavigation({
  subNavigation,
  basePath = '',
  depth = 0,
  onSidebarItemClick,
}: DashboardSidebarSubNavigationProps) {
  const routerContext = React.useContext(RouterContext);

  const pathname = routerContext?.pathname ?? '/';

  const initialExpandedSidebarItemIds = React.useMemo(
    () =>
      subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            isPageItem(navigationItem) &&
            navigationItem.children &&
            navigationItem.children.some((nestedNavigationItem) => {
              if (!isPageItem(nestedNavigationItem)) {
                return false;
              }
              const navigationItemFullPath = `${basePath}/${nestedNavigationItem.segment ?? ''}`;

              return navigationItemFullPath === pathname;
            }),
        )
        .map(({ originalIndex }) => `${depth}-${originalIndex}`),
    [basePath, depth, pathname, subNavigation],
  );

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(
    initialExpandedSidebarItemIds,
  );

  const handleOpenFolderClick = React.useCallback(
    (itemId: string) => () => {
      setExpandedSidebarItemIds((previousValue) =>
        previousValue.includes(itemId)
          ? previousValue.filter((previousValueItemId) => previousValueItemId !== itemId)
          : [...previousValue, itemId],
      );
    },
    [],
  );

  return (
    <List sx={{ padding: 0, mb: depth === 0 ? 4 : 1, pl: 2 * depth }}>
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          return (
            <ListSubheader
              key={`subheader-${depth}-${navigationItemIndex}`}
              component="div"
              sx={{
                fontSize: 12,
                fontWeight: '700',
                height: 40,
                pl: 4,
              }}
            >
              {getItemTitle(navigationItem)}
            </ListSubheader>
          );
        }

        if (navigationItem.kind === 'divider') {
          const nextItem = subNavigation[navigationItemIndex + 1];

          return (
            <Divider
              key={`divider-${depth}-${navigationItemIndex}`}
              sx={{
                borderBottomWidth: 2,
                mx: 2,
                mt: 1,
                mb: nextItem?.kind === 'header' ? 0 : 1,
              }}
            />
          );
        }

        const navigationItemFullPath = `${basePath}/${navigationItem.segment ?? ''}`;

        const navigationItemId = `${depth}-${navigationItemIndex}`;

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        );

        const listItem = (
          <ListItem sx={{ pt: 0, pb: 0 }}>
            <NavigationListItemButton
              selected={pathname === navigationItemFullPath}
              {...(navigationItem.children
                ? {
                    onClick: handleOpenFolderClick(navigationItemId),
                  }
                : {
                    LinkComponent: Link,
                    href: navigationItemFullPath,
                  })}
            >
              {navigationItem.icon ? (
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                  }}
                >
                  {navigationItem.icon}
                </ListItemIcon>
              ) : null}
              <ListItemText
                primary={getItemTitle(navigationItem)}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: '500',
                  },
                }}
              />
              {navigationItem.children ? nestedNavigationCollapseIcon : null}
            </NavigationListItemButton>
          </ListItem>
        );

        return (
          <React.Fragment key={navigationItemId}>
            {listItem}

            {navigationItem.children ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
                  basePath={navigationItemFullPath}
                  depth={depth + 1}
                  onSidebarItemClick={onSidebarItemClick}
                />
              </Collapse>
            ) : null}
          </React.Fragment>
        );
      })}
    </List>
  );
}

export interface DashboardLayoutProps {
  /**
   * The content of the dashboard.
   */
  children: React.ReactNode;
  /**
   * Branding options for the layout.
   * @default null
   */
  branding?: AppProviderProps['branding'];
  /**
   * Navigation definition for the layout.
   * @default []
   */
  navigation?: AppProviderProps['navigation'];
  /**
   * Active palette mode in theme.
   */
  paletteMode?: PaletteMode;
  /**
   * Function to run when the theme switcher is toggled.
   */
  setPaletteMode?: (theme: PaletteMode) => void;
  /**
   * The window where the layout is rendered.
   * This is needed when rendering the layout inside an iframe, for example.
   * @default window
   */
  window?: AppProviderProps['window'];
}

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [DashboardLayout API](https://mui.com/toolpad/core/api/dashboard-layout)
 */
function DashboardLayout(props: DashboardLayoutProps) {
  const {
    children,
    paletteMode,
    setPaletteMode,
    branding: brandingProp,
    navigation: navigationProp,
    window: windowProp,
  } = props;

  const brandingContext = React.useContext(BrandingContext);
  const navigationContext = React.useContext(NavigationContext);
  const windowContext = React.useContext(WindowContext);

  const branding = brandingProp ?? brandingContext;
  const navigation = navigationProp ?? navigationContext;
  const appWindow = windowProp ?? windowContext;

  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = React.useState(false);

  const handleSetMobileNavigationOpen = React.useCallback(
    (newOpen: boolean) => () => {
      setIsMobileNavigationOpen(newOpen);
    },
    [],
  );

  const toggleMobileNavigation = React.useCallback(() => {
    setIsMobileNavigationOpen((previousOpen) => !previousOpen);
  }, []);

  const handleNavigationItemClick = React.useCallback((item: NavigationPageItem) => {
    if (!item.children) {
      setIsMobileNavigationOpen(false);
    }
  }, []);

  const drawerContent = (
    <React.Fragment>
      <Toolbar />
      <Box component="nav" sx={{ overflow: 'auto', pt: navigation[0]?.kind === 'header' ? 0 : 2 }}>
        <DashboardSidebarSubNavigation
          subNavigation={navigation}
          onSidebarItemClick={handleNavigationItemClick}
        />
      </Box>
    </React.Fragment>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar color="inherit" position="fixed">
        <Toolbar sx={{ backgroundColor: 'inherit' }}>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Tooltip
              title={`${isMobileNavigationOpen ? 'Close' : 'Open'} menu`}
              placement="right"
              enterDelay={1000}
            >
              <div>
                <IconButton
                  aria-label={`${isMobileNavigationOpen ? 'Close' : 'Open'} navigation menu`}
                  onClick={toggleMobileNavigation}
                  edge="start"
                  sx={{ ml: 0 }}
                >
                  {isMobileNavigationOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
              </div>
            </Tooltip>
          </Box>
          <Box
            sx={{
              position: { xs: 'absolute', md: 'static' },
              left: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(-50%)', md: 'none' },
            }}
          >
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center">
                <LogoContainer>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoContainer>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) => (theme.vars ?? theme).palette.primary.main,
                    fontWeight: '700',
                  }}
                >
                  {branding?.title ?? 'Toolpad'}
                </Typography>
              </Stack>
            </a>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeSwitcher value={paletteMode} onChange={setPaletteMode} />
        </Toolbar>
      </AppBar>
      <Drawer
        container={appWindow?.document.body}
        variant="temporary"
        open={isMobileNavigationOpen}
        onClose={handleSetMobileNavigationOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundImage: 'none',
            borderRight: (theme) => `1px solid ${(theme.vars ?? theme).palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundImage: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <div>{children}</div>
      </Box>
    </Box>
  );
}

DashboardLayout.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Branding options for the layout.
   * @default null
   */
  branding: PropTypes.shape({
    logo: PropTypes.node,
    title: PropTypes.string,
  }),
  /**
   * The content of the dashboard.
   */
  children: PropTypes.node,
  /**
   * Navigation definition for the layout.
   * @default []
   */
  navigation: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        children: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.shape({
              kind: PropTypes.oneOf(['header']).isRequired,
              title: PropTypes.string.isRequired,
            }),
            PropTypes.shape({
              kind: PropTypes.oneOf(['divider']).isRequired,
            }),
          ]).isRequired,
        ),
        icon: PropTypes.node,
        kind: PropTypes.oneOf(['page']),
        segment: PropTypes.string.isRequired,
        title: PropTypes.string,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['header']).isRequired,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['divider']).isRequired,
      }),
    ]).isRequired,
  ),
  /**
   * Active palette mode in theme.
   */
  paletteMode: PropTypes.oneOf(['dark', 'light']),
  /**
   * Function to run when the theme switcher is toggled.
   */
  setPaletteMode: PropTypes.func,
  /**
   * The window where the layout is rendered.
   * This is needed when rendering the layout inside an iframe, for example.
   * @default window
   */
  window: PropTypes.object,
} as any;

export { DashboardLayout };
