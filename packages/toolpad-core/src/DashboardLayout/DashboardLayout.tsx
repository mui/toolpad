'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, Theme } from '@mui/material';
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

const drawerWidthTransitionMixin = {
  transition: (theme: Theme) =>
    theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  overflowX: 'hidden',
};

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

type DashboardSidebarVariant = 'standard' | 'mini';

interface DashboardSidebarSubNavigationProps {
  variant?: DashboardSidebarVariant;
  subNavigation: Navigation;
  basePath?: string;
  depth?: number;
  onLinkClick: () => void;
  isExpanded?: boolean;
  validatedItemIds: Set<string>;
  uniqueItemPaths: Set<string>;
}

function DashboardSidebarSubNavigation({
  variant = 'standard',
  subNavigation,
  basePath = '',
  depth = 0,
  onLinkClick,
  isExpanded = false,
  validatedItemIds,
  uniqueItemPaths,
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

  const isMiniVariant = variant === 'mini';
  const isCollapsedMiniVariant = isMiniVariant && !isExpanded;

  return (
    <List sx={{ padding: 0, mb: depth === 0 ? 4 : 1, pl: 2 * depth }}>
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          if (isCollapsedMiniVariant) {
            return null;
          }

          return (
            <ListSubheader
              key={`subheader-${depth}-${navigationItemIndex}`}
              component="div"
              sx={{
                fontSize: 12,
                fontWeight: '700',
                height: 40,
                px: isMiniVariant ? 3 : 4,
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
                mx: 2,
                mt: 1,
                mb: !isCollapsedMiniVariant && nextItem?.kind === 'header' ? 0 : 1,
              }}
            />
          );
        }

        const navigationItemFullPath = getPageItemFullPath(basePath, navigationItem);

        const navigationItemId = `${depth}-${navigationItemIndex}`;

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        );

        const listItem = (
          <ListItem
            sx={{
              pt: 0,
              pb: 0,
              pl: isMiniVariant ? 1 : undefined,
              pr: isCollapsedMiniVariant ? 1 : undefined,
              overflowX: 'hidden',
            }}
          >
            <NavigationListItemButton
              selected={
                pathname === navigationItemFullPath &&
                (isCollapsedMiniVariant || !navigationItem.children)
              }
              sx={{
                height: 48,
              }}
              {...(!isCollapsedMiniVariant && navigationItem.children
                ? {
                    onClick: handleOpenFolderClick(navigationItemId),
                  }
                : {
                    LinkComponent: Link,
                    href: navigationItemFullPath,
                    onClick: onLinkClick,
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
              {!isCollapsedMiniVariant ? (
                <ListItemText
                  primary={getItemTitle(navigationItem)}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: '500',
                    },
                    zIndex: 1,
                  }}
                />
              ) : null}
              {navigationItem.action ?? null}
              {!isCollapsedMiniVariant && navigationItem.children
                ? nestedNavigationCollapseIcon
                : null}
            </NavigationListItemButton>
          </ListItem>
        );

        if (process.env.NODE_ENV !== 'production' && !validatedItemIds.has(navigationItemId)) {
          if (!uniqueItemPaths.has(navigationItemFullPath)) {
            uniqueItemPaths.add(navigationItemFullPath);
          } else {
            console.warn(`Duplicate path in navigation: ${navigationItemFullPath}`);
          }

          validatedItemIds.add(navigationItemId);
        }

        return (
          <React.Fragment key={navigationItemId}>
            {isCollapsedMiniVariant ? (
              <Tooltip title={getItemTitle(navigationItem)} placement="right">
                {listItem}
              </Tooltip>
            ) : (
              listItem
            )}

            {!isCollapsedMiniVariant && navigationItem.children ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
                  basePath={navigationItemFullPath}
                  depth={depth + 1}
                  onLinkClick={onLinkClick}
                  validatedItemIds={validatedItemIds}
                  uniqueItemPaths={uniqueItemPaths}
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
   * Sidebar variant to use.
   */
  sidebarVariant?: DashboardSidebarVariant;
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
  const { children, sidebarVariant = 'standard', slots, slotProps } = props;

  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);
  const appWindow = React.useContext(WindowContext);
  const applicationTitle = useApplicationTitle();

  const [isNavigationExpanded, setIsNavigationExpanded] = React.useState(false);

  const validatedItemIdsRef = React.useRef(new Set<string>());
  const uniqueItemPathsRef = React.useRef(new Set<string>());

  const handleSetNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setIsNavigationExpanded(newExpanded);
    },
    [],
  );

  const toggleNavigationExpanded = React.useCallback(() => {
    setIsNavigationExpanded((previousOpen) => !previousOpen);
  }, []);

  const handleNavigationLinkClick = React.useCallback(() => {
    setIsNavigationExpanded(false);
  }, []);

  // If useEffect was used, the reset would also happen on the client render after SSR which we don't need
  React.useMemo(() => {
    validatedItemIdsRef.current = new Set();
    uniqueItemPathsRef.current = new Set();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const isMiniSidebarVariant = sidebarVariant === 'mini';
  const isCollapsedMiniSidebarVariant = isMiniSidebarVariant && !isNavigationExpanded;

  const drawerContent = (
    <React.Fragment>
      <Toolbar />
      <Box
        component="nav"
        sx={{
          overflow: 'auto',
          pt: !isCollapsedMiniSidebarVariant && navigation[0]?.kind === 'header' ? 0 : 2,
        }}
      >
        <DashboardSidebarSubNavigation
          variant={sidebarVariant}
          subNavigation={navigation}
          onLinkClick={handleNavigationLinkClick}
          isExpanded={isNavigationExpanded}
          validatedItemIds={validatedItemIdsRef.current}
          uniqueItemPaths={uniqueItemPathsRef.current}
        />
      </Box>
    </React.Fragment>
  );

  const drawerWidth = isCollapsedMiniSidebarVariant ? 74 : 320;

  const expandMenuActionText = isMiniSidebarVariant ? 'Expand' : 'Open';
  const collapseMenuActionText = isMiniSidebarVariant ? 'Collapse' : 'Close';

  const ToolbarActionsSlot = slots?.toolbarActions ?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? Account;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar color="inherit" position="fixed">
        {
          // TODO: (minWidth: 100vw) Temporary fix to issue reported in https://github.com/mui/material-ui/issues/43244
        }
        <Toolbar sx={{ backgroundColor: 'inherit', minWidth: '100vw' }}>
          <Box
            sx={{
              display: { xs: 'block', md: isMiniSidebarVariant ? 'block' : 'none' },
              mr: isMiniSidebarVariant ? 3 : 0,
            }}
          >
            <Tooltip
              title={`${isNavigationExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
              placement="right"
              enterDelay={1000}
            >
              <div>
                <IconButton
                  aria-label={`${isNavigationExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
                  onClick={toggleNavigationExpanded}
                  edge="start"
                  sx={{ ml: isMiniSidebarVariant ? -1 : 0 }}
                >
                  {isNavigationExpanded ? <MenuOpenIcon /> : <MenuIcon />}
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
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center">
                <LogoContainer>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoContainer>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) => (theme.vars ?? theme).palette.primary.main,
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
      {!isMiniSidebarVariant ? (
        <Drawer
          container={appWindow?.document.body}
          variant="temporary"
          open={isNavigationExpanded}
          onClose={handleSetNavigationExpanded(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundImage: 'none',
              borderRight: (theme) => `1px solid ${(theme.vars ?? theme).palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : null}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: !isMiniSidebarVariant ? 'none' : 'block', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          ...drawerWidthTransitionMixin,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundImage: 'none',
            ...drawerWidthTransitionMixin,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // TODO: Temporary fix to issue reported in https://github.com/mui/material-ui/issues/43244
          minWidth: {
            xs: !isMiniSidebarVariant && isNavigationExpanded ? '100vw' : 'auto',
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
