import * as React from 'react';
import {
  AppBar,
  Box,
  Collapse,
  Container,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
// Must use named imports or app crashes when the component is imported in a Next.js app
// eslint-disable-next-line no-restricted-imports
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ToolpadLogo from './ToolpadLogo';
import NavigationContext from '../../context/NavigationContext';
import BrandingContext from '../../context/BrandingContext';

const DRAWER_WIDTH = 320;

const LogoBox = styled('div')({
  position: 'relative',
  height: 40,
  marginRight: 4,
  img: {
    maxHeight: 40,
  },
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  hideTitle?: boolean;
}

export default function DashboardLayout({ children, hideTitle = false }: DashboardLayoutProps) {
  const pathname = usePathname();

  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState<string[]>(
    navigation
      .map((navigationSection) =>
        navigationSection.routes
          .filter(
            (route) =>
              !!route.routes && route.routes.some((nestedRoute) => nestedRoute.path === pathname),
          )
          .map((route) => `${navigationSection.title}:${route.label}`),
      )
      .flat(),
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
    <Box sx={{ display: 'flex' }}>
      <AppBar
        color="inherit"
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Stack direction="row" alignItems="center">
              <LogoBox>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoBox>
              {!hideTitle ? (
                <Typography variant="h6" sx={{ color: (theme) => theme.palette.primary.main }}>
                  {branding?.name ?? 'Toolpad'}
                </Typography>
              ) : null}
            </Stack>
          </Link>
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
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box component="nav" sx={{ overflow: 'auto' }}>
          {navigation.map((navigationSection, navigationSectionIndex) => (
            <React.Fragment key={navigationSection.title}>
              {navigationSectionIndex > 0 ? <Divider /> : null}
              <List
                aria-labelledby={navigationSection.title}
                subheader={
                  <ListSubheader id={navigationSection.title}>
                    {navigationSection.title}
                  </ListSubheader>
                }
              >
                {navigationSection.routes.map((route) => {
                  const itemId = `${navigationSection.title}:${route.label}`;
                  const isNestedNavigationExpanded = expandedSidebarItemIds.includes(itemId);

                  const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  );

                  const listItem = (
                    <ListItem sx={{ py: 0 }}>
                      <ListItemButton
                        selected={pathname === route.path}
                        onClick={handleSidebarItemClick(itemId)}
                      >
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.label} />
                        {route.routes ? nestedNavigationCollapseIcon : null}
                      </ListItemButton>
                    </ListItem>
                  );

                  return (
                    <React.Fragment key={route.label}>
                      {route.path ? (
                        <Link
                          href={route.path}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {listItem}
                        </Link>
                      ) : (
                        listItem
                      )}
                      {route.routes ? (
                        <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                          <List sx={{ pl: 4, pr: 2 }}>
                            {route.routes.map((nestedRoute) => (
                              <Link
                                key={nestedRoute.label}
                                href={nestedRoute.path}
                                style={{ color: 'inherit', textDecoration: 'none' }}
                              >
                                <ListItemButton selected={pathname === nestedRoute.path}>
                                  <ListItemIcon>{nestedRoute.icon}</ListItemIcon>
                                  <ListItemText primary={nestedRoute.label} />
                                </ListItemButton>
                              </Link>
                            ))}
                          </List>
                        </Collapse>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </List>
            </React.Fragment>
          ))}
        </Box>
      </Drawer>
      <Box component={'main'} sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}
