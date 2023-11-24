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
  Menu,
  MenuItem,
  Tooltip,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link, useSearchParams } from 'react-router-dom';
import { PREVIEW_HEADER_HEIGHT } from './constants';
import { AuthProvider, AuthSessionContext } from './useAuthSession';

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

  const { session, signIn, signOut, isSigningIn } = React.useContext(AuthSessionContext);

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
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          {clipped ? <Box sx={{ height: PREVIEW_HEADER_HEIGHT }} /> : null}
          <Toolbar variant="dense">
            <Typography variant="h6" noWrap sx={{ ml: 1 }}>
              {activePageDisplayName}
            </Typography>
            <Stack flex={1} direction="row" alignItems="center" justifyContent="end">
              {session?.user && !isSigningIn ? (
                <React.Fragment>
                  <Button color="inherit" onClick={handleOpenUserMenu}>
                    <Typography variant="body2" sx={{ mr: 2, textTransform: 'none' }}>
                      {session.user.name || session.user.email}
                    </Typography>
                    <Tooltip title="User settings">
                      <Avatar
                        alt={session.user.name || session.user.email}
                        src={session.user.image}
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          width: 32,
                          height: 32,
                        }}
                      />
                    </Tooltip>
                  </Button>
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
                    <MenuItem onClick={handleSignOut}>
                      <ListItemText>Sign out</ListItemText>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              ) : null}
              {!session?.user && !isSigningIn ? (
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
                    <MenuItem>
                      <Button
                        variant="contained"
                        onClick={handleSignIn('github')}
                        startIcon={<GitHubIcon />}
                        fullWidth
                        sx={{
                          backgroundColor: '#24292F',
                        }}
                      >
                        Sign in with GitHub
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        variant="contained"
                        onClick={handleSignIn('google')}
                        startIcon={
                          <img
                            alt="Google logo"
                            loading="lazy"
                            height="18"
                            width="18"
                            src="https://authjs.dev/img/providers/google.svg"
                            style={{ marginLeft: '2px', marginRight: '2px' }}
                          />
                        }
                        fullWidth
                        sx={{
                          backgroundColor: '#fff',
                          color: '#000',
                          '&:hover': {
                            color: theme.palette.primary.contrastText,
                          },
                        }}
                      >
                        Sign in with Google
                      </Button>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              ) : null}
              {isSigningIn ? <CircularProgress color="inherit" size={26} /> : null}
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
        <Box sx={{ flex: 1 }}>
          <Toolbar variant="dense" />
          {children}
        </Box>
      </Box>
    </React.Fragment>
  );
}
