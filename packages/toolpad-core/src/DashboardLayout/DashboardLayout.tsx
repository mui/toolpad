'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme, type Theme, SxProps } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {} from '@mui/material/themeCssVarsAugmentation';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Link } from '../shared/Link';
import { BrandingContext, NavigationContext, WindowContext } from '../shared/context';
import { Account, type AccountProps } from '../Account';
import { useApplicationTitle } from '../shared/branding';
import { DashboardSidebarSubNavigation } from './DashboardSidebarSubNavigation';
import { ToolbarActions } from './ToolbarActions';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ToolpadLogo } from './ToolpadLogo';
import { getDrawerSxTransitionMixin, getDrawerWidthTransitionMixin } from './utils';

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

export interface SidebarFooterProps {
  mini: boolean;
}

export interface DashboardLayoutSlotProps {
  toolbarActions?: {};
  toolbarAccount?: AccountProps;
  sidebarFooter?: SidebarFooterProps;
}

export interface DashboardLayoutSlots {
  /**
   * The toolbar actions component used in the layout header.
   * @default ToolbarActions
   */
  toolbarActions?: React.JSXElementConstructor<{}>;
  /**
   * The toolbar account component used in the layout header.
   * @default Account
   */
  toolbarAccount?: React.JSXElementConstructor<AccountProps>;
  /**
   * Optional footer component used in the layout sidebar.
   * @default null
   */
  sidebarFooter?: React.JSXElementConstructor<SidebarFooterProps>;
}

