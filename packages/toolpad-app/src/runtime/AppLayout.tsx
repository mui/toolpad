import * as React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { PREVIEW_HEADER_HEIGHT } from './constants';

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
  activePage?: string;
  pages: NavigationEntry[];
  clipped?: boolean;
  search?: string;
}

function AppPagesNavigation({
  activePage,
  pages,
  clipped = false,
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
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
        },
      }}
    >
      {clipped ? <Box sx={{ height: PREVIEW_HEADER_HEIGHT }} /> : null}
      <List component="nav" sx={{ px: 2 }} aria-labelledby={navListSubheaderId}>
        {pages.map((page) => (
          <ListItem
            key={page.slug}
            disablePadding
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
            }}
          >
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
    </Drawer>
  );
}

export interface ToolpadAppLayoutProps {
  activePage?: string;
  pages?: NavigationEntry[];
  hasShell?: boolean;
  children?: React.ReactNode;
  clipped?: boolean;
}

export function AppLayout({
  activePage,
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

  const navEntry = pages.find((page) => page.slug === activePage);

  const displayMode = urlParams.get(TOOLPAD_DISPLAY_MODE_URL_PARAM);

  const hasShell = hasShellProp && navEntry?.hasShell !== false && displayMode !== 'standalone';

  return (
    <Box sx={{ flex: 1, display: 'flex' }}>
      {hasShell ? (
        <AppPagesNavigation
          activePage={activePage}
          pages={pages}
          clipped={clipped}
          search={retainedSearch}
        />
      ) : null}
      <Box sx={{ minWidth: 0, flex: 1, position: 'relative' }}>{children}</Box>
    </Box>
  );
}
