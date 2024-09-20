import * as React from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { AppProvider } from '@toolpad/core/react-router-dom';
import useDebouncedHandler from '@toolpad/utils/hooks/useDebouncedHandler';
import { AuthContext } from './useAuth';
import { PREVIEW_HEADER_MIN_HEIGHT } from './constants';

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
  }, [navigate]);

  const layoutContent = (
    <Box sx={{ minWidth: 0, flex: 1, position: 'relative', flexDirection: 'column' }}>
      {children}
    </Box>
  );

  const [previewHeaderHeight, setPreviewHeaderHeight] = React.useState(PREVIEW_HEADER_MIN_HEIGHT);

  const updatePreviewHeaderHeight = React.useCallback(() => {
    if (clipped) {
      const previewHeader = document.getElementById('preview-header');
      if (previewHeader) {
        setPreviewHeaderHeight(previewHeader.getBoundingClientRect().height);
      }
    }
  }, [clipped]);

  const debouncedUpdatePreviewHeaderHeight = useDebouncedHandler(updatePreviewHeaderHeight, 150);

  // Preview header height can be higher in mobile viewports
  React.useEffect(() => {
    updatePreviewHeaderHeight();
    window.addEventListener('resize', debouncedUpdatePreviewHeaderHeight);
    return () => {
      window.removeEventListener('resize', debouncedUpdatePreviewHeaderHeight);
    };
  }, [debouncedUpdatePreviewHeaderHeight, updatePreviewHeaderHeight]);

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
              pt: clipped ? `${previewHeaderHeight}px` : undefined,
            },
            '& .MuiDrawer-paper': {
              pt: clipped ? `${previewHeaderHeight}px` : undefined,
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
