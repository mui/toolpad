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
import { BrandingContext, NavigationContext } from '../AppProvider';

const IS_CLIENT = typeof window !== 'undefined';

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

export function DashboardLayout({ children, hideTitle = false }: DashboardLayoutProps) {
  const branding = React.useContext(BrandingContext);
  const navigation = React.useContext(NavigationContext);

  // Rerender once to update with client-side navigation
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState<string[]>(
    navigation
      .map((navigationSection) =>
        navigationSection.items
          .filter(
            (navigationItem) =>
              !!navigationItem.items &&
              IS_CLIENT &&
              navigationItem.items.some(
                (nestedNavigationItem) => nestedNavigationItem.path === window.location.pathname,
              ),
          )
          .map((navigationItem) => `${navigationSection.title}:${navigationItem.label}`),
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
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Stack direction="row" alignItems="center">
              <LogoBox>{branding?.logo ?? <ToolpadLogo size={40} />}</LogoBox>
              {!hideTitle ? (
                <Typography variant="h6" sx={{ color: (theme) => theme.palette.primary.main }}>
                  {branding?.name ?? 'Toolpad'}
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
                  <ListSubheader component="div" id={navigationSection.title}>
                    {navigationSection.title}
                  </ListSubheader>
                }
              >
                {navigationSection.items.map((navigationItem) => {
                  const itemId = `${navigationSection.title}:${navigationItem.label}`;
                  const isNestedNavigationExpanded = expandedSidebarItemIds.includes(itemId);

                  const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  );

                  const listItem = (
                    <ListItem sx={{ py: 0 }}>
                      <ListItemButton
                        selected={
                          IS_CLIENT &&
                          hasMounted &&
                          window.location.pathname === navigationItem.path
                        }
                        onClick={handleSidebarItemClick(itemId)}
                      >
                        <ListItemIcon>{navigationItem.icon}</ListItemIcon>
                        <ListItemText primary={navigationItem.label} />
                        {navigationItem.items ? nestedNavigationCollapseIcon : null}
                      </ListItemButton>
                    </ListItem>
                  );

                  return (
                    <React.Fragment key={navigationItem.label}>
                      {navigationItem.path ? (
                        <a
                          href={navigationItem.path}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {listItem}
                        </a>
                      ) : (
                        listItem
                      )}
                      {hasMounted && navigationItem.items ? (
                        <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                          <List sx={{ pl: 4, pr: 2 }}>
                            {navigationItem.items.map((nestedNavigationItem) => (
                              <a
                                key={nestedNavigationItem.label}
                                href={nestedNavigationItem.path}
                                style={{ color: 'inherit', textDecoration: 'none' }}
                              >
                                <ListItemButton
                                  selected={
                                    IS_CLIENT &&
                                    hasMounted &&
                                    window.location.pathname === nestedNavigationItem.path
                                  }
                                >
                                  <ListItemIcon>{nestedNavigationItem.icon}</ListItemIcon>
                                  <ListItemText primary={nestedNavigationItem.label} />
                                </ListItemButton>
                              </a>
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
      <Box component={'main'} sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}
