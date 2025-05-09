import { Template } from '../../../types';

const rootLayout: Template = (options) => {
  const authEnabled = options.auth;

  return `import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
${authEnabled ? '' : `import LinearProgress from '@mui/material/LinearProgress'`}
import type { Navigation } from '@toolpad/core/AppProvider';
${
  authEnabled
    ? `import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { auth } from '../auth';`
    : ''
}
import theme from '../theme';

export const metadata = {
  title: 'My Toolpad Core Next.js App',
  description: 'This is a sample app built with Toolpad Core and Next.js',
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
    segment: 'employees',
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

const BRANDING = {
  title: 'My Toolpad Core Next.js App',
};

${
  authEnabled
    ? `
const AUTHENTICATION = {
  signIn,
  signOut,
};
`
    : ''
}

export default ${authEnabled ? 'async ' : ''}function RootLayout(props: { children: React.ReactNode }) {
  ${authEnabled ? `const session = await auth();` : ''}

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>
        ${authEnabled ? '<SessionProvider session={session}>' : ''}
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          ${authEnabled ? '' : '<React.Suspense fallback={<LinearProgress />}>'}
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
              {props.children}
            </NextAppProvider>
            ${authEnabled ? '' : '</React.Suspense>'}
          </AppRouterCacheProvider>
        ${authEnabled ? '</SessionProvider>' : ''}
      </body>
    </html>
  );
}
`;
};

export default rootLayout;
