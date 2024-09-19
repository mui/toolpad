import * as React from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/react-router-dom/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PREVIEW_HEADER_HEIGHT } from './constants';
import { AuthContext } from './useAuth';

const TOOLPAD_DISPLAY_MODE_URL_PARAM = 'toolpad-display';

// Url params that will be carried over to the next page
const RETAINED_URL_PARAMS = new Set([TOOLPAD_DISPLAY_MODE_URL_PARAM]);

export interface NavigationEntry {
  slug: string;
  displayName: string;
  hasShell?: boolean;
}

export interface ToolpadAppLayoutProps {
  activePageSlug?: string;
  pages?: NavigationEntry[];
  hasLayout?: boolean;
  children?: React.ReactNode;
  clipped?: boolean;
}

export function AppLayout({
  activePageSlug,
  pages = [],
  hasLayout: hasLayoutProp = true,
  children,
  clipped,
}: ToolpadAppLayoutProps) {
  const theme = useTheme();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const retainedSearch = React.useMemo(() => {
    for (const name of searchParams.keys()) {
      if (!RETAINED_URL_PARAMS.has(name)) {
        searchParams.delete(name);
      }
    }

    return searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  }, [searchParams]);

  const navEntry = pages.find((page) => page.slug === activePageSlug);

  const displayMode = searchParams.get(TOOLPAD_DISPLAY_MODE_URL_PARAM);

  const hasShell = navEntry?.hasShell !== false && displayMode !== 'standalone';

  const hasLayout = hasLayoutProp && hasShell;

  const { session, signOut } = React.useContext(AuthContext);

  const navigation = React.useMemo(
    () =>
      pages.map(({ slug, displayName }) => ({
        segment: `pages/${slug}${retainedSearch}`,
        title: displayName,
      })),
    [pages, retainedSearch],
  );

  const signIn = React.useCallback(() => {
    navigate('/signin');
  }, []);

  const layoutContent = (
    <Box sx={{ minWidth: 0, flex: 1, position: 'relative', flexDirection: 'column' }}>
      {children}
    </Box>
  );

  return (
    <AppProvider
      theme={theme}
      navigation={navigation}
      branding={{
        title: 'Toolpad Studio',
      }}
      authentication={{
        signIn,
        signOut,
      }}
      session={session}
    >
      {hasLayout ? (
        <DashboardLayout
          sx={{
            '& .MuiAppBar-root': {
              pt: clipped ? `${PREVIEW_HEADER_HEIGHT}px` : undefined,
            },
            '& .MuiDrawer-paper': {
              pt: clipped ? `${PREVIEW_HEADER_HEIGHT}px` : undefined,
            },
          }}
        >
          {layoutContent}
        </DashboardLayout>
      ) : (
        layoutContent
      )}
    </AppProvider>
  );
}
