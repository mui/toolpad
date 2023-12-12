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
  useTheme,
  Snackbar,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { PREVIEW_HEADER_HEIGHT } from './constants';
import { AuthSessionContext } from './useAuthSession';

const TOOLPAD_DISPLAY_MODE_URL_PARAM = 'toolpad-display';

const AUTH_ERROR_URL_PARAM = 'error';

// Url params that will be carried over to the next page
const RETAINED_URL_PARAMS = new Set([TOOLPAD_DISPLAY_MODE_URL_PARAM, AUTH_ERROR_URL_PARAM]);

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
  search?: string;
}

function AppPagesNavigation({
  activePageSlug,
  pages,
  clipped = false,
  search,
}: AppPagesNavigationProps) {
  const navListSubheaderId = React.useId();

  const theme = useTheme();

  const productIconSrc = `${window.location.origin}/${
    theme.palette.mode === 'dark' ? 'product-icon-dark.svg' : 'product-icon-light.svg'
  }`;

  const initialPageSlug = pages[0].slug;

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
      <MuiLink
        color="inherit"
        aria-label="Go to home page"
        href={initialPageSlug}
        underline="none"
        sx={{
          ml: 3,
          mt: 1,
          mb: '4px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <img src={productIconSrc} alt="Toolpad logo" width={35} height={35} />
        <Box
          data-testid="brand"
          sx={{
            color: 'primary.main',
            lineHeight: '21px',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: 0,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          MUI Toolpad
        </Box>
      </MuiLink>
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
  hasHeader = false,
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

  const { session, signOut, isSigningIn } = React.useContext(AuthSessionContext);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = React.useCallback(() => {
    signOut();
    handleCloseUserMenu();
  }, [signOut]);

  const [errorSnackbarMessage, setErrorSnackbarMessage] = React.useState<string>('');

  React.useEffect(() => {
    const authError = urlParams.get(AUTH_ERROR_URL_PARAM);

    if (authError === 'AuthorizedCallbackError') {
      setErrorSnackbarMessage('Access unauthorized.');
    } else if (authError === 'CallbackRouteError') {
      setErrorSnackbarMessage(
        'There was an error with your authentication provider configuration.',
      );
    } else if (authError) {
      setErrorSnackbarMessage('An authentication error occurred.');
    }
  }, [urlParams]);

  const handleErrorSnackbarClose = React.useCallback(() => {
    setErrorSnackbarMessage('');
  }, []);

  return (
    <React.Fragment>
      <Box sx={{ flex: 1, display: 'flex' }}>
        {hasNavigation ? (
          <AppPagesNavigation
            activePageSlug={activePageSlug}
            pages={pages}
            clipped={clipped}
            search={retainedSearch}
          />
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1, position: 'relative', flexDirection: 'column' }}>
          {hasHeader ? (
            <AppBar
              position="static"
              color="transparent"
              sx={{
                boxShadow: 'none',
              }}
            >
              <Toolbar variant="dense">
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
                </Stack>
              </Toolbar>
            </AppBar>
          ) : null}
          {children}
        </Box>
      </Box>
      <Snackbar
        open={!!errorSnackbarMessage}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
      >
        {errorSnackbarMessage ? (
          <Alert onClose={handleErrorSnackbarClose} severity="error">
            {errorSnackbarMessage}
          </Alert>
        ) : undefined}
      </Snackbar>
    </React.Fragment>
  );
}
