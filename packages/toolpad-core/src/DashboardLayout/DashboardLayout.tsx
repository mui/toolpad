import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material';
import { BrandingContext, Navigation, NavigationContext, NavigationPageItem } from '../AppProvider';

const DRAWER_WIDTH = 320;

// @TODO: Remove temporary usePathname once navigation adapter is implemented

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return new URL(window.location.href).pathname;
}

function getServerSnapshot() {
  return '/';
}

function usePathname() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const TOOLPAD_LOGO = (
  <svg width={40} height={40} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g mask="url(#a)">
      <path d="M22.74 27.73v-7.6l6.64-3.79v7.6l-6.64 3.79Z" fill="#007FFF" />
      <path d="M16.1 23.93v-7.59l6.64 3.8v7.59l-6.65-3.8Z" fill="#39F" />
      <path d="m16.1 16.34 6.64-3.8 6.64 3.8-6.64 3.8-6.65-3.8Z" fill="#A5D8FF" />
    </g>
    <mask
      id="b"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x="8"
      y="17"
      width="14"
      height="15"
    >
      <path
        d="M8.5 22.3c0-1.05.56-2 1.46-2.53l3.75-2.14c.89-.5 1.98-.5 2.87 0l3.75 2.14a2.9 2.9 0 0 1 1.46 2.52v4.23c0 1.04-.56 2-1.46 2.52l-3.75 2.14c-.89.5-1.98.5-2.87 0l-3.75-2.14a2.9 2.9 0 0 1-1.46-2.52v-4.23Z"
        fill="#D7DCE1"
      />
    </mask>
    <g mask="url(#b)">
      <path d="M15.14 32v-7.6l6.65-3.8v7.6L15.14 32Z" fill="#007FFF" />
      <path d="M8.5 28.2v-7.6l6.64 3.8V32L8.5 28.2Z" fill="#39F" />
      <path d="m8.5 20.6 6.64-3.79 6.65 3.8-6.65 3.8-6.64-3.8Z" fill="#A5D8FF" />
    </g>
    <mask
      id="c"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x="8"
      y="4"
      width="22"
      height="20"
    >
      <path
        d="M24.17 4.82a2.9 2.9 0 0 0-2.87 0L9.97 11.22a2.9 2.9 0 0 0-1.47 2.53v4.22c0 1.04.56 2 1.46 2.52l3.75 2.14c.89.5 1.98.5 2.87 0l11.33-6.42a2.9 2.9 0 0 0 1.47-2.52V9.48c0-1.04-.56-2-1.46-2.52l-3.75-2.14Z"
        fill="#D7DCE1"
      />
    </mask>
    <g mask="url(#c)">
      <path d="M15.14 23.46v-7.6L29.38 7.8v7.59l-14.24 8.07Z" fill="#007FFF" />
      <path d="M8.5 19.66v-7.6l6.64 3.8v7.6l-6.64-3.8Z" fill="#39F" />
      <path d="M8.5 12.07 22.74 4l6.64 3.8-14.24 8.06-6.64-3.8Z" fill="#A5D8FF" />
    </g>
  </svg>
);

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  '& img': {
    maxHeight: 40,
  },
});

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  basePath?: string;
  depth?: number;
}

