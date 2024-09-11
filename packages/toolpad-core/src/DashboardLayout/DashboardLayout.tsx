'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme, type Theme } from '@mui/material';
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
import {
  BrandingContext,
  NavigationContext,
  RouterContext,
  WindowContext,
} from '../shared/context';
import type { Navigation } from '../AppProvider';
import { Account, type AccountProps } from '../Account';
import {
  getItemTitle,
  getPageItemFullPath,
  hasSelectedNavigationChildren,
  isPageItemSelected,
} from '../shared/navigation';
import { useApplicationTitle } from '../shared/branding';
import { ToolbarActions } from './ToolbarActions';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ToolpadLogo } from './ToolpadLogo';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  // TODO: Temporary fix to issue reported in https://github.com/mui/material-ui/issues/43244
  left: 0,
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
  basePath?: string;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isFullyExpanded?: boolean;
  selectedItemId: string;
}

function DashboardSidebarSubNavigation({
  subNavigation,
  basePath = '',
  depth = 0,
  onLinkClick,
  isMini = false,
  isFullyExpanded = true,
  selectedItemId,
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
        .filter(({ navigationItem }) =>
          hasSelectedNavigationChildren(navigationItem, basePath, pathname),
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
                height: isMini ? 0 : 40,
                ...getDrawerSxTransitionMixin(isFullyExpanded, 'height'),
                px: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
              }}
            />
          );
        }

        const navigationItemFullPath = getPageItemFullPath(basePath, navigationItem);
        const navigationItemId = `${depth}-${navigationItemIndex}`;
        const navigationItemTitle = getItemTitle(navigationItem);

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        );

        const listItemIconSize = 34;

        const isSelected = isPageItemSelected(navigationItem, basePath, pathname);

        if (process.env.NODE_ENV !== 'production' && isSelected && selectedItemId) {
          console.warn(`Duplicate selected path in navigation: ${navigationItemFullPath}`);
        }

        if (isSelected && !selectedItemId) {
          selectedItemId = navigationItemId;
        }

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
                  basePath={navigationItemFullPath}
                  depth={depth + 1}
                  onLinkClick={onLinkClick}
                  selectedItemId={selectedItemId}
                />
              </Collapse>
            ) : null}
          </React.Fragment>
        );
      })}
    </List>
  );
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
   * The components used for each slot inside.
   * @default {}
   */
  slots?: DashboardLayoutSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    toolbarActions?: {};
    toolbarAccount?: AccountProps;
  };
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
  const { children, disableCollapsibleSidebar = false, slots, slotProps } = props;

  const theme = useTheme();

  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);
  const appWindow = React.useContext(WindowContext);
  const applicationTitle = useApplicationTitle();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] = React.useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] = React.useState(false);

  const isMobileViewport = useMediaQuery(theme.breakpoints.down('md'));

  const isNavigationExpanded = isMobileViewport
    ? isMobileNavigationExpanded
    : isDesktopNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isMobileViewport) {
        setIsMobileNavigationExpanded(newExpanded);
      } else {
        setIsDesktopNavigationExpanded(newExpanded);
      }
    },
    [isMobileViewport],
  );

  const [isNavigationFullyExpanded, setIsNavigationFullyExpanded] =
    React.useState(isNavigationExpanded);

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (isNavigationExpanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsNavigationFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsNavigationFullyExpanded(false);
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
    selectedItemIdRef.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              edge="start"
              sx={{
                ml: { xs: -0.75, sm: -1.5 },
              }}
            >
              {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [toggleNavigationExpanded],
  );

  const getDrawerContent = React.useCallback(
    (isMini: boolean) => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          sx={{
            overflow: 'auto',
            pt: navigation[0]?.kind === 'header' && !isMini ? 0 : 2,
            ...getDrawerSxTransitionMixin(isNavigationFullyExpanded, 'padding'),
          }}
        >
          <DashboardSidebarSubNavigation
            subNavigation={navigation}
            onLinkClick={handleNavigationLinkClick}
            isMini={isMini}
            isFullyExpanded={isNavigationFullyExpanded}
            selectedItemId={selectedItemIdRef.current}
          />
        </Box>
      </React.Fragment>
    ),
    [handleNavigationLinkClick, isNavigationFullyExpanded, navigation],
  );

  const getDrawerSharedSx = React.useCallback(
    (isMini: boolean) => {
      const drawerWidth = isMini ? 64 : 320;

      return {
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        },
      };
    },
    [isNavigationExpanded],
  );

  const ToolbarActionsSlot = slots?.toolbarActions ?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? Account;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar color="inherit" position="fixed">
        {
          // TODO: (minWidth: 100vw) Temporary fix to issue reported in https://github.com/mui/material-ui/issues/43244
        }
        <Toolbar sx={{ backgroundColor: 'inherit', minWidth: '100vw' }}>
          {isMobileViewport ? (
            <React.Fragment>
              <Box
                sx={{
                  display: {
                    xs: 'block',
                    sm: disableCollapsibleSidebar ? 'block' : 'none',
                  },
                }}
              >
                {getMenuIcon(isMobileNavigationExpanded)}
              </Box>
              <Box
                sx={{
                  display: {
                    xs: 'none',
                    sm: disableCollapsibleSidebar ? 'none' : 'block',
                  },
                  mr: disableCollapsibleSidebar ? 0 : 3,
                }}
              >
                {getMenuIcon(isMobileNavigationExpanded)}
              </Box>
            </React.Fragment>
          ) : (
            <Box
              sx={{
                display: disableCollapsibleSidebar ? 'none' : 'block',
                mr: disableCollapsibleSidebar ? 0 : 3,
              }}
            >
              {getMenuIcon(isDesktopNavigationExpanded)}
            </Box>
          )}

          <Box
            sx={{
              ml: { xs: undefined, sm: -1.5 },
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
          <ToolbarActionsSlot {...slotProps?.toolbarActions} />
          <ThemeSwitcher />
          <ToolbarAccountSlot {...slotProps?.toolbarAccount} />
        </Toolbar>
      </AppBar>
      {isMobileViewport ? (
        <React.Fragment>
          <Drawer
            container={appWindow?.document.body}
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
              },
              ...getDrawerSharedSx(isMobileMini),
            }}
          >
            {getDrawerContent(isMobileMini)}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: {
                xs: 'none',
                sm: disableCollapsibleSidebar ? 'none' : 'block',
              },
              ...getDrawerSharedSx(isMobileMini),
            }}
          >
            {getDrawerContent(isMobileMini)}
          </Drawer>
        </React.Fragment>
      ) : (
        <Drawer variant="permanent" sx={getDrawerSharedSx(isDesktopMini)}>
          {getDrawerContent(isDesktopMini)}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // TODO: Temporary fix to issue reported in https://github.com/mui/material-ui/issues/43244
          minWidth: {
            xs: disableCollapsibleSidebar && isNavigationExpanded ? '100vw' : 'auto',
            md: 'auto',
          },
        }}
      >
        <Toolbar />
        {children}
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
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default false
   */
  disableCollapsibleSidebar: PropTypes.bool,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    toolbarAccount: PropTypes.shape({
      signInLabel: PropTypes.string,
      signOutLabel: PropTypes.string,
      slotProps: PropTypes.shape({
        avatar: PropTypes.object,
        iconButton: PropTypes.object,
        signInButton: PropTypes.object,
        signOutButton: PropTypes.object,
      }),
    }),
    toolbarActions: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    toolbarAccount: PropTypes.elementType,
    toolbarActions: PropTypes.elementType,
  }),
} as any;

export { DashboardLayout };
