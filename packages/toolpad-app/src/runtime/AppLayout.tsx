import * as React from 'react';
import {
  Box,
  Drawer,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { Link, useMatch, useSearchParams } from 'react-router-dom';

const TOOLPAD_DISPLAY_MODE_URL_PARAM = 'toolpad-display';

// Url params that will be carried over to the next page
const RETAINED_URL_PARAMS = new Set([TOOLPAD_DISPLAY_MODE_URL_PARAM]);

export interface NavigationEntry {
  slug: string;
  displayName: string;
  hasShell?: boolean;
}

const DRAWER_WIDTH = 250; // px

interface AppNavigationProps {
  activePage?: string;
  pages: NavigationEntry[];
  clipped?: boolean;
  search?: string;
}

function AppNavigation({ activePage, pages, clipped = false, search }: AppNavigationProps) {
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
      {clipped ? <Toolbar variant="dense" /> : null}
      <Box>
        <List
          component="nav"
          subheader={
            <ListSubheader id={navListSubheaderId} sx={{ px: 4 }}>
              Pages
            </ListSubheader>
          }
          aria-labelledby={navListSubheaderId}
        >
          {pages.map((page) => (
            <ListItem key={page.slug} disablePadding>
              <ListItemButton
                component={Link}
                to={`pages/${page.slug}${search}`}
                selected={activePage === page.slug}
              >
                <ListItemText primary={page.displayName} sx={{ ml: 2 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export interface ToolpadAppLayoutProps {
  pages?: NavigationEntry[];
  hasShell?: boolean;
  children?: React.ReactNode;
  clipped?: boolean;
}

export function AppLayout({
  pages = [],
  hasShell: hasShellProp = true,
  children,
  clipped,
}: ToolpadAppLayoutProps) {
  const [urlParams] = useSearchParams();

  const retainedSearch = React.useMemo(() => {
    for (const name of urlParams.keys()) {
      if (!RETAINED_URL_PARAMS.has(name)) {
        urlParams.delete(name);
      }
    }

    return urlParams.size > 0 ? `?${urlParams.toString()}` : '';
  }, [urlParams]);

  const match = useMatch('/pages/:slug');
  const navEntry = pages.find((page) => page.slug === match?.params.slug);

  const displayMode = urlParams.get(TOOLPAD_DISPLAY_MODE_URL_PARAM);

  const hasShell = hasShellProp && navEntry?.hasShell !== false && displayMode !== 'standalone';

  return (
    <Box sx={{ flex: 1, display: 'flex' }}>
      {hasShell ? (
        <AppNavigation
          activePage={match?.params.slug}
          pages={pages}
          clipped={clipped}
          search={retainedSearch}
        />
      ) : null}
      {children}
    </Box>
  );
}
