import * as React from 'react';
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
import { styled } from '@mui/system';
import ToolpadLogo from './ToolpadLogo';
import { BrandingContext, Navigation, NavigationContext, NavigationPageItem } from '../AppProvider';

const IS_CLIENT = typeof window !== 'undefined';

const DEFAULT_DRAWER_WIDTH = 320;

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  img: {
    maxHeight: 40,
  },
});

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
}

function DashboardSidebarSubNavigation({
  subNavigation,
  depth = 0,
}: DashboardSidebarSubNavigationProps) {
  // Rerender once to update with client-side navigation
  const [hasMounted, setHasMounted] = React.useState(false);

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setHasMounted(true);

    if (IS_CLIENT) {
      const initialExpandedSidebarItemIds = subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            (!navigationItem.kind || navigationItem.kind === 'page') &&
            navigationItem.children &&
            navigationItem.children.some(
              (nestedNavigationItem) =>
                (!nestedNavigationItem.kind || nestedNavigationItem.kind === 'page') &&
                nestedNavigationItem.path === window.location.pathname,
            ),
        )
        .map(
          ({ navigationItem, originalIndex }) =>
            `${(navigationItem as NavigationPageItem).title}-${depth}-${originalIndex}`,
        );

      setExpandedSidebarItemIds(initialExpandedSidebarItemIds);
    }
  }, [depth, subNavigation]);

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
              selected={IS_CLIENT && hasMounted && window.location.pathname === navigationItem.path}
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
            {navigationItem.path ? (
              <a href={navigationItem.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                {listItem}
              </a>
            ) : (
              listItem
            )}
            {IS_CLIENT && hasMounted && navigationItem.children ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
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

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarWidth?: number;
  hideTitle?: boolean;
}

export function DashboardLayout({
  children,
  sidebarWidth = DEFAULT_DRAWER_WIDTH,
  hideTitle = false,
}: DashboardLayoutProps) {
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
                <LogoContainer>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoContainer>
              </Box>
              {!hideTitle ? (
                <Typography variant="h6" sx={{ color: (theme) => theme.palette.primary.main }}>
                  {branding?.title ?? 'Toolpad'}
                </Typography>
              ) : null}
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
          width: sidebarWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarWidth,
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
