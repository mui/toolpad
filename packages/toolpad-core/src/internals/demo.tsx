import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Router } from '../AppProvider';

/**
 * Internal utility for demos
 * @ignore - internal component.
 */

const DUMMY_BASE = 'https://example.com';

/**
 * Hook to create a router for demos.
 * @returns An in-memory router To be used in demos demos.
 */
export function useDemoRouter(initialUrl: string = '/') {
  const [url, setUrl] = React.useState(() => new URL(initialUrl, DUMMY_BASE));

  const router = React.useMemo<Router>(() => {
    return {
      pathname: url.pathname,
      searchParams: url.searchParams,
      navigate: (newUrl) => {
        const nextUrl = new URL(newUrl, DUMMY_BASE);
        if (nextUrl.pathname !== url.pathname || nextUrl.search !== url.search) {
          setUrl(nextUrl);
        }
      },
    };
  }, [url.pathname, url.search, url.searchParams]);

  return router;
}

const BrowserRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  alignItems: 'stretch',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const BrowserBar = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[400],
}));

const UrlField = styled('div')(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  color: 'black',
  padding: '0.1rem 12px',
  backgroundColor: 'white',
  borderRadius: '1em',
}));

const BrowserContent = styled('div')(({ theme }) => ({
  flex: 1,
  border: `1px solid ${theme.palette.divider}`,
  borderTop: 0,
  backgroundColor: theme.palette.background.default,
}));

export interface DemoBrowserProps {
  router: Router;
  children?: React.ReactNode;
}

export function DemoBrowser({ router, children }: DemoBrowserProps) {
  const search = router.searchParams.toString();
  return (
    <BrowserRoot>
      <BrowserBar>
        <UrlField>{router.pathname + (search ? `?${search}` : '')}</UrlField>
      </BrowserBar>
      <BrowserContent>{children}</BrowserContent>
    </BrowserRoot>
  );
}

export { Link } from '../shared/Link';
