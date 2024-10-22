'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme, type Theme, SxProps } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import type {} from '@mui/material/themeCssVarsAugmentation';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Link } from '../shared/Link';
import { BrandingContext, NavigationContext, WindowContext } from '../shared/context';
import type { Navigation } from '../AppProvider';
import { Account, type AccountProps } from '../Account';
import {
  getItemPath,
  getItemTitle,
  hasSelectedNavigationChildren,
  isPageItem,
} from '../shared/navigation';
import { useApplicationTitle } from '../shared/branding';
import { ToolbarActions } from './ToolbarActions';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ToolpadLogo } from './ToolpadLogo';
import { useActivePage } from '../useActivePage';

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

const getDrawerSxTransitionMixin = (isExpanded: boolean, property: string) => ({
  transition: (theme: Theme) =>
    theme.transitions.create(property, {
      easing: theme.transitions.easing.sharp,
      duration: isExpanded
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    }),
});

const getDrawerWidthTransitionMixin = (isExpanded: boolean) => ({
  ...getDrawerSxTransitionMixin(isExpanded, 'width'),
  overflowX: 'hidden',
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
    '& .MuiAvatar-root': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTouchRipple-child': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
  },
  '& .MuiSvgIcon-root': {
    color: (theme.vars ?? theme).palette.action.active,
  },
  '& .MuiAvatar-root': {
    backgroundColor: (theme.vars ?? theme).palette.action.active,
  },
}));

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isFullyExpanded?: boolean;
  hasDrawerTransitions?: boolean;
}

function DashboardSidebarSubNavigation({
  subNavigation,
  depth = 0,
  onLinkClick,
  isMini = false,
  isFullyExpanded = true,
  hasDrawerTransitions = false,
}: DashboardSidebarSubNavigationProps) {
  const navigationContext = React.useContext(NavigationContext);

  const activePage = useActivePage();

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
            !!activePage &&
            hasSelectedNavigationChildren(navigationContext, navigationItem, activePage.path),
        )
        .map(({ originalIndex }) => `${depth}-${originalIndex}`),
    [activePage, depth, navigationContext, subNavigation],
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
                height: isMini ? 0 : 40,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'height')
                  : {}),
                px: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 2,
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
                mx: 1,
                mt: 1,
                mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'margin')
                  : {}),
              }}
            />
          );
        }

        const navigationItemFullPath = getItemPath(navigationContext, navigationItem);
        const navigationItemId = `${depth}-${navigationItemIndex}`;
        const navigationItemTitle = getItemTitle(navigationItem);

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        );

        const listItemIconSize = 34;

        const isSelected =
          !!activePage && activePage.path === getItemPath(navigationContext, navigationItem);

        const listItem = (
          <ListItem
            sx={{
              py: 0,
              px: 1,
              overflowX: 'hidden',
            }}
          >
            <NavigationListItemButton
              selected={isSelected && (!navigationItem.children || isMini)}
              sx={{
                px: 1.4,
                height: 48,
              }}
              {...(navigationItem.children && !isMini
                ? {
                    onClick: handleOpenFolderClick(navigationItemId),
                  }
                : {
                    LinkComponent: Link,
                    href: navigationItemFullPath,
                    onClick: onLinkClick,
                  })}
            >
              {navigationItem.icon || isMini ? (
                <ListItemIcon
                  sx={{
                    minWidth: listItemIconSize,
                    mr: 1.2,
                  }}
                >
                  {navigationItem.icon ?? null}
                  {!navigationItem.icon && isMini ? (
                    <Avatar
                      sx={{
                        width: listItemIconSize - 7,
                        height: listItemIconSize - 7,
                        fontSize: 12,
                        ml: '-2px',
                      }}
                    >
                      {navigationItemTitle
                        .split(' ')
                        .slice(0, 2)
                        .map((itemTitleWord) => itemTitleWord.charAt(0).toUpperCase())}
                    </Avatar>
                  ) : null}
                </ListItemIcon>
              ) : null}
              <ListItemText
                primary={navigationItemTitle}
                sx={{
                  whiteSpace: 'nowrap',
                  zIndex: 1,
                  '& .MuiTypography-root': {
                    fontWeight: '500',
                  },
                }}
              />
              {navigationItem.action && !isMini && isFullyExpanded ? navigationItem.action : null}
              {navigationItem.children && !isMini && isFullyExpanded
                ? nestedNavigationCollapseIcon
                : null}
            </NavigationListItemButton>
          </ListItem>
        );

        return (
          <React.Fragment key={navigationItemId}>
            {isMini ? (
              <Tooltip title={navigationItemTitle} placement="right">
                {listItem}
              </Tooltip>
            ) : (
              listItem
            )}

            {navigationItem.children && !isMini ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
                  depth={depth + 1}
                  onLinkClick={onLinkClick}
                />
              </Collapse>
            ) : null}
          </React.Fragment>
        );
      })}
    </List>
  );
}

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
   * Whether the sidebar should start collapsed in desktop size screens.
   * @default false
   */
  defaultSidebarCollapsed?: boolean;
  /**
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default false
   */
  disableCollapsibleSidebar?: boolean;
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
    defaultSidebarCollapsed = false,
    disableCollapsibleSidebar = false,
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
    setIsMobileNavigationExpanded(false);
  }, [setIsMobileNavigationExpanded]);

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
        signInLabel: PropTypes.string.isRequired,
        signOutLabel: PropTypes.string.isRequired,
      }),
      slotProps: PropTypes.shape({
        iconButton: PropTypes.object,
        signInButton: PropTypes.object,
        signOutButton: PropTypes.object,
      }),
      slots: PropTypes.shape({
        menuItems: PropTypes.elementType,
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
