import type { Template } from '../../../types';

const app: Template = (options) => {
  const authEnabled = options.auth;

  return `import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { Navigation } from '@toolpad/core/AppProvider';
${
  authEnabled
    ? `import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import LinearProgress from '@mui/material/LinearProgress';`
    : ''
}
${
  options.hasNodemailerProvider || options.hasPasskeyProvider
    ? `import { useRouter } from 'next/router';`
    : ''
}
import theme from '../theme';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
  ${authEnabled ? 'requireAuth?: boolean;' : ''}
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core Next.js Pages App',
};

${
  authEnabled
    ? `
const AUTHENTICATION = {
  signIn,
  signOut,
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status${options.hasNodemailerProvider || options.hasPasskeyProvider ? ',data' : ''} } = useSession();
  ${options.hasNodemailerProvider || options.hasPasskeyProvider ? `const router = useRouter()` : ''}
  if (status === 'loading') {
    return <LinearProgress />;
  }

  ${
    options.hasNodemailerProvider || options.hasPasskeyProvider
      ? `if (!data) {
    // Redirect to sign-in page
    router.push("/api/auth/signin");
    return <LinearProgress />;
  }`
      : ''
  }


  return children;
}
`
    : ''
}

function getDefaultLayout(page: React.ReactElement) {
  return (
    <DashboardLayout>
      <PageContainer>{page}</PageContainer>
    </DashboardLayout>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  ${authEnabled ? `const { data: session } = useSession();` : ''}
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <NextAppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        ${
          authEnabled
            ? `session={session}
        authentication={AUTHENTICATION}`
            : ''
        }
        theme={theme}
      >
        {children}
      </NextAppProvider>
    </React.Fragment>
  );
}

export default function App(props: AppPropsWithLayout) {
  const {
    Component,
    pageProps${authEnabled ? `: { session, ...pageProps }` : ''},
  } = props;

  const getLayout = Component.getLayout ?? getDefaultLayout;
  ${
    authEnabled
      ? `const requireAuth = Component.requireAuth ?? true;

  let pageContent = getLayout(<Component {...pageProps} />);
  if (requireAuth) {
    pageContent = <RequireAuth>{pageContent}</RequireAuth>;
  }`
      : `let pageContent = getLayout(<Component {...pageProps} />);`
  }
  pageContent = <AppLayout>{pageContent}</AppLayout>;

  return (
    <AppCacheProvider {...props}>
      ${authEnabled ? `<SessionProvider session={session}>` : ''}
        {pageContent}
      ${authEnabled ? `</SessionProvider>` : ''}
    </AppCacheProvider>
  );
}
`;
};

export default app;
