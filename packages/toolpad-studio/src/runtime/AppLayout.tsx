import * as React from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
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
}

export function AppLayout({
  activePageSlug,
  pages = [],
  hasLayout: hasLayoutProp = true,
  children,
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

  const { session, signOut, hasAuthentication } = React.useContext(AuthContext);

  const navigation = React.useMemo(
    () =>
      pages.map(({ slug, displayName }) => ({
        segment: `pages/${slug}${retainedSearch}`,
        title: displayName,
      })),
    [pages, retainedSearch],
  );

  const authentication = React.useMemo(
    () =>
      hasAuthentication
        ? {
            signIn: () => {
              navigate('/signin');
            },
            signOut,
          }
        : undefined,
    [hasAuthentication, navigate, signOut],
  );

  const layoutContent = (
    <Box sx={{ minWidth: 0, flex: 1, position: 'relative', flexDirection: 'column' }}>
      {children}
    </Box>
  );

  return (
    <ReactRouterAppProvider
      theme={theme}
      navigation={navigation}
      branding={{
        title: 'Toolpad Studio',
      }}
      authentication={authentication}
      session={session}
    >
      {hasLayout ? (
        <DashboardLayout sx={{ height: '100%' }}>{layoutContent}</DashboardLayout>
      ) : (
        layoutContent
      )}
    </ReactRouterAppProvider>
  );
}
