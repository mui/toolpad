import { Template } from '../../types';

const dashboardTemplate: Template = (options) => {
  const { auth } = options;

  return `import * as React from 'react';
${
  auth
    ? `import LinearProgress from '@mui/material/LinearProgress';
import { Outlet, useLocation, useParams, matchPath } from 'react-router';`
    : `import { Outlet } from 'react-router';`
}
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
${
  auth
    ? `import { Account } from '@toolpad/core/Account';

import { useSession } from '../SessionContext';

function CustomAccount() {
  return (
    <Account
      slotProps={{
        preview: { slotProps: { avatarIconButton: { sx: { border: '0' } } } },
      }}
    />
  );
}`
    : ''
}

export default function Layout() {
  const location = useLocation();
  const { employeeId } = useParams();

  const title = React.useMemo(() => {
    if (location.pathname === '/employees/new') {
      return 'New Employee';
    }
    if (matchPath('/employees/:employeeId/edit', location.pathname)) {
      return \`Employee \${employeeId} - Edit\`;
    }
    if (employeeId) {
      return \`Employee \${employeeId}\`;
    }
    return undefined;
  }, [location.pathname, employeeId]);

  ${
    auth
      ? `const { session, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <LinearProgress />
      </div>
    );
  }

  if (!session) {
    const redirectTo = \`/sign-in?callbackUrl=\${encodeURIComponent(location.pathname)}\`;
    return <Navigate to={redirectTo} replace />;
  }`
      : ''
  }

  return (
    <DashboardLayout title={title} ${auth ? ` slots={{ toolbarAccount: CustomAccount }}` : ''}>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}`;
};

export default dashboardTemplate;