export interface DashboardLayoutProps {
  /**
   * The content of the dashboard.
   */
  children: React.ReactNode;
  /**
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default false
   */
  disableCollapsibleSidebar?: boolean;
  /**
   * Whether the sidebar should start collapsed in desktop size screens.
   * @default false
   */
  defaultSidebarCollapsed?: boolean;
  /**
   * Whether the navigation bar and menu icon should be hidden
   * @default false
   */
  hideNavigation?: boolean;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: DashboardLayoutSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: DashboardLayoutSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
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
    disableCollapsibleSidebar = false,
    defaultSidebarCollapsed = false,
    hideNavigation = false,
    slots,
    slotProps,
    sx,
  } = props;

  const theme = useTheme();

  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);
  const appWindow = React.useContext(WindowContext);
  const applicationTitle = useApplicationTitle();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    React.useState(!defaultSidebarCollapsed);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] = React.useState(false);

  const isUnderMdViewport = useMediaQuery(
    theme.breakpoints.down('md'),
    appWindow && {
      matchMedia: appWindow.matchMedia,
    },
  );
  const isOverSmViewport = useMediaQuery(
    theme.breakpoints.up('sm'),
    appWindow && {
      matchMedia: appWindow.matchMedia,
    },
  );

  const isNavigationExpanded = isUnderMdViewport
    ? isMobileNavigationExpanded
    : isDesktopNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isUnderMdViewport) {
        setIsMobileNavigationExpanded(newExpanded);
      } else {
        setIsDesktopNavigationExpanded(newExpanded);
      }
    },
    [isUnderMdViewport],
  );

  const [isNavigationFullyExpanded, setIsNavigationFullyExpanded] =
    React.useState(isNavigationExpanded);

  React.useEffect(() => {
    if (isNavigationExpanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsNavigationFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsNavigationFullyExpanded(false);

    return () => {};
  }, [isNavigationExpanded, theme]);

  const selectedItemIdRef = React.useRef('');

  const handleSetNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setIsNavigationExpanded(newExpanded);
    },
    [setIsNavigationExpanded],
  );

  const toggleNavigationExpanded = React.useCallback(() => {
    setIsNavigationExpanded(!isNavigationExpanded);
  }, [isNavigationExpanded, setIsNavigationExpanded]);

  const handleNavigationLinkClick = React.useCallback(() => {
    selectedItemIdRef.current = '';
    setIsMobileNavigationExpanded(false);
  }, [setIsMobileNavigationExpanded]);

  // If useEffect was used, the reset would also happen on the client render after SSR which we don't need
  React.useMemo(() => {
    if (navigation) {
      selectedItemIdRef.current = '';
    }
  }, [navigation]);

  const isDesktopMini = !disableCollapsibleSidebar && !isDesktopNavigationExpanded;
  const isMobileMini = !disableCollapsibleSidebar && !isMobileNavigationExpanded;

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      const expandMenuActionText = 'Expand';
      const collapseMenuActionText = 'Collapse';

      return (
        <Tooltip
          title={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          enterDelay={1000}
        >
          <div>
            <IconButton
              aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
              onClick={toggleNavigationExpanded}
            >
              {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [toggleNavigationExpanded],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (disableCollapsibleSidebar || !isUnderMdViewport);

  const ToolbarActionsSlot = slots?.toolbarActions ?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? Account;
  const SidebarFooterSlot = slots?.sidebarFooter ?? null;

  const getDrawerContent = React.useCallback(
    (isMini: boolean, viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            pt: navigation[0]?.kind === 'header' && !isMini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isNavigationFullyExpanded, 'padding')
              : {}),
          }}
        >
          <DashboardSidebarSubNavigation
            subNavigation={navigation}
            onLinkClick={handleNavigationLinkClick}
            isMini={isMini}
            isFullyExpanded={isNavigationFullyExpanded}
            hasDrawerTransitions={hasDrawerTransitions}
            selectedItemId={selectedItemIdRef.current}
          />
          {SidebarFooterSlot ? (
            <SidebarFooterSlot mini={isMini} {...slotProps?.sidebarFooter} />
          ) : null}
        </Box>
      </React.Fragment>
    ),
    [
      SidebarFooterSlot,
      handleNavigationLinkClick,
      hasDrawerTransitions,
      isNavigationFullyExpanded,
      navigation,
      slotProps?.sidebarFooter,
    ],
  );

  const getDrawerSharedSx = React.useCallback(
    (isMini: boolean, isTemporary: boolean) => {
      const drawerWidth = isMini ? 64 : 320;

      return {
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: 'absolute',
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        },
      };
    },
    [isNavigationExpanded],
  );

  const layoutRef = React.useRef<Element | null>(null);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
        ...sx,
      }}
    >
      <AppBar color="inherit" position="absolute">
        <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1.5 } }}>
          {!hideNavigation ? (
            <React.Fragment>
              <Box
                sx={{
                  mr: { sm: disableCollapsibleSidebar ? 0 : 1 },
                  display: { md: 'none' },
                }}
              >
                {getMenuIcon(isMobileNavigationExpanded)}
              </Box>
              <Box
                sx={{
                  display: { xs: 'none', md: disableCollapsibleSidebar ? 'none' : 'block' },
                  mr: disableCollapsibleSidebar ? 0 : 1,
                }}
              >
                {getMenuIcon(isDesktopNavigationExpanded)}
              </Box>
            </React.Fragment>
          ) : null}

          <Box
            sx={{
              position: { xs: 'absolute', md: 'static' },
              left: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(-50%)', md: 'none' },
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center">
                <LogoContainer>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoContainer>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme.vars ?? theme).palette.primary.main,
                    fontWeight: '700',
                    ml: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {applicationTitle}
                </Typography>
              </Stack>
            </Link>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}>
            <ToolbarActionsSlot {...slotProps?.toolbarActions} />
            <ThemeSwitcher />
            <ToolbarAccountSlot {...slotProps?.toolbarAccount} />
          </Stack>
        </Toolbar>
      </AppBar>

      {!hideNavigation ? (
        <React.Fragment>
          <Drawer
            container={layoutRef.current}
            variant="temporary"
            open={isMobileNavigationExpanded}
            onClose={handleSetNavigationExpanded(false)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: {
                xs: 'block',
                sm: disableCollapsibleSidebar ? 'block' : 'none',
                md: 'none',
              },
              ...getDrawerSharedSx(false, true),
            }}
          >
            {getDrawerContent(false, 'phone')}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: {
                xs: 'none',
                sm: disableCollapsibleSidebar ? 'none' : 'block',
                md: 'none',
              },
              ...getDrawerSharedSx(isMobileMini, false),
            }}
          >
            {getDrawerContent(isMobileMini, 'tablet')}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              ...getDrawerSharedSx(isDesktopMini, false),
            }}
          >
            {getDrawerContent(isDesktopMini, 'desktop')}
          </Drawer>
        </React.Fragment>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Toolbar />
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
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
   * The content of the dashboard.
   */
  children: PropTypes.node,
  /**
   * Whether the sidebar should start collapsed in desktop size screens.
   * @default false
   */
  defaultSidebarCollapsed: PropTypes.bool,
  /**
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default false
   */
  disableCollapsibleSidebar: PropTypes.bool,
  /**
   * Whether the navigation bar and menu icon should be hidden
   * @default false
   */
  hideNavigation: PropTypes.bool,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    sidebarFooter: PropTypes.shape({
      mini: PropTypes.bool.isRequired,
    }),
    toolbarAccount: PropTypes.shape({
      localeText: PropTypes.shape({
        iconButtonAriaLabel: PropTypes.string,
        signInLabel: PropTypes.string,
        signOutLabel: PropTypes.string,
      }),
      slotProps: PropTypes.shape({
        popover: PropTypes.object,
        popoverContent: PropTypes.object,
        preview: PropTypes.object,
        signInButton: PropTypes.object,
        signOutButton: PropTypes.object,
      }),
      slots: PropTypes.shape({
        popover: PropTypes.elementType,
        popoverContent: PropTypes.elementType,
        preview: PropTypes.elementType,
        signInButton: PropTypes.elementType,
        signOutButton: PropTypes.elementType,
      }),
    }),
    toolbarActions: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    sidebarFooter: PropTypes.elementType,
    toolbarAccount: PropTypes.elementType,
    toolbarActions: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { DashboardLayout };
