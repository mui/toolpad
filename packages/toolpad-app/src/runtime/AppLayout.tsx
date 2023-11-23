import * as React from 'react';
import {
  Box,
  Drawer,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  CircularProgress,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useSearchParams } from 'react-router-dom';
import { PREVIEW_HEADER_HEIGHT } from './constants';
import { AuthProvider, SessionContext } from './useSession';

const TOOLPAD_DISPLAY_MODE_URL_PARAM = 'toolpad-display';

// Url params that will be carried over to the next page
const RETAINED_URL_PARAMS = new Set([TOOLPAD_DISPLAY_MODE_URL_PARAM]);

export interface NavigationEntry {
  slug: string;
  displayName: string;
  hasShell?: boolean;
}

const DRAWER_WIDTH = 250; // px

interface AppPagesNavigationProps {
  activePageSlug?: string;
  pages: NavigationEntry[];
  clipped?: boolean;
  hasHeader?: boolean;
  search?: string;
}

function AppPagesNavigation({
  activePageSlug,
  pages,
  clipped = false,
  hasHeader = true,
  search,
}: AppPagesNavigationProps) {
  const navListSubheaderId = React.useId();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {clipped ? <Box sx={{ height: PREVIEW_HEADER_HEIGHT }} /> : null}
      {hasHeader ? <Toolbar variant="dense" /> : null}
      <List component="nav" aria-labelledby={navListSubheaderId}>
        {pages.map((page) => (
          <ListItem key={page.slug} disablePadding>
            <ListItemButton
              component={Link}
              to={`pages/${page.slug}${search}`}
              selected={activePageSlug === page.slug}
            >
              <ListItemText
                primary={page.displayName}
                primaryTypographyProps={{ fontSize: '14px' }}
                sx={{ ml: 2 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export interface ToolpadAppLayoutProps {
  activePageSlug?: string;
  pages?: NavigationEntry[];
  hasNavigation?: boolean;
  hasHeader?: boolean;
  children?: React.ReactNode;
  clipped?: boolean;
}

export function AppLayout({
  activePageSlug,
  pages = [],
  hasNavigation: hasNavigationProp = true,
  hasHeader: hasHeaderProp = true,
  children,
  clipped,
}: ToolpadAppLayoutProps) {
  const theme = useTheme();

  const [urlParams] = useSearchParams();

  const retainedSearch = React.useMemo(() => {
    for (const name of urlParams.keys()) {
      if (!RETAINED_URL_PARAMS.has(name)) {
        urlParams.delete(name);
      }
    }

    return urlParams.size > 0 ? `?${urlParams.toString()}` : '';
  }, [urlParams]);

  const navEntry = pages.find((page) => page.slug === activePageSlug);

  const displayMode = urlParams.get(TOOLPAD_DISPLAY_MODE_URL_PARAM);

  const hasShell = navEntry?.hasShell !== false && displayMode !== 'standalone';

  const hasNavigation = hasNavigationProp && hasShell;
  const hasHeader = hasHeaderProp && hasShell;

  const {
    session,
    signIn,
    signOut,
    isLoading: isSessionLoading,
  } = React.useContext(SessionContext);

  const [anchorElSignIn, setAnchorElSignIn] = React.useState<null | HTMLElement>(null);
  const handleOpenSignInMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSignIn(event.currentTarget);
  };
  const handleCloseSignInMenu = () => {
    setAnchorElSignIn(null);
  };

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignIn = React.useCallback(
    (provider: AuthProvider) => () => {
      signIn(provider);
      handleCloseSignInMenu();
    },
    [signIn],
  );

  const handleSignOut = React.useCallback(() => {
    signOut();
    handleCloseUserMenu();
  }, [signOut]);

  const activePageDisplayName = React.useMemo(
    () => pages.find((page) => page.slug === activePageSlug)?.displayName ?? '',
    [activePageSlug, pages],
  );

  return (
    <React.Fragment>
      {hasHeader ? (
        <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar variant="dense">
            <Typography variant="h6" noWrap sx={{ ml: 1 }}>
              {activePageDisplayName}
            </Typography>
            <Stack flex={1} direction="row" alignItems="center" justifyContent="end">
              {session?.user && !isSessionLoading ? (
                <React.Fragment>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {session.user.name || session.user.email}
                  </Typography>
                  <Tooltip title="User settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={session.user.name || session.user.email}
                        src={session.user.image}
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          width: 32,
                          height: 32,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar-user"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem key="signout" onClick={handleSignOut}>
                      <ListItemText>Sign out</ListItemText>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              ) : null}
              {!session?.user && !isSessionLoading ? (
                <React.Fragment>
                  <Button onClick={handleOpenSignInMenu} color="inherit">
                    Sign In
                  </Button>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar-signin"
                    anchorEl={anchorElSignIn}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElSignIn)}
                    onClose={handleCloseSignInMenu}
                  >
                    <MenuItem key="github" onClick={handleSignIn('github')}>
                      <ListItemIcon>
                        <GitHubIcon color="inherit" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sign in with GitHub</ListItemText>
                    </MenuItem>
                    <MenuItem key="google" onClick={handleSignIn('google')}>
                      <ListItemIcon>
                        <GoogleIcon color="inherit" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sign in with Google</ListItemText>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              ) : null}
              {isSessionLoading ? <CircularProgress color="inherit" size={26} /> : null}
            </Stack>
          </Toolbar>
        </AppBar>
      ) : null}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {hasNavigation ? (
          <AppPagesNavigation
            activePageSlug={activePageSlug}
            pages={pages}
            clipped={clipped}
            hasHeader={hasHeader}
            search={retainedSearch}
          />
        ) : null}
        {children}
      </Box>
    </React.Fragment>
  );
}