function DashboardSidebarSubNavigation({
  subNavigation,
  basePath = '',
  depth = 0,
}: DashboardSidebarSubNavigationProps) {
  const pathname = usePathname();

  const initialExpandedSidebarItemIds = React.useMemo(
    () =>
      subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            (!navigationItem.kind || navigationItem.kind === 'page') &&
            navigationItem.children &&
            navigationItem.children.some((nestedNavigationItem) => {
              const navigationItemFullPath = `${basePath}${(nestedNavigationItem as NavigationPageItem).path ?? ''}`;

              return (
                (!nestedNavigationItem.kind || nestedNavigationItem.kind === 'page') &&
                navigationItemFullPath === pathname
              );
            }),
        )
        .map(
          ({ navigationItem, originalIndex }) =>
            `${(navigationItem as NavigationPageItem).title}-${depth}-${originalIndex}`,
        ),
    [basePath, depth, pathname, subNavigation],
  );

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(
    initialExpandedSidebarItemIds,
  );

  const handleSidebarItemClick = React.useCallback(
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
    <List sx={{ mb: depth === 0 ? 4 : 1, pl: 2 * depth }}>
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          return (
            <ListSubheader key={`subheader-${depth}-${navigationItemIndex}`} component="div">
              {navigationItem.title}
            </ListSubheader>
          );
        }

        if (navigationItem.kind === 'divider') {
          const nextItem = subNavigation[navigationItemIndex + 1];

          return (
            <Divider
              key={`divider-${depth}-${navigationItemIndex}`}
              sx={{ mt: 1, mb: nextItem.kind === 'header' ? 0 : 1 }}
            />
          );
        }

        const navigationItemFullPath = `${basePath}${navigationItem.path ?? ''}`;

        const navigationItemId = `${navigationItem.title}-${depth}-${navigationItemIndex}`;

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        );

        const listItem = (
          <ListItem>
            <ListItemButton
              selected={pathname === navigationItemFullPath}
              onClick={handleSidebarItemClick(navigationItemId)}
            >
              <ListItemIcon>{navigationItem.icon}</ListItemIcon>
              <ListItemText primary={navigationItem.title} />
              {navigationItem.children ? nestedNavigationCollapseIcon : null}
            </ListItemButton>
          </ListItem>
        );

        return (
          <React.Fragment key={navigationItemId}>
            {navigationItem.path && !navigationItem.children ? (
              <a href={navigationItemFullPath} style={{ color: 'inherit', textDecoration: 'none' }}>
                {listItem}
              </a>
            ) : (
              listItem
            )}

            {navigationItem.children ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
                  basePath={navigationItemFullPath}
                  depth={depth + 1}
                />
              </Collapse>
            ) : null}
          </React.Fragment>
        );
      })}
    </List>
  );
}

DashboardSidebarSubNavigation.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  depth: PropTypes.number,
  /**
   * @ignore
   */
  subNavigation: PropTypes.arrayOf(
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
        path: PropTypes.string,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['header']).isRequired,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['divider']).isRequired,
      }),
    ]).isRequired,
  ).isRequired,
} as any;

interface DashboardLayoutProps {
  children: React.ReactNode;
}
/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/dashboard-layout/)
 *
 * API:
 *
 * - [DashboardLayout API](https://mui.com/toolpad/core/api/dashboard-layout)
 */
function DashboardLayout(props: DashboardLayoutProps) {
  const { children } = props;

  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        color="inherit"
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Stack direction="row" alignItems="center">
              <Box sx={{ mr: 1 }}>
                <LogoContainer>{branding?.logo ?? TOOLPAD_LOGO}</LogoContainer>
              </Box>
              <Typography variant="h6" sx={{ color: (theme) => theme.palette.primary.main }}>
                {branding?.title ?? 'Toolpad'}
              </Typography>
            </Stack>
          </a>
          <Box sx={{ flexGrow: 1 }} />
          {/* <Stack>
                   <IconButton
                     size="large"
                     aria-label="Show new notifications"
                     color="inherit"
                     sx={{
                       border: (theme) => `1px solid ${theme.palette.divider}`,
                     }}
                   >
                     <NotificationsIcon />
                   </IconButton>
                  </Stack> */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box
          component="nav"
          sx={{ overflow: 'auto', pt: navigation[0]?.kind === 'header' ? 0 : 2 }}
        >
          <DashboardSidebarSubNavigation subNavigation={navigation} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth="lg">{children}</Container>
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
   * @ignore
   */
  children: PropTypes.node,
} as any;

export { DashboardLayout };
